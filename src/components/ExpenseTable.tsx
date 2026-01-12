import { useFinance } from "@/contexts/FinanceContext";
import { Expense } from "@/types/finance";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExpenseStatusEditor } from "./ExpenseStatusEditor";
import { ExpenseForm } from "./forms/ExpenseForm";
import { Trash2, Repeat, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";

interface ExpenseTableProps {
  expenses: Expense[];
  showType?: boolean;
}

export function ExpenseTable({ expenses, showType = false }: ExpenseTableProps) {
  const { removeExpense, getClientById } = useFinance();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma despesa cadastrada
      </div>
    );
  }

  return (
    <>
      {/* Mobile Cards View */}
      <div className="space-y-3 md:hidden">
        {expenses.map((expense) => (
          <Card key={expense.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground truncate">{expense.description}</h3>
                    {expense.isFixed && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs flex-shrink-0">
                        <Repeat className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-display font-bold text-expense">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <ExpenseForm 
                    type={expense.type} 
                    expense={expense} 
                    editMode={true} 
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeExpense(expense.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs">
                  <Tag className="w-3 h-3" />
                  {expense.category}
                </span>
                {showType && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${
                    expense.type === 'business' ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'
                  }`}>
                    {expense.type === 'business' ? 'Empresa' : 'Pessoal'}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(expense.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>

              <ExpenseStatusEditor 
                expenseId={expense.id}
                currentStatus={expense.status}
                currentSourceId={expense.paymentSourceId}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                {showType && <TableHead>Tipo</TableHead>}
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status / Fonte</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {expense.description}
                      {expense.isFixed && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs">
                          <Repeat className="w-3 h-3" />
                          Fixa
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs">
                      {expense.category}
                    </span>
                  </TableCell>
                  {showType && (
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${
                        expense.type === 'business' ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'
                      }`}>
                        {expense.type === 'business' ? 'Empresa' : 'Pessoal'}
                      </span>
                    </TableCell>
                  )}
                  <TableCell>
                    {format(new Date(expense.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right font-medium text-expense">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>
                    <ExpenseStatusEditor 
                      expenseId={expense.id}
                      currentStatus={expense.status}
                      currentSourceId={expense.paymentSourceId}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ExpenseForm 
                        type={expense.type} 
                        expense={expense} 
                        editMode={true} 
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeExpense(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
