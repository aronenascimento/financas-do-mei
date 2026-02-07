import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Client, Income, Expense, Investment, FinancialSummary, PaymentStatus } from '@/types/finance';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { startOfMonth, endOfMonth, isWithinInterval, setMonth, setYear, getMonth, getYear, addMonths, isSameMonth, isSameYear, parseISO } from 'date-fns';

interface FinanceContextType {
  clients: Client[];
  incomes: Income[];
  expenses: Expense[];
  investments: Investment[];
  filteredIncomes: Income[];
  filteredExpenses: Expense[];
  filteredInvestments: Investment[];
  selectedMonth: Date;
  loading: boolean;
  setSelectedMonth: (date: Date) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  removeClient: (id: string) => void;
  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => void;
  updateIncome: (id: string, income: Partial<Omit<Income, 'id' | 'createdAt'>>) => void;
  removeIncome: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
  updateExpenseStatus: (id: string, status: PaymentStatus, paymentSourceId?: string) => void;
  removeExpense: (id: string) => void;
  addInvestment: (investment: Omit<Investment, 'id' | 'createdAt'>) => void;
  removeInvestment: (id: string) => void;
  getBusinessSummary: () => FinancialSummary;
  getPersonalSummary: () => FinancialSummary;
  getTotalSummary: () => FinancialSummary;
  getClientById: (id: string) => Client | undefined;
  createFixedExpenseCopies: (originalExpense: Expense, monthsAhead: number) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Helper function to check if a date is within a month
const isInMonth = (date: Date, monthDate: Date): boolean => {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  return isWithinInterval(new Date(date), { start, end });
};

// Helper function to find fixed expenses that should be copied to current month
const findFixedExpensesToCopy = (expenses: Expense[], targetMonth: Date): Expense[] => {
  const targetMonthStart = startOfMonth(targetMonth);
  const targetMonthEnd = endOfMonth(targetMonth);
  
  return expenses.filter(expense => {
    // Only consider fixed expenses from previous months
    const expenseDate = new Date(expense.dueDate);
    const expenseMonthStart = startOfMonth(expenseDate);
    const expenseMonthEnd = endOfMonth(expenseDate);
    
    // Check if this is a fixed expense from a previous month
    if (!expense.isFixed || !isWithinInterval(expenseMonthStart, { start: expenseMonthStart, end: expenseMonthEnd })) {
      return false;
    }
    
    // Check if we already have a copy of this expense in the target month
    const existingCopy = expenses.some(existing => 
      existing.isFixed && 
      existing.category === expense.category && 
      existing.description === expense.description &&
      isInMonth(existing.dueDate, targetMonth)
    );
    
    return !existingCopy;
  });
};

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  
  const {
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
  } = useSupabaseData();

  // Function to create copies of fixed expenses for future months
  const createFixedExpenseCopies = useCallback((originalExpense: Expense, monthsAhead: number) => {
    const copies: Expense[] = [];
    
    for (let i = 1; i <= monthsAhead; i++) {
      const copyDate = addMonths(new Date(originalExpense.dueDate), i);
      
      const copy: Expense = {
        ...originalExpense,
        id: `${originalExpense.id}_copy_${i}`, // Generate unique ID for each copy
        dueDate: copyDate,
        createdAt: new Date(),
        // Reset status for new copies
        status: 'unpaid',
        paymentSourceId: undefined,
      };
      
      copies.push(copy);
    }
    
    // Add all copies at once
    copies.forEach(copy => addExpense(copy));
  }, [addExpense]);

  // Filtered data by selected month
  const filteredIncomes = useMemo(() => {
    return incomes.filter(income => isInMonth(income.paymentDate, selectedMonth));
  }, [incomes, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    // First get expenses for the current month
    let monthExpenses = expenses.filter(expense => isInMonth(expense.dueDate, selectedMonth));
    
    // Check if we need to create copies of fixed expenses
    const fixedExpensesToCopy = findFixedExpensesToCopy(expenses, selectedMonth);
    
    if (fixedExpensesToCopy.length > 0) {
      // For development/demo purposes, we'll just show the existing expenses
      // In a real app, you might want to automatically create these copies
      // For now, we'll just log what would be copied
      console.log(`Would copy ${fixedExpensesToCopy.length} fixed expenses to ${selectedMonth.toLocaleDateString()}`);
    }
    
    return monthExpenses;
  }, [expenses, selectedMonth]);

  const filteredInvestments = useMemo(() => {
    return investments.filter(investment => isInMonth(investment.date, selectedMonth));
  }, [investments, selectedMonth]);

  const getClientById = useCallback((id: string) => {
    return clients.find(c => c.id === id);
  }, [clients]);

  const calculateSummary = useCallback((type?: 'business' | 'personal'): FinancialSummary => {
    const today = new Date();
    const typeFilteredExpenses = type 
      ? filteredExpenses.filter(e => e.type === type)
      : filteredExpenses;

    // Total recebido: apenas receitas com data de pagamento <= hoje
    const totalIncome = type === 'personal' ? 0 : filteredIncomes
      .filter(i => new Date(i.paymentDate) <= today)
      .reduce((sum, i) => sum + i.amount, 0);
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

    // Despesas empresariais PAGAS SEM contar os saques
    const businessExpensesWithoutWithdrawals = filteredExpenses
      .filter(e => e.type === 'business' && e.category !== 'Saque' && e.status === 'paid')
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
      loading,
      setSelectedMonth,
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
      createFixedExpenseCopies,
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