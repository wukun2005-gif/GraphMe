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
  const { memoryBankOpen, toggleMemoryBank, detailOpen, theme, selectMemory, rawMemories } = useAppState();
  const isDark = theme === 'dark';
  const [timeRange, setTimeRange] = useState<TimeRange>('月');
  const [expandedDim, setExpandedDim] = useState<string | null>(null);

  const handleTraceSocialMemory = () => {
    const socialMem = rawMemories.find(m =>
      m.dimensions.social.persons.length > 1 &&
      m.dimensions.emotional.primary === '快乐'
    );
    if (socialMem) selectMemory(socialMem);
  };

  const handleTraceCreativeMemory = () => {
    const creativeMem = rawMemories.find(m =>
      m.dimensions.activity.type === '绘画' ||
      m.dimensions.activity.detail.includes('画')
    );
    if (creativeMem) selectMemory(creativeMem);
  };

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
              <div className="flex items-center gap-2">
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
                <button
                  onClick={toggleMemoryBank}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                    isDark
                      ? 'bg-[#ffffff10] hover:bg-[#ffffff20] text-gray-400 hover:text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-gray-700'
                  }`}
                  title="关闭"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className={`rounded-lg p-3 mb-3 ${
              isDark ? 'bg-gradient-to-r from-[#00f2ff]/10 to-purple-500/10 border border-[#ffffff06]' : 'bg-gradient-to-r from-cyan-50 to-purple-50 border border-gray-100'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  💰 总资产健康度
                </span>
                <span className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  +3 <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>较上月</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex-1 h-2.5 rounded-full overflow-hidden ${
                  isDark ? 'bg-[#ffffff08]' : 'bg-gray-200'
                }`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00f2ff] to-purple-400"
                    style={{ width: '78%' }}
                  />
                </div>
                <span className={`text-sm font-bold ${isDark ? 'text-[#00f2ff]' : 'text-cyan-600'}`}>78</span>
                <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/100</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none"
                  className={isDark ? 'stroke-[#ffffff08]' : 'stroke-gray-200'}
                  strokeWidth="6" />
                <circle cx="28" cy="28" r="22" fill="none"
                  stroke="#34d399" strokeWidth="6"
                  strokeDasharray="88.4 138.2"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  transform="rotate(-90 28 28)" />
                <circle cx="28" cy="28" r="22" fill="none"
                  stroke="#f87171" strokeWidth="6"
                  strokeDasharray="49.8 138.2"
                  strokeDashoffset="-88.4"
                  strokeLinecap="round"
                  transform="rotate(-90 28 28)" />
                <text x="28" y="31" textAnchor="middle" className={`text-[10px] font-bold ${isDark ? 'fill-gray-200' : 'fill-gray-800'}`}>
                  64%
                </text>
              </svg>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> 正资产
                  </span>
                  <span className={`text-[10px] font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    32 条
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> 待改善
                  </span>
                  <span className={`text-[10px] font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    18 条
                  </span>
                </div>
                <div className={`text-[9px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  正资产占比 64%，整体健康
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {DIMENSION_DATA.map(dim => {
                const predColor = PREDICTION_COLORS[dim.prediction];
                const barColorClass = isDark ? predColor.bar : predColor.barLight;
                const textColorClass = isDark ? predColor.text : predColor.textLight;
                const isExpanded = expandedDim === dim.id;

                return (
                  <div
                    key={dim.id}
                    className={`rounded-lg p-3 cursor-pointer transition-colors ${
                      isExpanded
                        ? isDark ? 'bg-[#ffffff08] border border-[#ffffff10]' : 'bg-gray-100 border border-gray-200'
                        : isDark ? 'bg-[#ffffff04] border border-[#ffffff06]' : 'bg-gray-50 border border-gray-100'
                    }`}
                    onClick={() => setExpandedDim(isExpanded ? null : dim.id)}
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
                        <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                          {isExpanded ? '▲' : '▼'}
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

                    {isExpanded && (
                      <div className={`mt-3 pt-3 border-t ${
                        isDark ? 'border-[#ffffff08]' : 'border-gray-200'
                      }`}>
                        <div className={`text-[10px] mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          历史趋势 ({timeRange})
                        </div>
                        <svg width="100%" height="32" viewBox="0 0 200 32" className="mb-2">
                          <polyline
                            points="0,24 25,20 50,16 75,18 100,12 125,14 150,10 175,8 200,6"
                            fill="none"
                            stroke={dim.trend === 'up' ? '#34d399' : dim.trend === 'down' ? '#f87171' : '#9ca3af'}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className={`text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          关联记忆：
                        </div>
                        <div className="space-y-1">
                          {[
                            { label: '在公园和新朋友一起踢足球', date: '2026.05.15' },
                            { label: '周末全家一起去爬山踏青', date: '2026.05.08' },
                            { label: '和同学组队完成科学项目', date: '2026.04.28' },
                          ].map((mem, i) => (
                            <button
                              key={i}
                              className={`w-full text-left text-[10px] px-2 py-1 rounded flex items-center gap-2 transition-colors ${
                                isDark
                                  ? 'bg-[#ffffff04] hover:bg-[#ffffff08] text-gray-400 hover:text-gray-300'
                                  : 'bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              <span className="flex-1">{mem.label}</span>
                              <span className={`text-[9px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                {mem.date}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className={`border-t pt-3 ${
                isDark ? 'border-[#ffffff08]' : 'border-gray-200'
              }`}>
                <h4 className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  🌟 正资产鼓励
                </h4>
                <div className="space-y-2">
                  <div
                    className={`rounded-lg p-3 border bg-gradient-to-r ${
                      isDark
                        ? 'from-amber-500/10 to-yellow-500/5 border-amber-500/20'
                        : 'from-amber-50 to-yellow-50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs">👫</span>
                      <span className={`text-xs font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                        社交维度创新高
                      </span>
                      <span className="ml-auto text-[10px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400">
                        ↗ +15%
                      </span>
                    </div>
                    <p className={`text-[10px] mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      最近一周社交互动频率显著提升，与朋友、同事的互动次数创近3月新高
                    </p>
                    <p className={`text-[10px] mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      建议：保持当前社交节奏，可适当增加线下聚会频次
                    </p>
                    <button
                      onClick={handleTraceSocialMemory}
                      className={`text-[10px] px-1.5 py-0.5 rounded underline-offset-2 hover:underline transition-colors ${
                        isDark ? 'text-amber-400/60 hover:text-amber-400' : 'text-amber-600/60 hover:text-amber-600'
                      }`}
                    >
                      📎 追溯相关记忆
                    </button>
                  </div>

                  <div
                    className={`rounded-lg p-3 border bg-gradient-to-r ${
                      isDark
                        ? 'from-green-500/10 to-emerald-500/5 border-green-500/20'
                        : 'from-green-50 to-emerald-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs">🎨</span>
                      <span className={`text-xs font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                        创意维度持续上升
                      </span>
                      <span className="ml-auto text-[10px] px-1 py-0.5 rounded bg-green-500/20 text-green-400">
                        ↗ +5%
                      </span>
                    </div>
                    <p className={`text-[10px] mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      创意活动（绘画、手工、写作）频次连续4周增长，创造力指数稳步提升
                    </p>
                    <p className={`text-[10px] mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      建议：保持当前创意投入节奏，可尝试新媒介激发灵感
                    </p>
                    <button
                      onClick={handleTraceCreativeMemory}
                      className={`text-[10px] px-1.5 py-0.5 rounded underline-offset-2 hover:underline transition-colors ${
                        isDark ? 'text-green-400/60 hover:text-green-400' : 'text-green-600/60 hover:text-green-600'
                      }`}
                    >
                      📎 追溯相关记忆
                    </button>
                  </div>
                </div>
              </div>

              <div className={`border-t pt-3 ${
                isDark ? 'border-[#ffffff08]' : 'border-gray-200'
              }`}>
                <h4 className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  🧬 心智模型气质画像
                </h4>
                <div className="flex items-center gap-3 mb-3">
                  <svg width="64" height="64" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none"
                      className={isDark ? 'stroke-[#ffffff08]' : 'stroke-gray-200'}
                      strokeWidth="8" />
                    <circle cx="32" cy="32" r="28" fill="none"
                      stroke="#f59e0b" strokeWidth="8"
                      strokeDasharray="78.4 175.9"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      transform="rotate(-90 32 32)" />
                    <circle cx="32" cy="32" r="28" fill="none"
                      stroke="#8b5cf6" strokeWidth="8"
                      strokeDasharray="52.3 175.9"
                      strokeDashoffset="-78.4"
                      strokeLinecap="round"
                      transform="rotate(-90 32 32)" />
                    <circle cx="32" cy="32" r="28" fill="none"
                      stroke="#06b6d4" strokeWidth="8"
                      strokeDasharray="45.2 175.9"
                      strokeDashoffset="-130.7"
                      strokeLinecap="round"
                      transform="rotate(-90 32 32)" />
                    <text x="32" y="36" textAnchor="middle" className={`text-xs font-bold ${isDark ? 'fill-gray-200' : 'fill-gray-800'}`}>
                      78%
                    </text>
                  </svg>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        俄耳甫斯气质
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                        情感驱动型学习者
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-700'
                      }`}>🟡 情感驱动 45%</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isDark ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-100 text-purple-700'
                      }`}>🟣 安全依赖 30%</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isDark ? 'bg-cyan-500/15 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                      }`}>🔵 创造力导向 25%</span>
                    </div>
                  </div>
                </div>
                <div className={`text-[10px] mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  代表性记忆片段：
                </div>
                <div className="space-y-1.5">
                  {[
                    { emoji: '🎨', label: '第一次画出完整故事', date: '2026.03.15', type: '创意' },
                    { emoji: '🤗', label: '主动拥抱久别重逢的家人', date: '2026.04.28', type: '情感' },
                    { emoji: '📖', label: '睡前拉着妈妈读三本书', date: '2026.05.10', type: '安全' },
                  ].map((mem, i) => (
                    <button
                      key={i}
                      className={`w-full text-left text-[10px] px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                        isDark
                          ? 'bg-[#ffffff04] hover:bg-[#ffffff08] text-gray-400 hover:text-gray-300'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <span>{mem.emoji}</span>
                      <span className="flex-1">{mem.label}</span>
                      <span className={`text-[9px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{mem.date}</span>
                      <span className={`text-[9px] px-1 py-0.5 rounded ${
                        isDark ? 'bg-[#ffffff08]' : 'bg-gray-200'
                      }`}>{mem.type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`border-t pt-3 ${
                isDark ? 'border-[#ffffff08]' : 'border-gray-200'
              }`}>
                <h4 className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  📈 维度利率排名
                </h4>
                <div className="space-y-1">
                  {[
                    { rank: 1, emoji: '😊', name: '快乐', rate: 4.85, change: '+0.12', up: true, risk: 'low', sparkline: '2,12 25,8 50,14 75,10 98,6' },
                    { rank: 2, emoji: '👫', name: '社交', rate: 3.67, change: '+0.45', up: true, risk: 'low', sparkline: '2,14 25,10 50,16 75,12 98,8' },
                    { rank: 3, emoji: '🎨', name: '创意', rate: 3.21, change: '+0.08', up: true, risk: 'low', sparkline: '2,10 25,12 50,8 75,14 98,10' },
                    { rank: 4, emoji: '🧠', name: '逻辑', rate: 2.14, change: '-0.23', up: false, risk: 'medium', sparkline: '2,8 25,12 50,6 75,10 98,14' },
                    { rank: 5, emoji: '🏃', name: '户外', rate: 1.08, change: '-0.67', up: false, risk: 'high', sparkline: '2,12 25,16 50,10 75,18 98,20' },
                  ].map(item => (
                    <div
                      key={item.rank}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                        isDark ? 'bg-[#ffffff04]' : 'bg-gray-50'
                      } ${
                        item.risk === 'high'
                          ? isDark ? 'border border-red-500/20' : 'border border-red-200'
                          : ''
                      }`}
                    >
                      <span className={`w-5 text-center font-mono text-[10px] ${
                        isDark ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        #{item.rank}
                      </span>
                      <span className="flex items-center gap-1 w-14">
                        <span className="text-xs">{item.emoji}</span>
                        <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.name}</span>
                      </span>
                      <span className={`w-14 text-right font-mono font-medium ${
                        item.risk === 'high'
                          ? 'text-red-400'
                          : isDark ? 'text-[#00f2ff]' : 'text-cyan-600'
                      }`}>
                        {item.rate}%
                      </span>
                      <span className={`w-14 text-right font-mono text-[10px] ${
                        item.up ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {item.change}
                      </span>
                      <svg width="50" height="18" viewBox="0 0 100 20" className="flex-shrink-0">
                        <polyline
                          points={item.sparkline}
                          fill="none"
                          stroke={item.up ? '#34d399' : '#f87171'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ml-auto ${
                        item.risk === 'high'
                          ? 'bg-red-500/20 text-red-400'
                          : item.risk === 'medium'
                            ? 'bg-yellow-500/15 text-yellow-400'
                            : 'bg-green-500/15 text-green-400'
                      }`}>
                        {item.risk === 'high' ? '⚠ 预警' : item.risk === 'medium' ? '○ 关注' : '✓ 正常'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`border-t pt-3 ${
                isDark ? 'border-[#ffffff08]' : 'border-gray-200'
              }`}>
                <h4 className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  💹 记忆类型增值潜力排行
                </h4>
                <div className="space-y-1">
                  {[
                    { rank: 1, label: '亲子互动记忆', stars: 5, invest: '高', suggestion: '持续高回报资产，保持投入', icon: '👨‍👧' },
                    { rank: 2, label: '学习成长记忆', stars: 4, invest: '中', suggestion: '稳定增值，可适度增加', icon: '📚' },
                    { rank: 3, label: '社交情感记忆', stars: 4, invest: '中高', suggestion: '潜在高增长领域', icon: '💬' },
                    { rank: 4, label: '户外探索记忆', stars: 3, invest: '低', suggestion: '需增加户外活动投入', icon: '🌲' },
                    { rank: 5, label: '日常习惯记忆', stars: 2, invest: '低', suggestion: '基础配置，维持即可', icon: '🏠' },
                  ].map(item => (
                    <div
                      key={item.rank}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                        isDark ? 'bg-[#ffffff04]' : 'bg-gray-50'
                      }`}
                    >
                      <span className={`w-5 text-center font-mono text-[10px] ${
                        isDark ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        #{item.rank}
                      </span>
                      <span className="text-xs">{item.icon}</span>
                      <span className={`flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                      <span className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={`text-[10px] ${i < item.stars ? 'text-amber-400' : isDark ? 'text-gray-700' : 'text-gray-300'}`}>
                            ⭐
                          </span>
                        ))}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded w-8 text-center ${
                        item.invest === '高'
                          ? isDark ? 'bg-green-500/15 text-green-400' : 'bg-green-100 text-green-700'
                          : item.invest === '中' || item.invest === '中高'
                            ? isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-100 text-blue-700'
                            : isDark ? 'bg-gray-500/15 text-gray-400' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {item.invest}
                      </span>
                      <span className={`text-[9px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {item.suggestion}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}