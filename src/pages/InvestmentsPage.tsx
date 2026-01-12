import { useFinance } from "@/contexts/FinanceContext";
import { StatCard } from "@/components/StatCard";
import { InvestmentForm } from "@/components/forms/InvestmentForm";
import { MonthSelector } from "@/components/MonthSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PiggyBank, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function InvestmentsPage() {
  const { 
    filteredInvestments, 
    removeInvestment,
    selectedMonth,
    setSelectedMonth
  } = useFinance();

  const totalInvestments = filteredInvestments.reduce((sum, i) => sum + i.amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Group by category
  const byCategory = filteredInvestments.reduce((acc, investment) => {
    acc[investment.category] = (acc[investment.category] || 0) + investment.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Investimentos</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Investimentos na empresa</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <MonthSelector currentMonth={selectedMonth} onMonthChange={setSelectedMonth} />
          <InvestmentForm />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Investido"
          value={totalInvestments}
          icon={PiggyBank}
          variant="investment"
        />
        {Object.entries(byCategory).slice(0, 3).map(([category, amount]) => (
          <StatCard
            key={category}
            title={category}
            value={amount}
            variant="investment"
          />
        ))}
      </div>

      {/* Investments Table */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Todos os Investimentos</CardTitle>
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
                  <div key={investment.id} className="p-3 rounded-lg border border-border bg-card">
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
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-investment-light text-investment text-xs font-medium">
                        {investment.category}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/50 text-xs text-muted-foreground">
                        {format(new Date(investment.date), "dd/MM", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-lg border border-border overflow-hidden">
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
