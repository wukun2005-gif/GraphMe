import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { computeKnowledgeGap } from '../utils/gapUtils';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SessionSummary({ open, onClose }: Props) {
  const { rawMemories, insightMemories, theme } = useAppState();
  const isDark = theme === 'dark';

  const summary = useMemo(() => {
    const gapData = computeKnowledgeGap(rawMemories, insightMemories);
    const activeInsights = insightMemories.filter(i => !i.deprecatedAt);
    const confirmed = activeInsights.filter(i => i.userConfirmed).length;
    const highAccess = rawMemories.filter(m => m.dimensions.value.accessCount > 2).length;

    return {
      coverage: gapData.overallCoverage,
      insightCount: activeInsights.length,
      confirmed,
      highAccess,
      bestDim: gapData.bestDimension,
      worstDim: gapData.worstDimension,
    };
  }, [rawMemories, insightMemories]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 flex items-center justify-center ${
            isDark ? 'bg-black/60' : 'bg-black/40'
          } backdrop-blur-sm`}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className={`relative w-full max-w-md mx-4 rounded-2xl border shadow-2xl overflow-hidden ${
              isDark ? 'bg-[#0d0d1a] border-[#ffffff10]' : 'bg-white border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`px-6 pt-5 pb-3 border-b ${isDark ? 'border-[#ffffff08]' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  📊 会话总结
                </h2>
                <button
                  onClick={onClose}
                  className={`text-lg cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-[#00f2ff]/5 border border-[#00f2ff]/10' : 'bg-blue-50 border border-blue-100'}`}>
                <p className={`text-2xl font-medium mb-1 ${isDark ? 'text-[#00f2ff]' : 'text-[#0088cc]'}`}>
                  {summary.coverage}%
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  小哥对你的了解程度
                </p>
              </div>

              <div className="space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-[#ffffff05]' : 'bg-gray-50'}`}>
                  <span className="text-lg">💡</span>
                  <div>
                    <p className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      小哥发现了 {summary.insightCount} 个关于你的模式
                    </p>
                    <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      其中 {summary.confirmed} 个已被你确认
                    </p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-[#ffffff05]' : 'bg-gray-50'}`}>
                  <span className="text-lg">⭐</span>
                  <div>
                    <p className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {summary.highAccess} 条记忆被多次回顾
                    </p>
                    <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      它们在你的记忆空间中更加闪亮
                    </p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-[#ffffff05]' : 'bg-gray-50'}`}>
                  <span className="text-lg">📊</span>
                  <div>
                    <p className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      最了解你的{summary.bestDim}
                    </p>
                    <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      最需要补充的是{summary.worstDim}
                    </p>
                  </div>
                </div>
              </div>

              <p className={`text-xs text-center pt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                每一次互动，都在让这个记忆星云更懂你。
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
