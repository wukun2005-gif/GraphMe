import { AppProvider, useAppState } from './store/AppContext';
import MemCloud3D from './components/MemCloud3D';
import DimensionSwitcher from './components/DimensionSwitcher';
import NavigationSidebar from './components/Navigation';
import DetailPanel from './components/DetailPanel';
import ChatPanel from './components/ChatPanel';
import CrudPanel from './components/CrudPanel';
import DemoController from './components/DemoController';

function AppInner() {
  const { rawMemories, insightMemories } = useAppState();

  return (
    <div className="relative w-screen h-screen bg-[#0a0a0f] overflow-hidden font-sans">
      <MemCloud3D />

      <div className="absolute top-6 left-6 z-10">
        <DimensionSwitcher />
      </div>

      <div className="absolute left-0 top-0 h-full w-[220px] bg-[#0d0d1a]/90 backdrop-blur-sm border-r border-[#ffffff08] z-10">
        <NavigationSidebar />
      </div>

      <DetailPanel />
      <CrudPanel />
      <ChatPanel />
      <DemoController />

      <div className="absolute top-6 left-[240px] z-10">
        <h1 className="text-lg font-light text-gray-300 tracking-wider">
          <span className="text-[#00f2ff] font-normal">Graph</span>Me
          <span className="text-gray-700 text-xs ml-2">内在图景</span>
        </h1>
      </div>

      <div className="absolute bottom-6 left-[240px] z-10 text-xs text-gray-700">
        <span>{rawMemories.length} 记忆原子</span>
        <span className="mx-2">·</span>
        <span>{insightMemories.length} 洞察记忆</span>
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