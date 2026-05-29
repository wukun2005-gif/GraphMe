import type { RawMemory, InsightMemory } from '../types';

export interface DimensionGap {
  dimension: string;
  emoji: string;
  label: string;
  coverage: number; // 0-100
  detail: string;
  suggestion: string;
}

export interface KnowledgeGapData {
  dimensions: DimensionGap[];
  overallCoverage: number;
  bestDimension: string;
  worstDimension: string;
  summaryText: string;
}

export function computeKnowledgeGap(
  rawMemories: RawMemory[],
  insightMemories: InsightMemory[]
): KnowledgeGapData {
  const total = rawMemories.length;
  if (total === 0) {
    return {
      dimensions: [],
      overallCoverage: 0,
      bestDimension: '-',
      worstDimension: '-',
      summaryText: '还没有记忆数据，无法评估了解程度。',
    };
  }

  const now = Date.now();
  const MONTH = 30 * 24 * 60 * 60 * 1000;

  // 1. Temporal coverage: months with memories in last 12 months
  const monthSet = new Set<string>();
  rawMemories.forEach(m => {
    const d = new Date(m.dimensions.temporal.timestamp);
    const monthsAgo = (now - m.dimensions.temporal.timestamp) / MONTH;
    if (monthsAgo <= 12) {
      monthSet.add(`${d.getFullYear()}-${d.getMonth()}`);
    }
  });
  const temporalCoverage = Math.round((monthSet.size / 12) * 100);

  // 2. Social coverage: unique persons
  const personSet = new Set<string>();
  rawMemories.forEach(m => m.dimensions.social.persons.forEach(p => personSet.add(p)));
  const socialCoverage = Math.min(100, Math.round((personSet.size / 5) * 100));

  // 3. Emotional coverage: emotion variety
  const emotionSet = new Set<string>();
  rawMemories.forEach(m => emotionSet.add(m.dimensions.emotional.primary));
  const emotionalCoverage = Math.min(100, Math.round((emotionSet.size / 8) * 100));

  // 4. Activity coverage: activity type variety
  const activitySet = new Set<string>();
  rawMemories.forEach(m => activitySet.add(m.dimensions.activity.type));
  const activityCoverage = Math.min(100, Math.round((activitySet.size / 5) * 100));

  // 5. Spatial coverage: place variety
  const placeSet = new Set<string>();
  rawMemories.forEach(m => placeSet.add(m.dimensions.spatial.placeType));
  const spatialCoverage = Math.min(100, Math.round((placeSet.size / 4) * 100));

  // 6. Knowledge coverage
  const knowledgeSet = new Set<string>();
  rawMemories.forEach(m => m.dimensions.semantic.knowledge.forEach(k => knowledgeSet.add(k)));
  const knowledgeCoverage = Math.min(100, Math.round((knowledgeSet.size / 5) * 100));

  // 7. Sensory coverage: memories with images/audio
  const sensoryCount = rawMemories.filter(m => m.dimensions.sensory.images.length > 0 || m.dimensions.sensory.audio.length > 0).length;
  const sensoryCoverage = Math.round((sensoryCount / total) * 100);

  // 8. Narrative coverage: memories in storylines
  const storylineCount = rawMemories.filter(m => m.dimensions.narrative.storyline).length;
  const narrativeCoverage = Math.round((storylineCount / total) * 100);

  // 9. Value coverage: memories with high access count
  const valuedCount = rawMemories.filter(m => m.dimensions.value.accessCount > 2).length;
  const valueCoverage = Math.round((valuedCount / total) * 100);

  // 10. Insight coverage
  const activeInsights = insightMemories.filter(i => !i.deprecatedAt);
  const insightCoverage = Math.min(100, Math.round((activeInsights.length / 3) * 100));

  const dimensions: DimensionGap[] = [
    {
      dimension: 'temporal', emoji: '⏰', label: '时间维度',
      coverage: temporalCoverage,
      detail: `过去 12 个月中有 ${monthSet.size} 个月有记忆覆盖`,
      suggestion: temporalCoverage < 50 ? '最近有些月份没有记忆记录，要不要回顾一下？' : '时间覆盖良好',
    },
    {
      dimension: 'social', emoji: '👥', label: '社交维度',
      coverage: socialCoverage,
      detail: `记录了 ${personSet.size} 个不同人物`,
      suggestion: socialCoverage < 50 ? '社交记忆较少，可以多记录和家人朋友的互动' : '社交网络丰富',
    },
    {
      dimension: 'emotional', emoji: '😊', label: '情绪维度',
      coverage: emotionalCoverage,
      detail: `记录了 ${emotionSet.size} 种不同情绪`,
      suggestion: emotionalCoverage < 50 ? '情绪记录较单一，可以尝试记录更多样的情感体验' : '情绪记录丰富',
    },
    {
      dimension: 'activity', emoji: '🎮', label: '活动维度',
      coverage: activityCoverage,
      detail: `记录了 ${activitySet.size} 种活动类型`,
      suggestion: activityCoverage < 50 ? '活动类型较少，可以记录更多种类的活动' : '活动记录丰富',
    },
    {
      dimension: 'spatial', emoji: '📍', label: '空间维度',
      coverage: spatialCoverage,
      detail: `记录了 ${placeSet.size} 种地点类型`,
      suggestion: spatialCoverage < 50 ? '地点记录较少，可以记录更多不同场所的记忆' : '空间覆盖良好',
    },
    {
      dimension: 'knowledge', emoji: '📚', label: '知识维度',
      coverage: knowledgeCoverage,
      detail: `记录了 ${knowledgeSet.size} 个知识点`,
      suggestion: knowledgeCoverage < 50 ? '知识记录较少，学习新东西时可以记录下来' : '知识积累丰富',
    },
    {
      dimension: 'sensory', emoji: '👁️', label: '感官维度',
      coverage: sensoryCoverage,
      detail: `${sensoryCount} 条记忆有图片/音频`,
      suggestion: sensoryCoverage < 30 ? '感官记录很少，添加照片能让记忆更生动' : '感官记录丰富',
    },
    {
      dimension: 'narrative', emoji: '📖', label: '叙事维度',
      coverage: narrativeCoverage,
      detail: `${storylineCount} 条记忆属于故事线`,
      suggestion: narrativeCoverage < 30 ? '故事线记忆较少，可以为记忆添加故事线标签' : '叙事连贯',
    },
    {
      dimension: 'value', emoji: '💰', label: '价值维度',
      coverage: valueCoverage,
      detail: `${valuedCount} 条记忆被多次回顾`,
      suggestion: valueCoverage < 30 ? '回顾频率较低，定期重温重要记忆有助于加深印象' : '回顾习惯良好',
    },
    {
      dimension: 'insight', emoji: '💡', label: '洞察维度',
      coverage: insightCoverage,
      detail: `生成了 ${activeInsights.length} 条洞察`,
      suggestion: insightCoverage < 50 ? '洞察数量较少，更多记忆数据能帮助发现更多模式' : '洞察丰富',
    },
  ];

  const overallCoverage = Math.round(dimensions.reduce((s, d) => s + d.coverage, 0) / dimensions.length);
  const sorted = [...dimensions].sort((a, b) => b.coverage - a.coverage);
  const bestDimension = sorted[0].label;
  const worstDimension = sorted[sorted.length - 1].label;

  return {
    dimensions,
    overallCoverage,
    bestDimension,
    worstDimension,
    summaryText: `AI 对你的了解程度：${overallCoverage}%。最了解你的${bestDimension}（${sorted[0].coverage}%），最不了解你的${worstDimension}（${sorted[sorted.length - 1].coverage}%）。`,
  };
}
