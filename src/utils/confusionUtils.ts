import type { RawMemory, InsightMemory } from '../types';

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

// ========== Contradiction Detection ==========

function detectContradictions(insights: InsightMemory[]): Contradiction[] {
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
            contradictions.push({
              insight1: a,
              insight2: b,
              reason: `两条同类别洞察（${a.category}）方向相反，且共享 ${sharedSources.length} 条依据记忆`,
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

function detectGaps(memories: RawMemory[], now: number = Date.now()): CognitiveGap[] {
  const gaps: CognitiveGap[] = [];

  // Check each dimension for recent activity
  const dimensionChecks: { key: string; label: string; emoji: string; check: (m: RawMemory) => boolean }[] = [
    { key: 'outdoor', label: '户外活动', emoji: '🌳', check: m => ['公园', '游乐场'].includes(m.dimensions.spatial.placeType) },
    { key: 'social', label: '社交互动', emoji: '👥', check: m => m.dimensions.social.persons.length >= 2 },
    { key: 'learning', label: '学习新知', emoji: '📚', check: m => m.dimensions.semantic.knowledge.length > 0 },
    { key: 'creative', label: '创意活动', emoji: '🎨', check: m => m.dimensions.activity.type === '创作' || m.dimensions.activity.type === '手工' },
    { key: 'exercise', label: '体育运动', emoji: '⚽', check: m => m.dimensions.activity.type === '运动' || m.dimensions.activity.type === '锻炼' },
    { key: 'emotional_deep', label: '深度情感', emoji: '💭', check: m => m.dimensions.emotional.intensity > 0.8 },
    { key: 'milestone', label: '里程碑事件', emoji: '🏆', check: m => m.dimensions.narrative.isMilestone },
    { key: 'family', label: '家庭互动', emoji: '👨‍👩‍👧', check: m => m.dimensions.social.relationship.some(r => r.includes('父子') || r.includes('母子') || r.includes('家人')) },
  ];

  for (const dim of dimensionChecks) {
    const relevantMems = memories.filter(dim.check);
    let lastSeenDays: number | null = null;

    if (relevantMems.length > 0) {
      const latest = Math.max(...relevantMems.map(m => m.dimensions.temporal.timestamp));
      lastSeenDays = daysSince(latest, now);
    }

    // Consider it a gap if > 30 days or no memories at all
    if (lastSeenDays === null || lastSeenDays > 30) {
      gaps.push({
        dimension: dim.key,
        label: dim.label,
        emoji: dim.emoji,
        description: lastSeenDays === null
          ? `没有找到任何${dim.label}相关的记忆`
          : `最近 ${lastSeenDays} 天没有${dim.label}记录`,
        lastSeenDays,
        weight: lastSeenDays === null ? 1 : Math.min(1, lastSeenDays / 60),
      });
    }
  }

  return gaps.sort((a, b) => b.weight - a.weight);
}

// ========== Question Suggestions ==========

function generateSuggestions(gaps: CognitiveGap[]): QuestionSuggestion[] {
  const templates: Record<string, string[]> = {
    outdoor: [
      '最近有去户外活动吗？公园或者游乐场？',
      '好久没看到户外的记忆了，最近有出去走走吗？',
    ],
    social: [
      '最近有和朋友一起玩吗？',
      '社交方面怎么样？有新的小伙伴吗？',
    ],
    learning: [
      '最近有在学习新东西吗？',
      '有没有学到什么新知识或新技能？',
    ],
    creative: [
      '最近有做手工或者创作什么吗？',
      '有没有画过画或者搭过什么？',
    ],
    exercise: [
      '最近有做运动吗？',
      '有没有跑步、骑车或者打球？',
    ],
    emotional_deep: [
      '最近有什么特别开心或者特别感动的事吗？',
      '有没有什么特别想分享的时刻？',
    ],
    milestone: [
      '最近有什么值得纪念的里程碑吗？',
      '有没有完成什么重要的事？',
    ],
    family: [
      '最近和家人一起做了什么有趣的事吗？',
      '有没有和爸爸/妈妈一起的温馨时刻？',
    ],
  };

  return gaps.slice(0, 3).map(gap => {
    const options = templates[gap.dimension] || [`${gap.label}方面有什么新进展吗？`];
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
  insightMemories: InsightMemory[]
): ConfusionReport {
  const contradictions = detectContradictions(insightMemories);
  const lowConfidenceInsights = findLowConfidenceInsights(insightMemories);
  const gaps = detectGaps(rawMemories);
  const suggestions = generateSuggestions(gaps);

  return {
    contradictions,
    lowConfidenceInsights,
    gaps,
    suggestions,
    hasConfusion: contradictions.length > 0 || lowConfidenceInsights.length > 0 || gaps.length > 0,
  };
}
