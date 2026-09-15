import type { RawMemory } from '../types';
import type { Language } from '../i18n';
import { memoryLabelT } from '../i18n/memoryData';

export type TimeRange = '周' | '月' | '季';

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

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
  investKey: string;
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
        // 基于 activity.type 枚举判断；activity.detail 已本地化，不可用于中文子串匹配
        if (['绘画', '创作', '手工', '艺术'].includes(d.activity.type)) count++;
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

function predictionFromTrend(trend: 'up' | 'down' | 'stable', value: number, t: TranslateFn): { prediction: 'up' | 'down' | 'warn'; predictionLabel: string } {
  if (trend === 'up' || (trend === 'stable' && value >= 50)) return { prediction: 'up', predictionLabel: t('memoryBank.prediction.maintain') };
  if (value < 30) return { prediction: 'warn', predictionLabel: t('memoryBank.prediction.warning') };
  return { prediction: 'down', predictionLabel: t('memoryBank.prediction.decline') };
}

function actionForDimension(dimId: string, value: number, t: TranslateFn): string {
  const low = value < 30;
  const mid = value >= 30 && value < 60;
  const high = value >= 60;

  if (dimId === 'happiness') return low ? t('memoryBank.action.happiness.low') : mid ? t('memoryBank.action.happiness.mid') : t('memoryBank.action.happiness.high');
  if (dimId === 'social') return low ? t('memoryBank.action.social.low') : mid ? t('memoryBank.action.social.mid') : t('memoryBank.action.social.high');
  if (dimId === 'creativity') return low ? t('memoryBank.action.creativity.low') : mid ? t('memoryBank.action.creativity.mid') : t('memoryBank.action.creativity.high');
  if (dimId === 'logic') return low ? t('memoryBank.action.logic.low') : mid ? t('memoryBank.action.logic.mid') : t('memoryBank.action.logic.high');
  if (dimId === 'outdoor') return low ? t('memoryBank.action.outdoor.low') : mid ? t('memoryBank.action.outdoor.mid') : t('memoryBank.action.outdoor.high');
  return low ? t('memoryBank.action.default.low') : mid ? t('memoryBank.action.default.mid') : t('memoryBank.action.default.high');
}

const DIM_DEFS = [
  { id: 'happiness', emoji: '😊', labelKey: 'dim.happiness' },
  { id: 'logic', emoji: '🧠', labelKey: 'dim.logic' },
  { id: 'social', emoji: '👫', labelKey: 'dim.social' },
  { id: 'outdoor', emoji: '🏃', labelKey: 'dim.outdoor' },
  { id: 'creativity', emoji: '🎨', labelKey: 'dim.creativity' },
];

export function computeDimensionData(memories: RawMemory[], range: TimeRange, t: TranslateFn, now: number = Date.now()): DimensionItem[] {
  const current = filterByTimeRange(memories, range, now);
  const prev = filterPrevPeriod(memories, range, now);

  return DIM_DEFS.map(def => {
    const value = computeDimensionValue(current, def.id);
    const prevValue = computeDimensionValue(prev, def.id);
    const { trend, trendPct } = trendFromValues(value, prevValue);
    const { prediction, predictionLabel } = predictionFromTrend(trend, value, t);

    return {
      id: def.id,
      emoji: def.emoji,
      label: t(def.labelKey),
      value,
      trend,
      trendPct,
      prediction,
      predictionLabel,
      actionLabel: actionForDimension(def.id, value, t),
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

export function computeTemperament(memories: RawMemory[], t: TranslateFn, lang: Language = 'zh-CN'): TemperamentResult {
  if (memories.length === 0) {
    return {
      type: t('memoryBank.temperament.unknown'),
      label: t('memoryBank.temperament.insufficient'),
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
    { emoji: '🟡', name: t('memoryBank.temperament.emotionalDrive'), pct: emotionalPct },
    { emoji: '🟣', name: t('memoryBank.temperament.securityDependence'), pct: securityPct },
    { emoji: '🔵', name: t('memoryBank.temperament.creativityDrive'), pct: creativePct },
  ].sort((a, b) => b.pct - a.pct);

  const dominantTrait = traits[0];
  const typeMap: Record<string, string> = {
    [t('memoryBank.temperament.emotionalDrive')]: t('memoryBank.temperament.orpheus'),
    [t('memoryBank.temperament.securityDependence')]: t('memoryBank.temperament.janus'),
    [t('memoryBank.temperament.creativityDrive')]: t('memoryBank.temperament.prometheus'),
  };
  const labelMap: Record<string, string> = {
    [t('memoryBank.temperament.emotionalDrive')]: t('memoryBank.temperament.emotionalLearner'),
    [t('memoryBank.temperament.securityDependence')]: t('memoryBank.temperament.securityExplorer'),
    [t('memoryBank.temperament.creativityDrive')]: t('memoryBank.temperament.creativityThinker'),
  };

  const sorted = [...memories].sort((a, b) => b.dimensions.value.importance - a.dimensions.value.importance);
  const representativeMems = sorted.slice(0, 3).map(m => {
    const ts = m.dimensions.temporal.timestamp;
    const date = new Date(ts).toLocaleDateString(t('memoryBank.dateLocale'), { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');
    const positiveEmotions2 = ['快乐', '好奇', '骄傲', '感激'];
    const type = positiveEmotions2.includes(m.dimensions.emotional.primary) ? t('memoryBank.positiveAssets') : t('memoryBank.toImprove');
    const emoji = m.dimensions.activity.type === '绘画' || m.dimensions.activity.type === '创作' ? '🎨'
      : m.dimensions.social.persons.length > 1 ? '🤗'
      : m.dimensions.semantic.knowledge.length > 0 ? '📖'
      : '🧠';
    return { emoji, label: memoryLabelT(lang, m.id, m.label), date, type };
  });

  return {
    type: typeMap[dominantTrait.name] || t('memoryBank.temperament.comprehensive'),
    label: labelMap[dominantTrait.name] || t('memoryBank.temperament.diversified'),
    confidence: Math.round(dominantTrait.pct),
    traits,
    representativeMems,
  };
}

export function computeDimensionRates(memories: RawMemory[], range: TimeRange, t: TranslateFn, now: number = Date.now()): RateItem[] {
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
      name: t(def.labelKey),
      rate,
      change: changeStr,
      up: diff >= 0,
      risk,
    };
  }).sort((a, b) => b.rate - a.rate).map((item, i) => ({ ...item, rank: i + 1 }));
}

export function computeMemoryTypePotential(memories: RawMemory[], t: TranslateFn): PotentialItem[] {
  if (memories.length === 0) return [];

  const categories = [
    { labelKey: 'memoryBank.potential.familyInteraction', icon: '👨‍👧', filter: (m: RawMemory) => m.dimensions.social.persons.some(p => p.includes('爸') || p.includes('妈') || p.includes('父') || p.includes('母')) },
    { labelKey: 'memoryBank.potential.learningGrowth', icon: '📚', filter: (m: RawMemory) => m.dimensions.activity.type === '学习' || m.dimensions.semantic.knowledge.length > 0 },
    { labelKey: 'memoryBank.potential.socialEmotional', icon: '💬', filter: (m: RawMemory) => m.dimensions.social.persons.length >= 2 },
    { labelKey: 'memoryBank.potential.outdoorExploration', icon: '🌲', filter: (m: RawMemory) => m.dimensions.spatial.placeType === '公园' || m.dimensions.spatial.placeType === '游乐场' },
    { labelKey: 'memoryBank.potential.dailyHabits', icon: '🏠', filter: (m: RawMemory) => m.dimensions.spatial.placeType === '家' },
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
    const investKey = stars >= 4 ? '高' : stars >= 3 ? '中' : '低';
    const investTKey = stars >= 4 ? 'memoryBank.investHigh' : stars >= 3 ? 'memoryBank.investMedium' : 'memoryBank.investLow';
    const investLabel = t(investTKey);
    const suggestionKey = stars >= 4 ? 'memoryBank.potential.suggestion.high' : stars >= 3 ? 'memoryBank.potential.suggestion.medium' : 'memoryBank.potential.suggestion.low';

    return {
      rank: 0,
      label: t(cat.labelKey),
      icon: cat.icon,
      stars,
      invest: investLabel,
      investKey,
      suggestion: t(suggestionKey),
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
    investKey: r.investKey,
    suggestion: r.suggestion,
  }));
}

// ─── Persona Evolution (Feature #61) ───

export interface PersonaRadarData {
  emotionalRichness: number;
  socialDensity: number;
  knowledgeDepth: number;
  narrativeCoherence: number;
  reviewFrequency: number;
}

export interface PersonaEvolutionData {
  current: PersonaRadarData;
  previous: PersonaRadarData;
  currentType: string;
  previousType: string;
  evolutionDescription: string;
  suggestions: string[];
}

function computeRadarForMemories(memories: RawMemory[]): PersonaRadarData {
  if (memories.length === 0) {
    return { emotionalRichness: 0, socialDensity: 0, knowledgeDepth: 0, narrativeCoherence: 0, reviewFrequency: 0 };
  }

  // Emotional richness: unique emotions / total
  const emotions = new Set(memories.map(m => m.dimensions.emotional.primary));
  const emotionalRichness = Math.min(emotions.size / 8, 1);

  // Social density: memories with persons / total
  const withPersons = memories.filter(m => m.dimensions.social.persons.length > 0).length;
  const socialDensity = withPersons / memories.length;

  // Knowledge depth: memories with knowledge / total
  const withKnowledge = memories.filter(m => m.dimensions.semantic.knowledge.length > 0).length;
  const knowledgeDepth = withKnowledge / memories.length;

  // Narrative coherence: memories with storyline / total
  const withStoryline = memories.filter(m => m.dimensions.narrative.storyline).length;
  const narrativeCoherence = withStoryline / memories.length;

  // Review frequency: average accessCount normalized
  const avgAccess = memories.reduce((sum, m) => sum + m.dimensions.value.accessCount, 0) / memories.length;
  const reviewFrequency = Math.min(avgAccess / 5, 1);

  return {
    emotionalRichness: Math.round(emotionalRichness * 100) / 100,
    socialDensity: Math.round(socialDensity * 100) / 100,
    knowledgeDepth: Math.round(knowledgeDepth * 100) / 100,
    narrativeCoherence: Math.round(narrativeCoherence * 100) / 100,
    reviewFrequency: Math.round(reviewFrequency * 100) / 100,
  };
}

function classifyPersona(radar: PersonaRadarData, t: TranslateFn): string {
  const { emotionalRichness, socialDensity, knowledgeDepth, narrativeCoherence, reviewFrequency } = radar;
  const max = Math.max(emotionalRichness, socialDensity, knowledgeDepth, narrativeCoherence, reviewFrequency);
  if (max === 0) return t('memoryBank.persona.recorder');
  if (emotionalRichness === max) return t('memoryBank.persona.emotionalDriver');
  if (socialDensity === max) return t('memoryBank.persona.connector');
  if (knowledgeDepth === max) return t('memoryBank.persona.explorer');
  if (narrativeCoherence === max) return t('memoryBank.persona.narrator');
  if (reviewFrequency === max) return t('memoryBank.persona.guardian');
  return t('memoryBank.persona.recorder');
}

export function computePersonaEvolution(memories: RawMemory[], t: TranslateFn): PersonaEvolutionData {
  const now = Date.now();
  const threeMonths = 90 * 24 * 60 * 60 * 1000;
  const recentMemories = memories.filter(m => now - m.dimensions.temporal.timestamp < threeMonths);
  const olderMemories = memories.filter(m => now - m.dimensions.temporal.timestamp >= threeMonths);

  const current = computeRadarForMemories(recentMemories.length > 0 ? recentMemories : memories);
  const previous = computeRadarForMemories(olderMemories.length > 0 ? olderMemories : memories);

  const currentType = classifyPersona(current, t);
  const previousType = classifyPersona(previous, t);

  const personaTypeMap: Record<string, string> = {
    [t('memoryBank.persona.emotionalDriver')]: 'memoryBank.persona.emotionalDriver',
    [t('memoryBank.persona.connector')]: 'memoryBank.persona.connector',
    [t('memoryBank.persona.explorer')]: 'memoryBank.persona.explorer',
    [t('memoryBank.persona.narrator')]: 'memoryBank.persona.narrator',
    [t('memoryBank.persona.guardian')]: 'memoryBank.persona.guardian',
    [t('memoryBank.persona.recorder')]: 'memoryBank.persona.recorder',
  };

  const prevKey = personaTypeMap[previousType];
  const currKey = personaTypeMap[currentType];

  const EVOLUTION_KEYS: Record<string, Record<string, string>> = {
    'memoryBank.persona.emotionalDriver': {
      'memoryBank.persona.connector': 'memoryBank.evolution.toConnector',
      'memoryBank.persona.explorer': 'memoryBank.evolution.toExplorer',
      'memoryBank.persona.narrator': 'memoryBank.evolution.toNarrator',
      'memoryBank.persona.guardian': 'memoryBank.evolution.toGuardian',
    },
    'memoryBank.persona.connector': {
      'memoryBank.persona.emotionalDriver': 'memoryBank.evolution.toEmotionalDriver',
      'memoryBank.persona.explorer': 'memoryBank.evolution.toExplorerFromConnector',
      'memoryBank.persona.narrator': 'memoryBank.evolution.toNarratorFromConnector',
    },
    'memoryBank.persona.explorer': {
      'memoryBank.persona.emotionalDriver': 'memoryBank.evolution.toEmotionalDriverFromExplorer',
      'memoryBank.persona.connector': 'memoryBank.evolution.toConnectorFromExplorer',
      'memoryBank.persona.guardian': 'memoryBank.evolution.toGuardianFromExplorer',
    },
  };

  let evolutionDescription = '';
  if (currentType !== previousType) {
    const evoKey = prevKey && currKey ? EVOLUTION_KEYS[prevKey]?.[currKey] : undefined;
    evolutionDescription = evoKey ? t(evoKey) : t('memoryBank.evolution.currentSame', { type: currentType });
  } else {
    evolutionDescription = t('memoryBank.evolution.currentSame', { type: currentType });
  }

  const SUGGESTION_KEYS: Record<string, string[]> = {
    'memoryBank.persona.emotionalDriver': ['memoryBank.suggestion.emotionalDetail', 'memoryBank.suggestion.emotionalTrend'],
    'memoryBank.persona.connector': ['memoryBank.suggestion.socialRecord', 'memoryBank.suggestion.storylineConnect'],
    'memoryBank.persona.explorer': ['memoryBank.suggestion.learningNotes', 'memoryBank.suggestion.newDomain'],
    'memoryBank.persona.narrator': ['memoryBank.suggestion前后引用', 'memoryBank.suggestion.storylineComplete'],
    'memoryBank.persona.guardian': ['memoryBank.suggestion.regularReview', 'memoryBank.suggestion.reinforceReminder'],
    'memoryBank.persona.recorder': ['memoryBank.suggestion.multiDimension', 'memoryBank.suggestion.variety'],
  };

  const suggestionKeys = SUGGESTION_KEYS[currKey || 'memoryBank.persona.recorder'] || SUGGESTION_KEYS['memoryBank.persona.recorder'];

  return {
    current,
    previous,
    currentType,
    previousType,
    evolutionDescription,
    suggestions: suggestionKeys.map(k => t(k)),
  };
}
