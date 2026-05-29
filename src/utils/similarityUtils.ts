import type { RawMemory } from '../types';

export interface SimilarMemory {
  memory: RawMemory;
  score: number;
  reasons: string[];
}

export interface EchoMemory {
  memory: RawMemory;
  description: string;
  sharedFeatures: string[];
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

/**
 * 查找跨时间呼应的记忆（记忆回声）
 * 条件：不同 storyline、不同日期（间隔>7天）、但共享3+维度特征
 */
export function findEcho(
  target: RawMemory,
  allMemories: RawMemory[],
  limit = 2,
): EchoMemory[] {
  const candidates = allMemories.filter(m => {
    if (m.id === target.id) return false;
    // 不同 storyline
    if (target.dimensions.narrative.storyline &&
        target.dimensions.narrative.storyline === m.dimensions.narrative.storyline) {
      return false;
    }
    // 间隔 > 7 天
    const timeDiff = Math.abs(
      target.dimensions.temporal.timestamp - m.dimensions.temporal.timestamp,
    );
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    if (daysDiff <= 7) return false;
    return true;
  });

  const scored = candidates.map(candidate => {
    let sharedCount = 0;
    const sharedFeatures: string[] = [];

    // 相同地点类型
    if (target.dimensions.spatial.placeType === candidate.dimensions.spatial.placeType) {
      sharedCount++;
      sharedFeatures.push(`同在${target.dimensions.spatial.placeType}`);
    }

    // 相同情绪
    if (target.dimensions.emotional.primary === candidate.dimensions.emotional.primary) {
      sharedCount++;
      sharedFeatures.push(`同为${target.dimensions.emotional.primary}情绪`);
    }

    // 相同人物
    const sharedPersons = target.dimensions.social.persons.filter(p =>
      candidate.dimensions.social.persons.includes(p),
    );
    if (sharedPersons.length > 0) {
      sharedCount++;
      sharedFeatures.push(`都有${sharedPersons.join('、')}`);
    }

    // 相同活动类型
    if (target.dimensions.activity.type === candidate.dimensions.activity.type) {
      sharedCount++;
      sharedFeatures.push(`同类型活动`);
    }

    // 相同知识标签
    const sharedKnowledge = target.dimensions.semantic.knowledge.filter(k =>
      candidate.dimensions.semantic.knowledge.includes(k),
    );
    if (sharedKnowledge.length > 0) {
      sharedCount++;
      sharedFeatures.push(`共享知识"${sharedKnowledge.join('、')}"`);
    }

    // 相同季节
    if (target.dimensions.temporal.season === candidate.dimensions.temporal.season) {
      sharedCount++;
    }

    return { memory: candidate, sharedCount, sharedFeatures };
  });

  // 只返回共享 3+ 维度特征的记忆
  const echoes = scored
    .filter(s => s.sharedCount >= 3)
    .sort((a, b) => b.sharedCount - a.sharedCount)
    .slice(0, limit)
    .map(s => {
      const timeDiff = Math.abs(
        target.dimensions.temporal.timestamp - s.memory.dimensions.temporal.timestamp,
      );
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const timeDesc = daysDiff > 30
        ? `${Math.floor(daysDiff / 30)} 个月前`
        : `${daysDiff} 天前`;

      const description = generateEchoDescription(target, s.memory, timeDesc, s.sharedFeatures);

      return {
        memory: s.memory,
        description,
        sharedFeatures: s.sharedFeatures,
      };
    });

  return echoes;
}

function generateEchoDescription(
  target: RawMemory,
  echo: RawMemory,
  timeDesc: string,
  sharedFeatures: string[],
): string {
  const targetPlace = target.dimensions.spatial.landmark || target.dimensions.spatial.placeType;
  const echoPlace = echo.dimensions.spatial.landmark || echo.dimensions.spatial.placeType;
  const emotion = target.dimensions.emotional.primary;
  const persons = target.dimensions.social.persons;

  // 根据共享特征生成自然语言描述
  if (sharedFeatures.includes(`同在${target.dimensions.spatial.placeType}`) &&
      sharedFeatures.includes(`同为${emotion}情绪`)) {
    return `${timeDesc}，你也在${echoPlace}度过了${emotion}的时光——记忆在时空中产生了奇妙的共鸣`;
  }

  if (persons.length > 0 && sharedFeatures.includes(`都有${persons.join('、')}`)) {
    return `${timeDesc}，你和${persons.join('、')}也在${echoPlace}留下了足迹——同样的人，不同的时光`;
  }

  if (sharedFeatures.includes(`同类型活动`)) {
    return `${timeDesc}的${echoPlace}，一段相似的${emotion}记忆在远处回响`;
  }

  return `${timeDesc}的记忆在远处回响——${sharedFeatures.slice(0, 2).join('、')}`;
}

export interface MemoryChainLink {
  memory: RawMemory;
  connectionReason: string;
}

/**
 * 构建记忆链条 — 从当前记忆出发，链式寻找最相似记忆
 * 每步标注连接原因，多候选时随机选择下一步
 */
export function buildMemoryChain(
  start: RawMemory,
  allMemories: RawMemory[],
  steps: number = 5,
): MemoryChainLink[] {
  const chain: MemoryChainLink[] = [{ memory: start, connectionReason: '起点' }];
  const visited = new Set<string>([start.id]);

  let current = start;

  for (let i = 0; i < steps; i++) {
    // Find similar memories not yet visited
    const candidates = allMemories.filter(m => !visited.has(m.id));

    if (candidates.length === 0) break;

    // Score each candidate
    const scored = candidates.map(candidate => {
      let score = 0;
      const reasons: string[] = [];

      // Same persons
      const sharedPersons = current.dimensions.social.persons.filter(p =>
        candidate.dimensions.social.persons.includes(p),
      );
      if (sharedPersons.length > 0) {
        score += sharedPersons.length * 20;
        reasons.push(`共享人物→`);
      }

      // Same placeType
      if (current.dimensions.spatial.placeType === candidate.dimensions.spatial.placeType) {
        score += 15;
        reasons.push(`同地点→`);
      }

      // Same emotion
      if (current.dimensions.emotional.primary === candidate.dimensions.emotional.primary) {
        score += 10;
        reasons.push(`相同情绪→`);
      }

      // Same storyline
      if (
        current.dimensions.narrative.storyline &&
        current.dimensions.narrative.storyline === candidate.dimensions.narrative.storyline
      ) {
        score += 25;
        reasons.push(`同故事线→`);
      }

      // Same activity type
      if (current.dimensions.activity.type === candidate.dimensions.activity.type) {
        score += 8;
        reasons.push(`同活动→`);
      }

      // Same season
      if (current.dimensions.temporal.season === candidate.dimensions.temporal.season) {
        score += 3;
      }

      // Shared knowledge
      const sharedKnowledge = current.dimensions.semantic.knowledge.filter(k =>
        candidate.dimensions.semantic.knowledge.includes(k),
      );
      if (sharedKnowledge.length > 0) {
        score += sharedKnowledge.length * 5;
        reasons.push(`共享知识→`);
      }

      return { memory: candidate, score, reasons };
    });

    // Filter and sort
    const valid = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);

    if (valid.length === 0) break;

    // Randomly select from top 3 candidates for variety
    const topCandidates = valid.slice(0, 3);
    const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];

    chain.push({
      memory: selected.memory,
      connectionReason: selected.reasons[0] || '相关→',
    });

    visited.add(selected.memory.id);
    current = selected.memory;
  }

  return chain;
}
