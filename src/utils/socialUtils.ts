import type { RawMemory } from '../types';
import type { Language } from '../i18n';
import { EMOTION_COLORS } from '../types';
import { emotionNameT } from '../i18n/dataTranslations';

export interface SocialNode {
  name: string;
  count: number;
  avgIntimacy: number;
  dominantEmotion: string;
  emotionColor: string;
  memoryIds: string[];
}

export interface SocialEdge {
  from: string;
  to: string;
  coOccurrence: number;
}

export interface SocialGraphData {
  nodes: SocialNode[];
  edges: SocialEdge[];
  summaryText: string;
}

const SOCIAL_SUMMARY: Record<string, { zh: string; en: string }> = {
  withData: { zh: '你的社交宇宙中有 {{count}} 个重要人物。{{name}} 出现最频繁（{{freq}} 次），你们在一起时最常的情绪是{{emotion}}。', en: 'Your social universe has {{count}} important people. {{name}} appears most frequently ({{freq}} times), and the most common emotion when you are together is {{emotion}}.' },
  noData: { zh: '你的记忆中还没有出现过人物。', en: 'No people have appeared in your memories yet.' },
};

export function socialT(lang: Language, key: string, params?: Record<string, string | number>): string {
  const template = SOCIAL_SUMMARY[key];
  if (!template) return key;
  const raw = lang === 'en' ? template.en : template.zh;
  if (!params) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (_, k) => k in params ? String(params[k]) : `{{${k}}}`);
}

export function generateSocialGraph(memories: RawMemory[], lang: Language = 'zh-CN'): SocialGraphData {
  const personMap = new Map<string, { count: number; intimacySum: number; emotions: Record<string, number>; ids: string[] }>();

  // Co-occurrence matrix
  const coOccurrence = new Map<string, number>();

  memories.forEach(m => {
    const persons = m.dimensions.social.persons;
    persons.forEach(p => {
      if (!personMap.has(p)) personMap.set(p, { count: 0, intimacySum: 0, emotions: {}, ids: [] });
      const entry = personMap.get(p)!;
      entry.count++;
      entry.intimacySum += m.dimensions.social.intimacy;
      const e = m.dimensions.emotional.primary;
      entry.emotions[e] = (entry.emotions[e] || 0) + 1;
      entry.ids.push(m.id);
    });

    // Count co-occurrences
    for (let i = 0; i < persons.length; i++) {
      for (let j = i + 1; j < persons.length; j++) {
        const key = [persons[i], persons[j]].sort().join('|||');
        coOccurrence.set(key, (coOccurrence.get(key) || 0) + 1);
      }
    }
  });

  const nodes: SocialNode[] = [...personMap.entries()]
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .map(([name, data]) => {
      const dominant = Object.entries(data.emotions).sort(([, a], [, b]) => b - a)[0];
      return {
        name,
        count: data.count,
        avgIntimacy: Math.round(data.intimacySum / data.count * 100) / 100,
        dominantEmotion: dominant?.[0] || '中性',
        emotionColor: EMOTION_COLORS[(dominant?.[0] || '中性') as keyof typeof EMOTION_COLORS] || '#888',
        memoryIds: data.ids,
      };
    });

  const nodeNames = new Set(nodes.map(n => n.name));
  const edges: SocialEdge[] = [];
  coOccurrence.forEach((count, key) => {
    const [from, to] = key.split('|||');
    if (nodeNames.has(from) && nodeNames.has(to) && count >= 2) {
      edges.push({ from, to, coOccurrence: count });
    }
  });

  const topPerson = nodes[0];
  const summaryText = topPerson
    ? socialT(lang, 'withData', { count: nodes.length, name: topPerson.name, freq: topPerson.count, emotion: emotionNameT(lang, topPerson.dominantEmotion) })
    : socialT(lang, 'noData');

  return { nodes, edges, summaryText };
}
