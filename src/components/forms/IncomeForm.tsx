import { useState, useEffect } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import { Income } from "@/types/finance";
import { format } from "date-fns";

const categories = [
  "Serviços",
  "Projetos",
  "Consultoria",
  "Vendas",
  "Outros"
];

interface IncomeFormProps {
  onSuccess?: () => void;
  income?: Income; // For editing
  editMode?: boolean;
}

export function IncomeForm({ onSuccess, income, editMode = false }: IncomeFormProps) {
  const { addIncome, updateIncome, clients } = useFinance();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [clientId, setClientId] = useState("");
  const [category, setCategory] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (income && editMode) {
      setDescription(income.description);
      setAmount(income.amount.toString());
      setClientId(income.clientId);
      setCategory(income.category);
      setPaymentDate(format(new Date(income.paymentDate), 'yyyy-MM-dd'));
    }
  }, [income, editMode]);

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setClientId("");
    setCategory("");
    setPaymentDate("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || !clientId || !category || !paymentDate) return;

    // Parse date correctly to avoid timezone issues
    const [year, month, day] = paymentDate.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day, 12, 0, 0);

    const incomeData = {
      description: description.trim(),
      amount: parseFloat(amount),
      clientId,
      category,
      paymentDate: parsedDate,
    };

    if (editMode && income) {
      updateIncome(income.id, incomeData);
    } else {
      addIncome(incomeData);
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
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Recebimento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editMode ? 'Editar Recebimento' : 'Adicionar Recebimento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Serviço mensal, Projeto X..."
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Data de Pagamento</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
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
