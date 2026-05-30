import { AppProvider, useAppState } from './store/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import MemCloud3D from './components/MemCloud3D';
import NavigationSidebar from './components/Navigation';
import DetailPanel from './components/DetailPanel';
import ChatPanel from './components/ChatPanel';
import ValueDashboard from './components/ValueDashboard';
import MemoryBank from './components/MemoryBank';
import ToastContainer from './components/Toast';
import DailyMemoryCard from './components/DailyMemoryCard';
import TimelineScrubber from './components/TimelineScrubber';
import SerendipityModal from './components/SerendipityModal';
import AnnualReport from './components/AnnualReport';
import OnboardingOverlay from './components/OnboardingOverlay';
import MemorySurprise from './components/MemorySurprise';
import DreamWeaver from './components/DreamWeaver';
import FakeCursor from './components/AutoDemo/FakeCursor';
import MemoryReader from './components/MemoryReader';
import ConfusionDiary from './components/ConfusionDiary';
import UserProfile from './components/UserProfile';
import SocialGraph from './components/SocialGraph';
import KnowledgeGap from './components/KnowledgeGap';
import MemoryCinema from './components/MemoryCinema';
import FlywheelFeedback from './components/FlywheelFeedback';
import MorePanel from './components/MorePanel';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { EMOTION_COLORS } from './types';
import { generateConfusionReport } from './utils/confusionUtils';

const DEFAULT_BG_DARK = '#0a101f';
const DEFAULT_BG_LIGHT = '#f5f6f8';

function AppInner() {
  const { rawMemories, insightMemories, detailOpen, theme, toggleTheme, selectMemory, currentView, setCurrentView, searchQuery, setSearchQuery, resetAllFilters } = useAppState();
  const isDark = theme === 'dark';
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSerendipity, setShowSerendipity] = useState(false);
  const [showAnnualReport, setShowAnnualReport] = useState(false);
  const [showDream, setShowDream] = useState(false);
  const [showReader, setShowReader] = useState(false);
  const [showConfusion, setShowConfusion] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [showGap, setShowGap] = useState(false);
  const [showCinema, setShowCinema] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [readerMemory, setReaderMemory] = useState<any>(null);

  const handleStopDemo = useCallback(() => setIsDemoPlaying(false), []);

  const hasConfusion = useMemo(
    () => generateConfusionReport(rawMemories, insightMemories).hasConfusion,
    [rawMemories, insightMemories]
  );

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;

      if (e.key === 'Escape') {
        if (showMore) { setShowMore(false); return; }
        if (showCinema) { setShowCinema(false); return; }
        if (showGap) { setShowGap(false); return; }
        if (showSocial) { setShowSocial(false); return; }
        if (showProfile) { setShowProfile(false); return; }
        if (showConfusion) { setShowConfusion(false); return; }
        if (showSerendipity) { setShowSerendipity(false); return; }
        if (showSearch && searchQuery) { setSearchQuery(''); return; }
        if (showSearch) { setShowSearch(false); return; }
        return;
      }

      if (isInput) return;

      if (e.key === '1') { setCurrentView('全局视图'); return; }
      if (e.key === '2') { setCurrentView('家庭视图'); return; }
      if (e.key === '3') { setCurrentView('学习视图'); return; }
      if (e.key === '4') { setCurrentView('情绪视图'); return; }

      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        // Could show help panel; for now toggle theme as a demo
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCinema, showGap, showSocial, showProfile, showConfusion, showSerendipity, showSearch, searchQuery, setCurrentView, setSearchQuery, setShowSearch]);

  // Bridge FakeCursor custom events → React context
  useEffect(() => {
    if (!isDemoPlaying) return;

    const onSelectMemory = (e: Event) => {
      const id = (e as CustomEvent).detail?.id;
      if (!id) return;
      const mem = rawMemories.find(m => m.id === id) || insightMemories.find(m => m.id === id);
      if (mem) selectMemory(mem);
    };
    const onCloseDetail = () => selectMemory(null);
    const onDetailEdit = () => {
      window.dispatchEvent(new CustomEvent('demo-detail-edit-internal'));
    };
    const onDetailCancelEdit = () => {
      window.dispatchEvent(new CustomEvent('demo-detail-cancel-edit-internal'));
    };
    const onChatExpand = (e: Event) => {
      window.dispatchEvent(new CustomEvent('demo-chat-expand-internal', { detail: (e as CustomEvent).detail }));
    };
    const onCloseSerendipity = () => setShowSerendipity(false);
    const onCloseAnnualReport = () => setShowAnnualReport(false);
    const onCloseDream = () => setShowDream(false);
    const onCloseCinema = () => setShowCinema(false);
    const onResetFilters = () => resetAllFilters();

    window.addEventListener('demo-select-memory', onSelectMemory);
    window.addEventListener('demo-close-detail', onCloseDetail);
    window.addEventListener('demo-detail-edit', onDetailEdit);
    window.addEventListener('demo-detail-cancel-edit', onDetailCancelEdit);
    window.addEventListener('demo-chat-expand', onChatExpand);
    window.addEventListener('demo-close-serendipity', onCloseSerendipity);
    window.addEventListener('demo-close-annual-report', onCloseAnnualReport);
    window.addEventListener('demo-close-dream', onCloseDream);
    window.addEventListener('demo-close-cinema', onCloseCinema);
    window.addEventListener('demo-reset-filters', onResetFilters);

    return () => {
      window.removeEventListener('demo-select-memory', onSelectMemory);
      window.removeEventListener('demo-close-detail', onCloseDetail);
      window.removeEventListener('demo-detail-edit', onDetailEdit);
      window.removeEventListener('demo-detail-cancel-edit', onDetailCancelEdit);
      window.removeEventListener('demo-chat-expand', onChatExpand);
      window.removeEventListener('demo-close-serendipity', onCloseSerendipity);
      window.removeEventListener('demo-close-annual-report', onCloseAnnualReport);
      window.removeEventListener('demo-close-dream', onCloseDream);
      window.removeEventListener('demo-close-cinema', onCloseCinema);
      window.removeEventListener('demo-reset-filters', onResetFilters);
    };
  }, [isDemoPlaying, rawMemories, insightMemories, selectMemory]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden font-sans"
      data-theme={theme}
      style={{ background: isDark ? DEFAULT_BG_DARK : DEFAULT_BG_LIGHT }}
    >
      <MemCloud3D bgColor={isDark ? DEFAULT_BG_DARK : DEFAULT_BG_LIGHT} theme={theme} />
      <DailyMemoryCard />
      <MemorySurprise />

      {/* Ambient atmosphere indicator bar */}
      {(() => {
        const counts: Record<string, number> = {};
        rawMemories.forEach(m => {
          const e = m.dimensions.emotional.primary;
          counts[e] = (counts[e] || 0) + 1;
        });
        const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
        const topEmotion = top?.[0] || '中性';
        const topColor = EMOTION_COLORS[topEmotion as keyof typeof EMOTION_COLORS] || '#888';
        const topPct = rawMemories.length > 0 ? Math.round((top?.[1] || 0) / rawMemories.length * 100) : 0;

        return (
          <div className="absolute top-0 left-0 right-0 z-30 h-1" title={`${topEmotion} ${topPct}%`}>
            <div
              className="h-full transition-all duration-2000"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${topColor}40 ${topPct}%, transparent 100%)`,
              }}
            />
          </div>
        );
      })()}

      <div className={`absolute left-0 top-0 h-full z-20 backdrop-blur-sm border-r ${
        isDark ? 'bg-[#0d1525] border-[#ffffff08]' : 'bg-white border-gray-200'
      }`}>
        <NavigationSidebar />
      </div>

      <DetailPanel />
      <ChatPanel />
      <ValueDashboard />
      <MemoryBank />

      <div className="absolute top-6 left-[240px] z-10 flex items-center gap-3">
        <h1 className={`text-lg font-light tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
          <span className={`font-normal ${isDark ? 'text-[#00f2ff]' : 'text-[#0088cc]'}`}>Graph</span>Me
        </h1>
        <div className={`flex rounded-lg p-0.5 text-xs backdrop-blur-sm ${
          isDark ? 'bg-[#ffffff08]' : 'bg-black/5'
        }`}>
          {(['全局视图', '家庭视图', '学习视图', '情绪视图'] as const).map(view => (
            <button
              key={view}
              id={`btn-view-${view}`}
              onClick={() => setCurrentView(view)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                currentView === view
                  ? isDark ? 'bg-[#00f2ff]/20 text-[#00f2ff]' : 'bg-[#0088cc]/20 text-[#0088cc]'
                  : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {view === '全局视图' ? '🌐 全局' : view === '家庭视图' ? '🏠 家庭' : view === '学习视图' ? '🎓 学习' : '😊 情绪'}
            </button>
          ))}
        </div>
      </div>

      <div className={`absolute bottom-6 left-[240px] z-10 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        <span>{rawMemories.length} 记忆原子</span>
        <span className="mx-2">·</span>
        <span>{insightMemories.length} 洞察记忆</span>
      </div>

      {/* Watermark — same style as memory count, right-aligned to timeline endpoint */}
      <div className={`absolute bottom-6 left-[240px] right-0 z-10 pointer-events-none select-none flex justify-end pr-[120px]`}>
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          wukun2005@gmail.com
        </span>
      </div>

      <TimelineScrubber />

      <div className={`absolute top-4 z-20 flex flex-wrap items-center justify-end gap-1.5 max-w-[520px] transition-all duration-300 ${
        detailOpen ? 'right-[436px]' : 'right-4'
      }`}>
        {!isDemoPlaying && (
          <button
            id="btn-auto-demo"
            title="一键演示"
            onClick={() => setIsDemoPlaying(true)}
            className={`px-3 py-1.5 text-xs rounded-lg backdrop-blur-sm transition-all font-medium cursor-pointer ${
              isDark
                ? 'bg-gradient-to-r from-[#00f2ff]/20 to-[#ffb800]/20 hover:from-[#00f2ff]/30 hover:to-[#ffb800]/30 text-[#00f2ff] border border-[#00f2ff]/20 hover:border-[#00f2ff]/40'
                : 'bg-gradient-to-r from-[#0088cc]/10 to-[#cc8800]/10 hover:from-[#0088cc]/20 hover:to-[#cc8800]/20 text-[#0088cc] border border-[#0088cc]/20 hover:border-[#0088cc]/40'
            }`}
          >
            ▶
          </button>
        )}
        {showSearch && (
          <div className="relative">
            <input
              id="demo-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索记忆..."
              autoFocus
              onBlur={() => { if (!searchQuery) setShowSearch(false); }}
              className={`px-3 pr-7 py-1.5 text-xs rounded-lg backdrop-blur-sm border focus:outline-none w-48 ${
                isDark
                  ? 'bg-[#0d1525] border-[#00f2ff]/30 text-gray-300 placeholder-gray-600 focus:border-[#00f2ff]/50'
                  : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400 focus:border-[#0088cc]/50'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); }}
                className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs cursor-pointer transition-colors ${
                  isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                ✕
              </button>
            )}
          </div>
        )}
        <button
          id="btn-search"
          onClick={() => setShowSearch(!showSearch)}
          className={`px-3 py-1.5 text-xs rounded-lg backdrop-blur-sm transition-all ${
            showSearch
              ? isDark ? 'bg-[#00f2ff]/20 text-[#00f2ff]' : 'bg-[#0088cc]/20 text-[#0088cc]'
              : isDark ? 'bg-[#ffffff10] hover:bg-[#ffffff18] text-gray-400 hover:text-gray-200' : 'bg-black/5 hover:bg-black/10 text-gray-600 hover:text-gray-800'
          }`}
        >
          🔍
        </button>
        <button
          id="btn-serendipity"
          title="碰碰对"
          onClick={() => setShowSerendipity(true)}
          className={`px-3 py-1.5 text-xs rounded-lg backdrop-blur-sm transition-all ${
            isDark
              ? 'bg-[#ffffff10] hover:bg-[#ffffff18] text-gray-400 hover:text-gray-200'
              : 'bg-black/5 hover:bg-black/10 text-gray-600 hover:text-gray-800'
          }`}
        >
          🎲 碰碰对
        </button>
        <button
          id="btn-cinema"
          title="记忆微电影"
          onClick={() => setShowCinema(true)}
          className={`px-3 py-1.5 text-xs rounded-lg backdrop-blur-sm transition-all ${
            isDark
              ? 'bg-[#ffffff10] hover:bg-[#ffffff18] text-gray-400 hover:text-gray-200'
              : 'bg-black/5 hover:bg-black/10 text-gray-600 hover:text-gray-800'
          }`}
        >
          🎬 微电影
        </button>
        <div className="relative">
          <button
            id="btn-more"
            title="更多功能"
            onClick={() => setShowMore(!showMore)}
            className={`px-3 py-1.5 text-xs rounded-lg backdrop-blur-sm transition-all ${
              showMore
                ? isDark ? 'bg-[#00f2ff]/20 text-[#00f2ff]' : 'bg-[#0088cc]/20 text-[#0088cc]'
                : isDark ? 'bg-[#ffffff10] hover:bg-[#ffffff18] text-gray-400 hover:text-gray-200'
                : 'bg-black/5 hover:bg-black/10 text-gray-600 hover:text-gray-800'
            }`}
          >
            ⋯ 更多
          </button>
          <MorePanel
            theme={theme}
            isShow={showMore}
            onClose={() => setShowMore(false)}
            features={[
              { id: 'profile', emoji: '👤', label: '小哥眼中的你', description: 'AI 对你的结构化认知', onClick: () => setShowProfile(true) },
              { id: 'social', emoji: '🕸️', label: '关系星图', description: 'AI 眼中的你的社交宇宙', onClick: () => setShowSocial(true) },
              { id: 'gap', emoji: '🧩', label: '了解程度', description: 'AI 对你了解多少？', onClick: () => setShowGap(true) },
              { id: 'annual', emoji: '📈', label: '记忆年报', description: '你的年度记忆报告', onClick: () => setShowAnnualReport(true) },
              { id: 'dream', emoji: '🌙', label: '记忆梦境', description: 'AI 重组记忆碎片', onClick: () => setShowDream(true) },
              { id: 'reader', emoji: '📖', label: '阅读模式', description: '沉浸式翻阅记忆', onClick: () => setShowReader(true) },
              ...(hasConfusion ? [{ id: 'confusion', emoji: '🤔', label: '困惑日记', description: 'AI 还有哪些不解', onClick: () => setShowConfusion(true) }] : []),
            ]}
          />
        </div>
        <button
          onClick={toggleTheme}
          title={isDark ? '切换亮色' : '切换暗色'}
          className={`px-3 py-1.5 text-xs rounded-lg backdrop-blur-sm transition-all ${
            isDark
              ? 'bg-[#ffffff10] hover:bg-[#ffffff18] text-gray-400 hover:text-gray-200'
              : 'bg-black/5 hover:bg-black/10 text-gray-600 hover:text-gray-800'
          }`}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      <ToastContainer />
      <SerendipityModal open={showSerendipity} onClose={() => setShowSerendipity(false)} />
      <AnnualReport open={showAnnualReport} onClose={() => setShowAnnualReport(false)} />
      <ConfusionDiary open={showConfusion} onClose={() => setShowConfusion(false)} />
      <UserProfile open={showProfile} onClose={() => setShowProfile(false)} />
      <SocialGraph open={showSocial} onClose={() => setShowSocial(false)} />
      <KnowledgeGap open={showGap} onClose={() => setShowGap(false)} />
      <MemoryCinema open={showCinema} onClose={() => setShowCinema(false)} memories={rawMemories} theme={theme} />
      <FlywheelFeedback />

      <AnimatePresence>
        {showDream && (
          <motion.div
            initial={{ x: 500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 h-full w-full max-w-[420px] backdrop-blur-xl border-l z-30 shadow-2xl overflow-hidden flex flex-col ${
              isDark ? 'bg-[#0d0d1a] border-[#ffffff08]' : 'bg-white border-gray-200'
            }`}
          >
            <DreamWeaver onClose={() => setShowDream(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      {showReader && (
        <MemoryReader
          memories={rawMemories}
          theme={theme}
          onClose={() => {
            setShowReader(false);
            setReaderMemory(null);
          }}
          onMemoryChange={setReaderMemory}
        />
      )}
      <OnboardingOverlay />
      <FakeCursor isPlaying={isDemoPlaying} onStop={handleStopDemo} />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

export default App;