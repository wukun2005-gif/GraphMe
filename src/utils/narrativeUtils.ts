import type { RawMemory } from '../types';
import type { Language } from '../i18n';
import { contentT } from '../i18n/dataTranslations';

// ========== Time expressions ==========
function getTimeExpression(timestamp: number, lang: Language): string {
  const date = new Date(timestamp);
  const hour = date.getHours();
  const day = date.getDay();
  const month = date.getMonth();

  if (lang === 'en') {
    const seasonMap: Record<number, string> = {
      0: 'winter', 1: 'winter', 2: 'spring', 3: 'spring', 4: 'spring', 5: 'summer',
      6: 'summer', 7: 'summer', 8: 'autumn', 9: 'autumn', 10: 'autumn', 11: 'winter',
    };
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let timeOfDay = '';
    if (hour >= 5 && hour < 9) timeOfDay = 'early morning';
    else if (hour >= 9 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 14) timeOfDay = 'noon';
    else if (hour >= 14 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    const templates = [
      `On a ${seasonMap[month]} ${dayNames[day]} ${timeOfDay}`,
      `One ${timeOfDay} in ${seasonMap[month]}`,
      `On a ${dayNames[day]} ${timeOfDay}`,
      `One ${seasonMap[month]} ${timeOfDay}`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

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
function getPersonExpression(persons: string[], lang: Language): string {
  if (persons.length === 0) return lang === 'en' ? 'I was alone' : '我一个人';
  if (persons.length === 1) return persons[0];
  if (persons.length === 2) return lang === 'en' ? `${persons[0]} and ${persons[1]}` : `${persons[0]}和${persons[1]}`;
  return lang === 'en' ? `${persons[0]} and the others` : `${persons[0]}他们`;
}

// ========== Activity expressions ==========
function getActivityExpression(activity: string, detail: string, lang: Language): string {
  if (lang === 'en') {
    const activityMap: Record<string, string[]> = {
      '游玩': ['playing', 'playing happily', 'playing to my heart\'s content'],
      '学习': ['learning', 'studying hard', 'studying intently'],
      '运动': ['exercising', 'running', 'working up a sweat'],
      '创作': ['creating', 'making things', 'crafting intently'],
      '阅读': ['reading', 'reading quietly', 'lost in a book'],
      '对话': ['chatting', 'talking', 'having a long talk'],
      '手工': ['doing crafts', 'making things', 'crafting intently'],
      '编程': ['coding', 'writing code', 'typing code at the computer'],
      '拼装': ['assembling', 'building something', 'putting pieces together'],
      '搭建': ['building', 'constructing', 'assembling piece by piece'],
      '参观': ['visiting', 'exploring', 'looking around'],
      '游戏': ['playing games', 'gaming', 'playing around'],
      '艺术': ['making art', 'drawing', 'being creative'],
      '绘画': ['drawing', 'painting', 'sketching'],
      '娱乐': ['having fun', 'playing', 'enjoying myself'],
      '沟通': ['talking', 'chatting', 'having a conversation'],
      '生活': ['going about daily life', 'spending time together', 'doing everyday things'],
      '社交': ['socializing', 'spending time with friends', 'hanging out'],
      '规划': ['planning', 'making plans', 'mapping things out'],
      '搜索': ['searching', 'looking things up', 'browsing'],
      '活动': ['doing activities', 'being active', 'taking part'],
      '实验': ['experimenting', 'running experiments', 'trying things out'],
      '观察': ['observing', 'watching closely', 'taking it all in'],
      '交流': ['exchanging ideas', 'talking', 'communicating'],
      '骑车': ['riding a bike', 'cycling', 'pedaling along'],
      '散步': ['taking a walk', 'strolling', 'walking around'],
      '购物': ['shopping', 'browsing the shops', 'picking things out'],
      '做饭': ['cooking', 'making food', 'preparing a meal'],
      '唱歌': ['singing', 'singing along', 'humming a tune'],
      '跳舞': ['dancing', 'moving to the music', 'dancing around'],
    };
    // 兜底：映射缺失时走内容字典，避免把中文原值直接拼进英文句子
    const options = activityMap[activity] || [contentT(lang, activity).toLowerCase()];
    return options[Math.floor(Math.random() * options.length)];
  }

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
function getEmotionExpression(emotion: string, intensity: number, lang: Language): string {
  if (lang === 'en') {
    const emotionMap: Record<string, string[]> = {
      '快乐': ['I couldn\'t stop smiling', 'I felt warm inside', 'I was overjoyed', 'I couldn\'t help laughing'],
      '悲伤': ['I felt a bit sad', 'my eyes were wet', 'I felt a pang of sorrow'],
      '好奇': ['I was full of curiosity', 'my eyes lit up', 'I couldn\'t wait to find out'],
      '骄傲': ['I felt so proud', 'I was beaming', 'I stood a little taller'],
      '感激': ['I felt deeply grateful', 'I felt warm', 'my eyes were a bit misty'],
      '愤怒': ['I was a bit angry', 'I was holding back frustration'],
      '沮丧': ['I felt a bit down', 'I felt uneasy'],
      '惊讶': ['I was taken by surprise', 'I didn\'t expect that'],
      '恐惧': ['I felt a bit scared', 'my heart raced'],
      '思念': ['I missed them so much', 'I felt a little empty'],
      '中性': ['it was a calm day', 'it was an ordinary day'],
    };
    const options = emotionMap[emotion] || ['it left a deep impression'];
    return options[Math.floor(Math.random() * options.length)];
  }

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
function getPlaceExpression(place: string, lang: Language): string {
  if (lang === 'en') {
    const placeMap: Record<string, string[]> = {
      '家': ['at home', 'in the house', 'in the warmth of home'],
      '学校': ['at school', 'in the classroom', 'on campus'],
      '公园': ['in the park', 'under the trees in the park'],
      '商场': ['in the mall', 'in the bustling mall'],
      '游乐场': ['at the playground', 'in the amusement park'],
      '其他': ['there'],
    };
    const options = placeMap[place] || [place];
    return options[Math.floor(Math.random() * options.length)];
  }

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
export function generateFirstPersonNarrative(memory: RawMemory, lang: Language = 'zh-CN'): string {
  const d = memory.dimensions;
  const time = getTimeExpression(d.temporal.timestamp, lang);
  const person = getPersonExpression(d.social.persons, lang);
  const activity = getActivityExpression(d.activity.type, d.activity.detail, lang);
  const emotion = getEmotionExpression(d.emotional.primary, d.emotional.intensity, lang);
  const place = getPlaceExpression(d.spatial.placeType, lang);

  if (lang === 'en') {
    const templates = [
      `${time}, ${person} was ${activity} ${place}. ${emotion}.`,
      `${time}, ${person} was ${place}, ${activity}. At that moment, ${emotion}.`,
      `I remember ${time}, ${person} was ${activity} ${place}. ${emotion}.`,
      `${time}, ${place}, ${person} was ${activity}. ${emotion}.`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  const templates = [
    `${time}，${person}${place}${activity}。${emotion}。`,
    `${time}，${person}${place}，${activity}。那一刻，${emotion}。`,
    `记得${time}，${person}${place}${activity}。${emotion}。`,
    `${time}，${place}，${person}${activity}。${emotion}。`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}