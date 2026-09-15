import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseImportJSON } from '../utils/importUtils';
import { localizeRawMemories, localizeInsightMemories } from '../i18n/localize';
import { contentT } from '../i18n/dataTranslations';

/**
 * 导入链路的英文模式回归测试。
 *
 * 覆盖 public/sample-import.json：真实走一遍「解析 → 本地化 → 断言无中文」。
 * 这样以后导入样本新增中文内容而字典没登记时，本测试会立刻失败，
 * 而不再依赖用户逐个截图反馈。
 */

const HAN = /[\u4e00-\u9fff]/;

/** 枚举字段：被配色/筛选逻辑依赖，必须保持中文原值，由渲染层翻译 */
const ENUM_KEYS = new Set(['dateType', 'timeOfDay', 'season', 'placeType', 'primary', 'privacyLevel', 'agentType']);
const EXEMPT_PATH_SUFFIX = ['dimensions.activity.type'];

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
      if (ENUM_KEYS.has(k)) continue;
      if (k === 'positions') continue; // 视图内部标识符
      collectChinese(v, `${path}.${k}`, out);
    }
  }
}

const json = readFileSync(join(process.cwd(), 'public/sample-import.json'), 'utf8');
const imported = parseImportJSON(json, 'en');

describe('英文模式：导入数据不应残留中文', () => {
  it('sample-import.json 应能正常解析', () => {
    expect(imported.errors).toEqual([]);
    expect(imported.rawMemories.length).toBeGreaterThan(0);
    expect(imported.insightMemories.length).toBeGreaterThan(0);
  });

  it('导入的 rawMemories 全部字段应完成本地化', () => {
    const en = localizeRawMemories('en', imported.rawMemories);
    const residue: { path: string; value: string }[] = [];
    en.forEach(m => collectChinese(m, m.id, residue));

    if (residue.length > 0) {
      const uniq = [...new Set(residue.map(r => `${r.path} => ${r.value}`))];
      // eslint-disable-next-line no-console
      console.error(`导入记忆残留 ${residue.length} 处（去重 ${uniq.length}）：\n` + uniq.join('\n'));
    }
    expect(residue).toEqual([]);
  });

  it('导入的 insightMemories 全部字段应完成本地化', () => {
    const en = localizeInsightMemories('en', imported.insightMemories);
    const residue: { path: string; value: string }[] = [];
    en.forEach(m => collectChinese(m, m.id, residue));

    if (residue.length > 0) {
      // eslint-disable-next-line no-console
      console.error('导入洞察残留：\n' + residue.map(r => `${r.path} => ${r.value}`).join('\n'));
    }
    expect(residue).toEqual([]);
  });

  it('导入记忆的占位符与活动/故事线字段应为英文', () => {
    const en = localizeRawMemories('en', imported.rawMemories);
    for (const m of en) {
      // importUtils 写入的固定占位符
      expect(contentT('en', m.dimensions.spatial.landmark)).toBe('Imported');
      expect(contentT('en', m.dimensions.spatial.room)).toBe('Unknown');
      expect(contentT('en', m.dimensions.emotional.trigger)).toBe('Imported');
      // detail 取自 summary，必须同步翻译
      expect(m.dimensions.activity.detail).not.toMatch(HAN);
      // 故事线
      expect(m.dimensions.narrative.storyline).not.toMatch(HAN);
    }
  });

  it('中文模式下导入数据保持原样', () => {
    const zhImported = parseImportJSON(json, 'zh-CN');
    const zh = localizeRawMemories('zh-CN', zhImported.rawMemories);
    expect(zh).toBe(zhImported.rawMemories);
    expect(zh[0].label).toBe('第一次骑自行车');
  });
});
