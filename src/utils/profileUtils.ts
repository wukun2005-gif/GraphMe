import type { RawMemory, InsightMemory } from '../types';
import type { Language } from '../i18n';
import { emotionNameT, contentT } from '../i18n/dataTranslations';
import { insightStatementT, insightDescriptionT } from '../i18n/memoryData';

// ========== Types ==========

export interface ProfilePerson {
  name: string;
  count: number;
  avgIntimacy: number;
  dominantEmotion: string;
  memoryIds: string[];
}

export interface ProfileHabit {
  description: string;
  frequency: string;
  confidence: number;
  memoryIds: string[];
}

export interface ProfilePreference {
  label: string;
  type: 'explicit' | 'implicit';
  source: string;
}

export interface ProfileGrowth {
  area: string;
  trend: 'up' | 'stable' | 'down';
  description: string;
  memoryIds: string[];
}

export interface UserProfileData {
  totalMemories: number;
  totalPersons: number;
  totalHabits: number;
  timeSpanDays: number;
  oldestDate: string;
  newestDate: string;
  topEmotion: string;
  topPlace: string;
  persons: ProfilePerson[];
  habits: ProfileHabit[];
  preferences: ProfilePreference[];
  growth: ProfileGrowth[];
  summaryText: string;
}

// ========== Helpers ==========

const PROFILE_EMOTION_LABELS: Record<string, { zh: string; en: string }> = {
  '快乐': { zh: '开心快乐的时刻', en: 'Moments of happiness' },
  '悲伤': { zh: '需要安慰的时刻', en: 'Moments needing comfort' },
  '好奇': { zh: '充满好奇的探索', en: 'Explorations full of curiosity' },
  '骄傲': { zh: '值得骄傲的成就', en: 'Achievements to be proud of' },
  '感激': { zh: '心怀感激的瞬间', en: 'Moments of gratitude' },
  '愤怒': { zh: '需要理解的情绪', en: 'Emotions needing understanding' },
  '沮丧': { zh: '遇到挫折的时候', en: 'Times of setback' },
  '惊讶': { zh: '出乎意料的发现', en: 'Unexpected discoveries' },
  '恐惧': { zh: '需要勇气的时刻', en: 'Moments needing courage' },
  '厌恶': { zh: '不喜欢的事物', en: 'Things disliked' },
  '思念': { zh: '远方的牵挂', en: 'Longing for faraway' },
  '中性': { zh: '平静的日常', en: 'Peaceful everyday' },
};

function formatDate(ts: number, lang: Language = 'zh-CN'): string {
  const d = new Date(ts);
  if (lang === 'en') {
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  }
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function getEmotionLabel(emotion: string, lang: Language = 'zh-CN'): string {
  const labels = PROFILE_EMOTION_LABELS[emotion];
  if (!labels) return emotion;
  return lang === 'en' ? labels.en : labels.zh;
}

const PROFILE_SUMMARY: Record<string, { zh: string; en: string }> = {
  summary: { zh: '关于你，小哥记住了 {{memories}} 件事、{{persons}} 个人、{{habits}} 个习惯。最常见的情绪是{{emotion}}，最常出没的地方是{{place}}。', en: 'About you, Xiaoge remembers {{memories}} things, {{persons}} people, and {{habits}} habits. The most common emotion is {{emotion}}, and the most frequent place is {{place}}.' },
  highFreq: { zh: '高频', en: 'High' },
  midFreq: { zh: '中频', en: 'Medium' },
  lowFreq: { zh: '低频', en: 'Low' },
  inferredFrom: { zh: '基于 {{count}} 条记忆推断', en: 'Inferred from {{count}} memories' },
};

export function profileT(lang: Language, key: string, params?: Record<string, string | number>): string {
  const template = PROFILE_SUMMARY[key];
  if (!template) return key;
  const raw = lang === 'en' ? template.en : template.zh;
  if (!params) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (_, k) => k in params ? String(params[k]) : `{{${k}}}`);
}

// ========== Main ==========

export function generateUserProfile(
  rawMemories: RawMemory[],
  insightMemories: InsightMemory[],
  lang: Language = 'zh-CN',
): UserProfileData {
  const now = Date.now();

  // Time span
  const timestamps = rawMemories.map(m => m.dimensions.temporal.timestamp);
  const oldest = Math.min(...timestamps);
  const newest = Math.max(...timestamps);
  const timeSpanDays = Math.round((newest - oldest) / (1000 * 60 * 60 * 24));

  // Top emotion
  const emotionCounts: Record<string, number> = {};
  rawMemories.forEach(m => {
    const e = m.dimensions.emotional.primary;
    emotionCounts[e] = (emotionCounts[e] || 0) + 1;
  });
  const topEmotion = Object.entries(emotionCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || '中性';

  // Top place
  const placeCounts: Record<string, number> = {};
  rawMemories.forEach(m => {
    const p = m.dimensions.spatial.placeType;
    placeCounts[p] = (placeCounts[p] || 0) + 1;
  });
  const topPlace = Object.entries(placeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || '其他';

  // Persons
  const personMap = new Map<string, { count: number; intimacySum: number; emotions: Record<string, number>; ids: string[] }>();
  rawMemories.forEach(m => {
    m.dimensions.social.persons.forEach(p => {
      if (!personMap.has(p)) personMap.set(p, { count: 0, intimacySum: 0, emotions: {}, ids: [] });
      const entry = personMap.get(p)!;
      entry.count++;
      entry.intimacySum += m.dimensions.social.intimacy;
      const e = m.dimensions.emotional.primary;
      entry.emotions[e] = (entry.emotions[e] || 0) + 1;
      entry.ids.push(m.id);
    });
  });
  const persons: ProfilePerson[] = [...personMap.entries()]
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 8)
    .map(([name, data]) => ({
      name,
      count: data.count,
      avgIntimacy: Math.round(data.intimacySum / data.count * 100) / 100,
      dominantEmotion: Object.entries(data.emotions).sort(([, a], [, b]) => b - a)[0]?.[0] || '中性',
      memoryIds: data.ids,
    }));

  // Habits from insights
  const habitInsights = insightMemories.filter(i => i.category === 'habit' && !i.deprecatedAt);
  const habits: ProfileHabit[] = habitInsights.map(i => ({
    description: insightStatementT(lang, i.id, i.statement),
    frequency: i.confidence > 0.8 ? profileT(lang, 'highFreq') : i.confidence > 0.5 ? profileT(lang, 'midFreq') : profileT(lang, 'lowFreq'),
    confidence: i.confidence,
    memoryIds: i.sourceRawMemoryIds,
  }));

  // Preferences from insights + raw memories
  const prefInsights = insightMemories.filter(i => i.category === 'preference' && !i.deprecatedAt);
  const preferences: ProfilePreference[] = prefInsights.map(i => ({
    label: insightStatementT(lang, i.id, i.statement),
    type: 'implicit' as const,
    source: profileT(lang, 'inferredFrom', { count: i.sourceRawMemoryIds.length }),
  }));

  // Add explicit preferences from raw memories
  rawMemories.forEach(m => {
    Object.entries(m.dimensions.semantic.preferences).forEach(([key, value]) => {
      if (!preferences.some(p => p.label.includes(value))) {
        preferences.push({ label: `${contentT(lang, key)}: ${contentT(lang, value)}`, type: 'explicit', source: m.id });
      }
    });
  });

  // Growth from insights
  const growthInsights = insightMemories.filter(i => i.category === 'growth' && !i.deprecatedAt);
  const growth: ProfileGrowth[] = growthInsights.map(i => ({
    area: insightStatementT(lang, i.id, i.statement),
    trend: i.version > 1 ? 'up' as const : 'stable' as const,
    description: insightDescriptionT(lang, i.id, i.description || i.statement),
    memoryIds: i.sourceRawMemoryIds || [],
  }));

  // Summary text
  const summaryText = profileT(lang, 'summary', { memories: rawMemories.length, persons: persons.length, habits: habits.length, emotion: emotionNameT(lang, topEmotion), place: contentT(lang, topPlace) });

  return {
    totalMemories: rawMemories.length,
    totalPersons: persons.length,
    totalHabits: habits.length,
    timeSpanDays,
    oldestDate: formatDate(oldest, lang),
    newestDate: formatDate(newest, lang),
    topEmotion,
    topPlace,
    persons,
    habits,
    preferences,
    growth,
    summaryText,
  };
}
