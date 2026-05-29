import type { RawMemory } from '../types';
import { EMOTION_COLORS } from '../types';

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

export function generateSocialGraph(memories: RawMemory[]): SocialGraphData {
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
    ? `你的社交宇宙中有 ${nodes.length} 个重要人物。${topPerson.name} 出现最频繁（${topPerson.count} 次），你们在一起时最常的情绪是${topPerson.dominantEmotion}。`
    : `你的记忆中还没有出现过人物。`;

  return { nodes, edges, summaryText };
}
