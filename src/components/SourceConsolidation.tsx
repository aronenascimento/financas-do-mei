import { useFinance } from "@/contexts/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export function SourceConsolidation() {
  const { clients, filteredExpenses, filteredIncomes } = useFinance();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCurrencyCompact = (value: number) => {
    if (Math.abs(value) >= 1000) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value);
    }
    return formatCurrency(value);
  };

  // Calculate totals per client/source
  const sourceData = clients.map(client => {
    const totalIncome = filteredIncomes
      .filter(i => i.clientId === client.id)
      .reduce((sum, i) => sum + i.amount, 0);

    const totalAllocated = filteredExpenses
      .filter(e => e.paymentSourceId === client.id)
      .reduce((sum, e) => sum + e.amount, 0);

    const available = totalIncome - totalAllocated;

    return {
      client,
      totalIncome,
      totalAllocated,
      available,
    };
  });

  return (
    <Card>
      <CardHeader className="p-4 sm:pb-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <span className="truncate">Consolidado por Fonte</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="space-y-2 sm:space-y-3">
          {sourceData.map(({ client, totalIncome, totalAllocated, available }) => (
            <div 
              key={client.id} 
              className="p-2.5 sm:p-3 rounded-lg bg-muted/50 border border-border/50"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">{client.name}</h4>
                <span className={`text-xs sm:text-sm font-medium whitespace-nowrap ${available >= 0 ? 'text-income' : 'text-expense'}`}>
                  <span className="sm:hidden">{formatCurrencyCompact(available)}</span>
                  <span className="hidden sm:inline">{available >= 0 ? '+' : ''}{formatCurrency(available)} disponível</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="min-w-0">
                  <span className="text-muted-foreground">Recebido: </span>
                  <span className="text-income font-medium">
                    <span className="sm:hidden">{formatCurrencyCompact(totalIncome)}</span>
                    <span className="hidden sm:inline">{formatCurrency(totalIncome)}</span>
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-muted-foreground">Alocado: </span>
                  <span className="text-expense font-medium">
                    <span className="sm:hidden">{formatCurrencyCompact(totalAllocated)}</span>
                    <span className="hidden sm:inline">{formatCurrency(totalAllocated)}</span>
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-expense transition-all duration-300"
                  style={{ width: `${totalIncome > 0 ? Math.min((totalAllocated / totalIncome) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
          ))}

          {sourceData.length === 0 && (
            <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
              Nenhuma fonte de receita cadastrada
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
