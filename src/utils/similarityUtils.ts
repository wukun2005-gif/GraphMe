import type { RawMemory } from '../types';

export interface SimilarMemory {
  memory: RawMemory;
  score: number;
  reasons: string[];
}

export function findSimilarMemories(
  target: RawMemory,
  allMemories: RawMemory[],
  limit = 5,
): SimilarMemory[] {
  const candidates = allMemories.filter(m => m.id !== target.id);

  const scored = candidates.map(candidate => {
    let score = 0;
    const reasons: string[] = [];

    // Same persons
    const sharedPersons = target.dimensions.social.persons.filter(p =>
      candidate.dimensions.social.persons.includes(p),
    );
    if (sharedPersons.length > 0) {
      score += sharedPersons.length * 20;
      reasons.push(`和${sharedPersons.join('、')}在一起`);
    }

    // Same placeType
    if (target.dimensions.spatial.placeType === candidate.dimensions.spatial.placeType) {
      score += 15;
      reasons.push(`同在${target.dimensions.spatial.placeType}`);
    }

    // Same emotion
    if (target.dimensions.emotional.primary === candidate.dimensions.emotional.primary) {
      score += 10;
      reasons.push(`同为${target.dimensions.emotional.primary}`);
    }

    // Similar emotion intensity (within 0.2)
    const intensityDiff = Math.abs(
      target.dimensions.emotional.intensity - candidate.dimensions.emotional.intensity,
    );
    if (intensityDiff < 0.2) {
      score += 5;
    }

    // Same storyline
    if (
      target.dimensions.narrative.storyline &&
      target.dimensions.narrative.storyline === candidate.dimensions.narrative.storyline
    ) {
      score += 25;
      reasons.push(`同故事线"${target.dimensions.narrative.storyline}"`);
    }

    // Same activity type
    if (target.dimensions.activity.type === candidate.dimensions.activity.type) {
      score += 8;
      reasons.push(`同类型活动`);
    }

    // Same date type
    if (target.dimensions.temporal.dateType === candidate.dimensions.temporal.dateType) {
      score += 5;
    }

    // Same season
    if (target.dimensions.temporal.season === candidate.dimensions.temporal.season) {
      score += 3;
    }

    // Time proximity (within 7 days)
    const timeDiff = Math.abs(
      target.dimensions.temporal.timestamp - candidate.dimensions.temporal.timestamp,
    );
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    if (daysDiff <= 1) {
      score += 12;
      reasons.push('同一天');
    } else if (daysDiff <= 7) {
      score += 6;
      reasons.push('同一周');
    } else if (daysDiff <= 30) {
      score += 3;
    }

    // Shared knowledge tags
    const sharedKnowledge = target.dimensions.semantic.knowledge.filter(k =>
      candidate.dimensions.semantic.knowledge.includes(k),
    );
    if (sharedKnowledge.length > 0) {
      score += sharedKnowledge.length * 5;
      reasons.push(`共享知识"${sharedKnowledge.join('、')}"`);
    }

    // Shared tags
    if (target.tags && candidate.tags) {
      const sharedTags = target.tags.filter(t => candidate.tags!.includes(t));
      if (sharedTags.length > 0) {
        score += sharedTags.length * 8;
        reasons.push(`共享标签"${sharedTags.join('、')}"`);
      }
    }

    return { memory: candidate, score, reasons };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
