import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Income, Expense, Investment, Client } from '@/types/finance';

export function useFinanceData() {
  const { user } = useAuth();

  const clients = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Map clients data
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        createdAt: new Date(item.created_at),
      })) as Client[];
    },
    enabled: !!user,
  });

  const incomes = useQuery({
    queryKey: ['incomes'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      
      // Map incomes data
      return (data || []).map(item => ({
        id: item.id,
        description: item.description,
        amount: item.amount,
        clientId: item.client_id,
        paymentDate: new Date(item.payment_date),
        category: item.category,
        createdAt: new Date(item.created_at),
      })) as Income[];
    },
    enabled: !!user,
  });

  const expenses = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('due_date', { ascending: false });
      
      if (error) throw error;
      
      // Map expenses data
      return (data || []).map(item => ({
        id: item.id,
        description: item.description,
        amount: item.amount,
        category: item.category,
        dueDate: new Date(item.due_date),
        status: item.status,
        paymentSourceId: item.payment_source_id,
        type: item.type,
        isFixed: item.is_fixed,
        createdAt: new Date(item.created_at),
      })) as Expense[];
    },
    enabled: !!user,
  });

  const investments = useQuery({
    queryKey: ['investments'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id) // <-- Filtrar por user_id
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Map investments data
      return (data || []).map(item => ({
        id: item.id,
        description: item.description,
        amount: item.amount,
        category: item.category,
        date: new Date(item.date),
        createdAt: new Date(item.created_at),
      })) as Investment[];
    },
    enabled: !!user,
  });

  const financialSummary = useQuery({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      if (!user) return null;
      
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      // RPC call updated: removed user_id parameter
      const { data, error } = await supabase
        .rpc('get_financial_summary', {
          target_month: currentMonth,
          target_year: currentYear,
        });
      
      if (error) throw error;
      return data[0] || null;
    },
    enabled: !!user,
  });

  const evolutionData = useQuery({
    queryKey: ['evolution-data'],
    queryFn: async () => {
      if (!user) return [];
      
      // RPC call updated: removed user_id parameter
      const { data, error } = await supabase
        .rpc('get_evolution_data', {
          months_back: 12,
        });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const expenseCategories = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      if (!user) return [];
      
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      // RPC call updated: removed user_id parameter
      const { data, error } = await supabase
        .rpc('get_expense_categories', {
          target_month: currentMonth,
          target_year: currentYear,
        });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const clientAllocation = useQuery({
    queryKey: ['client-allocation'],
    queryFn: async () => {
      if (!user) return [];
      
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      // RPC call updated: removed user_id parameter
      const { data, error } = await supabase
        .rpc('get_client_expense_allocation', {
          target_month: currentMonth,
          target_year: currentYear,
        });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const meiLimits = useQuery({
    queryKey: ['mei-limits'],
    queryFn: async () => {
      if (!user) return null;
      
      // RPC call updated: no parameters needed, function uses auth.uid() internally
      const { data, error } = await supabase
        .rpc('check_mei_limits');
      
      if (error) throw error;
      return data[0] || null;
    },
    enabled: !!user,
  });

  return {
    clients,
    incomes,
    expenses,
    investments,
    financialSummary,
    evolutionData,
    expenseCategories,
    clientAllocation,
    meiLimits,
  };
}