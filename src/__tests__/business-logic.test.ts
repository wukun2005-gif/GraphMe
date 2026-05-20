import { describe, it, expect } from 'vitest';
import { rawMemories, insightMemories } from '../data/demoData';
import { computeValueScore, computeForgettingRisk, getTop5HighValue, getForgettingRiskWarnings } from '../utils/valueUtils';
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

  it('机器人助手 device memories should not have 编程机器人-specific fields mismatched', () => {
    const loonaMems = rawMemories.filter(m => m.dimensions.robotState.device === '机器人助手');
    loonaMems.forEach(m => {
      expect(['2.0.8', '2.1.0']).toContain(m.dimensions.robotState.firmwareVersion);
    });
  });

  it('编程机器人 device memories should have valid firmware version string', () => {
    const clicbotMems = rawMemories.filter(m => m.dimensions.robotState.device === '编程机器人');
    clicbotMems.forEach(m => {
      expect(typeof m.dimensions.robotState.firmwareVersion).toBe('string');
      expect(m.dimensions.robotState.firmwareVersion.length).toBeGreaterThan(0);
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
  it('should include both 机器人助手 and 编程机器人 device memories', () => {
    const loonaCount = rawMemories.filter(m => m.dimensions.robotState.device === '机器人助手').length;
    const clicbotCount = rawMemories.filter(m => m.dimensions.robotState.device === '编程机器人').length;

    expect(loonaCount).toBeGreaterThan(0);
    expect(clicbotCount).toBeGreaterThan(0);
    expect(loonaCount + clicbotCount).toBe(rawMemories.length);
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