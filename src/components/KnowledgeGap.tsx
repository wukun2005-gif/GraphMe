import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { computeKnowledgeGap } from '../utils/gapUtils';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function KnowledgeGap({ open, onClose }: Props) {
  const { rawMemories, insightMemories, theme } = useAppState();
  const isDark = theme === 'dark';

  const gapData = useMemo(
    () => computeKnowledgeGap(rawMemories, insightMemories),
    [rawMemories, insightMemories]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 500, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 500, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`fixed right-0 top-0 h-full w-full max-w-[420px] backdrop-blur-xl border-l z-30 shadow-2xl overflow-hidden flex flex-col ${
            isDark ? 'bg-[#0d0d1a] border-[#ffffff08]' : 'bg-white border-gray-200'
          }`}
        >
          {/* Header */}
          <div className={`px-5 pt-5 pb-3 border-b ${isDark ? 'border-[#ffffff08]' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🧩 了解程度
              </h2>
              <button
                onClick={onClose}
                className={`text-lg leading-none cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
              >
                ✕
              </button>
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {gapData.summaryText}
            </p>
          </div>

          {/* Overall */}
          <div className={`px-5 py-3 border-b ${isDark ? 'border-[#ffffff08]' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className={`h-3 rounded-full ${isDark ? 'bg-[#ffffff08]' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full rounded-full transition-all ${isDark ? 'bg-[#00f2ff]' : 'bg-[#0088cc]'}`}
                    style={{ width: `${gapData.overallCoverage}%` }}
                  />
                </div>
              </div>
              <span className={`text-lg font-medium ${isDark ? 'text-[#00f2ff]' : 'text-[#0088cc]'}`}>
                {gapData.overallCoverage}%
              </span>
            </div>
          </div>

          {/* Dimensions */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {gapData.dimensions.map(dim => (
              <div key={dim.dimension}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span>{dim.emoji}</span>
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {dim.label}
                    </span>
                  </div>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {dim.coverage}%
                  </span>
                </div>
                <div className={`h-2 rounded-full ${isDark ? 'bg-[#ffffff08]' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full rounded-full transition-all ${
                      dim.coverage >= 70 ? isDark ? 'bg-green-500' : 'bg-green-500'
                      : dim.coverage >= 40 ? isDark ? 'bg-yellow-500' : 'bg-yellow-500'
                      : isDark ? 'bg-red-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${dim.coverage}%` }}
                  />
                </div>
                <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {dim.detail}
                </p>
                <p className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                  {dim.suggestion}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
