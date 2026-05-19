import { useAppState } from '../store/AppContext';
import type { DimensionView } from '../types';

const views: { id: DimensionView; icon: string; label: string }[] = [
  { id: '全局视图', icon: '🌐', label: '全局' },
  { id: '家庭视图', icon: '🏠', label: '家庭' },
  { id: '学习视图', icon: '🎓', label: '学习' },
  { id: '情绪视图', icon: '😊', label: '情绪' },
];

export default function DimensionSwitcher() {
  const { currentView, setCurrentView } = useAppState();

  return (
    <div className="flex gap-1 bg-[#0d0d1a]/90 backdrop-blur-sm rounded-lg p-1 border border-[#ffffff08]">
      {views.map((v) => (
        <button
          key={v.id}
          onClick={() => setCurrentView(v.id)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            currentView === v.id
              ? 'bg-[#00f2ff]/15 text-[#00f2ff] shadow-[0_0_8px_rgba(0,242,255,0.1)]'
              : 'text-gray-500 hover:text-gray-300 hover:bg-[#ffffff05]'
          }`}
        >
          {v.icon} {v.label}
        </button>
      ))}
    </div>
  );
}