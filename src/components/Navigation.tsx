import { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { useI18n } from '../i18n';
import { navCategoryT, navSubCategoryT, emotionT, emotionNameT, placeT, activityT, privacyT, joinContentT } from '../i18n/dataTranslations';
import type { RawMemory, EmotionType } from '../types';
import { EMOTION_COLORS, Z_INDEX } from '../types';
import { chatgptRawMemories, chatgptInsightMemories } from '../data/chatgptData';
import StoryWeaver from './StoryWeaver';
import { getMemoryCategoryPaths } from '../utils/navUtils';
import { parseImportJSON } from '../utils/importUtils';
import { memoryLabelT, memorySummaryT } from '../i18n/memoryData';

const NAV_STRUCTURE: Record<string, { icon: string; sub: { id: string; icon: string }[] }> = {
  '家庭生活': { icon: '🏠', sub: [
    { id: '快乐时光', icon: '😊' },
    { id: '父子协作', icon: '🔧' },
    { id: '日常生活', icon: '📋' },
  ]},
  '学习与成长': { icon: '🎓', sub: [
    { id: '编程学习', icon: '💻' },
    { id: '数学学习', icon: '🔢' },
    { id: '阅读习惯', icon: '📚' },
  ]},
  '社交与情感': { icon: '👥', sub: [
    { id: '朋友互动', icon: '🤝' },
    { id: '情感表达', icon: '💭' },
  ]},
  '兴趣与探索': { icon: '🔍', sub: [
    { id: '户外活动', icon: '🏃' },
    { id: '科幻兴趣', icon: '🚀' },
  ]},
};

let createIdCounter = Date.now();

export default function NavigationSidebar() {
  const {
    navCategory, navSubCategory,
    setNavCategory, setNavSubCategory,
    rawMemories, addMemory, deleteMemory, updateMemory, importMemories,
    hideRawOnly, hideInsightOnly, toggleHideRaw, toggleHideInsight,
    insightMemories, theme, selectMemory, selectedMemory,
    emotionFilter, toggleEmotionFilter,
    tagFilter, toggleTagFilter, addTag, removeTag, allTags,
    similarMemoryIds, clearSimilar,
    farewellRecords,
    capsules, openCapsule,
    favoriteIds, toggleFavorite,
    addToast,
    showChatGPT, toggleShowChatGPT,
    chatgptImportStatus, chatgptImportProgress, startChatGPTImport,
    hiddenMemoryIds, allRawMemories, toggleMemoryVisibility, toggleAllMemories,
    undoDelete, undoStackCount, undoStackAction,
    collections, addCollection, removeCollection, addToCollection, removeFromCollection,
  } = useAppState();
  const { t, language } = useI18n();
  const isDark = theme === 'dark';
  const chatgptCount = chatgptRawMemories.length + chatgptInsightMemories.length;
  const allRawMemoriesRef = useRef(allRawMemories);
  allRawMemoriesRef.current = allRawMemories;
  const [collapsed, setCollapsed] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [showMemoryMgr, setShowMemoryMgr] = useState(false);
  const [showStoryBoard, setShowStoryBoard] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [expandedCollection, setExpandedCollection] = useState<string | null>(null);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionEmoji, setNewCollectionEmoji] = useState('📁');
  const [tagInputId, setTagInputId] = useState<string | null>(null);
  const [tagInputValue, setTagInputValue] = useState('');

  const connectionPaths = useMemo(
    () => selectedMemory ? getMemoryCategoryPaths(selectedMemory, allRawMemoriesRef.current) : [],
    [selectedMemory]
  );

  const activePathCategories = useMemo(
    () => new Set(connectionPaths.map(p => p.category)),
    [connectionPaths]
  );
  const activePathSubCategories = useMemo(
    () => new Set(connectionPaths.map(p => p.subCategory)),
    [connectionPaths]
  );

  // Auto-expand nav and navigate to category when a memory is selected
  useEffect(() => {
    if (!selectedMemory) return;
    setCollapsed(false);
    if (connectionPaths.length > 0) {
      setNavCategory(connectionPaths[0].category);
      setNavSubCategory(connectionPaths[0].subCategory);
    }
  }, [selectedMemory, connectionPaths, setNavCategory, setNavSubCategory]);

  const [formOpen, setFormOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(30);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmDeleteId) return;
    const timer = setTimeout(() => setConfirmDeleteId(null), 3000);
    return () => clearTimeout(timer);
  }, [confirmDeleteId]);

  const [label, setLabel] = useState('');
  const [summary, setSummary] = useState('');
  const [emotion, setEmotion] = useState<EmotionType>('快乐');
  const [placeType, setPlaceType] = useState<RawMemory['dimensions']['spatial']['placeType']>('家');
  const [storyline, setStoryline] = useState('');
  const [persons, setPersons] = useState('');
  const [activityType, setActivityType] = useState('活动');
  const [importance, setImportance] = useState(0.5);
  const [privacyLevel, setPrivacyLevel] = useState<RawMemory['dimensions']['value']['privacyLevel']>('家庭可见');

  const [editLabel, setEditLabel] = useState('');
  const [editSummary, setEditSummary] = useState('');

  const breadcrumbs = useMemo(() => {
    const parts: string[] = [];
    if (navCategory) parts.push(navCategory);
    if (navSubCategory) parts.push(navSubCategory);
    return parts;
  }, [navCategory, navSubCategory]);

  const filtered = allRawMemories.filter(m => {
    if (!searchText) return true;
    const keywords = searchText.toLowerCase().split(/\s+/).filter(Boolean);
    const haystack = `${m.id} ${m.label} ${m.summary}`.toLowerCase();
    return keywords.every(kw => haystack.includes(kw));
  });

  const handleCreate = () => {
    if (!label || !summary) return;
    const id = `mem_${createIdCounter++}`;
    const x = (Math.random() * 6 - 3).toFixed(1);
    const y = (Math.random() * 3 - 1.5).toFixed(1);
    const z = (Math.random() * 4 - 2).toFixed(1);
    const px = parseFloat(x), py = parseFloat(y), pz = parseFloat(z);

    const newMem: RawMemory = {
      type: 'raw',
      id,
      label,
      summary,
      source: 'graphme',
      dimensions: {
        temporal: { timestamp: Date.now(), dateType: '普通日', timeOfDay: '下午', season: '夏', duration: 30 },
        spatial: { placeType, room: '客厅', landmark: '手动添加' },
        social: { persons: persons ? persons.split('、').map(s => s.trim()).filter(Boolean) : [], relationship: [], groupInteraction: false, intimacy: 0.3 },
        emotional: { primary: emotion, intensity: 0.7, trigger: '用户手动添加' },
        activity: { type: activityType, detail: summary },
        sensory: { images: [], audio: [], videos: [], interactions: [] },
        semantic: { knowledge: [], preferences: {}, skills: [] },
        value: { importance, cqi: 0.2, accessCount: 0, privacyLevel },
        narrative: { storyline, previousRefs: [], nextRefs: [], isMilestone: false },
        agentState: { agentType: '陪伴型', version: '2.1.0', status: 'active' },
      },
      position3D: [px, py, pz],
      color: EMOTION_COLORS[emotion],
      size: 0.5,
      positions: {
        '全局视图': [px, py, pz],
        '家庭视图': [(px + 3) % 10 - 5, (py + 2) % 6 - 3, (pz + 3) % 8 - 4],
        '学习视图': [px * 0.7, py * 0.6, pz * 0.7],
        '情绪视图': [px * 0.7, py * 0.6, pz * 0.7],
      },
    };

    addMemory(newMem);
                                  addToast(t('toast.memoryCreated'));
    setLabel('');
    setSummary('');
    setEmotion('快乐');
    setPersons('');
    setActivityType('活动');
    setImportance(0.5);
    setPrivacyLevel('家庭可见');
    setFormOpen(false);
  };

  const startEdit = (mem: RawMemory) => {
    setEditingId(mem.id);
    setEditLabel(mem.label);
    setEditSummary(mem.summary);
  };

  const saveEdit = (id: string) => {
    if (!editLabel || !editSummary) return;
    updateMemory(id, { label: editLabel, summary: editSummary });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  if (collapsed) {
    return (
      <div className="w-[40px] flex flex-col h-full items-center pt-4">
        <button
          id="nav-expand"
          onClick={() => setCollapsed(false)}
          className={`transition-colors mb-3 cursor-pointer ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
          title={t('nav.expand')}
        >
          ▶
        </button>
        <div className="flex-1 overflow-y-auto p-1 space-y-1.5">
          {Object.entries(NAV_STRUCTURE).map(([category, { icon }]) => (
            <button
              key={category}
              onClick={() => {
                setCollapsed(false);
                setNavCategory(category);
              }}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all cursor-pointer ${
                navCategory === category
                  ? isDark ? 'bg-[#00f2ff]/10 text-[#00f2ff]' : 'bg-[#0088cc]/10 text-[#0088cc]'
                  : isDark ? 'text-gray-500 hover:bg-[#ffffff05] hover:text-gray-300' : 'text-gray-400 hover:bg-black/5 hover:text-gray-600'
              }`}
              title={category}
            >
              {icon}
            </button>
          ))}
          <div className={`w-full border-t my-1 ${isDark ? 'border-[#ffffff08]' : 'border-gray-200'}`} />
          <button
            onClick={() => { setCollapsed(false); setShowLegend(true); }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all cursor-pointer ${isDark ? 'text-gray-500 hover:bg-[#ffffff05] hover:text-gray-300' : 'text-gray-400 hover:bg-black/5 hover:text-gray-600'}`}
            title={t('nav.legend')}
          >
            🎨
          </button>
          <button
            onClick={() => { setCollapsed(false); setShowStoryBoard(true); }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all cursor-pointer ${isDark ? 'text-gray-500 hover:bg-[#ffffff05] hover:text-gray-300' : 'text-gray-400 hover:bg-black/5 hover:text-gray-600'}`}
            title={t('nav.storyboard')}
          >
            📖
          </button>
          <button
            onClick={() => { setCollapsed(false); setShowTags(true); }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all cursor-pointer ${isDark ? 'text-gray-500 hover:bg-[#ffffff05] hover:text-gray-300' : 'text-gray-400 hover:bg-black/5 hover:text-gray-600'}`}
            title={t('nav.tags')}
          >
            🏷
          </button>
          <button
            onClick={() => { setCollapsed(false); setShowMemoryMgr(true); }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all cursor-pointer ${isDark ? 'text-gray-500 hover:bg-[#ffffff05] hover:text-gray-300' : 'text-gray-400 hover:bg-black/5 hover:text-gray-600'}`}
            title={t('nav.memoryMgr')}
          >
            ⚙️
          </button>
        </div>
        <div className={`p-1 border-t w-full text-center ${isDark ? 'border-[#ffffff08]' : 'border-gray-200'}`}>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {navCategory ? NAV_STRUCTURE[navCategory]?.icon : '🧭'}
          </div>
        </div>
      </div>
    );
  }

  return (<>
    <div className="w-[220px] flex flex-col h-full">
      <div className={`p-4 border-b ${isDark ? 'border-[#ffffff08]' : 'border-gray-200'} flex items-center justify-between`}>
        <h2 className={`font-medium text-sm tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('nav.memoryNav')}</h2>
        <button
          id="nav-collapse"
          onClick={() => setCollapsed(true)}
          className={`transition-colors cursor-pointer ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
          title={t('nav.collapse')}
        >
          ◀
        </button>
      </div>

      {connectionPaths.length > 0 && (
        <div className={`px-4 py-2 border-b text-xs ${isDark ? 'border-[#ffffff08] bg-[#ffb800]/5' : 'border-gray-200 bg-[#cc8800]/5'}`}>
          <div className={`font-medium mb-1 ${isDark ? 'text-[#ffb800]' : 'text-[#cc8800]'}`}>
            🔗 {t('nav.connectionPaths', { count: connectionPaths.length })}
          </div>
          <div className="space-y-0.5">
            {connectionPaths.map(p => (
              <div key={`${p.category}/${p.subCategory}`} className={`${isDark ? 'text-[#ffb800]/80' : 'text-[#cc8800]/80'}`}>
                {p.categoryIcon} {navCategoryT(language, p.category)} → {p.subCategoryIcon} {navSubCategoryT(language, p.subCategory)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {Object.entries(NAV_STRUCTURE).map(([category, { icon, sub }]) => (
          <div key={category}>
            <button
              id={`nav-cat-${category}`}
              onClick={() => {
                setNavCategory(navCategory === category ? null : category);
                setNavSubCategory(null);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 cursor-pointer ${
                navCategory === category
                  ? isDark ? 'bg-[#00f2ff]/10 text-[#00f2ff]' : 'bg-[#0088cc]/10 text-[#0088cc]'
                  : activePathCategories.has(category)
                    ? isDark ? 'bg-[#ffb800]/10 text-[#ffb800] border-l-2 border-[#ffb800]/30' : 'bg-[#cc8800]/10 text-[#cc8800] border-l-2 border-[#cc8800]/30'
                    : isDark ? 'text-gray-400 hover:bg-[#ffffff05] hover:text-gray-300' : 'text-gray-500 hover:bg-black/5 hover:text-gray-700'
              }`}
            >
              <span>{icon}</span>
              <span>{navCategoryT(language, category)}</span>
            </button>

            {navCategory === category && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="ml-4 space-y-0.5 overflow-hidden"
              >
                {sub.map((s) => (
                  <button
                    key={s.id}
                    id={`nav-sub-${s.id}`}
                    onClick={() => setNavSubCategory(navSubCategory === s.id ? null : s.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-2 cursor-pointer ${
                      navSubCategory === s.id
                        ? isDark ? 'bg-[#00f2ff]/5 text-[#00f2ff] border-l-2 border-[#00f2ff]/30' : 'bg-[#0088cc]/5 text-[#0088cc] border-l-2 border-[#0088cc]/30'
                        : activePathSubCategories.has(s.id)
                          ? isDark ? 'bg-[#ffb800]/10 text-[#ffb800]' : 'bg-[#cc8800]/10 text-[#cc8800]'
                          : isDark ? 'text-gray-500 hover:bg-[#ffffff05] hover:text-gray-400' : 'text-gray-400 hover:bg-black/5 hover:text-gray-600'
                    }`}
                  >
                    {s.icon} {navSubCategoryT(language, s.id)}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <div className={`border-t ${isDark ? 'border-[#ffffff08]' : 'border-gray-200'}`}>
        <button
          id="nav-legend"
          onClick={() => { setShowLegend(!showLegend); setShowMemoryMgr(false); setShowStoryBoard(false); }}
          className={`w-full text-left px-4 py-2 text-xs transition-all flex items-center justify-between cursor-pointer ${
            isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-[#ffffff05]' : 'text-gray-500 hover:text-gray-700 hover:bg-black/5'
          }`}
        >
          <span>📖 {t('nav.legend')}</span>
          <span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{showLegend ? '▲' : '▼'}</span>
        </button>
        <AnimatePresence>
          {showLegend && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className={`px-4 pb-3 text-xs space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="space-y-1.5">
                  <div className={`font-medium ${isDark ? 'text-gray-500' : 'text-gray-700'}`}>{t('nav.legend.memoryTypes')}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#00f2ff] inline-block flex-shrink-0" />
                    <span>{t('nav.legend.rawParticle')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ffb800] inline-block flex-shrink-0" style={{ boxShadow: '0 0 6px #ffb800' }} />
                    <span>{t('nav.legend.insightRing')}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className={`font-medium ${isDark ? 'text-gray-500' : 'text-gray-700'}`}>{t('nav.legend.lineTypes')}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-[2px] bg-[#ffb800]/40 flex-shrink-0" />
                    <span>{t('nav.legend.causalLine')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-[2px] bg-[#ffb800]/20 flex-shrink-0" />
                    <span>{t('nav.legend.supportLine')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-[2px] bg-[#4488ff]/20 flex-shrink-0" />
                    <span>{t('nav.legend.relationLine')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-toggle-raw"
                    onClick={toggleHideRaw}
                    className={`px-2 py-1 rounded text-xs transition-all cursor-pointer ${
                      hideRawOnly ? `${isDark ? 'bg-[#1a1a2e] text-gray-500' : 'bg-gray-100 text-gray-400'}` : `${isDark ? 'bg-[#00f2ff]/10 text-[#00f2ff]' : 'bg-[#0088cc]/10 text-[#0088cc]'}`
                    }`}
                  >
                    🔵 {t('nav.legend.rawMemory')} {hideRawOnly ? t('nav.legend.hidden') : rawMemories.length}
                  </button>
                  <button
                    onClick={toggleHideInsight}
                    className={`px-2 py-1 rounded text-xs transition-all cursor-pointer ${
                      hideInsightOnly ? `${isDark ? 'bg-[#1a1a2e] text-gray-500' : 'bg-gray-100 text-gray-400'}` : `${isDark ? 'bg-[#ffb800]/10 text-[#ffb800]' : 'bg-[#cc8800]/10 text-[#cc8800]'}`
                    }`}
                  >
                    🟡 {t('nav.legend.insightMemory')} {hideInsightOnly ? t('nav.legend.hidden') : insightMemories.length}
                  </button>
                </div>

                <div className="space-y-1">
                  <div className={`font-medium ${isDark ? 'text-gray-500' : 'text-gray-700'}`}>
                    {t('nav.legend.particleColor')}
                    {emotionFilter.length > 0 && (
                      <span className={`ml-1 text-[10px] ${isDark ? 'text-[#00f2ff]' : 'text-[#0088cc]'}`}>({t('nav.legend.filtered')})</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                    {Object.entries(EMOTION_COLORS).map(([emotion, color]) => {
                      const isActive = emotionFilter.includes(emotion as EmotionType);
                      return (
                        <button
                          key={emotion}
                          id={`emotion-filter-${emotion}`}
                          onClick={() => toggleEmotionFilter(emotion as EmotionType)}
                          className={`flex items-center gap-1 px-1 py-0.5 rounded cursor-pointer transition-colors ${
                            isActive
                              ? isDark ? 'bg-[#ffffff10]' : 'bg-black/5'
                              : isDark ? 'hover:bg-[#ffffff05]' : 'hover:bg-black/5'
                          } ${emotionFilter.length > 0 && !isActive ? 'opacity-30' : ''}`}
                        >
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <span className={`${isDark ? 'text-gray-600' : 'text-gray-500'}`}>{emotionT(language, emotion)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`border-t ${isDark ? 'border-[#ffffff08]' : 'border-gray-200'}`}>
        <button
          id="nav-storyboard"
          onClick={() => { setShowStoryBoard(!showStoryBoard); setShowLegend(false); setShowMemoryMgr(false); setShowTags(false); }}
          className={`w-full text-left px-4 py-2 text-xs transition-all flex items-center justify-between cursor-pointer ${
            isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-[#ffffff05]' : 'text-gray-500 hover:text-gray-700 hover:bg-black/5'
          }`}
        >
          <span>📖 {t('nav.storyboard')}</span>
          <span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{showStoryBoard ? '▲' : '▼'}</span>
        </button>
      </div>

      <div className={`border-t ${isDark ? 'border-[#ffffff08]' : 'border-gray-200'}`}>
        <button
          id="nav-tags"
          onClick={() => { setShowTags(!showTags); setShowLegend(false); setShowMemoryMgr(false); setShowStoryBoard(false); }}
          className={`w-full text-left px-4 py-2 text-xs transition-all flex items-center justify-between cursor-pointer ${
            isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-[#ffffff05]' : 'text-gray-500 hover:text-gray-700 hover:bg-black/5'
          }`}
        >
          <span>🏷 {t('nav.tags')} {allTags.length > 0 ? `(${allTags.length})` : ''}</span>
          <span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{showTags ? '▲' : '▼'}</span>
        </button>
        <AnimatePresence>
          {showTags && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className={`px-3 pb-3 text-xs max-h-[40vh] overflow-y-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {allTags.length === 0 ? (
                  <p className={`${isDark ? 'text-gray-600' : 'text-gray-400'} py-2`}>{t('nav.noTags')}</p>
                ) : (
                  <div className="space-y-1">
                    {allTags.map(tag => {
                      const isActive = tagFilter.includes(tag);
                      const count = rawMemories.filter(m => m.tags?.includes(tag)).length;
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTagFilter(tag)}
                          className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 cursor-pointer transition-colors ${
                            isActive
                              ? isDark ? 'bg-[#00f2ff]/10 text-[#00f2ff]' : 'bg-[#0088cc]/10 text-[#0088cc]'
                              : isDark ? 'hover:bg-[#ffffff05] text-gray-400' : 'hover:bg-black/5 text-gray-600'
                          } ${tagFilter.length > 0 && !isActive ? 'opacity-30' : ''}`}
                        >
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            isDark ? 'bg-[#ffffff10]' : 'bg-gray-200'
                          }`}>{tag}</span>
                          <span className={`ml-auto text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {tagFilter.length > 0 && (
                  <button
                    onClick={() => tagFilter.forEach(t => toggleTagFilter(t))}
                    className={`w-full py-1 mt-2 rounded text-[10px] cursor-pointer ${
                      isDark ? 'bg-[#ffffff08] text-gray-400 hover:bg-[#ffffff12]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {t('nav.clearTagFilter')}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`border-t ${isDark ? 'border-[#ffffff08]' : 'border-gray-200'}`}>
        <button
          id="nav-memory-mgr"
          onClick={() => { setShowMemoryMgr(!showMemoryMgr); setShowLegend(false); setShowTags(false); setShowStoryBoard(false); }}
          className={`w-full text-left px-4 py-2 text-xs transition-all flex items-center justify-between cursor-pointer ${
            isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-[#ffffff05]' : 'text-gray-500 hover:text-gray-700 hover:bg-black/5'
          }`}
        >
          <span>⚙️ {t('nav.memoryMgr')}</span>
          <span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{showMemoryMgr ? '▲' : '▼'}</span>
        </button>
        <AnimatePresence>
          {showMemoryMgr && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-2 max-h-[50vh] overflow-y-auto">
                <input
                  type="text"
                  placeholder={t('nav.mgr.searchPlaceholder')}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className={`w-full border rounded px-2 py-1.5 text-xs placeholder-gray-600 ${
                    isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-700'
                  }`}
                />

                <div className={`rounded-lg border p-2.5 text-xs ${
                  isDark ? 'bg-[#00f2ff]/5 border-[#00f2ff]/20' : 'bg-[#0088cc]/5 border-[#0088cc]/20'
                }`}>
                  <div className={`text-[11px] font-semibold mb-2 tracking-wide ${isDark ? 'text-[#00f2ff]' : 'text-[#0088cc]'}`}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00f2ff] mr-1.5 animate-pulse" />
                    🤖 {t('nav.mgr.externalAgent')}
                  </div>
                  <button
                    id="nav-chatgpt-import"
                    onClick={chatgptImportStatus === 'idle' ? startChatGPTImport : toggleShowChatGPT}
                    disabled={chatgptImportStatus === 'importing'}
                    className={`px-2.5 py-1.5 rounded-md text-xs transition-all cursor-pointer w-full text-left font-medium ${
                      chatgptImportStatus === 'importing'
                        ? isDark ? 'bg-[#1a1a2e] text-gray-400 cursor-wait' : 'bg-gray-100 text-gray-500 cursor-wait'
                        : showChatGPT
                          ? `${isDark ? 'bg-[#10a37f]/15 text-[#10a37f]' : 'bg-[#10a37f]/15 text-[#10a37f]'}`
                          : `${isDark ? 'bg-[#00f2ff]/10 text-[#00f2ff] hover:bg-[#00f2ff]/20' : 'bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20'}`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>ChatGPT {
                        chatgptImportStatus === 'importing'
                          ? t('nav.mgr.chatgptImporting', { progress: chatgptImportProgress })
                          : chatgptImportStatus === 'done'
                            ? t('nav.mgr.chatgptDone')
                            : t('nav.mgr.chatgptNotImported', { count: chatgptCount })
                      }</span>
                      {chatgptImportStatus === 'idle' && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-[#00f2ff]/15 text-[#00f2ff]' : 'bg-[#0088cc]/15 text-[#0088cc]'}`}>{t('nav.mgr.importBtn')}</span>
                      )}
                    </div>
                    {chatgptImportStatus === 'importing' && (
                      <div className={`mt-1 h-1 rounded-full overflow-hidden ${isDark ? 'bg-[#ffffff10]' : 'bg-gray-300'}`}>
                        <div
                          className="h-full rounded-full bg-[#10a37f] transition-all duration-100 ease-linear"
                          style={{ width: `${chatgptImportProgress}%` }}
                        />
                      </div>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const text = reader.result as string;
                        const result = parseImportJSON(text, language);
                        if (result.rawMemories.length > 0 || result.insightMemories.length > 0) {
                          importMemories(result.rawMemories, result.insightMemories);
                          addToast(t('toast.imported', { count: result.rawMemories.length + result.insightMemories.length }));
                        }
                        if (result.errors.length > 0) {
                          alert(`${t('nav.mgr.importError')}\n${result.errors.join('\n')}`);
                        }
                      };
                      reader.readAsText(file);
                      e.target.value = '';
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    id="json-import-input"
                  />
                  <label
                    htmlFor="json-import-input"
                    className={`block w-full py-1.5 border rounded text-xs text-center transition-colors cursor-pointer ${
                      isDark ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20' : 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100'
                    }`}
                  >
                    📁 {t('nav.mgr.importJson')}
                  </label>
                </div>
                <a
                  href="/sample-import.json"
                  download="sample-import.json"
                  className={`block w-full py-1.5 border rounded text-xs text-center transition-colors ${
                    isDark ? 'bg-[#ffffff05] border-[#ffffff08] text-gray-400 hover:bg-[#ffffff10] hover:text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  ⬇️ {t('nav.mgr.downloadSample')}
                </a>

                <button
                  onClick={() => setFormOpen(!formOpen)}
                  className={`w-full py-1.5 border rounded text-xs transition-colors cursor-pointer ${
                    isDark ? 'bg-[#00f2ff]/10 border-[#00f2ff]/20 text-[#00f2ff] hover:bg-[#00f2ff]/20' : 'bg-[#0088cc]/10 border-[#0088cc]/20 text-[#0088cc] hover:bg-[#0088cc]/20'
                  }`}
                >
                  {formOpen ? t('nav.mgr.cancel') : t('nav.mgr.newMemory')}
                </button>

                <AnimatePresence>
                  {formOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={`space-y-2 rounded p-2 border ${
                        isDark ? 'bg-[#1a1a2e]/50 border-[#ffffff08]' : 'bg-gray-100 border-gray-200'
                      }`}>
                        <input
                          type="text"
                          placeholder={t('nav.mgr.labelPlaceholder')}
                          value={label}
                          onChange={e => setLabel(e.target.value)}
                          className={`w-full border rounded px-2 py-1 text-xs placeholder-gray-600 ${
                            isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                          }`}
                        />
                        <textarea
                          placeholder={t('nav.mgr.summaryPlaceholder')}
                          value={summary}
                          onChange={e => setSummary(e.target.value)}
                          rows={2}
                          className={`w-full border rounded px-2 py-1 text-xs placeholder-gray-600 resize-none ${
                            isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                          }`}
                        />
                        <div className="flex gap-1.5">
                          <select
                            value={emotion}
                            onChange={e => setEmotion(e.target.value as EmotionType)}
                            className={`flex-1 border rounded px-1.5 py-1 text-xs ${
                              isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                            }`}
                          >
                            {Object.keys(EMOTION_COLORS).map(e => (
                              <option key={e} value={e}>{emotionT(language, e)}</option>
                            ))}
                          </select>
                          <select
                            value={placeType}
                            onChange={e => setPlaceType(e.target.value as any)}
                            className={`flex-1 border rounded px-1.5 py-1 text-xs ${
                              isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                            }`}
                          >
                            <option value="家">{placeT(language, '家')}</option>
                            <option value="学校">{placeT(language, '学校')}</option>
                            <option value="公园">{placeT(language, '公园')}</option>
                            <option value="游乐场">{placeT(language, '游乐场')}</option>
                            <option value="商场">{placeT(language, '商场')}</option>
                            <option value="其他">{placeT(language, '其他')}</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          placeholder={t('nav.mgr.storylinePlaceholder')}
                          value={storyline}
                          onChange={e => setStoryline(e.target.value)}
                          className={`w-full border rounded px-2 py-1 text-xs placeholder-gray-600 ${
                            isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                          }`}
                        />
                        <input
                          type="text"
                          placeholder={t('nav.mgr.personsPlaceholder')}
                          value={persons}
                          onChange={e => setPersons(e.target.value)}
                          className={`w-full border rounded px-2 py-1 text-xs placeholder-gray-600 ${
                            isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                          }`}
                        />
                        <div className="flex gap-1.5">
                          <select
                            value={activityType}
                            onChange={e => setActivityType(e.target.value)}
                            className={`flex-1 border rounded px-1.5 py-1 text-xs ${
                              isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                            }`}
                          >
                            <option value="活动">{activityT(language, '活动')}</option>
                            <option value="学习">{activityT(language, '学习')}</option>
                            <option value="游戏">{activityT(language, '游戏')}</option>
                            <option value="对话">{activityT(language, '对话')}</option>
                            <option value="探索">{activityT(language, '探索')}</option>
                            <option value="创作">{activityT(language, '创作')}</option>
                            <option value="运动">{activityT(language, '运动')}</option>
                          </select>
                          <div className="flex-1 flex items-center gap-1">
                            <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>⭐</span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={importance}
                              onChange={e => setImportance(parseFloat(e.target.value))}
                              className="flex-1 h-1 cursor-pointer"
                            />
                            <span className={`text-[10px] w-6 text-right ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {importance.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <select
                          value={privacyLevel}
                          onChange={e => setPrivacyLevel(e.target.value as RawMemory['dimensions']['value']['privacyLevel'])}
                          className={`w-full border rounded px-2 py-1 text-xs ${
                            isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                          }`}
                        >
                          <option value="公开">{privacyT(language, '公开')}</option>
                          <option value="家庭可见">{privacyT(language, '家庭可见')}</option>
                          <option value="仅自己">{privacyT(language, '仅自己')}</option>
                          <option value="加密">{privacyT(language, '加密')}</option>
                        </select>
                        <button
                          onClick={handleCreate}
                          className={`w-full py-1 text-xs rounded transition-colors cursor-pointer ${
                            isDark ? 'bg-[#00f2ff]/15 text-[#00f2ff] hover:bg-[#00f2ff]/25' : 'bg-[#0088cc]/15 text-[#0088cc] hover:bg-[#0088cc]/25'
                          }`}
                        >
                          {t('nav.mgr.createMemory')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                        {t('nav.mgr.totalCount', { count: filtered.length })} {searchText ? t('nav.mgr.filtered') : ''}
                      </p>
                      {undoStackCount > 0 && (
                        <button
                          onClick={undoDelete}
                          className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                            isDark ? 'bg-[#ffffff08] text-[#00f2ff] hover:bg-[#ffffff12]' : 'bg-gray-100 text-[#0088cc] hover:bg-gray-200'
                          }`}
                          title={t('nav.mgr.undo', { action: undoStackAction === 'edit' ? t('nav.mgr.undoEdit') : t('nav.mgr.undoDelete'), count: undoStackCount })}
                        >
                          ↩ {t('nav.mgr.undo', { action: undoStackAction === 'edit' ? t('nav.mgr.undoEdit') : t('nav.mgr.undoDelete'), count: undoStackCount })}
                        </button>
                      )}
                    </div>
                    <label className={`flex items-center gap-1 text-[10px] cursor-pointer ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <input
                        type="checkbox"
                        checked={hiddenMemoryIds.length === 0}
                        onChange={toggleAllMemories}
                        className="w-3 h-3 cursor-pointer"
                      />
                      {t('nav.mgr.selectAll')}
                    </label>
                  </div>
                  {favoriteIds.length > 0 && (
                    <div className="mb-2">
                      <div className={`text-[10px] mb-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                        ⭐ {t('nav.mgr.favorites', { count: favoriteIds.length })}
                      </div>
                      <div className="space-y-0.5">
                        {favoriteIds.map(id => {
                          const mem = allRawMemories.find(m => m.id === id);
                          if (!mem) return null;
                          return (
                            <button
                              key={id}
                              onClick={() => selectMemory(mem)}
                              className={`w-full text-left px-2 py-1 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                                isDark ? 'hover:bg-[#ffffff05] text-gray-400' : 'hover:bg-black/5 text-gray-600'
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: mem.color }} />
                              <span className="truncate">{memoryLabelT(language, mem.id, mem.label)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {similarMemoryIds.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className={`text-[10px] ${isDark ? 'text-[#00f2ff]' : 'text-[#0088cc]'}`}>
                          🔗 {t('nav.mgr.similarMemories', { count: similarMemoryIds.length })}
                        </div>
                        <button
                          onClick={clearSimilar}
                          className={`text-[9px] cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          {t('nav.mgr.clear')}
                        </button>
                      </div>
                      <div className="space-y-0.5">
                        {similarMemoryIds.map(id => {
                          const mem = allRawMemories.find(m => m.id === id);
                          if (!mem) return null;
                          return (
                            <button
                              key={id}
                              onClick={() => selectMemory(mem)}
                              className={`w-full text-left px-2 py-1 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                                isDark ? 'hover:bg-[#ffffff05] text-gray-400' : 'hover:bg-black/5 text-gray-600'
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: mem.color }} />
                              <span className="truncate">{memoryLabelT(language, mem.id, mem.label)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {capsules.length > 0 && (
                    <div className="mb-2">
                      <div className={`text-[10px] mb-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                        ⏳ {t('nav.mgr.timeCapsules', { count: capsules.length })}
                      </div>
                      <div className="space-y-0.5">
                        {capsules.map(cap => {
                          const mem = allRawMemories.find(m => m.id === cap.memoryId);
                          const unlockDate = new Date(cap.unlockDate);
                          const dateStr = `${unlockDate.getFullYear()}/${unlockDate.getMonth() + 1}/${unlockDate.getDate()}`;
                          const isReady = !cap.opened && Date.now() >= cap.unlockDate;
                          return (
                            <div
                              key={cap.id}
                              className={`px-2 py-1 rounded text-[10px] flex items-center gap-1 ${
                                isDark ? 'text-gray-500' : 'text-gray-500'
                              }`}
                            >
                              <span>{cap.opened ? '📬' : isReady ? '🎁' : '🔒'}</span>
                              <span className="truncate">{mem ? memoryLabelT(language, mem.id, mem.label) : cap.memoryId}</span>
                              <span className="ml-auto flex-shrink-0">{cap.opened ? t('timecapsule.opened') : dateStr}</span>
                              {isReady && (
                                <button
                                  onClick={() => openCapsule(cap.id)}
                                  className={`ml-1 px-1 py-0.5 rounded text-[9px] cursor-pointer ${
                                    isDark ? 'bg-[#ffb800]/15 text-[#ffb800]' : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {t('timecapsule.open')}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {farewellRecords.length > 0 && (
                    <div className="mb-2">
                      <div className={`text-[10px] mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        🪦 {t('nav.mgr.releasedMemories', { count: farewellRecords.length })}
                      </div>
                      <div className="space-y-0.5">
                        {farewellRecords.map(rec => {
                          const styleEmoji = rec.releaseStyle === '深海' ? '🌊' : rec.releaseStyle === '星光' ? '🔥' : '🌬';
                          const date = new Date(rec.releasedAt);
                          const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                          return (
                            <div
                              key={rec.id}
                              className={`px-2 py-1 rounded text-[10px] flex items-center gap-1 ${
                                isDark ? 'text-gray-600' : 'text-gray-400'
                              }`}
                            >
                              <span>{styleEmoji}</span>
                              <span className="truncate">{rec.memoryLabel}</span>
                              <span className="ml-auto flex-shrink-0">{dateStr}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {collections.length > 0 && (
                    <div className="mb-2">
                      <div className={`text-[10px] mb-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        📁 {t('nav.mgr.collections', { count: collections.length })}
                      </div>
                      {collections.map(col => (
                        <div key={col.id} className="mb-1">
                          <button
                            onClick={() => setExpandedCollection(expandedCollection === col.id ? null : col.id)}
                            className={`w-full text-left px-2 py-1 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                              isDark ? 'hover:bg-[#ffffff05] text-gray-400' : 'hover:bg-black/5 text-gray-600'
                            }`}
                          >
                            <span>{col.emoji}</span>
                            <span className="truncate">{col.name}</span>
                            <span className={`text-[9px] ml-auto ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                              {col.memoryIds.length}
                            </span>
                          </button>
                          {expandedCollection === col.id && (
                            <div className="ml-4 space-y-0.5 mt-0.5">
                              {col.memoryIds.map(id => {
                                const mem = allRawMemories.find(m => m.id === id);
                                if (!mem) return null;
                                return (
                                  <button
                                    key={id}
                                    onClick={() => selectMemory(mem)}
                                    className={`w-full text-left px-2 py-1 rounded text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${
                                      isDark ? 'hover:bg-[#ffffff05] text-gray-500' : 'hover:bg-black/5 text-gray-500'
                                    }`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: mem.color }} />
                                    <span className="truncate">{memoryLabelT(language, mem.id, mem.label)}</span>
                                  </button>
                                );
                              })}
                              {col.memoryIds.length === 0 && (
                                <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{t('nav.mgr.noMemories')}</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
                    {filtered.slice(-displayCount).reverse().map((mem, i) => (
                      <div key={mem.id}>
                        {editingId === mem.id ? (
                          <div className={`rounded p-2 border space-y-1.5 ${
                            isDark ? 'bg-[#1a1a2e]/50 border-[#ffffff08]' : 'bg-gray-100 border-gray-200'
                          }`}>
                            <input
                              id={`mem-item-edit-label-${i}`}
                              type="text"
                              value={editLabel}
                              onChange={e => setEditLabel(e.target.value)}
                              className={`w-full border rounded px-2 py-1 text-xs ${
                                isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                              }`}
                            />
                            <textarea
                              value={editSummary}
                              onChange={e => setEditSummary(e.target.value)}
                              rows={2}
                              className={`w-full border rounded px-2 py-1 text-xs resize-none ${
                                isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                              }`}
                            />
                            <div className="flex gap-1">
                              <button
                                id={`mem-item-save-${i}`}
                                onClick={() => saveEdit(mem.id)}
                                className={`flex-1 py-1 text-xs rounded transition-colors cursor-pointer ${
                                  isDark ? 'bg-[#00f2ff]/10 text-[#00f2ff] hover:bg-[#00f2ff]/20' : 'bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20'
                                }`}
                              >
                                {t('nav.mgr.save')}
                              </button>
                              <button
                                id={`mem-item-cancel-${i}`}
                                onClick={cancelEdit}
                                className={`flex-1 py-1 text-xs rounded transition-colors cursor-pointer ${
                                  isDark ? 'bg-[#ffffff08] text-gray-400 hover:bg-[#ffffff10]' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                }`}
                              >
                                {t('nav.mgr.cancel')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded relative ${
                              isDark ? 'hover:bg-[#ffffff05]' : 'hover:bg-black/5'
                            }`}
                            onMouseEnter={() => setHoveredId(mem.id)}
                            onMouseLeave={() => setHoveredId(null)}
                          >
                            <input
                              type="checkbox"
                              checked={!hiddenMemoryIds.includes(mem.id)}
                              onChange={() => toggleMemoryVisibility(mem.id)}
                              className="w-3 h-3 flex-shrink-0 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{mem.id}</span>
                                <span className="mx-1">·</span>
                                {(mem.dimensions.value.privacyLevel === '仅自己' || mem.dimensions.value.privacyLevel === '加密') && (
                                  <span className="mr-1">🔒</span>
                                )}
                                <span className={mem.dimensions.value.privacyLevel === '仅自己' ? 'blur-[3px] select-none' : ''}>{memoryLabelT(language, mem.id, mem.label)}</span>
                              </div>
                              {mem.tags && mem.tags.length > 0 && (
                                <div className="flex flex-wrap gap-0.5 mt-0.5">
                                  {mem.tags.map(tag => (
                                    <span
                                      key={tag}
                                      className={`inline-flex items-center gap-0.5 px-1 py-0 rounded text-[9px] font-medium ${
                                        isDark ? 'bg-[#00f2ff]/10 text-[#00f2ff]' : 'bg-[#0088cc]/10 text-[#0088cc]'
                                      }`}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button
                              id={`mem-item-tag-trigger-${i}`}
                              onClick={() => { setTagInputId(tagInputId === mem.id ? null : mem.id); setTagInputValue(''); }}
                              className={`text-xs cursor-pointer ${isDark ? 'text-gray-600 hover:text-[#00f2ff]' : 'text-gray-400 hover:text-[#0088cc]'}`}
                              title={t('nav.mgr.addTag')}
                            >
                              🏷
                            </button>
                            <button
                              id={`mem-item-edit-trigger-${i}`}
                              onClick={() => startEdit(mem)}
                              className={`text-xs cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => {
                                if (confirmDeleteId === mem.id) {
                                  deleteMemory(mem.id);
                                  addToast(t('toast.deleted'));
                                  setConfirmDeleteId(null);
                                } else {
                                  setConfirmDeleteId(mem.id);
                                }
                              }}
                              className={`text-xs cursor-pointer transition-colors ${
                                confirmDeleteId === mem.id
                                  ? 'text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded'
                                  : 'text-gray-600 hover:text-red-400'
                              }`}
                            >
                              {confirmDeleteId === mem.id ? t('nav.mgr.confirmDelete') : '🗑'}
                            </button>
                            {hoveredId === mem.id && (
                              <div className={`absolute left-0 top-full mt-1 w-64 p-3 rounded-lg shadow-2xl border text-xs ${
                                isDark ? 'bg-[#0d1525] border-[#ffffff20] text-gray-200' : 'bg-white border-gray-200 text-gray-700'
                              }`} style={{ backdropFilter: 'none', zIndex: Z_INDEX.DROPDOWN }}>
                                <p className={`mb-1.5 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {memorySummaryT(language, mem.id, mem.summary).length > 60 ? memorySummaryT(language, mem.id, mem.summary).slice(0, 60) + '...' : memorySummaryT(language, mem.id, mem.summary)}
                                </p>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: mem.color }} />
                                  <span>{emotionNameT(language, mem.dimensions.emotional.primary)}</span>
                                  <span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                    ({mem.dimensions.emotional.intensity.toFixed(2)})
                                  </span>
                                </div>
                                {mem.dimensions.social.persons.length > 0 && (
                                  <div className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                                    👤 {joinContentT(language, mem.dimensions.social.persons)}
                                  </div>
                                )}
                                <div className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                                  📍 {placeT(language, mem.dimensions.spatial.placeType)}
                                </div>
                                {mem.tags && mem.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-0.5 mt-1.5">
                                    {mem.tags.map(tag => (
                                      <span key={tag} className={`px-1 py-0.5 rounded text-[9px] ${isDark ? 'bg-[#00f2ff]/10 text-[#00f2ff]' : 'bg-[#0088cc]/10 text-[#0088cc]'}`}>{tag}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            {tagInputId === mem.id && (
                              <div className={`absolute left-0 top-full mt-1 w-48 p-2 rounded-lg shadow-2xl border ${
                                isDark ? 'bg-[#0d1525] border-[#ffffff20]' : 'bg-white border-gray-200'
                              }`} style={{ zIndex: Z_INDEX.DROPDOWN }}>
                                <div className="flex gap-1 mb-1.5">
                                  <input
                                    type="text"
                                    value={tagInputValue}
                                    onChange={e => setTagInputValue(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter' && tagInputValue.trim()) {
                                        addTag(mem.id, tagInputValue.trim());
                                        setTagInputValue('');
                                      }
                                    }}
                                    placeholder={t('nav.mgr.tagInputPlaceholder')}
                                    autoFocus
                                    className={`flex-1 border rounded px-2 py-1 text-[10px] ${
                                      isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                                    }`}
                                  />
                                  <button
                                    onClick={() => {
                                      if (tagInputValue.trim()) {
                                        addTag(mem.id, tagInputValue.trim());
                                        setTagInputValue('');
                                      }
                                    }}
                                    className={`px-1.5 py-1 rounded text-[10px] cursor-pointer ${
                                      isDark ? 'bg-[#00f2ff]/15 text-[#00f2ff]' : 'bg-[#0088cc]/15 text-[#0088cc]'
                                    }`}
                                  >
                                    +
                                  </button>
                                </div>
                                {mem.tags && mem.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-0.5">
                                    {mem.tags.map(tag => (
                                      <button
                                        key={tag}
                                        onClick={() => removeTag(mem.id, tag)}
                                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] cursor-pointer transition-colors ${
                                          isDark ? 'bg-[#00f2ff]/10 text-[#00f2ff] hover:bg-red-500/20 hover:text-red-400' : 'bg-[#0088cc]/10 text-[#0088cc] hover:bg-red-100 hover:text-red-600'
                                        }`}
                                        title={t('nav.mgr.deleteTag', { tag })}
                                      >
                                        {tag} ×
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {filtered.length > displayCount && (
                    <button
                      onClick={() => setDisplayCount(prev => prev + 30)}
                      className={`w-full py-1 mt-1 text-xs rounded transition-colors cursor-pointer ${
                        isDark ? 'bg-[#ffffff08] text-gray-400 hover:bg-[#ffffff12]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {t('nav.mgr.loadMore', { count: filtered.length - displayCount })}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`p-3 border-t ${isDark ? 'border-[#ffffff08]' : 'border-gray-200'}`}>
        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {breadcrumbs.length > 0 ? (
            <div className="flex items-center gap-1">
              {breadcrumbs.map((crumb, i) => (
                <span key={i}>
                  {i === 0 ? navCategoryT(language, crumb) : navSubCategoryT(language, crumb)}
                  {i < breadcrumbs.length - 1 && <span className="text-gray-700 mx-1">→</span>}
                </span>
              ))}
            </div>
          ) : (
            <span>{t('nav.selectCategory')}</span>
          )}
        </div>
      </div>
    </div>

    <AnimatePresence>
      {showStoryBoard && (
        <motion.div
          initial={{ x: 500, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 500, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`fixed right-0 top-0 h-full w-full max-w-[500px] backdrop-blur-xl border-l z-30 shadow-2xl overflow-hidden flex flex-col ${
            isDark ? 'bg-[#0d0d1a] border-[#ffffff08]' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-inherit flex-shrink-0">
            <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              📖 {t('nav.storyboard')}
            </h2>
            <button
              onClick={() => setShowStoryBoard(false)}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isDark ? 'text-gray-400 hover:text-white hover:bg-[#ffffff10]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <StoryWeaver onClose={() => setShowStoryBoard(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  </>);
}