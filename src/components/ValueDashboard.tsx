import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { getTop5HighValue, getForgettingRiskWarnings } from '../utils/valueUtils';
import { EMOTION_COLORS } from '../types';
import type { RawMemory } from '../types';

const RISK_COLORS: Record<string, string> = {
  high: '#ff4444',
  medium: '#ffb800',
  low: '#44ccaa',
};

const RISK_DARK_COLORS: Record<string, string> = {
  high: '#ff6666',
  medium: '#ffcc00',
  low: '#66ddbb',
};

const RISK_LABELS: Record<string, string> = {
  high: '⚠️ 高',
  medium: '⚡ 中',
  low: '✓ 低',
};

const DIM_LABELS = ['时间', '空间', '社交', '情感', '活动', '感官', '语义', '价值', '叙事', '智能体'];

function calcDimensionCoverage(memories: RawMemory[]): number[] {
  if (memories.length === 0) return DIM_LABELS.map(() => 0);
  const total = memories.length;
  const counts = [
    memories.filter(m => m.dimensions.temporal.timestamp > 0).length,
    memories.filter(m => m.dimensions.spatial.landmark !== '未指定').length,
    memories.filter(m => m.dimensions.social.persons.length > 0).length,
    memories.filter(m => !!m.dimensions.emotional.primary).length,
    memories.filter(m => m.dimensions.activity.type !== '未分类').length,
    memories.filter(m =>
      m.dimensions.sensory.images.length > 0 ||
      m.dimensions.sensory.audio.length > 0 ||
      m.dimensions.sensory.videos.length > 0
    ).length,
    memories.filter(m =>
      m.dimensions.semantic.knowledge.length > 0 ||
      m.dimensions.semantic.skills.length > 0
    ).length,
    memories.filter(m => m.dimensions.value.importance > 0).length,
    memories.filter(m => !!m.dimensions.narrative.storyline).length,
    memories.filter(m => !!m.dimensions.agentState.status).length,
  ];
  return counts.map(c => c / total);
}

function calcForgetfulnessIndex(memories: RawMemory[]): number {
  if (memories.length === 0) return 0;
  const now = Date.now();
  const MILLIS_PER_DAY = 86400000;
  const scores = memories.map(m => {
    const days = (now - m.dimensions.temporal.timestamp) / MILLIS_PER_DAY;
    const accessDivisor = Math.max(m.dimensions.value.accessCount, 1);
    return Math.min(days / (accessDivisor * 30), 1);
  });
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function calcEmotionDistribution(memories: RawMemory[]): Record<string, number> {
  const dist: Record<string, number> = {};
  memories.forEach(m => {
    const e = m.dimensions.emotional.primary;
    dist[e] = (dist[e] || 0) + 1;
  });
  return dist;
}

const RADAR_R = 80;
const RADAR_CX = 100;
const RADAR_CY = 100;
const TOP_EMOTIONS_COUNT = 8;

function polarToCartesian(cx: number, cy: number, r: number, angle: number): [number, number] {
  return [cx + r * Math.cos(angle - Math.PI / 2), cy + r * Math.sin(angle - Math.PI / 2)];
}

function RadarChart({ coverage }: { coverage: number[] }) {
  const n = coverage.length;
  const angleStep = (2 * Math.PI) / n;

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const gridPolygons = gridLevels.map(level => {
    const points = coverage.map((_, i) => {
      const [x, y] = polarToCartesian(RADAR_CX, RADAR_CY, RADAR_R * level, i * angleStep);
      return `${x},${y}`;
    });
    return points.join(' ');
  });

  const dataPoints = coverage.map((v, i) => {
    const [x, y] = polarToCartesian(RADAR_CX, RADAR_CY, RADAR_R * v, i * angleStep);
    return `${x},${y}`;
  });
  const dataPolygon = dataPoints.join(' ');

  const labelPoints = coverage.map((_, i) => {
    const [x, y] = polarToCartesian(RADAR_CX, RADAR_CY, RADAR_R + 16, i * angleStep);
    return { x, y, label: DIM_LABELS[i] };
  });

  return (
    <svg viewBox="0 0 200 200" className="w-full h-auto">
      {gridPolygons.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="#ffffff10"
          strokeWidth="0.5"
          strokeDasharray={i === gridPolygons.length - 1 ? 'none' : '2,2'}
        />
      ))}
      {coverage.map((_, i) => {
        const [x, y] = polarToCartesian(RADAR_CX, RADAR_CY, RADAR_R, i * angleStep);
        return (
          <line
            key={i}
            x1={RADAR_CX}
            y1={RADAR_CY}
            x2={x}
            y2={y}
            stroke="#ffffff10"
            strokeWidth="0.5"
          />
        );
      })}
      <polygon
        points={dataPolygon}
        fill="#ffb800"
        fillOpacity="0.15"
        stroke="#ffb800"
        strokeWidth="1.5"
      />
      {dataPoints.map((_, i) => {
        const [cx, cy] = polarToCartesian(RADAR_CX, RADAR_CY, RADAR_R * coverage[i], i * angleStep);
        return (
          <circle key={i} cx={cx} cy={cy} r="2.5" fill="#ffb800" stroke="#fff" strokeWidth="0.5" />
        );
      })}
      {labelPoints.map(({ x, y, label }) => (
        <text
          key={label}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#888"
          fontSize="7"
          fontFamily="sans-serif"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

function EmotionBars({ distribution, total }: { distribution: Record<string, number>; total: number }) {
  const sorted = Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, TOP_EMOTIONS_COUNT);
  const maxCount = sorted[0]?.[1] || 1;

  return (
    <div className="space-y-1.5">
      {sorted.map(([emotion, count]) => (
        <div key={emotion} className="flex items-center gap-2 text-[10px]">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] || '#888' }}
          />
          <span className="w-10 text-gray-400 flex-shrink-0">{emotion}</span>
          <div className="flex-1 h-2 bg-[#ffffff08] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(count / maxCount) * 100}%`,
                backgroundColor: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] || '#888',
              }}
            />
          </div>
          <span className="w-6 text-right text-gray-500">{count}</span>
        </div>
      ))}
    </div>
  );
}

export default function ValueDashboard() {
  const { rawMemories, detailOpen, selectMemory, theme } = useAppState();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'value' | 'health'>('value');

  const top5 = useMemo(() => getTop5HighValue(rawMemories), [rawMemories]);
  const riskWarnings = useMemo(() => getForgettingRiskWarnings(rawMemories), [rawMemories]);

  const dimensionCoverage = useMemo(() => calcDimensionCoverage(rawMemories), [rawMemories]);
  const forgetfulnessIndex = useMemo(() => calcForgetfulnessIndex(rawMemories), [rawMemories]);
  const emotionDistribution = useMemo(() => calcEmotionDistribution(rawMemories), [rawMemories]);

  const riskColorMap = isDark ? RISK_DARK_COLORS : RISK_COLORS;

  return (
    <>
      <button
        id="val-dash-trigger"
        onClick={() => setOpen(!open)}
        className={`fixed bottom-20 w-12 h-12 bg-[#ffb800]/15 border border-[#ffb800]/20 rounded-full flex items-center justify-center text-xl hover:bg-[#ffb800]/25 transition-all z-20 shadow-[0_0_15px_rgba(255,184,0,0.1)] ${
          detailOpen ? 'right-[436px]' : 'right-6'
        }`}
        title="价值看板"
      >
        📊
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed bottom-20 w-[380px] max-h-[520px] backdrop-blur-xl border rounded-xl p-4 z-20 shadow-2xl overflow-hidden flex flex-col ${
              isDark ? 'bg-[#1a1020]/98 border-[#ffffff08]' : 'bg-white/98 border-gray-200'
            } ${
              detailOpen ? 'right-[436px]' : 'right-6'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex gap-1">
                <button
                  onClick={() => setTab('value')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    tab === 'value'
                      ? isDark ? 'bg-[#ffb800]/15 text-[#ffb800]' : 'bg-yellow-100 text-yellow-700'
                      : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  📊 价值看板
                </button>
                <button
                  onClick={() => setTab('health')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    tab === 'health'
                      ? isDark ? 'bg-[#ffb800]/15 text-[#ffb800]' : 'bg-yellow-100 text-yellow-700'
                      : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  ❤️ 记忆健康
                </button>
              </div>
              <button
                onClick={() => setOpen(false)}
                className={`text-lg leading-none ${
                  isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4">
              {tab === 'value' && (
                <>
                  <section>
                    <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      🏆 高价值记忆 Top 5
                    </h4>
                    <div className="space-y-1.5">
                      {top5.map((item) => (
                        <button
                          key={item.memory.id}
                          onClick={() => { selectMemory(item.memory); setOpen(false); }}
                          className={`w-full text-left p-2 rounded-lg transition-all cursor-pointer ${
                            isDark
                              ? 'hover:bg-[#ffffff08] bg-[#ffffff03]'
                              : 'hover:bg-black/5 bg-black/[0.02]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: EMOTION_COLORS[item.memory.dimensions.emotional.primary] }}
                            />
                            <span className={`text-xs flex-1 truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {item.memory.label}
                            </span>
                            <span className={`text-xs font-mono flex-shrink-0 ${
                              isDark ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {item.score.toFixed(0)}分
                            </span>
                          </div>
                          <div className={`flex gap-3 mt-1 pl-4 text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            <span>重要性 {item.breakdown.importance.toFixed(0)}</span>
                            <span>CQI {item.breakdown.cqi.toFixed(0)}</span>
                            <span>情感 {item.breakdown.emotionalIntensity.toFixed(0)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      🔔 遗忘风险预警
                    </h4>
                    {riskWarnings.length === 0 ? (
                      <div className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                        ✅ 当前无高风险记忆
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {riskWarnings.map((item) => (
                          <button
                            key={item.memory.id}
                            onClick={() => { selectMemory(item.memory); setOpen(false); }}
                            className={`w-full text-left p-2 rounded-lg transition-all cursor-pointer ${
                              isDark
                                ? 'hover:bg-[#ffffff08] bg-[#ffffff03]'
                                : 'hover:bg-black/5 bg-black/[0.02]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                                style={{
                                  color: riskColorMap[item.level],
                                  backgroundColor: `${riskColorMap[item.level]}15`,
                                }}
                              >
                                {RISK_LABELS[item.level]}
                              </span>
                              <span className={`text-xs flex-1 truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {item.memory.label}
                              </span>
                              <span className={`text-xs flex-shrink-0 ${
                                isDark ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                {item.daysSinceCreation.toFixed(0)}天前
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}

              {tab === 'health' && (
                <>
                  <section>
                    <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      🎯 10 维度覆盖率雷达图
                    </h4>
                    <div className={`rounded-lg p-3 ${isDark ? 'bg-[#ffffff03]' : 'bg-gray-50'}`}>
                      <RadarChart coverage={dimensionCoverage} />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dimensionCoverage.map((v, i) => (
                        <div key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-[#ffffff05] text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                          {DIM_LABELS[i]} {(v * 100).toFixed(0)}%
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      ⏳ 遗忘指数
                    </h4>
                    <div className={`rounded-lg p-3 ${isDark ? 'bg-[#ffffff03]' : 'bg-gray-50'}`}>
                      <div className="flex items-end gap-2 mb-1">
                        <span className={`text-2xl font-bold ${
                          forgetfulnessIndex > 0.5
                            ? 'text-red-400'
                            : forgetfulnessIndex > 0.3
                            ? 'text-[#ffb800]'
                            : 'text-[#44ccaa]'
                        }`}>
                          {(forgetfulnessIndex * 100).toFixed(1)}%
                        </span>
                        <span className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          平均遗忘风险
                        </span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#ffffff08]' : 'bg-gray-200'}`}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${forgetfulnessIndex * 100}%`,
                            backgroundColor: forgetfulnessIndex > 0.5 ? '#ff4444' : forgetfulnessIndex > 0.3 ? '#ffb800' : '#44ccaa',
                          }}
                        />
                      </div>
                      <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                        {forgetfulnessIndex > 0.5
                          ? '部分记忆面临较高遗忘风险，建议定期回顾'
                          : forgetfulnessIndex > 0.3
                          ? '遗忘风险适中，可适当关注久远的记忆'
                          : '记忆状态良好，遗忘风险较低'}
                      </p>
                    </div>
                  </section>

                  <section>
                    <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      🌈 情绪分布（Top {TOP_EMOTIONS_COUNT}）
                    </h4>
                    <div className={`rounded-lg p-3 ${isDark ? 'bg-[#ffffff03]' : 'bg-gray-50'}`}>
                      <EmotionBars distribution={emotionDistribution} total={rawMemories.length} />
                    </div>
                  </section>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}