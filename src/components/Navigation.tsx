import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '../store/AppContext';

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
  '机器人伙伴': { icon: '🤖', sub: [
    { id: '和Loona的时刻', icon: '🐾' },
    { id: 'ClicBot项目', icon: '⚙️' },
  ]},
};

export default function NavigationSidebar() {
  const { navCategory, navSubCategory, setNavCategory, setNavSubCategory } = useAppState();

  const breadcrumbs = useMemo(() => {
    const parts: string[] = [];
    if (navCategory) parts.push(navCategory);
    if (navSubCategory) parts.push(navSubCategory);
    return parts;
  }, [navCategory, navSubCategory]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#ffffff08]">
        <h2 className="text-gray-300 font-medium text-sm tracking-wide">🧭 记忆导航</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {Object.entries(NAV_STRUCTURE).map(([category, { icon, sub }]) => (
          <div key={category}>
            <button
              onClick={() => {
                setNavCategory(navCategory === category ? null : category);
                setNavSubCategory(null);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                navCategory === category
                  ? 'bg-[#00f2ff]/10 text-[#00f2ff]'
                  : 'text-gray-400 hover:bg-[#ffffff05] hover:text-gray-300'
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
                    onClick={() => setNavSubCategory(navSubCategory === s.id ? null : s.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-2 ${
                      navSubCategory === s.id
                        ? 'bg-[#00f2ff]/5 text-[#00f2ff] border-l-2 border-[#00f2ff]/30'
                        : 'text-gray-500 hover:bg-[#ffffff05] hover:text-gray-400'
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

      <div className="p-3 border-t border-[#ffffff08]">
        <div className="text-xs text-gray-500">
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
  );
}