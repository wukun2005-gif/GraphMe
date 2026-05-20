import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { RawMemory, InsightMemory, DimensionView } from '../types';
import { rawMemories as defaultRawMemories, insightMemories as defaultInsightMemories } from '../data/demoData';
import { chatgptRawMemories, chatgptInsightMemories } from '../data/chatgptData';

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
  setNavCategory: (cat: string | null) => void;
  setNavSubCategory: (sub: string | null) => void;
  rawMemories: RawMemory[];
  insightMemories: InsightMemory[];
  addMemory: (mem: RawMemory) => void;
  deleteMemory: (id: string) => void;
  updateMemory: (id: string, updates: Partial<RawMemory>) => void;
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
    theme: 'dark',
  });

  const [rawMems, setRawMems] = useState<RawMemory[]>(defaultRawMemories);
  const [hideRawOnly, setHideRawOnly] = useState(false);
  const [hideInsightOnly, setHideInsightOnly] = useState(false);
  const [showChatGPT, setShowChatGPT] = useState(false);
  const [chatgptImportStatus, setChatgptImportStatus] = useState<'idle' | 'importing' | 'done'>('idle');
  const [chatgptImportProgress, setChatgptImportProgress] = useState(0);
  const [hiddenMemoryIds, setHiddenMemoryIds] = useState<string[]>([]);

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
  const toggleTheme = useCallback(() => setState(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' })), []);
  const setNavCategory = useCallback((cat: string | null) => setState(s => ({ ...s, navCategory: cat })), []);
  const setNavSubCategory = useCallback((sub: string | null) => setState(s => ({ ...s, navSubCategory: sub })), []);

  const addMemory = useCallback((mem: RawMemory) => {
    setRawMems(prev => [...prev, mem]);
  }, []);

  const deleteMemory = useCallback((id: string) => {
    setRawMems(prev => prev.filter(m => m.id !== id));
    setState(s => s.selectedMemory?.id === id ? { ...s, selectedMemory: null, detailOpen: false } : s);
  }, []);

  const updateMemory = useCallback((id: string, updates: Partial<RawMemory>) => {
    setRawMems(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
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
          setChatgptImportStatus('done');
          setShowChatGPT(true);
          return 100;
        }
        return next;
      });
    }, 80);
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
    showChatGPT ? [...defaultInsightMemories, ...chatgptInsightMemories] : defaultInsightMemories,
  [showChatGPT]);

  const getVisibleMemories = useCallback(() => {
    const navMap: Record<string, string[]> = {
      '家庭生活': ['家', '客厅', '卧室', '厨房', '阳台', '花园'],
      '学习与成长': ['学校', '书房', '教室', '图书馆'],
      '社交与情感': ['公园', '商场', '游乐场'],
      '兴趣与探索': ['公园', '游乐场', '其他'],
    };
    return visibleRawMemories.filter(m => {
      if (navCategory) {
        const places = navMap[navCategory];
        if (places && !places.includes(m.dimensions.spatial.placeType)) return false;
        if (navSubCategory) {
          const subMap: Record<string, string[]> = {
            '快乐时光': ['游乐场', '公园'],
            '父子协作': ['家'],
            '日常生活': ['家', '客厅', '卧室', '厨房', '阳台'],
            '编程学习': ['学校', '家'],
            '数学学习': ['学校'],
            '阅读习惯': ['家', '学校'],
            '朋友互动': ['公园', '商场', '游乐场'],
            '情感表达': ['家', '公园'],
            '户外活动': ['公园', '游乐场'],
            '科幻兴趣': ['家', '其他'],
          };
          const subPlaces = subMap[navSubCategory];
          if (subPlaces && !subPlaces.includes(m.dimensions.spatial.placeType)) return false;
        }
      }
      return true;
    });
  }, [visibleRawMemories, navCategory, navSubCategory]);

  return (
    <AppContext.Provider value={{
      ...state,
      setCurrentView, selectMemory, focusInsight, setDemoMode, setDemoStep,
      toggleChat, toggleDetail, toggleCrud, toggleTheme, setNavCategory, setNavSubCategory,
      rawMemories: visibleRawMemories, insightMemories: mergedInsightMemories,
      addMemory, deleteMemory, updateMemory, getVisibleMemories,
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