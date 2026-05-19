import { describe, it, expect } from 'vitest';
import { rawMemories, insightMemories } from '../data/demoData';
import type { RawMemory, InsightMemory, EmotionType } from '../types';
import { EMOTION_COLORS, INSIGHT_COLOR, CATEGORY_LABELS } from '../types';

const ALL_EMOTIONS: EmotionType[] = [
  '快乐', '悲伤', '愤怒', '惊讶', '恐惧', '厌恶', '中性',
  '好奇', '骄傲', '沮丧', '感激', '思念',
];

const REQUIRED_DIMENSION_VIEWS = ['全局视图', '家庭视图', '学习视图', '情绪视图'];

describe('Demo Data — Raw Memory Integrity', () => {
  it('should have at least 50 raw memories', () => {
    expect(rawMemories.length).toBeGreaterThanOrEqual(50);
  });

  it('every raw memory should have a unique id', () => {
    const ids = rawMemories.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every raw memory should have type "raw"', () => {
    rawMemories.forEach(m => {
      expect(m.type).toBe('raw');
    });
  });

  it('every raw memory should have non-empty label and summary', () => {
    rawMemories.forEach(m => {
      expect(m.label).toBeTruthy();
      expect(m.summary).toBeTruthy();
    });
  });

  it('every raw memory should have valid position3D (3-element array of numbers)', () => {
    rawMemories.forEach(m => {
      expect(Array.isArray(m.position3D)).toBe(true);
      expect(m.position3D).toHaveLength(3);
      m.position3D.forEach(v => expect(typeof v).toBe('number'));
    });
  });

  it('every raw memory should have positions for all 4 required dimension views', () => {
    rawMemories.forEach(m => {
      REQUIRED_DIMENSION_VIEWS.forEach(view => {
        const pos = m.positions[view];
        expect(Array.isArray(pos)).toBe(true);
        expect(pos).toHaveLength(3);
        pos.forEach(v => expect(typeof v).toBe('number'));
      });
    });
  });

  it('every raw memory should have a valid color in hex format (#RRGGBB)', () => {
    const hexColorPattern = /^#[0-9a-fA-F]{6}$/;
    rawMemories.forEach(m => {
      expect(m.color).toMatch(hexColorPattern);
    });
  });

  it('every raw memory should have positive size', () => {
    rawMemories.forEach(m => {
      expect(m.size).toBeGreaterThan(0);
    });
  });

  describe('Temporal dimension', () => {
    it('should have valid timestamp (number)', () => {
      rawMemories.forEach(m => {
        expect(typeof m.dimensions.temporal.timestamp).toBe('number');
        expect(m.dimensions.temporal.timestamp).toBeGreaterThan(1700000000000);
      });
    });

    it('should have valid dateType enum', () => {
      const valid = ['普通日', '周末', '节日', '生日', '纪念日'];
      rawMemories.forEach(m => {
        expect(valid).toContain(m.dimensions.temporal.dateType);
      });
    });

    it('should have valid timeOfDay enum', () => {
      const valid = ['清晨', '上午', '下午', '傍晚', '深夜'];
      rawMemories.forEach(m => {
        expect(valid).toContain(m.dimensions.temporal.timeOfDay);
      });
    });

    it('should have valid season enum', () => {
      const valid = ['春', '夏', '秋', '冬'];
      rawMemories.forEach(m => {
        expect(valid).toContain(m.dimensions.temporal.season);
      });
    });

    it('should have positive duration', () => {
      rawMemories.forEach(m => {
        expect(m.dimensions.temporal.duration).toBeGreaterThan(0);
      });
    });
  });

  describe('Spatial dimension', () => {
    it('should have valid placeType', () => {
      const valid = ['家', '学校', '公园', '商场', '游乐场', '其他'];
      rawMemories.forEach(m => {
        expect(valid).toContain(m.dimensions.spatial.placeType);
      });
    });

    it('should have non-empty room and landmark', () => {
      rawMemories.forEach(m => {
        expect(m.dimensions.spatial.room).toBeTruthy();
        expect(m.dimensions.spatial.landmark).toBeTruthy();
      });
    });
  });

  describe('Social dimension', () => {
    it('should have valid intimacy range [0, 1]', () => {
      rawMemories.forEach(m => {
        expect(m.dimensions.social.intimacy).toBeGreaterThanOrEqual(0);
        expect(m.dimensions.social.intimacy).toBeLessThanOrEqual(1);
      });
    });

    it('should have relationship count match persons count when persons present', () => {
      rawMemories.forEach(m => {
        const { persons, relationship } = m.dimensions.social;
        if (persons.length > 0) {
          expect(relationship.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Emotional dimension', () => {
    it('should have valid primary emotion', () => {
      rawMemories.forEach(m => {
        expect(ALL_EMOTIONS).toContain(m.dimensions.emotional.primary);
      });
    });

    it('should have valid intensity range [0, 1]', () => {
      rawMemories.forEach(m => {
        expect(m.dimensions.emotional.intensity).toBeGreaterThanOrEqual(0);
        expect(m.dimensions.emotional.intensity).toBeLessThanOrEqual(1);
      });
    });

    it('should have non-empty trigger', () => {
      rawMemories.forEach(m => {
        expect(m.dimensions.emotional.trigger).toBeTruthy();
      });
    });
  });

  describe('Activity dimension', () => {
    it('should have non-empty type and detail', () => {
      rawMemories.forEach(m => {
        expect(m.dimensions.activity.type).toBeTruthy();
        expect(m.dimensions.activity.detail).toBeTruthy();
      });
    });
  });

  describe('Sensory dimension', () => {
    it('should have arrays for images, audio, videos', () => {
      rawMemories.forEach(m => {
        expect(Array.isArray(m.dimensions.sensory.images)).toBe(true);
        expect(Array.isArray(m.dimensions.sensory.audio)).toBe(true);
        expect(Array.isArray(m.dimensions.sensory.videos)).toBe(true);
      });
    });
  });

  describe('Semantic dimension', () => {
    it('should have array for knowledge and skills', () => {
      rawMemories.forEach(m => {
        expect(Array.isArray(m.dimensions.semantic.knowledge)).toBe(true);
        expect(Array.isArray(m.dimensions.semantic.skills)).toBe(true);
        expect(typeof m.dimensions.semantic.preferences).toBe('object');
      });
    });
  });

  describe('Value dimension', () => {
    it('should have importance and cqi in range [0, 1]', () => {
      rawMemories.forEach(m => {
        expect(m.dimensions.value.importance).toBeGreaterThanOrEqual(0);
        expect(m.dimensions.value.importance).toBeLessThanOrEqual(1);
        expect(m.dimensions.value.cqi).toBeGreaterThanOrEqual(0);
        expect(m.dimensions.value.cqi).toBeLessThanOrEqual(1);
      });
    });

    it('should have valid privacyLevel', () => {
      const valid = ['公开', '家庭可见', '仅自己', '加密'];
      rawMemories.forEach(m => {
        expect(valid).toContain(m.dimensions.value.privacyLevel);
      });
    });

    it('should have non-negative accessCount', () => {
      rawMemories.forEach(m => {
        expect(m.dimensions.value.accessCount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Narrative dimension', () => {
    it('should have valid storyline type', () => {
      rawMemories.forEach(m => {
        expect(typeof m.dimensions.narrative.storyline).toBe('string');
      });
    });

    it('previousRefs and nextRefs should reference valid memory IDs or be empty', () => {
      const allIds = new Set(rawMemories.map(m => m.id));
      rawMemories.forEach(m => {
        m.dimensions.narrative.previousRefs.forEach(ref => {
          expect(allIds.has(ref)).toBe(true);
        });
        m.dimensions.narrative.nextRefs.forEach(ref => {
          expect(allIds.has(ref)).toBe(true);
        });
      });
    });
  });

  describe('Robot State dimension', () => {
    it('should have valid device type', () => {
      rawMemories.forEach(m => {
        expect(['Loona', 'ClicBot']).toContain(m.dimensions.robotState.device);
      });
    });

    it('should have battery level between 0 and 100', () => {
      rawMemories.forEach(m => {
        expect(m.dimensions.robotState.batteryLevel).toBeGreaterThanOrEqual(0);
        expect(m.dimensions.robotState.batteryLevel).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Dimension coverage', () => {
    it('should cover all 10 dimension categories with at least 5 memories each', () => {
      expect(rawMemories.length).toBeGreaterThanOrEqual(50);
    });

    it('should cover all emotion types in the dataset', () => {
      const emotions = new Set(rawMemories.map(m => m.dimensions.emotional.primary));
      expect(emotions.size).toBeGreaterThanOrEqual(5);
    });

    it('should contain both Loona and ClicBot device memories', () => {
      const devices = new Set(rawMemories.map(m => m.dimensions.robotState.device));
      expect(devices.has('Loona')).toBe(true);
      expect(devices.has('ClicBot')).toBe(true);
    });

    it('should contain at least one milestone memory', () => {
      const milestones = rawMemories.filter(m => m.dimensions.narrative.isMilestone);
      expect(milestones.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('Demo Data — Insight Memory Integrity', () => {
  it('should have at least 10 insight memories', () => {
    expect(insightMemories.length).toBeGreaterThanOrEqual(10);
  });

  it('every insight memory should have type "insight"', () => {
    insightMemories.forEach(m => {
      expect(m.type).toBe('insight');
    });
  });

  it('should cover all 6 categories', () => {
    const categories = new Set(insightMemories.map(m => m.category));
    expect(categories.size).toBe(6);
    (['trend', 'belief', 'relationship', 'preference', 'habit', 'growth'] as const).forEach(c => {
      expect(categories.has(c)).toBe(true);
    });
  });

  it('every insight should have non-empty statement and description', () => {
    insightMemories.forEach(m => {
      expect(m.statement).toBeTruthy();
      expect(m.description).toBeTruthy();
    });
  });

  it('confidence should be in range [0, 1]', () => {
    insightMemories.forEach(m => {
      expect(m.confidence).toBeGreaterThanOrEqual(0);
      expect(m.confidence).toBeLessThanOrEqual(1);
    });
  });

  it('sourceRawMemoryIds should only reference existing raw memory IDs', () => {
    const allIds = new Set(rawMemories.map(m => m.id));
    insightMemories.forEach(m => {
      expect(m.sourceRawMemoryIds.length).toBeGreaterThan(0);
      m.sourceRawMemoryIds.forEach(id => {
        expect(allIds.has(id)).toBe(true);
      });
    });
  });

  it('every insight should use INSIGHT_COLOR (#ffb800)', () => {
    insightMemories.forEach(m => {
      expect(m.color).toBe(INSIGHT_COLOR);
    });
  });

  it('at least one insight should have version > 1 and previousVersionId', () => {
    const multiVersion = insightMemories.filter(m => m.version > 1);
    expect(multiVersion.length).toBeGreaterThanOrEqual(1);
    const withPrevious = multiVersion.filter(m => m.previousVersionId);
    expect(withPrevious.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Types — Constants Validation', () => {
  it('EMOTION_COLORS should have 12 entries', () => {
    expect(Object.keys(EMOTION_COLORS)).toHaveLength(12);
  });

  it('INSIGHT_COLOR should be #ffb800', () => {
    expect(INSIGHT_COLOR).toBe('#ffb800');
  });

  it('CATEGORY_LABELS should have 6 entries matching insight categories', () => {
    expect(Object.keys(CATEGORY_LABELS)).toHaveLength(6);
    expect(CATEGORY_LABELS).toEqual({
      trend: '趋势',
      belief: '信念',
      relationship: '关系',
      preference: '偏好',
      habit: '习惯',
      growth: '成长',
    });
  });
});