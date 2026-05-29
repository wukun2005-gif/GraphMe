import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { generateDream } from '../utils/storyUtils';

export default function DreamWeaver({ onClose }: { onClose: () => void }) {
  const { rawMemories, theme, selectMemory } = useAppState();
  const isDark = theme === 'dark';
  const [dream, setDream] = useState(() => generateDream(rawMemories));
  const [showSources, setShowSources] = useState(false);

  const handleRedream = () => {
    setDream(generateDream(rawMemories));
    setShowSources(false);
  };

  return (
    <div className={`h-full flex flex-col ${isDark ? 'bg-[#0a0a1f]' : 'bg-gradient-to-b from-indigo-950 to-purple-950'}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
        <h2 className="text-sm font-medium text-white/80">
          🌙 梦境
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded transition-colors cursor-pointer text-white/40 hover:text-white/80 hover:bg-white/10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Stars background */}
        <div className="relative">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}

          {/* Dream narrative */}
          <motion.div
            key={dream.narrative}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10"
          >
            <div className="text-center mb-6">
              <span className="text-3xl">🌙</span>
            </div>

            <p className="text-white/80 text-sm leading-relaxed text-center px-2 mb-6" style={{ lineHeight: '2' }}>
              {dream.narrative}
            </p>

            <div className="text-center mb-4">
              <span className="text-white/30 text-[10px]">
                灵感来源：{dream.sourceMemories.length} 条记忆
              </span>
            </div>
          </motion.div>
        </div>

        {/* Source memories */}
        <div className="relative z-10">
          <button
            onClick={() => setShowSources(!showSources)}
            className="w-full text-center text-white/40 text-xs cursor-pointer hover:text-white/60 transition-colors mb-2"
          >
            {showSources ? '隐藏灵感来源' : '查看灵感来源'} ↓
          </button>

          <AnimatePresence>
            {showSources && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-1.5">
                  {dream.sourceMemories.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { selectMemory(m); onClose(); }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                        <span className="text-xs text-white/60">{m.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="relative z-10 mt-4 flex gap-2 justify-center">
          <button
            id="demo-dream-redream"
            onClick={handleRedream}
            className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 text-xs cursor-pointer hover:bg-purple-500/30 transition-colors"
          >
            🔄 再做一个梦
          </button>
        </div>
      </div>
    </div>
  );
}
