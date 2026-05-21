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