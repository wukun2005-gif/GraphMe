import type { Language } from './index';
import { EXTRA_CONTENT } from './contentDictionary';

// Emotion translations (Chinese key -> display text)
const EMOTION_MAP: Record<string, Record<Language, string>> = {
  '快乐': { 'zh-CN': '😊 快乐', 'en': '😊 Happy' },
  '悲伤': { 'zh-CN': '😢 悲伤', 'en': '😢 Sad' },
  '愤怒': { 'zh-CN': '😠 愤怒', 'en': '😠 Angry' },
  '惊讶': { 'zh-CN': '😲 惊讶', 'en': '😲 Surprised' },
  '恐惧': { 'zh-CN': '😨 恐惧', 'en': '😨 Fearful' },
  '厌恶': { 'zh-CN': '🤢 厌恶', 'en': '🤢 Disgusted' },
  '中性': { 'zh-CN': '😐 中性', 'en': '😐 Neutral' },
  '好奇': { 'zh-CN': '🤔 好奇', 'en': '🤔 Curious' },
  '骄傲': { 'zh-CN': '😎 骄傲', 'en': '😎 Proud' },
  '沮丧': { 'zh-CN': '😞 沮丧', 'en': '😞 Frustrated' },
  '感激': { 'zh-CN': '🥹 感激', 'en': '🥹 Grateful' },
  '思念': { 'zh-CN': '💭 思念', 'en': '💭 Missing' },
};

// Emotion name only (no emoji)
const EMOTION_NAME_MAP: Record<string, Record<Language, string>> = {
  '快乐': { 'zh-CN': '快乐', 'en': 'Happy' },
  '悲伤': { 'zh-CN': '悲伤', 'en': 'Sad' },
  '愤怒': { 'zh-CN': '愤怒', 'en': 'Angry' },
  '惊讶': { 'zh-CN': '惊讶', 'en': 'Surprised' },
  '恐惧': { 'zh-CN': '恐惧', 'en': 'Fearful' },
  '厌恶': { 'zh-CN': '厌恶', 'en': 'Disgusted' },
  '中性': { 'zh-CN': '中性', 'en': 'Neutral' },
  '好奇': { 'zh-CN': '好奇', 'en': 'Curious' },
  '骄傲': { 'zh-CN': '骄傲', 'en': 'Proud' },
  '沮丧': { 'zh-CN': '沮丧', 'en': 'Frustrated' },
  '感激': { 'zh-CN': '感激', 'en': 'Grateful' },
  '思念': { 'zh-CN': '思念', 'en': 'Missing' },
};

const PLACE_MAP: Record<string, Record<Language, string>> = {
  '家': { 'zh-CN': '🏠 家', 'en': '🏠 Home' },
  '学校': { 'zh-CN': '🏫 学校', 'en': '🏫 School' },
  '公园': { 'zh-CN': '🌳 公园', 'en': '🌳 Park' },
  '游乐场': { 'zh-CN': '🎡 游乐场', 'en': '🎡 Playground' },
  '商场': { 'zh-CN': '🛍️ 商场', 'en': '🛍️ Mall' },
  '其他': { 'zh-CN': '📍 其他', 'en': '📍 Other' },
};

const ACTIVITY_MAP: Record<string, Record<Language, string>> = {
  '活动': { 'zh-CN': '🎮 活动', 'en': '🎮 Activity' },
  '学习': { 'zh-CN': '📚 学习', 'en': '📚 Learning' },
  '游戏': { 'zh-CN': '🎯 游戏', 'en': '🎯 Game' },
  '对话': { 'zh-CN': '💬 对话', 'en': '💬 Dialog' },
  '探索': { 'zh-CN': '🔍 探索', 'en': '🔍 Explore' },
  '创作': { 'zh-CN': '🎨 创作', 'en': '🎨 Create' },
  '运动': { 'zh-CN': '🏃 运动', 'en': '🏃 Sport' },
  '绘画': { 'zh-CN': '🎨 绘画', 'en': '🎨 Drawing' },
  '游玩': { 'zh-CN': '🎪 游玩', 'en': '🎪 Playing' },
  '拼装': { 'zh-CN': '🔧 拼装', 'en': '🔧 Building' },
  '骑车': { 'zh-CN': '🚲 骑车', 'en': '🚲 Cycling' },
  '阅读': { 'zh-CN': '📖 阅读', 'en': '📖 Reading' },
  '编程': { 'zh-CN': '💻 编程', 'en': '💻 Coding' },
  '散步': { 'zh-CN': '🚶 散步', 'en': '🚶 Walking' },
  '购物': { 'zh-CN': '🛒 购物', 'en': '🛒 Shopping' },
  '做饭': { 'zh-CN': '🍳 做饭', 'en': '🍳 Cooking' },
  '唱歌': { 'zh-CN': '🎤 唱歌', 'en': '🎤 Singing' },
  '跳舞': { 'zh-CN': '💃 跳舞', 'en': '💃 Dancing' },
  '手工': { 'zh-CN': '✂️ 手工', 'en': '✂️ Craft' },
  '实验': { 'zh-CN': '🔬 实验', 'en': '🔬 Experiment' },
  '观察': { 'zh-CN': '🔭 观察', 'en': '🔭 Observing' },
  '交流': { 'zh-CN': '💬 交流', 'en': '💬 Communicating' },
  '搭建': { 'zh-CN': '🏗️ 搭建', 'en': '🏗️ Building' },
  '参观': { 'zh-CN': '🏛️ 参观', 'en': '🏛️ Visit' },
  '娱乐': { 'zh-CN': '🎪 娱乐', 'en': '🎪 Entertainment' },
  '搜索': { 'zh-CN': '🔎 搜索', 'en': '🔎 Search' },
  '沟通': { 'zh-CN': '💬 沟通', 'en': '💬 Communicating' },
  '生活': { 'zh-CN': '🏠 生活', 'en': '🏠 Daily Life' },
  '社交': { 'zh-CN': '🤝 社交', 'en': '🤝 Social' },
  '艺术': { 'zh-CN': '🎨 艺术', 'en': '🎨 Art' },
  '规划': { 'zh-CN': '🗺️ 规划', 'en': '🗺️ Planning' },
};

const PRIVACY_MAP: Record<string, Record<Language, string>> = {
  '公开': { 'zh-CN': '🌐 公开', 'en': '🌐 Public' },
  '家庭可见': { 'zh-CN': '👨‍👩‍👧 家庭可见', 'en': '👨‍👩‍👧 Family' },
  '仅自己': { 'zh-CN': '🔒 仅自己', 'en': '🔒 Private' },
  '加密': { 'zh-CN': '🔐 加密', 'en': '🔐 Encrypted' },
};

const DATE_TYPE_MAP: Record<string, Record<Language, string>> = {
  '普通日': { 'zh-CN': '普通日', 'en': 'Regular Day' },
  '周末': { 'zh-CN': '周末', 'en': 'Weekend' },
  '节日': { 'zh-CN': '节日', 'en': 'Holiday' },
  '生日': { 'zh-CN': '生日', 'en': 'Birthday' },
  '纪念日': { 'zh-CN': '纪念日', 'en': 'Anniversary' },
};

const TIME_OF_DAY_MAP: Record<string, Record<Language, string>> = {
  '清晨': { 'zh-CN': '清晨', 'en': 'Early Morning' },
  '上午': { 'zh-CN': '上午', 'en': 'Morning' },
  '下午': { 'zh-CN': '下午', 'en': 'Afternoon' },
  '傍晚': { 'zh-CN': '傍晚', 'en': 'Evening' },
  '深夜': { 'zh-CN': '深夜', 'en': 'Late Night' },
};

const SEASON_MAP: Record<string, Record<Language, string>> = {
  '春': { 'zh-CN': '春', 'en': 'Spring' },
  '夏': { 'zh-CN': '夏', 'en': 'Summer' },
  '秋': { 'zh-CN': '秋', 'en': 'Autumn' },
  '冬': { 'zh-CN': '冬', 'en': 'Winter' },
};

const AGENT_TYPE_MAP: Record<string, Record<Language, string>> = {
  '陪伴型': { 'zh-CN': '陪伴型', 'en': 'Companion' },
  '构建型': { 'zh-CN': '构建型', 'en': 'Builder' },
};

const CATEGORY_MAP: Record<string, Record<Language, string>> = {
  'trend': { 'zh-CN': '趋势', 'en': 'Trend' },
  'belief': { 'zh-CN': '信念', 'en': 'Belief' },
  'relationship': { 'zh-CN': '关系', 'en': 'Relationship' },
  'preference': { 'zh-CN': '偏好', 'en': 'Preference' },
  'habit': { 'zh-CN': '习惯', 'en': 'Habit' },
  'growth': { 'zh-CN': '成长', 'en': 'Growth' },
};

const NAV_CATEGORY_MAP: Record<string, Record<Language, string>> = {
  '家庭生活': { 'zh-CN': '家庭生活', 'en': 'Family Life' },
  '学习与成长': { 'zh-CN': '学习与成长', 'en': 'Learning & Growth' },
  '社交与情感': { 'zh-CN': '社交与情感', 'en': 'Social & Emotional' },
  '兴趣与探索': { 'zh-CN': '兴趣与探索', 'en': 'Interests & Exploration' },
};

const NAV_SUBCATEGORY_MAP: Record<string, Record<Language, string>> = {
  '快乐时光': { 'zh-CN': '快乐时光', 'en': 'Happy Times' },
  '父子协作': { 'zh-CN': '父子协作', 'en': 'Father-Son Collaboration' },
  '日常生活': { 'zh-CN': '日常生活', 'en': 'Daily Life' },
  '编程学习': { 'zh-CN': '编程学习', 'en': 'Coding' },
  '数学学习': { 'zh-CN': '数学学习', 'en': 'Math' },
  '阅读习惯': { 'zh-CN': '阅读习惯', 'en': 'Reading' },
  '朋友互动': { 'zh-CN': '朋友互动', 'en': 'Friends' },
  '情感表达': { 'zh-CN': '情感表达', 'en': 'Emotional Expression' },
  '户外活动': { 'zh-CN': '户外活动', 'en': 'Outdoor Activities' },
  '科幻兴趣': { 'zh-CN': '科幻兴趣', 'en': 'Sci-Fi Interest' },
};

const DIMENSION_VIEW_MAP: Record<string, Record<Language, string>> = {
  '全局视图': { 'zh-CN': '全局视图', 'en': 'Global View' },
  '家庭视图': { 'zh-CN': '家庭视图', 'en': 'Family View' },
  '学习视图': { 'zh-CN': '学习视图', 'en': 'Learning View' },
  '情绪视图': { 'zh-CN': '情绪视图', 'en': 'Emotion View' },
};

const FAREWELL_STYLE_MAP: Record<string, Record<Language, string>> = {
  '深海': { 'zh-CN': '深海', 'en': 'Deep Sea' },
  '星光': { 'zh-CN': '星光', 'en': 'Starlight' },
  '微风': { 'zh-CN': '微风', 'en': 'Breeze' },
};

function translateMap(map: Record<string, Record<Language, string>>, key: string, lang: Language): string {
  const entry = map[key];
  if (!entry) return key;
  return entry[lang] ?? entry['zh-CN'] ?? key;
}

export function emotionT(lang: Language, emotion: string): string {
  return translateMap(EMOTION_MAP, emotion, lang);
}

export function emotionNameT(lang: Language, emotion: string): string {
  return translateMap(EMOTION_NAME_MAP, emotion, lang);
}

export function placeT(lang: Language, place: string): string {
  return translateMap(PLACE_MAP, place, lang);
}

export function activityT(lang: Language, activity: string): string {
  return translateMap(ACTIVITY_MAP, activity, lang);
}

export function privacyT(lang: Language, privacy: string): string {
  return translateMap(PRIVACY_MAP, privacy, lang);
}

export function dateTypeT(lang: Language, dateType: string): string {
  return translateMap(DATE_TYPE_MAP, dateType, lang);
}

export function timeOfDayT(lang: Language, time: string): string {
  return translateMap(TIME_OF_DAY_MAP, time, lang);
}

export function seasonT(lang: Language, season: string): string {
  return translateMap(SEASON_MAP, season, lang);
}

export function agentTypeT(lang: Language, agentType: string): string {
  return translateMap(AGENT_TYPE_MAP, agentType, lang);
}

export function categoryT(lang: Language, category: string): string {
  return translateMap(CATEGORY_MAP, category, lang);
}

export function navCategoryT(lang: Language, category: string): string {
  return translateMap(NAV_CATEGORY_MAP, category, lang);
}

export function navSubCategoryT(lang: Language, subCategory: string): string {
  return translateMap(NAV_SUBCATEGORY_MAP, subCategory, lang);
}

export function dimensionViewT(lang: Language, view: string): string {
  return translateMap(DIMENSION_VIEW_MAP, view, lang);
}

export function farewellStyleT(lang: Language, style: string): string {
  return translateMap(FAREWELL_STYLE_MAP, style, lang);
}

// Time label for DailyMemoryCard
export function timeLabelT(lang: Language, daysAgo: number): string {
  if (lang === 'en') {
    if (daysAgo < 1) return 'Today';
    if (daysAgo < 365) return `${daysAgo}d ago`;
    return `${Math.floor(daysAgo / 365)}y ago`;
  }
  if (daysAgo < 1) return '今天';
  if (daysAgo < 365) return `${daysAgo} 天前`;
  return `${Math.floor(daysAgo / 365)} 年前`;
}

// Memory label/summary translation helper
// For memory data, we use a mapping approach
const MEMORY_LABEL_MAP: Record<string, Record<Language, string>> = {};

export function registerMemoryTranslation(id: string, zhLabel: string, enLabel: string, zhSummary: string, enSummary: string) {
  MEMORY_LABEL_MAP[id] = { 'zh-CN': zhLabel, 'en': enLabel };
}

export function memoryLabelT(lang: Language, id: string, fallback: string): string {
  const entry = MEMORY_LABEL_MAP[id];
  if (!entry) return fallback;
  return entry[lang] ?? entry['zh-CN'] ?? fallback;
}

// Free-text content (persons, landmarks, rooms, activity details, knowledge, skills)
const CONTENT_MAP: Record<string, string> = {
  // Persons
  '爸爸': 'Dad',
  '妈妈': 'Mom',
  '奶奶': 'Grandma',
  '小明': 'Xiaoming',
  '小红': 'Xiaohong',
  '小华': 'Xiaohua',
  '班主任': 'Class Teacher',
  '体育老师': 'PE Teacher',
  '美术老师': 'Art Teacher',
  // Landmarks
  '客厅': 'Living Room',
  '床上': 'In Bed',
  '床边': 'Beside the Bed',
  '跑道': 'Running Track',
  '书架旁': 'By the Bookshelf',
  '书桌前': 'At the Desk',
  '地板上': 'On the Floor',
  '沙发上': 'On the Sofa',
  '滑梯旁': 'By the Slide',
  '电脑前': 'At the Computer',
  '画架前': 'At the Easel',
  '茶几旁': 'By the Coffee Table',
  '衣柜旁': 'By the Wardrobe',
  '餐桌前': 'At the Dining Table',
  '餐桌旁': 'By the Dining Table',
  '生日包间': 'Birthday Party Room',
  '小区花园旁': 'By the Community Garden',
  '星空投影厅': 'Starry-Sky Projection Hall',
  '朝阳公园旋转木马': 'Chaoyang Park Carousel',
  '手动添加': 'Manually Added',
  '用户手动添加': 'Manually Added',
  // Places (placeType)
  '家': 'Home',
  '学校': 'School',
  '公园': 'Park',
  '商场': 'Mall',
  '其他': 'Other',
  // Rooms
  '书房': 'Study',
  '卧室': 'Bedroom',
  '厨房': 'Kitchen',
  '操场': 'Playground',
  '天文馆': 'Planetarium',
  '必胜客': 'Pizza Hut',
  '游乐场': 'Playground',
  '小区空地': 'Community Open Space',
  '美术教室': 'Art Classroom',
  '儿童游乐区': "Children's Play Area",
  // Activity details
  '50米短跑比赛': '50-meter sprint race',
  '和 ChatGPT 一起学 Python': 'Learned Python basics with ChatGPT',
  '画 智能助手': 'Drew the AI assistant',
  '和 智能助手 互动': 'Interacted with the AI assistant',
  '和 智能助手 的日常活动': 'Daily activities with the AI assistant',
  '包粽子': 'Making zongzi (rice dumplings)',
  '捉迷藏': 'Played hide-and-seek',
  '被批评': 'Being scolded',
  '日常活动': 'Daily activities',
  '视频通话': 'Video calls',
  '智能助手 讲《三体》故事': 'The AI assistant told "The Three-Body Problem"',
  '智能助手 讲哈利波特故事': 'The AI assistant told a Harry Potter story',
  '编程助手 甲壳虫远程控制小车': 'Built a remote-controlled beetle car',
  '编程助手 大师套装——模型模块': 'Built the Master Kit model module',
  '编程助手 手动编程——画正方形': 'Manual coding: drawing a square',
  '编程被中断': 'Coding was interrupted',
  '制定旅行计划': 'Planned a trip',
  '学校生活活动': 'School life activities',
  '家庭情感活动': 'Family emotion activities',
  '搜索菜谱建议': 'Searched recipe suggestions',
  '生成睡前故事': 'Generated a bedtime story',
  '社交成长活动': 'Social growth activities',
  '图形编程工具 动画项目——跳舞的小猫': 'Visual coding: dancing cat animation',
  '北京天文馆参观': 'Visited Beijing Planetarium',
  '学骑两轮自行车': 'Learned to ride a two-wheel bicycle',
  '玩滑梯、捉迷藏': 'Played on the slide and hide-and-seek',
  '家庭快乐时光活动': 'Happy family time activities',
  '数学——分数除法': 'Math: fraction division',
  '数学学习历程活动': 'Math learning activities',
  '查找编程入门资源': 'Searched coding resources',
  '父子协作时光活动': 'Father-son time activities',
  '睡前阅读习惯活动': 'Bedtime reading activities',
  '编程学习之路活动': 'Coding journey activities',
  '旋转木马、吃棉花糖': 'Carousel and cotton candy',
  '生日派对、互动游戏': 'Birthday party and games',
  // Knowledge
  'Python 变量': 'Python variables',
  'for 循环': 'for loops',
  '云南景点': 'Yunnan attractions',
  '函数定义': 'function definitions',
  '故事创作': 'story creation',
  '火星知识': 'Mars facts',
  '南瓜粥配方': 'pumpkin porridge recipe',
  '亲子旅行攻略': 'family travel tips',
  '儿童编程教育': "children's coding education",
  '番茄炒蛋技巧': 'tomato egg stir-fry technique',
  '红烧排骨做法': 'braised pork ribs recipe',
  '编程启蒙书籍': 'coding books for beginners',
  '高原注意事项': 'high-altitude precautions',
  'LiDAR原理': 'LiDAR principles',
  '事件触发': 'event triggering',
  '分数除法': 'fraction division',
  '动画帧': 'animation frames',
  '太阳系结构': 'solar system structure',
  '奇幻文学': 'fantasy literature',
  '循环': 'loops',
  '旋转木马的工作原理': 'how carousels work',
  '机械结构': 'mechanical structures',
  '正方形几何': 'square geometry',
  '状态管理': 'state management',
  '科幻概念': 'sci-fi concepts',
  '端午节传统': 'Dragon Boat Festival traditions',
  '粽子制作': 'zongzi making',
  '自行车平衡原理': 'bicycle balance principles',
  '行星名称': 'planet names',
  '调色技巧': 'color mixing techniques',
  '远程控制原理': 'remote control principles',
  '逻辑驱动': 'logic-driven',
  '顺序执行': 'sequential execution',
  '魔法世界观': 'magic worldbuilding',
  '黑暗森林法则': 'Dark Forest theory',
  '黑洞概念': 'black hole concepts',
  '齿轮传动': 'gear transmission',
  // Relationships
  '同学': 'Classmate',
  '师生': 'Teacher-Student',
  '朋友': 'Friend',
  '母子': 'Mother-Son',
  '父子': 'Father-Son',
  '祖孙': 'Grandparent-Grandchild',
  // Preferences (keys & values)
  '学习方式': 'Learning style',
  '对话式': 'Conversational',
  '口味': 'Flavor',
  '家常': 'Home-style',
  '旅行方式': 'Travel style',
  '深度游': 'In-depth travel',
  '书籍类型': 'Book type',
  '编程': 'Programming',
  '故事主题': 'Story theme',
  '太空探险': 'Space adventure',
  // Emotional triggers
  '交到新朋友': 'Making a new friend',
  '全家一起做传统食物': 'Making traditional food together as a family',
  '分数除法太难了': 'Fraction division was too hard',
  '创作亲子故事': 'Creating a family story',
  '和爸爸一起完成拼装': 'Building with Dad',
  '和爸爸妈妈一起坐旋转木马': 'Riding the carousel with Mom and Dad',
  '妈妈不在家': 'Mom being away from home',
  '学习新编程语言': 'Learning a new programming language',
  '完成远程控制小车很有成就感': 'Sense of achievement from the remote-controlled car',
  '寻找学习资源': 'Looking for learning resources',
  '日常': 'Daily life',
  '星空投影、地球模型': 'Starry-sky projection and Earth model',
  '智能助手 模仿小狗': 'The AI assistant mimicking a puppy',
  '智能助手找到我时很好笑': 'It was funny when the AI assistant found me',
  '期待旅行': 'Looking forward to the trip',
  '派对游戏很好玩': 'Fun party games',
  '第一次完全独立完成编程': 'First fully independent coding',
  '第一次独立做出动画': 'First independent animation',
  '终于能骑一小段了': 'Finally able to ride a short distance',
  '编程助手突然离线': 'Coding assistant suddenly went offline',
  '老师表扬': 'Teacher praised me',
  '获得实用建议': 'Getting practical advice',
  '被误会玩游戏': 'Misunderstood for playing games',
  '触发和 智能助手 的日常的记忆': 'Triggered Daily Life with AI memories',
  '触发学校生活的记忆': 'Triggered School Life memories',
  '触发家庭快乐时光的记忆': 'Triggered Happy Family Time memories',
  '触发家庭情感的记忆': 'Triggered Family Emotions memories',
  '触发数学学习历程的记忆': 'Triggered Math Learning memories',
  '触发父子协作时光的记忆': 'Triggered Father-Son Time memories',
  '触发睡前阅读习惯的记忆': 'Triggered Bedtime Reading memories',
  '触发社交成长的记忆': 'Triggered Social Growth memories',
  '触发编程学习之路的记忆': 'Triggered Coding Journey memories',
  '跑了第三名': 'Came in third',
  '魔法学校的概念很迷人': 'The magic school concept was fascinating',
  '黑暗森林法则很有趣': 'The Dark Forest theory was cool',
  // Skills
  'Python 基础语法': 'Python basics',
  '社交': 'Socializing',
  '绘画': 'Drawing',
  '跑步': 'Running',
  '骑自行车': 'Cycling',
  '手动编程': 'Manual coding',
  '几何思维': 'Geometric thinking',
  '机械拼装': 'Mechanical assembly',
  '图纸阅读': 'Reading blueprints',
  '电路连接': 'Circuit wiring',
  '远程控制操作': 'Remote control operation',
  '图形编程工具基础操作': 'Visual coding basics',
  '动画制作': 'Animation',
};

/**
 * 品牌/产品代称的子串替换兜底。
 * 数据中用通用词替换了真实品牌名（如「智能助手」），它们常嵌入长句内部，
 * 精确匹配难以覆盖，因此在查表未命中时做一次子串归一。
 * 仅使用明确的品牌代称，避免「家」「学校」等短词误伤长句。
 */
const BRAND_TERMS: [string, string][] = [
  ['图形编程工具', 'visual coding tool'],
  ['编程助手', 'coding assistant'],
  ['智能助手', 'AI assistant'],
  ['机器人助手', 'robot assistant'],
  ['编程机器人', 'coding robot'],
];

function applyBrandTerms(text: string): string {
  let out = text;
  for (const [zh, en] of BRAND_TERMS) {
    if (out.includes(zh)) out = out.split(zh).join(en);
  }
  return out;
}

export function contentT(lang: Language, text: string | undefined | null): string {
  if (!text) return text ?? '';
  if (lang === 'zh-CN') return text;
  // 1) 精确匹配主字典（保持既有行为，避免回归）
  // 2) 精确匹配补充字典
  // 3) 品牌代称子串兜底
  return CONTENT_MAP[text] ?? EXTRA_CONTENT[text] ?? applyBrandTerms(text);
}

export function listSepT(lang: Language): string {
  return lang === 'en' ? ', ' : '、';
}

export function joinContentT(lang: Language, items: string[]): string {
  return items.map(item => contentT(lang, item)).join(listSepT(lang));
}

export function dateT(lang: Language, timestamp: number): string {
  const d = new Date(timestamp);
  if (lang === 'en') {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
