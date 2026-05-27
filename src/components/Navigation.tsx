import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import type { RawMemory, EmotionType } from '../types';
import { EMOTION_COLORS } from '../types';
import { chatgptRawMemories, chatgptInsightMemories } from '../data/chatgptData';
import { generateStory } from '../utils/storyUtils';
import { getMemoryCategoryPaths } from '../utils/navUtils';

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

const EMOTION_LABELS: Record<EmotionType, string> = {
  '快乐': '😊 快乐',
  '悲伤': '😢 悲伤',
  '愤怒': '😠 愤怒',
  '惊讶': '😲 惊讶',
  '恐惧': '😨 恐惧',
  '厌恶': '🤢 厌恶',
  '中性': '😐 中性',
  '好奇': '🤔 好奇',
  '骄傲': '😎 骄傲',
  '沮丧': '😞 沮丧',
  '感激': '🥹 感激',
  '思念': '💭 思念',
};

let createIdCounter = 2000;

export default function NavigationSidebar() {
  const {
    navCategory, navSubCategory,
    setNavCategory, setNavSubCategory,
    rawMemories, addMemory, deleteMemory, updateMemory,
    hideRawOnly, hideInsightOnly, toggleHideRaw, toggleHideInsight,
    insightMemories, theme, selectMemory, selectedMemory,
    showChatGPT, toggleShowChatGPT,
    chatgptImportStatus, chatgptImportProgress, startChatGPTImport,
    hiddenMemoryIds, allRawMemories, toggleMemoryVisibility, toggleAllMemories,
  } = useAppState();
  const isDark = theme === 'dark';
  const chatgptCount = chatgptRawMemories.length + chatgptInsightMemories.length;
  const allRawMemoriesRef = useRef(allRawMemories);
  allRawMemoriesRef.current = allRawMemories;
  const [collapsed, setCollapsed] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showMemoryMgr, setShowMemoryMgr] = useState(false);
  const [showStoryBoard, setShowStoryBoard] = useState(false);

  const storyChapters = useMemo(
    () => generateStory(rawMemories, insightMemories),
    [rawMemories, insightMemories]
  );

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

  const [formOpen, setFormOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(30);

  const [label, setLabel] = useState('');
  const [summary, setSummary] = useState('');
  const [emotion, setEmotion] = useState<EmotionType>('快乐');
  const [placeType, setPlaceType] = useState<RawMemory['dimensions']['spatial']['placeType']>('家');
  const [storyline, setStoryline] = useState('');

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
    const q = searchText.toLowerCase();
    return m.id.toLowerCase().includes(q)
      || m.label.toLowerCase().includes(q)
      || m.summary.toLowerCase().includes(q);
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
        social: { persons: [], relationship: [], groupInteraction: false, intimacy: 0.3 },
        emotional: { primary: emotion, intensity: 0.7, trigger: '用户手动添加' },
        activity: { type: '活动', detail: summary },
        sensory: { images: [], audio: [], videos: [], interactions: [] },
        semantic: { knowledge: [], preferences: {}, skills: [] },
        value: { importance: 0.3, cqi: 0.2, accessCount: 0, privacyLevel: '家庭可见' },
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
    setLabel('');
    setSummary('');
    setEmotion('快乐');
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
          onClick={() => setCollapsed(false)}
          className={`transition-colors mb-3 cursor-pointer ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
          title="展开导航"
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
        <h2 className={`font-medium text-sm tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>🧭 记忆导航</h2>
        <button
          onClick={() => setCollapsed(true)}
          className={`transition-colors cursor-pointer ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
          title="收起导航"
        >
          ◀
        </button>
      </div>

      {connectionPaths.length > 0 && (
        <div className={`px-4 py-2 border-b text-xs ${isDark ? 'border-[#ffffff08] bg-[#ffb800]/5' : 'border-gray-200 bg-[#cc8800]/5'}`}>
          <div className={`font-medium mb-1 ${isDark ? 'text-[#ffb800]' : 'text-[#cc8800]'}`}>
            🔗 连接路径 ({connectionPaths.length})
          </div>
          <div className="space-y-0.5">
            {connectionPaths.map(p => (
              <div key={`${p.category}/${p.subCategory}`} className={`${isDark ? 'text-[#ffb800]/80' : 'text-[#cc8800]/80'}`}>
                {p.categoryIcon} {p.category} → {p.subCategoryIcon} {p.subCategory}
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
              <span>{category}</span>
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
                    {s.icon} {s.id}
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
          <span>📖 图例说明</span>
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
              <div className="px-4 pb-3 text-xs space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}">
                <div className="space-y-1.5">
                  <div className="font-medium ${isDark ? 'text-gray-500' : 'text-gray-700'}">记忆点类型</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#00f2ff] inline-block flex-shrink-0" />
                    <span>彩色粒子 — 原始记忆原子</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ffb800] inline-block flex-shrink-0" style={{ boxShadow: '0 0 6px #ffb800' }} />
                    <span>金色圆环 — 洞察记忆</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="font-medium ${isDark ? 'text-gray-500' : 'text-gray-700'}">连线含义</div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-[2px] bg-[#ffb800]/40 flex-shrink-0" />
                    <span>金色实线 — 因果关系</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-[2px] bg-[#ffb800]/20 flex-shrink-0" />
                    <span>金色虚线 — 支撑关系</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-[2px] bg-[#4488ff]/20 flex-shrink-0" />
                    <span>蓝色虚线 — 关联关系</span>
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
                    🔵 原始记忆 {hideRawOnly ? '(隐藏)' : rawMemories.length}
                  </button>
                  <button
                    onClick={toggleHideInsight}
                    className={`px-2 py-1 rounded text-xs transition-all cursor-pointer ${
                      hideInsightOnly ? `${isDark ? 'bg-[#1a1a2e] text-gray-500' : 'bg-gray-100 text-gray-400'}` : `${isDark ? 'bg-[#ffb800]/10 text-[#ffb800]' : 'bg-[#cc8800]/10 text-[#cc8800]'}`
                    }`}
                  >
                    🟡 洞察记忆 {hideInsightOnly ? '(隐藏)' : insightMemories.length}
                  </button>
                </div>

                <div className="space-y-1">
                  <div className={`font-medium ${isDark ? 'text-gray-500' : 'text-gray-700'}`}>粒子颜色 = 情绪色彩</div>
                  <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                    {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
                      <div key={emotion} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className={`${isDark ? 'text-gray-600' : 'text-gray-500'}`}>{EMOTION_LABELS[emotion as EmotionType] || emotion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`border-t ${isDark ? 'border-[#ffffff08]' : 'border-gray-200'}`}>
        <button
          id="nav-memory-mgr"
          onClick={() => { setShowMemoryMgr(!showMemoryMgr); setShowLegend(false); setShowStoryBoard(false); }}
          className={`w-full text-left px-4 py-2 text-xs transition-all flex items-center justify-between cursor-pointer ${
            isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-[#ffffff05]' : 'text-gray-500 hover:text-gray-700 hover:bg-black/5'
          }`}
        >
          <span>⚙️ 记忆管理</span>
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
                  placeholder="搜索记忆 ID / 标签 / 摘要..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className={`w-full border rounded px-2 py-1.5 text-xs placeholder-gray-600 ${
                    isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-700'
                  }`}
                />

                <div className={`rounded border p-2 text-xs ${
                  isDark ? 'bg-[#1a1a2e]/50 border-[#ffffff08]' : 'bg-gray-100 border-gray-200'
                }`}>
                  <div className={`text-[10px] mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>🤖 外部 Agent 记忆</div>
                  <button
                    id="nav-chatgpt-import"
                    onClick={chatgptImportStatus === 'idle' ? startChatGPTImport : toggleShowChatGPT}
                    disabled={chatgptImportStatus === 'importing'}
                    className={`px-2 py-1 rounded text-xs transition-all cursor-pointer w-full text-left ${
                      chatgptImportStatus === 'importing'
                        ? isDark ? 'bg-[#1a1a2e] text-gray-500 cursor-wait' : 'bg-gray-100 text-gray-400 cursor-wait'
                        : showChatGPT
                          ? `${isDark ? 'bg-[#10a37f]/10 text-[#10a37f]' : 'bg-[#10a37f]/10 text-[#10a37f]'}`
                          : `${isDark ? 'bg-[#1a1a2e] text-gray-500 hover:bg-[#ffffff08]' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>ChatGPT {
                        chatgptImportStatus === 'importing'
                          ? `导入中 ${chatgptImportProgress}%`
                          : chatgptImportStatus === 'done'
                            ? '已导入'
                            : `未导入 (${chatgptCount})`
                      }</span>
                      {chatgptImportStatus === 'idle' && (
                        <span className="text-[10px] opacity-50">导入</span>
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

                <button
                  onClick={() => setFormOpen(!formOpen)}
                  className={`w-full py-1.5 border rounded text-xs transition-colors cursor-pointer ${
                    isDark ? 'bg-[#00f2ff]/10 border-[#00f2ff]/20 text-[#00f2ff] hover:bg-[#00f2ff]/20' : 'bg-[#0088cc]/10 border-[#0088cc]/20 text-[#0088cc] hover:bg-[#0088cc]/20'
                  }`}
                >
                  {formOpen ? '取消' : '➕ 新建记忆原子'}
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
                          placeholder="标签（必填）"
                          value={label}
                          onChange={e => setLabel(e.target.value)}
                          className={`w-full border rounded px-2 py-1 text-xs placeholder-gray-600 ${
                            isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                          }`}
                        />
                        <textarea
                          placeholder="摘要描述（必填）"
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
                              <option key={e} value={e}>{e}</option>
                            ))}
                          </select>
                          <select
                            value={placeType}
                            onChange={e => setPlaceType(e.target.value as any)}
                            className={`flex-1 border rounded px-1.5 py-1 text-xs ${
                              isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                            }`}
                          >
                            <option value="家">🏠 家</option>
                            <option value="学校">🏫 学校</option>
                            <option value="公园">🌳 公园</option>
                            <option value="游乐场">🎡 游乐场</option>
                            <option value="商场">🛍️ 商场</option>
                            <option value="其他">📍 其他</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          placeholder="故事线标签（可选）"
                          value={storyline}
                          onChange={e => setStoryline(e.target.value)}
                          className={`w-full border rounded px-2 py-1 text-xs placeholder-gray-600 ${
                            isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                          }`}
                        />
                        <button
                          onClick={handleCreate}
                          className={`w-full py-1 text-xs rounded transition-colors cursor-pointer ${
                            isDark ? 'bg-[#00f2ff]/15 text-[#00f2ff] hover:bg-[#00f2ff]/25' : 'bg-[#0088cc]/15 text-[#0088cc] hover:bg-[#0088cc]/25'
                          }`}
                        >
                          创建记忆原子
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                      共 {filtered.length} 条 {searchText ? '（已筛选）' : ''}
                    </p>
                    <label className={`flex items-center gap-1 text-[10px] cursor-pointer ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <input
                        type="checkbox"
                        checked={hiddenMemoryIds.length === 0}
                        onChange={toggleAllMemories}
                        className="w-3 h-3 cursor-pointer"
                      />
                      全选
                    </label>
                  </div>
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
                                保存
                              </button>
                              <button
                                id={`mem-item-cancel-${i}`}
                                onClick={cancelEdit}
                                className={`flex-1 py-1 text-xs rounded transition-colors cursor-pointer ${
                                  isDark ? 'bg-[#ffffff08] text-gray-400 hover:bg-[#ffffff10]' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                }`}
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                            isDark ? 'hover:bg-[#ffffff05]' : 'hover:bg-black/5'
                          }`}>
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
                                <span>{mem.label}</span>
                              </div>
                            </div>
                            <button
                              id={`mem-item-edit-trigger-${i}`}
                              onClick={() => startEdit(mem)}
                              className={`text-xs cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteMemory(mem.id)}
                              className="text-xs cursor-pointer text-gray-600 hover:text-red-400"
                            >
                              🗑
                            </button>
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
                      加载更多（还有 {filtered.length - displayCount} 条）
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`border-t ${isDark ? 'border-[#ffffff08]' : 'border-gray-200'}`}>
        <button
          id="nav-storyboard"
          onClick={() => { setShowStoryBoard(!showStoryBoard); setShowLegend(false); setShowMemoryMgr(false); }}
          className={`w-full text-left px-4 py-2 text-xs transition-all flex items-center justify-between cursor-pointer ${
            isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-[#ffffff05]' : 'text-gray-500 hover:text-gray-700 hover:bg-black/5'
          }`}
        >
          <span>📖 小哥说我</span>
          <span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{showStoryBoard ? '▲' : '▼'}</span>
        </button>
      </div>

      <div className={`p-3 border-t ${isDark ? 'border-[#ffffff08]' : 'border-gray-200'}`}>
        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {breadcrumbs.length > 0 ? (
            <div className="flex items-center gap-1">
              {breadcrumbs.map((crumb, i) => (
                <span key={i}>
                  {crumb}
                  {i < breadcrumbs.length - 1 && <span className="text-gray-700 mx-1">→</span>}
                </span>
              ))}
            </div>
          ) : (
            <span>选择分类以导航记忆</span>
          )}
        </div>
      </div>
    </div>

    <AnimatePresence>
      {showStoryBoard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowStoryBoard(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`relative w-full max-w-2xl max-h-[85vh] mx-4 rounded-xl shadow-2xl overflow-hidden ${
              isDark ? 'bg-[#0a0a0f]/95 border border-[#ffffff08]' : 'bg-white/95 border border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-inherit">
              <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                📖 小哥说我
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
            <div className={`px-6 py-5 space-y-6 overflow-y-auto max-h-[calc(85vh-70px)] ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {storyChapters.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  暂无足够记忆来生成故事
                </p>
              ) : (
                storyChapters.map((chapter, ci) => (
                  <div key={ci}>
                    <div className={`text-xs uppercase tracking-widest mb-3 ${
                      chapter.type === 'past'
                        ? isDark ? 'text-[#00f2ff]/70' : 'text-[#0088cc]/70'
                        : isDark ? 'text-[#ffb800]/70' : 'text-[#cc8800]/70'
                    }`}>
                      {chapter.type === 'past' ? '🏃 过去' : '🔮 未来'} · {chapter.title}
                    </div>
                    {chapter.imageUrls.length > 0 && (
                      <div className={`mb-4 p-2 rounded-lg ${
                        isDark ? 'bg-[#ffffff05]' : 'bg-gray-50'
                      }`}>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {chapter.imageUrls.map((url, imgIdx) => (
                            <img
                              key={imgIdx}
                              src={url}
                              alt={`记忆配图 ${imgIdx + 1}`}
                              className="h-40 object-cover rounded flex-shrink-0 shadow-sm"
                              style={{ minWidth: chapter.imageUrls.length === 1 ? '100%' : '200px' }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {chapter.text.split('\n\n').map((paragraph, pi) => {
                      const paragraphCitations = chapter.citations[pi] || [];
                      return (
                        <div key={pi} className="mb-3">
                          <p className={`text-sm leading-relaxed ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {paragraph}
                          </p>
                          {paragraphCitations.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                              <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>依据：</span>
                              {paragraphCitations.map(cit => (
                                <button
                                  key={cit.memoryId}
                                  onClick={() => {
                                    const allMems = [...rawMemories, ...insightMemories];
                                    const mem = allMems.find(m => m.id === cit.memoryId);
                                    if (mem) selectMemory(mem);
                                    setShowStoryBoard(false);
                                  }}
                                  className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                                    isDark
                                      ? 'bg-[#ffffff08] text-[#00f2ff]/70 hover:bg-[#ffffff12] hover:text-[#00f2ff]'
                                      : 'bg-gray-100 text-[#0088cc]/70 hover:bg-gray-200 hover:text-[#0088cc]'
                                  }`}
                                  title={`查看记忆 ${cit.memoryId}`}
                                >
                                  {cit.memoryId} · {cit.shortDescription}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </>);
}