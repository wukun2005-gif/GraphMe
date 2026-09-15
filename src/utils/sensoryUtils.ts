import type { RawMemory } from '../types';
import type { Language } from '../i18n';

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

/**
 * 感官关键词的英文显示映射。
 * SENSORY_WORDS 是中文词表（用于在中文原文里匹配），提取结果默认是中文，
 * 英文模式显示时必须经过本映射，否则「黑暗」「温暖」等会以中文露出。
 */
const SENSORY_WORD_EN: Record<string, string> = {
  '笑声': 'Laughter', '哭声': 'Crying', '歌声': 'Singing', '音乐': 'Music',
  '风声': 'Wind', '雨声': 'Rain', '鸟鸣': 'Birdsong',
  '花香': 'Floral scent', '饭菜香': 'Aroma of food', '泥土': 'Earth',
  '青草': 'Fresh grass', '海风': 'Sea breeze',
  '温暖': 'Warmth', '冰凉': 'Coolness', '柔软': 'Softness',
  '粗糙': 'Roughness', '光滑': 'Smoothness',
  '明亮': 'Bright light', '黑暗': 'Darkness', '闪烁': 'Twinkling',
  '绚丽': 'Brilliant colors', '柔和': 'Soft glow',
  '甜蜜': 'Sweetness', '苦涩': 'Bitterness', '酸': 'Sour', '辣': 'Spicy', '咸': 'Salty',
  '微风': 'Gentle breeze', '阳光': 'Sunshine', '星空': 'Starry sky',
  '月亮': 'Moon', '彩虹': 'Rainbow',
};

export function sensoryWordT(lang: Language, word: string): string {
  if (lang !== 'en') return word;
  return SENSORY_WORD_EN[word] ?? word;
}

const SENSORY_SUMMARY: Record<string, { zh: string; en: string }> = {
  withData: { zh: '在 {{total}} 条记忆中，{{count}} 条有感官记录。最常出现的感官词是"{{keyword}}"。', en: 'Of {{total}} memories, {{count}} have sensory records. The most frequent sensory word is "{{keyword}}".' },
  noData: { zh: '记忆中还没有感官记录。', en: 'No sensory records in memories yet.' },
};

export function sensoryT(lang: Language, key: string, params?: Record<string, string | number>): string {
  const template = SENSORY_SUMMARY[key];
  if (!template) return key;
  const raw = lang === 'en' ? template.en : template.zh;
  if (!params) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (_, k) => k in params ? String(params[k]) : `{{${k}}}`);
}

export function computeSensoryProfile(memories: RawMemory[], lang: Language = 'zh-CN'): SensoryProfile {
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

  const topKeyword = keywords[0]?.word || (lang === 'en' ? 'none' : '无');
  const summaryText = totalWithSensory > 0
    ? sensoryT(lang, 'withData', { total: memories.length, count: totalWithSensory, keyword: topKeyword })
    : sensoryT(lang, 'noData');

  return {
    keywords,
    totalWithSensory,
    totalMemories: memories.length,
    topKeyword,
    summaryText,
  };
}
