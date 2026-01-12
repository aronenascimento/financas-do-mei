import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { 
  Client, 
  Income, 
  Expense, 
  Investment, 
  FinancialSummary, 
  PaymentStatus,
  MEILimitData // Import MEILimitData from types
} from '@/types/finance';
import { startOfMonth, endOfMonth, isWithinInterval, setMonth, setYear, getMonth, getYear } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth


interface FinanceContextType {
  clients: Client[];
  incomes: Income[];
  expenses: Expense[];
  investments: Investment[];
  filteredIncomes: Income[];
  filteredExpenses: Expense[];
  filteredInvestments: Investment[];
  selectedMonth: Date;
  meiLimits: MEILimitData | null; // Exposed MEI Limits data
  setSelectedMonth: (date: Date) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  removeClient: (id: string) => Promise<void>;
  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => Promise<void>;
  updateIncome: (id: string, income: Partial<Omit<Income, 'id' | 'createdAt'>>) => Promise<void>;
  removeIncome: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'paymentSourceId'> & { paymentSourceId?: string | null }) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Omit<Expense, 'id' | 'createdAt' | 'paymentSourceId'>> & { paymentSourceId?: string | null }) => Promise<void>;
  updateExpenseStatus: (id: string, status: PaymentStatus, paymentSourceId?: string | null) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  addInvestment: (investment: Omit<Investment, 'id' | 'createdAt'>) => Promise<void>;
  removeInvestment: (id: string) => Promise<void>;
  getBusinessSummary: () => FinancialSummary;
  getPersonalSummary: () => FinancialSummary;
  getTotalSummary: () => FinancialSummary;
  getClientById: (id: string) => Client | undefined;
  isLoading: boolean;
  isMutating: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [isMutating, setIsMutating] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Get authenticated user

  // Destructure query results
  const queries = useFinanceData();

  // Extract data and calculate combined loading state
  const clients = (queries.clients.data as Client[] | undefined) || [];
  const incomes = (queries.incomes.data as Income[] | undefined) || [];
  const expenses = (queries.expenses.data as Expense[] | undefined) || [];
  const investments = (queries.investments.data as Investment[] | undefined) || [];
  const meiLimits = (queries.meiLimits.data as MEILimitData | null | undefined) || null;
  
  const isLoading = queries.clients.isLoading || queries.incomes.isLoading || queries.expenses.isLoading || queries.investments.isLoading || queries.meiLimits.isLoading;

  // Helper to invalidate all relevant queries
  const invalidateFinanceQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['incomes'] });
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['investments'] });
    queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
    queryClient.invalidateQueries({ queryKey: ['evolution-data'] });
    queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
    queryClient.invalidateQueries({ queryKey: ['client-allocation'] });
    queryClient.invalidateQueries({ queryKey: ['mei-limits'] });
  }, [queryClient]);


  // Filtered data by selected month (including fixed expenses projected to current month)
  const filteredIncomes = useMemo(() => {
    return incomes.filter(income => {
      const incomeDate = new Date(income.paymentDate);
      const start = startOfMonth(selectedMonth);
      const end = endOfMonth(selectedMonth);
      return isWithinInterval(incomeDate, { start, end });
    });
  }, [incomes, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    const targetMonth = getMonth(selectedMonth);
    const targetYear = getYear(selectedMonth);
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.dueDate);
      
      // If it's in the selected month, show it
      if (isWithinInterval(expenseDate, { 
        start: startOfMonth(selectedMonth), 
        end: endOfMonth(selectedMonth) 
      })) {
        return true;
      }
      
      // If it's a fixed expense and was created before or during the selected month, show it
      if (expense.isFixed) {
        const createdDate = new Date(expense.createdAt);
        const createdMonth = getMonth(createdDate);
        const createdYear = getYear(createdDate);
        return createdYear < targetYear || (createdYear === targetYear && createdMonth <= targetMonth);
      }
      
      return false;
    }).map(expense => {
      // For fixed expenses, adjust the due date to the selected month
      if (expense.isFixed && !isWithinInterval(new Date(expense.dueDate), { 
        start: startOfMonth(selectedMonth), 
        end: endOfMonth(selectedMonth) 
      })) {
        const originalDate = new Date(expense.dueDate);
        const adjustedDate = setYear(setMonth(originalDate, targetMonth), targetYear);
        return { ...expense, dueDate: adjustedDate };
      }
      return expense;
    });
  }, [expenses, selectedMonth]);

  const filteredInvestments = useMemo(() => {
    return investments.filter(investment => {
      const investmentDate = new Date(investment.date);
      const start = startOfMonth(selectedMonth);
      const end = endOfMonth(selectedMonth);
      return isWithinInterval(investmentDate, { start, end });
    });
  }, [investments, selectedMonth]);

  const addClient = useCallback(async (client: Omit<Client, 'id' | 'createdAt'>) => {
    if (!user) return;
    setIsMutating(true);
    try {
      // Inserir user_id e deixar o id ser gerado automaticamente
      const { error } = await supabase
        .from('clients')
        .insert([{ ...client, user_id: user.id }]);
      
      if (error) throw error;
      invalidateFinanceQueries();
    } finally {
      setIsMutating(false);
    }
  }, [invalidateFinanceQueries, user]);

  const removeClient = useCallback(async (id: string) => {
    setIsMutating(true);
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      invalidateFinanceQueries();
    } finally {
      setIsMutating(false);
    }
  }, [invalidateFinanceQueries]);

  const addIncome = useCallback(async (income: Omit<Income, 'id' | 'createdAt'>) => {
    if (!user) return;
    setIsMutating(true);
    try {
      // Usar o clientId selecionado no formulário (ID do cliente)
      const { error } = await supabase
        .from('incomes')
        .insert([{
          ...income,
          user_id: user.id, // CRITICAL FIX: Add user_id for RLS enforcement
          payment_date: income.paymentDate.toISOString(),
          client_id: income.clientId, // ID do cliente
        }]);
      
      if (error) throw error;
      invalidateFinanceQueries();
    } finally {
      setIsMutating(false);
    }
  }, [invalidateFinanceQueries, user]);

  const updateIncome = useCallback(async (id: string, updates: Partial<Omit<Income, 'id' | 'createdAt'>>) => {
    setIsMutating(true);
    try {
      const payload: Record<string, any> = { ...updates };
      if (updates.paymentDate) {
        payload.payment_date = updates.paymentDate.toISOString();
      }
      if (updates.clientId !== undefined) {
        payload.client_id = updates.clientId;
      }

      const { error } = await supabase
        .from('incomes')
        .update(payload)
        .eq('id', id);
      
      if (error) throw error;
      invalidateFinanceQueries();
    } finally {
      setIsMutating(false);
    }
  }, [invalidateFinanceQueries]);

  const removeIncome = useCallback(async (id: string) => {
    setIsMutating(true);
    try {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      invalidateFinanceQueries();
    } finally {
      setIsMutating(false);
    }
  }, [invalidateFinanceQueries]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'createdAt' | 'paymentSourceId'> & { paymentSourceId?: string | null }) => {
    if (!user) return;
    setIsMutating(true);
    try {
      // paymentSourceId é o ID do cliente ou null
      const finalPaymentSourceId = expense.paymentSourceId || null;

      const { error } = await supabase
        .from('expenses')
        .insert([{
          ...expense,
          user_id: user.id, // CRITICAL FIX: Add user_id for RLS enforcement
          due_date: expense.dueDate.toISOString(),
          payment_source_id: finalPaymentSourceId,
          is_fixed: expense.isFixed,
        }]);
      
      if (error) throw error;
      invalidateFinanceQueries();
    } finally {
      setIsMutating(false);
    }
  }, [invalidateFinanceQueries, user]);

  const updateExpense = useCallback(async (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt' | 'paymentSourceId'>> & { paymentSourceId?: string | null }) => {
    setIsMutating(true);
    try {
      const payload: Record<string, any> = { ...updates };
      if (updates.dueDate) {
        payload.due_date = updates.dueDate.toISOString();
      }
      if (updates.paymentSourceId !== undefined) {
        // Se o usuário removeu a fonte, definimos como null.
        payload.payment_source_id = updates.paymentSourceId || null;
      }
      if (updates.isFixed !== undefined) {
        payload.is_fixed = updates.isFixed;
      }

      const { error } = await supabase
        .from('expenses')
        .update(payload)
        .eq('id', id);
      
      if (error) throw error;
      invalidateFinanceQueries();
    } finally {
      setIsMutating(false);
    }
  }, [invalidateFinanceQueries]);

  const updateExpenseStatus = useCallback(async (id: string, status: PaymentStatus, paymentSourceId?: string | null) => {
    setIsMutating(true);
    try {
      // Ensure payment_source_id is null if undefined/empty string
      const finalPaymentSourceId = paymentSourceId || null;

      const { error } = await supabase
        .from('expenses')
        .update({ status, payment_source_id: finalPaymentSourceId })
        .eq('id', id);
      
      if (error) throw error;
      invalidateFinanceQueries();
    } finally {
      setIsMutating(false);
    }
  }, [invalidateFinanceQueries]);

  const removeExpense = useCallback(async (id: string) => {
    setIsMutating(true);
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      invalidateFinanceQueries();
    } finally {
      setIsMutating(false);
    }
  }, [invalidateFinanceQueries]);

  const addInvestment = useCallback(async (investment: Omit<Investment, 'id' | 'createdAt'>) => {
    if (!user) return;
    setIsMutating(true);
    try {
      // Inserir user_id e deixar o id ser gerado automaticamente
      const { error } = await supabase
        .from('investments')
        .insert([{
          ...investment,
          user_id: user.id, // Adicionando user_id
          date: investment.date.toISOString(),
        }]);
      
      if (error) throw error;
      invalidateFinanceQueries();
    } finally {
      setIsMutating(false);
    }
  }, [invalidateFinanceQueries, user]);

  const removeInvestment = useCallback(async (id: string) => {
    setIsMutating(true);
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      invalidateFinanceQueries();
    } finally {
      setIsMutating(false);
    }
  }, [invalidateFinanceQueries]);

  const getClientById = useCallback((id: string) => {
    return clients.find(c => c.id === id);
  }, [clients]);

  const calculateSummary = useCallback((type?: 'business' | 'personal'): FinancialSummary => {
    const typeFilteredExpenses = type 
      ? filteredExpenses.filter(e => e.type === type)
      : filteredExpenses;

    const totalIncome = type === 'personal' ? 0 : filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = typeFilteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalInvestments = type === 'personal' ? 0 : filteredInvestments.reduce((sum, i) => sum + i.amount, 0);
    
    const paidExpenses = typeFilteredExpenses
      .filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const unpaidExpenses = typeFilteredExpenses
      .filter(e => e.status === 'unpaid')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const savedExpenses = typeFilteredExpenses
      .filter(e => e.status === 'saved')
      .reduce((sum, e) => sum + e.amount, 0);

    // Calculate expenses by payment source
    const expensesBySource: Record<string, number> = {};
    typeFilteredExpenses.forEach(e => {
      if (e.paymentSourceId) {
        expensesBySource[e.paymentSourceId] = (expensesBySource[e.paymentSourceId] || 0) + e.amount;
      }
    });

    // Saques são despesas empresariais com categoria "Saque"
    const totalWithdrawals = filteredExpenses
      .filter(e => e.type === 'business' && e.category === 'Saque' && e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0);

    // Despesas empresariais SEM contar os saques
    const businessExpensesWithoutWithdrawals = filteredExpenses
      .filter(e => e.type === 'business' && e.category !== 'Saque')
      .reduce((sum, e) => sum + e.amount, 0);
    
    // Despesas pessoais pagas
    const personalPaidExpenses = filteredExpenses
      .filter(e => e.type === 'personal' && e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0);

    // Caixa empresa = Receita - Despesas empresa (incluindo saques) - Investimentos
    const businessBalance = totalIncome - businessExpensesWithoutWithdrawals - totalWithdrawals - totalInvestments;
    
    // Disponível pessoal = Saques - Despesas pessoais pagas
    const personalBalance = totalWithdrawals - personalPaidExpenses;

    return {
      totalIncome,
      totalExpenses,
      totalInvestments,
      paidExpenses,
      unpaidExpenses,
      savedExpenses,
      availableBalance: totalIncome - paidExpenses - totalInvestments,
      businessBalance,
      personalBalance,
      totalWithdrawals,
      personalPaidExpenses,
      expensesBySource,
    };
  }, [filteredIncomes, filteredExpenses, filteredInvestments]);

  const getBusinessSummary = useCallback(() => calculateSummary('business'), [calculateSummary]);
  const getPersonalSummary = useCallback(() => calculateSummary('personal'), [calculateSummary]);
  const getTotalSummary = useCallback(() => calculateSummary(), [calculateSummary]);

  return (
    <FinanceContext.Provider value={{
      clients,
      incomes,
      expenses,
      investments,
      filteredIncomes,
      filteredExpenses,
      filteredInvestments,
      selectedMonth,
      setSelectedMonth,
      meiLimits, // Expose meiLimits
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
      getBusinessSummary,
      getPersonalSummary,
      getTotalSummary,
      getClientById,
      isLoading,
      isMutating,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}