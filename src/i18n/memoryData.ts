import type { Language } from './index';

const MEMORY_EN: Record<string, { label: string; summary: string }> = {
  // === Raw Memories ===
  'mem_001': { label: "Children's Day at the Amusement Park", summary: "Mom and Dad took me to Chaoyang Park playground. I rode the carousel, ate cotton candy — a wonderful day." },
  'mem_002': { label: "Scratch Coding Class — First Animation", summary: "Completed my first animation project on Scratch: a dancing cat. Mom helped me along the way." },
  'mem_003': { label: "Building the Master Kit with Dad", summary: "Built the coding assistant Master Kit with Dad. Took 2 hours for the model module. Dad taught me how to read blueprints." },
  'mem_004': { label: "Bedtime Story — The Three-Body Problem", summary: "Before bed, the AI assistant told me a simplified version of The Three-Body Problem. The Dark Forest rule was so cool!" },
  'mem_005': { label: "Dragon Boat Festival Dumplings", summary: "The whole family made zongzi together for Dragon Boat Festival. I learned to make triangle ones for the first time." },
  'mem_006': { label: "Cried Over a Math Problem", summary: "Couldn't solve a fraction division problem no matter how hard I tried. Got so frustrated I cried. Mom came over and drew diagrams to help me understand." },
  'mem_007': { label: "Xiaoming's Birthday Party", summary: "Went to classmate Xiaoming's birthday party at Pizza Hut. We played lots of games and I met a new friend, Xiaohong." },
  'mem_008': { label: "AI Assistant Mimicking a Puppy", summary: "The AI assistant imitated a puppy bark and cracked me up. I thought the AI was so funny!" },
  'mem_009': { label: "Dad Teaching Me to Ride a Bike", summary: "Saturday afternoon, Dad took me to the open space to learn two-wheel cycling. Fell twice but finally managed a short ride!" },
  'mem_010': { label: "First Manual Coding Project", summary: "Used the coding assistant's manual mode to write a program that draws a square. Did it all by myself without any help from Mom or Dad." },
  'mem_011': { label: "School Sports Day Race", summary: "Ran the 50m dash at school sports day. Came in third in the class — not first but still happy." },
  'mem_012': { label: "Bedtime Story — Harry Potter", summary: "The AI assistant told me Harry Potter and the Philosopher's Stone. I was so excited about the magic school I couldn't fall asleep!" },
  'mem_013': { label: "Mom Away on Business for 3 Days", summary: "Mom went to Shanghai for a business trip. I video-called her every night — missed her so much." },
  'mem_014': { label: "Playing Hide and Seek with AI", summary: "Hid the AI assistant in the closet and let it use its recognition system to find me. Played hide-and-seek all afternoon." },
  'mem_015': { label: "Building a Beetle Car with Dad", summary: "Dad and I built a beetle-shaped car with the coding assistant. It can even be controlled remotely with a phone app!" },
  'mem_016': { label: "Drew a Robot Cat in Art Class", summary: "Art class teacher asked us to draw our favorite toy. I drew the AI assistant — teacher said it looked just like it!" },
  'mem_017': { label: "First Visit to the Planetarium", summary: "School trip to Beijing Planetarium. Saw a huge Earth model and starry sky projection — the solar system was mind-blowing!" },
  'mem_018': { label: "Dad Scolded Me for Too Much Gaming", summary: "Dad found out I played iPad for 3 hours and angrily scolded me. I felt wronged because I was actually finishing a coding task." },
  'mem_019': { label: "Made a New Friend at the Park", summary: "Weekend trip to the neighborhood park. Met a kid my age named Xiaohua on the slide — we played together for a long time." },
  'mem_020': { label: "Coding Assistant Went Offline", summary: "Was in the middle of coding when the assistant suddenly went offline. So sad — my program was almost done but couldn't run it." },
  'mem_021': { label: "Happy Family Time - Fragment 1", summary: "This is the first memory fragment in the Happy Family Time series." },
  'mem_022': { label: "Happy Family Time - Fragment 2", summary: "This is the second memory fragment in the Happy Family Time series." },
  'mem_023': { label: "Happy Family Time - Fragment 3", summary: "This is the third memory fragment in the Happy Family Time series." },
  'mem_024': { label: "Happy Family Time - Fragment 4", summary: "This is the fourth memory fragment in the Happy Family Time series." },
  'mem_025': { label: "Happy Family Time - Fragment 5", summary: "This is the fifth memory fragment in the Happy Family Time series." },
  'mem_026': { label: "Coding Journey - Fragment 1", summary: "First memory fragment in the Coding Journey series." },
  'mem_027': { label: "Coding Journey - Fragment 2", summary: "Second memory fragment in the Coding Journey series." },
  'mem_028': { label: "Coding Journey - Fragment 3", summary: "Third memory fragment in the Coding Journey series." },
  'mem_029': { label: "Coding Journey - Fragment 4", summary: "Fourth memory fragment in the Coding Journey series." },
  'mem_030': { label: "Father-Son Time - Fragment 1", summary: "First memory fragment in the Father-Son Time series." },
  'mem_031': { label: "Father-Son Time - Fragment 2", summary: "Second memory fragment in the Father-Son Time series." },
  'mem_032': { label: "Father-Son Time - Fragment 3", summary: "Third memory fragment in the Father-Son Time series." },
  'mem_033': { label: "School Life - Fragment 1", summary: "First memory fragment in the School Life series." },
  'mem_034': { label: "School Life - Fragment 2", summary: "Second memory fragment in the School Life series." },
  'mem_035': { label: "School Life - Fragment 3", summary: "Third memory fragment in the School Life series." },
  'mem_036': { label: "Social Growth - Fragment 1", summary: "First memory fragment in the Social Growth series." },
  'mem_037': { label: "Social Growth - Fragment 2", summary: "Second memory fragment in the Social Growth series." },
  'mem_038': { label: "Math Learning - Fragment 1", summary: "First memory fragment in the Math Learning series." },
  'mem_039': { label: "Math Learning - Fragment 2", summary: "Second memory fragment in the Math Learning series." },
  'mem_040': { label: "Bedtime Reading - Fragment 1", summary: "First memory fragment in the Bedtime Reading series." },
  'mem_041': { label: "Bedtime Reading - Fragment 2", summary: "Second memory fragment in the Bedtime Reading series." },
  'mem_042': { label: "Daily Life with AI - Fragment 1", summary: "First memory fragment in the Daily Life with AI series." },
  'mem_043': { label: "Family Emotions - Fragment 1", summary: "First memory fragment in the Family Emotions series." },
  'mem_044': { label: "Family Emotions - Fragment 2", summary: "Second memory fragment in the Family Emotions series." },
  'mem_045': { label: "Daily Memory Fragment", summary: "Supplementary memory #25." },
  'mem_046': { label: "Daily Memory Fragment", summary: "Supplementary memory #26." },
  'mem_047': { label: "Daily Memory Fragment", summary: "Supplementary memory #27." },
  'mem_048': { label: "Daily Memory Fragment", summary: "Supplementary memory #28." },
  'mem_049': { label: "Daily Memory Fragment", summary: "Supplementary memory #29." },
  'mem_050': { label: "Daily Memory Fragment", summary: "Supplementary memory #30." },

  // === ChatGPT Memories ===
  'chatgpt_001': { label: "ChatGPT: Learning Python Basics", summary: "Imported from ChatGPT chat history." },
  'chatgpt_002': { label: "ChatGPT: Weekend Family Menu", summary: "Imported from ChatGPT chat history." },
  'chatgpt_003': { label: "ChatGPT: Summer Travel Guide", summary: "Imported from ChatGPT chat history." },
  'chatgpt_004': { label: "ChatGPT: Kids Coding Book Recs", summary: "Imported from ChatGPT chat history." },
  'chatgpt_005': { label: "ChatGPT: Bedtime Story Ideas", summary: "Imported from ChatGPT chat history." },
};

const INSIGHT_EN: Record<string, { statement: string; description: string }> = {
  'insight_001': { statement: "Interest in visual programming is rising", description: "Clear trend from manual coding to visual programming tools" },
  'insight_002': { statement: "Outdoor activity frequency spikes on weekends", description: "Weekend outdoor memory density is 3x that of weekdays" },
  'insight_003': { statement: "Believes effort can solve hard problems", description: "Shows persistent attempt tendency when facing difficulties" },
  'insight_004': { statement: "Enjoys collaboration over competition", description: "Emotion intensity in collaborative activities significantly higher than competitive ones" },
  'insight_005': { statement: "Most interaction with Dad is through building/assembly games", description: "65% of father-son interactions are building/assembly activities" },
  'insight_006': { statement: "Social circle centers on 2-3 core friends", description: "The same 2-3 people appear repeatedly in social memories" },
  'insight_007': { statement: "Has a consistent bedtime reading habit", description: "Bedtime reading memories cluster between 21:00-21:30" },
  'insight_008': { statement: "Math intuition transitioning from concrete to abstract", description: "Shifting from needing physical aids to symbolic thinking" },
  'insight_009': { statement: "Emotional expression shifting from physical to verbal", description: "Crying/physical expression declining, verbal expression increasing" },
  'insight_010': { statement: "Coping strategy shifting from asking help to independent solving", description: "Help-seeking ratio decreasing, independent attempt ratio increasing" },
  'insight_011': { statement: "Independent task completion brings highest satisfaction", description: "Independent memories average 0.92 emotion intensity, vs 0.80 for collaborative" },
  'insight_012': { statement: "Prefers sci-fi and fantasy stories", description: "Sci-fi/fantasy accounts for 80% of bedtime story preferences" },
  'chatgpt_insight_001': { statement: "Frequency of learning technical topics via ChatGPT is rising", description: "In the last two months, technical topics like programming and science rose from 30% to 55% of ChatGPT conversations, reflecting growing demand for technical knowledge." },
  'chatgpt_insight_002': { statement: "Prefers obtaining practical information through conversational interaction", description: "Analysis shows the user tends to get recipes, travel guides, and book recommendations through natural conversation rather than plain search." },
  'chatgpt_insight_003': { statement: "Question quality evolved from simple search to structured requests", description: "Questions evolved from recommending books to requesting beginner Python books with hands-on projects, showing a growth in question structuring ability." },
};

const FAREWELL_STYLE_EN: Record<string, string> = {
  '深海': 'Deep Sea',
  '星光': 'Starlight',
  '微风': 'Breeze',
};

const STORYLINE_EN: Record<string, string> = {
  '家庭快乐时光': 'Happy Family Time',
  '编程学习之路': 'Coding Journey',
  '父子协作时光': 'Father-Son Time',
  '学校生活': 'School Life',
  '社交成长': 'Social Growth',
  '数学学习历程': 'Math Learning',
  '睡前阅读习惯': 'Bedtime Reading',
  '和智能助手的日常': 'Daily Life with AI',
  '和 智能助手 的日常': 'Daily Life with AI',
  '家庭情感': 'Family Emotions',
  '日常': 'Daily Life',
  '亲子时光': 'Parent-Child Time',
  '家庭旅行': 'Family Travel',
  '家庭生活': 'Family Life',
  '小明的成长日记': "Xiaoming's Growth Diary",
  '科幻兴趣': 'Sci-Fi Interest',
};

/**
 * 运行时注册表：导入记忆（import_*）无法预先录入 MEMORY_EN，
 * 导入时若源 JSON 携带英文字段（labelEn/summaryEn），在此登记后即可全端生效。
 */
const RUNTIME_MEMORY_EN: Record<string, { label: string; summary: string }> = {};

export function registerRuntimeMemoryEn(id: string, label: string, summary: string): void {
  RUNTIME_MEMORY_EN[id] = { label, summary };
}

export function memoryLabelT(lang: Language, id: string, fallback: string): string {
  if (lang === 'zh-CN') return fallback;
  const entry = MEMORY_EN[id] ?? RUNTIME_MEMORY_EN[id];
  return entry?.label ?? fallback;
}

export function memorySummaryT(lang: Language, id: string, fallback: string): string {
  if (lang === 'zh-CN') return fallback;
  const entry = MEMORY_EN[id] ?? RUNTIME_MEMORY_EN[id];
  return entry?.summary ?? fallback;
}

export function insightStatementT(lang: Language, id: string, fallback: string): string {
  if (lang === 'zh-CN') return fallback;
  const entry = INSIGHT_EN[id];
  return entry?.statement ?? fallback;
}

export function insightDescriptionT(lang: Language, id: string, fallback: string): string {
  if (lang === 'zh-CN') return fallback;
  const entry = INSIGHT_EN[id];
  return entry?.description ?? fallback;
}

export function farewellStyleNameT(lang: Language, style: string): string {
  if (lang === 'zh-CN') return style;
  return FAREWELL_STYLE_EN[style] ?? style;
}

export function storylineNameT(lang: Language, storyline: string): string {
  if (lang === 'zh-CN') return storyline;
  return STORYLINE_EN[storyline] ?? storyline;
}
