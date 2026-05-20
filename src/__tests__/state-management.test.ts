import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useAppState } from '../store/AppContext';
import type { RawMemory } from '../types';

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(AppProvider, null, children);
}

function createTestMemory(overrides: Partial<RawMemory> = {}): RawMemory {
  return {
    type: 'raw',
    id: `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    label: '测试记忆',
    summary: '这是一条测试记忆',
    source: 'graphme',
    dimensions: {
      temporal: { timestamp: Date.now(), dateType: '普通日', timeOfDay: '下午', season: '夏', duration: 30 },
      spatial: { placeType: '家', room: '客厅', landmark: '测试' },
      social: { persons: ['测试人'], relationship: ['朋友'], groupInteraction: false, intimacy: 0.5 },
      emotional: { primary: '快乐', intensity: 0.8, trigger: '测试触发' },
      activity: { type: '测试', detail: '测试详情' },
      sensory: { images: [], audio: [], videos: [], interactions: [] },
      semantic: { knowledge: [], preferences: {}, skills: [] },
      value: { importance: 0.5, cqi: 0.5, accessCount: 0, privacyLevel: '家庭可见' },
      narrative: { storyline: '测试故事线', previousRefs: [], nextRefs: [], isMilestone: false },
      agentState: { agentType: '陪伴型', version: '2.1.0', status: 'active' },
    },
    position3D: [0, 0, 0],
    color: '#ffb800',
    size: 0.5,
    positions: {
      '全局视图': [0, 0, 0],
      '家庭视图': [1, 1, 1],
      '学习视图': [2, 2, 2],
      '情绪视图': [3, 3, 3],
    },
    ...overrides,
  };
}

describe('AppContext — Initial State', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    expect(result.current.currentView).toBe('全局视图');
    expect(result.current.selectedMemory).toBeNull();
    expect(result.current.focusedInsight).toBeNull();
    expect(result.current.demoMode).toBe(false);
    expect(result.current.demoStep).toBe(0);
    expect(result.current.chatOpen).toBe(false);
    expect(result.current.detailOpen).toBe(false);
    expect(result.current.navCategory).toBeNull();
    expect(result.current.navSubCategory).toBeNull();
    expect(result.current.crudOpen).toBe(false);
  });

  it('should have initial raw memories loaded from demo data', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    expect(result.current.rawMemories.length).toBeGreaterThanOrEqual(50);
  });

  it('should have initial insight memories loaded from demo data', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    expect(result.current.insightMemories.length).toBeGreaterThanOrEqual(10);
  });

  it('should throw error when useAppState is used outside AppProvider', () => {
    expect(() => renderHook(() => useAppState())).toThrow(
      'useAppState must be used within AppProvider'
    );
  });
});

describe('AppContext — CRUD Operations', () => {
  let initialCount: number;

  beforeEach(() => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    initialCount = result.current.rawMemories.length;
  });

  describe('Create (Add)', () => {
    it('should add a new raw memory', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      const newMem = createTestMemory();

      act(() => {
        result.current.addMemory(newMem);
      });

      expect(result.current.rawMemories.length).toBe(initialCount + 1);
      expect(result.current.rawMemories.find(m => m.id === newMem.id)).toBeDefined();
    });

    it('should add memory with correct type and dimensions', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      const newMem = createTestMemory({
        id: 'mem_test_001',
        label: '自定义记忆',
        summary: '自定义摘要',
      });

      act(() => {
        result.current.addMemory(newMem);
      });

      const added = result.current.rawMemories.find(m => m.id === 'mem_test_001');
      expect(added).toBeDefined();
      expect(added!.type).toBe('raw');
      expect(added!.label).toBe('自定义记忆');
      expect(added!.summary).toBe('自定义摘要');
      expect(added!.dimensions.emotional.primary).toBe('快乐');
      expect(added!.dimensions.value.importance).toBe(0.5);
    });

    it('should handle adding multiple memories sequentially', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });

      act(() => { result.current.addMemory(createTestMemory({ id: 'multi_1' })); });
      act(() => { result.current.addMemory(createTestMemory({ id: 'multi_2' })); });
      act(() => { result.current.addMemory(createTestMemory({ id: 'multi_3' })); });

      expect(result.current.rawMemories.length).toBe(initialCount + 3);
      expect(result.current.rawMemories.find(m => m.id === 'multi_1')).toBeDefined();
      expect(result.current.rawMemories.find(m => m.id === 'multi_2')).toBeDefined();
      expect(result.current.rawMemories.find(m => m.id === 'multi_3')).toBeDefined();
    });
  });

  describe('Delete', () => {
    it('should delete a raw memory by id', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      const testMem = createTestMemory({ id: 'to_delete' });

      act(() => { result.current.addMemory(testMem); });
      expect(result.current.rawMemories.find(m => m.id === 'to_delete')).toBeDefined();

      act(() => { result.current.deleteMemory('to_delete'); });
      expect(result.current.rawMemories.find(m => m.id === 'to_delete')).toBeUndefined();
      expect(result.current.rawMemories.length).toBe(initialCount);
    });

    it('should deselect memory if deleted memory is currently selected', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      const testMem = createTestMemory({ id: 'selected_to_delete' });

      act(() => { result.current.addMemory(testMem); });
      act(() => { result.current.selectMemory(testMem); });
      expect(result.current.selectedMemory).not.toBeNull();
      expect(result.current.selectedMemory!.id).toBe('selected_to_delete');
      expect(result.current.detailOpen).toBe(true);

      act(() => { result.current.deleteMemory('selected_to_delete'); });
      expect(result.current.selectedMemory).toBeNull();
      expect(result.current.detailOpen).toBe(false);
    });

    it('should not affect state when deleting non-existent id', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      const countBefore = result.current.rawMemories.length;

      act(() => { result.current.deleteMemory('non_existent_id'); });

      expect(result.current.rawMemories.length).toBe(countBefore);
    });

    it('should not crash when deleting from empty list', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      const testMem = createTestMemory({ id: 'only_one' });

      act(() => { result.current.addMemory(testMem); });
      act(() => { result.current.deleteMemory('only_one'); });
      act(() => { result.current.deleteMemory('only_one'); }); // double delete

      expect(result.current.rawMemories.find(m => m.id === 'only_one')).toBeUndefined();
    });
  });

  describe('Read (Select & Detail)', () => {
    it('should select a memory and open detail panel', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      const mem = result.current.rawMemories[0];

      act(() => { result.current.selectMemory(mem); });

      expect(result.current.selectedMemory).toBe(mem);
      expect(result.current.detailOpen).toBe(true);
    });

    it('should deselect memory and close detail panel when passing null', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      const mem = result.current.rawMemories[0];

      act(() => { result.current.selectMemory(mem); });
      expect(result.current.detailOpen).toBe(true);

      act(() => { result.current.selectMemory(null); });
      expect(result.current.selectedMemory).toBeNull();
      expect(result.current.detailOpen).toBe(false);
    });

    it('should select an insight memory', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      const insight = result.current.insightMemories[0];

      act(() => { result.current.selectMemory(insight); });

      expect(result.current.selectedMemory).toBe(insight);
      expect(result.current.detailOpen).toBe(true);
    });

    it('should toggle detail panel independently', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });

      act(() => { result.current.toggleDetail(); });
      expect(result.current.detailOpen).toBe(true);

      act(() => { result.current.toggleDetail(); });
      expect(result.current.detailOpen).toBe(false);
    });

    it('should focus insight', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      const insight = result.current.insightMemories[0];

      act(() => { result.current.focusInsight(insight); });
      expect(result.current.focusedInsight).toBe(insight);

      act(() => { result.current.focusInsight(null); });
      expect(result.current.focusedInsight).toBeNull();
    });
  });

  describe('getVisibleMemories', () => {
    it('should return all raw memories', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      const visible = result.current.getVisibleMemories();
      expect(visible).toEqual(result.current.rawMemories);
    });
  });
});

describe('AppContext — View Switching', () => {
  it('should switch to different dimension views', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    expect(result.current.currentView).toBe('全局视图');

    act(() => { result.current.setCurrentView('家庭视图'); });
    expect(result.current.currentView).toBe('家庭视图');

    act(() => { result.current.setCurrentView('学习视图'); });
    expect(result.current.currentView).toBe('学习视图');

    act(() => { result.current.setCurrentView('情绪视图'); });
    expect(result.current.currentView).toBe('情绪视图');

    act(() => { result.current.setCurrentView('全局视图'); });
    expect(result.current.currentView).toBe('全局视图');
  });
});

describe('AppContext — Demo Mode', () => {
  it('should start demo mode and set step to 1', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => { result.current.setDemoMode(true); });

    expect(result.current.demoMode).toBe(true);
    expect(result.current.demoStep).toBe(1);
  });

  it('should stop demo mode and reset step to 0', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => { result.current.setDemoMode(true); });
    act(() => { result.current.setDemoMode(false); });

    expect(result.current.demoMode).toBe(false);
    expect(result.current.demoStep).toBe(0);
  });

  it('should allow manually setting demo step', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => { result.current.setDemoStep(3); });
    expect(result.current.demoStep).toBe(3);

    act(() => { result.current.setDemoStep(7); });
    expect(result.current.demoStep).toBe(7);
  });
});

describe('AppContext — Chat Panel', () => {
  it('should toggle chat open state', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    expect(result.current.chatOpen).toBe(false);

    act(() => { result.current.toggleChat(); });
    expect(result.current.chatOpen).toBe(true);

    act(() => { result.current.toggleChat(); });
    expect(result.current.chatOpen).toBe(false);
  });
});

describe('AppContext — Navigation', () => {
  it('should set and clear nav category', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => { result.current.setNavCategory('家庭生活'); });
    expect(result.current.navCategory).toBe('家庭生活');

    act(() => { result.current.setNavCategory(null); });
    expect(result.current.navCategory).toBeNull();
  });

  it('should set and clear nav sub category', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => { result.current.setNavSubCategory('快乐时光'); });
    expect(result.current.navSubCategory).toBe('快乐时光');

    act(() => { result.current.setNavSubCategory(null); });
    expect(result.current.navSubCategory).toBeNull();
  });
});

describe('AppContext — CRUD Panel', () => {
  it('should toggle CRUD panel', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    expect(result.current.crudOpen).toBe(false);

    act(() => { result.current.toggleCrud(); });
    expect(result.current.crudOpen).toBe(true);

    act(() => { result.current.toggleCrud(); });
    expect(result.current.crudOpen).toBe(false);
  });
});