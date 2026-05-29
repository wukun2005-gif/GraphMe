import type { RawMemory, InsightMemory } from '../types';

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

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function getEmotionLabel(emotion: string): string {
  const map: Record<string, string> = {
    '快乐': '开心快乐的时刻',
    '悲伤': '需要安慰的时刻',
    '好奇': '充满好奇的探索',
    '骄傲': '值得骄傲的成就',
    '感激': '心怀感激的瞬间',
    '愤怒': '需要理解的情绪',
    '沮丧': '遇到挫折的时候',
    '惊讶': '出乎意料的发现',
    '恐惧': '需要勇气的时刻',
    '厌恶': '不喜欢的事物',
    '思念': '远方的牵挂',
    '中性': '平静的日常',
  };
  return map[emotion] || emotion;
}

// ========== Main ==========

export function generateUserProfile(
  rawMemories: RawMemory[],
  insightMemories: InsightMemory[]
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
    description: i.statement,
    frequency: i.confidence > 0.8 ? '高频' : i.confidence > 0.5 ? '中频' : '低频',
    confidence: i.confidence,
    memoryIds: i.sourceRawMemoryIds,
  }));

  // Preferences from insights + raw memories
  const prefInsights = insightMemories.filter(i => i.category === 'preference' && !i.deprecatedAt);
  const preferences: ProfilePreference[] = prefInsights.map(i => ({
    label: i.statement,
    type: 'implicit' as const,
    source: `基于 ${i.sourceRawMemoryIds.length} 条记忆推断`,
  }));

  // Add explicit preferences from raw memories
  rawMemories.forEach(m => {
    Object.entries(m.dimensions.semantic.preferences).forEach(([key, value]) => {
      if (!preferences.some(p => p.label.includes(value))) {
        preferences.push({ label: `${key}：${value}`, type: 'explicit', source: m.id });
      }
    });
  });

  // Growth from insights
  const growthInsights = insightMemories.filter(i => i.category === 'growth' && !i.deprecatedAt);
  const growth: ProfileGrowth[] = growthInsights.map(i => ({
    area: i.statement,
    trend: i.version > 1 ? 'up' as const : 'stable' as const,
    description: i.description || i.statement,
    memoryIds: i.sourceRawMemoryIds || [],
  }));

  // Summary text
  const summaryText = `关于你，小哥记住了 ${rawMemories.length} 件事、${persons.length} 个人、${habits.length} 个习惯。最常见的情绪是${topEmotion}，最常出没的地方是${topPlace}。`;

  return {
    totalMemories: rawMemories.length,
    totalPersons: persons.length,
    totalHabits: habits.length,
    timeSpanDays,
    oldestDate: formatDate(oldest),
    newestDate: formatDate(newest),
    topEmotion,
    topPlace,
    persons,
    habits,
    preferences,
    growth,
    summaryText,
  };
}
