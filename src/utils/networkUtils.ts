import type { InsightMemory } from '../types';
import { CATEGORY_LABELS } from '../types';

// ========== Types ==========

export interface NetworkNode {
  id: string;
  label: string;
  x: number;
  y: number;
  category: InsightMemory['category'];
  confidence: number;
  importance: number;
  version: number;
  deprecated: boolean;
  statement: string;
}

export interface NetworkEdge {
  from: string;
  to: string;
  weight: number;
  type: 'supporting' | 'related' | 'causal';
}

export interface NetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  islands: { category: InsightMemory['category']; label: string; cx: number; cy: number }[];
}

// ========== Force-Directed Layout ==========

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function generateNetworkData(insights: InsightMemory[]): NetworkData {
  const width = 1000;
  const height = 700;
  const rand = seededRandom(42);

  // Group by category
  const categories: InsightMemory['category'][] = ['trend', 'belief', 'relationship', 'preference', 'habit', 'growth'];
  const categoryGroups = new Map<InsightMemory['category'], InsightMemory[]>();
  for (const cat of categories) {
    categoryGroups.set(cat, []);
  }
  for (const ins of insights) {
    const group = categoryGroups.get(ins.category);
    if (group) group.push(ins);
  }

  // Island positions (6 categories arranged in a circle)
  const islandRadius = 220;
  const islands = categories.map((cat, i) => {
    const angle = (i / categories.length) * Math.PI * 2 - Math.PI / 2;
    return {
      category: cat,
      label: CATEGORY_LABELS[cat],
      cx: width / 2 + Math.cos(angle) * islandRadius,
      cy: height / 2 + Math.sin(angle) * islandRadius,
    };
  });

  // Place nodes within their island
  const nodes: NetworkNode[] = [];
  for (const island of islands) {
    const group = categoryGroups.get(island.category) || [];
    group.forEach((ins, j) => {
      const angle = (j / Math.max(group.length, 1)) * Math.PI * 2;
      const radius = 40 + rand() * 30;
      nodes.push({
        id: ins.id,
        label: ins.statement.slice(0, 12),
        x: island.cx + Math.cos(angle) * radius,
        y: island.cy + Math.sin(angle) * radius,
        category: ins.category,
        confidence: ins.confidence,
        importance: ins.confidence, // Use confidence as importance proxy
        version: ins.version,
        deprecated: !!ins.deprecatedAt,
        statement: ins.statement,
      });
    });
  }

  // Generate edges based on shared source memories
  const edges: NetworkEdge[] = [];
  const activeNodes = nodes.filter(n => !n.deprecated);
  for (let i = 0; i < activeNodes.length; i++) {
    for (let j = i + 1; j < activeNodes.length; j++) {
      const a = insights.find(ins => ins.id === activeNodes[i].id);
      const b = insights.find(ins => ins.id === activeNodes[j].id);
      if (!a || !b) continue;

      const sharedSources = a.sourceRawMemoryIds.filter(id => b.sourceRawMemoryIds.includes(id));
      if (sharedSources.length >= 1) {
        let type: NetworkEdge['type'] = 'related';
        if (a.category === b.category) type = 'supporting';
        if (sharedSources.length >= 3) type = 'causal';

        edges.push({
          from: activeNodes[i].id,
          to: activeNodes[j].id,
          weight: Math.min(1, sharedSources.length / 5),
          type,
        });
      }
    }
  }

  return { nodes, edges, islands };
}
