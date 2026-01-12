import { useFinance } from "@/contexts/FinanceContext";
import { PaymentStatus } from "@/types/finance";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "./StatusBadge";

interface ExpenseStatusEditorProps {
  expenseId: string;
  currentStatus: PaymentStatus;
  currentSourceId?: string;
}

export function ExpenseStatusEditor({ expenseId, currentStatus, currentSourceId }: ExpenseStatusEditorProps) {
  const { updateExpenseStatus, clients } = useFinance();

  const handleStatusChange = (newStatus: PaymentStatus) => {
    updateExpenseStatus(expenseId, newStatus, currentSourceId);
  };

  const handleSourceChange = (sourceId: string) => {
    updateExpenseStatus(expenseId, currentStatus, sourceId === "none" ? undefined : sourceId);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={currentStatus} onValueChange={(v) => handleStatusChange(v as PaymentStatus)}>
        <SelectTrigger className="w-[130px]">
          <StatusBadge status={currentStatus} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unpaid">
            <StatusBadge status="unpaid" />
          </SelectItem>
          <SelectItem value="paid">
            <StatusBadge status="paid" />
          </SelectItem>
          <SelectItem value="saved">
            <StatusBadge status="saved" />
          </SelectItem>
        </SelectContent>
      </Select>

      {(currentStatus === 'paid' || currentStatus === 'saved') && (
        <Select value={currentSourceId || "none"} onValueChange={handleSourceChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Fonte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem fonte</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
