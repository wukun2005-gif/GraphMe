import type { RawMemory } from '../types';

export interface ValueScoreResult {
  memory: RawMemory;
  score: number;
  breakdown: {
    importance: number;
    cqi: number;
    emotionalIntensity: number;
    accessCount: number;
  };
}

export interface ForgettingRiskResult {
  memory: RawMemory;
  risk: number;
  level: 'low' | 'medium' | 'high';
  daysSinceCreation: number;
}

export function computeValueScore(memory: RawMemory): ValueScoreResult {
  const { value, emotional } = memory.dimensions;
  const importance = value.importance * 40;
  const cqi = value.cqi * 30;
  const emotionalIntensity = emotional.intensity * 20;
  const accessCount = Math.min(value.accessCount / 10, 1) * 10;

  return {
    memory,
    score: Math.round((importance + cqi + emotionalIntensity + accessCount) * 10) / 10,
    breakdown: {
      importance: Math.round(importance * 10) / 10,
      cqi: Math.round(cqi * 10) / 10,
      emotionalIntensity: Math.round(emotionalIntensity * 10) / 10,
      accessCount: Math.round(accessCount * 10) / 10,
    },
  };
}

export function computeForgettingRisk(memory: RawMemory, now: number = Date.now()): ForgettingRiskResult {
  const { timestamp } = memory.dimensions.temporal;
  const { importance } = memory.dimensions.value;
  const daysSinceCreation = Math.max(0, (now - timestamp) / (1000 * 60 * 60 * 24));
  const decayFactor = Math.min(daysSinceCreation / 30, 1.0);
  const risk = decayFactor * (1 - importance);

  let level: 'low' | 'medium' | 'high';
  if (risk < 0.2) level = 'low';
  else if (risk < 0.5) level = 'medium';
  else level = 'high';

  return {
    memory,
    risk: Math.round(risk * 1000) / 1000,
    level,
    daysSinceCreation: Math.round(daysSinceCreation * 10) / 10,
  };
}

export function getTop5HighValue(memories: RawMemory[]): ValueScoreResult[] {
  return memories
    .map(computeValueScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

export function getForgettingRiskWarnings(memories: RawMemory[], topN: number = 3): ForgettingRiskResult[] {
  return memories
    .map(m => computeForgettingRisk(m))
    .filter(r => r.level === 'high' || r.level === 'medium')
    .sort((a, b) => b.risk - a.risk)
    .slice(0, topN);
}

export interface DailyMemoryResult {
  memory: RawMemory;
  reason: 'anniversary' | 'forgetting-risk';
  daysAgo: number;
}

export interface TrajectoryPair {
  from: RawMemory;
  to: RawMemory;
  description: string;
}

export interface DailyTrajectory {
  date: string;
  pairs: TrajectoryPair[];
}

export function computeDailyTrajectories(memories: RawMemory[]): DailyTrajectory[] {
  const dayMap = new Map<string, RawMemory[]>();

  memories.forEach(m => {
    const d = new Date(m.dimensions.temporal.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!dayMap.has(key)) dayMap.set(key, []);
    dayMap.get(key)!.push(m);
  });

  const trajectories: DailyTrajectory[] = [];

  dayMap.forEach((dayMems, date) => {
    if (dayMems.length < 2) return;
    const sorted = dayMems.sort((a, b) => a.dimensions.temporal.timestamp - b.dimensions.temporal.timestamp);
    const pairs: TrajectoryPair[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const from = sorted[i];
      const to = sorted[i + 1];
      const fromEmo = from.dimensions.emotional.primary;
      const toEmo = to.dimensions.emotional.primary;
      const fromTime = from.dimensions.temporal.timeOfDay;
      const toTime = to.dimensions.temporal.timeOfDay;
      pairs.push({
        from,
        to,
        description: `${fromTime}→${toTime} 情绪从${fromEmo}变为${toEmo}`,
      });
    }
    trajectories.push({ date, pairs });
  });

  return trajectories.sort((a, b) => a.date.localeCompare(b.date));
}

export interface AnnualStats {
  totalMemories: number;
  emotionDistribution: Record<string, number>;
  monthlyActivity: { month: string; count: number }[];
  topPersons: { name: string; count: number }[];
  topLocations: { name: string; count: number }[];
  keywords: { word: string; count: number }[];
  milestones: RawMemory[];
  summaryText: string;
}

export function computeAnnualStats(memories: RawMemory[]): AnnualStats {
  const emotionDist: Record<string, number> = {};
  const monthMap = new Map<string, number>();
  const personMap = new Map<string, number>();
  const locationMap = new Map<string, number>();
  const wordMap = new Map<string, number>();

  memories.forEach(m => {
    // Emotion
    const emo = m.dimensions.emotional.primary;
    emotionDist[emo] = (emotionDist[emo] || 0) + 1;

    // Monthly activity
    const d = new Date(m.dimensions.temporal.timestamp);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);

    // Persons
    m.dimensions.social.persons.forEach(p => {
      personMap.set(p, (personMap.get(p) || 0) + 1);
    });

    // Locations
    const loc = m.dimensions.spatial.landmark || m.dimensions.spatial.placeType;
    if (loc) locationMap.set(loc, (locationMap.get(loc) || 0) + 1);

    // Keywords from summary
    const words = m.summary.replace(/[，。！？、；：""''（）\s]+/g, ' ').split(' ').filter(w => w.length >= 2);
    words.forEach(w => wordMap.set(w, (wordMap.get(w) || 0) + 1));
  });

  const milestones = memories.filter(m => m.dimensions.narrative.isMilestone);

  const topPersons = Array.from(personMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const topLocations = Array.from(locationMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const keywords = Array.from(wordMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([word, count]) => ({ word, count }));

  const monthlyActivity = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  // Summary text
  const topEmotion = Object.entries(emotionDist).sort(([, a], [, b]) => b - a)[0]?.[0] || '中性';
  const personalityMap: Record<string, string> = {
    '快乐': '阳光开朗型',
    '好奇': '探索发现型',
    '骄傲': '成就驱动型',
    '感激': '温暖感恩型',
    '悲伤': '深度感受型',
    '中性': '沉稳观察型',
  };
  const personality = personalityMap[topEmotion] || '多元体验型';
  const summaryText = `你的记忆人格是「${personality}」——${topEmotion}是你最常出现的情绪。`
    + `全年共 ${memories.length} 条记忆，${milestones.length} 个里程碑，`
    + `最常出现的人是${topPersons[0]?.name || '未知'}。`;

  return {
    totalMemories: memories.length,
    emotionDistribution: emotionDist,
    monthlyActivity,
    topPersons,
    topLocations,
    keywords,
    milestones,
    summaryText,
  };
}

export interface ReviewCandidate {
  memory: RawMemory;
  risk: number;
  score: number;
}

export function getReviewCandidates(memories: RawMemory[], topN: number = 3): ReviewCandidate[] {
  return memories
    .map(m => {
      const risk = computeForgettingRisk(m);
      const value = computeValueScore(m);
      return { memory: m, risk: risk.risk, score: value.score };
    })
    .filter(c => c.risk >= 0.3)
    .sort((a, b) => (b.risk * b.score) - (a.risk * a.score))
    .slice(0, topN);
}

export interface DecayCurvePoint {
  day: number;
  theoretical: number; // Ebbinghaus retention
}

export interface MemoryDecayPoint {
  memory: RawMemory;
  day: number;
  retention: number;
  risk: number;
}

export interface DecayCurveResult {
  theoretical: DecayCurvePoint[];
  actual: MemoryDecayPoint[];
  abyssCount: number; // memories with risk > 0.7
}

export interface DimensionDiff {
  dimension: string;
  label: string;
  from: number;
  to: number;
  direction: '↑' | '↓' | '→';
  delta: number;
}

export function computeDiff(memA: RawMemory, memB: RawMemory): DimensionDiff[] {
  // memA = earlier, memB = later
  const [earlier, later] = memA.dimensions.temporal.timestamp <= memB.dimensions.temporal.timestamp
    ? [memA, memB] : [memB, memA];

  const dims: { key: string; label: string; getValue: (m: RawMemory) => number }[] = [
    { key: 'importance', label: '重要性', getValue: m => m.dimensions.value.importance },
    { key: 'cqi', label: 'CQI', getValue: m => m.dimensions.value.cqi },
    { key: 'intensity', label: '情感强度', getValue: m => m.dimensions.emotional.intensity },
    { key: 'accessCount', label: '访问次数', getValue: m => Math.min(m.dimensions.value.accessCount / 10, 1) },
    { key: 'intimacy', label: '亲密度', getValue: m => m.dimensions.social.intimacy },
  ];

  return dims.map(d => {
    const from = d.getValue(earlier);
    const to = d.getValue(later);
    const delta = to - from;
    return {
      dimension: d.key,
      label: d.label,
      from: Math.round(from * 100) / 100,
      to: Math.round(to * 100) / 100,
      direction: delta > 0.01 ? '↑' : delta < -0.01 ? '↓' : '→',
      delta: Math.round(delta * 100) / 100,
    };
  });
}

export interface DailyEmotionEntry {
  date: string; // YYYY-MM-DD
  primaryEmotion: string;
  count: number;
  summaries: string[];
}

export function computeDailyEmotionMap(memories: RawMemory[], days: number = 90): DailyEmotionEntry[] {
  const now = Date.now();
  const MILLIS_PER_DAY = 86400000;
  const cutoff = now - days * MILLIS_PER_DAY;
  const map = new Map<string, { emotions: Record<string, number>; summaries: string[] }>();

  memories.forEach(m => {
    const ts = m.dimensions.temporal.timestamp;
    if (ts < cutoff) return;
    const d = new Date(ts);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!map.has(key)) map.set(key, { emotions: {}, summaries: [] });
    const entry = map.get(key)!;
    const emo = m.dimensions.emotional.primary;
    entry.emotions[emo] = (entry.emotions[emo] || 0) + 1;
    entry.summaries.push(m.summary);
  });

  return Array.from(map.entries()).map(([date, data]) => {
    const primaryEmotion = Object.entries(data.emotions).sort(([, a], [, b]) => b - a)[0]?.[0] || '中性';
    return { date, primaryEmotion, count: data.summaries.length, summaries: data.summaries.slice(0, 3) };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export function computeDecayCurve(memories: RawMemory[], now: number = Date.now()): DecayCurveResult {
  const maxDays = 90;
  const step = 3;

  // Ebbinghaus forgetting curve: R = e^(-t/S), S = stability based on avg importance
  const avgImportance = memories.length > 0
    ? memories.reduce((s, m) => s + m.dimensions.value.importance, 0) / memories.length
    : 0.5;
  const stability = 5 + avgImportance * 25; // 5-30 days

  const theoretical: DecayCurvePoint[] = [];
  for (let day = 0; day <= maxDays; day += step) {
    const retention = Math.exp(-day / stability);
    theoretical.push({ day, theoretical: Math.round(retention * 1000) / 1000 });
  }

  // Actual memory decay points
  const MILLIS_PER_DAY = 86400000;
  const actual: MemoryDecayPoint[] = [];
  let abyssCount = 0;

  memories.forEach(m => {
    const days = Math.max(0, (now - m.dimensions.temporal.timestamp) / MILLIS_PER_DAY);
    if (days > maxDays) return;

    const { importance, accessCount, cqi } = m.dimensions.value;
    const accessBoost = Math.min(accessCount / 5, 1) * 0.3;
    const cqiBoost = cqi * 0.2;
    const retention = Math.max(0, Math.min(1,
      Math.exp(-days / (stability * (1 + importance))) + accessBoost + cqiBoost
    ));
    const risk = 1 - retention;

    if (risk > 0.7) abyssCount++;
    actual.push({ memory: m, day: Math.round(days), retention: Math.round(retention * 1000) / 1000, risk: Math.round(risk * 1000) / 1000 });
  });

  return { theoretical, actual, abyssCount };
}

export function getDailyMemory(memories: RawMemory[], now: number = Date.now()): DailyMemoryResult | null {
  if (memories.length === 0) return null;

  const today = new Date(now);
  const month = today.getMonth();
  const day = today.getDate();

  // Use date as seed for deterministic daily selection
  const dateSeed = today.getFullYear() * 10000 + (month + 1) * 100 + day;

  // Strategy 1: Find "on this day" memories (same month+day in previous years)
  const anniversaryMems = memories.filter(m => {
    const d = new Date(m.dimensions.temporal.timestamp);
    return d.getMonth() === month && d.getDate() === day && d.getFullYear() !== today.getFullYear();
  });

  if (anniversaryMems.length > 0) {
    // Deterministic pick based on date
    const pick = anniversaryMems[dateSeed % anniversaryMems.length];
    const daysAgo = Math.floor((now - pick.dimensions.temporal.timestamp) / (1000 * 60 * 60 * 24));
    return { memory: pick, reason: 'anniversary', daysAgo };
  }

  // Strategy 2: Same month+day (same year, for completeness)
  const sameDayMems = memories.filter(m => {
    const d = new Date(m.dimensions.temporal.timestamp);
    return d.getMonth() === month && d.getDate() === day;
  });
  if (sameDayMems.length > 0) {
    const pick = sameDayMems[dateSeed % sameDayMems.length];
    const daysAgo = Math.floor((now - pick.dimensions.temporal.timestamp) / (1000 * 60 * 60 * 24));
    return { memory: pick, reason: 'anniversary', daysAgo };
  }

  // Strategy 3: High forgetting risk + high value
  const riskResults = memories
    .map(m => {
      const risk = computeForgettingRisk(m, now);
      const value = computeValueScore(m);
      return { memory: m, risk: risk.risk, score: value.score };
    })
    .filter(r => r.risk >= 0.3)
    .sort((a, b) => (b.risk * b.score) - (a.risk * a.score));

  if (riskResults.length > 0) {
    const pick = riskResults[dateSeed % riskResults.length];
    const daysAgo = Math.floor((now - pick.memory.dimensions.temporal.timestamp) / (1000 * 60 * 60 * 24));
    return { memory: pick.memory, reason: 'forgetting-risk', daysAgo };
  }

  // Fallback: random high-value memory
  const sorted = [...memories].sort((a, b) =>
    computeValueScore(b).score - computeValueScore(a).score
  );
  const pick = sorted[dateSeed % sorted.length];
  const daysAgo = Math.floor((now - pick.dimensions.temporal.timestamp) / (1000 * 60 * 60 * 24));
  return { memory: pick, reason: 'forgetting-risk', daysAgo };
}

// ─── Emotion Curve (Feature #57) ───

export interface EmotionCurvePoint {
  timestamp: number;
  date: string;
  emotion: string;
  intensity: number;
  color: string;
  label: string;
  isMilestone: boolean;
  storyline: string;
  memoryId: string;
}

export interface EmotionCurveData {
  points: EmotionCurvePoint[];
  storylineFilter: string[];
}

export function computeEmotionCurve(memories: RawMemory[]): EmotionCurveData {
  const { EMOTION_COLORS } = require('../types');

  const sorted = [...memories]
    .filter(m => m.dimensions.temporal.timestamp > 0)
    .sort((a, b) => a.dimensions.temporal.timestamp - b.dimensions.temporal.timestamp);

  const storylineSet = new Set<string>();
  const points: EmotionCurvePoint[] = sorted.map(m => {
    const ts = m.dimensions.temporal.timestamp;
    const d = new Date(ts);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const emotion = m.dimensions.emotional.primary;
    const storyline = m.dimensions.narrative.storyline;
    if (storyline) storylineSet.add(storyline);

    return {
      timestamp: ts,
      date: dateStr,
      emotion,
      intensity: m.dimensions.emotional.intensity,
      color: EMOTION_COLORS[emotion] || '#888',
      label: m.label,
      isMilestone: m.dimensions.narrative.isMilestone,
      storyline,
      memoryId: m.id,
    };
  });

  return {
    points,
    storylineFilter: Array.from(storylineSet).sort(),
  };
}

// ─── Surprise Candidate (Feature #58) ───

export function getSurpriseCandidate(memories: RawMemory[]): RawMemory | null {
  if (memories.length === 0) return null;
  const now = Date.now();

  // Score by value × forgetting risk (high value + low access = best surprise)
  const scored = memories.map(m => {
    const value = computeValueScore(m).score;
    const risk = computeForgettingRisk(m, now).risk;
    const accessPenalty = Math.min(m.dimensions.value.accessCount / 5, 1);
    return {
      memory: m,
      score: value * risk * (1 - accessPenalty * 0.5),
    };
  });

  // Weighted random: higher score = higher chance
  const totalScore = scored.reduce((sum, s) => sum + s.score, 0);
  if (totalScore === 0) return memories[Math.floor(Math.random() * memories.length)];

  let r = Math.random() * totalScore;
  for (const s of scored) {
    r -= s.score;
    if (r <= 0) return s.memory;
  }
  return scored[scored.length - 1].memory;
}

// ─── Weekly Report (Feature #59) ───

export interface WeeklyReportData {
  thisWeekCount: number;
  lastWeekCount: number;
  emotionDistribution: Record<string, number>;
  happiestMemory: RawMemory | null;
  noteworthyMemory: RawMemory | null;
  emotionTrend: 'up' | 'down' | 'stable';
  emotionTrendPercent: number;
}

export function computeWeeklyReport(memories: RawMemory[]): WeeklyReportData {
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const weekStart = now - oneWeek;
  const twoWeekStart = now - 2 * oneWeek;

  const thisWeek = memories.filter(m => m.dimensions.temporal.timestamp >= weekStart);
  const lastWeek = memories.filter(m =>
    m.dimensions.temporal.timestamp >= twoWeekStart && m.dimensions.temporal.timestamp < weekStart
  );

  // Emotion distribution this week
  const emotionDist: Record<string, number> = {};
  for (const m of thisWeek) {
    const e = m.dimensions.emotional.primary;
    emotionDist[e] = (emotionDist[e] || 0) + 1;
  }

  // Happiest memory this week
  const happiest = thisWeek.length > 0
    ? thisWeek.reduce((best, m) =>
        (m.dimensions.emotional.primary === '快乐' && m.dimensions.emotional.intensity > (best?.dimensions.emotional.intensity || 0))
          ? m : best, null as RawMemory | null)
    : null;

  // Noteworthy: highest importance this week
  const noteworthy = thisWeek.length > 0
    ? thisWeek.reduce((best, m) =>
        m.dimensions.value.importance > (best?.dimensions.value.importance || 0) ? m : best, thisWeek[0])
    : null;

  // Emotion trend: compare positive emotions ratio
  const positiveEmotions = new Set(['快乐', '好奇', '骄傲', '感激']);
  const thisWeekPositive = thisWeek.filter(m => positiveEmotions.has(m.dimensions.emotional.primary)).length;
  const lastWeekPositive = lastWeek.filter(m => positiveEmotions.has(m.dimensions.emotional.primary)).length;
  const thisRatio = thisWeek.length > 0 ? thisWeekPositive / thisWeek.length : 0;
  const lastRatio = lastWeek.length > 0 ? lastWeekPositive / lastWeek.length : 0;
  const diff = thisRatio - lastRatio;

  let emotionTrend: 'up' | 'down' | 'stable' = 'stable';
  let emotionTrendPercent = 0;
  if (Math.abs(diff) > 0.05) {
    emotionTrend = diff > 0 ? 'up' : 'down';
    emotionTrendPercent = Math.round(Math.abs(diff) * 100);
  }

  return {
    thisWeekCount: thisWeek.length,
    lastWeekCount: lastWeek.length,
    emotionDistribution: emotionDist,
    happiestMemory: happiest,
    noteworthyMemory: noteworthy,
    emotionTrend,
    emotionTrendPercent,
  };
}