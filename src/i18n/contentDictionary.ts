/**
 * 补充内容字典（中文 → 英文）
 *
 * 背景：项目数据是中文硬编码的，早期 i18n 采用「渲染点逐条调用 helper」的方式，
 * 导致任何遗漏的渲染点都会泄漏中文。为彻底解决，改为「数据层统一本地化」：
 * 由 localize.ts 深遍历记忆对象，对每个字符串字段查本字典。
 *
 * 本文件存放 dataTranslations.ts 中 CONTENT_MAP 未覆盖的条目，两者合并后作为
 * 唯一权威字典。新增中文数据时，只需在此登记即可被全端覆盖。
 *
 * 维护约定：key 必须是数据文件中出现的**完整原文**，不做分词。
 */

/** 品牌/产品代称（数据里用通用词替换了真实品牌名） */
export const BRAND_CONTENT: Record<string, string> = {
  '智能助手': 'AI assistant',
  '编程助手': 'coding assistant',
  '图形编程工具': 'visual coding tool',
  '机器人助手': 'robot assistant',
  '编程机器人': 'coding robot',
};

/**
 * 系统占位符 / 导入默认值。
 * importUtils 生成导入记忆时会写入这些固定中文值（landmark/trigger/room），
 * 英文模式下必须翻译，否则「Place 导入」这类占位符会直接露出。
 */
const PLACEHOLDER_CONTENT: Record<string, string> = {
  '导入': 'Imported',
  '未知': 'Unknown',
  '手动添加': 'Manually Added',
  '未指定': 'Unspecified',
  '未分类': 'Uncategorized',
};

/**
 * 导入样本数据（public/sample-import.json）的中文值。
 * 导入记忆是运行时生成的，不在静态字典里，必须在此登记才能全端覆盖。
 * 有回归测试守护：src/__tests__/i18n-import.test.ts 会解析该 JSON 并断言零残留，
 * 因此 sample-import.json 新增内容后，测试会先失败、提醒补这里。
 */
const IMPORT_SAMPLE_CONTENT: Record<string, string> = {
  // --- 记忆 1：第一次骑自行车 ---
  '第一次骑自行车': 'First Time Riding a Bike',
  '在小区花园里学会了骑自行车，爸爸在后面扶着，摔了两次但最后成功了。':
    'Learned to ride a bike in the community garden. Dad held on from behind — I fell twice but finally made it.',
  '成长里程碑': 'Growth Milestone',
  '平衡技巧': 'balance technique',

  // --- 记忆 2：生日蛋糕 DIY ---
  '生日蛋糕DIY': 'Birthday Cake DIY',
  '和妈妈一起做了草莓生日蛋糕，虽然奶油涂得不太均匀，但味道超级棒。':
    'Made a strawberry birthday cake with Mom. The frosting was a bit uneven, but it tasted amazing.',
  '烘焙基础': 'baking basics',

  // --- 记忆 3：看《三体》有感 ---
  '看《三体》有感': 'Thoughts on The Three-Body Problem',
  '科幻文学': 'sci-fi literature',
  '科幻兴趣': 'Sci-Fi Interest',
  '宇宙的奥秘': 'mysteries of the universe',
  '读完了《三体》第一部，被黑暗森林法则震撼到了，开始思考宇宙的奥秘。':
    'Finished reading The Three-Body Problem (Book I). Shaken by the Dark Forest theory, I started pondering the mysteries of the universe.',

  // --- 记忆 4：和小明吵架又和好 ---
  '和小明吵架又和好': 'Fought with Xiaoming and Made Up',
  '因为抢玩具和好朋友小明吵了一架，后来主动道歉，两人又开心地一起玩了。':
    'Argued with my good friend Xiaoming over a toy. Later I apologized first, and we happily played together again.',
  '友谊故事': 'Friendship Stories',
  '冲突解决': 'conflict resolution',

  // --- 记忆 5：编程课第一堂 ---
  '编程课第一堂': 'First Coding Class',
  '在学校上了第一节Scratch编程课，用积木块让小猫走迷宫，觉得编程好神奇。':
    'Had my first Scratch coding class at school. Used blocks to guide a cat through a maze — programming felt magical.',
  'Scratch基础': 'Scratch basics',
  '编程思维': 'computational thinking',

  // --- 洞察 ---
  '对科技类活动的兴趣明显上升': 'Interest in technology-related activities is clearly rising',
  '从骑自行车到Scratch编程，近半年的活动中科技和探索类占比增长，表明好奇心从传统游戏转向技术领域。':
    'From bike riding to Scratch coding, tech and exploration activities have grown as a share of the past six months, showing curiosity shifting from traditional play toward technology.',
  '基于近半年活动类型统计分析': 'Based on statistical analysis of activity types over the past six months',
};

/** 导入内容常见词（ChatGPT 聊天记录导入的记忆中出现的高频词与已知条目） */
const IMPORTED_CONTENT: Record<string, string> = {
  ...IMPORT_SAMPLE_CONTENT,
};

/** 感官交互（sensory.interactions） */
const INTERACTIONS: Record<string, string> = {
  '大笑': 'Laughing',
  '专注': 'Focused',
  '兴奋': 'Excited',
  '鼓掌': 'Clapping',
  '拥抱': 'Hugging',
  '聊天': 'Chatting',
  '唱歌': 'Singing',
  '跳舞': 'Dancing',
  '观察': 'Observing',
  '提问': 'Asking questions',
  '哭泣': 'Crying',
};

/** 偏好键（semantic.preferences 的 key） */
const PREFERENCE_KEYS: Record<string, string> = {
  '游乐设施': 'Rides',
  '编程工具': 'Coding tool',
  '拼装方式': 'Assembly method',
  '故事类型': 'Story type',
  '粽子口味': 'Zongzi filling',
  '派对活动': 'Party activity',
  '智能助手行为': 'AI assistant behavior',
  '编程方式': 'Coding method',
  '运动项目': 'Sport event',
  '游戏类型': 'Game type',
  '拼装项目': 'Assembly project',
  '绘画题材': 'Drawing subject',
  '科学兴趣': 'Science interest',
  '交友方式': 'How to make friends',
  '学习方式': 'Learning style',
  '口味': 'Flavor',
  '旅行方式': 'Travel style',
  '书籍类型': 'Book type',
};

/** 偏好值（semantic.preferences 的 value） */
const PREFERENCE_VALUES: Record<string, string> = {
  '咸蛋黄': 'Salted egg yolk',
  '能动的': 'Movable',
  '天文学': 'Astronomy',
  '主动搭话': 'Striking up conversation',
  '看图纸': 'Reading blueprints',
  '旋转木马': 'Carousel',
  '科幻': 'Sci-fi',
  '奇幻': 'Fantasy',
  '猜谜游戏': 'Guessing games',
  '模仿动物': 'Animal imitation',
  '短跑': 'Sprint',
  '对话式': 'Conversational',
  '家常': 'Home-style',
  '深度游': 'In-depth travel',
  '太空探险': 'Space adventure',
};

/**
 * 活动类型的纯文本译文（dimensions.activity.type）。
 * 注意：dataTranslations 的 ACTIVITY_MAP 带 emoji 前缀，适合独立展示；
 * 但 activity.type 常被嵌入句子或与其他图标并列，用带 emoji 的版本会重复，
 * 因此这里单独维护一份无 emoji 的纯文本映射。
 */
const ACTIVITY_PLAIN: Record<string, string> = {
  '活动': 'Activity',
  '学习': 'Learning',
  '游戏': 'Games',
  '对话': 'Dialog',
  '探索': 'Exploration',
  '创作': 'Creating',
  '运动': 'Sports',
  '绘画': 'Drawing',
  '游玩': 'Playing',
  '拼装': 'Assembly',
  '骑车': 'Cycling',
  '阅读': 'Reading',
  '编程': 'Coding',
  '散步': 'Walking',
  '购物': 'Shopping',
  '做饭': 'Cooking',
  '唱歌': 'Singing',
  '跳舞': 'Dancing',
  '手工': 'Craft',
  '实验': 'Experiment',
  '观察': 'Observing',
  '交流': 'Communicating',
  '搭建': 'Building',
  '参观': 'Visiting',
  '娱乐': 'Entertainment',
  '搜索': 'Searching',
  '沟通': 'Communication',
  '生活': 'Daily Life',
  '社交': 'Socializing',
  '艺术': 'Art',
  '规划': 'Planning',
};

/** 推理依据（insight.reasoningTrace） */
const REASONING_TRACE: Record<string, string> = {
  '基于编程相关记忆的类型统计': 'Type statistics based on programming-related memories',
  '基于周末vs平日户外记忆数量对比': 'Comparison of weekend vs weekday outdoor memory counts',
  '基于挫折→成功模式的记忆链分析': 'Memory chain analysis based on setback→success patterns',
  '基于社交记忆中情绪强度的对比分析': 'Comparative analysis of emotion intensity in social memories',
  '基于父子互动记忆的活动类型统计': 'Activity type statistics based on father-son interaction memories',
  '基于社交记忆中人物出现频次统计': 'Frequency statistics of people appearing in social memories',
  '基于阅读类记忆的时间戳聚类分析': 'Timestamp clustering analysis of reading-related memories',
  '基于数学记忆的认知层次分析': 'Cognitive level analysis based on math memories',
  '基于情绪表达方式的类型统计': 'Type statistics based on emotional expression patterns',
  '基于挫折→应对方式的模式分析': 'Pattern analysis based on setback→coping-style',
  '基于独立vs协作任务的情绪强度对比': 'Emotion intensity comparison of independent vs collaborative tasks',
  '基于故事类型偏好的统计': 'Statistics based on story type preferences',
  '基于 ChatGPT 对话话题分类统计': 'Topic classification statistics based on ChatGPT conversations',
  '基于对话交互模式分析': 'Analysis based on conversational interaction patterns',
  '基于提问复杂度和结构化程度变化分析': 'Analysis of changes in question complexity and structure',
};

/** 记忆标题/摘要兜底（正常情况下由 MEMORY_EN 按 id 覆盖，此处作为二次保险） */
const MEMORY_FALLBACK: Record<string, string> = {
  // labels
  '端午节包粽子': 'Dragon Boat Festival Dumplings',
  '妈妈出差三天': "Mom Away on Business for 3 Days",
  '日常记忆片段': 'Daily Memory Fragment',
  '小明的生日派对': "Xiaoming's Birthday Party",
  '第一次去天文馆': 'First Visit to the Planetarium',
  '六一儿童节游乐园': "Children's Day at the Amusement Park",
  '睡前故事——三体': 'Bedtime Story — The Three-Body Problem',
  '爸爸教我骑自行车': 'Dad Teaching Me to Ride a Bike',
  '美术课画了机器猫': 'Drew a Robot Cat in Art Class',
  '在公园认识新朋友': 'Made a New Friend at the Park',
  '编程助手 离线了': 'Coding Assistant Went Offline',
  '和爸爸拼装大师套装': 'Building the Master Kit with Dad',
  '数学题做不出来哭了': 'Cried Over a Math Problem',
  '智能助手 学小狗叫': 'AI Assistant Mimicking a Puppy',
  '学校运动会跑步比赛': 'School Sports Day Race',
  '睡前故事——哈利波特': 'Bedtime Story — Harry Potter',
  '和 智能助手 捉迷藏': 'Playing Hide and Seek with AI',
  '和爸爸拼装甲壳虫小车': 'Building a Beetle Car with Dad',
  '爸爸批评我玩太多游戏': 'Dad Scolded Me for Too Much Gaming',
  '完成第一个手动编程项目': 'Completed First Manual Coding Project',
  '图形编程工具 编程课——第一个动画': 'Visual Coding Class — First Animation',
  '学校生活 - 片段1': 'School Life - Fragment 1',
  '学校生活 - 片段2': 'School Life - Fragment 2',
  '学校生活 - 片段3': 'School Life - Fragment 3',
  '社交成长 - 片段1': 'Social Growth - Fragment 1',
  '社交成长 - 片段2': 'Social Growth - Fragment 2',
  '家庭情感 - 片段1': 'Family Emotions - Fragment 1',
  '家庭情感 - 片段2': 'Family Emotions - Fragment 2',
  '家庭快乐时光 - 片段1': 'Happy Family Time - Fragment 1',
  '家庭快乐时光 - 片段2': 'Happy Family Time - Fragment 2',
  '家庭快乐时光 - 片段3': 'Happy Family Time - Fragment 3',
  '家庭快乐时光 - 片段4': 'Happy Family Time - Fragment 4',
  '家庭快乐时光 - 片段5': 'Happy Family Time - Fragment 5',
  '编程学习之路 - 片段1': 'Coding Journey - Fragment 1',
  '编程学习之路 - 片段2': 'Coding Journey - Fragment 2',
  '编程学习之路 - 片段3': 'Coding Journey - Fragment 3',
  '编程学习之路 - 片段4': 'Coding Journey - Fragment 4',
  '父子协作时光 - 片段1': 'Father-Son Time - Fragment 1',
  '父子协作时光 - 片段2': 'Father-Son Time - Fragment 2',
  '父子协作时光 - 片段3': 'Father-Son Time - Fragment 3',
  '数学学习历程 - 片段1': 'Math Learning - Fragment 1',
  '数学学习历程 - 片段2': 'Math Learning - Fragment 2',
  '睡前阅读习惯 - 片段1': 'Bedtime Reading - Fragment 1',
  '睡前阅读习惯 - 片段2': 'Bedtime Reading - Fragment 2',
  '和 智能助手 的日常 - 片段1': 'Daily Life with AI - Fragment 1',
  'ChatGPT：学习 Python 基础': 'ChatGPT: Learning Python Basics',
  'ChatGPT：推荐周末亲子菜单': 'ChatGPT: Weekend Family Menu',
  'ChatGPT：暑假旅行攻略': 'ChatGPT: Summer Travel Guide',
  'ChatGPT：推荐儿童编程书籍': 'ChatGPT: Kids Coding Book Recommendations',
  'ChatGPT：睡前故事创意': 'ChatGPT: Bedtime Story Ideas',

  // summaries
  '这是第25条补充记忆。': 'This is supplementary memory #25.',
  '这是第26条补充记忆。': 'This is supplementary memory #26.',
  '这是第27条补充记忆。': 'This is supplementary memory #27.',
  '这是第28条补充记忆。': 'This is supplementary memory #28.',
  '这是第29条补充记忆。': 'This is supplementary memory #29.',
  '这是第30条补充记忆。': 'This is supplementary memory #30.',
  '这是学校生活系列的第1个记忆片段。': 'This is the 1st memory fragment in the School Life series.',
  '这是学校生活系列的第2个记忆片段。': 'This is the 2nd memory fragment in the School Life series.',
  '这是学校生活系列的第3个记忆片段。': 'This is the 3rd memory fragment in the School Life series.',
  '这是社交成长系列的第1个记忆片段。': 'This is the 1st memory fragment in the Social Growth series.',
  '这是社交成长系列的第2个记忆片段。': 'This is the 2nd memory fragment in the Social Growth series.',
  '这是家庭情感系列的第1个记忆片段。': 'This is the 1st memory fragment in the Family Emotions series.',
  '这是家庭情感系列的第2个记忆片段。': 'This is the 2nd memory fragment in the Family Emotions series.',
  '这是家庭快乐时光系列的第1个记忆片段。': 'This is the 1st memory fragment in the Happy Family Time series.',
  '这是家庭快乐时光系列的第2个记忆片段。': 'This is the 2nd memory fragment in the Happy Family Time series.',
  '这是家庭快乐时光系列的第3个记忆片段。': 'This is the 3rd memory fragment in the Happy Family Time series.',
  '这是家庭快乐时光系列的第4个记忆片段。': 'This is the 4th memory fragment in the Happy Family Time series.',
  '这是家庭快乐时光系列的第5个记忆片段。': 'This is the 5th memory fragment in the Happy Family Time series.',
  '这是编程学习之路系列的第1个记忆片段。': 'This is the 1st memory fragment in the Coding Journey series.',
  '这是编程学习之路系列的第2个记忆片段。': 'This is the 2nd memory fragment in the Coding Journey series.',
  '这是编程学习之路系列的第3个记忆片段。': 'This is the 3rd memory fragment in the Coding Journey series.',
  '这是编程学习之路系列的第4个记忆片段。': 'This is the 4th memory fragment in the Coding Journey series.',
  '这是父子协作时光系列的第1个记忆片段。': 'This is the 1st memory fragment in the Father-Son Time series.',
  '这是父子协作时光系列的第2个记忆片段。': 'This is the 2nd memory fragment in the Father-Son Time series.',
  '这是父子协作时光系列的第3个记忆片段。': 'This is the 3rd memory fragment in the Father-Son Time series.',
  '这是数学学习历程系列的第1个记忆片段。': 'This is the 1st memory fragment in the Math Learning series.',
  '这是数学学习历程系列的第2个记忆片段。': 'This is the 2nd memory fragment in the Math Learning series.',
  '这是睡前阅读习惯系列的第1个记忆片段。': 'This is the 1st memory fragment in the Bedtime Reading series.',
  '这是睡前阅读习惯系列的第2个记忆片段。': 'This is the 2nd memory fragment in the Bedtime Reading series.',
  '这是和 智能助手 的日常系列的第1个记忆片段。': 'This is the 1st memory fragment in the Daily Life with AI series.',

  '爸爸妈妈带我去朝阳公园游乐场，坐了旋转木马，吃了棉花糖，非常开心的一天。':
    'Mom and Dad took me to Chaoyang Park playground. I rode the carousel and ate cotton candy — a wonderful day.',
  '在 图形编程工具 上完成了第一个动画项目：一只小猫跳舞，妈妈在旁边辅导。':
    'Completed my first animation project on the visual coding tool: a dancing cat. Mom helped me along the way.',
  '和爸爸一起拼装 编程助手 大师套装，花了 2 小时完成模型模块部分。爸爸教我如何看图纸。':
    'Built the coding assistant Master Kit with Dad. Took 2 hours for the model module. Dad taught me how to read blueprints.',
  '晚上睡觉前，智能助手 给我讲了《三体》的简化版故事，讲了黑暗森林法则，我觉得很酷。':
    'Before bed, the AI assistant told me a simplified version of The Three-Body Problem, including the Dark Forest rule. So cool!',
  '端午节全家一起包粽子，我第一次学会包三角粽，虽然包得不太好但很开心。':
    'The whole family made zongzi together for Dragon Boat Festival. I learned to make triangle ones for the first time — not pretty, but I was happy.',
  '做一道分数除法题，怎么也做不出来，急得哭了。妈妈过来教我画图理解。':
    "Couldn't solve a fraction division problem no matter how hard I tried. Got so frustrated I cried. Mom came over and drew diagrams to help me understand.",
  '参加同学小明的生日派对，在必胜客，大家一起玩了很多游戏，认识了新朋友小红。':
    "Went to classmate Xiaoming's birthday party at Pizza Hut. We played lots of games and I met a new friend, Xiaohong.",
  '智能助手 模仿小狗叫，把我逗得哈哈大笑，我觉得 智能助手 太有趣了。':
    'The AI assistant imitated a puppy bark and cracked me up. I thought the AI was so funny!',
  '周六下午爸爸带我去小区空地学骑两轮自行车，摔了两次但最后能骑一小段了！':
    'Saturday afternoon, Dad took me to the open space to learn two-wheel cycling. Fell twice but finally managed a short ride!',
  '用 编程助手 的手动编程模式完成了让 agent 画正方形的程序，完全没让爸爸妈妈帮忙。':
    "Used the coding assistant's manual mode to write a program that draws a square. Did it all by myself without any help from Mom or Dad.",
  '学校运动会参加 50 米短跑，跑了全班第三名，虽然没有跑第一但很开心。':
    'Ran the 50m dash at school sports day. Came in third in the class — not first, but still happy.',
  '智能助手 给我讲哈利波特与魔法石的故事，讲到魔法学校的时候我特别兴奋，睡不着了。':
    "The AI assistant told me Harry Potter and the Philosopher's Stone. I was so excited about the magic school I couldn't fall asleep!",
  '妈妈去上海出差三天，我每天晚上给妈妈打视频电话，很想她。':
    'Mom went to Shanghai on a business trip for three days. I video-called her every night — missed her so much.',
  '把 智能助手 藏在衣柜里，让它用识别系统找到我，玩了一下午捉迷藏游戏。':
    'Hid the AI assistant in the closet and let it use its recognition system to find me. Played hide-and-seek all afternoon.',
  '爸爸和我一起用 编程助手 拼装了一只甲壳虫形状的小车，还能用手机App远程控制它走动。':
    'Dad and I built a beetle-shaped car with the coding assistant. It can even be controlled remotely with a phone app!',
  '美术课上老师让我们画自己最喜欢的玩具，我画了 智能助手，老师表扬说画得很像。':
    'In art class the teacher asked us to draw our favorite toy. I drew the AI assistant — the teacher praised it for looking just like it.',
  '学校组织去北京天文馆，看到了巨大的地球模型和星空投影，太阳系太震撼了。':
    'School trip to Beijing Planetarium. Saw a huge Earth model and starry sky projection — the solar system was mind-blowing!',
  '爸爸发现我玩了 3 小时 iPad，很生气地批评了我，我很委屈，因为我在完成编程任务。':
    'Dad found out I played iPad for 3 hours and angrily scolded me. I felt wronged because I was actually finishing a coding task.',
  '周末去小区公园玩滑梯，认识了一个同龄的小朋友叫小华，一起玩了很久。':
    'Weekend trip to the neighborhood park. Met a kid my age named Xiaohua on the slide — we played together for a long time.',
  '正在编程的时候 编程助手 突然离线了，我很难过，刚写好程序还没运行就关机了。':
    'Was in the middle of coding when the coding assistant suddenly went offline. So sad — my program was almost done but I could not run it.',
  '向 ChatGPT 请教 Python 入门知识，学习了变量、循环和函数的基本概念，并写了一个简单的猜数字游戏。':
    'Asked ChatGPT about Python basics. Learned the concepts of variables, loops and functions, and wrote a simple number-guessing game.',
  '请 ChatGPT 推荐适合 7 岁孩子的周末菜谱，得到了红烧排骨、番茄炒蛋和南瓜粥三道菜的详细做法。':
    'Asked ChatGPT to recommend weekend recipes for a 7-year-old. Got detailed instructions for braised pork ribs, tomato egg stir-fry and pumpkin porridge.',
  '咨询 ChatGPT 关于暑假带孩子去云南的行程规划，获得了大理-丽江-香格里拉 7 天建议路线及注意事项。':
    'Consulted ChatGPT about a summer trip to Yunnan with kids. Got a suggested 7-day Dali-Lijiang-Shangri-La route and precautions.',
  '问 ChatGPT 推荐适合 7-10 岁孩子的编程入门书籍，得到了 5 本书的推荐清单和每本书的简介。':
    'Asked ChatGPT to recommend introductory coding books for 7-10 year olds. Got a list of 5 books with a summary for each.',
  '请 ChatGPT 创作一个关于小宇航员探索火星的原创睡前故事，故事包含勇气、友谊和科学知识三个主题。':
    'Asked ChatGPT to create an original bedtime story about a little astronaut exploring Mars, covering courage, friendship and science.',

  // insight statements
  '孩子对图形化编程的兴趣在上升': 'Interest in visual programming is rising',
  '户外活动频率在周末显著增加': 'Outdoor activity frequency increases significantly on weekends',
  '孩子相信通过努力可以解决难题': 'Believes effort can solve hard problems',
  '比起竞争性活动，孩子更享受协作': 'Enjoys collaboration more than competitive activities',
  '和爸爸互动最多的场景是拼装/搭建类游戏': 'Most interactions with Dad happen in building/assembly games',
  '孩子的社交记忆中反复出现固定的2-3人': 'The same 2-3 people appear repeatedly in social memories',
  '每晚睡前有固定的阅读习惯': 'Has a consistent bedtime reading habit',
  '数学直觉从具象操作向抽象符号过渡': 'Math intuition transitioning from concrete operations to abstract symbols',
  '情绪表达方式从身体动作转向语言表达': 'Emotional expression shifting from physical actions to verbal expression',
  '处理挫折的策略从求助到尝试独立解决': 'Coping strategy shifting from asking for help to attempting independent solutions',
  '独立完成任务带来的满足感最高': 'Completing tasks independently brings the highest satisfaction',
  '倾向于选择科幻和奇幻类故事': 'Tends to choose sci-fi and fantasy stories',
  '社交圈以2-3名核心朋友为主': 'Social circle centers on 2-3 core friends',
  '通过 ChatGPT 学习技术类话题的频率在上升': 'Frequency of learning technical topics via ChatGPT is rising',
  '偏好通过对话式交互获取实用信息': 'Prefers obtaining practical information through conversational interaction',
  '提问质量从简单搜索发展到结构化需求表达': 'Question quality evolved from simple search to structured requests',

  // insight descriptions
  '从手动编程到图形化编程的转变趋势明显': 'A clear trend from manual coding to visual programming tools',
  '周末的户外活动记忆密度是平日的3倍': 'Weekend outdoor memory density is 3x that of weekdays',
  '面对困难时，孩子表现出持续尝试的倾向': 'Shows persistent attempt tendency when facing difficulties',
  '协作类活动的情绪强度显著高于竞争类': 'Emotion intensity in collaborative activities is significantly higher than competitive ones',
  '父子互动中65%为拼装搭建类活动': '65% of father-son interactions are building/assembly activities',
  '睡前阅读记忆的时间分布集中在21:00-21:30': 'Bedtime reading memories cluster between 21:00-21:30',
  '从需要实物辅助到能用符号思考的转变': 'Shifting from needing physical aids to being able to think in symbols',
  '哭泣/肢体表达的频率下降，语言表达频率上升': 'Crying/physical expression declining, verbal expression increasing',
  '面对困难时求助比例下降，独立尝试比例上升': 'Help-seeking ratio decreasing, independent attempt ratio increasing',
  '独立完成记忆的情绪强度平均0.92，高于协作的0.80': 'Independent memories average 0.92 emotion intensity, vs 0.80 for collaborative',
  '睡前故事偏好中科幻/奇幻占80%': 'Sci-fi/fantasy accounts for 80% of bedtime story preferences',
  '近两个月的 ChatGPT 对话中，编程、科学等技术类话题占比从 30% 上升至 55%，反映出对技术知识的需求增长。':
    'In the last two months, technical topics like programming and science rose from 30% to 55% of ChatGPT conversations, reflecting growing demand for technical knowledge.',
  '分析 ChatGPT 对话模式发现，用户倾向于用自然对话方式获取菜谱、旅行攻略、书单推荐等实用信息，而不是单纯搜索。':
    'Analysis of ChatGPT conversation patterns shows the user tends to get recipes, travel guides and book recommendations through natural conversation rather than plain search.',
  '对比早期的简短提问和最近的详细 prompt，问题从推荐书演变为推荐适合 7-10 岁零基础孩子的 Python 入门书且需要包含项目实践，体现了提问能力的成长。':
    'Comparing early short questions with recent detailed prompts, questions evolved from recommending books to requesting beginner Python books for 7-10 year olds with hands-on projects, showing growth in question-structuring ability.',
};

/** 合并后的补充字典：单一入口 */
export const EXTRA_CONTENT: Record<string, string> = {
  ...BRAND_CONTENT,
  ...PLACEHOLDER_CONTENT,
  ...IMPORTED_CONTENT,
  ...INTERACTIONS,
  ...PREFERENCE_KEYS,
  ...PREFERENCE_VALUES,
  ...ACTIVITY_PLAIN,
  ...REASONING_TRACE,
  ...MEMORY_FALLBACK,
};

export default EXTRA_CONTENT;
