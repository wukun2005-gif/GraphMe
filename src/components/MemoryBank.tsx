import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';

interface DimensionItem {
  id: string;
  emoji: string;
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  trendPct: number;
  prediction: 'up' | 'down' | 'warn';
  predictionLabel: string;
  actionLabel: string;
}

const DIMENSION_DATA: DimensionItem[] = [
  {
    id: 'happiness',
    emoji: '😊',
    label: '快乐',
    value: 80,
    trend: 'up',
    trendPct: 12,
    prediction: 'up',
    predictionLabel: '↗ 保持',
    actionLabel: '保持当前节奏',
  },
  {
    id: 'logic',
    emoji: '🧠',
    label: '逻辑',
    value: 60,
    trend: 'down',
    trendPct: 8,
    prediction: 'down',
    predictionLabel: '↘ 下降',
    actionLabel: '增加数学活动',
  },
  {
    id: 'social',
    emoji: '👫',
    label: '社交',
    value: 40,
    trend: 'down',
    trendPct: 15,
    prediction: 'warn',
    predictionLabel: '⚠ 预警',
    actionLabel: '建议安排聚会',
  },
  {
    id: 'outdoor',
    emoji: '🏃',
    label: '户外活动',
    value: 20,
    trend: 'down',
    trendPct: 30,
    prediction: 'warn',
    predictionLabel: '⚠ 预警',
    actionLabel: '建议周末出游',
  },
  {
    id: 'creativity',
    emoji: '🎨',
    label: '创意',
    value: 90,
    trend: 'up',
    trendPct: 5,
    prediction: 'up',
    predictionLabel: '↗ 保持',
    actionLabel: '当前表现良好',
  },
];

type TimeRange = '周' | '月' | '季';

const TREND_ICON: Record<string, string> = {
  up: '↗',
  down: '↘',
  stable: '→',
};

const PREDICTION_COLORS: Record<string, { bar: string; barLight: string; text: string; textLight: string }> = {
  up: {
    bar: 'bg-gradient-to-r from-green-500/60 to-emerald-400/40',
    barLight: 'bg-gradient-to-r from-green-400 to-emerald-300',
    text: 'text-green-400',
    textLight: 'text-green-600',
  },
  down: {
    bar: 'bg-gradient-to-r from-yellow-500/60 to-amber-400/40',
    barLight: 'bg-gradient-to-r from-yellow-400 to-amber-300',
    text: 'text-yellow-400',
    textLight: 'text-yellow-600',
  },
  warn: {
    bar: 'bg-gradient-to-r from-red-500/60 to-orange-400/40',
    barLight: 'bg-gradient-to-r from-red-400 to-orange-300',
    text: 'text-red-400',
    textLight: 'text-red-600',
  },
};

export default function MemoryBank() {
  const { memoryBankOpen, toggleMemoryBank, detailOpen, theme } = useAppState();
  const isDark = theme === 'dark';
  const [timeRange, setTimeRange] = useState<TimeRange>('月');

  return (
    <>
      <button
        id="memory-bank-trigger"
        onClick={toggleMemoryBank}
        className={`fixed bottom-36 w-12 h-12 bg-[#00f2ff]/15 border border-[#00f2ff]/20 rounded-full flex items-center justify-center text-xl hover:bg-[#00f2ff]/25 transition-all z-20 shadow-[0_0_15px_rgba(0,242,255,0.1)] ${
          detailOpen ? 'right-[436px]' : 'right-6'
        }`}
        title="记忆银行"
      >
        💰
      </button>

      <AnimatePresence>
        {memoryBankOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed bottom-36 w-[420px] max-h-[560px] backdrop-blur-xl border rounded-xl p-4 z-20 shadow-2xl overflow-hidden flex flex-col ${
              isDark ? 'bg-[#0d1525]/98 border-[#ffffff08]' : 'bg-white/98 border-gray-200'
            } ${
              detailOpen ? 'right-[436px]' : 'right-6'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                📊 你的生命维度投资组合
              </h3>
              <div className={`flex rounded-md p-0.5 text-xs ${
                isDark ? 'bg-[#ffffff08]' : 'bg-gray-100'
              }`}>
                {(['周', '月', '季'] as TimeRange[]).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      timeRange === range
                        ? isDark ? 'bg-[#00f2ff]/20 text-[#00f2ff]' : 'bg-cyan-100 text-cyan-700'
                        : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {DIMENSION_DATA.map(dim => {
                const predColor = PREDICTION_COLORS[dim.prediction];
                const barColorClass = isDark ? predColor.bar : predColor.barLight;
                const textColorClass = isDark ? predColor.text : predColor.textLight;

                return (
                  <div
                    key={dim.id}
                    className={`rounded-lg p-3 ${
                      isDark ? 'bg-[#ffffff04] border border-[#ffffff06]' : 'bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{dim.emoji}</span>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {dim.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${dim.trend === 'up' ? 'text-green-400' : dim.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                          {TREND_ICON[dim.trend]} {dim.trendPct > 0 ? (dim.trend === 'up' ? '+' : '-') : ''}{dim.trendPct}%
                        </span>
                        <span className={`text-xs ${textColorClass}`}>
                          {dim.predictionLabel}
                        </span>
                      </div>
                    </div>

                    <div className={`w-full h-2 rounded-full overflow-hidden mb-2 ${
                      isDark ? 'bg-[#ffffff08]' : 'bg-gray-200'
                    }`}>
                      <div
                        className={`h-full rounded-full transition-all ${barColorClass}`}
                        style={{ width: `${dim.value}%` }}
                      />
                    </div>

                    <button
                      className={`text-xs px-2 py-1 rounded transition-colors w-full text-left ${
                        isDark
                          ? `${textColorClass}/80 hover:${textColorClass} bg-[#ffffff04] hover:bg-[#ffffff08]`
                          : `bg-gray-100 hover:bg-gray-200 ${textColorClass}/80`
                      }`}
                    >
                      💡 {dim.actionLabel}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}