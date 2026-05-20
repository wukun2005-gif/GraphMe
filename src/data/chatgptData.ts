import type { RawMemory, InsightMemory } from '../types';

export const chatgptRawMemories: RawMemory[] = [
  {
    "type": "raw",
    "source": "chatgpt",
    "id": "chatgpt_001",
    "label": "ChatGPT：学习 Python 基础",
    "summary": "向 ChatGPT 请教 Python 入门知识，学习了变量、循环和函数的基本概念，并写了一个简单的猜数字游戏。",
    "dimensions": {
      "temporal": {"timestamp": 1751328000000, "dateType": "普通日", "timeOfDay": "下午", "season": "夏", "duration": 45},
      "spatial": {"placeType": "家", "room": "书房", "landmark": "电脑前"},
      "social": {"persons": [], "relationship": [], "groupInteraction": false, "intimacy": 0.1},
      "emotional": {"primary": "好奇", "intensity": 0.82, "trigger": "学习新编程语言"},
      "activity": {"type": "学习", "detail": "和 ChatGPT 一起学 Python"},
      "sensory": {"images": [], "audio": [], "videos": [], "interactions": []},
      "semantic": {"knowledge": ["Python 变量", "for 循环", "函数定义"], "preferences": {"学习方式": "对话式"}, "skills": ["Python 基础语法"]},
      "value": {"importance": 0.72, "cqi": 0.68, "accessCount": 3, "privacyLevel": "仅自己"},
      "narrative": {"storyline": "编程学习之路", "previousRefs": [], "nextRefs": [], "isMilestone": false},
      "agentState": {"agentType": "构建型", "version": "3.0.0", "status": "active"}
    },
    "position3D": [4.8, -1.5, -3.2],
    "positions": {
      "全局视图": [4.8, -1.5, -3.2],
      "家庭视图": [4.5, -1.2, -2.8],
      "学习视图": [5.2, -0.8, -4.0],
      "情绪视图": [4.0, -2.0, -3.0]
    },
    "color": "#00f2ff",
    "size": 0.8
  },
  {
    "type": "raw",
    "source": "chatgpt",
    "id": "chatgpt_002",
    "label": "ChatGPT：推荐周末亲子菜单",
    "summary": "请 ChatGPT 推荐适合 7 岁孩子的周末菜谱，得到了红烧排骨、番茄炒蛋和南瓜粥三道菜的详细做法。",
    "dimensions": {
      "temporal": {"timestamp": 1751414400000, "dateType": "周末", "timeOfDay": "上午", "season": "夏", "duration": 20},
      "spatial": {"placeType": "家", "room": "厨房", "landmark": "餐桌旁"},
      "social": {"persons": [], "relationship": [], "groupInteraction": false, "intimacy": 0.15},
      "emotional": {"primary": "感激", "intensity": 0.7, "trigger": "获得实用建议"},
      "activity": {"type": "生活", "detail": "搜索菜谱建议"},
      "sensory": {"images": [], "audio": [], "videos": [], "interactions": []},
      "semantic": {"knowledge": ["红烧排骨做法", "番茄炒蛋技巧", "南瓜粥配方"], "preferences": {"口味": "家常"}, "skills": []},
      "value": {"importance": 0.55, "cqi": 0.5, "accessCount": 2, "privacyLevel": "仅自己"},
      "narrative": {"storyline": "家庭生活", "previousRefs": [], "nextRefs": [], "isMilestone": false},
      "agentState": {"agentType": "陪伴型", "version": "3.0.0", "status": "active"}
    },
    "position3D": [5.5, -0.8, -2.5],
    "positions": {
      "全局视图": [5.5, -0.8, -2.5],
      "家庭视图": [5.0, -0.5, -2.2],
      "学习视图": [4.8, -1.0, -2.0],
      "情绪视图": [5.2, -1.5, -2.8]
    },
    "color": "#44ccaa",
    "size": 0.6
  },
  {
    "type": "raw",
    "source": "chatgpt",
    "id": "chatgpt_003",
    "label": "ChatGPT：暑假旅行攻略",
    "summary": "咨询 ChatGPT 关于暑假带孩子去云南的行程规划，获得了大理-丽江-香格里拉 7 天建议路线及注意事项。",
    "dimensions": {
      "temporal": {"timestamp": 1751500800000, "dateType": "普通日", "timeOfDay": "傍晚", "season": "夏", "duration": 35},
      "spatial": {"placeType": "家", "room": "客厅", "landmark": "沙发上"},
      "social": {"persons": [], "relationship": [], "groupInteraction": false, "intimacy": 0.1},
      "emotional": {"primary": "快乐", "intensity": 0.85, "trigger": "期待旅行"},
      "activity": {"type": "规划", "detail": "制定旅行计划"},
      "sensory": {"images": [], "audio": [], "videos": [], "interactions": []},
      "semantic": {"knowledge": ["云南景点", "高原注意事项", "亲子旅行攻略"], "preferences": {"旅行方式": "深度游"}, "skills": []},
      "value": {"importance": 0.78, "cqi": 0.72, "accessCount": 4, "privacyLevel": "仅自己"},
      "narrative": {"storyline": "家庭旅行", "previousRefs": [], "nextRefs": [], "isMilestone": false},
      "agentState": {"agentType": "陪伴型", "version": "3.0.0", "status": "active"}
    },
    "position3D": [3.8, -2.2, -4.0],
    "positions": {
      "全局视图": [3.8, -2.2, -4.0],
      "家庭视图": [3.5, -1.8, -3.5],
      "学习视图": [4.0, -2.5, -3.5],
      "情绪视图": [3.2, -2.5, -4.2]
    },
    "color": "#ffb800",
    "size": 0.7
  },
  {
    "type": "raw",
    "source": "chatgpt",
    "id": "chatgpt_004",
    "label": "ChatGPT：推荐儿童编程书籍",
    "summary": "问 ChatGPT 推荐适合 7-10 岁孩子的编程入门书籍，得到了 5 本书的推荐清单和每本书的简介。",
    "dimensions": {
      "temporal": {"timestamp": 1751587200000, "dateType": "普通日", "timeOfDay": "下午", "season": "夏", "duration": 25},
      "spatial": {"placeType": "家", "room": "书房", "landmark": "书架旁"},
      "social": {"persons": [], "relationship": [], "groupInteraction": false, "intimacy": 0.1},
      "emotional": {"primary": "好奇", "intensity": 0.78, "trigger": "寻找学习资源"},
      "activity": {"type": "搜索", "detail": "查找编程入门资源"},
      "sensory": {"images": [], "audio": [], "videos": [], "interactions": []},
      "semantic": {"knowledge": ["编程启蒙书籍", "儿童编程教育"], "preferences": {"书籍类型": "编程"}, "skills": []},
      "value": {"importance": 0.68, "cqi": 0.65, "accessCount": 2, "privacyLevel": "仅自己"},
      "narrative": {"storyline": "编程学习之路", "previousRefs": [], "nextRefs": [], "isMilestone": false},
      "agentState": {"agentType": "构建型", "version": "3.0.0", "status": "active"}
    },
    "position3D": [4.5, -1.8, -3.8],
    "positions": {
      "全局视图": [4.5, -1.8, -3.8],
      "家庭视图": [4.2, -1.5, -3.2],
      "学习视图": [5.0, -1.2, -4.0],
      "情绪视图": [4.0, -2.2, -3.5]
    },
    "color": "#00f2ff",
    "size": 0.7
  },
  {
    "type": "raw",
    "source": "chatgpt",
    "id": "chatgpt_005",
    "label": "ChatGPT：睡前故事创意",
    "summary": "请 ChatGPT 创作一个关于小宇航员探索火星的原创睡前故事，故事包含勇气、友谊和科学知识三个主题。",
    "dimensions": {
      "temporal": {"timestamp": 1751673600000, "dateType": "普通日", "timeOfDay": "傍晚", "season": "夏", "duration": 15},
      "spatial": {"placeType": "家", "room": "卧室", "landmark": "床边"},
      "social": {"persons": [], "relationship": [], "groupInteraction": false, "intimacy": 0.2},
      "emotional": {"primary": "快乐", "intensity": 0.88, "trigger": "创作亲子故事"},
      "activity": {"type": "创作", "detail": "生成睡前故事"},
      "sensory": {"images": [], "audio": [], "videos": [], "interactions": []},
      "semantic": {"knowledge": ["火星知识", "故事创作"], "preferences": {"故事主题": "太空探险"}, "skills": []},
      "value": {"importance": 0.65, "cqi": 0.6, "accessCount": 3, "privacyLevel": "仅自己"},
      "narrative": {"storyline": "亲子时光", "previousRefs": [], "nextRefs": [], "isMilestone": false},
      "agentState": {"agentType": "陪伴型", "version": "3.0.0", "status": "active"}
    },
    "position3D": [5.0, -0.5, -3.0],
    "positions": {
      "全局视图": [5.0, -0.5, -3.0],
      "家庭视图": [4.8, -0.2, -2.5],
      "学习视图": [4.5, -0.8, -2.8],
      "情绪视图": [5.5, -1.0, -3.2]
    },
    "color": "#ffb800",
    "size": 0.6
  }
];

export const chatgptInsightMemories: InsightMemory[] = [
  {
    "type": "insight",
    "source": "chatgpt",
    "id": "chatgpt_insight_001",
    "category": "trend",
    "statement": "通过 ChatGPT 学习技术类话题的频率在上升",
    "description": "近两个月的 ChatGPT 对话中，编程、科学等技术类话题占比从 30% 上升至 55%，反映出对技术知识的需求增长。",
    "confidence": 0.8,
    "sourceRawMemoryIds": ["chatgpt_001", "chatgpt_004"],
    "reasoningTrace": "基于 ChatGPT 对话话题分类统计",
    "version": 1,
    "generatedAt": 1751673600000,
    "updatedAt": 1751673600000,
    "userConfirmed": false,
    "position3D": [4.6, -1.4, -3.5],
    "color": "#ffb800",
    "size": 0.9
  },
  {
    "type": "insight",
    "source": "chatgpt",
    "id": "chatgpt_insight_002",
    "category": "preference",
    "statement": "偏好通过对话式交互获取实用信息",
    "description": "分析 ChatGPT 对话模式发现，用户倾向于用自然对话方式获取菜谱、旅行攻略、书单推荐等实用信息，而不是单纯搜索。",
    "confidence": 0.75,
    "sourceRawMemoryIds": ["chatgpt_002", "chatgpt_003", "chatgpt_005"],
    "reasoningTrace": "基于对话交互模式分析",
    "version": 1,
    "generatedAt": 1751673600000,
    "updatedAt": 1751673600000,
    "userConfirmed": false,
    "position3D": [4.9, -1.0, -3.3],
    "color": "#ffb800",
    "size": 0.75
  },
  {
    "type": "insight",
    "source": "chatgpt",
    "id": "chatgpt_insight_003",
    "category": "growth",
    "statement": "提问质量从简单搜索发展到结构化需求表达",
    "description": "对比早期的简短提问和最近的详细 prompt，问题从推荐书演变为推荐适合 7-10 岁零基础孩子的 Python 入门书且需要包含项目实践，体现了提问能力的成长。",
    "confidence": 0.72,
    "sourceRawMemoryIds": ["chatgpt_001", "chatgpt_004"],
    "reasoningTrace": "基于提问复杂度和结构化程度变化分析",
    "version": 1,
    "generatedAt": 1751673600000,
    "updatedAt": 1751673600000,
    "userConfirmed": false,
    "position3D": [4.2, -1.2, -3.8],
    "color": "#ffb800",
    "size": 0.8
  }
];