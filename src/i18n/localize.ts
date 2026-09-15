/**
 * 数据层统一本地化
 *
 * 设计动机
 * --------
 * 原先的做法是「在每个渲染点手动调用 memoryLabelT / contentT / emotionT 」，
 * 任何一处遗漏就会在英文模式下泄漏中文 —— 这正是反复修补仍修不完的根因。
 * 这里改为在数据出口统一翻译一次，所有下游组件天然拿到目标语言的数据。
 *
 * 关键约束（重要）
 * --------------
 * 只翻译**自由文本**字段。**枚举字段必须保持中文原值**，因为它们被业务逻辑依赖：
 *   - emotional.primary → EMOTION_COLORS 取色、情绪筛选 emotionFilter、emoji 分支判断
 *   - spatial.placeType → isMemoryInCategory 分类筛选（与 CATEGORY_PLACE_MAP 比对）
 *   - temporal.dateType / timeOfDay / season、value.privacyLevel、agentState.agentType → 同上有映射表依赖
 *   - positions 的 key → 与 currentView 对齐的内部标识符
 * 这些字段的显示由渲染层调用对应的 xxxT() 完成，改动它们会导致配色/筛选/emoji 静默失效。
 */
import type { RawMemory, InsightMemory } from '../types';
import type { Language } from './index';
import { contentT } from './dataTranslations';
import {
  memoryLabelT,
  memorySummaryT,
  insightStatementT,
  insightDescriptionT,
  storylineNameT,
} from './memoryData';

/** 翻译字符串数组（过滤空值，保持顺序） */
function tArr(lang: Language, arr: string[] | undefined): string[] | undefined {
  if (!arr) return arr;
  return arr.map(v => contentT(lang, v));
}

/**
 * 故事线本地化：专名表优先，未命中再回落到内容字典。
 *
 * 顺序很关键：contentT 含品牌词子串替换（如「智能助手」→「AI assistant」），
 * 若先过字典会改写原文，导致「和 智能助手 的日常」这类专名在 STORYLINE 表里查不中，
 * 反而丢掉人工校订的译名。
 */
function storylineLocalized(lang: Language, storyline: string): string {
  if (lang === 'zh-CN') return storyline;
  const named = storylineNameT(lang, storyline);
  if (named !== storyline) return named; // 专名表命中
  return contentT(lang, storyline);
}

/**
 * 本地化一条原始记忆。
 * 返回新对象，不修改入参（避免污染 store 中的源数据）。
 */
export function localizeRawMemory(lang: Language, m: RawMemory): RawMemory {
  if (lang === 'zh-CN') return m;

  const d = m.dimensions;
  const enPrefs: Record<string, string> = {};
  for (const [k, v] of Object.entries(d.semantic.preferences ?? {})) {
    enPrefs[contentT(lang, k)] = contentT(lang, v);
  }

  return {
    ...m,
    // label / summary 的回落链：按 id 查人工译名 → 内容字典（覆盖导入等运行时记忆）→ 原文
    label: memoryLabelT(lang, m.id, contentT(lang, m.label)),
    summary: memorySummaryT(lang, m.id, contentT(lang, m.summary)),
    ...(m.tags ? { tags: m.tags.map(tag => contentT(lang, tag)) } : {}),
    dimensions: {
      // temporal：dateType/timeOfDay/season 为枚举，整体保持原值
      temporal: { ...d.temporal },
      spatial: {
        placeType: d.spatial.placeType, // 枚举：分类筛选用
        room: contentT(lang, d.spatial.room),
        landmark: contentT(lang, d.spatial.landmark),
      },
      social: {
        ...d.social,
        persons: tArr(lang, d.social.persons) ?? [],
        relationship: tArr(lang, d.social.relationship) ?? [],
      },
      emotional: {
        ...d.emotional,
        primary: d.emotional.primary, // 枚举：配色 / 筛选 / emoji 用
        trigger: contentT(lang, d.emotional.trigger),
      },
      activity: {
        // type 是内部枚举标识符：memoryBankUtils / confusionUtils / similarityUtils
        // 等十余处依赖它做分类与相似度判断，翻译会导致这些逻辑在英文模式失效。
        // 显示由渲染层用 activityT() 完成。
        type: d.activity.type,
        detail: contentT(lang, d.activity.detail),
      },
      sensory: {
        ...d.sensory,
        interactions: tArr(lang, d.sensory.interactions),
      },
      semantic: {
        knowledge: tArr(lang, d.semantic.knowledge) ?? [],
        preferences: enPrefs,
        skills: tArr(lang, d.semantic.skills) ?? [],
      },
      value: d.value, // privacyLevel 为枚举，保持原值
      narrative: {
        ...d.narrative,
        storyline: storylineLocalized(lang, d.narrative.storyline),
      },
      agentState: d.agentState, // agentType 为枚举，保持原值
    },
  };
}

/** 本地化一条洞察记忆 */
export function localizeInsightMemory(lang: Language, m: InsightMemory): InsightMemory {
  if (lang === 'zh-CN') return m;
  return {
    ...m,
    // 与 raw 记忆一致：按 id 查人工译名 → 内容字典（覆盖导入洞察）→ 原文
    statement: insightStatementT(lang, m.id, contentT(lang, m.statement)),
    description: insightDescriptionT(lang, m.id, contentT(lang, m.description)),
    reasoningTrace: contentT(lang, m.reasoningTrace),
    // category 为英文枚举，无需处理
    ...(m.userCorrection ? { userCorrection: contentT(lang, m.userCorrection) } : {}),
    ...(m.userNote ? { userNote: contentT(lang, m.userNote) } : {}),
  };
}

/** 批量本地化原始记忆 */
export function localizeRawMemories(lang: Language, mems: RawMemory[]): RawMemory[] {
  if (lang === 'zh-CN') return mems;
  return mems.map(m => localizeRawMemory(lang, m));
}

/** 批量本地化洞察记忆 */
export function localizeInsightMemories(lang: Language, mems: InsightMemory[]): InsightMemory[] {
  if (lang === 'zh-CN') return mems;
  return mems.map(m => localizeInsightMemory(lang, m));
}

/** 本地化记忆详情弹窗用的 farewell 记录等附属文本 */
export function localizeText(lang: Language, text: string | undefined | null): string {
  return contentT(lang, text);
}
