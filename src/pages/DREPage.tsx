import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinance } from "@/contexts/FinanceContext";
import { Download, FileSpreadsheet, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, startOfMonth, endOfMonth, isWithinInterval, getMonth, getYear, setMonth, setYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

interface DRELine {
  label: string;
  value: number;
  isTotal?: boolean;
  isSubtotal?: boolean;
  indent?: number;
}

const months = [
  { value: "0", label: "Janeiro" },
  { value: "1", label: "Fevereiro" },
  { value: "2", label: "Março" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Maio" },
  { value: "5", label: "Junho" },
  { value: "6", label: "Julho" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" },
  { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" },
  { value: "11", label: "Dezembro" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => ({
  value: String(currentYear - 2 + i),
  label: String(currentYear - 2 + i),
}));

export default function DREPage() {
  const { incomes, expenses, investments } = useFinance();
  const [selectedMonth, setSelectedMonthState] = useState(getMonth(new Date()).toString());
  const [selectedYear, setSelectedYearState] = useState(getYear(new Date()).toString());

  const selectedDate = useMemo(() => {
    return setYear(setMonth(new Date(), parseInt(selectedMonth)), parseInt(selectedYear));
  }, [selectedMonth, selectedYear]);

  // Filter data by selected month
  const periodIncomes = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return incomes.filter(income => 
      isWithinInterval(new Date(income.paymentDate), { start, end })
    );
  }, [incomes, selectedDate]);

  const periodExpenses = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const targetMonth = getMonth(selectedDate);
    const targetYear = getYear(selectedDate);
    
    return expenses.filter(expense => {
      if (isWithinInterval(new Date(expense.dueDate), { start, end })) {
        return true;
      }
      if (expense.isFixed) {
        const expenseDate = new Date(expense.dueDate);
        const expenseMonth = getMonth(expenseDate);
        const expenseYear = getYear(expenseDate);
        return expenseYear < targetYear || (expenseYear === targetYear && expenseMonth <= targetMonth);
      }
      return false;
    });
  }, [expenses, selectedDate]);

  const periodInvestments = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return investments.filter(investment => 
      isWithinInterval(new Date(investment.date), { start, end })
    );
  }, [investments, selectedDate]);

  // Calculate DRE values
  const dreData = useMemo(() => {
    // Group incomes by category
    const incomeByCategory: Record<string, number> = {};
    periodIncomes.forEach(income => {
      incomeByCategory[income.category] = (incomeByCategory[income.category] || 0) + income.amount;
    });

    // Group expenses by type and category
    const businessExpensesByCategory: Record<string, number> = {};
    const personalExpensesByCategory: Record<string, number> = {};
    
    periodExpenses.forEach(expense => {
      if (expense.type === 'business') {
        businessExpensesByCategory[expense.category] = (businessExpensesByCategory[expense.category] || 0) + expense.amount;
      } else {
        personalExpensesByCategory[expense.category] = (personalExpensesByCategory[expense.category] || 0) + expense.amount;
      }
    });

    // Group investments by category
    const investmentsByCategory: Record<string, number> = {};
    periodInvestments.forEach(investment => {
      investmentsByCategory[investment.category] = (investmentsByCategory[investment.category] || 0) + investment.amount;
    });

    // Calculate totals
    const totalRevenue = periodIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalBusinessExpenses = periodExpenses.filter(e => e.type === 'business').reduce((sum, e) => sum + e.amount, 0);
    const totalPersonalExpenses = periodExpenses.filter(e => e.type === 'personal').reduce((sum, e) => sum + e.amount, 0);
    const totalInvestments = periodInvestments.reduce((sum, i) => sum + i.amount, 0);

    const grossProfit = totalRevenue - totalBusinessExpenses;
    const operatingResult = grossProfit - totalInvestments;
    const netResult = operatingResult - totalPersonalExpenses;

    return {
      incomeByCategory,
      businessExpensesByCategory,
      personalExpensesByCategory,
      investmentsByCategory,
      totalRevenue,
      totalBusinessExpenses,
      totalPersonalExpenses,
      totalInvestments,
      grossProfit,
      operatingResult,
      netResult,
    };
  }, [periodIncomes, periodExpenses, periodInvestments]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const exportToCSV = () => {
    const lines: string[] = [];
    const periodLabel = format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
    
    lines.push(`DRE - Demonstração do Resultado do Exercício`);
    lines.push(`Período: ${periodLabel}`);
    lines.push(``);
    lines.push(`Descrição;Valor`);
    lines.push(``);
    
    // Receitas
    lines.push(`RECEITA OPERACIONAL BRUTA;`);
    Object.entries(dreData.incomeByCategory).forEach(([category, value]) => {
      lines.push(`  ${category};${value.toFixed(2).replace('.', ',')}`);
    });
    lines.push(`TOTAL RECEITAS;${dreData.totalRevenue.toFixed(2).replace('.', ',')}`);
    lines.push(``);
    
    // Despesas Empresariais
    lines.push(`(-) DESPESAS OPERACIONAIS;`);
    Object.entries(dreData.businessExpensesByCategory).forEach(([category, value]) => {
      lines.push(`  ${category};${(-value).toFixed(2).replace('.', ',')}`);
    });
    lines.push(`TOTAL DESPESAS OPERACIONAIS;${(-dreData.totalBusinessExpenses).toFixed(2).replace('.', ',')}`);
    lines.push(``);
    
    lines.push(`LUCRO BRUTO;${dreData.grossProfit.toFixed(2).replace('.', ',')}`);
    lines.push(``);
    
    // Investimentos
    lines.push(`(-) INVESTIMENTOS;`);
    Object.entries(dreData.investmentsByCategory).forEach(([category, value]) => {
      lines.push(`  ${category};${(-value).toFixed(2).replace('.', ',')}`);
    });
    lines.push(`TOTAL INVESTIMENTOS;${(-dreData.totalInvestments).toFixed(2).replace('.', ',')}`);
    lines.push(``);
    
    lines.push(`RESULTADO OPERACIONAL;${dreData.operatingResult.toFixed(2).replace('.', ',')}`);
    lines.push(``);
    
    // Despesas Pessoais
    lines.push(`(-) DESPESAS PESSOAIS;`);
    Object.entries(dreData.personalExpensesByCategory).forEach(([category, value]) => {
      lines.push(`  ${category};${(-value).toFixed(2).replace('.', ',')}`);
    });
    lines.push(`TOTAL DESPESAS PESSOAIS;${(-dreData.totalPersonalExpenses).toFixed(2).replace('.', ',')}`);
    lines.push(``);
    
    lines.push(`RESULTADO LÍQUIDO DO PERÍODO;${dreData.netResult.toFixed(2).replace('.', ',')}`);

    const csvContent = lines.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `DRE_${format(selectedDate, 'yyyy-MM')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ResultIcon = ({ value }: { value: number }) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in overflow-x-hidden">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">DRE</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Demonstração do Resultado do Exercício</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonthState}>
              <SelectTrigger className="flex-1 sm:w-[140px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedYear} onValueChange={setSelectedYearState}>
              <SelectTrigger className="w-[90px] sm:w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">
              {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Demonstração simplificada do resultado do período
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="space-y-1">
            {/* Receitas */}
            <div className="py-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Receita Operacional Bruta
              </h3>
            </div>
            
            {Object.entries(dreData.incomeByCategory).map(([category, value]) => (
              <div key={category} className="flex justify-between py-1.5 pl-4">
                <span className="text-sm">{category}</span>
                <span className="text-sm font-medium text-emerald-600">{formatCurrency(value)}</span>
              </div>
            ))}
            
            {Object.keys(dreData.incomeByCategory).length === 0 && (
              <div className="py-1.5 pl-4 text-sm text-muted-foreground italic">
                Nenhuma receita no período
              </div>
            )}
            
            <div className="flex justify-between py-2 bg-muted/50 px-3 rounded-md font-medium">
              <span>Total Receitas</span>
              <span className="text-emerald-600">{formatCurrency(dreData.totalRevenue)}</span>
            </div>

            <Separator className="my-3" />

            {/* Despesas Operacionais */}
            <div className="py-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                (-) Despesas Operacionais
              </h3>
            </div>
            
            {Object.entries(dreData.businessExpensesByCategory).map(([category, value]) => (
              <div key={category} className="flex justify-between py-1.5 pl-4">
                <span className="text-sm">{category}</span>
                <span className="text-sm font-medium text-red-500">({formatCurrency(value)})</span>
              </div>
            ))}
            
            {Object.keys(dreData.businessExpensesByCategory).length === 0 && (
              <div className="py-1.5 pl-4 text-sm text-muted-foreground italic">
                Nenhuma despesa operacional no período
              </div>
            )}
            
            <div className="flex justify-between py-2 bg-muted/50 px-3 rounded-md font-medium">
              <span>Total Despesas Operacionais</span>
              <span className="text-red-500">({formatCurrency(dreData.totalBusinessExpenses)})</span>
            </div>

            <Separator className="my-3" />

            {/* Lucro Bruto */}
            <div className="flex justify-between py-3 bg-primary/10 px-3 rounded-md">
              <div className="flex items-center gap-2">
                <ResultIcon value={dreData.grossProfit} />
                <span className="font-semibold">Lucro Bruto</span>
              </div>
              <span className={`font-bold ${dreData.grossProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {formatCurrency(dreData.grossProfit)}
              </span>
            </div>

            <Separator className="my-3" />

            {/* Investimentos */}
            <div className="py-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                (-) Investimentos
              </h3>
            </div>
            
            {Object.entries(dreData.investmentsByCategory).map(([category, value]) => (
              <div key={category} className="flex justify-between py-1.5 pl-4">
                <span className="text-sm">{category}</span>
                <span className="text-sm font-medium text-amber-600">({formatCurrency(value)})</span>
              </div>
            ))}
            
            {Object.keys(dreData.investmentsByCategory).length === 0 && (
              <div className="py-1.5 pl-4 text-sm text-muted-foreground italic">
                Nenhum investimento no período
              </div>
            )}
            
            <div className="flex justify-between py-2 bg-muted/50 px-3 rounded-md font-medium">
              <span>Total Investimentos</span>
              <span className="text-amber-600">({formatCurrency(dreData.totalInvestments)})</span>
            </div>

            <Separator className="my-3" />

            {/* Resultado Operacional */}
            <div className="flex justify-between py-3 bg-primary/10 px-3 rounded-md">
              <div className="flex items-center gap-2">
                <ResultIcon value={dreData.operatingResult} />
                <span className="font-semibold">Resultado Operacional</span>
              </div>
              <span className={`font-bold ${dreData.operatingResult >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {formatCurrency(dreData.operatingResult)}
              </span>
            </div>

            <Separator className="my-3" />

            {/* Despesas Pessoais */}
            <div className="py-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                (-) Despesas Pessoais
              </h3>
            </div>
            
            {Object.entries(dreData.personalExpensesByCategory).map(([category, value]) => (
              <div key={category} className="flex justify-between py-1.5 pl-4">
                <span className="text-sm">{category}</span>
                <span className="text-sm font-medium text-red-500">({formatCurrency(value)})</span>
              </div>
            ))}
            
            {Object.keys(dreData.personalExpensesByCategory).length === 0 && (
              <div className="py-1.5 pl-4 text-sm text-muted-foreground italic">
                Nenhuma despesa pessoal no período
              </div>
            )}
            
            <div className="flex justify-between py-2 bg-muted/50 px-3 rounded-md font-medium">
              <span>Total Despesas Pessoais</span>
              <span className="text-red-500">({formatCurrency(dreData.totalPersonalExpenses)})</span>
            </div>

            <Separator className="my-3" />

            {/* Resultado Líquido */}
            <div className={`flex justify-between py-4 px-4 rounded-lg ${dreData.netResult >= 0 ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
              <div className="flex items-center gap-2">
                <ResultIcon value={dreData.netResult} />
                <span className="font-bold text-lg">Resultado Líquido do Período</span>
              </div>
              <span className={`font-bold text-lg ${dreData.netResult >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {formatCurrency(dreData.netResult)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
