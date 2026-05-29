import type { RawMemory, InsightMemory } from '../types';

export interface PreferenceNode {
  id: string;
  label: string;
  timestamp: number;
  confidence: number;
  memoryIds: string[];
  children: PreferenceNode[];
}

export interface PreferenceTree {
  domain: string;
  root: PreferenceNode;
  description: string;
}

export function buildPreferenceTrees(
  rawMemories: RawMemory[],
  insightMemories: InsightMemory[]
): PreferenceTree[] {
  const trees: PreferenceTree[] = [];

  // Extract preferences from insights
  const prefInsights = insightMemories
    .filter(i => i.category === 'preference' && !i.deprecatedAt)
    .sort((a, b) => a.generatedAt - b.generatedAt);

  // Extract explicit preferences from raw memories
  const explicitPrefs = new Map<string, { values: string[]; memoryIds: string[] }>();
  rawMemories.forEach(m => {
    Object.entries(m.dimensions.semantic.preferences).forEach(([key, value]) => {
      if (!explicitPrefs.has(key)) explicitPrefs.set(key, { values: [], memoryIds: [] });
      const entry = explicitPrefs.get(key)!;
      if (!entry.values.includes(value)) entry.values.push(value);
      entry.memoryIds.push(m.id);
    });
  });

  // Build trees from insight preferences
  prefInsights.forEach(insight => {
    const domain = insight.statement.slice(0, 15);
    const node: PreferenceNode = {
      id: insight.id,
      label: insight.statement,
      timestamp: insight.generatedAt,
      confidence: insight.confidence,
      memoryIds: insight.sourceRawMemoryIds,
      children: [],
    };

    // Find related explicit preferences
    const relatedExplicit = [...explicitPrefs.entries()].find(([, data]) =>
      data.memoryIds.some(id => insight.sourceRawMemoryIds.includes(id))
    );

    if (relatedExplicit) {
      const [key, data] = relatedExplicit;
      data.values.forEach(value => {
        node.children.push({
          id: `explicit-${key}-${value}`,
          label: `${key}：${value}`,
          timestamp: insight.generatedAt,
          confidence: 1,
          memoryIds: data.memoryIds,
          children: [],
        });
      });
    }

    trees.push({
      domain,
      root: node,
      description: `基于 ${insight.sourceRawMemoryIds.length} 条记忆推断`,
    });
  });

  // If no insight preferences, build from explicit ones
  if (trees.length === 0) {
    explicitPrefs.forEach((data, key) => {
      const root: PreferenceNode = {
        id: `root-${key}`,
        label: key,
        timestamp: rawMemories[0]?.dimensions.temporal.timestamp || Date.now(),
        confidence: 0.8,
        memoryIds: data.memoryIds,
        children: data.values.map(value => ({
          id: `pref-${key}-${value}`,
          label: value,
          timestamp: rawMemories[0]?.dimensions.temporal.timestamp || Date.now(),
          confidence: 0.8,
          memoryIds: data.memoryIds,
          children: [],
        })),
      };
      trees.push({
        domain: key,
        root,
        description: `从 ${data.memoryIds.length} 条记忆中提取`,
      });
    });
  }

  return trees;
}
