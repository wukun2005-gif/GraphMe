import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { generateConfusionReport } from '../utils/confusionUtils';
import { CATEGORY_LABELS, EMOTION_COLORS } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ConfusionDiary({ open, onClose }: Props) {
  const { rawMemories, insightMemories, theme, selectMemory } = useAppState();
  const isDark = theme === 'dark';

  const report = useMemo(
    () => generateConfusionReport(rawMemories, insightMemories),
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
            <div className="flex items-center justify-between mb-1">
              <h2 className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🤔 小哥的困惑
              </h2>
              <button
                onClick={onClose}
                className={`text-lg leading-none cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
              >
                ✕
              </button>
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {report.hasConfusion ? '关于你，我还有很多不懂的地方…' : '关于你，我目前都很确定 😊'}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Contradictions */}
            {report.contradictions.length > 0 && (
              <section>
                <h3 className={`text-xs font-medium mb-2 ${isDark ? 'text-[#ff6b6b]' : 'text-red-500'}`}>
                  ⚡ 矛盾发现
                </h3>
                <div className="space-y-2">
                  {report.contradictions.map((c, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border text-xs ${
                        isDark ? 'bg-[#ff6b6b]/5 border-[#ff6b6b]/15 text-gray-300' : 'bg-red-50 border-red-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <span className={`font-medium ${isDark ? 'text-[#ff6b6b]' : 'text-red-600'}`}>
                          {CATEGORY_LABELS[c.insight1.category]}
                        </span>
                        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>vs</span>
                        <span className={`font-medium ${isDark ? 'text-[#ff6b6b]' : 'text-red-600'}`}>
                          {CATEGORY_LABELS[c.insight2.category]}
                        </span>
                      </div>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                        "{c.insight1.statement.slice(0, 30)}…"
                      </p>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                        "{c.insight2.statement.slice(0, 30)}…"
                      </p>
                      <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {c.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Low Confidence Insights */}
            {report.lowConfidenceInsights.length > 0 && (
              <section>
                <h3 className={`text-xs font-medium mb-2 ${isDark ? 'text-[#ffb800]' : 'text-amber-600'}`}>
                  ❓ 不太确定的发现
                </h3>
                <div className="space-y-2">
                  {report.lowConfidenceInsights.map((item) => (
                    <div
                      key={item.insight.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        isDark ? 'bg-[#ffb800]/5 border-[#ffb800]/10 hover:bg-[#ffb800]/10' : 'bg-amber-50 border-amber-100 hover:bg-amber-100/50'
                      }`}
                      onClick={() => selectMemory(item.insight)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={item.confidenceLevel === 'very-low' ? 'text-lg' : 'text-sm'}>
                          {item.confidenceLevel === 'very-low' ? '❓' : '?'}
                        </span>
                        <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {CATEGORY_LABELS[item.insight.category]}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {Math.round(item.insight.confidence * 100)}% 把握
                        </span>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.insight.statement}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Cognitive Gaps */}
            {report.gaps.length > 0 && (
              <section>
                <h3 className={`text-xs font-medium mb-2 ${isDark ? 'text-[#00f2ff]' : 'text-blue-600'}`}>
                  🔍 认知空白
                </h3>
                <div className="space-y-2">
                  {report.gaps.map((gap) => (
                    <div
                      key={gap.dimension}
                      className={`p-3 rounded-lg border ${
                        isDark ? 'bg-[#00f2ff]/5 border-[#00f2ff]/10' : 'bg-blue-50 border-blue-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{gap.emoji}</span>
                        <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {gap.label}
                        </span>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {gap.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Question Suggestions */}
            {report.suggestions.length > 0 && (
              <section>
                <h3 className={`text-xs font-medium mb-2 ${isDark ? 'text-[#44ccaa]' : 'text-teal-600'}`}>
                  💬 想问你的问题
                </h3>
                <div className="space-y-2">
                  {report.suggestions.map((s, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${
                        isDark ? 'bg-[#44ccaa]/5 border-[#44ccaa]/10' : 'bg-teal-50 border-teal-100'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span>{s.emoji}</span>
                        <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {s.question}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* No confusion */}
            {!report.hasConfusion && (
              <div className={`flex flex-col items-center justify-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <span className="text-4xl mb-3">😊</span>
                <p className="text-sm text-center">
                  关于你，我目前都很确定。
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  继续创造更多记忆，我可能会发现新的困惑…
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
