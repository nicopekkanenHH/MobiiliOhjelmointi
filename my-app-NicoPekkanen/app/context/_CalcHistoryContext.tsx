import React, { createContext, useCallback, useContext, useState } from 'react';

export type Op = '+' | '-';
export interface CalcRow {
  id: string;
  expr: string;
  result: string;
}

type Ctx = {
  history: CalcRow[];
  add: (expr: string, result: string) => void;
  clear: () => void;
};

const CalcHistoryContext = createContext<Ctx | undefined>(undefined);

export function CalcHistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<CalcRow[]>([]);

  const add = useCallback((expr: string, result: string) => {
    setHistory(h => [{ id: `${Date.now()}-${Math.random()}`, expr, result }, ...h]);
  }, []);

  const clear = useCallback(() => setHistory([]), []);

  return (
    <CalcHistoryContext.Provider value={{ history, add, clear }}>
      {children}
    </CalcHistoryContext.Provider>
  );
}

export function useCalcHistory() {
  const ctx = useContext(CalcHistoryContext);
  if (!ctx) throw new Error('useCalcHistory must be used within CalcHistoryProvider');
  return ctx;
}

export default function _ContextNoRoute() {
  return null;
}