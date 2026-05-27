import type { RawMemory } from '../types';

export type TimeRange = '周' | '月' | '季';

export interface DimensionItem {
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

export interface RateItem {
  rank: number;
  emoji: string;
  name: string;
  rate: number;
  change: string;
  up: boolean;
  risk: 'low' | 'medium' | 'high';
}

export interface PotentialItem {
  rank: number;
  label: string;
  icon: string;
  stars: number;
  invest: string;
  suggestion: string;
}

export interface TemperamentResult {
  type: string;
  label: string;
  confidence: number;
  traits: { emoji: string; name: string; pct: number }[];
  representativeMems: { emoji: string; label: string; date: string; type: string }[];
}

export interface HealthResult {
  score: number;
  delta: number;
}

export interface AssetStats {
  positive: number;
  negative: number;
  ratio: number;
  total: number;
}

const MILLIS_PER_DAY = 86400000;
const RANGE_DAYS: Record<TimeRange, number> = { '周': 7, '月': 30, '季': 90 };

export function filterByTimeRange(memories: RawMemory[], range: TimeRange, now: number = Date.now()): RawMemory[] {
  const cutoff = now - RANGE_DAYS[range] * MILLIS_PER_DAY;
  return memories.filter(m => m.dimensions.temporal.timestamp >= cutoff);
}

function filterPrevPeriod(memories: RawMemory[], range: TimeRange, now: number = Date.now()): RawMemory[] {
  const days = RANGE_DAYS[range];
  const end = now - days * MILLIS_PER_DAY;
  const start = end - days * MILLIS_PER_DAY;
  return memories.filter(m => {
    const ts = m.dimensions.temporal.timestamp;
    return ts >= start && ts < end;
  });
}

function computeDimensionValue(memories: RawMemory[], dimId: string): number {
  if (memories.length === 0) return 0;
  const total = memories.length;
  let count = 0;
  let intensitySum = 0;

  for (const m of memories) {
    const d = m.dimensions;
    switch (dimId) {
      case 'happiness':
        if (d.emotional.primary === '快乐') { count++; intensitySum += d.emotional.intensity; }
        break;
      case 'social':
        if (d.social.persons.length >= 2) { count++; intensitySum += d.social.intimacy; }
        break;
      case 'creativity':
        if (d.activity.type === '绘画' || d.activity.type === '创作' || d.activity.detail.includes('画') || d.activity.detail.includes('创')) count++;
        break;
      case 'logic':
        if (d.semantic.knowledge.length > 0 || d.activity.type === '学习' || d.activity.type === '编程') count++;
        break;
      case 'outdoor':
        if (d.spatial.placeType === '公园' || d.spatial.placeType === '游乐场') count++;
        break;
    }
  }

  const ratio = count / total;
  if (intensitySum > 0 && count > 0) {
    return Math.round(ratio * (intensitySum / count) * 100);
  }
  return Math.round(ratio * 100);
}

function trendFromValues(current: number, prev: number): { trend: 'up' | 'down' | 'stable'; trendPct: number } {
  const diff = current - prev;
  if (Math.abs(diff) < 2) return { trend: 'stable', trendPct: 0 };
  const pct = prev > 0 ? Math.round(Math.abs(diff / prev) * 100) : Math.abs(diff);
  return { trend: diff > 0 ? 'up' : 'down', trendPct: Math.min(pct, 99) };
}

function predictionFromTrend(trend: 'up' | 'down' | 'stable', value: number): { prediction: 'up' | 'down' | 'warn'; predictionLabel: string } {
  if (trend === 'up' || (trend === 'stable' && value >= 50)) return { prediction: 'up', predictionLabel: '↗ 保持' };
  if (value < 30) return { prediction: 'warn', predictionLabel: '⚠ 预警' };
  return { prediction: 'down', predictionLabel: '↘ 下降' };
}

function actionForDimension(dimId: string, value: number): string {
  const actions: Record<string, { low: string; mid: string; high: string }> = {
    happiness: { low: '增加快乐活动', mid: '保持平衡', high: '保持当前节奏' },
    social: { low: '建议安排聚会', mid: '适度社交', high: '社交状态良好' },
    creativity: { low: '尝试新创意活动', mid: '持续创作', high: '创意表现优秀' },
    logic: { low: '增加学习活动', mid: '保持学习', high: '学习状态良好' },
    outdoor: { low: '建议周末出游', mid: '增加户外', high: '户外活动充足' },
  };
  const a = actions[dimId] || { low: '增加投入', mid: '保持', high: '良好' };
  if (value < 30) return a.low;
  if (value < 60) return a.mid;
  return a.high;
}

const DIM_DEFS = [
  { id: 'happiness', emoji: '😊', label: '快乐' },
  { id: 'logic', emoji: '🧠', label: '逻辑' },
  { id: 'social', emoji: '👫', label: '社交' },
  { id: 'outdoor', emoji: '🏃', label: '户外活动' },
  { id: 'creativity', emoji: '🎨', label: '创意' },
];

export function computeDimensionData(memories: RawMemory[], range: TimeRange, now: number = Date.now()): DimensionItem[] {
  const current = filterByTimeRange(memories, range, now);
  const prev = filterPrevPeriod(memories, range, now);

  return DIM_DEFS.map(def => {
    const value = computeDimensionValue(current, def.id);
    const prevValue = computeDimensionValue(prev, def.id);
    const { trend, trendPct } = trendFromValues(value, prevValue);
    const { prediction, predictionLabel } = predictionFromTrend(trend, value);

    return {
      id: def.id,
      emoji: def.emoji,
      label: def.label,
      value,
      trend,
      trendPct,
      prediction,
      predictionLabel,
      actionLabel: actionForDimension(def.id, value),
    };
  });
}

export function computeHealthScore(memories: RawMemory[], range: TimeRange, now: number = Date.now()): HealthResult {
  const current = filterByTimeRange(memories, range, now);
  const prev = filterPrevPeriod(memories, range, now);

  if (current.length === 0) return { score: 0, delta: 0 };

  const dims = DIM_DEFS.map(d => computeDimensionValue(current, d.id));
  const prevDims = DIM_DEFS.map(d => computeDimensionValue(prev, d.id));

  const score = Math.round(dims.reduce((a, b) => a + b, 0) / dims.length);
  const prevScore = Math.round(prevDims.reduce((a, b) => a + b, 0) / prevDims.length);

  return { score: Math.min(score, 100), delta: score - prevScore };
}

export function computeAssetStats(memories: RawMemory[]): AssetStats {
  if (memories.length === 0) return { positive: 0, negative: 0, ratio: 0, total: 0 };

  let positive = 0;
  for (const m of memories) {
    const e = m.dimensions.emotional;
    const positiveEmotions = ['快乐', '好奇', '骄傲', '感激'];
    if (positiveEmotions.includes(e.primary) && e.intensity > 0.5) {
      positive++;
    }
  }
  const negative = memories.length - positive;
  const ratio = Math.round((positive / memories.length) * 100);

  return { positive, negative, ratio, total: memories.length };
}

export function computeTemperament(memories: RawMemory[]): TemperamentResult {
  if (memories.length === 0) {
    return {
      type: '未知气质',
      label: '数据不足',
      confidence: 0,
      traits: [],
      representativeMems: [],
    };
  }

  const emotionCounts: Record<string, number> = {};
  for (const m of memories) {
    const e = m.dimensions.emotional.primary;
    emotionCounts[e] = (emotionCounts[e] || 0) + 1;
  }

  const total = memories.length;
  const positiveEmotions = ['快乐', '好奇', '骄傲', '感激'];
  const securityEmotions = ['中性', '感激'];
  const creativeEmotions = ['好奇', '惊讶'];

  const emotionalPct = Math.round(
    (Object.entries(emotionCounts)
      .filter(([e]) => positiveEmotions.includes(e))
      .reduce((s, [, c]) => s + c, 0) / total) * 100
  );
  const securityPct = Math.round(
    (Object.entries(emotionCounts)
      .filter(([e]) => securityEmotions.includes(e))
      .reduce((s, [, c]) => s + c, 0) / total) * 100
  );
  const creativePct = Math.round(
    (Object.entries(emotionCounts)
      .filter(([e]) => creativeEmotions.includes(e))
      .reduce((s, [, c]) => s + c, 0) / total) * 100
  );

  const traits = [
    { emoji: '🟡', name: '情感驱动', pct: emotionalPct },
    { emoji: '🟣', name: '安全依赖', pct: securityPct },
    { emoji: '🔵', name: '创造力导向', pct: creativePct },
  ].sort((a, b) => b.pct - a.pct);

  const dominantTrait = traits[0];
  const typeMap: Record<string, string> = {
    '情感驱动': '俄耳甫斯气质',
    '安全依赖': '雅努斯气质',
    '创造力导向': '普罗米修斯气质',
  };
  const labelMap: Record<string, string> = {
    '情感驱动': '情感驱动型学习者',
    '安全依赖': '安全导向型探索者',
    '创造力导向': '创造力驱动型思考者',
  };

  const sorted = [...memories].sort((a, b) => b.dimensions.value.importance - a.dimensions.value.importance);
  const representativeMems = sorted.slice(0, 3).map(m => {
    const ts = m.dimensions.temporal.timestamp;
    const date = new Date(ts).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');
    const positiveEmotions2 = ['快乐', '好奇', '骄傲', '感激'];
    const type = positiveEmotions2.includes(m.dimensions.emotional.primary) ? '正资产' : '待改善';
    const emoji = m.dimensions.activity.type === '绘画' || m.dimensions.activity.type === '创作' ? '🎨'
      : m.dimensions.social.persons.length > 1 ? '🤗'
      : m.dimensions.semantic.knowledge.length > 0 ? '📖'
      : '🧠';
    return { emoji, label: m.label, date, type };
  });

  return {
    type: typeMap[dominantTrait.name] || '综合气质',
    label: labelMap[dominantTrait.name] || '多元发展型',
    confidence: Math.round(dominantTrait.pct),
    traits,
    representativeMems,
  };
}

export function computeDimensionRates(memories: RawMemory[], range: TimeRange, now: number = Date.now()): RateItem[] {
  const current = filterByTimeRange(memories, range, now);
  const prev = filterPrevPeriod(memories, range, now);

  return DIM_DEFS.map((def, i) => {
    const value = computeDimensionValue(current, def.id);
    const prevValue = computeDimensionValue(prev, def.id);
    const rate = Math.round(value * 100) / 100;
    const diff = value - prevValue;
    const changeStr = diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
    const risk: RateItem['risk'] = value < 25 ? 'high' : value < 50 ? 'medium' : 'low';

    return {
      rank: i + 1,
      emoji: def.emoji,
      name: def.label,
      rate,
      change: changeStr,
      up: diff >= 0,
      risk,
    };
  }).sort((a, b) => b.rate - a.rate).map((item, i) => ({ ...item, rank: i + 1 }));
}

export function computeMemoryTypePotential(memories: RawMemory[]): PotentialItem[] {
  if (memories.length === 0) return [];

  const categories = [
    { label: '亲子互动记忆', icon: '👨‍👧', filter: (m: RawMemory) => m.dimensions.social.persons.some(p => p.includes('爸') || p.includes('妈') || p.includes('父') || p.includes('母')) },
    { label: '学习成长记忆', icon: '📚', filter: (m: RawMemory) => m.dimensions.activity.type === '学习' || m.dimensions.semantic.knowledge.length > 0 },
    { label: '社交情感记忆', icon: '💬', filter: (m: RawMemory) => m.dimensions.social.persons.length >= 2 },
    { label: '户外探索记忆', icon: '🌲', filter: (m: RawMemory) => m.dimensions.spatial.placeType === '公园' || m.dimensions.spatial.placeType === '游乐场' },
    { label: '日常习惯记忆', icon: '🏠', filter: (m: RawMemory) => m.dimensions.spatial.placeType === '家' },
  ];

  const results = categories.map(cat => {
    const matched = memories.filter(cat.filter);
    const count = matched.length;
    const avgImportance = count > 0
      ? matched.reduce((s, m) => s + m.dimensions.value.importance, 0) / count
      : 0;
    const avgCqi = count > 0
      ? matched.reduce((s, m) => s + m.dimensions.value.cqi, 0) / count
      : 0;
    const score = (count / memories.length) * 50 + avgImportance * 30 + avgCqi * 20;
    const stars = Math.max(1, Math.min(5, Math.round(score / 20)));
    const invest = stars >= 4 ? '高' : stars >= 3 ? '中' : '低';
    const suggestions: Record<string, string> = {
      '高': '持续高回报资产，保持投入',
      '中': '稳定增值，可适度增加',
      '低': '需增加投入，提升价值',
    };

    return {
      rank: 0,
      label: cat.label,
      icon: cat.icon,
      stars,
      invest,
      suggestion: suggestions[invest],
      score,
    };
  });

  results.sort((a, b) => b.score - a.score);
  return results.map((r, i) => ({
    rank: i + 1,
    label: r.label,
    icon: r.icon,
    stars: r.stars,
    invest: r.invest,
    suggestion: r.suggestion,
  }));
}
