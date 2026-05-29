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
import MemoryGarden from './components/MemoryGarden';
import DreamWeaver from './components/DreamWeaver';
import FakeCursor from './components/AutoDemo/FakeCursor';
import { useState, useEffect, useCallback } from 'react';

const DEFAULT_BG_DARK = '#0a101f';
const DEFAULT_BG_LIGHT = '#f5f6f8';

function AppInner() {
  const { rawMemories, insightMemories, detailOpen, theme, toggleTheme, selectMemory, currentView, setCurrentView, searchQuery, setSearchQuery } = useAppState();
  const isDark = theme === 'dark';
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSerendipity, setShowSerendipity] = useState(false);
  const [showAnnualReport, setShowAnnualReport] = useState(false);
  const [showGarden, setShowGarden] = useState(false);
  const [showDream, setShowDream] = useState(false);

  const handleStopDemo = useCallback(() => setIsDemoPlaying(false), []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;

      if (e.key === 'Escape') {
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
  }, [showSerendipity, showSearch, searchQuery, setCurrentView, setSearchQuery, setShowSearch]);

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

    window.addEventListener('demo-select-memory', onSelectMemory);
    window.addEventListener('demo-close-detail', onCloseDetail);
    window.addEventListener('demo-detail-edit', onDetailEdit);
    window.addEventListener('demo-detail-cancel-edit', onDetailCancelEdit);
    window.addEventListener('demo-chat-expand', onChatExpand);
    window.addEventListener('demo-close-serendipity', onCloseSerendipity);
    window.addEventListener('demo-close-annual-report', onCloseAnnualReport);

    return () => {
      window.removeEventListener('demo-select-memory', onSelectMemory);
      window.removeEventListener('demo-close-detail', onCloseDetail);
      window.removeEventListener('demo-detail-edit', onDetailEdit);
      window.removeEventListener('demo-detail-cancel-edit', onDetailCancelEdit);
      window.removeEventListener('demo-chat-expand', onChatExpand);
      window.removeEventListener('demo-close-serendipity', onCloseSerendipity);
      window.removeEventListener('demo-close-annual-report', onCloseAnnualReport);
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

      <div className={`absolute left-0 top-0 h-full z-10 backdrop-blur-sm border-r ${
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

      <div className={`absolute bottom-6 left-[240px] z-10 text-xs ${isDark ? 'text-gray-700' : 'text-gray-400'}`}>
        <span>{rawMemories.length} 记忆原子</span>
        <span className="mx-2">·</span>
        <span>{insightMemories.length} 洞察记忆</span>
      </div>

      <TimelineScrubber />

      <div className={`absolute top-4 z-20 flex items-center gap-2 transition-all duration-300 ${
        detailOpen ? 'right-[436px]' : 'right-4'
      }`}>
        {!isDemoPlaying && (
          <button
            id="btn-auto-demo"
            onClick={() => setIsDemoPlaying(true)}
            className={`px-3 py-1.5 text-xs rounded-lg backdrop-blur-sm transition-all font-medium cursor-pointer ${
              isDark
                ? 'bg-gradient-to-r from-[#00f2ff]/20 to-[#ffb800]/20 hover:from-[#00f2ff]/30 hover:to-[#ffb800]/30 text-[#00f2ff] border border-[#00f2ff]/20 hover:border-[#00f2ff]/40'
                : 'bg-gradient-to-r from-[#0088cc]/10 to-[#cc8800]/10 hover:from-[#0088cc]/20 hover:to-[#cc8800]/20 text-[#0088cc] border border-[#0088cc]/20 hover:border-[#0088cc]/40'
            }`}
          >
            ▶ 一键演示
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
          id="btn-annual-report"
          onClick={() => setShowAnnualReport(true)}
          className={`px-3 py-1.5 text-xs rounded-lg backdrop-blur-sm transition-all ${
            isDark
              ? 'bg-[#ffffff10] hover:bg-[#ffffff18] text-gray-400 hover:text-gray-200'
              : 'bg-black/5 hover:bg-black/10 text-gray-600 hover:text-gray-800'
          }`}
        >
          📊 年报
        </button>
        <button
          id="btn-serendipity"
          onClick={() => setShowSerendipity(true)}
          className={`px-3 py-1.5 text-xs rounded-lg backdrop-blur-sm transition-all ${
            isDark
              ? 'bg-[#ffffff10] hover:bg-[#ffffff18] text-gray-400 hover:text-gray-200'
              : 'bg-black/5 hover:bg-black/10 text-gray-600 hover:text-gray-800'
          }`}
        >
          🎲 记忆碰碰对
        </button>
        <button
          id="btn-garden"
          onClick={() => setShowGarden(true)}
          className={`px-3 py-1.5 text-xs rounded-lg backdrop-blur-sm transition-all ${
            isDark
              ? 'bg-[#ffffff10] hover:bg-[#ffffff18] text-gray-400 hover:text-gray-200'
              : 'bg-black/5 hover:bg-black/10 text-gray-600 hover:text-gray-800'
          }`}
        >
          🌻 花园
        </button>
        <button
          id="btn-dream"
          onClick={() => setShowDream(true)}
          className={`px-3 py-1.5 text-xs rounded-lg backdrop-blur-sm transition-all ${
            isDark
              ? 'bg-[#ffffff10] hover:bg-[#ffffff18] text-gray-400 hover:text-gray-200'
              : 'bg-black/5 hover:bg-black/10 text-gray-600 hover:text-gray-800'
          }`}
        >
          🌙 梦境
        </button>
        <button
          onClick={toggleTheme}
          className={`px-3 py-1.5 text-xs rounded-lg backdrop-blur-sm transition-all ${
            isDark
              ? 'bg-[#ffffff10] hover:bg-[#ffffff18] text-gray-400 hover:text-gray-200'
              : 'bg-black/5 hover:bg-black/10 text-gray-600 hover:text-gray-800'
          }`}
        >
          {isDark ? '☀️ 亮色' : '🌙 暗色'}
        </button>
      </div>

      <ToastContainer />
      <SerendipityModal open={showSerendipity} onClose={() => setShowSerendipity(false)} />
      <AnnualReport open={showAnnualReport} onClose={() => setShowAnnualReport(false)} />

      <AnimatePresence>
        {showGarden && (
          <motion.div
            initial={{ x: 500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 h-full w-full max-w-[420px] backdrop-blur-xl border-l z-30 shadow-2xl overflow-hidden flex flex-col ${
              isDark ? 'bg-[#0d0d1a] border-[#ffffff08]' : 'bg-white border-gray-200'
            }`}
          >
            <MemoryGarden onClose={() => setShowGarden(false)} />
          </motion.div>
        )}
      </AnimatePresence>

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