import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { RawMemory, InsightMemory, DimensionView } from '../types';
import { rawMemories as defaultRawMemories, insightMemories as defaultInsightMemories } from '../data/demoData';
import { chatgptRawMemories, chatgptInsightMemories } from '../data/chatgptData';
import { isMemoryInCategory } from '../utils/navUtils';

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
  theme: 'dark' | 'light';
  memoryBankOpen: boolean;
  valueDashboardOpen: boolean;
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
  toggleTheme: () => void;
  toggleMemoryBank: () => void;
  toggleValueDashboard: () => void;
  setNavCategory: (cat: string | null) => void;
  setNavSubCategory: (sub: string | null) => void;
  rawMemories: RawMemory[];
  insightMemories: InsightMemory[];
  addMemory: (mem: RawMemory) => void;
  deleteMemory: (id: string) => void;
  updateMemory: (id: string, updates: Partial<RawMemory>) => void;
  updateInsight: (id: string, updates: Partial<InsightMemory>) => void;
  importMemories: (raws: RawMemory[], insights: InsightMemory[]) => void;
  undoDelete: () => void;
  undoStackCount: number;
  getVisibleMemories: () => RawMemory[];
  hideRawOnly: boolean;
  hideInsightOnly: boolean;
  toggleHideRaw: () => void;
  toggleHideInsight: () => void;
  showChatGPT: boolean;
  toggleShowChatGPT: () => void;
  chatgptImportStatus: 'idle' | 'importing' | 'done';
  chatgptImportProgress: number;
  startChatGPTImport: () => void;
  hiddenMemoryIds: string[];
  allRawMemories: RawMemory[];
  toggleMemoryVisibility: (id: string) => void;
  toggleAllMemories: () => void;
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
    theme: 'light',
    memoryBankOpen: false,
    valueDashboardOpen: false,
  });

  const [rawMems, setRawMems] = useState<RawMemory[]>(() => {
    try {
      const saved = localStorage.getItem('graphme-rawMemories');
      return saved ? JSON.parse(saved) : defaultRawMemories;
    } catch { return defaultRawMemories; }
  });
  const [insightMems, setInsightMems] = useState<InsightMemory[]>(() => {
    try {
      const saved = localStorage.getItem('graphme-insightMemories');
      return saved ? JSON.parse(saved) : defaultInsightMemories;
    } catch { return defaultInsightMemories; }
  });
  const [hideRawOnly, setHideRawOnly] = useState(false);
  const [hideInsightOnly, setHideInsightOnly] = useState(false);
  const [showChatGPT, setShowChatGPT] = useState(false);
  const [chatgptImportStatus, setChatgptImportStatus] = useState<'idle' | 'importing' | 'done'>('idle');
  const [chatgptImportProgress, setChatgptImportProgress] = useState(0);
  const [hiddenMemoryIds, setHiddenMemoryIds] = useState<string[]>([]);
  const [undoStack, setUndoStack] = useState<RawMemory[]>([]);
  const importIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (importIntervalRef.current) clearInterval(importIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem('graphme-rawMemories', JSON.stringify(rawMems)); } catch {}
  }, [rawMems]);

  useEffect(() => {
    try { localStorage.setItem('graphme-insightMemories', JSON.stringify(insightMems)); } catch {}
  }, [insightMems]);

  const setCurrentView = useCallback((view: DimensionView) => setState(s => ({ ...s, currentView: view })), []);
  const selectMemory = useCallback((mem: RawMemory | InsightMemory | null) =>
    setState(s => ({ ...s, selectedMemory: mem, detailOpen: !!mem })), []);
  const focusInsight = useCallback((insight: InsightMemory | null) =>
    setState(s => ({ ...s, focusedInsight: insight })), []);
  const setDemoMode = useCallback((on: boolean) => setState(s => ({ ...s, demoMode: on, demoStep: on ? 1 : 0 })), []);
  const setDemoStep = useCallback((step: number) => setState(s => ({ ...s, demoStep: step })), []);
  const toggleChat = useCallback(() => setState(s => ({
    ...s,
    chatOpen: !s.chatOpen,
    memoryBankOpen: !s.chatOpen ? false : s.memoryBankOpen,
    valueDashboardOpen: !s.chatOpen ? false : s.valueDashboardOpen,
  })), []);
  const toggleDetail = useCallback(() => setState(s => ({
    ...s,
    detailOpen: !s.detailOpen,
    selectedMemory: s.detailOpen ? null : s.selectedMemory,
  })), []);
  const toggleCrud = useCallback(() => setState(s => ({ ...s, crudOpen: !s.crudOpen })), []);
  const toggleTheme = useCallback(() => setState(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' })), []);
  const toggleMemoryBank = useCallback(() => setState(s => ({
    ...s,
    memoryBankOpen: !s.memoryBankOpen,
    chatOpen: !s.memoryBankOpen ? false : s.chatOpen,
    valueDashboardOpen: !s.memoryBankOpen ? false : s.valueDashboardOpen,
  })), []);

  const toggleValueDashboard = useCallback(() => setState(s => ({
    ...s,
    valueDashboardOpen: !s.valueDashboardOpen,
    chatOpen: !s.valueDashboardOpen ? false : s.chatOpen,
    memoryBankOpen: !s.valueDashboardOpen ? false : s.memoryBankOpen,
  })), []);
  const setNavCategory = useCallback((cat: string | null) => setState(s => ({ ...s, navCategory: cat })), []);
  const setNavSubCategory = useCallback((sub: string | null) => setState(s => ({ ...s, navSubCategory: sub })), []);

  const addMemory = useCallback((mem: RawMemory) => {
    setRawMems(prev => [...prev, mem]);
  }, []);

  const deleteMemory = useCallback((id: string) => {
    setRawMems(prev => {
      const deleted = prev.find(m => m.id === id);
      if (deleted) setUndoStack(stack => [deleted, ...stack].slice(0, 5));
      return prev.filter(m => m.id !== id);
    });
    setState(s => s.selectedMemory?.id === id ? { ...s, selectedMemory: null, detailOpen: false } : s);
  }, []);

  const undoDelete = useCallback(() => {
    setUndoStack(stack => {
      if (stack.length === 0) return stack;
      const [restored, ...rest] = stack;
      setRawMems(prev => [...prev, restored]);
      return rest;
    });
  }, []);

  const updateMemory = useCallback((id: string, updates: Partial<RawMemory>) => {
    setRawMems(prev => prev.map(m => {
      if (m.id !== id) return m;
      const merged = { ...m, ...updates };
      if (updates.dimensions && m.dimensions) {
        merged.dimensions = { ...m.dimensions, ...updates.dimensions };
      }
      return merged;
    }));
  }, []);

  const updateInsight = useCallback((id: string, updates: Partial<InsightMemory>) => {
    setInsightMems(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const importMemories = useCallback((raws: RawMemory[], insights: InsightMemory[]) => {
    if (raws.length > 0) setRawMems(prev => [...prev, ...raws]);
    if (insights.length > 0) setInsightMems(prev => [...prev, ...insights]);
  }, []);

  const toggleHideRaw = useCallback(() => setHideRawOnly(prev => !prev), []);
  const toggleHideInsight = useCallback(() => setHideInsightOnly(prev => !prev), []);
  const toggleShowChatGPT = useCallback(() => setShowChatGPT(prev => !prev), []);

  const startChatGPTImport = useCallback(() => {
    if (chatgptImportStatus !== 'idle') return;
    setChatgptImportStatus('importing');
    setChatgptImportProgress(0);
    const interval = setInterval(() => {
      setChatgptImportProgress(prev => {
        const next = prev + 4;
        if (next >= 100) {
          clearInterval(interval);
          importIntervalRef.current = null;
          setChatgptImportStatus('done');
          setShowChatGPT(true);
          return 100;
        }
        return next;
      });
    }, 80);
    importIntervalRef.current = interval;
  }, [chatgptImportStatus]);

  const toggleMemoryVisibility = useCallback((id: string) => {
    setHiddenMemoryIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const toggleAllMemories = useCallback(() => {
    setHiddenMemoryIds(prev => {
      if (prev.length === 0) {
        return defaultRawMemories.map(m => m.id);
      }
      return [];
    });
  }, []);

  const navCategory = state.navCategory;
  const navSubCategory = state.navSubCategory;

  const mergedRawMemories = useMemo(() =>
    showChatGPT ? [...rawMems, ...chatgptRawMemories] : rawMems,
  [rawMems, showChatGPT]);

  const allRawMemories = mergedRawMemories;

  const visibleRawMemories = useMemo(() =>
    hiddenMemoryIds.length === 0
      ? mergedRawMemories
      : mergedRawMemories.filter(m => !hiddenMemoryIds.includes(m.id)),
  [mergedRawMemories, hiddenMemoryIds]);

  const mergedInsightMemories = useMemo(() =>
    showChatGPT ? [...insightMems, ...chatgptInsightMemories] : insightMems,
  [insightMems, showChatGPT]);

  const getVisibleMemories = useCallback(() => {
    if (!navCategory) return visibleRawMemories;
    return visibleRawMemories.filter(m => isMemoryInCategory(m, navCategory, navSubCategory));
  }, [visibleRawMemories, navCategory, navSubCategory]);

  return (
    <AppContext.Provider value={{
      ...state,
      setCurrentView, selectMemory, focusInsight, setDemoMode, setDemoStep,
      toggleChat, toggleDetail, toggleCrud, toggleTheme, toggleMemoryBank, toggleValueDashboard, setNavCategory, setNavSubCategory,
      rawMemories: visibleRawMemories, insightMemories: mergedInsightMemories,
      addMemory, deleteMemory, updateMemory, updateInsight, importMemories, undoDelete, undoStackCount: undoStack.length, getVisibleMemories,
      hideRawOnly, hideInsightOnly, toggleHideRaw, toggleHideInsight,
      showChatGPT, toggleShowChatGPT,
      chatgptImportStatus, chatgptImportProgress, startChatGPTImport,
      hiddenMemoryIds, allRawMemories, toggleMemoryVisibility, toggleAllMemories,
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