"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Functional Programming: Pure types for transaction system
interface Transaction {
  id: string;
  type: 'cash-in' | 'cash-out' | 'game-win' | 'game-loss' | 'entry-fee';
  amount: number;
  timestamp: Date;
  description: string;
}

interface BalanceContextType {
  balance: number;
  transactions: Transaction[];
  setBalance: (balance: number) => void;
  addToBalance: (amount: number) => void;
  subtractFromBalance: (amount: number) => boolean;
  resetBalance: () => void;
  cashIn: (amount: number) => void;
  cashOut: (amount: number) => boolean;
  addTransaction: (type: Transaction['type'], amount: number, description: string) => void;
  getTransactionHistory: (days?: number) => Transaction[];
}

// Functional Programming: Pure function to get default balance
const getDefaultBalance = (): number => 1000;

// Functional Programming: Pure function to save balance to localStorage
const saveBalance = (balance: number): void => {
  try {
    localStorage.setItem('casinoBalance', balance.toString());
  } catch (error) {
    console.warn('Failed to save balance to localStorage:', error);
  }
};

// Functional Programming: Pure function to load balance from localStorage
const loadBalance = (): number => {
  try {
    const saved = localStorage.getItem('casinoBalance');
    if (saved) {
      const parsed = parseInt(saved, 10);
      return isNaN(parsed) ? getDefaultBalance() : Math.max(0, parsed);
    }
  } catch (error) {
    console.warn('Failed to load balance from localStorage:', error);
  }
  return getDefaultBalance();
};

// Functional Programming: Pure functions for transaction management
const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem('casinoTransactions', JSON.stringify(transactions));
  } catch (error) {
    console.warn('Failed to save transactions to localStorage:', error);
  }
};

const loadTransactions = (): Transaction[] => {
  try {
    const saved = localStorage.getItem('casinoTransactions');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) }));
    }
  } catch (error) {
    console.warn('Failed to load transactions from localStorage:', error);
  }
  return [];
};

// Functional Programming: Pure function to generate transaction ID
const generateTransactionId = (): string => {
  return `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Functional Programming: Higher-order function for balance operations
const createBalanceUpdater = (operation: (current: number, amount: number) => number) => 
  (currentBalance: number, amount: number): number => {
    const newBalance = operation(currentBalance, amount);
    return Math.max(0, newBalance); // Ensure balance never goes negative
  };

// Functional Programming: Pure functions for balance operations
const addOperation = (current: number, amount: number): number => current + amount;
const subtractOperation = (current: number, amount: number): number => current - amount;

const BalanceContext = createContext<BalanceContextType>({
  balance: getDefaultBalance(),
  transactions: [],
  setBalance: () => {},
  addToBalance: () => {},
  subtractFromBalance: () => false,
  resetBalance: () => {},
  cashIn: () => {},
  cashOut: () => false,
  addTransaction: () => {},
  getTransactionHistory: () => [],
});

export const BalanceProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalanceState] = useState<number>(getDefaultBalance());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Functional Programming: Effect for loading initial balance and transactions
  useEffect(() => {
    const initialBalance = loadBalance();
    const initialTransactions = loadTransactions();
    setBalanceState(initialBalance);
    setTransactions(initialTransactions);
    setIsLoaded(true);
  }, []);

  // Functional Programming: Effect for saving balance changes
  useEffect(() => {
    if (isLoaded) {
      saveBalance(balance);
    }
  }, [balance, isLoaded]);

  // Functional Programming: Effect for saving transaction changes
  useEffect(() => {
    if (isLoaded) {
      saveTransactions(transactions);
    }
  }, [transactions, isLoaded]);

  // Functional Programming: Pure function wrapper for setting balance
  const setBalance = (newBalance: number): void => {
    const sanitizedBalance = Math.max(0, newBalance);
    setBalanceState(sanitizedBalance);
  };

  // Functional Programming: Using the higher-order function for adding to balance
  const addToBalance = (amount: number): void => {
    const addUpdater = createBalanceUpdater(addOperation);
    const newBalance = addUpdater(balance, Math.abs(amount)); // Ensure positive amount
    setBalanceState(newBalance);
  };

  // Functional Programming: Using the higher-order function for subtracting from balance
  const subtractFromBalance = (amount: number): boolean => {
    const positiveAmount = Math.abs(amount);
    if (balance >= positiveAmount) {
      const subtractUpdater = createBalanceUpdater(subtractOperation);
      const newBalance = subtractUpdater(balance, positiveAmount);
      setBalanceState(newBalance);
      return true;
    }
    return false; // Insufficient funds
  };

  // Functional Programming: Pure function to reset balance
  const resetBalance = (): void => {
    const defaultBalance = getDefaultBalance();
    setBalanceState(defaultBalance);
  };

  // Functional Programming: Pure function to add transaction
  const addTransaction = (type: Transaction['type'], amount: number, description: string): void => {
    const newTransaction: Transaction = {
      id: generateTransactionId(),
      type,
      amount,
      timestamp: new Date(),
      description
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  // Functional Programming: Cash in method with transaction tracking
  const cashIn = (amount: number): void => {
    const positiveAmount = Math.abs(amount);
    addToBalance(positiveAmount);
    addTransaction('cash-in', positiveAmount, `Cash In: $${positiveAmount.toLocaleString()}`);
  };

  // Functional Programming: Cash out method with transaction tracking
  const cashOut = (amount: number): boolean => {
    const positiveAmount = Math.abs(amount);
    if (subtractFromBalance(positiveAmount)) {
      addTransaction('cash-out', positiveAmount, `Cash Out: $${positiveAmount.toLocaleString()}`);
      return true;
    }
    return false;
  };

  // Functional Programming: Pure function to filter transactions by date
  const getTransactionHistory = (days?: number): Transaction[] => {
    if (!days) return transactions;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return transactions.filter(t => t.timestamp >= cutoffDate);
  };

  const contextValue: BalanceContextType = {
    balance,
    transactions,
    setBalance,
    addToBalance,
    subtractFromBalance,
    resetBalance,
    cashIn,
    cashOut,
    addTransaction,
    getTransactionHistory,
  };

  return (
    <BalanceContext.Provider value={contextValue}>
      {children}
    </BalanceContext.Provider>
  );
};

// Functional Programming: Custom hook with error handling
export const useBalance = (): BalanceContextType => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};
