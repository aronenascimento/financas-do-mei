import { useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

const MEI_MONTHLY_LIMIT = 6750;

interface ChartData {
  month: string;
  fullMonth: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export function EvolutionChart() {
  const { incomes, expenses } = useFinance();

  const chartData = useMemo((): ChartData[] => {
    const data: ChartData[] = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);

      const monthIncomes = incomes.filter((income) => {
        // INICIO DA CORREÇÃO
        const date = new Date(income.paymentDate);
        return isValid(date) && isWithinInterval(date, { start, end });
        // FIM DA CORREÇÃO
      });

      const monthExpenses = expenses.filter((expense) => {
        // INICIO DA CORREÇÃO
        const date = new Date(expense.dueDate);
        return isValid(date) && isWithinInterval(date, { start, end });
        // FIM DA CORREÇÃO
      });

      const receitas = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
      const despesas = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      data.push({
        month: format(monthDate, "MMM/yy", { locale: ptBR }),
        fullMonth: format(monthDate, "MMMM 'de' yyyy", { locale: ptBR }),
        receitas,
        despesas,
        saldo: receitas - despesas,
      });
    }

    return data;
  }, [incomes, expenses]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
    }).format(value);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartData;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground capitalize">{data.fullMonth}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-success">
              Receitas: {formatCurrency(data.receitas)}
            </p>
            <p className="text-sm text-danger">
              Despesas: {formatCurrency(data.despesas)}
            </p>
            <p className={`text-sm font-medium ${data.saldo >= 0 ? "text-success" : "text-danger"}`}>
              Saldo: {formatCurrency(data.saldo)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
        <ReferenceLine 
          y={MEI_MONTHLY_LIMIT} 
          stroke="hsl(var(--warning))" 
          strokeDasharray="5 5"
          label={{ 
            value: "Limite MEI", 
            position: "right",
            className: "fill-warning text-xs"
          }}
        />
        <Line
          type="monotone"
          dataKey="receitas"
          name="Receitas"
          stroke="#1e3a5f"
          strokeWidth={2}
          dot={{ fill: "#1e3a5f", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="despesas"
          name="Despesas"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ fill: "#ef4444", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}