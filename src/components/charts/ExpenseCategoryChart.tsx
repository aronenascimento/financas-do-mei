import { useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { isValid } from "date-fns";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--danger))",
  "hsl(var(--accent))",
  "hsl(210, 70%, 50%)",
  "hsl(280, 70%, 50%)",
  "hsl(330, 70%, 50%)",
  "hsl(60, 70%, 45%)",
  "hsl(180, 70%, 45%)",
];

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

export function ExpenseCategoryChart() {
  const { filteredExpenses } = useFinance();

  const chartData = useMemo((): CategoryData[] => {
    const categoryTotals: Record<string, number> = {};
    
    filteredExpenses.forEach((expense) => {
      // Adicionar validação de data
      const expenseDate = new Date(expense.dueDate);
      if (!isValid(expenseDate)) return;
      
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CategoryData;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-muted-foreground">
            {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ name, percentage }: CategoryData) => {
    if (percentage < 5) return null;
    return `${percentage.toFixed(0)}%`;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        Nenhuma despesa registrada neste mês
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={renderCustomLabel}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]}
              className="stroke-background"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          wrapperStyle={{ paddingLeft: "20px" }}
          formatter={(value) => (
            <span className="text-foreground text-sm">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}