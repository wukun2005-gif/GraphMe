import type { RawMemory, InsightMemory } from '../types';
import type { Language } from '../i18n';
import { contentT } from '../i18n/dataTranslations';
import { insightStatementT } from '../i18n/memoryData';

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

function prefT(lang: Language, key: string, params?: Record<string, string | number>): string {
  const T: Record<string, { zh: string; en: string }> = {
    inferredFrom: { zh: '基于 {{count}} 条记忆推断', en: 'Inferred from {{count}} memories' },
    extractedFrom: { zh: '从 {{count}} 条记忆中提取', en: 'Extracted from {{count}} memories' },
  };
  const tpl = T[key];
  if (!tpl) return key;
  const raw = lang === 'en' ? tpl.en : tpl.zh;
  if (!params) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in params ? String(params[k]) : `{{${k}}}`));
}

export function buildPreferenceTrees(
  rawMemories: RawMemory[],
  insightMemories: InsightMemory[],
  lang: Language = 'zh-CN',
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
    const statement = insightStatementT(lang, insight.id, insight.statement);
    const domain = statement.slice(0, 15);
    const node: PreferenceNode = {
      id: insight.id,
      label: statement,
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
          label: `${contentT(lang, key)}: ${contentT(lang, value)}`,
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
      description: prefT(lang, 'inferredFrom', { count: insight.sourceRawMemoryIds.length }),
    });
  });

  // If no insight preferences, build from explicit ones
  if (trees.length === 0) {
    explicitPrefs.forEach((data, key) => {
      const root: PreferenceNode = {
        id: `root-${key}`,
        label: contentT(lang, key),
        timestamp: rawMemories[0]?.dimensions.temporal.timestamp || Date.now(),
        confidence: 0.8,
        memoryIds: data.memoryIds,
        children: data.values.map(value => ({
          id: `pref-${key}-${value}`,
          label: contentT(lang, value),
          timestamp: rawMemories[0]?.dimensions.temporal.timestamp || Date.now(),
          confidence: 0.8,
          memoryIds: data.memoryIds,
          children: [],
        })),
      };
      trees.push({
        domain: contentT(lang, key),
        root,
        description: prefT(lang, 'extractedFrom', { count: data.memoryIds.length }),
      });
    });
  }

  return trees;
}