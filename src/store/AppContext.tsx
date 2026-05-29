import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { RawMemory, InsightMemory, DimensionView, EmotionType, MemoryCollection, FarewellRecord, TimeCapsule } from '../types';
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
  searchQuery: string;
  emotionFilter: EmotionType[];
  tagFilter: string[];
  favoriteIds: string[];
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  timeRangeFilter: [number, number] | null;
  collections: MemoryCollection[];
  similarMemoryIds: string[];
  echoMemoryIds: string[];
  echoDescription: string;
  farewellRecords: FarewellRecord[];
  capsules: TimeCapsule[];
  memoryChain: { memoryId: string; connectionReason: string }[];
  boomerangMemoryIds: string[];
  boomerangDescription: string;
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
  setSearchQuery: (query: string) => void;
  toggleEmotionFilter: (emotion: EmotionType) => void;
  toggleTagFilter: (tag: string) => void;
  addTag: (memoryId: string, tag: string) => void;
  removeTag: (memoryId: string, tag: string) => void;
  allTags: string[];
  toggleFavorite: (id: string) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
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
  undoStackAction: 'delete' | 'edit' | null;
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
  reinforceMemory: (id: string) => void;
  setTimeRangeFilter: (range: [number, number] | null) => void;
  addCollection: (name: string, emoji: string) => void;
  removeCollection: (id: string) => void;
  addToCollection: (collectionId: string, memoryId: string) => void;
  removeFromCollection: (collectionId: string, memoryId: string) => void;
  findSimilar: (memoryId: string) => void;
  clearSimilar: () => void;
  findEcho: (memoryId: string) => void;
  clearEcho: () => void;
  farewellMemory: (memoryId: string, note: string, style: FarewellRecord['releaseStyle']) => void;
  createCapsule: (memoryId: string, unlockDate: number, note: string) => void;
  openCapsule: (capsuleId: string) => void;
  buildChain: (memoryId: string) => void;
  clearChain: () => void;
  findBoomerang: (memoryId: string) => void;
  clearBoomerang: () => void;
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
    memoryBankOpen: false,
    valueDashboardOpen: false,
    searchQuery: '',
    emotionFilter: [],
    tagFilter: [],
    favoriteIds: [],
    toasts: [],
    timeRangeFilter: null,
    collections: [],
    similarMemoryIds: [],
    echoMemoryIds: [],
    echoDescription: '',
    farewellRecords: [],
    capsules: [],
    memoryChain: [],
    boomerangMemoryIds: [],
    boomerangDescription: '',
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
  const [undoStack, setUndoStack] = useState<{ action: 'delete' | 'edit'; snapshot: RawMemory }[]>([]);
  const importIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [collections, setCollections] = useState<MemoryCollection[]>(() => {
    try {
      const saved = localStorage.getItem('graphme-collections');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem('graphme-collections', JSON.stringify(collections)); } catch {}
  }, [collections]);

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
      if (deleted) setUndoStack(stack => [{ action: 'delete' as const, snapshot: deleted }, ...stack].slice(0, 5));
      return prev.filter(m => m.id !== id);
    });
    setState(s => s.selectedMemory?.id === id ? { ...s, selectedMemory: null, detailOpen: false } : s);
  }, []);

  const undoDelete = useCallback(() => {
    setUndoStack(stack => {
      if (stack.length === 0) return stack;
      const [entry, ...rest] = stack;
      if (entry.action === 'delete') {
        setRawMems(prev => [...prev, entry.snapshot]);
      } else {
        setRawMems(prev => prev.map(m => m.id === entry.snapshot.id ? entry.snapshot : m));
      }
      return rest;
    });
  }, []);

  const updateMemory = useCallback((id: string, updates: Partial<RawMemory>) => {
    setRawMems(prev => {
      const old = prev.find(m => m.id === id);
      if (old) setUndoStack(stack => [{ action: 'edit' as const, snapshot: old }, ...stack].slice(0, 5));
      return prev.map(m => {
        if (m.id !== id) return m;
        const merged = { ...m, ...updates };
        if (updates.dimensions && m.dimensions) {
          merged.dimensions = { ...m.dimensions, ...updates.dimensions };
        }
        return merged;
      });
    });
  }, []);

  const updateInsight = useCallback((id: string, updates: Partial<InsightMemory>) => {
    setInsightMems(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const importMemories = useCallback((raws: RawMemory[], insights: InsightMemory[]) => {
    if (raws.length > 0) setRawMems(prev => [...prev, ...raws]);
    if (insights.length > 0) setInsightMems(prev => [...prev, ...insights]);
  }, []);

  const setSearchQuery = useCallback((query: string) => setState(s => ({ ...s, searchQuery: query })), []);

  const toggleEmotionFilter = useCallback((emotion: EmotionType) => {
    setState(s => ({
      ...s,
      emotionFilter: s.emotionFilter.includes(emotion)
        ? s.emotionFilter.filter(e => e !== emotion)
        : [...s.emotionFilter, emotion],
    }));
  }, []);

  const toggleTagFilter = useCallback((tag: string) => {
    setState(s => ({
      ...s,
      tagFilter: s.tagFilter.includes(tag)
        ? s.tagFilter.filter(t => t !== tag)
        : [...s.tagFilter, tag],
    }));
  }, []);

  const addTag = useCallback((memoryId: string, tag: string) => {
    setRawMems(prev => prev.map(m => {
      if (m.id !== memoryId) return m;
      const tags = m.tags || [];
      if (tags.includes(tag)) return m;
      return { ...m, tags: [...tags, tag] };
    }));
  }, []);

  const removeTag = useCallback((memoryId: string, tag: string) => {
    setRawMems(prev => prev.map(m => {
      if (m.id !== memoryId) return m;
      return { ...m, tags: (m.tags || []).filter(t => t !== tag) };
    }));
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const m of rawMems) {
      if (m.tags) m.tags.forEach(t => tagSet.add(t));
    }
    return Array.from(tagSet).sort();
  }, [rawMems]);

  const toggleFavorite = useCallback((id: string) => {
    setState(s => ({
      ...s,
      favoriteIds: s.favoriteIds.includes(id)
        ? s.favoriteIds.filter(x => x !== id)
        : [...s.favoriteIds, id],
    }));
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setState(s => ({ ...s, toasts: [...s.toasts, { id, message, type }] }));
  }, []);

  const removeToast = useCallback((id: string) => {
    setState(s => ({ ...s, toasts: s.toasts.filter(t => t.id !== id) }));
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

  const setTimeRangeFilter = useCallback((range: [number, number] | null) => {
    setState(s => ({ ...s, timeRangeFilter: range }));
  }, []);

  const addCollection = useCallback((name: string, emoji: string) => {
    const id = `col_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setCollections(prev => [...prev, { id, name, emoji, memoryIds: [], createdAt: Date.now() }]);
  }, []);

  const removeCollection = useCallback((id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id));
  }, []);

  const addToCollection = useCallback((collectionId: string, memoryId: string) => {
    setCollections(prev => prev.map(c =>
      c.id === collectionId && !c.memoryIds.includes(memoryId)
        ? { ...c, memoryIds: [...c.memoryIds, memoryId] }
        : c
    ));
  }, []);

  const removeFromCollection = useCallback((collectionId: string, memoryId: string) => {
    setCollections(prev => prev.map(c =>
      c.id === collectionId
        ? { ...c, memoryIds: c.memoryIds.filter(id => id !== memoryId) }
        : c
    ));
  }, []);

  const findSimilar = useCallback((memoryId: string) => {
    const target = rawMems.find(m => m.id === memoryId);
    if (!target) return;
    // Lazy import to avoid circular dependency
    import('../utils/similarityUtils').then(({ findSimilarMemories }) => {
      const results = findSimilarMemories(target, rawMems, 5);
      setState(s => ({ ...s, similarMemoryIds: results.map(r => r.memory.id) }));
    });
  }, [rawMems]);

  const clearSimilar = useCallback(() => {
    setState(s => ({ ...s, similarMemoryIds: [] }));
  }, []);

  const findEcho = useCallback((memoryId: string) => {
    const target = rawMems.find(m => m.id === memoryId);
    if (!target) return;
    import('../utils/similarityUtils').then(({ findEcho: findEchoFn }) => {
      const results = findEchoFn(target, rawMems, 2);
      if (results.length > 0) {
        setState(s => ({
          ...s,
          echoMemoryIds: results.map(r => r.memory.id),
          echoDescription: results[0].description,
        }));
      } else {
        setState(s => ({ ...s, echoMemoryIds: [], echoDescription: '' }));
      }
    });
  }, [rawMems]);

  const clearEcho = useCallback(() => {
    setState(s => ({ ...s, echoMemoryIds: [], echoDescription: '' }));
  }, []);

  const [farewellRecords, setFarewellRecords] = useState<FarewellRecord[]>(() => {
    try {
      const saved = localStorage.getItem('graphme-farewellRecords');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem('graphme-farewellRecords', JSON.stringify(farewellRecords)); } catch {}
  }, [farewellRecords]);

  const farewellMemory = useCallback((memoryId: string, note: string, style: FarewellRecord['releaseStyle']) => {
    const mem = rawMems.find(m => m.id === memoryId);
    if (!mem) return;
    const record: FarewellRecord = {
      id: `farewell_${Date.now()}`,
      memoryLabel: mem.label,
      memorySummary: mem.summary,
      farewellNote: note,
      releaseStyle: style,
      releasedAt: Date.now(),
    };
    setFarewellRecords(prev => [...prev, record]);
    deleteMemory(memoryId);
  }, [rawMems, deleteMemory]);

  const [capsules, setCapsules] = useState<TimeCapsule[]>(() => {
    try {
      const saved = localStorage.getItem('graphme-capsules');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem('graphme-capsules', JSON.stringify(capsules)); } catch {}
  }, [capsules]);

  const createCapsule = useCallback((memoryId: string, unlockDate: number, note: string) => {
    const capsule: TimeCapsule = {
      id: `capsule_${Date.now()}`,
      memoryId,
      sealedAt: Date.now(),
      unlockDate,
      note,
      opened: false,
    };
    setCapsules(prev => [...prev, capsule]);
  }, []);

  const openCapsule = useCallback((capsuleId: string) => {
    setCapsules(prev => prev.map(c => c.id === capsuleId ? { ...c, opened: true } : c));
  }, []);

  const buildChain = useCallback((memoryId: string) => {
    const target = rawMems.find(m => m.id === memoryId);
    if (!target) return;
    import('../utils/similarityUtils').then(({ buildMemoryChain }) => {
      const chain = buildMemoryChain(target, rawMems, 5);
      setState(s => ({
        ...s,
        memoryChain: chain.map(link => ({
          memoryId: link.memory.id,
          connectionReason: link.connectionReason,
        })),
      }));
    });
  }, [rawMems]);

  const clearChain = useCallback(() => {
    setState(s => ({ ...s, memoryChain: [] }));
  }, []);

  const findBoomerang = useCallback((memoryId: string) => {
    const target = rawMems.find(m => m.id === memoryId);
    if (!target) return;
    import('../utils/similarityUtils').then(({ findBoomerang: findBoomerangFn }) => {
      const results = findBoomerangFn(target, rawMems, 2);
      if (results.length > 0) {
        setState(s => ({
          ...s,
          boomerangMemoryIds: results.map(r => r.memory.id),
          boomerangDescription: results[0].description,
        }));
      } else {
        setState(s => ({ ...s, boomerangMemoryIds: [], boomerangDescription: '' }));
      }
    });
  }, [rawMems]);

  const clearBoomerang = useCallback(() => {
    setState(s => ({ ...s, boomerangMemoryIds: [], boomerangDescription: '' }));
  }, []);

  const reinforceMemory = useCallback((id: string) => {
    setRawMems(prev => prev.map(m => {
      if (m.id !== id) return m;
      return {
        ...m,
        dimensions: {
          ...m.dimensions,
          value: {
            ...m.dimensions.value,
            accessCount: m.dimensions.value.accessCount + 1,
            cqi: Math.min(1, m.dimensions.value.cqi + 0.05),
          },
          temporal: {
            ...m.dimensions.temporal,
            timestamp: Date.now(), // Reset forgetting curve
          },
        },
      };
    }));
  }, []);

  const navCategory = state.navCategory;
  const navSubCategory = state.navSubCategory;

  const mergedRawMemories = useMemo(() =>
    showChatGPT ? [...rawMems, ...chatgptRawMemories] : rawMems,
  [rawMems, showChatGPT]);

  const allRawMemories = mergedRawMemories;

  const visibleRawMemories = useMemo(() => {
    let result = hiddenMemoryIds.length === 0
      ? mergedRawMemories
      : mergedRawMemories.filter(m => !hiddenMemoryIds.includes(m.id));
    if (state.emotionFilter.length > 0) {
      result = result.filter(m => state.emotionFilter.includes(m.dimensions.emotional.primary));
    }
    if (state.tagFilter.length > 0) {
      result = result.filter(m => m.tags && state.tagFilter.some(t => m.tags!.includes(t)));
    }
    return result;
  }, [mergedRawMemories, hiddenMemoryIds, state.emotionFilter, state.tagFilter]);

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
      toggleChat, toggleDetail, toggleCrud, toggleTheme, toggleMemoryBank, toggleValueDashboard, setSearchQuery, toggleEmotionFilter, toggleTagFilter, addTag, removeTag, allTags, toggleFavorite, addToast, removeToast, setNavCategory, setNavSubCategory,
      rawMemories: visibleRawMemories, insightMemories: mergedInsightMemories,
      addMemory, deleteMemory, updateMemory, updateInsight, importMemories, undoDelete, undoStackCount: undoStack.length, undoStackAction: undoStack[0]?.action ?? null, getVisibleMemories,
      hideRawOnly, hideInsightOnly, toggleHideRaw, toggleHideInsight,
      showChatGPT, toggleShowChatGPT,
      chatgptImportStatus, chatgptImportProgress, startChatGPTImport,
      hiddenMemoryIds, allRawMemories, toggleMemoryVisibility, toggleAllMemories, reinforceMemory, setTimeRangeFilter,
      collections, addCollection, removeCollection, addToCollection, removeFromCollection,
      similarMemoryIds: state.similarMemoryIds, findSimilar, clearSimilar,
      echoMemoryIds: state.echoMemoryIds, echoDescription: state.echoDescription, findEcho, clearEcho,
      farewellRecords, farewellMemory,
      capsules, createCapsule, openCapsule,
      memoryChain: state.memoryChain, buildChain, clearChain,
      boomerangMemoryIds: state.boomerangMemoryIds, boomerangDescription: state.boomerangDescription, findBoomerang, clearBoomerang,
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