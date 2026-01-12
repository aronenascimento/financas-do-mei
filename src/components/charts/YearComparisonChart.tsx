import { useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, startOfMonth, endOfMonth, isWithinInterval, setMonth, setYear } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthData {
  month: string;
  receitas2025: number;
  receitas2026: number;
  despesas2025: number;
  despesas2026: number;
}

export function YearComparisonChart() {
  const { incomes, expenses } = useFinance();

  const chartData = useMemo((): MonthData[] => {
    const data: MonthData[] = [];
    const currentYear = 2026;
    const previousYear = 2025;

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthName = format(setMonth(new Date(), monthIndex), "MMM", { locale: ptBR });

      // Calculate for current year (2026)
      const currentYearDate = setYear(setMonth(new Date(), monthIndex), currentYear);
      const currentStart = startOfMonth(currentYearDate);
      const currentEnd = endOfMonth(currentYearDate);

      const currentIncomes = incomes.filter((income) =>
        isWithinInterval(new Date(income.paymentDate), { start: currentStart, end: currentEnd })
      );
      const currentExpenses = expenses.filter((expense) =>
        isWithinInterval(new Date(expense.dueDate), { start: currentStart, end: currentEnd })
      );

      // Calculate for previous year (2025)
      const previousYearDate = setYear(setMonth(new Date(), monthIndex), previousYear);
      const previousStart = startOfMonth(previousYearDate);
      const previousEnd = endOfMonth(previousYearDate);

      const previousIncomes = incomes.filter((income) =>
        isWithinInterval(new Date(income.paymentDate), { start: previousStart, end: previousEnd })
      );
      const previousExpenses = expenses.filter((expense) =>
        isWithinInterval(new Date(expense.dueDate), { start: previousStart, end: previousEnd })
      );

      data.push({
        month: monthName,
        receitas2025: previousIncomes.reduce((sum, i) => sum + i.amount, 0),
        receitas2026: currentIncomes.reduce((sum, i) => sum + i.amount, 0),
        despesas2025: previousExpenses.reduce((sum, e) => sum + e.amount, 0),
        despesas2026: currentExpenses.reduce((sum, e) => sum + e.amount, 0),
      });
    }

    return data;
  }, [incomes, expenses]);

  const hasData2025 = useMemo(() => {
    return chartData.some((d) => d.receitas2025 > 0 || d.despesas2025 > 0);
  }, [chartData]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
    }).format(value);

  const calculateVariation = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const variation = ((current - previous) / previous) * 100;
    return `${variation > 0 ? "+" : ""}${variation.toFixed(1)}%`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as MonthData;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground capitalize mb-2">{label}</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Receitas</p>
              <p className="text-sm">
                2025: {formatCurrency(data.receitas2025)} | 2026: {formatCurrency(data.receitas2026)}
              </p>
              <p className="text-xs text-muted-foreground">
                Variação: {calculateVariation(data.receitas2026, data.receitas2025)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Despesas</p>
              <p className="text-sm">
                2025: {formatCurrency(data.despesas2025)} | 2026: {formatCurrency(data.despesas2026)}
              </p>
              <p className="text-xs text-muted-foreground">
                Variação: {calculateVariation(data.despesas2026, data.despesas2025)}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!hasData2025) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Dados do ano anterior não disponíveis
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="month" 
          className="text-xs fill-muted-foreground"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tickFormatter={formatCurrency}
          className="text-xs fill-muted-foreground"
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: "20px" }}
          formatter={(value) => <span className="text-foreground">{value}</span>}
        />
        <Bar 
          dataKey="receitas2025" 
          name="Receitas 2025" 
          fill="hsl(210, 70%, 70%)" 
          radius={[2, 2, 0, 0]}
        />
        <Bar 
          dataKey="receitas2026" 
          name="Receitas 2026" 
          fill="hsl(210, 70%, 45%)" 
          radius={[2, 2, 0, 0]}
        />
        <Bar 
          dataKey="despesas2025" 
          name="Despesas 2025" 
          fill="hsl(0, 70%, 70%)" 
          radius={[2, 2, 0, 0]}
        />
        <Bar 
          dataKey="despesas2026" 
          name="Despesas 2026" 
          fill="hsl(0, 70%, 45%)" 
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
