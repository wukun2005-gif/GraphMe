import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { findHiddenConnection } from '../utils/navUtils';
import { EMOTION_COLORS } from '../types';
import type { RawMemory } from '../types';

export default function SerendipityModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { rawMemories, theme, selectMemory } = useAppState();
  const isDark = theme === 'dark';
  const [seed, setSeed] = useState(0);

  const connection = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    seed; // trigger recalculation
    return findHiddenConnection(rawMemories);
  }, [rawMemories, seed]);

  const handleRefresh = useCallback(() => {
    setSeed(s => s + 1);
  }, []);

  const handleSelectMemory = useCallback((mem: RawMemory) => {
    selectMemory(mem);
    onClose();
  }, [selectMemory, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className={`relative w-full max-w-md mx-4 rounded-2xl border shadow-2xl overflow-hidden ${
              isDark ? 'bg-[#0d0d1a] border-[#ffffff10]' : 'bg-white border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`px-6 pt-5 pb-3 border-b ${isDark ? 'border-[#ffffff08]' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  🎲 机缘发现
                </h2>
                <button
                  onClick={onClose}
                  className={`text-lg leading-none cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  ✕
                </button>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                发现记忆之间隐藏的连接
              </p>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              {!connection ? (
                <p className={`text-sm text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  需要至少 2 条记忆才能发现机缘
                </p>
              ) : (
                <>
                  {/* Description */}
                  <p className={`text-sm leading-relaxed mb-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {connection.description}
                  </p>

                  {/* Two memory cards */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[connection.memoryA, connection.memoryB].map(mem => {
                      const emoColor = EMOTION_COLORS[mem.dimensions.emotional.primary] || '#888';
                      return (
                        <button
                          key={mem.id}
                          onClick={() => handleSelectMemory(mem)}
                          className={`text-left p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                            isDark ? 'bg-[#ffffff05] border-[#ffffff08] hover:border-[#ffffff15]' : 'bg-gray-50 border-gray-100 hover:border-gray-300'
                          }`}
                        >
                          {mem.dimensions.sensory.images.length > 0 ? (
                            <img src={mem.dimensions.sensory.images[0]} alt=""
                              className="w-full h-20 object-cover rounded-lg mb-2" />
                          ) : (
                            <div className="w-full h-20 rounded-lg mb-2 flex items-center justify-center text-2xl"
                              style={{ background: `${emoColor}15` }}>
                              {mem.dimensions.emotional.primary === '快乐' ? '😊' :
                               mem.dimensions.emotional.primary === '骄傲' ? '🏆' :
                               mem.dimensions.emotional.primary === '好奇' ? '🔍' : '💭'}
                            </div>
                          )}
                          <p className={`text-xs font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            {mem.label}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="w-2 h-2 rounded-full" style={{ background: emoColor }} />
                            <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {mem.dimensions.emotional.primary}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Connection line */}
                  <div className={`flex items-center gap-2 justify-center mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    <div className={`h-px flex-1 ${isDark ? 'bg-[#ffffff10]' : 'bg-gray-200'}`} />
                    <span className="text-xs">🔗</span>
                    <div className={`h-px flex-1 ${isDark ? 'bg-[#ffffff10]' : 'bg-gray-200'}`} />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className={`px-6 py-3 border-t flex justify-end ${isDark ? 'border-[#ffffff08]' : 'border-gray-100'}`}>
              <button
                onClick={handleRefresh}
                className={`text-xs px-4 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  isDark ? 'bg-[#00f2ff]/15 text-[#00f2ff] hover:bg-[#00f2ff]/25' : 'bg-[#0088cc]/15 text-[#0088cc] hover:bg-[#0088cc]/25'
                }`}
              >
                🎲 换一组
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
