import { useFinance } from "@/contexts/FinanceContext";
import { StatCard } from "@/components/StatCard";
import { ClientExpenseAllocation } from "@/components/ClientExpenseAllocation";
import { MonthSelector } from "@/components/MonthSelector";
import { MEILimitAlert } from "@/components/MEILimitAlert";
import { EvolutionChart, ExpenseCategoryChart } from "@/components/charts";
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Wallet,
  Building2,
  User,
  CheckCircle,
  Clock,
  Save,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { 
    getTotalSummary, 
    getBusinessSummary, 
    getPersonalSummary, 
    filteredExpenses,
    filteredIncomes,
    selectedMonth,
    setSelectedMonth
  } = useFinance();
  
  const totalSummary = getTotalSummary();
  const businessSummary = getBusinessSummary();
  const personalSummary = getPersonalSummary();


  // Group incomes by category
  const incomeByCategory = filteredIncomes.reduce((acc, income) => {
    acc[income.category] = (acc[income.category] || 0) + income.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Visão geral das suas finanças</p>
          </div>
          <MonthSelector currentMonth={selectedMonth} onMonthChange={setSelectedMonth} />
        </div>
      </div>


      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Recebido"
          value={totalSummary.totalIncome}
          subtitle="Receitas da empresa"
          icon={TrendingUp}
          variant="income"
        />
        <StatCard
          title="Total Despesas"
          value={totalSummary.totalExpenses}
          subtitle="Empresa + Pessoal"
          icon={TrendingDown}
          variant="expense"
        />
        <StatCard
          title="Investimentos"
          value={totalSummary.totalInvestments}
          subtitle="Na empresa"
          icon={PiggyBank}
          variant="investment"
        />
        <StatCard
          title="Saldo Disponível"
          value={totalSummary.availableBalance}
          subtitle="Após pagos"
          icon={Wallet}
          variant="balance"
        />
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2 p-4 sm:p-6 sm:pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Caixa Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-xl sm:text-3xl font-display font-bold text-foreground">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(businessSummary.businessBalance)}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">
              Receita - Despesas empresa - Investimentos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent-foreground">
          <CardHeader className="pb-2 p-4 sm:p-6 sm:pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
              Disponível Pessoal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className={`text-xl sm:text-3xl font-display font-bold ${totalSummary.personalBalance >= 0 ? 'text-foreground' : 'text-danger'}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSummary.personalBalance)}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">
              Saques ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSummary.totalWithdrawals)}) - Despesas pessoais pagas ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSummary.personalPaidExpenses)})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-success-light flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-muted-foreground">Pago</p>
                <p className="text-sm sm:text-2xl font-display font-bold text-success">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: window.innerWidth < 640 ? 'compact' : 'standard' }).format(totalSummary.paidExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-danger-light flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-danger" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-muted-foreground">A Pagar</p>
                <p className="text-sm sm:text-2xl font-display font-bold text-danger">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: window.innerWidth < 640 ? 'compact' : 'standard' }).format(totalSummary.unpaidExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-warning-light flex items-center justify-center">
                <Save className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-muted-foreground">Guardado</p>
                <p className="text-sm sm:text-2xl font-display font-bold text-saved">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: window.innerWidth < 640 ? 'compact' : 'standard' }).format(totalSummary.savedExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income by Category */}
      {Object.keys(incomeByCategory).length > 0 && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              {Object.entries(incomeByCategory).map(([category, amount]) => (
                <div key={category} className="p-3 sm:p-4 rounded-lg bg-income-light border border-income/20">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{category}</p>
                  <p className="text-base sm:text-xl font-display font-bold text-income">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">Análises</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2">
              <CardTitle className="text-base sm:text-lg">Evolução Mensal</CardTitle>
              <CardDescription>Receitas e despesas dos últimos 12 meses</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <EvolutionChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2">
              <CardTitle className="text-base sm:text-lg">Despesas por Categoria</CardTitle>
              <CardDescription>Distribuição das despesas do mês selecionado</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <ExpenseCategoryChart />
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Client Expense Allocation */}
      <ClientExpenseAllocation />

      {/* MEI Limit Alert */}
      <MEILimitAlert />
    </div>
  );
}
