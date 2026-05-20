import type { RawMemory } from '../types';

export interface ValueScoreResult {
  memory: RawMemory;
  score: number;
  breakdown: {
    importance: number;
    cqi: number;
    emotionalIntensity: number;
    accessCount: number;
  };
}

export interface ForgettingRiskResult {
  memory: RawMemory;
  risk: number;
  level: 'low' | 'medium' | 'high';
  daysSinceCreation: number;
}

export function computeValueScore(memory: RawMemory): ValueScoreResult {
  const { value, emotional } = memory.dimensions;
  const importance = value.importance * 40;
  const cqi = value.cqi * 30;
  const emotionalIntensity = emotional.intensity * 20;
  const accessCount = Math.min(value.accessCount / 10, 1) * 10;

  return {
    memory,
    score: Math.round((importance + cqi + emotionalIntensity + accessCount) * 10) / 10,
    breakdown: {
      importance: Math.round(importance * 10) / 10,
      cqi: Math.round(cqi * 10) / 10,
      emotionalIntensity: Math.round(emotionalIntensity * 10) / 10,
      accessCount: Math.round(accessCount * 10) / 10,
    },
  };
}

export function computeForgettingRisk(memory: RawMemory, now: number = Date.now()): ForgettingRiskResult {
  const { timestamp } = memory.dimensions.temporal;
  const { importance } = memory.dimensions.value;
  const daysSinceCreation = Math.max(0, (now - timestamp) / (1000 * 60 * 60 * 24));
  const decayFactor = Math.min(daysSinceCreation / 30, 1.0);
  const risk = decayFactor * (1 - importance);

  let level: 'low' | 'medium' | 'high';
  if (risk < 0.2) level = 'low';
  else if (risk < 0.5) level = 'medium';
  else level = 'high';

  return {
    memory,
    risk: Math.round(risk * 1000) / 1000,
    level,
    daysSinceCreation: Math.round(daysSinceCreation * 10) / 10,
  };
}

export function getTop5HighValue(memories: RawMemory[]): ValueScoreResult[] {
  return memories
    .map(computeValueScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

export function getForgettingRiskWarnings(memories: RawMemory[], topN: number = 3): ForgettingRiskResult[] {
  return memories
    .map(m => computeForgettingRisk(m))
    .filter(r => r.level === 'high' || r.level === 'medium')
    .sort((a, b) => b.risk - a.risk)
    .slice(0, topN);
}