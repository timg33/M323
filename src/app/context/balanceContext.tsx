"use client";

import { createContext, useContext, useState } from "react";

interface BalanceContextType {
  balance: number;
  setBalance: (balance: number) => void;
}

const BalanceContext = createContext<BalanceContextType>({
  balance: 1000,
  setBalance: () => {},
});

export const BalanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [balance, setBalance] = useState(1000);
  return (
    <BalanceContext.Provider value={{ balance, setBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => useContext(BalanceContext);
