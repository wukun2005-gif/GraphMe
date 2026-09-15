import type { RawMemory, InsightMemory } from '../types';
import type { Language } from '../i18n';
import { categoryT } from '../i18n/dataTranslations';

// ========== Types ==========

export interface Contradiction {
  insight1: InsightMemory;
  insight2: InsightMemory;
  reason: string;
}

export interface LowConfidenceInsight {
  insight: InsightMemory;
  confidenceLevel: 'low' | 'very-low';
}

export interface CognitiveGap {
  dimension: string;
  label: string;
  emoji: string;
  description: string;
  lastSeenDays: number | null;
  weight: number;
}

export interface QuestionSuggestion {
  question: string;
  relatedGap: string;
  emoji: string;
}

export interface ConfusionReport {
  contradictions: Contradiction[];
  lowConfidenceInsights: LowConfidenceInsight[];
  gaps: CognitiveGap[];
  suggestions: QuestionSuggestion[];
  hasConfusion: boolean;
}

// ========== Helpers ==========

const MILLIS_PER_DAY = 86400000;

function daysSince(timestamp: number, now: number = Date.now()): number {
  return Math.max(0, Math.round((now - timestamp) / MILLIS_PER_DAY));
}

function pick(lang: Language, zh: string, en: string): string {
  return lang === 'en' ? en : zh;
}

// ========== Contradiction Detection ==========

function detectContradictions(insights: InsightMemory[], lang: Language): Contradiction[] {
  const active = insights.filter(i => i.deprecatedAt == null && i.userConfirmed !== true);
  const contradictions: Contradiction[] = [];

  // Simple keyword-based contradiction detection
  const positiveKeywords = ['上升', '增加', '提升', '进步', '增长', '增强', '更', '喜欢', '擅长'];
  const negativeKeywords = ['下降', '减少', '退步', '降低', '衰退', '减弱', '不喜欢', '不擅长'];

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];

      // Check if same category with opposite sentiment
      if (a.category === b.category) {
        const aHasPos = positiveKeywords.some(k => a.statement.includes(k));
        const aHasNeg = negativeKeywords.some(k => a.statement.includes(k));
        const bHasPos = positiveKeywords.some(k => b.statement.includes(k));
        const bHasNeg = negativeKeywords.some(k => b.statement.includes(k));

        if ((aHasPos && bHasNeg) || (aHasNeg && bHasPos)) {
          // Check if they share some context (persons, activity)
          const aSources = a.sourceRawMemoryIds || [];
          const bSources = b.sourceRawMemoryIds || [];
          const sharedSources = aSources.filter(id => bSources.includes(id));

          if (sharedSources.length > 0) {
            const cat = categoryT(lang, a.category);
            contradictions.push({
              insight1: a,
              insight2: b,
              reason: pick(
                lang,
                `两条同类别洞察（${cat}）方向相反，且共享 ${sharedSources.length} 条依据记忆`,
                `Two insights in the same category (${cat}) point in opposite directions and share ${sharedSources.length} supporting memor${sharedSources.length === 1 ? 'y' : 'ies'}.`,
              ),
            });
          }
        }
      }
    }
  }

  return contradictions;
}

// ========== Low Confidence Insights ==========

function findLowConfidenceInsights(insights: InsightMemory[]): LowConfidenceInsight[] {
  return insights
    .filter(i => i.deprecatedAt == null && i.confidence < 0.6)
    .map(i => ({
      insight: i,
      confidenceLevel: i.confidence < 0.4 ? 'very-low' as const : 'low' as const,
    }))
    .sort((a, b) => a.insight.confidence - b.insight.confidence);
}

// ========== Cognitive Gaps ==========

const GAP_LABELS: Record<string, { zh: string; en: string }> = {
  outdoor: { zh: '户外活动', en: 'Outdoor Activities' },
  social: { zh: '社交互动', en: 'Social Interaction' },
  learning: { zh: '学习新知', en: 'Learning' },
  creative: { zh: '创意活动', en: 'Creative Activities' },
  exercise: { zh: '体育运动', en: 'Exercise' },
  emotional_deep: { zh: '深度情感', en: 'Deep Emotions' },
  milestone: { zh: '里程碑事件', en: 'Milestones' },
  family: { zh: '家庭互动', en: 'Family Interaction' },
};

function detectGaps(memories: RawMemory[], lang: Language, now: number = Date.now()): CognitiveGap[] {
  const gaps: CognitiveGap[] = [];

  // Check each dimension for recent activity
  const dimensionChecks: { key: string; emoji: string; check: (m: RawMemory) => boolean }[] = [
    { key: 'outdoor', emoji: '🌳', check: m => ['公园', '游乐场'].includes(m.dimensions.spatial.placeType) },
    { key: 'social', emoji: '👥', check: m => m.dimensions.social.persons.length >= 2 },
    { key: 'learning', emoji: '📚', check: m => m.dimensions.semantic.knowledge.length > 0 },
    { key: 'creative', emoji: '🎨', check: m => m.dimensions.activity.type === '创作' || m.dimensions.activity.type === '手工' },
    { key: 'exercise', emoji: '⚽', check: m => m.dimensions.activity.type === '运动' || m.dimensions.activity.type === '锻炼' },
    { key: 'emotional_deep', emoji: '💭', check: m => m.dimensions.emotional.intensity > 0.8 },
    { key: 'milestone', emoji: '🏆', check: m => m.dimensions.narrative.isMilestone },
    { key: 'family', emoji: '👨‍👩‍👧', check: m => m.dimensions.social.relationship.some(r => r.includes('父子') || r.includes('母子') || r.includes('家人')) },
  ];

  for (const dim of dimensionChecks) {
    const relevantMems = memories.filter(dim.check);
    let lastSeenDays: number | null = null;

    if (relevantMems.length > 0) {
      const latest = Math.max(...relevantMems.map(m => m.dimensions.temporal.timestamp));
      lastSeenDays = daysSince(latest, now);
    }

    const label = pick(lang, GAP_LABELS[dim.key].zh, GAP_LABELS[dim.key].en);

    // Consider it a gap if > 30 days or no memories at all
    if (lastSeenDays === null || lastSeenDays > 30) {
      gaps.push({
        dimension: dim.key,
        label,
        emoji: dim.emoji,
        description: lastSeenDays === null
          ? pick(lang, `没有找到任何${label}相关的记忆`, `No memories related to ${label} were found.`)
          : pick(lang, `最近 ${lastSeenDays} 天没有${label}记录`, `No ${label} recorded in the last ${lastSeenDays} day${lastSeenDays === 1 ? '' : 's'}.`),
        lastSeenDays,
        weight: lastSeenDays === null ? 1 : Math.min(1, lastSeenDays / 60),
      });
    }
  }

  return gaps.sort((a, b) => b.weight - a.weight);
}

// ========== Question Suggestions ==========

const QUESTION_TEMPLATES: Record<string, { zh: string[]; en: string[] }> = {
  outdoor: {
    zh: ['最近有去户外活动吗？公园或者游乐场？', '好久没看到户外的记忆了，最近有出去走走吗？'],
    en: ['Have you been outdoors lately? A park or a playground?', "Haven't seen any outdoor memories in a while — been out and about recently?"],
  },
  social: {
    zh: ['最近有和朋友一起玩吗？', '社交方面怎么样？有新的小伙伴吗？'],
    en: ['Have you played with friends recently?', 'How is your social life? Any new buddies?'],
  },
  learning: {
    zh: ['最近有在学习新东西吗？', '有没有学到什么新知识或新技能？'],
    en: ['Have you been learning anything new?', 'Picked up any new knowledge or skills?'],
  },
  creative: {
    zh: ['最近有做手工或者创作什么吗？', '有没有画过画或者搭过什么？'],
    en: ['Have you crafted or created anything recently?', 'Drawn any pictures or built anything?'],
  },
  exercise: {
    zh: ['最近有做运动吗？', '有没有跑步、骑车或者打球？'],
    en: ['Have you exercised recently?', 'Any running, cycling, or ball games?'],
  },
  emotional_deep: {
    zh: ['最近有什么特别开心或者特别感动的事吗？', '有没有什么特别想分享的时刻？'],
    en: ['Anything especially happy or touching happen recently?', 'Any moments you really want to share?'],
  },
  milestone: {
    zh: ['最近有什么值得纪念的里程碑吗？', '有没有完成什么重要的事？'],
    en: ['Any memorable milestones recently?', 'Accomplished anything important?'],
  },
  family: {
    zh: ['最近和家人一起做了什么有趣的事吗？', '有没有和爸爸/妈妈一起的温馨时刻？'],
    en: ['Done anything fun with family recently?', 'Any warm moments with Mom or Dad?'],
  },
};

function generateSuggestions(gaps: CognitiveGap[], lang: Language): QuestionSuggestion[] {
  return gaps.slice(0, 3).map(gap => {
    const tpl = QUESTION_TEMPLATES[gap.dimension];
    const options = tpl
      ? (lang === 'en' ? tpl.en : tpl.zh)
      : [pick(lang, `${gap.label}方面有什么新进展吗？`, `Any new progress with ${gap.label}?`)];
    const question = options[Math.floor(Math.random() * options.length)];
    return {
      question,
      relatedGap: gap.dimension,
      emoji: gap.emoji,
    };
  });
}

// ========== Main ==========

export function generateConfusionReport(
  rawMemories: RawMemory[],
  insightMemories: InsightMemory[],
  lang: Language = 'zh-CN',
): ConfusionReport {
  const contradictions = detectContradictions(insightMemories, lang);
  const lowConfidenceInsights = findLowConfidenceInsights(insightMemories);
  const gaps = detectGaps(rawMemories, lang);
  const suggestions = generateSuggestions(gaps, lang);

  return {
    contradictions,
    lowConfidenceInsights,
    gaps,
    suggestions,
    hasConfusion: contradictions.length > 0 || lowConfidenceInsights.length > 0 || gaps.length > 0,
  };
}