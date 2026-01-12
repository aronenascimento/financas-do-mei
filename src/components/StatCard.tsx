import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'income' | 'expense' | 'investment' | 'saved' | 'balance' | 'pending';
  format?: 'currency' | 'number';
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant = 'default',
  format = 'currency',
  className 
}: StatCardProps) {
  const formatValueFull = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };


  const variantClasses = {
    default: 'stat-card',
    income: 'stat-card-income',
    expense: 'stat-card-expense',
    investment: 'stat-card-investment',
    saved: 'stat-card-saved',
    balance: 'stat-card-balance',
    pending: 'stat-card',
  };

  const iconColors = {
    default: 'text-primary',
    income: 'text-income',
    expense: 'text-expense',
    investment: 'text-investment',
    saved: 'text-saved',
    balance: 'text-primary',
    pending: 'text-muted-foreground',
  };

  const valueColors = {
    default: 'text-foreground',
    income: 'text-income',
    expense: 'text-expense',
    investment: 'text-investment',
    saved: 'text-saved',
    balance: 'text-primary',
    pending: 'text-muted-foreground',
  };

  return (
    <div className={cn(variantClasses[variant], "animate-fade-in", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{title}</p>
          <p className={cn("text-sm sm:text-2xl font-display font-bold mt-0.5 sm:mt-1", valueColors[variant])}>
            {formatValueFull(value)}
          </p>
          {subtitle && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            variant === 'income' && "bg-income-light",
            variant === 'expense' && "bg-expense-light",
            variant === 'investment' && "bg-investment-light",
            variant === 'saved' && "bg-saved-light",
            variant === 'balance' && "bg-accent",
            variant === 'pending' && "bg-muted",
            variant === 'default' && "bg-accent",
          )}>
            <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", iconColors[variant])} />
          </div>
        )}
      </div>
    </div>
  );
}
