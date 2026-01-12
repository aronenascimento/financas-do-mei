import React, { useEffect, useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  AlertCircle, 
  XCircle, 
  Ban,
  Info
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MEI_LIMITS = {
  annual: 81000,
  tolerance: 97200,
};

const CURRENT_YEAR = 2026;
const STORAGE_KEY = `mei_alerts_shown_${CURRENT_YEAR}`;

interface AlertsShown {
  alert70: boolean;
  alert90: boolean;
  alert100: boolean;
  alert120: boolean;
}

const getAlertsShown = (): AlertsShown => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error reading alerts from localStorage", e);
  }
  return { alert70: false, alert90: false, alert100: false, alert120: false };
};

const setAlertShown = (alertKey: keyof AlertsShown) => {
  const current = getAlertsShown();
  current[alertKey] = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
};

export function MEILimitAlert() {
  const { meiLimits, isLoading } = useFinance();
  const [alertsShown, setAlertsShown] = useState<AlertsShown>(getAlertsShown);

  if (isLoading || !meiLimits) {
    // Render skeleton or null while loading
    return null;
  }

  const { 
    accumulated_income: accumulated, 
    projection, 
    percentage, 
    projection_percentage: projectionPercentage, 
    problematic_categories: problematicCategories,
    zone,
    status
  } = meiLimits;

  // Determine zone colors based on server-provided zone
  const getZoneInfo = () => {
    switch (zone) {
      case 'critical':
        return {
          color: 'bg-red-800',
          borderColor: 'border-red-800',
          textColor: 'text-red-800',
          icon: Ban
        };
      case 'exceeded':
        return {
          color: 'bg-red-500',
          borderColor: 'border-red-500',
          textColor: 'text-red-500',
          icon: XCircle
        };
      case 'urgent':
        return {
          color: 'bg-orange-500',
          borderColor: 'border-orange-500',
          textColor: 'text-orange-500',
          icon: AlertCircle
        };
      case 'attention':
        return {
          color: 'bg-yellow-500',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-500',
          icon: AlertTriangle
        };
      default:
        return {
          color: 'bg-green-500',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-600',
          icon: Target
        };
    }
  };

  const zoneInfo = getZoneInfo();

  // Calculate remaining amount to next threshold (using server percentage)
  const getRemainingInfo = () => {
    if (percentage < 70) {
      const remaining = 56700 - accumulated; // 70% limit
      return `Faltam ${formatCurrency(remaining)} para a zona de atenção (70%)`;
    } else if (percentage < 90) {
      const remaining = 72900 - accumulated; // 90% limit
      return `Faltam ${formatCurrency(remaining)} para a zona urgente (90%)`;
    } else if (percentage < 100) {
      const remaining = MEI_LIMITS.annual - accumulated;
      return `Faltam ${formatCurrency(remaining)} para o limite MEI (100%)`;
    } else if (percentage < 120) {
      const remaining = MEI_LIMITS.tolerance - accumulated;
      return `Faltam ${formatCurrency(remaining)} para a margem de tolerância (120%)`;
    }
    return null;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  // Get projection alert message (using server projection percentage)
  const getProjectionAlert = () => {
    if (projectionPercentage > 120) {
      return {
        message: '🚨 Sua projeção indica que você ultrapassará até a margem de tolerância!',
        type: 'critical'
      };
    } else if (projectionPercentage > 100) {
      return {
        message: '⚠️ Sua projeção indica que você ultrapassará o limite MEI. Considere revisar suas receitas ou migrar para ME.',
        type: 'warning'
      };
    }
    return null;
  };

  const projectionAlert = getProjectionAlert();

  // Handle toast notifications
  useEffect(() => {
    const showToastIfNeeded = (
      threshold: number, 
      alertKey: keyof AlertsShown,
      message: string,
      icon: React.ReactNode,
      type: 'warning' | 'error' | 'info'
    ) => {
      if (percentage >= threshold && !alertsShown[alertKey]) {
        if (type === 'error') {
          toast.error(message, { icon, duration: 8000 });
        } else if (type === 'warning') {
          toast.warning(message, { icon, duration: 6000 });
        } else {
          toast.info(message, { icon, duration: 5000 });
        }
        setAlertShown(alertKey);
        setAlertsShown(prev => ({ ...prev, [alertKey]: true }));
      }
    };

    // Check thresholds in order (from lowest to highest)
    if (percentage >= 120) {
      showToastIfNeeded(120, 'alert120', 
        'CRÍTICO: Margem de tolerância ultrapassada! Entre em contato com contador',
        <Ban className="w-4 h-4" />,
        'error'
      );
    } else if (percentage >= 100) {
      showToastIfNeeded(100, 'alert100',
        'Limite MEI ultrapassado! Você tem até R$ 97.200 antes de penalidades',
        <XCircle className="w-4 h-4" />,
        'error'
      );
    } else if (percentage >= 90) {
      showToastIfNeeded(90, 'alert90',
        'Urgente: Você atingiu 90% do limite MEI anual',
        <AlertCircle className="w-4 h-4" />,
        'warning'
      );
    } else if (percentage >= 70) {
      showToastIfNeeded(70, 'alert70',
        'Atenção: Você atingiu 70% do limite MEI anual',
        <AlertTriangle className="w-4 h-4" />,
        'warning'
      );
    }
  }, [percentage, alertsShown]);

  // Progress bar color based on percentage
  const getProgressColor = () => {
    if (percentage >= 120) return '#dc2626'; // red-600
    if (percentage >= 100) return '#ef4444'; // red-500
    if (percentage >= 90) return '#f97316';  // orange-500
    if (percentage >= 70) return '#eab308';  // yellow-500
    return '#22c55e'; // green-500
  };

  const progressValue = Math.min(percentage, 120);

  return (
    <Card className={`col-span-full transition-all duration-300 ${
      percentage >= 70 
        ? `border-2 ${zoneInfo.borderColor} shadow-lg` 
        : 'border'
    }`}>
      <CardHeader className="pb-2 p-4 sm:p-6 sm:pb-2">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          🎯 Limite MEI {CURRENT_YEAR}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-4">
        {/* Main Info */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <p className="text-sm sm:text-base text-muted-foreground">
              <span className="font-semibold text-foreground">
                {formatCurrency(accumulated)}
              </span>
              {' '}de {formatCurrency(MEI_LIMITS.annual)} ({percentage.toFixed(1)}%)
            </p>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <Progress 
              value={progressValue} 
              className="h-3 sm:h-4" 
              style={{
                '--progress-color': getProgressColor()
              } as React.CSSProperties}
            />
            {/* Zone markers */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-0 h-full border-l-2 border-yellow-500/50" style={{ left: '70%' }} />
              <div className="absolute top-0 h-full border-l-2 border-orange-500/50" style={{ left: '90%' }} />
              <div className="absolute top-0 h-full border-l-2 border-red-500/50" style={{ left: '100%' }} />
            </div>
          </div>

          {/* Zone labels for desktop */}
          <div className="hidden sm:flex justify-between text-[10px] text-muted-foreground px-1">
            <span>0%</span>
            <span className="text-yellow-600">70%</span>
            <span className="text-orange-600">90%</span>
            <span className="text-red-600">100%</span>
            <span className="text-red-800">120%</span>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <p className={`text-sm sm:text-base font-medium ${zoneInfo.textColor}`}>
            {status}
          </p>
          {getRemainingInfo() && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              {getRemainingInfo()}
            </p>
          )}
        </div>

        {/* Projection Card */}
        <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm sm:text-base font-medium">
            <TrendingUp className="w-4 h-4 text-primary" />
            📊 Projeção para {CURRENT_YEAR}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <p className="text-lg sm:text-xl font-bold text-foreground">
              {formatCurrency(projection)}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              ({projectionPercentage.toFixed(1)}% do limite)
            </p>
          </div>
          {projectionAlert && (
            <p className={`text-xs sm:text-sm font-medium ${
              projectionAlert.type === 'critical' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {projectionAlert.message}
            </p>
          )}
        </div>

        {/* Problematic Categories Alert */}
        {problematicCategories.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="w-4 h-4" />
              ⚠️ Categorias não permitidas para MEI
            </div>
            <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
              Foram detectadas receitas em categorias incompatíveis com MEI:
            </p>
            <ul className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
              {problematicCategories.map(category => (
                <li key={category}>{category}</li>
              ))}
            </ul>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2 text-yellow-800 border-yellow-300 hover:bg-yellow-100">
                  <Info className="w-3 h-3 mr-1" />
                  Saiba mais
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Categorias Incompatíveis com MEI
                  </DialogTitle>
                  <DialogDescription asChild>
                    <div className="space-y-4 pt-4">
                      <p>
                        O MEI (Microempreendedor Individual) possui restrições quanto às atividades permitidas. 
                        Algumas categorias de receita podem não ser compatíveis com este regime tributário.
                      </p>
                      <div>
                        <h4 className="font-semibold mb-2">Categorias detectadas:</h4>
                        <ul className="list-disc list-inside text-muted-foreground">
                          {problematicCategories.map(category => (
                            <li key={category}>{category}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">O que fazer?</h4>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          <li>Verifique se a categoria está correta no cadastro</li>
                          <li>Consulte a lista oficial de atividades permitidas para MEI</li>
                          <li>Se necessário, considere migrar para ME ou outro regime</li>
                          <li>Consulte um contador para orientação específica</li>
                        </ul>
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}