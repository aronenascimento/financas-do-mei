import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useFinanceData() {
  const { user } = useAuth();

  const clients = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', user.id);
      
      if (error) throw error;
      return data || [];
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
        .eq('client_id', user.id)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
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
        .or(`payment_source_id.eq.${user.id},payment_source_id.is.null`)
        .order('due_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
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
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const financialSummary = useQuery({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      if (!user) return null;
      
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const { data, error } = await supabase
        .rpc('get_financial_summary', {
          user_id: user.id,
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
      
      const { data, error } = await supabase
        .rpc('get_evolution_data', {
          user_id: user.id,
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
      
      const { data, error } = await supabase
        .rpc('get_expense_categories', {
          user_id: user.id,
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
      
      const { data, error } = await supabase
        .rpc('get_client_expense_allocation', {
          user_id: user.id,
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