import type { RawMemory, InsightMemory, EmotionType } from '../types';
import { EMOTION_COLORS } from '../types';

export interface ImportResult {
  rawMemories: RawMemory[];
  insightMemories: InsightMemory[];
  errors: string[];
}

const VALID_PLACE_TYPES = ['家', '学校', '公园', '商场', '游乐场', '其他'];
const VALID_EMOTIONS: EmotionType[] = [
  '快乐', '悲伤', '愤怒', '惊讶', '恐惧', '厌恶', '中性',
  '好奇', '骄傲', '沮丧', '感激', '思念',
];

function isValidEmotion(e: string): e is EmotionType {
  return VALID_EMOTIONS.includes(e as EmotionType);
}

let importIdCounter = Date.now();

function parseRawMemory(item: any, index: number): { memory: RawMemory | null; error: string | null } {
  if (!item.label || typeof item.label !== 'string') {
    return { memory: null, error: `Item ${index}: missing or invalid "label"` };
  }
  if (!item.summary || typeof item.summary !== 'string') {
    return { memory: null, error: `Item ${index}: missing or invalid "summary"` };
  }

  const emotion: EmotionType = isValidEmotion(item.emotion) ? item.emotion : '中性';
  const placeType = VALID_PLACE_TYPES.includes(item.placeType) ? item.placeType : '其他';
  const importance = typeof item.importance === 'number' ? Math.max(0, Math.min(1, item.importance)) : 0.5;
  const persons = Array.isArray(item.persons) ? item.persons.filter((p: any) => typeof p === 'string') : [];

  const id = item.id || `import_${importIdCounter++}`;
  const x = (Math.random() * 6 - 3);
  const y = (Math.random() * 3 - 1.5);
  const z = (Math.random() * 4 - 2);

  const memory: RawMemory = {
    type: 'raw',
    id,
    label: item.label,
    summary: item.summary,
    source: 'graphme',
    dimensions: {
      temporal: {
        timestamp: typeof item.timestamp === 'number' ? item.timestamp : Date.now(),
        dateType: '普通日',
        timeOfDay: '下午',
        season: '夏',
        duration: 30,
      },
      spatial: { placeType, room: '未知', landmark: item.landmark || '导入' },
      social: { persons, relationship: [], groupInteraction: persons.length > 1, intimacy: 0.3 },
      emotional: { primary: emotion, intensity: typeof item.emotionalIntensity === 'number' ? item.emotionalIntensity : 0.7, trigger: '导入' },
      activity: { type: item.activityType || '活动', detail: item.summary },
      sensory: { images: [], audio: [], videos: [], interactions: [] },
      semantic: { knowledge: Array.isArray(item.knowledge) ? item.knowledge : [], preferences: {}, skills: [] },
      value: { importance, cqi: 0.2, accessCount: 0, privacyLevel: '家庭可见' },
      narrative: { storyline: item.storyline || '', previousRefs: [], nextRefs: [], isMilestone: false },
      agentState: { agentType: '陪伴型', version: '2.1.0', status: 'active' },
    },
    position3D: [x, y, z],
    color: EMOTION_COLORS[emotion],
    size: 0.5,
    positions: {
      '全局视图': [x, y, z],
      '家庭视图': [(x + 3) % 10 - 5, (y + 2) % 6 - 3, (z + 3) % 8 - 4],
      '学习视图': [x * 0.7, y * 0.6, z * 0.7],
      '情绪视图': [x * 0.7, y * 0.6, z * 0.7],
    },
  };

  return { memory, error: null };
}

function parseInsightMemory(item: any, index: number): { memory: InsightMemory | null; error: string | null } {
  if (!item.statement || typeof item.statement !== 'string') {
    return { memory: null, error: `Insight ${index}: missing or invalid "statement"` };
  }

  const validCategories = ['trend', 'belief', 'relationship', 'preference', 'habit', 'growth'];
  const category = validCategories.includes(item.category) ? item.category : 'belief';

  const id = item.id || `insight_import_${importIdCounter++}`;
  const x = (Math.random() * 4 - 2);
  const y = (Math.random() * 2 - 1);
  const z = (Math.random() * 3 - 1.5);

  const memory: InsightMemory = {
    type: 'insight',
    id,
    source: 'graphme',
    category: category as InsightMemory['category'],
    statement: item.statement,
    description: item.description || '',
    confidence: typeof item.confidence === 'number' ? Math.max(0, Math.min(1, item.confidence)) : 0.7,
    sourceRawMemoryIds: Array.isArray(item.sourceIds) ? item.sourceIds : [],
    reasoningTrace: item.reasoningTrace || '导入',
    version: 1,
    generatedAt: Date.now(),
    updatedAt: Date.now(),
    userConfirmed: false,
    position3D: [x, y, z],
    color: '#ffb800',
    size: 0.6,
  };

  return { memory, error: null };
}

export function parseImportJSON(jsonString: string): ImportResult {
  const result: ImportResult = { rawMemories: [], insightMemories: [], errors: [] };

  let data: any;
  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    console.debug?.('[ImportUtils] JSON parse failed:', e);
    result.errors.push('无效的 JSON 格式');
    return result;
  }

  if (Array.isArray(data)) {
    data = { rawMemories: data };
  }

  if (data.rawMemories && Array.isArray(data.rawMemories)) {
    for (let i = 0; i < data.rawMemories.length; i++) {
      const { memory, error } = parseRawMemory(data.rawMemories[i], i);
      if (error) result.errors.push(error);
      else if (memory) result.rawMemories.push(memory);
    }
  }

  if (data.insightMemories && Array.isArray(data.insightMemories)) {
    for (let i = 0; i < data.insightMemories.length; i++) {
      const { memory, error } = parseInsightMemory(data.insightMemories[i], i);
      if (error) result.errors.push(error);
      else if (memory) result.insightMemories.push(memory);
    }
  }

  if (result.rawMemories.length === 0 && result.insightMemories.length === 0 && result.errors.length === 0) {
    result.errors.push('JSON 中未找到有效的记忆数据（需要 rawMemories 或 insightMemories 数组）');
  }

  return result;
}
