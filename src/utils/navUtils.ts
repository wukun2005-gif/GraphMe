import type { RawMemory, InsightMemory } from '../types';
import type { Language } from '../i18n';
import {
  contentT,
  joinContentT,
  emotionNameT,
  dateTypeT,
  timeOfDayT,
  categoryT,
} from '../i18n/dataTranslations';
import { memoryLabelT, insightStatementT, storylineNameT } from '../i18n/memoryData';

export interface CategoryPath {
  category: string;
  categoryIcon: string;
  subCategory: string;
  subCategoryIcon: string;
}

const NAV_STRUCTURE: Record<string, { icon: string; sub: { id: string; icon: string }[] }> = {
  '家庭生活': { icon: '🏠', sub: [
    { id: '快乐时光', icon: '😊' },
    { id: '父子协作', icon: '🔧' },
    { id: '日常生活', icon: '📋' },
  ]},
  '学习与成长': { icon: '🎓', sub: [
    { id: '编程学习', icon: '💻' },
    { id: '数学学习', icon: '🔢' },
    { id: '阅读习惯', icon: '📚' },
  ]},
  '社交与情感': { icon: '👥', sub: [
    { id: '朋友互动', icon: '🤝' },
    { id: '情感表达', icon: '💭' },
  ]},
  '兴趣与探索': { icon: '🔍', sub: [
    { id: '户外活动', icon: '🏃' },
    { id: '科幻兴趣', icon: '🚀' },
  ]},
};

export const CATEGORY_PLACE_MAP: Record<string, string[]> = {
  '家庭生活': ['家', '客厅', '卧室', '厨房', '阳台', '花园'],
  '学习与成长': ['学校', '书房', '教室', '图书馆'],
  '社交与情感': ['公园', '商场', '游乐场'],
  '兴趣与探索': ['公园', '游乐场', '其他'],
};

export const SUBCATEGORY_PLACE_MAP: Record<string, string[]> = {
  '快乐时光': ['游乐场', '公园'],
  '父子协作': ['家'],
  '日常生活': ['家', '客厅', '卧室', '厨房', '阳台'],
  '编程学习': ['学校', '家'],
  '数学学习': ['学校'],
  '阅读习惯': ['家', '学校'],
  '朋友互动': ['公园', '商场', '游乐场'],
  '情感表达': ['家', '公园'],
  '户外活动': ['公园', '游乐场'],
  '科幻兴趣': ['家', '其他'],
};

export function isMemoryInCategory(mem: RawMemory, category: string, subCategory: string | null): boolean {
  if (mem.source === 'chatgpt') return true;
  if (subCategory) {
    const subPlaces = SUBCATEGORY_PLACE_MAP[subCategory];
    if (!subPlaces) return false;
    return subPlaces.includes(mem.dimensions.spatial.placeType);
  }
  const places = CATEGORY_PLACE_MAP[category];
  if (!places || !places.includes(mem.dimensions.spatial.placeType)) return false;
  return true;
}

export function getMemoryCategoryPaths(
  memory: RawMemory | InsightMemory,
  allRawMemories: RawMemory[]
): CategoryPath[] {
  const dedup = new Set<string>();
  const allPaths: CategoryPath[] = [];

  let rawMems: RawMemory[];
  if (memory.type === 'raw') {
    rawMems = [memory];
  } else {
    rawMems = allRawMemories.filter(m => memory.sourceRawMemoryIds.includes(m.id));
  }

  for (const rawMem of rawMems) {
    const placeType = rawMem.dimensions.spatial.placeType;
    for (const [category, places] of Object.entries(CATEGORY_PLACE_MAP)) {
      if (!places.includes(placeType)) continue;
      const catDef = NAV_STRUCTURE[category];
      if (!catDef) continue;
      for (const sub of catDef.sub) {
        const subPlaces = SUBCATEGORY_PLACE_MAP[sub.id];
        if (subPlaces && subPlaces.includes(placeType)) {
          const key = `${category}/${sub.id}`;
          if (!dedup.has(key)) {
            dedup.add(key);
            allPaths.push({
              category,
              categoryIcon: catDef.icon,
              subCategory: sub.id,
              subCategoryIcon: sub.icon,
            });
          }
        }
      }
    }
  }

  return allPaths;
}

export interface HiddenConnection {
  memoryA: RawMemory;
  memoryB: RawMemory;
  description: string;
}

export function findHiddenConnection(memories: RawMemory[], lang: Language = 'zh-CN'): HiddenConnection | null {
  if (memories.length < 2) return null;

  const lab = (m: RawMemory) => memoryLabelT(lang, m.id, m.label);
  const place = (m: RawMemory) => contentT(lang, m.dimensions.spatial.landmark || m.dimensions.spatial.placeType);

  // Try to find two memories from different categories with shared connections
  const shuffled = [...memories].sort(() => Math.random() - 0.5);

  for (let i = 0; i < shuffled.length; i++) {
    for (let j = i + 1; j < Math.min(shuffled.length, i + 10); j++) {
      const a = shuffled[i];
      const b = shuffled[j];

      // Same category → skip
      const catA = isMemoryInCategory(a, '', null);
      const catB = isMemoryInCategory(b, '', null);

      // Check shared persons
      const sharedPersons = a.dimensions.social.persons.filter(p =>
        b.dimensions.social.persons.includes(p)
      );

      // Check same day of week (both on weekends, etc.)
      const dateA = new Date(a.dimensions.temporal.timestamp);
      const dateB = new Date(b.dimensions.temporal.timestamp);
      const sameDayType = a.dimensions.temporal.dateType === b.dimensions.temporal.dateType && a.dimensions.temporal.dateType !== '普通日';

      // Check same time of day
      const sameTimeOfDay = a.dimensions.temporal.timeOfDay === b.dimensions.temporal.timeOfDay;

      // Check same place type
      const samePlace = a.dimensions.spatial.placeType === b.dimensions.spatial.placeType;

      if (sharedPersons.length > 0) {
        return {
          memoryA: a,
          memoryB: b,
          description: lang === 'en'
            ? `Did you know? "${lab(a)}" and "${lab(b)}" both had ${joinContentT(lang, sharedPersons)} present — in ${place(a)} and ${place(b)} respectively.`
            : `你知道吗？「${a.label}」和「${b.label}」都有${sharedPersons.join('和')}在场，而且分别在${a.dimensions.spatial.landmark || a.dimensions.spatial.placeType}和${b.dimensions.spatial.landmark || b.dimensions.spatial.placeType}。`,
        };
      }

      if (sameDayType && sameTimeOfDay) {
        return {
          memoryA: a,
          memoryB: b,
          description: lang === 'en'
            ? `A fun coincidence — "${lab(a)}" and "${lab(b)}" both happened on a ${dateTypeT(lang, a.dimensions.temporal.dateType)} ${timeOfDayT(lang, a.dimensions.temporal.timeOfDay)}. Different places (${contentT(lang, a.dimensions.spatial.placeType)} vs ${contentT(lang, b.dimensions.spatial.placeType)}), but the timing rhythm is remarkably similar.`
            : `有趣的巧合——「${a.label}」和「${b.label}」都发生在${a.dimensions.temporal.dateType}的${a.dimensions.temporal.timeOfDay}，虽然地点不同（${a.dimensions.spatial.placeType} vs ${b.dimensions.spatial.placeType}），但时间节奏惊人地相似。`,
        };
      }

      if (samePlace && a.dimensions.emotional.primary !== b.dimensions.emotional.primary) {
        return {
          memoryA: a,
          memoryB: b,
          description: lang === 'en'
            ? `Same place, different moods — at ${contentT(lang, a.dimensions.spatial.placeType)}, you felt ${emotionNameT(lang, a.dimensions.emotional.primary)} during "${lab(a)}", but ${emotionNameT(lang, b.dimensions.emotional.primary)} during "${lab(b)}".`
            : `同一个地方，两种心情——在${a.dimensions.spatial.placeType}，「${a.label}」时感到${a.dimensions.emotional.primary}，而「${b.label}」时却是${b.dimensions.emotional.primary}。`,
        };
      }
    }
  }

  // Fallback: pick any two different-category memories
  if (shuffled.length >= 2) {
    const a = shuffled[0];
    const b = shuffled[1];
    return {
      memoryA: a,
      memoryB: b,
      description: lang === 'en'
        ? `An unexpected connection — "${lab(a)}" (${emotionNameT(lang, a.dimensions.emotional.primary)}) and "${lab(b)}" (${emotionNameT(lang, b.dimensions.emotional.primary)}). Seemingly unrelated, but both are shining stars in your memory nebula.`
        : `意外的连接——「${a.label}」（${a.dimensions.emotional.primary}）和「${b.label}」（${b.dimensions.emotional.primary}），虽然看似无关，但都是你记忆星云中闪亮的星。`,
    };
  }

  return null;
}

// ─── Memory Connections (Feature #60) ───

export interface MemoryConnection {
  id: string;
  label: string;
  type: 'insight' | 'storyline' | 'person';
  detail: string;
  memory: RawMemory | InsightMemory;
}

export function getMemoryConnections(
  memoryId: string,
  rawMemories: RawMemory[],
  insightMemories: InsightMemory[],
  lang: Language = 'zh-CN',
): MemoryConnection[] {
  const target = rawMemories.find(m => m.id === memoryId);
  if (!target) return [];

  const connections: MemoryConnection[] = [];

  // 1. Insight connections: insights that reference this memory
  for (const ins of insightMemories) {
    if (ins.sourceRawMemoryIds.includes(memoryId)) {
      connections.push({
        id: ins.id,
        label: insightStatementT(lang, ins.id, ins.statement),
        type: 'insight',
        detail: lang === 'en' ? `${categoryT(lang, ins.category)} insight` : `${ins.category}洞察`,
        memory: ins,
      });
    }
  }

  // 2. Storyline connections: same storyline, different memory
  const storyline = target.dimensions.narrative.storyline;
  if (storyline) {
    const sameStory = rawMemories.filter(
      m => m.id !== memoryId && m.dimensions.narrative.storyline === storyline
    );
    for (const m of sameStory) {
      connections.push({
        id: m.id,
        label: memoryLabelT(lang, m.id, m.label),
        type: 'storyline',
        detail: lang === 'en' ? `Same storyline "${storylineNameT(lang, storyline)}"` : `同故事线"${storyline}"`,
        memory: m,
      });
    }
  }

  // 3. Person connections: shared persons, different memory
  const persons = target.dimensions.social.persons;
  if (persons.length > 0) {
    const personMems = rawMemories.filter(
      m => m.id !== memoryId &&
        m.dimensions.social.persons.some(p => persons.includes(p)) &&
        !connections.some(c => c.id === m.id) // exclude already added
    );
    for (const m of personMems.slice(0, 5)) {
      const shared = m.dimensions.social.persons.filter(p => persons.includes(p));
      connections.push({
        id: m.id,
        label: memoryLabelT(lang, m.id, m.label),
        type: 'person',
        detail: lang === 'en' ? `with ${joinContentT(lang, shared)}` : `和${shared.join('、')}在一起`,
        memory: m,
      });
    }
  }

  return connections;
}