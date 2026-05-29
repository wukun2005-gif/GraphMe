import type { RawMemory } from '../types';

// ========== Time expressions ==========
function getTimeExpression(timestamp: number): string {
  const date = new Date(timestamp);
  const hour = date.getHours();
  const day = date.getDay();
  const month = date.getMonth();

  const seasonMap: Record<number, string> = {
    0: '冬天', 1: '冬天', 2: '春天', 3: '春天', 4: '春天', 5: '夏天',
    6: '夏天', 7: '夏天', 8: '秋天', 9: '秋天', 10: '秋天', 11: '冬天',
  };

  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  let timeOfDay = '';
  if (hour >= 5 && hour < 9) timeOfDay = '清晨';
  else if (hour >= 9 && hour < 12) timeOfDay = '上午';
  else if (hour >= 12 && hour < 14) timeOfDay = '中午';
  else if (hour >= 14 && hour < 18) timeOfDay = '下午';
  else if (hour >= 18 && hour < 21) timeOfDay = '傍晚';
  else timeOfDay = '晚上';

  const templates = [
    `那个${seasonMap[month]}的${dayNames[day]}${timeOfDay}`,
    `${seasonMap[month]}的一个${timeOfDay}`,
    `${dayNames[day]}的${timeOfDay}`,
    `一个${seasonMap[month]}的${timeOfDay}`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

// ========== Person expressions ==========
function getPersonExpression(persons: string[]): string {
  if (persons.length === 0) return '我一个人';
  if (persons.length === 1) return persons[0];
  if (persons.length === 2) return `${persons[0]}和${persons[1]}`;
  return `${persons[0]}他们`;
}

// ========== Activity expressions ==========
function getActivityExpression(activity: string, detail: string): string {
  const activityMap: Record<string, string[]> = {
    '游玩': ['玩耍', '开心地玩', '尽情地玩'],
    '学习': ['学习', '认真地学', '专注地学'],
    '运动': ['运动', '奔跑', '挥洒汗水'],
    '创作': ['创作', '动手做', '专注地制作'],
    '阅读': ['阅读', '安静地看书', '沉浸在书里'],
    '对话': ['聊天', '交谈', '说了很多话'],
    '手工': ['做手工', '动手制作', '专注地做'],
    '编程': ['编程', '写代码', '在电脑前敲代码'],
  };

  const options = activityMap[activity] || [activity];
  return options[Math.floor(Math.random() * options.length)];
}

// ========== Emotion expressions ==========
function getEmotionExpression(emotion: string, intensity: number): string {
  const emotionMap: Record<string, string[]> = {
    '快乐': ['笑得停不下来', '心里暖暖的', '开心极了', '忍不住笑出声'],
    '悲伤': ['心里有些难过', '眼眶有点湿润', '感到一阵心酸'],
    '好奇': ['充满了好奇心', '眼睛亮了起来', '迫不及待想知道'],
    '骄傲': ['感到很自豪', '心里美滋滋的', '忍不住挺起胸膛'],
    '感激': ['心里充满了感激', '觉得很温暖', '眼眶有些湿润'],
    '愤怒': ['有些生气', '心里憋着一股气'],
    '沮丧': ['有些失落', '心里不太好受'],
    '惊讶': ['吃了一惊', '没想到会这样'],
    '恐惧': ['有些害怕', '心跳加速'],
    '思念': ['很想念', '心里空落落的'],
    '中性': ['平静地度过', '平常的一天'],
  };

  const options = emotionMap[emotion] || ['印象深刻'];
  return options[Math.floor(Math.random() * options.length)];
}

// ========== Place expressions ==========
function getPlaceExpression(place: string): string {
  const placeMap: Record<string, string[]> = {
    '家': ['在家里', '在家中', '在温暖的家里'],
    '学校': ['在学校', '在教室里', '在校园里'],
    '公园': ['在公园里', '在公园的树荫下'],
    '商场': ['在商场里', '在热闹的商场'],
    '游乐场': ['在游乐场', '在游乐场里'],
    '其他': ['在那里'],
  };

  const options = placeMap[place] || [place];
  return options[Math.floor(Math.random() * options.length)];
}

// ========== Main function ==========
export function generateFirstPersonNarrative(memory: RawMemory): string {
  const d = memory.dimensions;
  const time = getTimeExpression(d.temporal.timestamp);
  const person = getPersonExpression(d.social.persons);
  const activity = getActivityExpression(d.activity.type, d.activity.detail);
  const emotion = getEmotionExpression(d.emotional.primary, d.emotional.intensity);
  const place = getPlaceExpression(d.spatial.placeType);

  const templates = [
    `${time}，${person}${place}${activity}。${emotion}。`,
    `${time}，${person}${place}，${activity}。那一刻，${emotion}。`,
    `记得${time}，${person}${place}${activity}。${emotion}。`,
    `${time}，${place}，${person}${activity}。${emotion}。`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}
