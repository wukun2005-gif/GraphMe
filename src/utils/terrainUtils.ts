import type { RawMemory, InsightMemory } from '../types';
import { EMOTION_COLORS } from '../types';

// ========== Types ==========

export interface TerrainNode {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  type: 'concept' | 'person' | 'insight-ruin';
  memoryCount: number;
  color: string;
  opacity: number;
  memories: RawMemory[];
}

export interface TerrainConnection {
  from: string;
  to: string;
  strength: number;
  type: 'river' | 'bridge';
}

export interface ClimateZone {
  x: number;
  y: number;
  radius: number;
  emotion: string;
  color: string;
  intensity: number;
}

export interface FogZone {
  x: number;
  y: number;
  radius: number;
  opacity: number;
}

export interface TerrainData {
  nodes: TerrainNode[];
  connections: TerrainConnection[];
  climateZones: ClimateZone[];
  fogZones: FogZone[];
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

// ========== Helpers ==========

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function getMainEmotion(memories: RawMemory[]): { emotion: string; color: string; intensity: number } {
  const counts: Record<string, number> = {};
  let totalIntensity = 0;
  for (const m of memories) {
    const e = m.dimensions.emotional.primary;
    counts[e] = (counts[e] || 0) + 1;
    totalIntensity += m.dimensions.emotional.intensity;
  }
  const entries = Object.entries(counts).sort(([, a], [, b]) => b - a);
  const emotion = entries[0]?.[0] || '中性';
  return {
    emotion,
    color: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] || '#888',
    intensity: memories.length > 0 ? totalIntensity / memories.length : 0.5,
  };
}

// ========== Terrain Generation ==========

export function generateTerrain(
  rawMemories: RawMemory[],
  insightMemories: InsightMemory[]
): TerrainData {
  const width = 1200;
  const height = 900;
  const centerX = width / 2;
  const centerY = height / 2;
  const rand = seededRandom(42);

  const nodes: TerrainNode[] = [];
  const connections: TerrainConnection[] = [];
  const climateZones: ClimateZone[] = [];
  const fogZones: FogZone[] = [];

  // --- 1. Concept Mountains (聚类高频主题) ---
  const conceptMap = new Map<string, RawMemory[]>();
  for (const m of rawMemories) {
    // Group by activity type + knowledge keywords
    const key = m.dimensions.activity.type;
    if (!conceptMap.has(key)) conceptMap.set(key, []);
    conceptMap.get(key)!.push(m);
    // Also group by knowledge
    for (const k of m.dimensions.semantic.knowledge) {
      const kKey = k;
      if (!conceptMap.has(kKey)) conceptMap.set(kKey, []);
      conceptMap.get(kKey)!.push(m);
    }
  }

  // Pick top concepts
  const conceptEntries = [...conceptMap.entries()]
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 6);

  const conceptAngles = conceptEntries.map((_, i) => (i / conceptEntries.length) * Math.PI * 2 - Math.PI / 2);
  conceptEntries.forEach(([label, mems], i) => {
    const angle = conceptAngles[i];
    const dist = 200 + rand() * 80;
    const x = centerX + Math.cos(angle) * dist;
    const y = centerY + Math.sin(angle) * dist;
    const mainEm = getMainEmotion(mems);

    nodes.push({
      id: `concept-${i}`,
      label: label.length > 6 ? label.slice(0, 6) : label,
      x,
      y,
      radius: Math.max(30, Math.min(60, 20 + mems.length * 8)),
      type: 'concept',
      memoryCount: mems.length,
      color: mainEm.color,
      opacity: 0.8,
      memories: mems,
    });
  });

  // --- 2. Person Islands (人物岛屿) ---
  const personMap = new Map<string, RawMemory[]>();
  for (const m of rawMemories) {
    for (const p of m.dimensions.social.persons) {
      if (!personMap.has(p)) personMap.set(p, []);
      personMap.get(p)!.push(m);
    }
  }

  const personEntries = [...personMap.entries()]
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 5);

  const personAngles = personEntries.map((_, i) => (i / personEntries.length) * Math.PI * 2);
  personEntries.forEach(([name, mems], i) => {
    const angle = personAngles[i];
    const dist = 120 + rand() * 60;
    const x = centerX + Math.cos(angle) * dist;
    const y = centerY + Math.sin(angle) * dist;
    const mainEm = getMainEmotion(mems);

    nodes.push({
      id: `person-${i}`,
      label: name.length > 4 ? name.slice(0, 4) : name,
      x,
      y,
      radius: Math.max(22, Math.min(45, 15 + mems.length * 5)),
      type: 'person',
      memoryCount: mems.length,
      color: mainEm.color,
      opacity: 0.7,
      memories: mems,
    });
  });

  // --- 3. Insight Ruins (洞察遗址 — deprecated insights) ---
  const deprecatedInsights = insightMemories.filter(i => i.deprecatedAt != null);
  const activeInsights = insightMemories.filter(i => i.deprecatedAt == null);

  deprecatedInsights.forEach((insight, i) => {
    const angle = (i / Math.max(deprecatedInsights.length, 1)) * Math.PI * 2 + Math.PI / 4;
    const dist = 280 + rand() * 60;
    const x = centerX + Math.cos(angle) * dist;
    const y = centerY + Math.sin(angle) * dist;

    nodes.push({
      id: `ruin-${i}`,
      label: insight.statement.slice(0, 8),
      x,
      y,
      radius: 20,
      type: 'insight-ruin',
      memoryCount: 0,
      color: '#666',
      opacity: 0.4,
      memories: [],
    });
  });

  // --- 4. Connections (知识河流) ---
  // Connect concept nodes that share memories
  const conceptNodes = nodes.filter(n => n.type === 'concept');
  for (let i = 0; i < conceptNodes.length; i++) {
    for (let j = i + 1; j < conceptNodes.length; j++) {
      const memA = new Set(conceptNodes[i].memories.map(m => m.id));
      const shared = conceptNodes[j].memories.filter(m => memA.has(m.id)).length;
      if (shared > 0) {
        connections.push({
          from: conceptNodes[i].id,
          to: conceptNodes[j].id,
          strength: Math.min(1, shared / 3),
          type: 'river',
        });
      }
    }
  }

  // Connect person nodes to concept nodes
  const personNodes = nodes.filter(n => n.type === 'person');
  for (const p of personNodes) {
    for (const c of conceptNodes) {
      const memA = new Set(p.memories.map(m => m.id));
      const shared = c.memories.filter(m => memA.has(m.id)).length;
      if (shared > 0) {
        connections.push({
          from: p.id,
          to: c.id,
          strength: Math.min(1, shared / 2),
          type: 'bridge',
        });
      }
    }
  }

  // --- 5. Climate Zones (情感气候带) ---
  const emotionClusters = new Map<string, RawMemory[]>();
  for (const m of rawMemories) {
    const e = m.dimensions.emotional.primary;
    if (!emotionClusters.has(e)) emotionClusters.set(e, []);
    emotionClusters.get(e)!.push(m);
  }

  let ci = 0;
  for (const [emotion, mems] of emotionClusters) {
    if (mems.length < 2) continue;
    const avgIntensity = mems.reduce((s, m) => s + m.dimensions.emotional.intensity, 0) / mems.length;
    const angle = (ci / emotionClusters.size) * Math.PI * 2;
    const dist = 300 + rand() * 100;
    climateZones.push({
      x: centerX + Math.cos(angle) * dist,
      y: centerY + Math.sin(angle) * dist,
      radius: 60 + mems.length * 10,
      emotion,
      color: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] || '#888',
      intensity: avgIntensity,
    });
    ci++;
  }

  // --- 6. Fog Zones (未探索迷雾区 — low confidence areas) ---
  const lowConfInsights = activeInsights.filter(i => i.confidence < 0.6);
  lowConfInsights.forEach((insight, i) => {
    const angle = (i / Math.max(lowConfInsights.length, 1)) * Math.PI * 2 + Math.PI / 6;
    const dist = 350 + rand() * 80;
    fogZones.push({
      x: centerX + Math.cos(angle) * dist,
      y: centerY + Math.sin(angle) * dist,
      radius: 50 + (1 - insight.confidence) * 40,
      opacity: 0.3 + (1 - insight.confidence) * 0.2,
    });
  });

  return {
    nodes,
    connections,
    climateZones,
    fogZones,
    centerX,
    centerY,
    width,
    height,
  };
}

// ========== Zoom Levels ==========

export interface ZoomLevel {
  id: string;
  label: string;
  cx: number;
  cy: number;
  scale: number;
}

export function getZoomLevels(terrain: TerrainData): ZoomLevel[] {
  const levels: ZoomLevel[] = [
    { id: 'overview', label: '全景', cx: terrain.centerX, cy: terrain.centerY, scale: 1 },
  ];

  for (const node of terrain.nodes) {
    if (node.type === 'concept' || node.type === 'person') {
      levels.push({
        id: node.id,
        label: node.label,
        cx: node.x,
        cy: node.y,
        scale: 2.5,
      });
    }
  }

  return levels;
}
