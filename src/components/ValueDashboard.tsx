import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { getTop5HighValue, getForgettingRiskWarnings, computeDecayCurve, computeDailyEmotionMap, getReviewCandidates } from '../utils/valueUtils';
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

const CHART_W = 340;
const CHART_H = 180;
const CHART_PAD = { top: 20, right: 15, bottom: 30, left: 35 };
const PLOT_W = CHART_W - CHART_PAD.left - CHART_PAD.right;
const PLOT_H = CHART_H - CHART_PAD.top - CHART_PAD.bottom;

function DecayCurveChart({ rawMemories, theme, onReinforce, onSelect }: {
  rawMemories: RawMemory[];
  theme: 'dark' | 'light';
  onReinforce: (id: string) => void;
  onSelect: (m: RawMemory) => void;
}) {
  const isDark = theme === 'dark';
  const [hovered, setHovered] = useState<{ x: number; y: number; memory: RawMemory; retention: number } | null>(null);

  const curve = useMemo(() => computeDecayCurve(rawMemories), [rawMemories]);
  const maxDay = 90;

  const toX = (day: number) => CHART_PAD.left + (day / maxDay) * PLOT_W;
  const toY = (ret: number) => CHART_PAD.top + (1 - ret) * PLOT_H;

  // Theoretical Ebbinghaus curve path
  const theoryPath = curve.theoretical
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.day)},${toY(p.theoretical)}`)
    .join(' ');

  // Area fill for "memory abyss" zone (retention < 0.3)
  const abyssY = toY(0.3);

  return (
    <div className={`rounded-lg p-3 ${isDark ? 'bg-[#ffffff03]' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {curve.abyssCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-medium">
              ⚠ {curve.abyssCount} 条记忆濒临遗忘
            </span>
          )}
        </div>
      </div>

      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-auto">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map(v => (
          <g key={v}>
            <line x1={CHART_PAD.left} y1={toY(v)} x2={CHART_W - CHART_PAD.right} y2={toY(v)}
              stroke={isDark ? '#ffffff08' : '#00000008'} strokeWidth="0.5" />
            <text x={CHART_PAD.left - 4} y={toY(v)} textAnchor="end" dominantBaseline="central"
              fontSize="8" fill={isDark ? '#555' : '#999'}>{(v * 100).toFixed(0)}%</text>
          </g>
        ))}
        {[0, 30, 60, 90].map(d => (
          <g key={d}>
            <line x1={toX(d)} y1={CHART_PAD.top} x2={toX(d)} y2={CHART_PAD.top + PLOT_H}
              stroke={isDark ? '#ffffff08' : '#00000008'} strokeWidth="0.5" />
            <text x={toX(d)} y={CHART_H - 8} textAnchor="middle"
              fontSize="8" fill={isDark ? '#555' : '#999'}>{d}天</text>
          </g>
        ))}

        {/* Memory abyss zone */}
        <rect x={CHART_PAD.left} y={abyssY} width={PLOT_W} height={PLOT_H - (abyssY - CHART_PAD.top)}
          fill={isDark ? '#ff444408' : '#ff444405'} />
        <line x1={CHART_PAD.left} y1={abyssY} x2={CHART_W - CHART_PAD.right} y2={abyssY}
          stroke="#ff444430" strokeWidth="0.5" strokeDasharray="4,3" />
        <text x={CHART_W - CHART_PAD.right - 2} y={abyssY - 3} textAnchor="end"
          fontSize="7" fill="#ff444480">遗忘深渊</text>

        {/* Theoretical Ebbinghaus curve */}
        <path d={theoryPath} fill="none" stroke={isDark ? '#00f2ff40' : '#0088cc40'} strokeWidth="1.5" />

        {/* Actual memory data points */}
        {curve.actual.map((p, i) => (
          <circle
            key={i}
            cx={toX(p.day)}
            cy={toY(p.retention)}
            r={3}
            fill={EMOTION_COLORS[p.memory.dimensions.emotional.primary] || '#888'}
            stroke={isDark ? '#0d1525' : '#fff'}
            strokeWidth="1"
            className="cursor-pointer"
            onMouseEnter={(e) => {
              const rect = (e.target as SVGCircleElement).closest('svg')!.getBoundingClientRect();
              setHovered({
                x: toX(p.day),
                y: toY(p.retention),
                memory: p.memory,
                retention: p.retention,
              });
            }}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(p.memory)}
          />
        ))}

        {/* Axes labels */}
        <text x={CHART_W / 2} y={CHART_H - 1} textAnchor="middle" fontSize="8" fill={isDark ? '#666' : '#aaa'}>
          时间（天）
        </text>
        <text x={6} y={CHART_H / 2} textAnchor="middle" fontSize="8" fill={isDark ? '#666' : '#aaa'}
          transform={`rotate(-90, 6, ${CHART_H / 2})`}>
          记忆留存
        </text>
      </svg>

      {/* Hover tooltip */}
      {hovered && (
        <div
          className={`absolute z-50 px-2.5 py-1.5 rounded-lg text-[10px] pointer-events-none border shadow-lg ${
            isDark ? 'bg-[#1a1020]/95 border-[#ffffff15] text-gray-300' : 'bg-white/95 border-gray-200 text-gray-700'
          }`}
          style={{ left: `${(hovered.x / CHART_W) * 100}%`, top: `${(hovered.y / CHART_H) * 100 - 15}%` }}
        >
          <div className="font-medium">{hovered.memory.label}</div>
          <div className={isDark ? 'text-gray-500' : 'text-gray-400'}>
            留存 {(hovered.retention * 100).toFixed(0)}% · {hovered.memory.dimensions.emotional.primary}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-4 h-0.5 rounded" style={{ background: isDark ? '#00f2ff40' : '#0088cc40' }} />
          <span className={`text-[9px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>理论衰减</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-500" />
          <span className={`text-[9px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>实际记忆</span>
        </div>
      </div>

      {/* Reinforce section */}
      {curve.actual.filter(p => p.risk >= 0.5).length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-[#ffffff08]">
          <div className={`text-[10px] mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            📌 建议重温
          </div>
          <div className="space-y-1">
            {curve.actual
              .filter(p => p.risk >= 0.5)
              .sort((a, b) => b.risk - a.risk)
              .slice(0, 3)
              .map(p => (
                <div key={p.memory.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: EMOTION_COLORS[p.memory.dimensions.emotional.primary] || '#888' }} />
                  <span className={`text-[10px] flex-1 truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {p.memory.label}
                  </span>
                  <button
                    onClick={() => onReinforce(p.memory.id)}
                    className={`text-[10px] px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      isDark ? 'bg-[#00f2ff]/10 text-[#00f2ff] hover:bg-[#00f2ff]/20' : 'bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20'
                    }`}
                  >
                    温故
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

const CAL_CELL = 11;
const CAL_GAP = 2;
const CAL_WEEKS = 13; // ~3 months

function EmotionCalendar({ rawMemories, theme }: { rawMemories: RawMemory[]; theme: 'dark' | 'light' }) {
  const isDark = theme === 'dark';
  const [hovered, setHovered] = useState<{ x: number; y: number; entry: { date: string; emotion: string; count: number; summaries: string[] } } | null>(null);

  const data = useMemo(() => computeDailyEmotionMap(rawMemories, 91), [rawMemories]);
  const dataMap = useMemo(() => {
    const m = new Map<string, typeof data[0]>();
    data.forEach(d => m.set(d.date, d));
    return m;
  }, [data]);

  // Build grid: 7 rows (Sun-Sat) x CAL_WEEKS columns
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (CAL_WEEKS * 7 - 1) - startDate.getDay());

  const weeks: { date: Date; key: string }[][] = [];
  const cursor = new Date(startDate);
  for (let w = 0; w < CAL_WEEKS; w++) {
    const week: { date: Date; key: string }[] = [];
    for (let d = 0; d < 7; d++) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
      week.push({ date: new Date(cursor), key });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const svgW = CAL_WEEKS * (CAL_CELL + CAL_GAP) + 30;
  const svgH = 7 * (CAL_CELL + CAL_GAP) + 20;

  return (
    <div className={`rounded-lg p-3 ${isDark ? 'bg-[#ffffff03]' : 'bg-gray-50'}`}>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto">
        {/* Day labels */}
        {['日', '一', '二', '三', '四', '五', '六'].map((label, i) => (
          <text key={i} x={10} y={12 + i * (CAL_CELL + CAL_GAP) + CAL_CELL / 2}
            textAnchor="middle" dominantBaseline="central" fontSize="7"
            fill={isDark ? '#555' : '#999'}>{label}</text>
        ))}

        {/* Cells */}
        {weeks.map((week, wi) => week.map((day, di) => {
          const entry = dataMap.get(day.key);
          const x = 22 + wi * (CAL_CELL + CAL_GAP);
          const y = 2 + di * (CAL_CELL + CAL_GAP);
          const color = entry ? (EMOTION_COLORS[entry.primaryEmotion as keyof typeof EMOTION_COLORS] || '#888') : 'transparent';
          const opacity = entry ? Math.min(0.3 + entry.count * 0.2, 1) : 0;

          return (
            <rect
              key={day.key}
              x={x} y={y}
              width={CAL_CELL} height={CAL_CELL}
              rx={2}
              fill={color}
              fillOpacity={opacity}
              stroke={isDark ? '#ffffff08' : '#00000008'}
              strokeWidth="0.5"
              className="cursor-pointer"
              onMouseEnter={(e) => {
                if (!entry) return;
                const rect = (e.target as SVGRectElement).getBoundingClientRect();
                const svgRect = (e.target as SVGRectElement).closest('svg')!.getBoundingClientRect();
                setHovered({ x: x + CAL_CELL / 2, y, entry: { date: day.key, emotion: entry.primaryEmotion, count: entry.count, summaries: entry.summaries } });
              }}
              onMouseLeave={() => setHovered(null)}
            />
          );
        }))}
      </svg>

      {/* Hover tooltip */}
      {hovered && (
        <div
          className={`absolute z-50 px-2.5 py-1.5 rounded-lg text-[10px] pointer-events-none border shadow-lg max-w-[200px] ${
            isDark ? 'bg-[#1a1020]/95 border-[#ffffff15] text-gray-300' : 'bg-white/95 border-gray-200 text-gray-700'
          }`}
          style={{ left: `${(hovered.x / svgW) * 100}%`, top: `${(hovered.y / svgH) * 100 - 10}%` }}
        >
          <div className="font-medium">{hovered.entry.date}</div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-2 h-2 rounded-full" style={{ background: EMOTION_COLORS[hovered.entry.emotion as keyof typeof EMOTION_COLORS] || '#888' }} />
            <span>{hovered.entry.emotion} · {hovered.entry.count} 条</span>
          </div>
          {hovered.entry.summaries.length > 0 && (
            <div className={`mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {hovered.entry.summaries[0].slice(0, 40)}...
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {Object.entries(EMOTION_COLORS).slice(0, 8).map(([emotion, color]) => (
          <div key={emotion} className="flex items-center gap-0.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color, opacity: 0.7 }} />
            <span className={`text-[8px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{emotion}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ValueDashboard() {
  const { rawMemories, detailOpen, selectMemory, theme, valueDashboardOpen, toggleValueDashboard, reinforceMemory, addToast } = useAppState();
  const isDark = theme === 'dark';
  const open = valueDashboardOpen;
  const [tab, setTab] = useState<'value' | 'health' | 'decay' | 'calendar'>('value');

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
        onClick={toggleValueDashboard}
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
                  id="val-dash-health-tab"
                  onClick={() => setTab('health')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    tab === 'health'
                      ? isDark ? 'bg-[#ffb800]/15 text-[#ffb800]' : 'bg-yellow-100 text-yellow-700'
                      : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  ❤️ 记忆健康
                </button>
                <button
                  onClick={() => setTab('decay')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    tab === 'decay'
                      ? isDark ? 'bg-[#ffb800]/15 text-[#ffb800]' : 'bg-yellow-100 text-yellow-700'
                      : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  📉 遗忘曲线
                </button>
                <button
                  onClick={() => setTab('calendar')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    tab === 'calendar'
                      ? isDark ? 'bg-[#ffb800]/15 text-[#ffb800]' : 'bg-yellow-100 text-yellow-700'
                      : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  🗓 情绪日历
                </button>
              </div>
              <button
                onClick={toggleValueDashboard}
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
                          onClick={() => { selectMemory(item.memory); toggleValueDashboard(); }}
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
                            onClick={() => { selectMemory(item.memory); toggleValueDashboard(); }}
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

                  {(() => {
                    const reviewCandidates = getReviewCandidates(rawMemories);
                    return reviewCandidates.length > 0 ? (
                      <section>
                        <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          📌 今日推荐重温
                        </h4>
                        <div className="space-y-1.5">
                          {reviewCandidates.map(item => {
                            const emoColor = EMOTION_COLORS[item.memory.dimensions.emotional.primary] || '#888';
                            return (
                              <div key={item.memory.id} className={`p-2 rounded-lg flex items-center gap-2 ${
                                isDark ? 'bg-[#ffffff03]' : 'bg-gray-50'
                              }`}>
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: emoColor }} />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {item.memory.label}
                                  </p>
                                  <p className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {item.memory.dimensions.emotional.primary} · 风险 {(item.risk * 100).toFixed(0)}%
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    reinforceMemory(item.memory.id);
                                    addToast('已重温，遗忘曲线已重置', 'success');
                                  }}
                                  className={`text-[10px] px-2 py-0.5 rounded cursor-pointer transition-colors flex-shrink-0 ${
                                    isDark ? 'bg-[#00f2ff]/10 text-[#00f2ff] hover:bg-[#00f2ff]/20' : 'bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20'
                                  }`}
                                >
                                  温故
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    ) : null;
                  })()}
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

              {tab === 'decay' && (
                <section>
                  <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    📉 遗忘曲线（艾宾浩斯）
                  </h4>
                  <div className="relative">
                    <DecayCurveChart
                      rawMemories={rawMemories}
                      theme={theme}
                      onReinforce={(id) => {
                        reinforceMemory(id);
                        addToast('已重温，遗忘曲线已重置', 'success');
                      }}
                      onSelect={(m) => { selectMemory(m); toggleValueDashboard(); }}
                    />
                  </div>
                </section>
              )}

              {tab === 'calendar' && (
                <section>
                  <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    🗓 情绪日历（近 3 个月）
                  </h4>
                  <div className="relative">
                    <EmotionCalendar rawMemories={rawMemories} theme={theme} />
                  </div>
                </section>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}