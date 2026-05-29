export interface RawMemoryDimensions {
  temporal: {
    timestamp: number;
    dateType: '普通日' | '周末' | '节日' | '生日' | '纪念日';
    timeOfDay: '清晨' | '上午' | '下午' | '傍晚' | '深夜';
    season: '春' | '夏' | '秋' | '冬';
    duration: number;
  };
  spatial: {
    placeType: '家' | '学校' | '公园' | '商场' | '游乐场' | '其他';
    room: string;
    landmark: string;
  };
  social: {
    persons: string[];
    relationship: string[];
    groupInteraction: boolean;
    intimacy: number;
  };
  emotional: {
    primary:
      | '快乐' | '悲伤' | '愤怒' | '惊讶' | '恐惧' | '厌恶' | '中性'
      | '好奇' | '骄傲' | '沮丧' | '感激' | '思念';
    intensity: number;
    trigger: string;
  };
  activity: {
    type: string;
    detail: string;
  };
  sensory: {
    images: string[];
    audio: string[];
    videos: string[];
    interactions?: string[];
  };
  semantic: {
    knowledge: string[];
    preferences: Record<string, string>;
    skills: string[];
  };
  value: {
    importance: number;
    cqi: number;
    accessCount: number;
    privacyLevel: '公开' | '家庭可见' | '仅自己' | '加密';
  };
  narrative: {
    storyline: string;
    previousRefs: string[];
    nextRefs: string[];
    isMilestone: boolean;
  };
  agentState: {
    agentType: '陪伴型' | '构建型';
    version: string;
    status: string;
  };
}

export interface RawMemory {
  type: 'raw';
  id: string;
  label: string;
  summary: string;
  source: 'graphme' | 'chatgpt';
  dimensions: RawMemoryDimensions;
  position3D: [number, number, number];
  positions: Record<string, [number, number, number]>;
  color: string;
  size: number;
  tags?: string[];
}

export interface InsightMemory {
  type: 'insight';
  id: string;
  source: 'graphme' | 'chatgpt';
  category: 'trend' | 'belief' | 'relationship' | 'preference' | 'habit' | 'growth';
  statement: string;
  description: string;
  confidence: number;
  sourceRawMemoryIds: string[];
  reasoningTrace: string;
  version: number;
  previousVersionId?: string;
  generatedAt: number;
  updatedAt: number;
  deprecatedAt?: number;
  userConfirmed: boolean;
  userCorrection?: string;
  userNote?: string;
  position3D: [number, number, number];
  color: string;
  size: number;
}

export type MemoryNode = RawMemory | InsightMemory;

export type EmotionType = RawMemoryDimensions['emotional']['primary'];

export const EMOTION_COLORS: Record<EmotionType, string> = {
  '快乐': '#ffb800',
  '悲伤': '#4488ff',
  '愤怒': '#ff4444',
  '惊讶': '#ffbb00',
  '恐惧': '#9944ff',
  '厌恶': '#88aa44',
  '中性': '#888888',
  '好奇': '#00f2ff',
  '骄傲': '#cc44ff',
  '沮丧': '#4466aa',
  '感激': '#44ccaa',
  '思念': '#cc88ff',
};

export const INSIGHT_COLOR = '#ffb800';

export const CATEGORY_LABELS: Record<InsightMemory['category'], string> = {
  trend: '趋势',
  belief: '信念',
  relationship: '关系',
  preference: '偏好',
  habit: '习惯',
  growth: '成长',
};

export type DimensionView = '家庭视图' | '学习视图' | '情绪视图' | '全局视图';

export interface MemoryCollection {
  id: string;
  name: string;
  emoji: string;
  memoryIds: string[];
  createdAt: number;
}

export interface DimensionViewConfig {
  id: DimensionView;
  label: string;
  icon: string;
  description: string;
}

export interface FarewellRecord {
  id: string;
  memoryLabel: string;
  memorySummary: string;
  farewellNote: string;
  releaseStyle: '深海' | '星光' | '微风';
  releasedAt: number;
}

export interface TimeCapsule {
  id: string;
  memoryId: string;
  sealedAt: number;
  unlockDate: number;
  note: string;
  opened: boolean;
}

export interface ConstellationConnection {
  fromId: string;
  toId: string;
  color: string;
  label: string;
}

export interface Constellation {
  id: string;
  name: string;
  connections: ConstellationConnection[];
  createdAt: number;
}

export interface ColorPreset {
  id: string;
  name: string;
  colors: Record<EmotionType, string>;
}