import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import type { TimeRange } from '../utils/memoryBankUtils';
import {
  computeDimensionData,
  computeHealthScore,
  computeAssetStats,
  computeTemperament,
  computeDimensionRates,
  computeMemoryTypePotential,
} from '../utils/memoryBankUtils';

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

  useEffect(() => {
    if (!memoryBankOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleMemoryBank();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [memoryBankOpen, toggleMemoryBank]);

  const dimensionData = useMemo(() => computeDimensionData(rawMemories, timeRange), [rawMemories, timeRange]);
  const healthScore = useMemo(() => computeHealthScore(rawMemories, timeRange), [rawMemories, timeRange]);
  const assetStats = useMemo(() => computeAssetStats(rawMemories), [rawMemories]);
  const temperament = useMemo(() => computeTemperament(rawMemories), [rawMemories]);
  const dimensionRates = useMemo(() => computeDimensionRates(rawMemories, timeRange), [rawMemories, timeRange]);
  const memoryTypePotential = useMemo(() => computeMemoryTypePotential(rawMemories), [rawMemories]);

  const topImproving = useMemo(() => {
    return [...dimensionData].sort((a, b) => {
      const aDiff = a.trend === 'up' ? a.trendPct : a.trend === 'down' ? -a.trendPct : 0;
      const bDiff = b.trend === 'up' ? b.trendPct : b.trend === 'down' ? -b.trendPct : 0;
      return bDiff - aDiff;
    }).slice(0, 2);
  }, [dimensionData]);

  const getRelatedMemoriesForDim = (dimId: string) => {
    const filtered = rawMemories.filter(m => {
      switch (dimId) {
        case 'happiness': return m.dimensions.emotional.primary === '快乐' && m.dimensions.emotional.intensity > 0.7;
        case 'social': return m.dimensions.social.persons.length > 1;
        case 'creativity': return m.dimensions.activity.type === '绘画' || m.dimensions.activity.detail.includes('画') || m.dimensions.activity.detail.includes('创');
        case 'logic': return m.dimensions.semantic.knowledge.length > 0 || m.dimensions.activity.type === '学习';
        case 'outdoor': return m.dimensions.spatial.placeType === '公园' || m.dimensions.spatial.placeType === '游乐场';
        default: return false;
      }
    });
    return filtered.slice(0, 3);
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
                  id="memory-bank-close"
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

            {/* 总资产健康度 */}
            <div className={`rounded-lg p-3 mb-3 ${
              isDark ? 'bg-gradient-to-r from-[#00f2ff]/10 to-purple-500/10 border border-[#ffffff06]' : 'bg-gradient-to-r from-cyan-50 to-purple-50 border border-gray-100'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  💰 总资产健康度
                </span>
                <span className={`text-xs ${healthScore.delta >= 0 ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                  {healthScore.delta >= 0 ? '+' : ''}{healthScore.delta} <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>较上期</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex-1 h-2.5 rounded-full overflow-hidden ${
                  isDark ? 'bg-[#ffffff08]' : 'bg-gray-200'
                }`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00f2ff] to-purple-400"
                    style={{ width: `${healthScore.score}%` }}
                  />
                </div>
                <span className={`text-sm font-bold ${isDark ? 'text-[#00f2ff]' : 'text-cyan-600'}`}>{healthScore.score}</span>
                <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/100</span>
              </div>
            </div>

            {/* 正/负资产 */}
            <div className="flex items-center gap-3 mb-3">
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none"
                  className={isDark ? 'stroke-[#ffffff08]' : 'stroke-gray-200'}
                  strokeWidth="6" />
                <circle cx="28" cy="28" r="22" fill="none"
                  stroke="#34d399" strokeWidth="6"
                  strokeDasharray={`${(assetStats.ratio / 100) * 138.2} ${138.2 - (assetStats.ratio / 100) * 138.2}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  transform="rotate(-90 28 28)" />
                <circle cx="28" cy="28" r="22" fill="none"
                  stroke="#f87171" strokeWidth="6"
                  strokeDasharray={`${((100 - assetStats.ratio) / 100) * 138.2} ${138.2 - ((100 - assetStats.ratio) / 100) * 138.2}`}
                  strokeDashoffset={`${-(assetStats.ratio / 100) * 138.2}`}
                  strokeLinecap="round"
                  transform="rotate(-90 28 28)" />
                <text x="28" y="31" textAnchor="middle" className={`text-[10px] font-bold ${isDark ? 'fill-gray-200' : 'fill-gray-800'}`}>
                  {assetStats.ratio}%
                </text>
              </svg>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> 正资产
                  </span>
                  <span className={`text-[10px] font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {assetStats.positive} 条
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> 待改善
                  </span>
                  <span className={`text-[10px] font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {assetStats.negative} 条
                  </span>
                </div>
                <div className={`text-[9px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  正资产占比 {assetStats.ratio}%，{assetStats.ratio >= 60 ? '整体健康' : '需要关注'}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {/* 维度投资组合 */}
              {dimensionData.map(dim => {
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
                        style={{ width: `${Math.min(dim.value, 100)}%` }}
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
                            points={`0,${32 - dim.value * 0.32} 50,${32 - dim.value * 0.28} 100,${32 - dim.value * 0.3} 150,${32 - dim.value * 0.25} 200,${32 - dim.value * 0.2}`}
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
                          {getRelatedMemoriesForDim(dim.id).map((mem) => (
                            <button
                              key={mem.id}
                              onClick={(e) => { e.stopPropagation(); selectMemory(mem); }}
                              className={`w-full text-left text-[10px] px-2 py-1 rounded flex items-center gap-2 transition-colors ${
                                isDark
                                  ? 'bg-[#ffffff04] hover:bg-[#ffffff08] text-gray-400 hover:text-gray-300'
                                  : 'bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              <span className="flex-1">{mem.label}</span>
                              <span className={`text-[9px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                {new Date(mem.dimensions.temporal.timestamp).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 正资产鼓励 */}
              <div className={`border-t pt-3 ${
                isDark ? 'border-[#ffffff08]' : 'border-gray-200'
              }`}>
                <h4 className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  🌟 正资产鼓励
                </h4>
                <div className="space-y-2">
                  {topImproving.map((dim, i) => {
                    const isPositive = dim.trend === 'up';
                    const gradientClass = isDark
                      ? isPositive ? 'from-green-500/10 to-emerald-500/5 border-green-500/20' : 'from-amber-500/10 to-yellow-500/5 border-amber-500/20'
                      : isPositive ? 'from-green-50 to-emerald-50 border-green-200' : 'from-amber-50 to-yellow-50 border-amber-200';
                    const textClass = isDark
                      ? isPositive ? 'text-green-300' : 'text-amber-300'
                      : isPositive ? 'text-green-700' : 'text-amber-700';
                    const badgeClass = isPositive ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400';

                    return (
                      <div
                        key={dim.id}
                        className={`rounded-lg p-3 border bg-gradient-to-r ${gradientClass}`}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs">{dim.emoji}</span>
                          <span className={`text-xs font-medium ${textClass}`}>
                            {dim.label}维度{isPositive ? '创新高' : '需关注'}
                          </span>
                          <span className={`ml-auto text-[10px] px-1 py-0.5 rounded ${badgeClass}`}>
                            {isPositive ? '↗' : '↘'} {dim.trendPct > 0 ? (isPositive ? '+' : '-') : ''}{dim.trendPct}%
                          </span>
                        </div>
                        <p className={`text-[10px] mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          建议：{dim.actionLabel}
                        </p>
                        <button
                          onClick={() => {
                            const mem = getRelatedMemoriesForDim(dim.id)[0];
                            if (mem) selectMemory(mem);
                          }}
                          className={`text-[10px] px-1.5 py-0.5 rounded underline-offset-2 hover:underline transition-colors ${
                            isDark ? `${textClass}/60 hover:${textClass}` : `${textClass}/60 hover:${textClass}`
                          }`}
                        >
                          📎 追溯相关记忆
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 心智模型气质画像 */}
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
                    {temperament.traits.map((trait, i) => {
                      const totalPct = temperament.traits.reduce((s, t) => s + t.pct, 0) || 1;
                      const circumference = 2 * Math.PI * 28;
                      const offset = temperament.traits.slice(0, i).reduce((s, t) => s + (t.pct / totalPct) * circumference, 0);
                      const dashLen = (trait.pct / totalPct) * circumference;
                      const colors = ['#f59e0b', '#8b5cf6', '#06b6d4'];
                      return (
                        <circle key={i} cx="32" cy="32" r="28" fill="none"
                          stroke={colors[i % 3]} strokeWidth="8"
                          strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                          strokeDashoffset={`${-offset}`}
                          strokeLinecap="round"
                          transform="rotate(-90 32 32)" />
                      );
                    })}
                    <text x="32" y="36" textAnchor="middle" className={`text-xs font-bold ${isDark ? 'fill-gray-200' : 'fill-gray-800'}`}>
                      {temperament.confidence}%
                    </text>
                  </svg>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {temperament.type}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                        {temperament.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {temperament.traits.map((trait, i) => (
                        <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-700'
                        }`}>{trait.emoji} {trait.name} {trait.pct}%</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={`text-[10px] mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  代表性记忆片段：
                </div>
                <div className="space-y-1.5">
                  {temperament.representativeMems.map((mem, i) => (
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

              {/* 维度利率排名 */}
              <div className={`border-t pt-3 ${
                isDark ? 'border-[#ffffff08]' : 'border-gray-200'
              }`}>
                <h4 className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  📈 维度利率排名
                </h4>
                <div className="space-y-1">
                  {dimensionRates.map(item => (
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

              {/* 记忆类型增值潜力排行 */}
              <div className={`border-t pt-3 ${
                isDark ? 'border-[#ffffff08]' : 'border-gray-200'
              }`}>
                <h4 className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  💹 记忆类型增值潜力排行
                </h4>
                <div className="space-y-1">
                  {memoryTypePotential.map(item => (
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
