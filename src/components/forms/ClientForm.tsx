import { useState, forwardRef } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface ClientFormProps {
  onSuccess?: () => void;
}

export const ClientForm = forwardRef<HTMLButtonElement, ClientFormProps>(
  function ClientForm({ onSuccess }, ref) {
    const { addClient } = useFinance();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;

      addClient({ name: name.trim() });
      setName("");
      setOpen(false);
      onSuccess?.();
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button ref={ref} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Cliente
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Cliente / Fonte de Receita</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex: Usina, Mercado, Freelance..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);
