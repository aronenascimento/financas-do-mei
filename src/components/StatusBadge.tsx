import { cn } from "@/lib/utils";
import { PaymentStatus } from "@/types/finance";
import { Check, Clock, PiggyBank } from "lucide-react";

interface StatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const statusConfig = {
  paid: {
    label: 'Pago',
    className: 'status-paid',
    icon: Check,
  },
  unpaid: {
    label: 'Não Pago',
    className: 'status-unpaid',
    icon: Clock,
  },
  saved: {
    label: 'Guardado',
    className: 'status-saved',
    icon: PiggyBank,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn(config.className, "gap-1", className)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
