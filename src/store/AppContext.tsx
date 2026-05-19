import React, { createContext, useContext, useState, useCallback } from 'react';
import type { RawMemory, InsightMemory, DimensionView } from '../types';
import { rawMemories as defaultRawMemories, insightMemories as defaultInsightMemories } from '../data/demoData';

interface AppState {
  currentView: DimensionView;
  selectedMemory: RawMemory | InsightMemory | null;
  focusedInsight: InsightMemory | null;
  demoMode: boolean;
  demoStep: number;
  chatOpen: boolean;
  detailOpen: boolean;
  navCategory: string | null;
  navSubCategory: string | null;
  crudOpen: boolean;
}

interface AppContextType extends AppState {
  setCurrentView: (view: DimensionView) => void;
  selectMemory: (mem: RawMemory | InsightMemory | null) => void;
  focusInsight: (insight: InsightMemory | null) => void;
  setDemoMode: (on: boolean) => void;
  setDemoStep: (step: number) => void;
  toggleChat: () => void;
  toggleDetail: () => void;
  toggleCrud: () => void;
  setNavCategory: (cat: string | null) => void;
  setNavSubCategory: (sub: string | null) => void;
  rawMemories: RawMemory[];
  insightMemories: InsightMemory[];
  addMemory: (mem: RawMemory) => void;
  deleteMemory: (id: string) => void;
  getVisibleMemories: () => RawMemory[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentView: '全局视图',
    selectedMemory: null,
    focusedInsight: null,
    demoMode: false,
    demoStep: 0,
    chatOpen: false,
    detailOpen: false,
    navCategory: null,
    navSubCategory: null,
    crudOpen: false,
  });

  const [rawMems, setRawMems] = useState<RawMemory[]>(defaultRawMemories);

  const setCurrentView = useCallback((view: DimensionView) => setState(s => ({ ...s, currentView: view })), []);
  const selectMemory = useCallback((mem: RawMemory | InsightMemory | null) =>
    setState(s => ({ ...s, selectedMemory: mem, detailOpen: !!mem })), []);
  const focusInsight = useCallback((insight: InsightMemory | null) =>
    setState(s => ({ ...s, focusedInsight: insight })), []);
  const setDemoMode = useCallback((on: boolean) => setState(s => ({ ...s, demoMode: on, demoStep: on ? 1 : 0 })), []);
  const setDemoStep = useCallback((step: number) => setState(s => ({ ...s, demoStep: step })), []);
  const toggleChat = useCallback(() => setState(s => ({ ...s, chatOpen: !s.chatOpen })), []);
  const toggleDetail = useCallback(() => setState(s => ({ ...s, detailOpen: !s.detailOpen })), []);
  const toggleCrud = useCallback(() => setState(s => ({ ...s, crudOpen: !s.crudOpen })), []);
  const setNavCategory = useCallback((cat: string | null) => setState(s => ({ ...s, navCategory: cat })), []);
  const setNavSubCategory = useCallback((sub: string | null) => setState(s => ({ ...s, navSubCategory: sub })), []);

  const addMemory = useCallback((mem: RawMemory) => {
    setRawMems(prev => [...prev, mem]);
  }, []);

  const deleteMemory = useCallback((id: string) => {
    setRawMems(prev => prev.filter(m => m.id !== id));
    setState(s => s.selectedMemory?.id === id ? { ...s, selectedMemory: null, detailOpen: false } : s);
  }, []);

  const getVisibleMemories = useCallback(() => rawMems, [rawMems]);

  return (
    <AppContext.Provider value={{
      ...state,
      setCurrentView, selectMemory, focusInsight, setDemoMode, setDemoStep,
      toggleChat, toggleDetail, toggleCrud, setNavCategory, setNavSubCategory,
      rawMemories: rawMems, insightMemories: defaultInsightMemories,
      addMemory, deleteMemory, getVisibleMemories,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}