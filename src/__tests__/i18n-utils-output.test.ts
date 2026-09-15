import { describe, it, expect } from 'vitest';
import { rawMemories, insightMemories } from '../data/demoData';
import { chatgptRawMemories, chatgptInsightMemories } from '../data/chatgptData';
import en from '../i18n/locales/en.json';
import type { Language } from '../i18n';
import { localizeRawMemories, localizeInsightMemories } from '../i18n/localize';

// 动态文本生成函数（均接收 lang 参数）
import { generateFirstPersonNarrative } from '../utils/narrativeUtils';
import { computeAnnualStats, computeDailyTrajectories, computeDiff } from '../utils/valueUtils';
import { generateSocialGraph } from '../utils/socialUtils';
import { computeSensoryProfile } from '../utils/sensoryUtils';
import { buildPreferenceTrees } from '../utils/preferenceUtils';
import { generateConfusionReport } from '../utils/confusionUtils';
import { generateUserProfile } from '../utils/profileUtils';
import { computeKnowledgeGap } from '../utils/gapUtils';
import { generateStory, generateDream } from '../utils/storyUtils';
import { computeRhythm } from '../utils/rhythmUtils';
import { findHiddenConnection, getMemoryConnections } from '../utils/navUtils';
import { findEcho, buildMemoryChain, findBoomerang, findAntipode } from '../utils/similarityUtils';
import { computeTemperament } from '../utils/memoryBankUtils';
import { generateTraceSteps } from '../utils/insightUtils';

/**
 * 动态文本本地化回归测试。
 *
 * 这些 utils 负责「把记忆数据编织成自然语言」（叙事、报告、洞察、回声…）。
 * 它们都接收 lang 参数，但历史上部分分支漏掉了英文实现。
 * 本测试在英文模式下真实调用一遍，深度扫描返回值，任何中文残留都会失败。
 */

const HAN = /[\u4e00-\u9fff]/;

/** 构建测试用的 t 函数（读取英文语言包） */
const flatEn: Record<string, string> = {};
(function flatten(o: any, prefix = '') {
  for (const [k, v] of Object.entries(o)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key);
    else flatEn[key] = String(v);
  }
})(en);

const t = (key: string, params?: Record<string, string | number>): string => {
  let s = flatEn[key];
  if (s === undefined) {
    // 英文包缺 key 时退回中文包，便于测试区分「没翻译」与「key 缺失」
    s = key;
  }
  if (params) s = s.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in params ? String(params[k]) : `{{${k}}}`));
  return s;
};

/**
 * 豁免的键名：这些是内部枚举标识符，被配色/筛选/相似度逻辑依赖，
 * 设计上保持中文原值（显示由渲染层翻译），不计入残留。
 */
const ENUM_EXEMPT_KEYS = new Set([
  'dateType',
  'timeOfDay',
  'season',
  'placeType',
  'primary',
  'privacyLevel',
  'agentType',
  // 以下为「统计类枚举摘要」，下游既要用原值取色（EMOTION_COLORS），
  // 又要用 xxxT() 显示，因此必须保持中文原值，由显示点负责翻译。
  'dominantEmotion',
  'topEmotion',
  'topPlace',
  'topActivity',
]);

/** 按完整路径豁免：RawMemory 顶层也有 type 字段（值为 'raw'），按键名会误伤 */
const EXEMPT_PATH_SUFFIX = ['dimensions.activity.type'];

/** 深度遍历返回值，收集所有含中文的字符串及其路径 */
function collectChinese(node: unknown, path: string, out: { path: string; value: string }[]): void {
  if (typeof node === 'string') {
    if (EXEMPT_PATH_SUFFIX.some(s => path.endsWith(s))) return;
    if (HAN.test(node)) out.push({ path, value: node });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => collectChinese(item, `${path}[${i}]`, out));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (ENUM_EXEMPT_KEYS.has(k)) continue;
      collectChinese(v, `${path}.${k}`, out);
    }
  }
}

/** 断言某个调用在英文模式下不产生中文；失败时打印具体位置 */
function expectNoChinese(label: string, value: unknown) {
  const out: { path: string; value: string }[] = [];
  collectChinese(value, label, out);
  if (out.length > 0) {
    const uniq = [...new Set(out.map(o => `${o.path} => ${o.value}`))];
    // eslint-disable-next-line no-console
    console.error(`【${label}】残留 ${out.length} 处（去重 ${uniq.length}）：\n` + uniq.slice(0, 25).join('\n'));
  }
  expect(out, `${label} 在英文模式下出现中文残留`).toEqual([]);
}

// 关键：组件实际拿到的是 AppContext 已本地化的数据，
// 因此这里必须先本地化，才能真实反映英文模式下的输出。
const allRaw = localizeRawMemories('en', [...rawMemories, ...chatgptRawMemories]);
const allInsight = localizeInsightMemories('en', [...insightMemories, ...chatgptInsightMemories]);
const LANG: Language = 'en';

describe('英文模式：动态生成的文本不应含中文', () => {
  it('第一人称叙事', () => {
    allRaw.slice(0, 12).forEach(m => expectNoChinese('generateFirstPersonNarrative', generateFirstPersonNarrative(m, LANG)));
  });

  it('年度统计', () => {
    expectNoChinese('computeAnnualStats', computeAnnualStats(allRaw, LANG));
  });

  it('每日轨迹', () => {
    expectNoChinese('computeDailyTrajectories', computeDailyTrajectories(allRaw.slice(0, 20), LANG));
  });

  it('记忆对比', () => {
    expectNoChinese('computeDiff', computeDiff(allRaw[0], allRaw[1], LANG));
  });

  it('社交图谱', () => {
    expectNoChinese('generateSocialGraph', generateSocialGraph(allRaw, LANG));
  });

  it('感官画像', () => {
    expectNoChinese('computeSensoryProfile', computeSensoryProfile(allRaw, LANG));
  });

  it('偏好树', () => {
    expectNoChinese('buildPreferenceTrees', buildPreferenceTrees(allRaw, allInsight, LANG));
  });

  it('困惑报告', () => {
    expectNoChinese('generateConfusionReport', generateConfusionReport(allRaw, allInsight, LANG));
  });

  it('用户画像', () => {
    expectNoChinese('generateUserProfile', generateUserProfile(allRaw, allInsight, LANG));
  });

  it('知识盲区', () => {
    expectNoChinese('computeKnowledgeGap', computeKnowledgeGap(allRaw, allInsight, LANG));
  });

  it('故事生成', () => {
    expectNoChinese('generateStory', generateStory(allRaw, allInsight, LANG));
  });

  it('梦境生成', () => {
    expectNoChinese('generateDream', generateDream(allRaw.slice(0, 20), LANG));
  });

  it('节奏分析', () => {
    expectNoChinese('computeRhythm', computeRhythm(allRaw, LANG));
  });

  it('隐藏关联', () => {
    expectNoChinese('findHiddenConnection', findHiddenConnection(allRaw, LANG));
  });

  it('记忆关联', () => {
    allRaw.slice(0, 8).forEach(m =>
      expectNoChinese('getMemoryConnections', getMemoryConnections(m.id, allRaw, allInsight, LANG))
    );
  });

  it('记忆回声', () => {
    allRaw.slice(0, 8).forEach(m => expectNoChinese('findEcho', findEcho(m, allRaw, 2, LANG)));
  });

  it('记忆链', () => {
    allRaw.slice(0, 5).forEach(m => expectNoChinese('buildMemoryChain', buildMemoryChain(m, allRaw, 5, LANG)));
  });

  it('回旋镖记忆', () => {
    allRaw.slice(0, 5).forEach(m => expectNoChinese('findBoomerang', findBoomerang(m, allRaw, 2, LANG)));
  });

  it('对立记忆', () => {
    allRaw.slice(0, 5).forEach(m => expectNoChinese('findAntipode', findAntipode(m, allRaw, LANG)));
  });

  it('气质画像', () => {
    expectNoChinese('computeTemperament', computeTemperament(allRaw, t, LANG));
  });

  it('洞察推理步骤', () => {
    allInsight.slice(0, 6).forEach(i =>
      expectNoChinese('generateTraceSteps', generateTraceSteps(i, allRaw, LANG))
    );
  });
});
