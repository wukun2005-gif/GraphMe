import type { RawMemory, InsightMemory } from '../types';

export interface TraceStep {
  step: number;
  description: string;
  memoryIds: string[];
  metric?: string;
}

export function generateTraceSteps(
  insight: InsightMemory,
  rawMemories: RawMemory[]
): TraceStep[] {
  const sourceMems = insight.sourceRawMemoryIds
    .map(id => rawMemories.find(m => m.id === id))
    .filter(Boolean) as RawMemory[];

  if (sourceMems.length === 0) return [];

  const steps: TraceStep[] = [];

  // Step 1: Total memories analyzed
  steps.push({
    step: 1,
    description: `我分析了你全部 ${rawMemories.length} 条记忆，从中找到了 ${sourceMems.length} 条相关记忆`,
    memoryIds: sourceMems.map(m => m.id),
  });

  // Step 2: Emotion analysis
  const emotionCounts: Record<string, number> = {};
  sourceMems.forEach(m => {
    const e = m.dimensions.emotional.primary;
    emotionCounts[e] = (emotionCounts[e] || 0) + 1;
  });
  const topEmotion = Object.entries(emotionCounts).sort(([, a], [, b]) => b - a)[0];
  if (topEmotion) {
    const pct = Math.round(topEmotion[1] / sourceMems.length * 100);
    steps.push({
      step: 2,
      description: `这 ${sourceMems.length} 条记忆中，有 ${topEmotion[1]} 条（${pct}%）的情绪是"${topEmotion[0]}"`,
      memoryIds: sourceMems.filter(m => m.dimensions.emotional.primary === topEmotion[0]).map(m => m.id),
      metric: `${pct}% ${topEmotion[0]}`,
    });
  }

  // Step 3: Person analysis
  const personCounts: Record<string, number> = {};
  sourceMems.forEach(m => {
    m.dimensions.social.persons.forEach(p => {
      personCounts[p] = (personCounts[p] || 0) + 1;
    });
  });
  const topPerson = Object.entries(personCounts).sort(([, a], [, b]) => b - a)[0];
  if (topPerson && topPerson[1] >= 2) {
    const pct = Math.round(topPerson[1] / sourceMems.length * 100);
    steps.push({
      step: 3,
      description: `其中 ${topPerson[1]} 条（${pct}%）的人物包含"${topPerson[0]}"`,
      memoryIds: sourceMems.filter(m => m.dimensions.social.persons.includes(topPerson[0])).map(m => m.id),
      metric: `${pct}% 含${topPerson[0]}`,
    });
  }

  // Step 4: Intensity comparison
  const avgIntensity = sourceMems.reduce((s, m) => s + m.dimensions.emotional.intensity, 0) / sourceMems.length;
  const allAvgIntensity = rawMemories.reduce((s, m) => s + m.dimensions.emotional.intensity, 0) / rawMemories.length;
  if (Math.abs(avgIntensity - allAvgIntensity) > 0.05) {
    const direction = avgIntensity > allAvgIntensity ? '高于' : '低于';
    steps.push({
      step: steps.length + 1,
      description: `这些记忆的平均情绪强度为 ${avgIntensity.toFixed(2)}，${direction}全体均值 ${allAvgIntensity.toFixed(2)}`,
      memoryIds: [],
      metric: `强度 ${avgIntensity.toFixed(2)}`,
    });
  }

  // Final step: Conclusion
  steps.push({
    step: steps.length + 1,
    description: `结论：${insight.statement}`,
    memoryIds: sourceMems.map(m => m.id),
    metric: `置信度 ${Math.round(insight.confidence * 100)}%`,
  });

  return steps;
}
