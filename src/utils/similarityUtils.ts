import type { RawMemory } from '../types';
import type { Language } from '../i18n';
import { contentT, emotionNameT, joinContentT } from '../i18n/dataTranslations';

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
  lang: Language = 'zh-CN',
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
    // 独立于展示文本的判断标识：sharedFeatures 会按语言变化，
    // 若用它做 includes 判断，英文模式下分支将全部失配。
    const flags = { place: false, emotion: false, persons: false, activity: false, knowledge: false };
    const isEn = lang === 'en';
    let sharedPersons: string[] = [];

    // 相同地点类型
    if (target.dimensions.spatial.placeType === candidate.dimensions.spatial.placeType) {
      sharedCount++;
      flags.place = true;
      // 用 contentT 而非 placeT：后者带 emoji 前缀，嵌进句子里会显得突兀
      const p = contentT(lang, target.dimensions.spatial.placeType);
      sharedFeatures.push(isEn ? `Both at ${p}` : `同在${target.dimensions.spatial.placeType}`);
    }

    // 相同情绪
    if (target.dimensions.emotional.primary === candidate.dimensions.emotional.primary) {
      sharedCount++;
      flags.emotion = true;
      const e = emotionNameT(lang, target.dimensions.emotional.primary);
      sharedFeatures.push(isEn ? `Both ${e}` : `同为${target.dimensions.emotional.primary}情绪`);
    }

    // 相同人物
    sharedPersons = target.dimensions.social.persons.filter(p =>
      candidate.dimensions.social.persons.includes(p),
    );
    if (sharedPersons.length > 0) {
      sharedCount++;
      flags.persons = true;
      sharedFeatures.push(isEn
        ? `With ${joinContentT(lang, sharedPersons)}`
        : `都有${sharedPersons.join('、')}`);
    }

    // 相同活动类型
    if (target.dimensions.activity.type === candidate.dimensions.activity.type) {
      sharedCount++;
      flags.activity = true;
      sharedFeatures.push(isEn ? `Same activity type` : `同类型活动`);
    }

    // 相同知识标签
    const sharedKnowledge = target.dimensions.semantic.knowledge.filter(k =>
      candidate.dimensions.semantic.knowledge.includes(k),
    );
    if (sharedKnowledge.length > 0) {
      sharedCount++;
      flags.knowledge = true;
      const k = isEn ? joinContentT(lang, sharedKnowledge) : sharedKnowledge.join('、');
      sharedFeatures.push(isEn ? `Shared knowledge "${k}"` : `共享知识"${k}"`);
    }

    // 相同季节
    if (target.dimensions.temporal.season === candidate.dimensions.temporal.season) {
      sharedCount++;
    }

    return { memory: candidate, sharedCount, sharedFeatures, flags };
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
      const months = Math.floor(daysDiff / 30);
      const timeDesc = lang === 'en'
        ? (daysDiff > 30 ? `${months} month${months > 1 ? 's' : ''} ago` : `${daysDiff} days ago`)
        : (daysDiff > 30 ? `${months} 个月前` : `${daysDiff} 天前`);

      const description = generateEchoDescription(target, s.memory, timeDesc, s.flags, lang);

      return {
        memory: s.memory,
        description,
        sharedFeatures: s.sharedFeatures,
      };
    });

  return echoes;
}

/**
 * 回声描述生成。
 * @param flags 共享维度标识 —— 与展示语言无关的布尔判断依据，
 *              取代了原先对中文 sharedFeatures 做 includes 的写法。
 */
function generateEchoDescription(
  target: RawMemory,
  echo: RawMemory,
  timeDesc: string,
  flags: { place: boolean; emotion: boolean; persons: boolean; activity: boolean; knowledge: boolean },
  lang: Language,
): string {
  const echoPlace = echo.dimensions.spatial.landmark || echo.dimensions.spatial.placeType;
  const emotion = target.dimensions.emotional.primary;
  const persons = target.dimensions.social.persons;

  if (lang === 'en') {
    const ePlace = contentT(lang, echoPlace);
    const emo = emotionNameT(lang, emotion);
    const ePersons = joinContentT(lang, persons);
    if (flags.place && flags.emotion) {
      return `${timeDesc}, you also spent ${emo} time at ${ePlace} — memory resonates wonderfully across time and space`;
    }
    if (persons.length > 0 && flags.persons) {
      return `${timeDesc}, you and ${ePersons} also left footprints at ${ePlace} — the same people, a different time`;
    }
    if (flags.activity) {
      return `${timeDesc} at ${ePlace}, a similar ${emo} memory echoes in the distance`;
    }
    return `${timeDesc}, a distant memory echoes back with a familiar resonance`;
  }

  if (flags.place && flags.emotion) {
    return `${timeDesc}，你也在${echoPlace}度过了${emotion}的时光——记忆在时空中产生了奇妙的共鸣`;
  }

  if (persons.length > 0 && flags.persons) {
    return `${timeDesc}，你和${persons.join('、')}也在${echoPlace}留下了足迹——同样的人，不同的时光`;
  }

  if (flags.activity) {
    return `${timeDesc}的${echoPlace}，一段相似的${emotion}记忆在远处回响`;
  }

  return `${timeDesc}的记忆在远处回响`;
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
  lang: Language = 'zh-CN',
): MemoryChainLink[] {
  const R = (en: string, zh: string) => lang === 'en' ? en : zh;
  const chain: MemoryChainLink[] = [{ memory: start, connectionReason: R('Start', '起点') }];
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
        reasons.push(R('Shared person →', '共享人物→'));
      }

      // Same placeType
      if (current.dimensions.spatial.placeType === candidate.dimensions.spatial.placeType) {
        score += 15;
        reasons.push(R('Same place →', '同地点→'));
      }

      // Same emotion
      if (current.dimensions.emotional.primary === candidate.dimensions.emotional.primary) {
        score += 10;
        reasons.push(R('Same emotion →', '相同情绪→'));
      }

      // Same storyline
      if (
        current.dimensions.narrative.storyline &&
        current.dimensions.narrative.storyline === candidate.dimensions.narrative.storyline
      ) {
        score += 25;
        reasons.push(R('Same storyline →', '同故事线→'));
      }

      // Same activity type
      if (current.dimensions.activity.type === candidate.dimensions.activity.type) {
        score += 8;
        reasons.push(R('Same activity →', '同活动→'));
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
        reasons.push(R('Shared knowledge →', '共享知识→'));
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
      connectionReason: selected.reasons[0] || R('Related →', '相关→'),
    });

    visited.add(selected.memory.id);
    current = selected.memory;
  }

  return chain;
}

export interface BoomerangResult {
  memory: RawMemory;
  description: string;
  timeDiffDays: number;
}

/**
 * 查找回旋镖记忆 — 跨越时间的远距记忆呼应
 * 条件：时间间隔≥30天、不同storyline、但emotional.intensity差值≤0.15、activity.type属于同一大类
 */
export function findBoomerang(
  target: RawMemory,
  allMemories: RawMemory[],
  limit = 2,
  lang: Language = 'zh-CN',
): BoomerangResult[] {
  const candidates = allMemories.filter(m => {
    if (m.id === target.id) return false;
    // 不同 storyline
    if (target.dimensions.narrative.storyline &&
        target.dimensions.narrative.storyline === m.dimensions.narrative.storyline) {
      return false;
    }
    // 间隔 ≥ 30 天
    const timeDiff = Math.abs(
      target.dimensions.temporal.timestamp - m.dimensions.temporal.timestamp,
    );
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    if (daysDiff < 30) return false;
    return true;
  });

  const scored = candidates.map(candidate => {
    let score = 0;
    const reasons: string[] = [];

    // 情绪强度相近 (差值 ≤ 0.15)
    const intensityDiff = Math.abs(
      target.dimensions.emotional.intensity - candidate.dimensions.emotional.intensity,
    );
    if (intensityDiff <= 0.15) {
      score += 30;
      reasons.push('情绪强度相近');
    }

    // 同一大类活动
    const activityCategories: Record<string, string> = {
      '学习': '学习',
      '编程': '学习',
      '数学': '学习',
      '阅读': '学习',
      '运动': '运动',
      '骑车': '运动',
      '跑步': '运动',
      '游戏': '娱乐',
      '画画': '娱乐',
      '音乐': '娱乐',
      '做饭': '生活',
      '打扫': '生活',
      '购物': '生活',
    };

    const targetCategory = activityCategories[target.dimensions.activity.type] || '其他';
    const candidateCategory = activityCategories[candidate.dimensions.activity.type] || '其他';

    if (targetCategory === candidateCategory && targetCategory !== '其他') {
      score += 20;
      reasons.push(`同为${targetCategory}类活动`);
    }

    // 同一情绪类型
    if (target.dimensions.emotional.primary === candidate.dimensions.emotional.primary) {
      score += 15;
      reasons.push('相同情绪');
    }

    // 同一地点类型
    if (target.dimensions.spatial.placeType === candidate.dimensions.spatial.placeType) {
      score += 10;
    }

    // 共享人物
    const sharedPersons = target.dimensions.social.persons.filter(p =>
      candidate.dimensions.social.persons.includes(p),
    );
    if (sharedPersons.length > 0) {
      score += sharedPersons.length * 8;
    }

    // 共享知识
    const sharedKnowledge = target.dimensions.semantic.knowledge.filter(k =>
      candidate.dimensions.semantic.knowledge.includes(k),
    );
    if (sharedKnowledge.length > 0) {
      score += sharedKnowledge.length * 5;
    }

    return { memory: candidate, score, reasons };
  });

  const results = scored
    .filter(s => s.score >= 30) // At least emotion intensity match
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => {
      const timeDiff = Math.abs(
        target.dimensions.temporal.timestamp - s.memory.dimensions.temporal.timestamp,
      );
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const monthsDiff = Math.floor(daysDiff / 30);

      const description = generateBoomerangDescription(target, s.memory, monthsDiff, s.reasons, lang);

      return {
        memory: s.memory,
        description,
        timeDiffDays: daysDiff,
      };
    });

  return results;
}

function generateBoomerangDescription(
  target: RawMemory,
  boomerang: RawMemory,
  monthsDiff: number,
  reasons: string[],
  lang: Language,
): string {
  const targetPlace = target.dimensions.spatial.landmark || target.dimensions.spatial.placeType;
  const boomerangPlace = boomerang.dimensions.spatial.landmark || boomerang.dimensions.spatial.placeType;
  const targetEmotion = target.dimensions.emotional.primary;

  if (lang === 'en') {
    const tEmo = emotionNameT(lang, targetEmotion);
    const actDetail = contentT(lang, target.dimensions.activity.detail);
    const bPlace = contentT(lang, boomerangPlace);
    const tPlace = contentT(lang, targetPlace);
    if (reasons.includes('情绪强度相近') && reasons.includes(`同为${target.dimensions.activity.type}类活动`)) {
      return `This ${tEmo} pattern of ${actDetail} perfectly reappeared at ${bPlace} ${monthsDiff} months ago`;
    }
    if (reasons.includes('相同情绪')) {
      return `${monthsDiff} months ago at ${bPlace}, you felt the same ${tEmo} — time repeats, but every moment is unique`;
    }
    if (reasons.includes(`同为${target.dimensions.activity.type}类活动`)) {
      return `Your ${actDetail} at ${tPlace} forms a cross-time echo with ${bPlace} from ${monthsDiff} months ago`;
    }
    return `A memory from ${monthsDiff} months ago echoes in the distance`;
  }

  if (reasons.includes('情绪强度相近') && reasons.includes(`同为${target.dimensions.activity.type}类活动`)) {
    return `这条${targetEmotion}的${target.dimensions.activity.detail}模式，在 ${monthsDiff} 个月前的${boomerangPlace}也完美重现了`;
  }

  if (reasons.includes('相同情绪')) {
    return `${monthsDiff} 个月前的${boomerangPlace}，你也经历了同样的${targetEmotion}——时间在重复，但每一次都是独特的`;
  }

  if (reasons.includes(`同为${target.dimensions.activity.type}类活动`)) {
    return `你在${targetPlace}的${target.dimensions.activity.detail}，与 ${monthsDiff} 个月前的${boomerangPlace}形成了跨越时间的呼应`;
  }

  return `${monthsDiff} 个月前的记忆在远处回响——${reasons.slice(0, 2).join('、')}`;
}

// ========== Antipode (最遥远的记忆) ==========

export interface AntipodeResult {
  memory: RawMemory;
  distance: number;
  description: string;
}

export function findAntipode(target: RawMemory, allMemories: RawMemory[], lang: Language = 'zh-CN'): AntipodeResult | null {
  const candidates = allMemories.filter(m => m.id !== target.id);
  if (candidates.length === 0) return null;

  let maxDist = -1;
  let antipode: RawMemory | null = null;

  for (const candidate of candidates) {
    let dist = 0;

    // 1. Emotion distance (different emotion = high distance)
    if (target.dimensions.emotional.primary !== candidate.dimensions.emotional.primary) {
      dist += 3;
    }

    // 2. Emotion intensity distance
    dist += Math.abs(target.dimensions.emotional.intensity - candidate.dimensions.emotional.intensity) * 2;

    // 3. Place type distance (different place = distance)
    if (target.dimensions.spatial.placeType !== candidate.dimensions.spatial.placeType) {
      dist += 2;
    }

    // 4. Activity type distance
    if (target.dimensions.activity.type !== candidate.dimensions.activity.type) {
      dist += 2;
    }

    // 5. Person overlap (no shared persons = distance)
    const sharedPersons = target.dimensions.social.persons.filter(p =>
      candidate.dimensions.social.persons.includes(p)
    );
    dist += (1 - Math.min(sharedPersons.length, 1)) * 2;

    // 6. Importance distance
    dist += Math.abs(target.dimensions.value.importance - candidate.dimensions.value.importance) * 2;

    // 7. Knowledge distance (no shared knowledge = distance)
    const sharedKnowledge = target.dimensions.semantic.knowledge.filter(k =>
      candidate.dimensions.semantic.knowledge.includes(k)
    );
    dist += (1 - Math.min(sharedKnowledge.length, 1)) * 1.5;

    // 8. Time distance
    const daysDiff = Math.abs(target.dimensions.temporal.timestamp - candidate.dimensions.temporal.timestamp) / (1000 * 60 * 60 * 24);
    dist += Math.min(daysDiff / 30, 3); // Cap at 3

    // 9. Season distance
    if (target.dimensions.temporal.season !== candidate.dimensions.temporal.season) {
      dist += 1;
    }

    // 10. Storyline distance
    if (target.dimensions.narrative.storyline !== candidate.dimensions.narrative.storyline) {
      dist += 1.5;
    }

    if (dist > maxDist) {
      maxDist = dist;
      antipode = candidate;
    }
  }

  if (!antipode) return null;

  // Generate description
  const targetEmotion = target.dimensions.emotional.primary;
  const antipodeEmotion = antipode.dimensions.emotional.primary;
  const targetPlace = target.dimensions.spatial.landmark || target.dimensions.spatial.placeType;
  const antipodePlace = antipode.dimensions.spatial.landmark || antipode.dimensions.spatial.placeType;

  let description = '';
  if (lang === 'en') {
    const tEmo = emotionNameT(lang, targetEmotion);
    const aEmo = emotionNameT(lang, antipodeEmotion);
    const tPlace = contentT(lang, targetPlace);
    const aPlace = contentT(lang, antipodePlace);
    if (targetEmotion !== antipodeEmotion && target.dimensions.activity.type !== antipode.dimensions.activity.type) {
      description = `This ${tEmo} memory at ${tPlace} and that ${aEmo} memory at ${aPlace} are almost the two poles of your memory universe`;
    } else if (targetEmotion !== antipodeEmotion) {
      description = `From ${tEmo} to ${aEmo} — the two ends of your emotional spectrum`;
    } else {
      description = `The same ${tEmo} you, in a completely different world — ${tPlace} and ${aPlace}`;
    }
  } else if (targetEmotion !== antipodeEmotion && target.dimensions.activity.type !== antipode.dimensions.activity.type) {
    description = `这条${targetEmotion}的${targetPlace}记忆，与那条${antipodeEmotion}的${antipodePlace}记忆，几乎是你记忆宇宙的两极`;
  } else if (targetEmotion !== antipodeEmotion) {
    description = `从${targetEmotion}到${antipodeEmotion}——这是你情感光谱的两端`;
  } else {
    description = `同一个${targetEmotion}的你，在完全不同的世界里——${targetPlace}与${antipodePlace}`;
  }

  return {
    memory: antipode,
    distance: maxDist,
    description,
  };
}
