import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useAppState } from '../store/AppContext';
import { rawMemories, insightMemories } from '../data/demoData';
import type { RawMemory } from '../types';

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(AppProvider, null, children);
}

describe('Integration — Complete CRUD Flow', () => {
  it('should handle create → select → update → delete flow', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    const newMem: RawMemory = {
      type: 'raw',
      id: 'integration_test_001',
      label: '集成测试记忆',
      summary: '这是一条集成测试创建的完整流程记忆',
      dimensions: {
        temporal: { timestamp: Date.now(), dateType: '节日', timeOfDay: '上午', season: '春', duration: 60 },
        spatial: { placeType: '公园', room: '户外', landmark: '测试地标' },
        social: { persons: ['爸爸', '妈妈'], relationship: ['父子', '母子'], groupInteraction: true, intimacy: 0.9 },
        emotional: { primary: '快乐', intensity: 0.95, trigger: '测试' },
        activity: { type: '游玩', detail: '测试活动' },
        sensory: { images: ['/test.jpg'], audio: [], videos: [], gesture: null },
        semantic: { knowledge: ['测试知识'], preferences: { '测试': '值' }, skills: ['测试技能'] },
        value: { importance: 0.9, cqi: 0.85, accessCount: 0, privacyLevel: '家庭可见' },
        narrative: { storyline: '测试故事线', previousRefs: [], nextRefs: [], isMilestone: true },
        robotState: { device: '机器人助手', batteryLevel: 100, firmwareVersion: '2.1.0' },
      },
      position3D: [1, 2, 3],
      color: '#ffb800',
      size: 1.0,
      positions: {
        '全局视图': [1, 2, 3],
        '家庭视图': [2, 3, 4],
        '学习视图': [3, 4, 5],
        '情绪视图': [4, 5, 6],
      },
    };

    act(() => { result.current.addMemory(newMem); });

    const created = result.current.rawMemories.find(m => m.id === 'integration_test_001');
    expect(created).toBeDefined();
    expect(created!.label).toBe('集成测试记忆');
    expect(created!.dimensions.value.importance).toBe(0.9);
    expect(created!.dimensions.narrative.isMilestone).toBe(true);

    act(() => { result.current.selectMemory(created!); });
    expect(result.current.selectedMemory).toBe(created);
    expect(result.current.detailOpen).toBe(true);

    act(() => { result.current.selectMemory(null); });
    expect(result.current.selectedMemory).toBeNull();
    expect(result.current.detailOpen).toBe(false);

    act(() => { result.current.selectMemory(created!); });

    act(() => { result.current.deleteMemory('integration_test_001'); });
    expect(result.current.rawMemories.find(m => m.id === 'integration_test_001')).toBeUndefined();
    expect(result.current.selectedMemory).toBeNull();
    expect(result.current.detailOpen).toBe(false);
  });
});

describe('Integration — Demo Mode Full Flow', () => {
  it('should complete full demo flow path (7 steps)', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    expect(result.current.demoMode).toBe(false);
    expect(result.current.demoStep).toBe(0);

    act(() => { result.current.setDemoMode(true); });

    expect(result.current.demoMode).toBe(true);
    expect(result.current.demoStep).toBe(1);

    for (let step = 2; step <= 7; step++) {
      act(() => { result.current.setDemoStep(step); });
      expect(result.current.demoStep).toBe(step);
    }

    act(() => { result.current.setDemoMode(false); });
    expect(result.current.demoMode).toBe(false);
    expect(result.current.demoStep).toBe(0);
  });

  it('demo mode should not affect other state directly', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    const initialView = result.current.currentView;
    const mem = result.current.rawMemories[0];
    act(() => { result.current.selectMemory(mem); });

    act(() => { result.current.setDemoMode(true); });
    expect(result.current.selectedMemory).toBe(mem);
    expect(result.current.currentView).toBe(initialView);

    act(() => { result.current.setDemoMode(false); });
    expect(result.current.selectedMemory).toBe(mem);
  });

  it('should be able to re-trigger demo mode', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => { result.current.setDemoMode(true); });
    act(() => { result.current.setDemoStep(4); });
    act(() => { result.current.setDemoMode(false); });

    act(() => { result.current.setDemoMode(true); });
    expect(result.current.demoStep).toBe(1);
  });
});

describe('Integration — View Switching with Memory Selection', () => {
  it('selected memory should persist across view switches', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    const mem = result.current.rawMemories[0];

    act(() => { result.current.selectMemory(mem); });

    act(() => { result.current.setCurrentView('家庭视图'); });
    expect(result.current.selectedMemory).toBe(mem);

    act(() => { result.current.setCurrentView('学习视图'); });
    expect(result.current.selectedMemory).toBe(mem);

    act(() => { result.current.setCurrentView('情绪视图'); });
    expect(result.current.selectedMemory).toBe(mem);
  });

  it('view switching should not affect raw memory list', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    const count = result.current.rawMemories.length;

    act(() => { result.current.setCurrentView('家庭视图'); });
    expect(result.current.rawMemories.length).toBe(count);

    act(() => { result.current.setCurrentView('学习视图'); });
    expect(result.current.rawMemories.length).toBe(count);
  });

  it('all 4 dimension views should have valid positions for every memory', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    ['全局视图', '家庭视图', '学习视图', '情绪视图'].forEach(view => {
      act(() => { result.current.setCurrentView(view as any); });
      expect(result.current.currentView).toBe(view);

      result.current.rawMemories.forEach(mem => {
        const pos = mem.positions[view];
        expect(pos).toBeDefined();
        expect(Array.isArray(pos)).toBe(true);
        expect(pos).toHaveLength(3);
      });
    });
  });
});

describe('Integration — Navigation State Consistency', () => {
  it('nav category change does not automatically clear sub category', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => { result.current.setNavCategory('家庭生活'); });
    act(() => { result.current.setNavSubCategory('快乐时光'); });
    expect(result.current.navCategory).toBe('家庭生活');
    expect(result.current.navSubCategory).toBe('快乐时光');

    act(() => { result.current.setNavCategory('学习与成长'); });
    expect(result.current.navCategory).toBe('学习与成长');
    expect(result.current.navSubCategory).toBe('快乐时光');
  });

  it('setting nav category to null should clear category but leave sub category', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => { result.current.setNavCategory('家庭生活'); });
    act(() => { result.current.setNavSubCategory('快乐时光'); });

    act(() => { result.current.setNavCategory(null); });
    expect(result.current.navCategory).toBeNull();
    expect(result.current.navSubCategory).toBe('快乐时光');
  });

  it('nav selection should not interfere with memory operations', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => { result.current.setNavCategory('家庭生活'); });
    act(() => { result.current.setNavSubCategory('快乐时光'); });

    const mem = result.current.rawMemories[0];
    act(() => { result.current.selectMemory(mem); });
    expect(result.current.selectedMemory).toBe(mem);
    expect(result.current.navCategory).toBe('家庭生活');
    expect(result.current.navSubCategory).toBe('快乐时光');
  });
});

describe('Integration — Chat Panel with Context', () => {
  it('chat panel should toggle independently of detail panel', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => { result.current.toggleChat(); });
    expect(result.current.chatOpen).toBe(true);
    expect(result.current.detailOpen).toBe(false);

    const mem = result.current.rawMemories[0];
    act(() => { result.current.selectMemory(mem); });
    expect(result.current.chatOpen).toBe(true);
    expect(result.current.detailOpen).toBe(true);

    act(() => { result.current.toggleChat(); });
    expect(result.current.chatOpen).toBe(false);
    expect(result.current.detailOpen).toBe(true);
  });

  it('chat panel should not lose state when switching views', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => { result.current.toggleChat(); });
    expect(result.current.chatOpen).toBe(true);

    act(() => { result.current.setCurrentView('家庭视图'); });
    expect(result.current.chatOpen).toBe(true);
  });
});

describe('Integration — CRUD Panel with Memory List', () => {
  it('CRUD panel toggle should not affect memory data', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    const count = result.current.rawMemories.length;

    act(() => { result.current.toggleCrud(); });
    expect(result.current.rawMemories.length).toBe(count);
    expect(result.current.crudOpen).toBe(true);

    act(() => { result.current.toggleCrud(); });
    expect(result.current.rawMemories.length).toBe(count);
    expect(result.current.crudOpen).toBe(false);
  });
});

describe('Integration — Insight Memory with Raw Memory Linking', () => {
  it('deleting a raw memory should not affect insight memory list directly', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    const insightCount = result.current.insightMemories.length;

    const testMem = result.current.rawMemories[0];
    act(() => { result.current.deleteMemory(testMem.id); });

    expect(result.current.insightMemories.length).toBe(insightCount);
  });

  it('selecting an insight memory should show its source raw memories', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    const insight = result.current.insightMemories[0];

    act(() => { result.current.selectMemory(insight); });

    expect(result.current.selectedMemory).toBe(insight);
    expect(result.current.detailOpen).toBe(true);
    expect(insight.sourceRawMemoryIds.length).toBeGreaterThan(0);

    insight.sourceRawMemoryIds.forEach(rawId => {
      const rawMem = result.current.rawMemories.find(m => m.id === rawId);
      expect(rawMem).toBeDefined();
    });
  });
});

describe('Integration — PRD Requirements Compliance', () => {
  it('should meet: at least 50 raw memories', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    expect(result.current.rawMemories.length).toBeGreaterThanOrEqual(50);
  });

  it('should meet: at least 10 insight memories covering 6 categories', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    expect(result.current.insightMemories.length).toBeGreaterThanOrEqual(10);

    const categories = new Set(result.current.insightMemories.map(m => m.category));
    expect(categories.size).toBe(6);
  });

  it('should meet: at least 1 insight with version chain v1→v2→v3', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    const multiVersion = result.current.insightMemories.filter(m => m.version > 1);
    expect(multiVersion.length).toBeGreaterThanOrEqual(3);
  });

  it('should meet: demo mode starts at step 1 and can be stopped', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => { result.current.setDemoMode(true); });
    expect(result.current.demoStep).toBe(1);
    expect(result.current.demoMode).toBe(true);

    act(() => { result.current.setDemoMode(false); });
    expect(result.current.demoMode).toBe(false);
    expect(result.current.demoStep).toBe(0);
  });

  it('should meet: 4 dimension views available', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    const views = ['全局视图', '家庭视图', '学习视图', '情绪视图'] as const;
    views.forEach(view => {
      act(() => { result.current.setCurrentView(view); });
      expect(result.current.currentView).toBe(view);
    });
  });

  it('should meet: CRUD panel supports add and delete', () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    const initialCount = result.current.rawMemories.length;

    const newMem: RawMemory = {
      type: 'raw',
      id: 'prd_test',
      label: 'PRD测试',
      summary: 'PRD合规测试',
      dimensions: {
        temporal: { timestamp: Date.now(), dateType: '普通日', timeOfDay: '上午', season: '夏', duration: 10 },
        spatial: { placeType: '家', room: '客厅', landmark: '.' },
        social: { persons: [], relationship: [], groupInteraction: false, intimacy: 0.1 },
        emotional: { primary: '中性', intensity: 0.5, trigger: '.' },
        activity: { type: '.', detail: '.' },
        sensory: { images: [], audio: [], videos: [] },
        semantic: { knowledge: [], preferences: {}, skills: [] },
        value: { importance: 0.1, cqi: 0.1, accessCount: 0, privacyLevel: '家庭可见' },
        narrative: { storyline: '', previousRefs: [], nextRefs: [], isMilestone: false },
        robotState: { device: '机器人助手', batteryLevel: 80, firmwareVersion: '2.1.0' },
      },
      position3D: [0, 0, 0],
      color: '#888888',
      size: 0.5,
      positions: { '全局视图': [0, 0, 0], '家庭视图': [0, 0, 0], '学习视图': [0, 0, 0], '情绪视图': [0, 0, 0] },
    };

    act(() => { result.current.addMemory(newMem); });
    expect(result.current.rawMemories.length).toBe(initialCount + 1);

    act(() => { result.current.deleteMemory('prd_test'); });
    expect(result.current.rawMemories.length).toBe(initialCount);
  });
});