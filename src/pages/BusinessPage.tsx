import { useFinance } from "@/contexts/FinanceContext";
import { StatCard } from "@/components/StatCard";
import { ExpenseTable } from "@/components/ExpenseTable";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { MonthSelector } from "@/components/MonthSelector";
import { TrendingUp, TrendingDown, PiggyBank, Wallet, Tag, Calendar, ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BusinessPage() {
  const { 
    getBusinessSummary, 
    filteredExpenses,
    filteredIncomes,
    filteredInvestments,
    removeIncome,
    removeInvestment,
    getClientById,
    selectedMonth,
    setSelectedMonth
  } = useFinance();
  
  const summary = getBusinessSummary();
  const businessExpenses = filteredExpenses.filter(e => e.type === 'business' && e.category !== 'Saque');
  const withdrawals = filteredExpenses.filter(e => e.type === 'business' && e.category === 'Saque');
  const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0);

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
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Empresa</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Gestão financeira do seu MEI</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <MonthSelector currentMonth={selectedMonth} onMonthChange={setSelectedMonth} />
          <ExpenseForm type="business" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Receita Total"
          value={summary.totalIncome}
          icon={TrendingUp}
          variant="income"
        />
        <StatCard
          title="Despesas"
          value={summary.totalExpenses}
          icon={TrendingDown}
          variant="expense"
        />
        <StatCard
          title="Saques"
          value={totalWithdrawals}
          icon={ArrowRightLeft}
          variant="balance"
        />
        <StatCard
          title="Investimentos"
          value={summary.totalInvestments}
          icon={PiggyBank}
          variant="investment"
        />
        <StatCard
          title="Caixa Empresa"
          value={summary.businessBalance}
          icon={Wallet}
          variant="balance"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="expenses" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Despesas</span>
            <span className="sm:hidden">Desp.</span>
            <span className="ml-1">({businessExpenses.length})</span>
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Saques</span>
            <span className="sm:hidden">Saq.</span>
            <span className="ml-1">({withdrawals.length})</span>
          </TabsTrigger>
          <TabsTrigger value="income" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Recebimentos</span>
            <span className="sm:hidden">Receb.</span>
            <span className="ml-1">({filteredIncomes.length})</span>
          </TabsTrigger>
          <TabsTrigger value="investments" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Investimentos</span>
            <span className="sm:hidden">Invest.</span>
            <span className="ml-1">({filteredInvestments.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Despesas da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <ExpenseTable expenses={businessExpenses} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                  Saques (Pro-labore)
                </CardTitle>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(totalWithdrawals)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <ExpenseTable expenses={withdrawals} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income" className="mt-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Recebimentos</CardTitle>
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
                      return (
                        <div key={income.id} className="p-3 rounded-lg border border-border bg-muted/30">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm text-foreground truncate">{income.description}</h3>
                              <p className="text-lg font-display font-bold text-income">
                                {formatCurrency(income.amount)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                              onClick={() => removeIncome(income.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-income-light text-income text-xs font-medium">
                              {client?.name || 'N/A'}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-xs">
                              <Tag className="w-3 h-3" />
                              {income.category}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/50 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(income.paymentDate), "dd/MM", { locale: ptBR })}
                            </span>
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
                            <TableHead className="w-[50px]"></TableHead>
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
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeIncome(income.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
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
        </TabsContent>

        <TabsContent value="investments" className="mt-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Investimentos na Empresa</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              {filteredInvestments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum investimento neste mês
                </div>
              ) : (
                <>
                  {/* Mobile Cards View */}
                  <div className="space-y-3 md:hidden">
                    {filteredInvestments.map((investment) => (
                      <div key={investment.id} className="p-3 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-foreground truncate">{investment.description}</h3>
                            <p className="text-lg font-display font-bold text-investment">
                              {formatCurrency(investment.amount)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={() => removeInvestment(investment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-investment-light text-investment text-xs font-medium">
                            <Tag className="w-3 h-3" />
                            {investment.category}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/50 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(investment.date), "dd/MM", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block rounded-lg border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Descrição</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredInvestments.map((investment) => (
                            <TableRow key={investment.id} className="hover:bg-muted/30">
                              <TableCell className="font-medium">{investment.description}</TableCell>
                              <TableCell>
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-investment-light text-investment text-xs font-medium">
                                  {investment.category}
                                </span>
                              </TableCell>
                              <TableCell>
                                {format(new Date(investment.date), "dd/MM/yyyy", { locale: ptBR })}
                              </TableCell>
                              <TableCell className="text-right font-medium text-investment">
                                {formatCurrency(investment.amount)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeInvestment(investment.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
