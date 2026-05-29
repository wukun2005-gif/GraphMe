import type { RawMemory, InsightMemory } from '../types';
import { EMOTION_COLORS } from '../types';

// ========== Types ==========

export interface LetterSegment {
  text: string;
  type: 'text' | 'memory-link';
  memoryId?: string;
  memoryLabel?: string;
}

export interface GeneratedLetter {
  segments: LetterSegment[];
  greeting: string;
  closing: string;
  memoryCount: number;
  insightCount: number;
}

// ========== Helpers ==========

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getTopEmotion(memories: RawMemory[]): string {
  const counts: Record<string, number> = {};
  for (const m of memories) {
    const e = m.dimensions.emotional.primary;
    counts[e] = (counts[e] || 0) + 1;
  }
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || '中性';
}

function getOldestMemory(memories: RawMemory[]): RawMemory | undefined {
  return [...memories].sort((a, b) => a.dimensions.temporal.timestamp - b.dimensions.temporal.timestamp)[0];
}

function getNewestMemory(memories: RawMemory[]): RawMemory | undefined {
  return [...memories].sort((a, b) => b.dimensions.temporal.timestamp - a.dimensions.temporal.timestamp)[0];
}

function getTopPersons(memories: RawMemory[]): string[] {
  const counts: Record<string, number> = {};
  for (const m of memories) {
    for (const p of m.dimensions.social.persons) {
      counts[p] = (counts[p] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name]) => name);
}

function getTopPlaces(memories: RawMemory[]): string[] {
  const counts: Record<string, number> = {};
  for (const m of memories) {
    const p = m.dimensions.spatial.placeType;
    counts[p] = (counts[p] || 0) + 1;
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([name]) => name);
}

function getHighImportanceMemories(memories: RawMemory[], count: number = 3): RawMemory[] {
  return [...memories]
    .sort((a, b) => b.dimensions.value.importance - a.dimensions.value.importance)
    .slice(0, count);
}

function getMilestoneMemories(memories: RawMemory[]): RawMemory[] {
  return memories.filter(m => m.dimensions.narrative.isMilestone);
}

function getMilestoneLabel(memory: RawMemory): string {
  return memory.label;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function daysBetween(ts1: number, ts2: number): number {
  return Math.abs(Math.round((ts2 - ts1) / (1000 * 60 * 60 * 24)));
}

// ========== Letter Generator ==========

export function generateLetter(
  rawMemories: RawMemory[],
  insightMemories: InsightMemory[]
): GeneratedLetter {
  const segments: LetterSegment[] = [];

  const topEmotion = getTopEmotion(rawMemories);
  const oldest = getOldestMemory(rawMemories);
  const newest = getNewestMemory(rawMemories);
  const topPersons = getTopPersons(rawMemories);
  const topPlaces = getTopPlaces(rawMemories);
  const milestones = getMilestoneMemories(rawMemories);
  const highImportance = getHighImportanceMemories(rawMemories);

  // Greeting
  const greeting = randomPick([
    '亲爱的朋友，',
    '你好呀，',
    '见字如面，',
    '好久不见，',
  ]);

  // --- Opening ---
  const openingTemplates = [
    `我翻看了你留下的 ${rawMemories.length} 条记忆，`,
    `在你的记忆星云中漫步了许久，`,
    `从你 ${rawMemories.length} 条记忆里，`,
  ];
  segments.push({ text: randomPick(openingTemplates), type: 'text' });

  // --- Time span ---
  if (oldest && newest) {
    const days = daysBetween(oldest.dimensions.temporal.timestamp, newest.dimensions.temporal.timestamp);
    segments.push({
      text: `我看到了跨越 ${days} 天的时光——从`,
      type: 'text',
    });
    segments.push({
      text: `${formatDate(oldest.dimensions.temporal.timestamp)}的"${oldest.label}"`,
      type: 'memory-link',
      memoryId: oldest.id,
      memoryLabel: oldest.label,
    });
    segments.push({
      text: `到`,
      type: 'text',
    });
    segments.push({
      text: `${formatDate(newest.dimensions.temporal.timestamp)}的"${newest.label}"`,
      type: 'memory-link',
      memoryId: newest.id,
      memoryLabel: newest.label,
    });
    segments.push({ text: '。', type: 'text' });
  }

  // --- Top emotion ---
  const emotionColor = EMOTION_COLORS[topEmotion as keyof typeof EMOTION_COLORS] || '#888';
  segments.push({
    text: `在这些记忆中，"${topEmotion}"是最常出现的情感色调。`,
    type: 'text',
  });

  // --- Persons ---
  if (topPersons.length > 0) {
    segments.push({
      text: `我注意到，${topPersons.join('、')}是你记忆中最频繁出现的名字。`,
      type: 'text',
    });
  }

  // --- Places ---
  if (topPlaces.length > 0) {
    segments.push({
      text: `你最常在${topPlaces.join('和')}留下足迹。`,
      type: 'text',
    });
  }

  // --- High importance memories ---
  if (highImportance.length > 0) {
    segments.push({ text: '\n有些记忆，你反复回望：\n', type: 'text' });
    for (const m of highImportance) {
      segments.push({
        text: `· "${m.label}"——它在你心中的重要性高达 ${Math.round(m.dimensions.value.importance * 100)}%`,
        type: 'memory-link',
        memoryId: m.id,
        memoryLabel: m.label,
      });
    }
  }

  // --- Milestones ---
  if (milestones.length > 0) {
    segments.push({ text: '\n', type: 'text' });
    segments.push({
      text: `你有 ${milestones.length} 个里程碑时刻：`,
      type: 'text',
    });
    milestones.slice(0, 3).forEach((m, i) => {
      if (i > 0) segments.push({ text: '、', type: 'text' });
      segments.push({
        text: m.label,
        type: 'memory-link',
        memoryId: m.id,
        memoryLabel: m.label,
      });
    });
    segments.push({ text: '。', type: 'text' });
  }

  // --- Changes over time ---
  if (oldest && newest && oldest.id !== newest.id) {
    const oldEmotion = oldest.dimensions.emotional.primary;
    const newEmotion = newest.dimensions.emotional.primary;
    if (oldEmotion !== newEmotion) {
      segments.push({
        text: `从最早记忆的"${oldEmotion}"到最近记忆的"${newEmotion}"，你的内心世界在悄然变化。`,
        type: 'text',
      });
    }
  }

  // --- Insights ---
  if (insightMemories.length > 0) {
    const activeInsights = insightMemories.filter(i => i.deprecatedAt == null);
    const highConfInsights = activeInsights.filter(i => i.confidence >= 0.7);
    if (highConfInsights.length > 0) {
      segments.push({ text: '\n', type: 'text' });
      segments.push({
        text: `从你的记忆中，我发现了 ${activeInsights.length} 个模式。其中 ${highConfInsights.length} 个，我有很高的把握：`,
        type: 'text',
      });
      for (const insight of highConfInsights.slice(0, 3)) {
        segments.push({
          text: `· ${insight.statement}`,
          type: 'text',
        });
      }
    }
  }

  // --- Forgotten memories ---
  const now = Date.now();
  const forgottenMemories = rawMemories.filter(m => {
    const days = (now - m.dimensions.temporal.timestamp) / (1000 * 60 * 60 * 24);
    return days > 60 && m.dimensions.value.accessCount <= 1;
  });
  if (forgottenMemories.length > 0) {
    const forgotten = randomPick(forgottenMemories);
    segments.push({ text: '\n', type: 'text' });
    segments.push({
      text: `有一条记忆，可能已经被你遗忘很久了——"${forgotten.label}"。它发生在${formatDate(forgotten.dimensions.temporal.timestamp)}，也许值得你重新回望。`,
      type: 'memory-link',
      memoryId: forgotten.id,
      memoryLabel: forgotten.label,
    });
  }

  // Closing
  const closing = randomPick([
    '愿你的记忆星云，永远闪亮。',
    '你的每一段记忆，都值得被珍藏。',
    '记住过去的美好，拥抱未来的可能。',
    '在记忆的宇宙中，你是最亮的那颗星。',
  ]);

  return {
    segments,
    greeting,
    closing,
    memoryCount: rawMemories.length,
    insightCount: insightMemories.length,
  };
}
