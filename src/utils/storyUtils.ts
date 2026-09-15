import type { RawMemory, InsightMemory } from '../types';
import type { Language } from '../i18n';
import { CATEGORY_LABELS } from '../types';
import { contentT, emotionNameT, seasonT, dateTypeT, categoryT } from '../i18n/dataTranslations';
import { memoryLabelT, memorySummaryT, insightStatementT, insightDescriptionT, storylineNameT } from '../i18n/memoryData';

export interface StoryCitation {
  memoryId: string;
  shortDescription: string;
}

export interface StoryChapter {
  title: string;
  type: 'past' | 'future';
  text: string;
  imageUrls: string[];
  memoryIds: string[];
  citations: StoryCitation[][];
}

const STORY_EMOTION_LABELS: Record<string, { zh: string; en: string }> = {
  '快乐': { zh: '开心', en: 'happy' },
  '悲伤': { zh: '难过', en: 'sad' },
  '愤怒': { zh: '生气', en: 'angry' },
  '惊讶': { zh: '惊叹', en: 'amazed' },
  '好奇': { zh: '好奇', en: 'curious' },
  '骄傲': { zh: '自豪', en: 'proud' },
  '沮丧': { zh: '沮丧', en: 'frustrated' },
  '感激': { zh: '感恩', en: 'grateful' },
  '思念': { zh: '想念', en: 'missing' },
};

function getEmotionLabel(emotion: string, lang: Language = 'zh-CN'): string {
  const labels = STORY_EMOTION_LABELS[emotion];
  if (!labels) return emotionNameT(lang, emotion);
  return lang === 'en' ? labels.en : labels.zh;
}

const STORY_LABELS: Record<string, { zh: string; en: string }> = {
  pastFootprints: { zh: '过去的脚印', en: 'Footprints of the Past' },
  futureProjection: { zh: '未来的投射', en: 'Projections of the Future' },
  dreamTooFew: { zh: '记忆太少，无法编织梦境。请先记录更多记忆。', en: 'Too few memories to weave a dream. Please record more memories first.' },
  someone: { zh: '某个人', en: 'someone' },
  strangerPlace: { zh: '一个陌生的地方', en: 'a strange place' },
  doingWhat: { zh: '做着什么', en: 'doing something' },
  blurFigure: { zh: '一个模糊的身影', en: 'a blurred figure' },
  everything: { zh: '一切都', en: 'everything' },
};

export function storyT(lang: Language, key: string): string {
  const labels = STORY_LABELS[key];
  if (!labels) return key;
  return lang === 'en' ? labels.en : labels.zh;
}

function citationLabel(m: RawMemory, lang: Language): string {
  return memoryLabelT(lang, m.id, m.label) || memorySummaryT(lang, m.id, m.summary).slice(0, 30);
}

export interface StorylineNode {
  memory: RawMemory;
  index: number;
  emotionColor: string;
}

export interface StorylineConnection {
  from: StorylineNode;
  to: StorylineNode;
  emotionTransition: string; // e.g. "好奇 → 沮丧"
}

export interface WovenStoryline {
  storyline: string;
  nodes: StorylineNode[];
  connections: StorylineConnection[];
  narrative: string; // Auto-generated paragraph
}

import { EMOTION_COLORS } from '../types';

export function weaveStoryline(rawMemories: RawMemory[], storylineName: string, lang: Language = 'zh-CN'): WovenStoryline | null {
  const members = rawMemories
    .filter(m => m.dimensions.narrative.storyline === storylineName)
    .sort((a, b) => a.dimensions.temporal.timestamp - b.dimensions.temporal.timestamp);

  if (members.length === 0) return null;

  const nodes: StorylineNode[] = members.map((m, i) => ({
    memory: m,
    index: i,
    emotionColor: EMOTION_COLORS[m.dimensions.emotional.primary] || '#888',
  }));

  const connections: StorylineConnection[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const from = nodes[i];
    const to = nodes[i + 1];
    const fromEmo = from.memory.dimensions.emotional.primary;
    const toEmo = to.memory.dimensions.emotional.primary;
    connections.push({
      from,
      to,
      emotionTransition: fromEmo === toEmo
        ? emotionNameT(lang, fromEmo)
        : `${emotionNameT(lang, fromEmo)} → ${emotionNameT(lang, toEmo)}`,
    });
  }

  // Auto-generate narrative paragraph
  const first = members[0];
  const last = members[members.length - 1];
  const emotions = [...new Set(members.map(m => m.dimensions.emotional.primary))];
  const places = [...new Set(members.map(m => m.dimensions.spatial.landmark).filter(Boolean))];
  const persons = [...new Set(members.flatMap(m => m.dimensions.social.persons))];

  const firstDate = new Date(first.dimensions.temporal.timestamp);
  const lastDate = new Date(last.dimensions.temporal.timestamp);
  const monthDiff = Math.max(1, Math.round((lastDate.getTime() - firstDate.getTime()) / (30 * 86400000)));

  const emotionStr = emotions.length <= 2
    ? emotions.map(e => emotionNameT(lang, e)).join(lang === 'en' ? ' and ' : '和')
    : emotions.slice(0, 3).map(e => emotionNameT(lang, e)).join(lang === 'en' ? ', ' : '、') + (lang === 'en' ? ' etc.' : '等');
  const placeStr = places.length > 0 ? (lang === 'en' ? `at ${places.slice(0, 2).map(p => contentT(lang, p)).join(' and ')}` : `在${places.slice(0, 2).map(p => contentT(lang, p)).join('和')}`) : '';
  const personStr = persons.length > 0 ? (lang === 'en' ? `with ${persons.slice(0, 2).map(p => contentT(lang, p)).join(', ')}` : `和${persons.slice(0, 2).map(p => contentT(lang, p)).join('、')}`) : '';

  const displayName = storylineNameT(lang, storylineName);

  const narrative = lang === 'en'
    ? `The story of ${displayName} spans ${monthDiff} months, with ${members.length} memories. `
    + `Starting from "${memoryLabelT(lang, first.id, first.label)}" in ${firstDate.getMonth() + 1}, `
    + `${placeStr} ${personStr} experienced ${emotionStr} moments together. `
    + `The most recent one is "${memoryLabelT(lang, last.id, last.label)}".`
    : `${storylineName}的故事跨越了 ${monthDiff} 个月，共 ${members.length} 条记忆。`
    + `从${firstDate.getMonth() + 1}月的"${first.label}"开始，`
    + `${placeStr}${personStr}一起经历了${emotionStr}的时刻。`
    + `最近的一条是"${last.label}"。`;

  return { storyline: storylineName, nodes, connections, narrative };
}

export function getStorylineNames(rawMemories: RawMemory[]): string[] {
  const names = new Set(rawMemories.map(m => m.dimensions.narrative.storyline).filter(Boolean));
  return Array.from(names);
}

export function generateStory(
  rawMemories: RawMemory[],
  insightMemories: InsightMemory[],
  lang: Language = 'zh-CN',
): StoryChapter[] {
  const chapters: StoryChapter[] = [];
  const rawMap = new Map(rawMemories.map(m => [m.id, m]));

  const sortedRaw = [...rawMemories]
    .sort((a, b) => a.dimensions.temporal.timestamp - b.dimensions.temporal.timestamp);

  const milestones = sortedRaw.filter(m => m.dimensions.narrative.isMilestone);
  const regular = sortedRaw.filter(m => !m.dimensions.narrative.isMilestone);
  const selectedRaw = [...milestones, ...regular.slice(-3)].slice(0, 6);

  if (selectedRaw.length > 0) {
    const storyLines: string[] = selectedRaw.map((m, i) => {
      const season = seasonT(lang, m.dimensions.temporal.season);
      const emotion = getEmotionLabel(m.dimensions.emotional.primary, lang);
      const place = contentT(lang, m.dimensions.spatial.landmark) || contentT(lang, m.dimensions.spatial.placeType);
      const dateType = dateTypeT(lang, m.dimensions.temporal.dateType);
      const label = memoryLabelT(lang, m.id, m.label);
      const summary = memorySummaryT(lang, m.id, m.summary);
      if (lang === 'en') {
        if (i === 0) {
          return `The story begins on a ${season ? season + ' ' : ''}${dateType} at ${place} — ${label}. That day he was ${emotion}, ${summary}`;
        }
        return `Later on a ${season ? season + ' ' : ''}${dateType}, at ${place}, ${label}. He was ${emotion} and satisfied, ${summary}`;
      }
      if (i === 0) {
        return `故事从${season ? season + ' ' : ''}${dateType}的${place}开始——${m.label}。那天的他${emotion}极了，${m.summary}`;
      }
      return `后来到了${season ? season + ' ' : ''}${dateType}，在${place}，${m.label}。这时的他${emotion}又满足，${m.summary}`;
    });

    const citations: StoryCitation[][] = selectedRaw.map(m =>
      [{ memoryId: m.id, shortDescription: citationLabel(m, lang) }]
    );

    const images = selectedRaw
      .flatMap(m => m.dimensions.sensory.images)
      .filter(Boolean);

    chapters.push({
      title: storyT(lang, 'pastFootprints'),
      type: 'past',
      text: storyLines.join('\n\n'),
      imageUrls: images,
      memoryIds: selectedRaw.map(m => m.id),
      citations,
    });
  }

  if (insightMemories.length > 0) {
    const topInsights = [...insightMemories]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    const insightLines = topInsights.map(ins => {
      const cat = categoryT(lang, ins.category);
      const statement = insightStatementT(lang, ins.id, ins.statement);
      const description = insightDescriptionT(lang, ins.id, ins.description);
      return lang === 'en'
        ? `In terms of ${cat}, ${statement}. ${description}`
        : `在${CATEGORY_LABELS[ins.category]}方面，${ins.statement}。${ins.description}`;
    });

    const citations: StoryCitation[][] = topInsights.map(ins =>
      ins.sourceRawMemoryIds
        .map(id => {
          const raw = rawMap.get(id);
          return { memoryId: id, shortDescription: raw ? citationLabel(raw, lang) : id };
        })
    );

    chapters.push({
      title: storyT(lang, 'futureProjection'),
      type: 'future',
      text: insightLines.join('\n\n'),
      imageUrls: [],
      memoryIds: topInsights.map(ins => ins.id),
      citations,
    });
  }

  return chapters;
}

// ─── Dream Generator (Feature #63) ───

export interface DreamResult {
  narrative: string;
  sourceMemories: RawMemory[];
}

export function generateDream(memories: RawMemory[], lang: Language = 'zh-CN'): DreamResult {
  if (memories.length < 3) {
    return {
      narrative: storyT(lang, 'dreamTooFew'),
      sourceMemories: memories,
    };
  }

  // Pick 3-5 random fragments from different categories
  const shuffled = [...memories].sort(() => Math.random() - 0.5);
  const count = Math.min(3 + Math.floor(Math.random() * 3), shuffled.length);
  const selected = shuffled.slice(0, count);

  const fragments = selected.map(m => ({
    place: contentT(lang, m.dimensions.spatial.placeType),
    person: contentT(lang, m.dimensions.social.persons[0]) || storyT(lang, 'someone'),
    activity: contentT(lang, m.dimensions.activity.detail) || contentT(lang, m.dimensions.activity.type),
    emotion: emotionNameT(lang, m.dimensions.emotional.primary),
  }));

  if (lang === 'en') {
    const enTemplates = [
      (f: typeof fragments) =>
        `You dreamt that ${f[0].place} turned into ${f[1]?.place || 'a strange place'}, ${f[0].person} was ${f[1]?.activity || 'doing something'}, while you ${f[0].activity} feeling ${f[0].emotion}. The air was filled with a ${f[1]?.emotion || 'mysterious'} aura.`,
      (f: typeof fragments) =>
        `In the dream, ${f[0].person} and ${f[1]?.person || 'a blurred figure'} were ${f[0].activity} at ${f[0].place}. You stood at a distance, feeling ${f[0].emotion}. Suddenly, ${f[1]?.place || 'everything'} started spinning, and you found yourself ${f[1]?.activity || 'flying'}.`,
      (f: typeof fragments) =>
        `You dreamt time was reversed — you who were ${f[0].activity} returned to ${f[0].place}. ${f[0].person} smiled at you, saying words you couldn't understand but that made you feel ${f[0].emotion}. In the distance, ${f[1]?.person || 'someone'} was ${f[1]?.activity || 'waiting'}.`,
    ];
    const template = enTemplates[Math.floor(Math.random() * enTemplates.length)];
    const narrative = template(fragments);
    return { narrative, sourceMemories: selected };
  }

  const zhTemplates = [
    (f: typeof fragments) =>
      `你梦见${f[0].place}变成了${f[1]?.place || storyT(lang, 'strangerPlace')}，${f[0].person}正在${f[1]?.activity || storyT(lang, 'doingWhat')}，而你${f[0].emotion}地${f[0].activity}。空气中弥漫着${f[1]?.emotion || '奇异'}的气息。`,
    (f: typeof fragments) =>
      `在梦里，${f[0].person}和${f[1]?.person || storyT(lang, 'blurFigure')}一起在${f[0].place}${f[0].activity}。你站在远处，感到${f[0].emotion}。突然，${f[1]?.place || storyT(lang, 'everything')}开始旋转，你发现自己正在${f[1]?.activity || '飞翔'}。`,
    (f: typeof fragments) =>
      `你梦见时间倒流——${f[0].activity}的你回到了${f[0].place}。${f[0].person}对你微笑，说着你听不懂却感到${f[0].emotion}的话。远处，${f[1]?.person || '有人'}在${f[1]?.activity || '等待'}。`,
  ];
  const template = zhTemplates[Math.floor(Math.random() * zhTemplates.length)];
  const narrative = template(fragments);

  return {
    narrative,
    sourceMemories: selected,
  };
}