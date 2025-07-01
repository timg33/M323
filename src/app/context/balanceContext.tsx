"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface BalanceContextType {
  balance: number;
  setBalance: (balance: number) => void;
  addToBalance: (amount: number) => void;
  subtractFromBalance: (amount: number) => boolean;
  resetBalance: () => void;
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
  setBalance: () => {},
  addToBalance: () => {},
  subtractFromBalance: () => false,
  resetBalance: () => {},
});

export const BalanceProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalanceState] = useState<number>(getDefaultBalance());
  const [isLoaded, setIsLoaded] = useState(false);

  // Functional Programming: Effect for loading initial balance
  useEffect(() => {
    const initialBalance = loadBalance();
    setBalanceState(initialBalance);
    setIsLoaded(true);
  }, []);

  // Functional Programming: Effect for saving balance changes
  useEffect(() => {
    if (isLoaded) {
      saveBalance(balance);
    }
  }, [balance, isLoaded]);

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

  const contextValue: BalanceContextType = {
    balance,
    setBalance,
    addToBalance,
    subtractFromBalance,
    resetBalance,
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
