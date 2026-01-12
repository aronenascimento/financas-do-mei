import { forwardRef } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { ClientForm } from "@/components/forms/ClientForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Users, TrendingUp } from "lucide-react";

const ClientsPage = forwardRef<HTMLDivElement>(function ClientsPage(_, ref) {
  const { clients, incomes, expenses, removeClient } = useFinance();

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

  const getClientStats = (clientId: string) => {
    const totalIncome = incomes
      .filter(i => i.clientId === clientId)
      .reduce((sum, i) => sum + i.amount, 0);

    const allocatedExpenses = expenses
      .filter(e => e.paymentSourceId === clientId)
      .reduce((sum, e) => sum + e.amount, 0);

    return { totalIncome, allocatedExpenses };
  };

  const totalRevenue = incomes.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div ref={ref} className="space-y-4 sm:space-y-6 animate-fade-in overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Clientes</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Fontes de receita da empresa</p>
        </div>
        <ClientForm />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl sm:text-3xl font-display font-bold">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-income-light flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-income" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-muted-foreground">Receita Total</p>
                <p className="text-lg sm:text-3xl font-display font-bold text-income">
                  <span className="sm:hidden">{formatCurrencyCompact(totalRevenue)}</span>
                  <span className="hidden sm:inline">{formatCurrency(totalRevenue)}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          {clients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum cliente cadastrado
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {clients.map((client) => {
                const stats = getClientStats(client.id);
                const available = stats.totalIncome - stats.allocatedExpenses;

                return (
                  <div 
                    key={client.id}
                    className="flex items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors gap-3"
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold text-base sm:text-lg">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{client.name}</h3>
                        {/* Mobile: stacked layout */}
                        <div className="sm:hidden mt-1 space-y-0.5">
                          <p className="text-xs text-muted-foreground">
                            Recebido: <span className="text-income font-medium">{formatCurrencyCompact(stats.totalIncome)}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Alocado: <span className="text-expense font-medium">{formatCurrencyCompact(stats.allocatedExpenses)}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Disponível: <span className={`font-medium ${available >= 0 ? 'text-income' : 'text-expense'}`}>
                              {formatCurrencyCompact(available)}
                            </span>
                          </p>
                        </div>
                        {/* Desktop: inline layout */}
                        <p className="hidden sm:block text-sm text-muted-foreground">
                          Recebido: <span className="text-income">{formatCurrency(stats.totalIncome)}</span>
                          {' • '}
                          Alocado: <span className="text-expense">{formatCurrency(stats.allocatedExpenses)}</span>
                          {' • '}
                          Disponível: <span className={available >= 0 ? 'text-income' : 'text-expense'}>
                            {formatCurrency(available)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive h-8 w-8 flex-shrink-0"
                      onClick={() => removeClient(client.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default ClientsPage;
