import { AppProvider, useAppState } from './store/AppContext';
import MemCloud3D from './components/MemCloud3D';
import NavigationSidebar from './components/Navigation';
import DetailPanel from './components/DetailPanel';
import ChatPanel from './components/ChatPanel';

const DEFAULT_BG_DARK = '#0a101f';
const DEFAULT_BG_LIGHT = '#f5f6f8';

function AppInner() {
  const { rawMemories, insightMemories, detailOpen, theme, toggleTheme } = useAppState();
  const isDark = theme === 'dark';

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