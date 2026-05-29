import type { RawMemory, InsightMemory } from '../types';
import { CATEGORY_LABELS } from '../types';

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

function getEmotionLabel(emotion: string): string {
  const map: Record<string, string> = {
    '快乐': '开心', '悲伤': '难过', '愤怒': '生气', '惊讶': '惊叹',
    '好奇': '好奇', '骄傲': '自豪', '沮丧': '沮丧', '感激': '感恩', '思念': '想念',
  };
  return map[emotion] || emotion;
}

function citationLabel(m: RawMemory): string {
  return m.label || m.summary.slice(0, 30);
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

export function weaveStoryline(rawMemories: RawMemory[], storylineName: string): WovenStoryline | null {
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
      emotionTransition: fromEmo === toEmo ? fromEmo : `${fromEmo} → ${toEmo}`,
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
    ? emotions.join('和')
    : emotions.slice(0, 3).join('、') + '等';
  const placeStr = places.length > 0 ? `在${places.slice(0, 2).join('和')}` : '';
  const personStr = persons.length > 0 ? `和${persons.slice(0, 2).join('、')}` : '';

  const narrative = `${storylineName}的故事跨越了 ${monthDiff} 个月，共 ${members.length} 条记忆。`
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
  insightMemories: InsightMemory[]
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
      const season = m.dimensions.temporal.season;
      const emotion = getEmotionLabel(m.dimensions.emotional.primary);
      const place = m.dimensions.spatial.landmark;
      const dateType = m.dimensions.temporal.dateType;
      if (i === 0) {
        return `故事从${season ? season + ' ' : ''}${dateType}的${place}开始——${m.label}。那天的他${emotion}极了，${m.summary}`;
      }
      return `后来到了${season ? season + ' ' : ''}${dateType}，在${place}，${m.label}。这时的他${emotion}又满足，${m.summary}`;
    });

    const citations: StoryCitation[][] = selectedRaw.map(m =>
      [{ memoryId: m.id, shortDescription: citationLabel(m) }]
    );

    const images = selectedRaw
      .flatMap(m => m.dimensions.sensory.images)
      .filter(Boolean);

    chapters.push({
      title: '过去的脚印',
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
      const cat = CATEGORY_LABELS[ins.category];
      return `在${cat}方面，${ins.statement}。${ins.description}`;
    });

    const citations: StoryCitation[][] = topInsights.map(ins =>
      ins.sourceRawMemoryIds
        .map(id => {
          const raw = rawMap.get(id);
          return { memoryId: id, shortDescription: raw ? citationLabel(raw) : id };
        })
    );

    chapters.push({
      title: '未来的投射',
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

const DREAM_TEMPLATES = [
  (fragments: { place: string; person: string; activity: string; emotion: string }[]) =>
    `你梦见${fragments[0].place}变成了${fragments[1]?.place || '一个陌生的地方'}，${fragments[0].person}正在${fragments[1]?.activity || '做着什么'}，而你${fragments[0].emotion}地${fragments[0].activity}。空气中弥漫着${fragments[1]?.emotion || '奇异'}的气息。`,

  (fragments: { place: string; person: string; activity: string; emotion: string }[]) =>
    `在梦里，${fragments[0].person}和${fragments[1]?.person || '一个模糊的身影'}一起在${fragments[0].place}${fragments[0].activity}。你站在远处，感到${fragments[0].emotion}。突然，${fragments[1]?.place || '一切都'}开始旋转，你发现自己正在${fragments[1]?.activity || '飞翔'}。`,

  (fragments: { place: string; person: string; activity: string; emotion: string }[]) =>
    `你梦见时间倒流——${fragments[0].activity}的你回到了${fragments[0].place}。${fragments[0].person}对你微笑，说着你听不懂却感到${fragments[0].emotion}的话。远处，${fragments[1]?.person || '有人'}在${fragments[1]?.activity || '等待'}。`,
];

export function generateDream(memories: RawMemory[]): DreamResult {
  if (memories.length < 3) {
    return {
      narrative: '记忆太少，无法编织梦境。请先记录更多记忆。',
      sourceMemories: memories,
    };
  }

  // Pick 3-5 random fragments from different categories
  const shuffled = [...memories].sort(() => Math.random() - 0.5);
  const count = Math.min(3 + Math.floor(Math.random() * 3), shuffled.length);
  const selected = shuffled.slice(0, count);

  const fragments = selected.map(m => ({
    place: m.dimensions.spatial.placeType,
    person: m.dimensions.social.persons[0] || '某个人',
    activity: m.dimensions.activity.detail || m.dimensions.activity.type,
    emotion: m.dimensions.emotional.primary,
  }));

  const template = DREAM_TEMPLATES[Math.floor(Math.random() * DREAM_TEMPLATES.length)];
  const narrative = template(fragments);

  return {
    narrative,
    sourceMemories: selected,
  };
}