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
      
      // Map clients data with null checks
      return (data || []).map(item => ({
        id: item.id,
        name: item.name || '',
        createdAt: item.created_at ? new Date(item.created_at) : new Date(),
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
      
      // Map incomes data with null checks
      return (data || []).map(item => ({
        id: item.id,
        description: item.description || '',
        amount: item.amount || 0,
        clientId: item.client_id || '',
        paymentDate: item.payment_date ? new Date(item.payment_date) : new Date(),
        category: item.category || '',
        createdAt: item.created_at ? new Date(item.created_at) : new Date(),
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
      
      // Map expenses data with null checks
      return (data || []).map(item => ({
        id: item.id,
        description: item.description || '',
        amount: item.amount || 0,
        category: item.category || '',
        dueDate: item.due_date ? new Date(item.due_date) : new Date(),
        status: item.status || 'unpaid',
        paymentSourceId: item.payment_source_id || undefined,
        type: item.type || 'business',
        isFixed: item.is_fixed || false,
        createdAt: item.created_at ? new Date(item.created_at) : new Date(),
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
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Map investments data with null checks
      return (data || []).map(item => ({
        id: item.id,
        description: item.description || '',
        amount: item.amount || 0,
        category: item.category || '',
        date: item.date ? new Date(item.date) : new Date(),
        createdAt: item.created_at ? new Date(item.created_at) : new Date(),
      })) as Investment[];
    },
    enabled: !!user,
  });

  // --- RPC Calls (using current month/year for initial load) ---

  const evolutionData = useQuery({
    queryKey: ['evolution-data'],
    queryFn: async () => {
      if (!user) return [];
      
      // RPC get_evolution_data agora aceita apenas months_back (default 12)
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
      
      // RPC get_expense_categories agora aceita target_month e target_year
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
      
      // RPC get_client_expense_allocation agora aceita target_month e target_year
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
      
      // RPC check_mei_limits não aceita argumentos
      const { data, error } = await supabase
        .rpc('check_mei_limits');
      
      if (error) throw error;
      return data && data[0] ? data[0] : null;
    },
    enabled: !!user,
  });

  return {
    clients,
    incomes,
    expenses,
    investments,
    evolutionData,
    expenseCategories,
    clientAllocation,
    meiLimits,
  };
}