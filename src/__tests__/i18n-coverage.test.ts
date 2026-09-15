import { describe, it, expect } from 'vitest';
import { rawMemories, insightMemories } from '../data/demoData';
import { chatgptRawMemories, chatgptInsightMemories } from '../data/chatgptData';
import { localizeRawMemories, localizeInsightMemories } from '../i18n/localize';
import { registerRuntimeMemoryEn, memoryLabelT, memorySummaryT, storylineNameT } from '../i18n/memoryData';
import { contentT } from '../i18n/dataTranslations';
import type { RawMemory } from '../types';

/**
 * 英文模式下的中文残留回归测试。
 *
 * 这是「英文模式仍有中文」问题的最终防线：直接在运行时本地化真实数据，
 * 再深度遍历所有字符串字段，任何残留中文都会让测试失败并打印具体位置。
 * 新增中文数据时，只要字典未登记，这里就会立刻暴露。
 */

const HAN = /[\u4e00-\u9fff]/;

/**
 * 豁免：枚举字段被业务逻辑依赖（配色/筛选/emoji），必须保持中文原值。
 * 它们的显示由渲染层的 xxxT() 负责，不属于本测试的覆盖范围。
 */
const ENUM_EXEMPT = new Set([
  'dateType',
  'timeOfDay',
  'season',
  'placeType',
  'primary',
  'privacyLevel',
  'agentType',
]);

/**
 * 按路径豁免：仅豁免 dimensions.activity.type。
 * 这里用完整路径而非键名，是因为 RawMemory 顶层也有一个 type 字段（值为 'raw'），
 * 按键名豁免会误伤。
 */
const PATH_EXEMPT_SUFFIX = ['dimensions.activity.type'];

/**
 * 深度收集对象中所有带中文的字符串。
 * @param node 当前节点
 * @param path 用于定位的路径，形如 "mem_001.dimensions.social.persons[0]"
 * @param key 当前节点对应的键名（用于枚举豁免与 positions key 豁免）
 */
function collectChinese(node: unknown, path: string, key: string, out: { path: string; value: string }[]): void {
  if (typeof node === 'string') {
    if (PATH_EXEMPT_SUFFIX.some(s => path.endsWith(s))) return;
    if (HAN.test(node)) out.push({ path, value: node });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => collectChinese(item, `${path}[${i}]`, key, out));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (ENUM_EXEMPT.has(k)) continue;
      collectChinese(v, `${path}.${k}`, k, out);
    }
  }
}

/** 收集一条记忆中的残留中文（自动跳过 positions 与枚举字段） */
function findResidue(mem: unknown, id: string): { path: string; value: string }[] {
  const out: { path: string; value: string }[] = [];
  const obj = mem as Record<string, unknown>;
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'positions') continue; // 内部视图标识符，不显示
    if (ENUM_EXEMPT.has(k)) continue;
    collectChinese(v, `${id}.${k}`, k, out);
  }
  return out;
}

describe('英文模式：数据层不应残留中文', () => {
  it('rawMemories 全部字段（除枚举外）应完成本地化', () => {
    const localized = localizeRawMemories('en', [...rawMemories, ...chatgptRawMemories]);
    const residue = localized.flatMap(m => findResidue(m, m.id));

    if (residue.length > 0) {
      const uniq = [...new Set(residue.map(r => `${r.path} => ${r.value}`))];
      // eslint-disable-next-line no-console
      console.error(`残留 ${residue.length} 处（去重 ${uniq.length}）：\n` + uniq.slice(0, 60).join('\n'));
    }
    expect(residue).toEqual([]);
  });

  it('insightMemories 全部字段（除枚举外）应完成本地化', () => {
    const localized = localizeInsightMemories('en', [...insightMemories, ...chatgptInsightMemories]);
    const residue = localized.flatMap(m => findResidue(m, m.id));

    if (residue.length > 0) {
      const uniq = [...new Set(residue.map(r => `${r.path} => ${r.value}`))];
      // eslint-disable-next-line no-console
      console.error(`残留 ${residue.length} 处（去重 ${uniq.length}）：\n` + uniq.slice(0, 60).join('\n'));
    }
    expect(residue).toEqual([]);
  });

  it('中文模式下数据应保持原样（不被误改）', () => {
    const zh = localizeRawMemories('zh-CN', rawMemories);
    expect(zh).toBe(rawMemories); // zh-CN 直接返回原引用，零开销
    expect(zh[0].label).toBe(rawMemories[0].label);
  });

  it('本地化不得破坏业务逻辑依赖的枚举字段', () => {
    const localized = localizeRawMemories('en', rawMemories);
    for (let i = 0; i < rawMemories.length; i++) {
      const src = rawMemories[i];
      const dst = localized[i];
      // 情绪、地点类型必须保持原值，否则 EMOTION_COLORS 取色与分类筛选会失效
      expect(dst.dimensions.emotional.primary).toBe(src.dimensions.emotional.primary);
      expect(dst.dimensions.spatial.placeType).toBe(src.dimensions.spatial.placeType);
      expect(dst.dimensions.temporal.season).toBe(src.dimensions.temporal.season);
      // activity.type 被 memoryBankUtils / confusionUtils / similarityUtils 当作枚举判断依据
      expect(dst.dimensions.activity.type).toBe(src.dimensions.activity.type);
      // 位置数据必须完全一致，否则 3D 布局会漂移
      expect(dst.position3D).toEqual(src.position3D);
      expect(dst.positions).toEqual(src.positions);
    }
  });

  // ======================================================================
  // 导入记忆（import_*）：运行时生成、不存在于静态字典，靠内容字典兜底。
  // 对应用户报告的 import_9002 场景。
  // ======================================================================
  const IMPORT_SENTENCE = '读完了《三体》第一部，被黑暗森林法则震撼到了，开始思考宇宙的奥秘。';

  const importedMemory: RawMemory = {
    type: 'raw',
    source: 'graphme',
    id: 'import_9002',
    label: IMPORT_SENTENCE,
    summary: IMPORT_SENTENCE,
    dimensions: {
      temporal: { timestamp: Date.now(), dateType: '普通日', timeOfDay: '下午', season: '夏', duration: 30 },
      spatial: { placeType: '其他', room: '未知', landmark: '导入' },
      social: { persons: [], relationship: [], groupInteraction: false, intimacy: 0.3 },
      emotional: { primary: '好奇', intensity: 0.7, trigger: '导入' },
      activity: { type: '活动', detail: IMPORT_SENTENCE },
      sensory: { images: [], audio: [], videos: [], interactions: [] },
      semantic: { knowledge: ['黑暗森林法则', '科幻文学'], preferences: {}, skills: [] },
      value: { importance: 0.5, cqi: 0.2, accessCount: 0, privacyLevel: '家庭可见' },
      narrative: { storyline: '科幻兴趣', previousRefs: [], nextRefs: [], isMilestone: false },
      agentState: { agentType: '陪伴型', version: '2.1.0', status: 'active' },
    },
    position3D: [0, 0, 0],
    positions: { '全局视图': [0, 0, 0] },
    color: '#888888',
    size: 0.5,
  };

  it('导入记忆的字段（label/summary/detail/占位符/知识/故事线）应完成本地化', () => {
    const [en] = localizeRawMemories('en', [importedMemory]);

    // 内容字段
    expect(en.label).not.toMatch(HAN);
    expect(en.summary).not.toMatch(HAN);
    expect(en.dimensions.activity.detail).not.toMatch(HAN);
    expect(en.dimensions.semantic.knowledge).toEqual(['Dark Forest theory', 'sci-fi literature']);
    expect(en.dimensions.narrative.storyline).toBe('Sci-Fi Interest');

    // 系统占位符（'导入' / '未知'）不得以中文露出
    expect(contentT('en', en.dimensions.spatial.landmark)).toBe('Imported');
    expect(contentT('en', en.dimensions.spatial.room)).toBe('Unknown');
    expect(contentT('en', en.dimensions.emotional.trigger)).toBe('Imported');

    // 残留断言：除枚举豁免外不得有中文
    const residue = findResidue(en, en.id);
    if (residue.length > 0) {
      // eslint-disable-next-line no-console
      console.error('导入记忆残留：\n' + residue.map(r => `${r.path} => ${r.value}`).join('\n'));
    }
    expect(residue).toEqual([]);
  });

  it('导入记忆携带英文字段（labelEn/summaryEn）时优先使用', () => {
    registerRuntimeMemoryEn('import_en_test', 'Read Three-Body', 'Imported via runtime registration');
    expect(memoryLabelT('en', 'import_en_test', '中文标题')).toBe('Read Three-Body');
    expect(memorySummaryT('en', 'import_en_test', '中文摘要')).toBe('Imported via runtime registration');
    // 中文模式不受影响
    expect(memoryLabelT('zh-CN', 'import_en_test', '中文标题')).toBe('中文标题');
  });

  it('storylineNameT 覆盖导入常见故事线', () => {
    expect(storylineNameT('en', '科幻兴趣')).toBe('Sci-Fi Interest');
  });
});
