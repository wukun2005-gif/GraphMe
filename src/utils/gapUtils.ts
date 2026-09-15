import type { RawMemory, InsightMemory } from '../types';
import type { Language } from '../i18n';

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

const DIM_LABELS: Record<string, { zh: string; en: string }> = {
  temporal: { zh: '时间维度', en: 'Temporal' },
  social: { zh: '社交维度', en: 'Social' },
  emotional: { zh: '情绪维度', en: 'Emotional' },
  activity: { zh: '活动维度', en: 'Activity' },
  spatial: { zh: '空间维度', en: 'Spatial' },
  knowledge: { zh: '知识维度', en: 'Knowledge' },
  sensory: { zh: '感官维度', en: 'Sensory' },
  narrative: { zh: '叙事维度', en: 'Narrative' },
  value: { zh: '价值维度', en: 'Value' },
  insight: { zh: '洞察维度', en: 'Insight' },
};

function pick(lang: Language, zh: string, en: string): string {
  return lang === 'en' ? en : zh;
}

export function computeKnowledgeGap(
  rawMemories: RawMemory[],
  insightMemories: InsightMemory[],
  lang: Language = 'zh-CN',
): KnowledgeGapData {
  const total = rawMemories.length;
  if (total === 0) {
    return {
      dimensions: [],
      overallCoverage: 0,
      bestDimension: '-',
      worstDimension: '-',
      summaryText: pick(lang, '还没有记忆数据，无法评估了解程度。', 'No memory data yet — cannot assess understanding level.'),
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
      dimension: 'temporal', emoji: '⏰', label: pick(lang, DIM_LABELS.temporal.zh, DIM_LABELS.temporal.en),
      coverage: temporalCoverage,
      detail: pick(lang, `过去 12 个月中有 ${monthSet.size} 个月有记忆覆盖`, `Memories cover ${monthSet.size} of the last 12 months`),
      suggestion: temporalCoverage < 50 ? pick(lang, '最近有些月份没有记忆记录，要不要回顾一下？', 'Some recent months have no memory records — want to look back?') : pick(lang, '时间覆盖良好', 'Good temporal coverage'),
    },
    {
      dimension: 'social', emoji: '👥', label: pick(lang, DIM_LABELS.social.zh, DIM_LABELS.social.en),
      coverage: socialCoverage,
      detail: pick(lang, `记录了 ${personSet.size} 个不同人物`, `Recorded ${personSet.size} different people`),
      suggestion: socialCoverage < 50 ? pick(lang, '社交记忆较少，可以多记录和家人朋友的互动', 'Few social memories — try recording more interactions with family and friends') : pick(lang, '社交网络丰富', 'Rich social network'),
    },
    {
      dimension: 'emotional', emoji: '😊', label: pick(lang, DIM_LABELS.emotional.zh, DIM_LABELS.emotional.en),
      coverage: emotionalCoverage,
      detail: pick(lang, `记录了 ${emotionSet.size} 种不同情绪`, `Recorded ${emotionSet.size} different emotions`),
      suggestion: emotionalCoverage < 50 ? pick(lang, '情绪记录较单一，可以尝试记录更多样的情感体验', 'Emotions recorded are limited — try capturing more varied feelings') : pick(lang, '情绪记录丰富', 'Rich emotional records'),
    },
    {
      dimension: 'activity', emoji: '🎮', label: pick(lang, DIM_LABELS.activity.zh, DIM_LABELS.activity.en),
      coverage: activityCoverage,
      detail: pick(lang, `记录了 ${activitySet.size} 种活动类型`, `Recorded ${activitySet.size} activity types`),
      suggestion: activityCoverage < 50 ? pick(lang, '活动类型较少，可以记录更多种类的活动', 'Few activity types — try recording more kinds of activities') : pick(lang, '活动记录丰富', 'Rich activity records'),
    },
    {
      dimension: 'spatial', emoji: '📍', label: pick(lang, DIM_LABELS.spatial.zh, DIM_LABELS.spatial.en),
      coverage: spatialCoverage,
      detail: pick(lang, `记录了 ${placeSet.size} 种地点类型`, `Recorded ${placeSet.size} place types`),
      suggestion: spatialCoverage < 50 ? pick(lang, '地点记录较少，可以记录更多不同场所的记忆', 'Few places recorded — try capturing memories in more places') : pick(lang, '空间覆盖良好', 'Good spatial coverage'),
    },
    {
      dimension: 'knowledge', emoji: '📚', label: pick(lang, DIM_LABELS.knowledge.zh, DIM_LABELS.knowledge.en),
      coverage: knowledgeCoverage,
      detail: pick(lang, `记录了 ${knowledgeSet.size} 个知识点`, `Recorded ${knowledgeSet.size} knowledge points`),
      suggestion: knowledgeCoverage < 50 ? pick(lang, '知识记录较少，学习新东西时可以记录下来', 'Few knowledge records — note down new things as you learn') : pick(lang, '知识积累丰富', 'Rich knowledge accumulation'),
    },
    {
      dimension: 'sensory', emoji: '👁️', label: pick(lang, DIM_LABELS.sensory.zh, DIM_LABELS.sensory.en),
      coverage: sensoryCoverage,
      detail: pick(lang, `${sensoryCount} 条记忆有图片/音频`, `${sensoryCount} memories have images/audio`),
      suggestion: sensoryCoverage < 30 ? pick(lang, '感官记录很少，添加照片能让记忆更生动', 'Very few sensory records — adding photos makes memories more vivid') : pick(lang, '感官记录丰富', 'Rich sensory records'),
    },
    {
      dimension: 'narrative', emoji: '📖', label: pick(lang, DIM_LABELS.narrative.zh, DIM_LABELS.narrative.en),
      coverage: narrativeCoverage,
      detail: pick(lang, `${storylineCount} 条记忆属于故事线`, `${storylineCount} memories belong to a storyline`),
      suggestion: narrativeCoverage < 30 ? pick(lang, '故事线记忆较少，可以为记忆添加故事线标签', 'Few storyline memories — try adding storyline tags') : pick(lang, '叙事连贯', 'Coherent narrative'),
    },
    {
      dimension: 'value', emoji: '💰', label: pick(lang, DIM_LABELS.value.zh, DIM_LABELS.value.en),
      coverage: valueCoverage,
      detail: pick(lang, `${valuedCount} 条记忆被多次回顾`, `${valuedCount} memories have been revisited`),
      suggestion: valueCoverage < 30 ? pick(lang, '回顾频率较低，定期重温重要记忆有助于加深印象', 'Low revisit frequency — revisiting important memories deepens them') : pick(lang, '回顾习惯良好', 'Good revisiting habits'),
    },
    {
      dimension: 'insight', emoji: '💡', label: pick(lang, DIM_LABELS.insight.zh, DIM_LABELS.insight.en),
      coverage: insightCoverage,
      detail: pick(lang, `生成了 ${activeInsights.length} 条洞察`, `Generated ${activeInsights.length} insights`),
      suggestion: insightCoverage < 50 ? pick(lang, '洞察数量较少，更多记忆数据能帮助发现更多模式', 'Few insights — more data helps discover more patterns') : pick(lang, '洞察丰富', 'Rich insights'),
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
    summaryText: pick(
      lang,
      `AI 对你的了解程度：${overallCoverage}%。最了解你的${bestDimension}（${sorted[0].coverage}%），最不了解你的${worstDimension}（${sorted[sorted.length - 1].coverage}%）。`,
      `AI understands you at ${overallCoverage}%. It knows you best on ${bestDimension} (${sorted[0].coverage}%) and least on ${worstDimension} (${sorted[sorted.length - 1].coverage}%).`,
    ),
  };
}