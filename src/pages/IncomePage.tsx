import { useFinance } from "@/contexts/FinanceContext";
import { StatCard } from "@/components/StatCard";
import { IncomeForm } from "@/components/forms/IncomeForm";
import { MonthSelector } from "@/components/MonthSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, CheckCircle, Trash2 } from "lucide-react";
import { format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function IncomePage() {
  const { 
    filteredIncomes, 
    removeIncome, 
    getClientById,
    selectedMonth,
    setSelectedMonth
  } = useFinance();

  const today = startOfDay(new Date());

  // Separate received vs pending based on payment date
  const receivedIncomes = filteredIncomes.filter(i => startOfDay(new Date(i.paymentDate)) <= today);
  const pendingIncomes = filteredIncomes.filter(i => startOfDay(new Date(i.paymentDate)) > today);

  const totalReceived = receivedIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalPending = pendingIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalIncome = totalReceived + totalPending;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Recebimentos</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Entradas de receita</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <MonthSelector currentMonth={selectedMonth} onMonthChange={setSelectedMonth} />
          <IncomeForm />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard
          title="Total Recebido"
          value={totalReceived}
          icon={CheckCircle}
          variant="income"
        />
        <StatCard
          title="A Receber"
          value={totalPending}
          icon={Clock}
          variant="pending"
        />
      </div>

      {/* Income Table */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Todos os Recebimentos</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          {filteredIncomes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum recebimento neste mês
            </div>
          ) : (
            <>
              {/* Mobile Cards View */}
              <div className="space-y-3 md:hidden">
                {filteredIncomes.map((income) => {
                  const client = getClientById(income.clientId);
                  const isPending = startOfDay(new Date(income.paymentDate)) > today;
                  return (
                    <div key={income.id} className="p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-foreground truncate">{income.description}</h3>
                          <p className="text-lg font-display font-bold text-income">
                            {formatCurrency(income.amount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <IncomeForm income={income} editMode={true} />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeIncome(income.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-income-light text-income text-xs font-medium">
                          {client?.name || 'N/A'}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs">
                          {income.category}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/50 text-xs text-muted-foreground">
                          {format(new Date(income.paymentDate), "dd/MM", { locale: ptBR })}
                        </span>
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-warning-light text-warning text-xs">
                            <Clock className="w-3 h-3" />
                            Pendente
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Descrição</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIncomes.map((income) => {
                        const client = getClientById(income.clientId);
                        return (
                          <TableRow key={income.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{income.description}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-income-light text-income text-xs font-medium">
                                {client?.name || 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs">
                                {income.category}
                              </span>
                            </TableCell>
                            <TableCell>
                              {format(new Date(income.paymentDate), "dd/MM/yyyy", { locale: ptBR })}
                            </TableCell>
                            <TableCell className="text-right font-medium text-income">
                              {formatCurrency(income.amount)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <IncomeForm income={income} editMode={true} />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeIncome(income.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
