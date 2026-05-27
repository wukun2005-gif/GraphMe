import type { RawMemory, InsightMemory } from '../types';

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