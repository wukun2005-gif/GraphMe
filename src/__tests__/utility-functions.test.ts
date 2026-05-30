import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rawMemories, insightMemories } from '../data/demoData';
import { findSimilarMemories, findEcho, buildMemoryChain, findBoomerang, findAntipode } from '../utils/similarityUtils';
import { generateConfusionReport } from '../utils/confusionUtils';
import { filterByTimeRange, computeAssetStats, computeTemperament, computeHealthScore, computeDimensionData, computeMemoryTypePotential } from '../utils/memoryBankUtils';
import type { RawMemory } from '../types';

const memories = rawMemories;
const target = memories[0];

describe('similarityUtils — findSimilarMemories', () => {
  it('returns similar memories sorted by score descending', () => {
    const results = findSimilarMemories(target, memories);
    expect(results.length).toBeGreaterThan(0);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it('respects limit parameter', () => {
    const results = findSimilarMemories(target, memories, 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('excludes the target itself from results', () => {
    const results = findSimilarMemories(target, memories);
    const ids = results.map(r => r.memory.id);
    expect(ids).not.toContain(target.id);
  });

  it('returns empty array when only one memory exists', () => {
    const results = findSimilarMemories(target, [target]);
    expect(results).toEqual([]);
  });

  it('each result has score > 0 and non-empty reasons', () => {
    const results = findSimilarMemories(target, memories);
    results.forEach(r => {
      expect(r.score).toBeGreaterThan(0);
      expect(r.reasons.length).toBeGreaterThan(0);
    });
  });
});

describe('similarityUtils — findEcho', () => {
  it('returns echoes with shared features', () => {
    const results = findEcho(target, memories);
    results.forEach(r => {
      expect(r.sharedFeatures.length).toBeGreaterThanOrEqual(3);
      expect(r.description).toBeTruthy();
    });
  });

  it('does not return echoes from the same storyline within 7 days', () => {
    const results = findEcho(target, memories);
    results.forEach(r => {
      const timeDiff = Math.abs(r.memory.dimensions.temporal.timestamp - target.dimensions.temporal.timestamp);
      const sameStoryline = r.memory.dimensions.narrative.storyline === target.dimensions.narrative.storyline;
      if (sameStoryline) {
        expect(timeDiff).toBeGreaterThan(7 * 24 * 3600 * 1000);
      }
    });
  });
});

describe('similarityUtils — findAntipode', () => {
  it('returns the most distant memory or null', () => {
    const result = findAntipode(target, memories);
    if (result) {
      expect(result.distance).toBeGreaterThan(0);
      expect(result.description).toBeTruthy();
      expect(result.memory.id).not.toBe(target.id);
    }
  });

  it('returns null when only one memory exists', () => {
    expect(findAntipode(target, [target])).toBeNull();
  });
});

describe('similarityUtils — buildMemoryChain', () => {
  it('builds a chain with correct number of steps', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const chain = buildMemoryChain(target, memories, 3);
    expect(chain.length).toBeLessThanOrEqual(4); // start + 3 steps
    expect(chain[0].memory.id).toBe(target.id);
    vi.restoreAllMocks();
  });

  it('each link has a connection reason', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const chain = buildMemoryChain(target, memories, 2);
    chain.slice(1).forEach(link => {
      expect(link.connectionReason).toBeTruthy();
    });
    vi.restoreAllMocks();
  });
});

describe('similarityUtils — findBoomerang', () => {
  it('returns boomerang results with time diff >= 30 days', () => {
    const results = findBoomerang(target, memories);
    results.forEach(r => {
      expect(r.timeDiffDays).toBeGreaterThanOrEqual(30);
      expect(r.description).toBeTruthy();
    });
  });

  it('respects limit parameter', () => {
    const results = findBoomerang(target, memories, 1);
    expect(results.length).toBeLessThanOrEqual(1);
  });
});

describe('confusionUtils — generateConfusionReport', () => {
  it('returns a valid report structure', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const report = generateConfusionReport(memories, insightMemories);
    expect(report).toHaveProperty('contradictions');
    expect(report).toHaveProperty('lowConfidenceInsights');
    expect(report).toHaveProperty('gaps');
    expect(report).toHaveProperty('suggestions');
    expect(report).toHaveProperty('hasConfusion');
    expect(Array.isArray(report.contradictions)).toBe(true);
    expect(Array.isArray(report.lowConfidenceInsights)).toBe(true);
    expect(Array.isArray(report.gaps)).toBe(true);
    expect(Array.isArray(report.suggestions)).toBe(true);
    vi.restoreAllMocks();
  });

  it('detects low confidence insights', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const lowConfInsight = {
      ...insightMemories[0],
      id: 'test_low_conf',
      confidence: 0.3,
      deprecatedAt: undefined,
      userConfirmed: false,
    };
    const report = generateConfusionReport(memories, [lowConfInsight, ...insightMemories]);
    const lowConfIds = report.lowConfidenceInsights.map(l => l.insight.id);
    expect(lowConfIds).toContain('test_low_conf');
    vi.restoreAllMocks();
  });

  it('handles empty inputs gracefully', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const report = generateConfusionReport([], []);
    // With no memories, all dimensions are cognitive gaps → hasConfusion is true
    expect(report.contradictions).toEqual([]);
    expect(report.lowConfidenceInsights).toEqual([]);
    expect(report.gaps.length).toBeGreaterThan(0); // gaps detected for missing dimensions
    vi.restoreAllMocks();
  });
});

describe('memoryBankUtils — filterByTimeRange', () => {
  const now = Date.now();
  const recent: RawMemory = {
    ...memories[0],
    id: 'recent_001',
    dimensions: { ...memories[0].dimensions, temporal: { ...memories[0].dimensions.temporal, timestamp: now - 2 * 24 * 3600 * 1000 } },
  };
  const old: RawMemory = {
    ...memories[0],
    id: 'old_001',
    dimensions: { ...memories[0].dimensions, temporal: { ...memories[0].dimensions.temporal, timestamp: now - 20 * 24 * 3600 * 1000 } },
  };

  it('filters to last 7 days for 周 range', () => {
    const result = filterByTimeRange([recent, old], '周', now);
    expect(result.map(m => m.id)).toContain('recent_001');
    expect(result.map(m => m.id)).not.toContain('old_001');
  });

  it('includes more memories for 月 range', () => {
    const result = filterByTimeRange([recent, old], '月', now);
    expect(result.map(m => m.id)).toContain('recent_001');
    expect(result.map(m => m.id)).toContain('old_001');
  });
});

describe('memoryBankUtils — computeAssetStats', () => {
  it('returns valid stats structure', () => {
    const stats = computeAssetStats(memories);
    expect(stats).toHaveProperty('positive');
    expect(stats).toHaveProperty('negative');
    expect(stats).toHaveProperty('ratio');
    expect(stats).toHaveProperty('total');
    expect(stats.total).toBe(memories.length);
    expect(stats.positive + stats.negative).toBeLessThanOrEqual(stats.total);
  });

  it('handles empty memories', () => {
    const stats = computeAssetStats([]);
    expect(stats.total).toBe(0);
    expect(stats.positive).toBe(0);
    expect(stats.ratio).toBe(0);
  });
});

describe('memoryBankUtils — computeTemperament', () => {
  it('returns valid temperament structure', () => {
    const result = computeTemperament(memories);
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('label');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('traits');
    expect(result.traits.length).toBe(3);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
  });

  it('returns default values for empty memories', () => {
    const result = computeTemperament([]);
    expect(result.type).toBeTruthy();
    expect(result.confidence).toBe(0);
  });
});

describe('memoryBankUtils — computeHealthScore', () => {
  it('returns score between 0 and 100', () => {
    const result = computeHealthScore(memories, '月');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(typeof result.delta).toBe('number');
  });
});

describe('memoryBankUtils — computeDimensionData', () => {
  it('returns 5 dimension items', () => {
    const result = computeDimensionData(memories, '月');
    expect(result.length).toBe(5);
    result.forEach(item => {
      expect(item.value).toBeGreaterThanOrEqual(0);
      expect(item.value).toBeLessThanOrEqual(100);
      expect(['up', 'down', 'stable']).toContain(item.trend);
    });
  });
});

describe('memoryBankUtils — computeMemoryTypePotential', () => {
  it('returns potential items with valid star ratings', () => {
    const result = computeMemoryTypePotential(memories);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(item => {
      expect(item.stars).toBeGreaterThanOrEqual(1);
      expect(item.stars).toBeLessThanOrEqual(5);
      expect(item.label).toBeTruthy();
    });
  });

  it('returns empty array for empty memories', () => {
    expect(computeMemoryTypePotential([])).toEqual([]);
  });
});
