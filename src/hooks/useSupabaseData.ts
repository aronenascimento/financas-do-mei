import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Client, Income, Expense, Investment, PaymentStatus } from '@/types/finance';
import { toast } from 'sonner';

// Convert database row to Client
const toClient = (row: any): Client => ({
  id: row.id,
  name: row.name,
  createdAt: new Date(row.created_at),
});

// Convert database row to Income
const toIncome = (row: any): Income => ({
  id: row.id,
  description: row.description,
  amount: Number(row.amount),
  clientId: row.client_id || '',
  paymentDate: new Date(row.payment_date),
  category: row.category,
  createdAt: new Date(row.created_at),
});

// Convert database row to Expense
const toExpense = (row: any): Expense => ({
  id: row.id,
  description: row.description,
  amount: Number(row.amount),
  category: row.category,
  dueDate: new Date(row.due_date),
  status: row.status as PaymentStatus,
  paymentSourceId: row.payment_source_id || undefined,
  type: row.type as 'business' | 'personal',
  isFixed: row.is_fixed,
  createdAt: new Date(row.created_at),
});

// Convert database row to Investment
const toInvestment = (row: any): Investment => ({
  id: row.id,
  description: row.description,
  amount: Number(row.amount),
  category: row.category,
  date: new Date(row.date),
  createdAt: new Date(row.created_at),
});

export function useSupabaseData() {
  const [clients, setClients] = useState<Client[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientsRes, incomesRes, expensesRes, investmentsRes] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('incomes').select('*').order('payment_date', { ascending: false }),
        supabase.from('expenses').select('*').order('due_date', { ascending: false }),
        supabase.from('investments').select('*').order('date', { ascending: false }),
      ]);

      if (clientsRes.data) setClients(clientsRes.data.map(toClient));
      if (incomesRes.data) setIncomes(incomesRes.data.map(toIncome));
      if (expensesRes.data) setExpenses(expensesRes.data.map(toExpense));
      if (investmentsRes.data) setInvestments(investmentsRes.data.map(toInvestment));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CLIENTS
  const addClient = useCallback(async (client: Omit<Client, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('clients')
      .insert({ name: client.name })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding client:', error);
      toast.error('Erro ao adicionar cliente');
      return;
    }
    if (data) {
      setClients(prev => [toClient(data), ...prev]);
      toast.success('Cliente adicionado!');
    }
  }, []);

  const removeClient = useCallback(async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
      console.error('Error removing client:', error);
      toast.error('Erro ao remover cliente');
      return;
    }
    setClients(prev => prev.filter(c => c.id !== id));
    toast.success('Cliente removido!');
  }, []);

  // INCOMES
  const addIncome = useCallback(async (income: Omit<Income, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('incomes')
      .insert({
        description: income.description,
        amount: income.amount,
        client_id: income.clientId || null,
        payment_date: income.paymentDate.toISOString().split('T')[0],
        category: income.category,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding income:', error);
      toast.error('Erro ao adicionar receita');
      return;
    }
    if (data) {
      setIncomes(prev => [toIncome(data), ...prev]);
      toast.success('Receita adicionada!');
    }
  }, []);

  const updateIncome = useCallback(async (id: string, updates: Partial<Omit<Income, 'id' | 'createdAt'>>) => {
    const updateData: any = {};
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId || null;
    if (updates.paymentDate !== undefined) updateData.payment_date = updates.paymentDate.toISOString().split('T')[0];
    if (updates.category !== undefined) updateData.category = updates.category;

    const { data, error } = await supabase
      .from('incomes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating income:', error);
      toast.error('Erro ao atualizar receita');
      return;
    }
    if (data) {
      setIncomes(prev => prev.map(i => i.id === id ? toIncome(data) : i));
      toast.success('Receita atualizada!');
    }
  }, []);

  const removeIncome = useCallback(async (id: string) => {
    const { error } = await supabase.from('incomes').delete().eq('id', id);
    if (error) {
      console.error('Error removing income:', error);
      toast.error('Erro ao remover receita');
      return;
    }
    setIncomes(prev => prev.filter(i => i.id !== id));
    toast.success('Receita removida!');
  }, []);

  // EXPENSES
  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        due_date: expense.dueDate.toISOString().split('T')[0],
        status: expense.status,
        payment_source_id: expense.paymentSourceId || null,
        type: expense.type,
        is_fixed: expense.isFixed,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding expense:', error);
      toast.error('Erro ao adicionar despesa');
      return;
    }
    if (data) {
      setExpenses(prev => [toExpense(data), ...prev]);
      toast.success('Despesa adicionada!');
    }
  }, []);

  const updateExpense = useCallback(async (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
    const updateData: any = {};
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate.toISOString().split('T')[0];
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.paymentSourceId !== undefined) updateData.payment_source_id = updates.paymentSourceId || null;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.isFixed !== undefined) updateData.is_fixed = updates.isFixed;

    const { data, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating expense:', error);
      toast.error('Erro ao atualizar despesa');
      return;
    }
    if (data) {
      setExpenses(prev => prev.map(e => e.id === id ? toExpense(data) : e));
      toast.success('Despesa atualizada!');
    }
  }, []);

  const updateExpenseStatus = useCallback(async (id: string, status: PaymentStatus, paymentSourceId?: string) => {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        status,
        payment_source_id: paymentSourceId || null,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating expense status:', error);
      toast.error('Erro ao atualizar status');
      return;
    }
    if (data) {
      setExpenses(prev => prev.map(e => e.id === id ? toExpense(data) : e));
    }
  }, []);

  const removeExpense = useCallback(async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      console.error('Error removing expense:', error);
      toast.error('Erro ao remover despesa');
      return;
    }
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast.success('Despesa removida!');
  }, []);

  // INVESTMENTS
  const addInvestment = useCallback(async (investment: Omit<Investment, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('investments')
      .insert({
        description: investment.description,
        amount: investment.amount,
        category: investment.category,
        date: investment.date.toISOString().split('T')[0],
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding investment:', error);
      toast.error('Erro ao adicionar investimento');
      return;
    }
    if (data) {
      setInvestments(prev => [toInvestment(data), ...prev]);
      toast.success('Investimento adicionado!');
    }
  }, []);

  const removeInvestment = useCallback(async (id: string) => {
    const { error } = await supabase.from('investments').delete().eq('id', id);
    if (error) {
      console.error('Error removing investment:', error);
      toast.error('Erro ao remover investimento');
      return;
    }
    setInvestments(prev => prev.filter(i => i.id !== id));
    toast.success('Investimento removido!');
  }, []);

  return {
    clients,
    incomes,
    expenses,
    investments,
    loading,
    addClient,
    removeClient,
    addIncome,
    updateIncome,
    removeIncome,
    addExpense,
    updateExpense,
    updateExpenseStatus,
    removeExpense,
    addInvestment,
    removeInvestment,
    refetch: fetchData,
  };
}
