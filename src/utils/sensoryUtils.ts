import type { RawMemory } from '../types';

export interface SensoryKeyword {
  word: string;
  count: number;
}

export interface SensoryProfile {
  keywords: SensoryKeyword[];
  totalWithSensory: number;
  totalMemories: number;
  topKeyword: string;
  summaryText: string;
}

const SENSORY_WORDS = [
  '笑声', '哭声', '歌声', '音乐', '风声', '雨声', '鸟鸣',
  '花香', '饭菜香', '泥土', '青草', '海风',
  '温暖', '冰凉', '柔软', '粗糙', '光滑',
  '明亮', '黑暗', '闪烁', '绚丽', '柔和',
  '甜蜜', '苦涩', '酸', '辣', '咸',
  '微风', '阳光', '星空', '月亮', '彩虹',
];

export function extractSensoryKeywords(text: string): string[] {
  return SENSORY_WORDS.filter(word => text.includes(word));
}

export function computeSensoryProfile(memories: RawMemory[]): SensoryProfile {
  const keywordCounts = new Map<string, number>();
  let totalWithSensory = 0;

  memories.forEach(m => {
    const text = m.summary + ' ' + m.label;
    const keywords = extractSensoryKeywords(text);
    const hasSensory = keywords.length > 0 || m.dimensions.sensory.images.length > 0;

    if (hasSensory) totalWithSensory++;

    keywords.forEach(kw => {
      keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1);
    });
  });

  const keywords: SensoryKeyword[] = [...keywordCounts.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([word, count]) => ({ word, count }));

  const topKeyword = keywords[0]?.word || '无';
  const summaryText = totalWithSensory > 0
    ? `在 ${memories.length} 条记忆中，${totalWithSensory} 条有感官记录。最常出现的感官词是"${topKeyword}"。`
    : '记忆中还没有感官记录。';

  return {
    keywords,
    totalWithSensory,
    totalMemories: memories.length,
    topKeyword,
    summaryText,
  };
}
