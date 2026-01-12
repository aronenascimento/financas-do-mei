import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthSelectorProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthSelector({ currentMonth, onMonthChange }: MonthSelectorProps) {
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const goToCurrentMonth = () => {
    onMonthChange(new Date());
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return (
      currentMonth.getMonth() === now.getMonth() &&
      currentMonth.getFullYear() === now.getFullYear()
    );
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-card border border-border rounded-lg p-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 sm:h-8 sm:w-8"
        onClick={goToPreviousMonth}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-1 sm:gap-2 px-1 sm:px-3 min-w-[100px] sm:min-w-[160px] justify-center">
        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary hidden sm:block" />
        <span className="font-medium text-xs sm:text-sm text-foreground capitalize">
          {format(currentMonth, "MMM yyyy", { locale: ptBR })}
        </span>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 sm:h-8 sm:w-8"
        onClick={goToNextMonth}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {!isCurrentMonth() && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 sm:h-8 text-[10px] sm:text-xs px-2"
          onClick={goToCurrentMonth}
        >
          Hoje
        </Button>
      )}
    </div>
  );
}
