"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Funktionales Programmieren: Reine Typen für das Transaktionssystem
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

// Funktionales Programmieren: Reine Funktion für Standard-Guthaben
const getDefaultBalance = (): number => 1000;

// Funktionales Programmieren: Reine Funktion zum Speichern des Guthabens in localStorage
const saveBalance = (balance: number): void => {
  try {
    localStorage.setItem('casinoBalance', balance.toString());
  } catch (error) {
    console.warn('Failed to save balance to localStorage:', error);
  }
};

// Funktionales Programmieren: Reine Funktion zum Laden des Guthabens aus localStorage
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

// Funktionales Programmieren: Reine Funktionen für Transaktionsverwaltung
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

// Funktionales Programmieren: Reine Funktion zur Generierung von Transaktions-IDs
const generateTransactionId = (): string => {
  return `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Funktionales Programmieren: Höhere Funktion für Guthaben-Operationen
const createBalanceUpdater = (operation: (current: number, amount: number) => number) => 
  (currentBalance: number, amount: number): number => {
    const newBalance = operation(currentBalance, amount);
    return Math.max(0, newBalance);
  };

// Funktionales Programmieren: Reine Funktionen für Guthaben-Operationen
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

  // Funktionales Programmieren: Effekt zum Laden von anfänglichem Guthaben und Transaktionen
  useEffect(() => {
    const initialBalance = loadBalance();
    const initialTransactions = loadTransactions();
    setBalanceState(initialBalance);
    setTransactions(initialTransactions);
    setIsLoaded(true);
  }, []);

  // Funktionales Programmieren: Effekt zum Speichern von Guthaben-Änderungen
  useEffect(() => {
    if (isLoaded) {
      saveBalance(balance);
    }
  }, [balance, isLoaded]);

  // Funktionales Programmieren: Effekt zum Speichern von Transaktions-Änderungen
  useEffect(() => {
    if (isLoaded) {
      saveTransactions(transactions);
    }
  }, [transactions, isLoaded]);

  // Funktionales Programmieren: Reine Funktions-Wrapper zum Setzen des Guthabens
  const setBalance = (newBalance: number): void => {
    const sanitizedBalance = Math.max(0, newBalance);
    setBalanceState(sanitizedBalance);
  };

  // Funktionales Programmieren: Verwendung der höheren Funktion zum Hinzufügen zum Guthaben
  const addToBalance = (amount: number): void => {
    const addUpdater = createBalanceUpdater(addOperation);
    const newBalance = addUpdater(balance, Math.abs(amount));
    setBalanceState(newBalance);
  };

  // Funktionales Programmieren: Verwendung der höheren Funktion zum Abziehen vom Guthaben
  const subtractFromBalance = (amount: number): boolean => {
    const positiveAmount = Math.abs(amount);
    if (balance >= positiveAmount) {
      const subtractUpdater = createBalanceUpdater(subtractOperation);
      const newBalance = subtractUpdater(balance, positiveAmount);
      setBalanceState(newBalance);
      return true;
    }
    return false;
  };

  // Funktionales Programmieren: Reine Funktion zum Zurücksetzen des Guthabens
  const resetBalance = (): void => {
    const defaultBalance = getDefaultBalance();
    setBalanceState(defaultBalance);
  };

  // Funktionales Programmieren: Reine Funktion zum Hinzufügen von Transaktionen
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

  // Funktionales Programmieren: Einzahlungsmethode mit Transaktionsverfolgung
  const cashIn = (amount: number): void => {
    const positiveAmount = Math.abs(amount);
    addToBalance(positiveAmount);
    addTransaction('cash-in', positiveAmount, `Cash In: $${positiveAmount.toLocaleString()}`);
  };

  // Funktionales Programmieren: Auszahlungsmethode mit Transaktionsverfolgung
  const cashOut = (amount: number): boolean => {
    const positiveAmount = Math.abs(amount);
    if (subtractFromBalance(positiveAmount)) {
      addTransaction('cash-out', positiveAmount, `Cash Out: $${positiveAmount.toLocaleString()}`);
      return true;
    }
    return false;
  };

  // Funktionales Programmieren: Reine Funktion zum Filtern von Transaktionen nach Datum
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

// Funktionales Programmieren: Benutzerdefinierter Hook mit Fehlerbehandlung
export const useBalance = (): BalanceContextType => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};
