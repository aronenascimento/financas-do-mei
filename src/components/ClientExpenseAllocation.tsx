import { useFinance } from "@/contexts/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, CheckCircle } from "lucide-react";
import { useMemo } from "react";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function ClientExpenseAllocation() {
  const { clients, filteredIncomes, filteredExpenses } = useFinance();

  const clientAllocations = useMemo(() => {
    const today = new Date();
    
    return clients.map(client => {
      // Total received from this client (payment date <= today)
      const totalReceived = filteredIncomes
        .filter(inc => inc.clientId === client.id && new Date(inc.paymentDate) <= today)
        .reduce((sum, inc) => sum + inc.amount, 0);

      // Total expected (all income from this client)
      const totalExpected = filteredIncomes
        .filter(inc => inc.clientId === client.id)
        .reduce((sum, inc) => sum + inc.amount, 0);

      // Total expenses allocated to this client (paid)
      const paidExpenses = filteredExpenses
        .filter(exp => exp.paymentSourceId === client.id && exp.status === 'paid')
        .reduce((sum, exp) => sum + exp.amount, 0);

      // Total expenses allocated to this client (unpaid/saved)
      const plannedExpenses = filteredExpenses
        .filter(exp => exp.paymentSourceId === client.id && (exp.status === 'unpaid' || exp.status === 'saved'))
        .reduce((sum, exp) => sum + exp.amount, 0);

      const totalAllocated = paidExpenses + plannedExpenses;
      const balance = totalReceived - totalAllocated;
      const isOverBudget = totalAllocated > totalReceived;

      return {
        client,
        totalReceived,
        totalExpected,
        paidExpenses,
        plannedExpenses,
        totalAllocated,
        balance,
        isOverBudget
      };
    }).filter(item => item.totalExpected > 0 || item.totalAllocated > 0);
  }, [clients, filteredIncomes, filteredExpenses]);

  if (clientAllocations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Despesas Alocadas por Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {clientAllocations.map(({ 
            client, 
            totalReceived, 
            paidExpenses, 
            plannedExpenses, 
            totalAllocated, 
            balance,
            isOverBudget 
          }) => (
            <div 
              key={client.id} 
              className={`p-3 sm:p-4 rounded-lg border ${
                isOverBudget 
                  ? 'bg-danger-light border-danger/30' 
                  : 'bg-muted/30 border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-sm sm:text-base truncate flex-1">
                  {client.name}
                </h4>
                {isOverBudget ? (
                  <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                )}
              </div>

              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recebido:</span>
                  <span className="font-medium text-income">{formatCurrency(totalReceived)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pago:</span>
                  <span className="font-medium text-success">{formatCurrency(paidExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">A Pagar/Guardado:</span>
                  <span className="font-medium text-warning">{formatCurrency(plannedExpenses)}</span>
                </div>
                <div className="border-t pt-1.5 mt-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Total Alocado:</span>
                    <span className={`font-bold ${isOverBudget ? 'text-danger' : 'text-foreground'}`}>
                      {formatCurrency(totalAllocated)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground font-medium">Saldo:</span>
                    <span className={`font-bold ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(balance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${isOverBudget ? 'bg-danger' : 'bg-primary'}`}
                    style={{ width: `${Math.min((totalAllocated / totalReceived) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {totalReceived > 0 ? Math.round((totalAllocated / totalReceived) * 100) : 0}% alocado
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
