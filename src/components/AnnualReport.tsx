import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { computeAnnualStats } from '../utils/valueUtils';
import { EMOTION_COLORS } from '../types';

const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export default function AnnualReport({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { rawMemories, theme, selectMemory } = useAppState();
  const isDark = theme === 'dark';

  const stats = useMemo(() => computeAnnualStats(rawMemories), [rawMemories]);

  const maxMonthly = Math.max(...stats.monthlyActivity.map(m => m.count), 1);
  const emotionEntries = Object.entries(stats.emotionDistribution).sort(([, a], [, b]) => b - a);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 30 }}
            onClick={e => e.stopPropagation()}
            className={`relative w-full max-w-lg mx-4 rounded-2xl border shadow-2xl overflow-hidden ${
              isDark ? 'bg-[#0d0d1a]/98 border-[#ffffff10]' : 'bg-white/98 border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`px-6 pt-6 pb-4 border-b ${isDark ? 'border-[#ffffff08]' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  📊 记忆年报
                </h2>
                <button
                  onClick={onClose}
                  className={`text-lg leading-none cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  ✕
                </button>
              </div>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {rawMemories.length} 条记忆 · {stats.milestones.length} 个里程碑
              </p>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Summary */}
              <div className={`p-4 rounded-xl text-sm leading-relaxed ${
                isDark ? 'bg-[#00f2ff]/5 text-gray-300 border border-[#00f2ff]/10' : 'bg-blue-50 text-gray-600 border border-blue-100'
              }`}>
                {stats.summaryText}
              </div>

              {/* Emotion Pie Chart */}
              <section>
                <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  情绪分布
                </h4>
                <div className="flex items-center gap-4">
                  <svg viewBox="0 0 100 100" className="w-24 h-24 flex-shrink-0">
                    {(() => {
                      const total = emotionEntries.reduce((s, [, c]) => s + c, 0);
                      let angle = 0;
                      return emotionEntries.map(([emotion, count], i) => {
                        const sliceAngle = (count / total) * 360;
                        const startAngle = angle;
                        angle += sliceAngle;
                        const color = EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] || '#888';
                        const largeArc = sliceAngle > 180 ? 1 : 0;
                        const r = 40;
                        const cx = 50, cy = 50;
                        const x1 = cx + r * Math.cos((startAngle - 90) * Math.PI / 180);
                        const y1 = cy + r * Math.sin((startAngle - 90) * Math.PI / 180);
                        const x2 = cx + r * Math.cos((startAngle + sliceAngle - 90) * Math.PI / 180);
                        const y2 = cy + r * Math.sin((startAngle + sliceAngle - 90) * Math.PI / 180);
                        return (
                          <path
                            key={emotion}
                            d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`}
                            fill={color}
                            stroke={isDark ? '#0d0d1a' : '#fff'}
                            strokeWidth="0.5"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="flex-1 space-y-1">
                    {emotionEntries.slice(0, 6).map(([emotion, count]) => (
                      <div key={emotion} className="flex items-center gap-2 text-[10px]">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] || '#888' }} />
                        <span className={`flex-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{emotion}</span>
                        <span className={`font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Monthly Activity */}
              <section>
                <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  月度活跃
                </h4>
                <div className="flex items-end gap-1 h-20">
                  {stats.monthlyActivity.map(m => (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-0.5">
                      <div
                        className="w-full rounded-t transition-all"
                        style={{
                          height: `${(m.count / maxMonthly) * 100}%`,
                          background: isDark ? '#00f2ff40' : '#0088cc40',
                          minHeight: m.count > 0 ? '4px' : '0',
                        }}
                      />
                      <span className={`text-[7px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                        {MONTH_LABELS[parseInt(m.month.split('-')[1]) - 1]}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Top Persons */}
              {stats.topPersons.length > 0 && (
                <section>
                  <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    👥 最常出现的人
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {stats.topPersons.map(p => (
                      <span key={p.name} className={`text-[10px] px-2 py-1 rounded-full ${
                        isDark ? 'bg-[#ffffff08] text-gray-400' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {p.name} · {p.count}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Keywords */}
              {stats.keywords.length > 0 && (
                <section>
                  <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    🔤 年度关键词
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {stats.keywords.map(k => (
                      <span
                        key={k.word}
                        className="text-[10px] px-2 py-1 rounded-full"
                        style={{
                          background: isDark ? '#00f2ff10' : '#0088cc10',
                          color: isDark ? '#00f2ff' : '#0088cc',
                          fontSize: `${Math.min(10 + k.count, 14)}px`,
                        }}
                      >
                        {k.word}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Milestones */}
              {stats.milestones.length > 0 && (
                <section>
                  <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    🏆 里程碑时刻
                  </h4>
                  <div className="space-y-1.5">
                    {stats.milestones.slice(0, 3).map(m => (
                      <button
                        key={m.id}
                        onClick={() => { selectMemory(m); onClose(); }}
                        className={`w-full text-left p-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
                          isDark ? 'hover:bg-[#ffffff08] bg-[#ffffff03]' : 'hover:bg-gray-50 bg-gray-50/50'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                        <span className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
