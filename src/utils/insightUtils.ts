import type { RawMemory, InsightMemory } from '../types';
import type { Language } from '../i18n';
import { emotionNameT, contentT } from '../i18n/dataTranslations';

export interface TraceStep {
  step: number;
  description: string;
  memoryIds: string[];
  metric?: string;
}

const INSIGHT_TRACE: Record<string, { zh: string; en: string }> = {
  step1: { zh: '我分析了你全部 {{total}} 条记忆，从中找到了 {{found}} 条相关记忆', en: 'I analyzed all {{total}} of your memories and found {{found}} relevant ones' },
  step2: { zh: '这 {{count}} 条记忆中，有 {{emotionCount}} 条（{{pct}}%）的情绪是"{{emotion}}"', en: 'Of these {{count}} memories, {{emotionCount}} ({{pct}}%) have the emotion "{{emotion}}"' },
  step3: { zh: '其中 {{personCount}} 条（{{pct}}%）的人物包含"{{person}}"', en: 'Of those, {{personCount}} ({{pct}}%) include "{{person}}"' },
  step4Higher: { zh: '这些记忆的平均情绪强度为 {{avg}}，高于全体均值 {{allAvg}}', en: 'The average emotion intensity of these memories is {{avg}}, higher than the overall average of {{allAvg}}' },
  step4Lower: { zh: '这些记忆的平均情绪强度为 {{avg}}，低于全体均值 {{allAvg}}', en: 'The average emotion intensity of these memories is {{avg}}, lower than the overall average of {{allAvg}}' },
  conclusion: { zh: '结论：{{statement}}', en: 'Conclusion: {{statement}}' },
  confidence: { zh: '置信度 {{pct}}%', en: 'Confidence {{pct}}%' },
  contains: { zh: '含{{person}}', en: 'contains {{person}}' },
  intensity: { zh: '强度 {{avg}}', en: 'Intensity {{avg}}' },
};

export function insightTraceT(lang: Language, key: string, params?: Record<string, string | number>): string {
  const template = INSIGHT_TRACE[key];
  if (!template) return key;
  const raw = lang === 'en' ? template.en : template.zh;
  if (!params) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (_, k) => k in params ? String(params[k]) : `{{${k}}}`);
}

export function generateTraceSteps(
  insight: InsightMemory,
  rawMemories: RawMemory[],
  lang: Language = 'zh-CN',
): TraceStep[] {
  const sourceMems = insight.sourceRawMemoryIds
    .map(id => rawMemories.find(m => m.id === id))
    .filter(Boolean) as RawMemory[];

  if (sourceMems.length === 0) return [];

  const steps: TraceStep[] = [];

  // Step 1: Total memories analyzed
  steps.push({
    step: 1,
    description: insightTraceT(lang, 'step1', { total: rawMemories.length, found: sourceMems.length }),
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
    const topEmotionName = emotionNameT(lang, topEmotion[0]);
    steps.push({
      step: 2,
      description: insightTraceT(lang, 'step2', { count: sourceMems.length, emotionCount: topEmotion[1], pct, emotion: topEmotionName }),
      memoryIds: sourceMems.filter(m => m.dimensions.emotional.primary === topEmotion[0]).map(m => m.id),
      metric: `${pct}% ${topEmotionName}`,
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
    const topPersonName = contentT(lang, topPerson[0]);
    steps.push({
      step: 3,
      description: insightTraceT(lang, 'step3', { personCount: topPerson[1], pct, person: topPersonName }),
      memoryIds: sourceMems.filter(m => m.dimensions.social.persons.includes(topPerson[0])).map(m => m.id),
      metric: `${pct}% ${insightTraceT(lang, 'contains', { person: topPersonName })}`,
    });
  }

  // Step 4: Intensity comparison
  const avgIntensity = sourceMems.reduce((s, m) => s + m.dimensions.emotional.intensity, 0) / sourceMems.length;
  const allAvgIntensity = rawMemories.reduce((s, m) => s + m.dimensions.emotional.intensity, 0) / rawMemories.length;
  if (Math.abs(avgIntensity - allAvgIntensity) > 0.05) {
    const direction = avgIntensity > allAvgIntensity ? 'step4Higher' : 'step4Lower';
    steps.push({
      step: steps.length + 1,
      description: insightTraceT(lang, direction, { avg: avgIntensity.toFixed(2), allAvg: allAvgIntensity.toFixed(2) }),
      memoryIds: [],
      metric: insightTraceT(lang, 'intensity', { avg: avgIntensity.toFixed(2) }),
    });
  }

  // Final step: Conclusion
  steps.push({
    step: steps.length + 1,
    description: insightTraceT(lang, 'conclusion', { statement: insight.statement }),
    memoryIds: sourceMems.map(m => m.id),
    metric: insightTraceT(lang, 'confidence', { pct: Math.round(insight.confidence * 100) }),
  });

  return steps;
}
