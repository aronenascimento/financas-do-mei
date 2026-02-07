import { useState, useEffect, useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil } from "lucide-react";
import { PaymentStatus, Expense } from "@/types/finance";
import { format, addMonths, startOfMonth, endOfMonth, isWithinInterval, isSameMonth, isSameYear } from "date-fns";
import { toast } from "sonner";

const businessCategories = [
  "Saque",
  "Impostos",
  "Infraestrutura",
  "Marketing",
  "Ferramentas",
  "Serviços",
  "Outros"
];

const personalCategories = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Lazer",
  "Educação",
  "Cartão de crédito",
  "Poupança",
  "Outros"
];

interface ExpenseFormProps {
  type: 'business' | 'personal';
  onSuccess?: () => void;
  triggerLabel?: string;
  expense?: Expense; // For editing
  editMode?: boolean;
}

export function ExpenseForm({ type, onSuccess, triggerLabel, expense, editMode = false }: ExpenseFormProps) {
  const { addExpense, updateExpense, clients, incomes, expenses, createFixedExpenseCopies } = useFinance();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("unpaid");
  const [paymentSourceId, setPaymentSourceId] = useState("");
  const [isFixed, setIsFixed] = useState(false);
  const [months, setMonths] = useState<number>(0); // Novo campo para meses

  const categories = type === 'business' ? businessCategories : personalCategories;

  // Calculate withdrawal limits
  const withdrawalLimits = useMemo(() => {
    // Total income received (payment date <= today)
    const today = new Date();
    const totalReceived = incomes
      .filter(inc => new Date(inc.paymentDate) <= today)
      .reduce((sum, inc) => sum + inc.amount, 0);

    // Total withdrawals already made (excluding current expense if editing)
    const existingWithdrawals = expenses
      .filter(exp => exp.category === 'Saque' && exp.type === 'business' && (!editMode || exp.id !== expense?.id))
      .reduce((sum, exp) => sum + exp.amount, 0);

    // Available for withdrawal (total)
    const availableTotal = Math.max(0, totalReceived - existingWithdrawals);

    // Per-client limits
    const clientLimits: Record<string, number> = {};
    clients.forEach(client => {
      const clientIncome = incomes
        .filter(inc => inc.clientId === client.id && new Date(inc.paymentDate) <= today)
        .reduce((sum, inc) => sum + inc.amount, 0);
      
      const clientWithdrawals = expenses
        .filter(exp => exp.category === 'Saque' && exp.type === 'business' && exp.paymentSourceId === client.id && (!editMode || exp.id !== expense?.id))
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      clientLimits[client.id] = Math.max(0, clientIncome - clientWithdrawals);
    });

    return { availableTotal, clientLimits };
  }, [incomes, expenses, clients, editMode, expense?.id]);

  // Populate form when editing
  useEffect(() => {
    if (expense && editMode) {
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setDueDate(format(new Date(expense.dueDate), 'yyyy-MM-dd'));
      setStatus(expense.status);
      setPaymentSourceId(expense.paymentSourceId || "");
      setIsFixed(expense.isFixed);
      setMonths(0); // Reset months when editing
    }
  }, [expense, editMode]);

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategory("");
    setDueDate("");
    setStatus("unpaid");
    setPaymentSourceId("");
    setIsFixed(false);
    setMonths(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || !category || !dueDate) return;

    const parsedAmount = parseFloat(amount);

    // Validation for "Saque" category
    if (category === 'Saque' && type === 'business') {
      // Check total limit
      if (parsedAmount > withdrawalLimits.availableTotal) {
        toast.error(`Saque excede o total disponível. Máximo: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(withdrawalLimits.availableTotal)}`);
        return;
      }

      // Check client-specific limit if a source is selected
      if (paymentSourceId && withdrawalLimits.clientLimits[paymentSourceId] !== undefined) {
        if (parsedAmount > withdrawalLimits.clientLimits[paymentSourceId]) {
          const clientName = clients.find(c => c.id === paymentSourceId)?.name || 'Cliente';
          toast.error(`Saque excede o disponível de ${clientName}. Máximo: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(withdrawalLimits.clientLimits[paymentSourceId])}`);
          return;
        }
      }
    }

    // Parse date correctly to avoid timezone issues
    const [year, month, day] = dueDate.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day, 12, 0, 0);

    const expenseData = {
      description: description.trim(),
      amount: parsedAmount,
      category,
      dueDate: parsedDate,
      status,
      paymentSourceId: paymentSourceId || undefined,
      type,
      isFixed,
    };

    if (isFixed && months > 0) {
      // Criar a despesa atual
      if (editMode && expense) {
        updateExpense(expense.id, expenseData);
      } else {
        addExpense(expenseData);
      }

      // Criar cópias para os próximos meses usando a função do contexto
      createFixedExpenseCopies(expenseData as Omit<Expense, 'id' | 'createdAt'>, months);
      
      toast.success(`Despesa fixa criada para ${months} meses à frente!`);
    } else {
      // Lógica normal
      if (editMode && expense) {
        updateExpense(expense.id, expenseData);
      } else {
        addExpense(expenseData);
      }
    }

    resetForm();
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen && !editMode) resetForm();
    }}>
      <DialogTrigger asChild>
        {editMode ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
            <Pencil className="h-4 h-4" />
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            {triggerLabel || (type === 'business' ? 'Nova Despesa Empresa' : 'Nova Despesa Pessoal')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editMode 
              ? 'Editar Despesa' 
              : (type === 'business' ? 'Adicionar Despesa da Empresa' : 'Adicionar Despesa Pessoal')
            }
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Aluguel, Internet, DAS..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              {category === 'Saque' && type === 'business' && (
                <p className="text-xs text-muted-foreground">
                  Disponível: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    paymentSourceId ? withdrawalLimits.clientLimits[paymentSourceId] ?? withdrawalLimits.availableTotal : withdrawalLimits.availableTotal
                  )}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Data de Vencimento</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PaymentStatus)} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Não Pago</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="saved">Guardado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fonte de Pagamento (Cliente)</Label>
            <Select value={paymentSourceId} onValueChange={setPaymentSourceId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a fonte (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFixed"
              checked={isFixed}
              onCheckedChange={(checked) => setIsFixed(checked === true)}
            />
            <Label htmlFor="isFixed" className="text-sm font-normal cursor-pointer">
              Despesa fixa (repete todo mês)
            </Label>
          </div>

          {isFixed && (
            <div className="space-y-2 ml-6">
              <Label htmlFor="months">Criar cópias para os próximos meses</Label>
              <Input
                id="months"
                type="number"
                min="1"
                max="12"
                placeholder="1"
                value={months || ""}
                onChange={(e) => setMonths(e.target.value ? parseInt(e.target.value) : 0)}
              />
              <p className="text-xs text-muted-foreground">
                Cria cópias desta despesa para os próximos N meses. Cada cópia será independente.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">{editMode ? 'Salvar' : 'Adicionar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}