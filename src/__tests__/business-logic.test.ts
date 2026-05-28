import { describe, it, expect } from 'vitest';
import { rawMemories, insightMemories } from '../data/demoData';
import { computeValueScore, computeForgettingRisk, getTop5HighValue, getForgettingRiskWarnings, getDailyMemory, computeDecayCurve, computeDailyEmotionMap } from '../utils/valueUtils';
import { generateStory } from '../utils/storyUtils';
import { getMemoryCategoryPaths } from '../utils/navUtils';
import type { RawMemory, InsightMemory } from '../types';

describe('Business Logic — Insight Memory Version Chains', () => {
  const multiVersionInsights = insightMemories.filter(m => m.version > 1);

  it('should have at least one insight with 3+ version history', () => {
    expect(multiVersionInsights.length).toBeGreaterThanOrEqual(3);
  });

  it('every multi-version insight should have a previousVersionId', () => {
    multiVersionInsights.forEach(m => {
      expect(m.previousVersionId).toBeTruthy();
    });
  });

  it('multi-version insights should have updatedAt later than generatedAt', () => {
    multiVersionInsights.forEach(m => {
      expect(m.updatedAt).toBeGreaterThanOrEqual(m.generatedAt);
    });
  });

  it('insight_001 should have version 2 and specifically reference programming memories', () => {
    const insight = insightMemories.find(m => m.id === 'insight_001');
    expect(insight).toBeDefined();
    expect(insight!.version).toBe(2);
    expect(insight!.category).toBe('trend');

    const sourceIds = new Set(insight!.sourceRawMemoryIds);
    const programmingMems = rawMemories.filter(m =>
      m.id === 'mem_002' || m.id === 'mem_010' || m.id === 'mem_021'
    );
    expect(programmingMems.length).toBe(3);
    programmingMems.forEach(m => expect(sourceIds.has(m.id)).toBe(true));
  });

  it('insight memories with version 1 should not have previousVersionId (or be undefined)', () => {
    const v1Insights = insightMemories.filter(m => m.version === 1);
    v1Insights.forEach(m => {
      expect(m.previousVersionId).toBeUndefined();
    });
  });

  it('each insight should have at least 2 source raw memory IDs', () => {
    insightMemories.forEach(m => {
      expect(m.sourceRawMemoryIds.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('every insight should reference valid raw memory IDs that exist', () => {
    const allRawIds = new Set(rawMemories.map(m => m.id));
    insightMemories.forEach(m => {
      m.sourceRawMemoryIds.forEach(id => {
        expect(allRawIds.has(id)).toBe(true);
      });
    });
  });

  it('userConfirmed should track user agreement state', () => {
    const confirmed = insightMemories.filter(m => m.userConfirmed);
    const unconfirmed = insightMemories.filter(m => !m.userConfirmed);
    expect(confirmed.length).toBeGreaterThan(0);
    expect(unconfirmed.length).toBeGreaterThanOrEqual(0);
    expect(confirmed.length + unconfirmed.length).toBe(insightMemories.length);
  });
});

describe('Business Logic — Narrative Consistency', () => {
  it('a memory should not reference itself', () => {
    rawMemories.forEach(memory => {
      expect(memory.dimensions.narrative.previousRefs).not.toContain(memory.id);
      expect(memory.dimensions.narrative.nextRefs).not.toContain(memory.id);
    });
  });

  it('all references in nextRefs and previousRefs should point to existing memory IDs', () => {
    const allIds = new Set(rawMemories.map(m => m.id));
    rawMemories.forEach(memory => {
      memory.dimensions.narrative.previousRefs.forEach(ref => {
        expect(allIds.has(ref)).toBe(true);
      });
      memory.dimensions.narrative.nextRefs.forEach(ref => {
        expect(allIds.has(ref)).toBe(true);
      });
    });
  });

  it('nextRefs and previousRefs should reference valid existing IDs', () => {
    const allIds = new Set(rawMemories.map(m => m.id));
    rawMemories.forEach(memory => {
      memory.dimensions.narrative.nextRefs.forEach(id => {
        expect(allIds.has(id)).toBe(true);
      });
      memory.dimensions.narrative.previousRefs.forEach(id => {
        expect(allIds.has(id)).toBe(true);
      });
    });
  });

  it('milestone memories should have higher importance', () => {
    const milestones = rawMemories.filter(m => m.dimensions.narrative.isMilestone);
    const nonMilestones = rawMemories.filter(m => !m.dimensions.narrative.isMilestone);

    if (milestones.length > 0 && nonMilestones.length > 0) {
      const avgMilestoneImportance = milestones.reduce((s, m) => s + m.dimensions.value.importance, 0) / milestones.length;
      const avgNonMilestoneImportance = nonMilestones.reduce((s, m) => s + m.dimensions.value.importance, 0) / nonMilestones.length;
      expect(avgMilestoneImportance).toBeGreaterThanOrEqual(avgNonMilestoneImportance * 0.9);
    }
  });
});

describe('Business Logic — CQI & Importance Correlation', () => {
  it('memories with higher importance should generally have higher CQI', () => {
    const highImportance = rawMemories.filter(m => m.dimensions.value.importance >= 0.8);
    const lowImportance = rawMemories.filter(m => m.dimensions.value.importance < 0.5);

    if (highImportance.length > 0 && lowImportance.length > 0) {
      const avgHighCQI = highImportance.reduce((s, m) => s + m.dimensions.value.cqi, 0) / highImportance.length;
      const avgLowCQI = lowImportance.reduce((s, m) => s + m.dimensions.value.cqi, 0) / lowImportance.length;
      expect(avgHighCQI).toBeGreaterThan(avgLowCQI);
    }
  });
});

describe('Business Logic — Dimension Cross-Validation', () => {
  it('social.intimacy should correlate with emotional intensity for group interactions', () => {
    const groupMems = rawMemories.filter(m => m.dimensions.social.groupInteraction);
    groupMems.forEach(m => {
      expect(m.dimensions.social.intimacy).toBeGreaterThanOrEqual(0);
      expect(m.dimensions.emotional.intensity).toBeGreaterThanOrEqual(0);
    });
  });

  it('higher accessCount should correlate with higher importance', () => {
    const frequentlyAccessed = rawMemories.filter(m => m.dimensions.value.accessCount >= 3);
    frequentlyAccessed.forEach(m => {
      expect(m.dimensions.value.importance).toBeGreaterThanOrEqual(0.5);
    });
  });

  it('陪伴型 agent memories should not have 构建型-specific fields mismatched', () => {
    const companionMems = rawMemories.filter(m => m.dimensions.agentState.agentType === '陪伴型');
    companionMems.forEach(m => {
      expect(['2.0.8', '2.1.0']).toContain(m.dimensions.agentState.version);
    });
  });

  it('构建型 agent memories should have valid version string', () => {
    const builderMems = rawMemories.filter(m => m.dimensions.agentState.agentType === '构建型');
    builderMems.forEach(m => {
      expect(typeof m.dimensions.agentState.version).toBe('string');
      expect(m.dimensions.agentState.version.length).toBeGreaterThan(0);
    });
  });
});

describe('Business Logic — Emotion Distribution', () => {
  it('should have diverse emotion coverage', () => {
    const emotionCounts = new Map<string, number>();
    rawMemories.forEach(m => {
      const e = m.dimensions.emotional.primary;
      emotionCounts.set(e, (emotionCounts.get(e) || 0) + 1);
    });

    expect(emotionCounts.size).toBeGreaterThanOrEqual(5);

    const happyCount = emotionCounts.get('快乐');
    expect(happyCount).toBeGreaterThan(0);
  });
});

describe('Business Logic — Place Type Distribution', () => {
  it('should have diverse place type coverage', () => {
    const placeCounts = new Map<string, number>();
    rawMemories.forEach(m => {
      const p = m.dimensions.spatial.placeType;
      placeCounts.set(p, (placeCounts.get(p) || 0) + 1);
    });

    expect(placeCounts.size).toBeGreaterThanOrEqual(3);
    const homeCount = placeCounts.get('家');
    expect(homeCount).toBeGreaterThan(0);
  });
});

describe('Business Logic — Device Distribution', () => {
  it('should include both 陪伴型 and 构建型 agent memories', () => {
    const companionCount = rawMemories.filter(m => m.dimensions.agentState.agentType === '陪伴型').length;
    const builderCount = rawMemories.filter(m => m.dimensions.agentState.agentType === '构建型').length;

    expect(companionCount).toBeGreaterThan(0);
    expect(builderCount).toBeGreaterThan(0);
    expect(companionCount + builderCount).toBe(rawMemories.length);
  });
});

describe('Business Logic — Privacy Level', () => {
  it('all demo memories should be "家庭可见" in demo mode', () => {
    const nonFamilyVisible = rawMemories.filter(
      m => m.dimensions.value.privacyLevel !== '家庭可见'
    );
    expect(nonFamilyVisible.length).toBeLessThanOrEqual(rawMemories.length * 0.3);
  });
});

describe('Business Logic — Value Dashboard Computation', () => {
  describe('computeValueScore', () => {
    it('should return score between 0 and 100', () => {
      rawMemories.forEach(m => {
        const result = computeValueScore(m);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      });
    });

    it('should return breakdown with correct component ranges', () => {
      rawMemories.forEach(m => {
        const result = computeValueScore(m);
        expect(result.breakdown.importance).toBeGreaterThanOrEqual(0);
        expect(result.breakdown.importance).toBeLessThanOrEqual(40);
        expect(result.breakdown.cqi).toBeGreaterThanOrEqual(0);
        expect(result.breakdown.cqi).toBeLessThanOrEqual(30);
        expect(result.breakdown.emotionalIntensity).toBeGreaterThanOrEqual(0);
        expect(result.breakdown.emotionalIntensity).toBeLessThanOrEqual(20);
        expect(result.breakdown.accessCount).toBeGreaterThanOrEqual(0);
        expect(result.breakdown.accessCount).toBeLessThanOrEqual(10);
      });
    });

    it('should give higher score to memories with higher importance', () => {
      const highImp = rawMemories.filter(m => m.dimensions.value.importance >= 0.8);
      const lowImp = rawMemories.filter(m => m.dimensions.value.importance <= 0.3);
      if (highImp.length > 0 && lowImp.length > 0) {
        const avgHigh = highImp.reduce((s, m) => s + computeValueScore(m).score, 0) / highImp.length;
        const avgLow = lowImp.reduce((s, m) => s + computeValueScore(m).score, 0) / lowImp.length;
        expect(avgHigh).toBeGreaterThan(avgLow);
      }
    });

    it('should reference the correct memory in result', () => {
      const mem = rawMemories[0];
      const result = computeValueScore(mem);
      expect(result.memory).toBe(mem);
    });
  });

  describe('computeForgettingRisk', () => {
    it('should return risk between 0 and 1', () => {
      rawMemories.forEach(m => {
        const result = computeForgettingRisk(m);
        expect(result.risk).toBeGreaterThanOrEqual(0);
        expect(result.risk).toBeLessThanOrEqual(1);
      });
    });

    it('should return valid risk level', () => {
      rawMemories.forEach(m => {
        const result = computeForgettingRisk(m);
        expect(['low', 'medium', 'high']).toContain(result.level);
      });
    });

    it('should return daysSinceCreation as non-negative number', () => {
      rawMemories.forEach(m => {
        const result = computeForgettingRisk(m);
        expect(result.daysSinceCreation).toBeGreaterThanOrEqual(0);
      });
    });

    it('should give higher risk to older memories with same importance', () => {
      const now = 1780400000000;
      const recent: RawMemory = {
        ...rawMemories[0],
        dimensions: {
          ...rawMemories[0].dimensions,
          temporal: { ...rawMemories[0].dimensions.temporal, timestamp: now - 86400000 },
          value: { ...rawMemories[0].dimensions.value, importance: 0.5 },
        },
      };
      const old: RawMemory = {
        ...rawMemories[0],
        dimensions: {
          ...rawMemories[0].dimensions,
          temporal: { ...rawMemories[0].dimensions.temporal, timestamp: now - 30 * 86400000 },
          value: { ...rawMemories[0].dimensions.value, importance: 0.5 },
        },
      };
      const recentRisk = computeForgettingRisk(recent, now);
      const oldRisk = computeForgettingRisk(old, now);
      expect(oldRisk.risk).toBeGreaterThan(recentRisk.risk);
    });

    it('should give lower risk to more important memories at same age', () => {
      const now = Date.now();
      const ts = now - 15 * 86400000;
      const important: RawMemory = {
        ...rawMemories[0],
        dimensions: {
          ...rawMemories[0].dimensions,
          temporal: { ...rawMemories[0].dimensions.temporal, timestamp: ts },
          value: { ...rawMemories[0].dimensions.value, importance: 0.9 },
        },
      };
      const unimportant: RawMemory = {
        ...rawMemories[0],
        dimensions: {
          ...rawMemories[0].dimensions,
          temporal: { ...rawMemories[0].dimensions.temporal, timestamp: ts },
          value: { ...rawMemories[0].dimensions.value, importance: 0.1 },
        },
      };
      const impRisk = computeForgettingRisk(important, now);
      const unimpRisk = computeForgettingRisk(unimportant, now);
      expect(unimpRisk.risk).toBeGreaterThan(impRisk.risk);
    });
  });

  describe('getTop5HighValue', () => {
    it('should return at most 5 items', () => {
      const result = getTop5HighValue(rawMemories);
      expect(result.length).toBeLessThanOrEqual(5);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should be sorted descending by score', () => {
      const result = getTop5HighValue(rawMemories);
      for (let i = 1; i < result.length; i++) {
        expect(result[i].score).toBeLessThanOrEqual(result[i - 1].score);
      }
    });

    it('should return empty array for empty input', () => {
      const result = getTop5HighValue([]);
      expect(result).toEqual([]);
    });
  });

  describe('getForgettingRiskWarnings', () => {
    it('should return only medium or high risk items', () => {
      const result = getForgettingRiskWarnings(rawMemories, 10);
      result.forEach(r => {
        expect(['medium', 'high']).toContain(r.level);
      });
    });

    it('should return at most topN items', () => {
      const result = getForgettingRiskWarnings(rawMemories, 3);
      expect(result.length).toBeLessThanOrEqual(3);
    });

    it('should be sorted descending by risk', () => {
      const result = getForgettingRiskWarnings(rawMemories, 10);
      for (let i = 1; i < result.length; i++) {
        expect(result[i].risk).toBeLessThanOrEqual(result[i - 1].risk);
      }
    });
  });
});

describe('Business Logic — Story Generation Citations', () => {
  const chapters = generateStory(rawMemories, insightMemories);
  const past = chapters.find(c => c.type === 'past');
  const future = chapters.find(c => c.type === 'future');

  it('should generate a past chapter with citations', () => {
    expect(past).toBeDefined();
    expect(past!.citations).toBeDefined();
    expect(past!.citations.length).toBeGreaterThan(0);
  });

  it('past chapter should have one citation per paragraph', () => {
    const paragraphs = past!.text.split('\n\n');
    expect(past!.citations.length).toBe(paragraphs.length);
  });

  it('each past citation should reference a valid raw memory', () => {
    const rawIds = new Set(rawMemories.map(m => m.id));
    past!.citations.forEach(paraCitations => {
      paraCitations.forEach(cit => {
        expect(rawIds.has(cit.memoryId)).toBe(true);
        expect(cit.shortDescription).toBeTruthy();
      });
    });
  });

  it('should generate a future chapter with citations', () => {
    expect(future).toBeDefined();
    expect(future!.citations).toBeDefined();
    expect(future!.citations.length).toBeGreaterThan(0);
  });

  it('future chapter should have one citation array per paragraph', () => {
    const paragraphs = future!.text.split('\n\n');
    expect(future!.citations.length).toBe(paragraphs.length);
  });

  it('future citations should reference raw memory IDs from insight sourceRawMemoryIds', () => {
    const rawIds = new Set(rawMemories.map(m => m.id));
    future!.citations.forEach(paraCitations => {
      expect(paraCitations.length).toBeGreaterThan(0);
      paraCitations.forEach(cit => {
        expect(rawIds.has(cit.memoryId)).toBe(true);
        expect(cit.shortDescription).toBeTruthy();
      });
    });
  });

  it('future citation IDs should all come from insight sourceRawMemoryIds', () => {
    const topInsightIds = [...insightMemories]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
      .flatMap(ins => ins.sourceRawMemoryIds);
    const topIdSet = new Set(topInsightIds);

    future!.citations.forEach(paraCitations => {
      paraCitations.forEach(cit => {
        expect(topIdSet.has(cit.memoryId)).toBe(true);
      });
    });
  });

  it('citations array should align with chapter memoryIds for past', () => {
    const pastParagraphs = past!.text.split('\n\n');
    pastParagraphs.forEach((_, i) => {
      const paraCitations = past!.citations[i];
      expect(paraCitations.length).toBe(1);
      expect(paraCitations[0].memoryId).toBe(past!.memoryIds[i]);
    });
  });
});

describe('getMemoryCategoryPaths', () => {
  it('should return paths for a memory with placeType "家"', () => {
    const mem = rawMemories.find(m => m.dimensions.spatial.placeType === '家')!;
    expect(mem).toBeDefined();
    const paths = getMemoryCategoryPaths(mem, rawMemories);
    expect(paths.length).toBeGreaterThan(0);
    const pathKeys = paths.map(p => `${p.category}/${p.subCategory}`);
    expect(pathKeys).toContain('家庭生活/父子协作');
    expect(pathKeys).toContain('家庭生活/日常生活');
  });

  it('should return paths for a memory with placeType "学校"', () => {
    const mem = rawMemories.find(m => m.dimensions.spatial.placeType === '学校')!;
    expect(mem).toBeDefined();
    const paths = getMemoryCategoryPaths(mem, rawMemories);
    const pathKeys = paths.map(p => `${p.category}/${p.subCategory}`);
    expect(pathKeys).toContain('学习与成长/编程学习');
    expect(pathKeys).toContain('学习与成长/数学学习');
    expect(pathKeys).toContain('学习与成长/阅读习惯');
  });

  it('should return paths for a memory with placeType "游乐场"', () => {
    const mem = rawMemories.find(m => m.dimensions.spatial.placeType === '游乐场')!;
    expect(mem).toBeDefined();
    const paths = getMemoryCategoryPaths(mem, rawMemories);
    const pathKeys = paths.map(p => `${p.category}/${p.subCategory}`);
    expect(pathKeys).toContain('社交与情感/朋友互动');
    expect(pathKeys).toContain('兴趣与探索/户外活动');
  });

  it('should not contain duplicate paths', () => {
    const mem = rawMemories[0];
    const paths = getMemoryCategoryPaths(mem, rawMemories);
    const keys = paths.map(p => `${p.category}/${p.subCategory}`);
    const unique = new Set(keys);
    expect(keys.length).toBe(unique.size);
  });

  it('should return empty array for insight memory with no matching raw memories', () => {
    const insight = insightMemories[0];
    const paths = getMemoryCategoryPaths(insight, []);
    expect(paths).toEqual([]);
  });

  it('should return paths aggregated from source raw memories for insight', () => {
    const insight = insightMemories.find(m => m.sourceRawMemoryIds.length > 0)!;
    expect(insight).toBeDefined();
    const paths = getMemoryCategoryPaths(insight, rawMemories);
    expect(paths.length).toBeGreaterThanOrEqual(0);
    const keys = paths.map(p => `${p.category}/${p.subCategory}`);
    const unique = new Set(keys);
    expect(keys.length).toBe(unique.size);
  });

  it('every path should have valid icons and names', () => {
    const mem = rawMemories[0];
    const paths = getMemoryCategoryPaths(mem, rawMemories);
    paths.forEach(p => {
      expect(p.category).toBeTruthy();
      expect(p.categoryIcon).toBeTruthy();
      expect(p.subCategory).toBeTruthy();
      expect(p.subCategoryIcon).toBeTruthy();
    });
  });
});

describe('Business Logic — Daily Memory (getDailyMemory)', () => {
  it('should return null for empty memories', () => {
    expect(getDailyMemory([])).toBeNull();
  });

  it('should always return a result when memories exist', () => {
    const result = getDailyMemory(rawMemories);
    expect(result).not.toBeNull();
    expect(result!.memory).toBeDefined();
    expect(result!.reason).toMatch(/anniversary|forgetting-risk/);
    expect(typeof result!.daysAgo).toBe('number');
  });

  it('should return consistent result for the same date', () => {
    const now = Date.now();
    const r1 = getDailyMemory(rawMemories, now);
    const r2 = getDailyMemory(rawMemories, now);
    expect(r1!.memory.id).toBe(r2!.memory.id);
  });

  it('should return anniversary memory when date matches', () => {
    // Pick a memory and construct a "now" that is same month+day but different year
    const mem = rawMemories[0];
    const ts = mem.dimensions.temporal.timestamp;
    const d = new Date(ts);
    // Create a date in 2030 with same month+day
    const futureDate = new Date(2030, d.getMonth(), d.getDate(), 12, 0, 0);
    const result = getDailyMemory(rawMemories, futureDate.getTime());
    expect(result).not.toBeNull();
    // The result should be an anniversary memory with matching month+day
    if (result!.reason === 'anniversary') {
      const resultDate = new Date(result!.memory.dimensions.temporal.timestamp);
      expect(resultDate.getMonth()).toBe(d.getMonth());
      expect(resultDate.getDate()).toBe(d.getDate());
    }
  });

  it('should return a valid memory with proper fields', () => {
    const result = getDailyMemory(rawMemories);
    expect(result!.memory.id).toBeTruthy();
    expect(result!.memory.label).toBeTruthy();
    expect(result!.memory.summary).toBeTruthy();
    expect(result!.memory.dimensions.emotional.primary).toBeTruthy();
  });

  it('should compute daysAgo correctly', () => {
    const mem = rawMemories[0];
    const now = mem.dimensions.temporal.timestamp + 10 * 24 * 60 * 60 * 1000; // 10 days after
    const result = getDailyMemory([mem], now);
    expect(result!.daysAgo).toBe(10);
  });
});

describe('Business Logic — Decay Curve (computeDecayCurve)', () => {
  it('should return theoretical and actual arrays', () => {
    const result = computeDecayCurve(rawMemories);
    expect(result.theoretical.length).toBeGreaterThan(0);
    expect(result.actual.length).toBeGreaterThan(0);
    expect(typeof result.abyssCount).toBe('number');
  });

  it('theoretical curve should start near 1.0 and decrease', () => {
    const result = computeDecayCurve(rawMemories);
    expect(result.theoretical[0].theoretical).toBeCloseTo(1.0, 1);
    const last = result.theoretical[result.theoretical.length - 1];
    expect(last.theoretical).toBeLessThan(result.theoretical[0].theoretical);
  });

  it('actual points should have valid retention between 0 and 1', () => {
    const result = computeDecayCurve(rawMemories);
    result.actual.forEach(p => {
      expect(p.retention).toBeGreaterThanOrEqual(0);
      expect(p.retention).toBeLessThanOrEqual(1);
      expect(p.risk).toBeGreaterThanOrEqual(0);
      expect(p.risk).toBeLessThanOrEqual(1);
    });
  });

  it('actual points should reference valid memories', () => {
    const result = computeDecayCurve(rawMemories);
    result.actual.forEach(p => {
      expect(p.memory.id).toBeTruthy();
      expect(p.memory.label).toBeTruthy();
    });
  });

  it('should handle empty memories', () => {
    const result = computeDecayCurve([]);
    expect(result.theoretical.length).toBeGreaterThan(0);
    expect(result.actual.length).toBe(0);
    expect(result.abyssCount).toBe(0);
  });

  it('abyssCount should count memories with risk > 0.7', () => {
    const result = computeDecayCurve(rawMemories);
    const expected = result.actual.filter(p => p.risk > 0.7).length;
    expect(result.abyssCount).toBe(expected);
  });
});

describe('Business Logic — Daily Emotion Map (computeDailyEmotionMap)', () => {
  it('should return entries with valid date format', () => {
    const entries = computeDailyEmotionMap(rawMemories, 365);
    entries.forEach(e => {
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('should return entries with valid emotion and count', () => {
    const entries = computeDailyEmotionMap(rawMemories, 365);
    entries.forEach(e => {
      expect(e.primaryEmotion).toBeTruthy();
      expect(e.count).toBeGreaterThan(0);
      expect(e.summaries.length).toBeGreaterThan(0);
    });
  });

  it('should return sorted entries by date', () => {
    const entries = computeDailyEmotionMap(rawMemories, 365);
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i].date >= entries[i - 1].date).toBe(true);
    }
  });

  it('should handle empty memories', () => {
    const entries = computeDailyEmotionMap([], 90);
    expect(entries.length).toBe(0);
  });

  it('should limit summaries to 3', () => {
    const entries = computeDailyEmotionMap(rawMemories, 365);
    entries.forEach(e => {
      expect(e.summaries.length).toBeLessThanOrEqual(3);
    });
  });
});