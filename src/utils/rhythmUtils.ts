import type { RawMemory } from '../types';

export interface HeatmapCell {
  day: number; // 0=Mon, 6=Sun
  hour: number; // 0-23
  count: number;
  topActivity: string;
  topEmotion: string;
}

export interface MonthlyActivity {
  month: string;
  count: number;
}

export interface RhythmInsight {
  text: string;
  emoji: string;
}

export interface RhythmData {
  heatmap: HeatmapCell[];
  monthly: MonthlyActivity[];
  insights: RhythmInsight[];
  peakDay: string;
  peakHour: number;
}

const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export function computeRhythm(memories: RawMemory[]): RhythmData {
  // Heatmap: 7 days × 24 hours
  const grid: Map<string, { count: number; activities: Record<string, number>; emotions: Record<string, number> }> = new Map();

  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      grid.set(`${d}-${h}`, { count: 0, activities: {}, emotions: {} });
    }
  }

  memories.forEach(m => {
    const date = new Date(m.dimensions.temporal.timestamp);
    const day = (date.getDay() + 6) % 7; // Convert Sun=0 to Mon=0
    const hour = date.getHours();
    const key = `${day}-${hour}`;
    const cell = grid.get(key)!;
    cell.count++;
    const act = m.dimensions.activity.type;
    cell.activities[act] = (cell.activities[act] || 0) + 1;
    const emo = m.dimensions.emotional.primary;
    cell.emotions[emo] = (cell.emotions[emo] || 0) + 1;
  });

  const heatmap: HeatmapCell[] = [];
  grid.forEach((data, key) => {
    const [day, hour] = key.split('-').map(Number);
    const topActivity = Object.entries(data.activities).sort(([, a], [, b]) => b - a)[0]?.[0] || '-';
    const topEmotion = Object.entries(data.emotions).sort(([, a], [, b]) => b - a)[0]?.[0] || '-';
    heatmap.push({ day, hour, count: data.count, topActivity, topEmotion });
  });

  // Monthly activity
  const monthMap = new Map<string, number>();
  memories.forEach(m => {
    const d = new Date(m.dimensions.temporal.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(key, (monthMap.get(key) || 0) + 1);
  });
  const monthly: MonthlyActivity[] = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => ({ month: month.slice(5), count }));

  // Find peak
  const dayTotals = new Array(7).fill(0);
  const hourTotals = new Array(24).fill(0);
  heatmap.forEach(c => {
    dayTotals[c.day] += c.count;
    hourTotals[c.hour] += c.count;
  });
  const peakDayIdx = dayTotals.indexOf(Math.max(...dayTotals));
  const peakHour = hourTotals.indexOf(Math.max(...hourTotals));

  // Generate insights
  const insights: RhythmInsight[] = [];
  if (dayTotals[peakDayIdx] > 0) {
    insights.push({
      text: `你的记忆高峰在${DAY_LABELS[peakDayIdx]}，通常在${peakHour}:00 左右最为活跃`,
      emoji: '📊',
    });
  }

  // Weekend vs weekday
  const weekdayAvg = (dayTotals[0] + dayTotals[1] + dayTotals[2] + dayTotals[3] + dayTotals[4]) / 5;
  const weekendAvg = (dayTotals[5] + dayTotals[6]) / 2;
  if (weekendAvg > weekdayAvg * 1.3) {
    insights.push({ text: '你的周末记忆量比工作日多 30% 以上，周末是你最活跃的时光', emoji: '🎉' });
  }

  // Night vs day
  const nightCount = hourTotals.slice(20, 24).reduce((a, b) => a + b, 0) + hourTotals.slice(0, 6).reduce((a, b) => a + b, 0);
  const dayCount = hourTotals.slice(6, 20).reduce((a, b) => a + b, 0);
  if (nightCount > dayCount * 0.3) {
    insights.push({ text: '你有不少晚间记忆，夜晚也是你记录生活的重要时段', emoji: '🌙' });
  }

  return {
    heatmap,
    monthly,
    insights,
    peakDay: DAY_LABELS[peakDayIdx],
    peakHour,
  };
}
