import { AppProvider, useAppState } from './store/AppContext';
import MemCloud3D from './components/MemCloud3D';
import NavigationSidebar from './components/Navigation';
import DetailPanel from './components/DetailPanel';
import ChatPanel from './components/ChatPanel';
import ValueDashboard from './components/ValueDashboard';
import MemoryBank from './components/MemoryBank';
import FakeCursor from './components/AutoDemo/FakeCursor';
import { useState, useEffect, useCallback } from 'react';

const DEFAULT_BG_DARK = '#0a101f';
const DEFAULT_BG_LIGHT = '#f5f6f8';

function AppInner() {
  const { rawMemories, insightMemories, detailOpen, theme, toggleTheme, selectMemory } = useAppState();
  const isDark = theme === 'dark';
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);

  const handleStopDemo = useCallback(() => setIsDemoPlaying(false), []);

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

    window.addEventListener('demo-select-memory', onSelectMemory);
    window.addEventListener('demo-close-detail', onCloseDetail);
    window.addEventListener('demo-detail-edit', onDetailEdit);
    window.addEventListener('demo-detail-cancel-edit', onDetailCancelEdit);
    window.addEventListener('demo-chat-expand', onChatExpand);

    return () => {
      window.removeEventListener('demo-select-memory', onSelectMemory);
      window.removeEventListener('demo-close-detail', onCloseDetail);
      window.removeEventListener('demo-detail-edit', onDetailEdit);
      window.removeEventListener('demo-detail-cancel-edit', onDetailCancelEdit);
      window.removeEventListener('demo-chat-expand', onChatExpand);
    };
  }, [isDemoPlaying, rawMemories, insightMemories, selectMemory]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden font-sans"
      data-theme={theme}
      style={{ background: isDark ? DEFAULT_BG_DARK : DEFAULT_BG_LIGHT }}
    >
      <MemCloud3D bgColor={isDark ? DEFAULT_BG_DARK : DEFAULT_BG_LIGHT} theme={theme} />

      <div className={`absolute left-0 top-0 h-full z-10 backdrop-blur-sm border-r ${
        isDark ? 'bg-[#0d1525]/90 border-[#ffffff08]' : 'bg-white/90 border-gray-200'
      }`}>
        <NavigationSidebar />
      </div>

      <DetailPanel />
      <ChatPanel />
      <ValueDashboard />
      <MemoryBank />

      <div className="absolute top-6 left-[240px] z-10">
        <h1 className={`text-lg font-light tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
          <span className={`font-normal ${isDark ? 'text-[#00f2ff]' : 'text-[#0088cc]'}`}>Graph</span>Me
        </h1>
      </div>

      <div className={`absolute bottom-6 left-[240px] z-10 text-xs ${isDark ? 'text-gray-700' : 'text-gray-400'}`}>
        <span>{rawMemories.length} 记忆原子</span>
        <span className="mx-2">·</span>
        <span>{insightMemories.length} 洞察记忆</span>
      </div>

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