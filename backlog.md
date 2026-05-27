# GraphMe Backlog

> 基于代码审查自动生成，2026-05-27

---

### 1. [UX] Chat Panel 输入框无法实际发送消息 [✅]

**问题**: ChatPanel 底部输入框和"发送"按钮是死的，用户输入后点击发送没有任何反馈。
**改动范围**:
- `src/components/ChatPanel.tsx`: 为发送按钮绑定点击事件，匹配预设 QA 关键词返回最接近的回答；或在输入框旁加 placeholder 提示"Demo 暂不支持自由提问"
**验证方式**:
1. 在 Chat Panel 输入框输入文字，点击发送
2. 预期：要么返回匹配的预设回答，要么显示友好的提示信息

### 2. [UX] 导航侧栏面板展开时高度溢出 [✅]

**问题**: "记忆管理"面板内容过多（搜索框+导入+表单+列表），展开后容易超出屏幕高度，底部内容被截断。
**改动范围**:
- `src/components/Navigation.tsx`: 为可展开面板区域增加 `max-height` + `overflow-y-auto`
**验证方式**:
1. 展开"记忆管理"面板，展开新建表单和记忆列表
2. 缩小浏览器窗口高度
3. 预期：面板内容可滚动，不截断

### 3. [Performance] 记忆列表只显示最近 30 条，无分页或虚拟滚动 [✅]

**问题**: `filtered.slice(-30).reverse()` 硬编码截取最后 30 条记忆，用户无法查看更早的记忆。
**改动范围**:
- `src/components/Navigation.tsx`: 增加分页或"加载更多"按钮
**验证方式**:
1. 记忆管理面板中，确认列表可加载更多条目
2. 预期：不再硬性截断为 30 条

### 4. [Stability] 删除记忆时无确认步骤 [✅]

**问题**: 删除按钮直接执行 `deleteMemory()`，没有二次确认。误删会导致关联洞察失去依据链。
**改动范围**:
- `src/components/DetailPanel.tsx`: 删除按钮增加 inline 确认
- `src/components/Navigation.tsx`: 记忆列表删除按钮增加 inline 确认
**验证方式**:
1. 点击删除按钮，按钮变为"确认删除？"
2. 再次点击才真正删除
3. 不点击则自动恢复

### 5. [Stability] 记忆编辑的 updateMemory 浅合并导致数据丢失 [✅]

**问题**: `updateMemory` 使用 `{ ...m, ...updates }` 浅合并，传入嵌套 `dimensions` 对象时会完全覆盖整个 `dimensions`，丢失未编辑的子字段。
**改动范围**:
- `src/store/AppContext.tsx`: 改为深度合并（deep merge），或在 `saveEdit` 中显式保留所有未修改的 dimensions 子字段
**验证方式**:
1. 编辑一条记忆的"情绪"字段，保存
2. 检查该记忆的 temporal、social、sensory 等其他维度字段是否保留
3. 预期：只有被编辑的字段变化，其余字段不变

### 6. [UX] Memory Bank 面板中关联记忆是硬编码 [✅]

**问题**: 展开维度详情后显示的"关联记忆"是硬编码的 3 条假数据，与实际记忆数据无关。
**改动范围**:
- `src/components/MemoryBank.tsx`: 从 `rawMemories` 中根据维度类型动态筛选真实记忆
**验证方式**:
1. 打开 Memory Bank，展开任一维度
2. 预期：关联记忆列表来自实际数据，而非固定文本

### 7. [UX] 维度切换器功能未实现 [✅]

**问题**: PRD 定义了维度切换器（家庭/学习/情绪/全局视图），types 中有 `DimensionView`，但 UI 中没有切换入口。`currentView` 状态存在但未被消费。
**改动范围**:
- `src/App.tsx`: 增加维度切换按钮组
- `src/components/MemCloud3D.tsx`: 根据 `currentView` 使用对应 `positions` 字段重新布局粒子
**验证方式**:
1. 点击不同视图按钮
2. 预期：3D 星云粒子布局随之切换

### 8. [UX] 创建记忆原子时字段过少 [✅]

**问题**: 创建表单只暴露 label、summary、emotion、placeType、storyline 5 个字段，其余维度全部硬编码默认值。
**改动范围**:
- `src/components/Navigation.tsx`: 创建表单增加"人物""活动类型""重要性"字段
**验证方式**:
1. 新建记忆原子，填写人物和活动类型
2. 预期：创建后的记忆在详情面板中正确显示这些字段

### 9. [Features] 洞察记忆面板缺少"确认/纠正/备注"交互 [✅]

**问题**: InsightDetail 只展示版本链和依据链，没有提供用户交互按钮。数据模型中已有 `userConfirmed`、`userCorrection`、`userNote` 字段。
**改动范围**:
- `src/components/DetailPanel.tsx`: 洞察详情底部增加"确认/纠正/备注"按钮
- `src/store/AppContext.tsx`: 增加 `updateInsight` 方法
**验证方式**:
1. 点击洞察记忆，详情面板底部显示三个操作按钮
2. 点击"确认"→ `userConfirmed` 变为 true
3. 点击"备注"→ 弹出文本输入，保存到 `userNote`

### 10. [Performance] InsightNetworkLines O(n²) 距离计算 [✅]

**问题**: 洞察连线使用两两距离计算，当前限制 `maxInsights=100` 但算法复杂度仍是 O(n²)。
**改动范围**:
- `src/components/MemCloud3D.tsx`: 预计算连接关系或使用空间哈希加速近邻查找
**验证方式**:
1. 导入大量洞察记忆（如 ChatGPT 数据）
2. 预期：3D 渲染帧率不低于 30fps

### 11. [UX] 暗色/亮色主题切换时 3D Canvas 闪烁 [✅]

**问题**: `key={bgColor}` 强制 Canvas 在主题切换时完全重建，导致短暂黑屏闪烁。
**改动范围**:
- `src/components/MemCloud3D.tsx`: 去掉 `key` prop，改为动态更新 clearColor 和材质颜色
**验证方式**:
1. 反复切换暗色/亮色主题
2. 预期：3D 场景平滑过渡，无闪烁

### 12. [Features] 测试覆盖不足，缺乏边界情况测试 [✅]

**问题**: 165 个测试全部通过，但可能只覆盖 happy path，缺少边界情况测试。
**改动范围**:
- `src/__tests__/`: 增加空记忆列表、超长输入、特殊字符、并发状态更新等测试
**验证方式**:
1. `npm run test` 全部通过
2. 新增测试覆盖边界场景

### 13. [Stability] 全局状态管理缺乏 undo/redo 能力 [✅]

**问题**: 用户删除或编辑记忆后无法撤销，对涉及数据资产的操作缺乏安全感。
**改动范围**:
- `src/store/AppContext.tsx`: 引入简单 undo 栈（最近 5 步快照），或删除时保留到"回收站"
**验证方式**:
1. 删除一条记忆，点击"撤销"
2. 预期：记忆恢复到删除前状态

### 14. [Security] ChatGPT 导入 setInterval 无错误处理和清理 [✅]

**问题**: `startChatGPTImport` 使用 `setInterval` 模拟导入进度，组件卸载时未清除会导致内存泄漏。
**改动范围**:
- `src/store/AppContext.tsx`: 在 cleanup 中清除 interval，或改用 `requestAnimationFrame` + 超时
**验证方式**:
1. 开始 ChatGPT 导入，在进度条跑完前切换页面/关闭面板
2. 预期：无控制台错误，无内存泄漏警告

### 15. [Bug] 视图切换后 3D 星云粒子布局不更新 [✅]

**问题**: 点击全局/家庭/学习/情绪视图按钮后，3D 星云粒子位置不变。根因：Canvas 使用 `frameloop="demand"` 但视图切换时无 `invalidate()` 调用；`<points>` key 不含 `currentView` 导致 geometry 未重建；ClusterTags/HoldTagController/ParticlePositionProjector 始终使用 `position3D` 而非 per-view positions。
**改动范围**:
- `src/components/MemCloud3D.tsx`: InteractionLoop 增加 currentView 变化时 invalidate()；points key 加入 currentView；ClusterTags、HoldTagController、ParticlePositionProjector 改用 per-view positions
**验证方式**:
1. 点击不同视图按钮（全局/家庭/学习/情绪）
2. 预期：3D 星云粒子布局随之切换，标签跟随粒子移动
3. 长按粒子，预期：命中检测与可见粒子位置一致

### 16. [UX] 外部 Agent 记忆区域可见性不足 [✅]

**问题**: "外部 Agent 记忆"是 demo 的重要卖点，但标签和按钮使用 `text-gray-500`/`text-gray-400` 等低调灰色，与背景融为一体，用户容易忽略。
**改动范围**:
- `src/components/Navigation.tsx`: 将容器、标签、按钮的配色从灰色改为青色/蓝色主题色，增加脉冲圆点指示器和徽章样式
**验证方式**:
1. 展开"记忆管理"面板，观察"🤖 外部 Agent 记忆"区域
2. 预期：标签为亮色（暗色模式青色/亮色模式蓝色），有脉冲圆点，按钮有彩色背景和徽章

---

## 17. [Bug] Navigation.tsx 模板字符串中的 Tailwind 类不会被构建 [✅]

**问题**: Navigation.tsx 多处使用 `` `${isDark ? 'text-gray-500' : 'text-gray-700'}` `` 嵌套在外层模板字符串中，Tailwind JIT 编译时无法扫描到完整类名，亮色模式下文字颜色可能被 purge 掉而不生效。
**改动范围**:
- `src/components/Navigation.tsx`: 约 10 处模板字符串嵌套改为直接三元拼接，如 `` className={`... ${isDark ? 'text-gray-500' : 'text-gray-700'}`} ``
**验证方式**:
1. 切换到亮色模式，展开图例说明、记忆管理等面板
2. 检查所有文字颜色是否正确显示（非默认黑色）
3. 运行 `npm run build` 确认无 Tailwind purge 警告

## 18. [Stability] DetailPanel 纠正功能使用 window.prompt() 阻塞 UI [✅]

**问题**: 洞察记忆详情中"纠正"按钮使用浏览器原生 prompt() 弹窗，体验差且无法多行输入，与"备注"功能的 inline 输入框风格不一致。
**改动范围**:
- `src/components/DetailPanel.tsx`: 将 prompt() 改为与备注相同的 inline 输入框模式（useState 控制显示/隐藏 + input + 保存按钮）
**验证方式**:
1. 打开一条洞察记忆详情，点击"纠正"按钮
2. 预期：出现 inline 输入框（非浏览器弹窗），输入内容后点击保存
3. 纠正内容正确显示在面板中

## 19. [Stability] 洞察网络连线在导航切换时重复全量计算 [✅]

**问题**: InsightNetworkLines 的 useMemo 依赖 rawMemories/insightMemories 引用，导航切换时引用不变但需要重新过滤子集，导致每次切换都重新执行完整的 O(n²) 连线计算。
**改动范围**:
- `src/components/MemCloud3D.tsx`: 将过滤逻辑和连线计算拆分为两个 useMemo（外层过滤可见子集 + 内层计算连线），或用 useRef 缓存上次计算结果
**验证方式**:
1. 在控制台添加性能计时，反复切换导航分类
2. 预期：导航切换时仅重新过滤和计算可见洞察的连线，耗时显著减少

## 20. [UX] 右侧面板（Chat/ValueDashboard/MemoryBank）互相遮挡且缺少统一管理 [✅]

**问题**: 三个浮动面板（💬 bottom-6、📊 bottom-20、💰 bottom-36）垂直堆叠在同一列，同时打开时互相重叠遮挡。每个面板独立管理 open/close 状态，无互斥或分组逻辑。
**改动范围**:
- `src/store/AppContext.tsx`: 增加右侧面板互斥逻辑（打开一个自动关闭其他），或改为统一的面板管理状态
- `src/components/ChatPanel.tsx`: 适配新的面板管理逻辑
- `src/components/ValueDashboard.tsx`: 适配新的面板管理逻辑
- `src/components/MemoryBank.tsx`: 适配新的面板管理逻辑
**验证方式**:
1. 打开 Chat Panel，再点击 Value Dashboard 按钮
2. 预期：Chat Panel 自动关闭，Value Dashboard 打开
3. 三个面板按钮位置不互相遮挡

## 21. [Features] Memory Bank 全部数据硬编码，未接入真实记忆 [✅]

**问题**: Memory Bank 中 5 个生命维度的值/趋势/预测、心智模型气质画像、维度利率排名、记忆类型增值潜力排行全部是静态假数据，与用户实际记忆完全无关。timeRange 切换（周/月/季）不改变任何数据。
**改动范围**:
- 新增 `src/utils/memoryBankUtils.ts`: 从 rawMemories 动态计算各维度指标（快乐=情绪为快乐的记忆占比×平均强度；社交=有≥2人物的记忆占比等），趋势数据按 timestamp 分组统计
- `src/components/MemoryBank.tsx`: 用动态计算替换硬编码 DIMENSION_DATA，timeRange 切换触发重新计算，气质画像基于实际记忆模式推断
**验证方式**:
1. 删除几条快乐情绪的记忆，打开 Memory Bank
2. 预期：快乐维度的值/趋势随之变化
3. 切换周/月/季，趋势数据范围不同

## 22. [UX] 记忆搜索仅支持精确子串匹配 [✅]

**问题**: 搜索逻辑是简单的 includes()，用户输入"编程课"找不到"上午在编程课上表现得非常投入"中的相关内容。不支持多关键词或模糊匹配。
**改动范围**:
- `src/components/Navigation.tsx`: 实现多关键词 AND 匹配（按空格分词，每项都必须在 id/label/summary 中出现），或引入 fuzzysort/fuse.js 做模糊搜索
**验证方式**:
1. 搜索"编程 课"（带空格），预期返回同时包含"编程"和"课"的记忆
2. 搜索"孩子表现"，预期返回最接近的结果而非"无匹配"

## 23. [UX] Story Board 和 DetailPanel 使用不同的交互模式 [✅]

**问题**: Story Board 是全屏居中 Modal（fixed inset-0 z-50），DetailPanel 是右侧滑入面板（fixed right-0 w-[420px]）。同一应用中两个主要内容查看器使用完全不同的交互范式，增加用户认知负担。
**改动范围**:
- `src/components/Navigation.tsx`: 将 Story Board 从全屏 Modal 改为右侧滑入面板（与 DetailPanel 风格一致），宽度可适当加大到 500px
**验证方式**:
1. 点击"小哥说我"，预期面板从右侧滑入（非全屏居中）
2. 与 DetailPanel 的打开/关闭动画风格一致

## 24. [Performance] 导航过滤逻辑在 Navigation 和 MemCloud3D 之间重复 [✅]

**问题**: Navigation.tsx 的 navMap/subMap 与 MemCloud3D.tsx 的 NAV_MAP/SUB_MAP 是完全相同的映射表，getVisibleMemories 的过滤逻辑与 isMemoryInCategory 高度重复，维护两份容易导致不一致。
**改动范围**:
- `src/utils/navUtils.ts`: 将 NAV_MAP、SUB_MAP、isMemoryInCategory 统一导出
- `src/components/MemCloud3D.tsx`: 移除本地 NAV_MAP/SUB_MAP/isMemoryInCategory，改为从 navUtils 导入
- `src/store/AppContext.tsx`: getVisibleMemories 改用 navUtils 的 isMemoryInCategory
**验证方式**:
1. 导航切换后，3D 粒子和侧栏列表的过滤结果一致
2. `grep -r "NAV_MAP" src/` 仅在 navUtils.ts 中出现一次

## 25. [UX] 创建记忆表单缺少隐私级别设置 [✅]

**问题**: RawMemory 数据模型中有 privacyLevel 字段（公开/家庭可见/仅自己/加密），创建时硬编码为"家庭可见"且 UI 中无任何体现。用户无法控制记忆的可见性。
**改动范围**:
- `src/components/Navigation.tsx`: 创建表单增加隐私级别下拉选择
- `src/components/DetailPanel.tsx`: 编辑表单增加隐私级别下拉选择，详情视图显示当前隐私级别
**验证方式**:
1. 新建记忆时选择"仅自己"隐私级别
2. 打开该记忆详情，预期显示"🔒 仅自己"标签
3. 编辑时可修改隐私级别

## 26. [Features] Chat Panel 无法处理相近问题，缺乏未匹配时的智能提示 [✅]

**问题**: 关键词匹配只返回得分≥1 的最佳匹配，输入"孩子表现如何"（无直接关键词）会返回"Demo 模式下仅支持预设问题"的死胡同回复，没有任何引导。
**改动范围**:
- `src/components/ChatPanel.tsx`: 当无精确匹配时，返回"您是否想问：[最接近的预设问题]？"并附带快捷按钮；或显示所有可问问题的列表
**验证方式**:
1. 输入"孩子表现如何"，点击发送
2. 预期：返回推荐问题列表（非死胡同提示）
3. 点击推荐问题可直接展开对应回答

## 27. [Stability] 无键盘导航和焦点管理 [✅]

**问题**: 整个应用没有 keyboard trap 管理。打开 DetailPanel 后 Tab 键焦点可能跳到背后的 3D Canvas；ESC 键不关闭任何面板；记忆列表项不可用键盘选择。
**改动范围**:
- `src/components/DetailPanel.tsx`: 增加 ESC 键关闭、Tab 焦点锁定在面板内
- `src/components/ChatPanel.tsx`: 增加 ESC 键关闭
- `src/components/MemoryBank.tsx`: 增加 ESC 键关闭
- `src/components/Navigation.tsx`: 列表项增加 tabIndex 和 Enter/Space 处理
**验证方式**:
1. 打开 DetailPanel，按 ESC，预期面板关闭
2. 打开 DetailPanel，反复 Tab，焦点不跳出面板
3. 在记忆列表中用上下箭头导航，Enter 打开详情

## 28. [Performance] MemoryBank 每次渲染都重新计算关联记忆 [✅]

**问题**: getRelatedMemories 在组件每次渲染时对全量 rawMemories 执行 filter + slice，expandedDim 变化时触发整个列表重渲染。
**改动范围**:
- `src/components/MemoryBank.tsx`: 用 useMemo 缓存每个维度的关联记忆，依赖为 [dimId, rawMemories]
**验证方式**:
1. 在 getRelatedMemories 中添加 console.log 计数
2. 反复展开/折叠同一维度，预期只在首次展开时计算一次

## 29. [Features] 导入外部 Agent 记忆仅支持 ChatGPT 模拟数据 [✅]

**问题**: startChatGPTImport 是纯模拟（setInterval 递增进度条），导入的数据来源 chatgptData.ts 是写死的 5+3 条记忆。无法导入真实的外部 Agent 数据。
**改动范围**:
- 新增 `src/utils/importUtils.ts`: 定义统一的导入格式 schema，实现 JSON 解析 + 数据校验 + 格式转换
- `src/components/Navigation.tsx`: 增加 JSON 文件上传入口（input type="file"），替代模拟导入按钮
- `src/store/AppContext.tsx`: 增加 importFromJSON action，将转换后的数据合并到 rawMemories/insightMemories
**验证方式**:
1. 准备一个符合 schema 的 JSON 文件，通过上传按钮导入
2. 预期：3D 星云中出现新增的粒子，导航列表中可看到导入的记忆
3. 上传格式错误的文件，预期显示友好的错误提示

## 30. [Stability] 所有状态仅在内存中，页面刷新即丢失 [✅]

**问题**: 用户创建的记忆、编辑、洞察确认/纠正/备注等所有操作在页面刷新后全部丢失，恢复为 demoData.ts 的初始数据。
**改动范围**:
- `src/store/AppContext.tsx`: 增加 localStorage 持久化层，序列化 rawMemories + insightMemories + 用户操作状态（userConfirmed/userCorrection/userNote），初始化时从 localStorage 读取
**验证方式**:
1. 创建一条新记忆，刷新页面
2. 预期：新记忆仍然存在
3. 对洞察记忆进行确认/纠正操作，刷新页面后操作保留

## 31. [UX] 选择记忆后 3D 相机不飞向目标粒子 [✅]

**问题**: 在侧栏记忆列表中点击一条记忆，详情面板打开但 3D 星云视角不变。用户看到的粒子和刚打开的记忆之间没有视觉关联，空间感断裂。
**改动范围**:
- `src/components/MemCloud3D.tsx`: 监听 selectedMemory 变化，使用 OrbitControls 的 target + camera position 动画平滑飞向目标粒子位置（带 damping 过渡，约 1 秒）
- `src/store/AppContext.tsx`: selectMemory 时可附带一个 cameraFlyTo 标记供 3D 组件消费
**验证方式**:
1. 旋转 3D 星云到某个角度，然后在侧栏点击一条记忆
2. 预期：相机平滑飞向该粒子位置，粒子居中显示，动画约 1 秒完成
3. 动画期间 OrbitControls 不阻塞用户手动操作

## 32. [UX] 3D 星云中缺少搜索和定位能力 [✅]

**问题**: 用户无法在 3D 视图中直接搜索记忆。当前搜索只在侧栏列表中过滤，3D 粒子云没有任何搜索交互。面对 50+ 粒子，用户找不到特定记忆的空间位置。
**改动范围**:
- `src/App.tsx`: 顶部工具栏增加一个浮动搜索框（可折叠的 🔍 图标展开）
- `src/components/MemCloud3D.tsx`: 接收搜索结果 ID，匹配的粒子高亮放大（size ×2 + 发光效果），其余粒子降低透明度；选中搜索结果时触发相机飞行动画
- `src/store/AppContext.tsx`: 增加 searchQuery 状态和 setSearchQuery action
**验证方式**:
1. 在顶部搜索框输入"编程"
2. 预期：匹配的粒子高亮放大，其余粒子半透明，相机飞向匹配粒子群
3. 清空搜索框，所有粒子恢复正常

## 33. [UX] 侧栏记忆列表缺少悬停预览 [✅]

**问题**: 用户在记忆管理列表中浏览时，只能看到 id + label 的单行文字，需要点击才能在详情面板中看到摘要、情绪、人物等关键信息。浏览 50+ 条记忆效率很低。
**改动范围**:
- `src/components/Navigation.tsx`: 记忆列表项增加 onMouseEnter 悬停预览浮层（显示摘要前 50 字、情绪色块 + 情绪名、人物列表、地点），浮层跟随鼠标或固定在列表项右侧
**验证方式**:
1. 在记忆管理列表中悬停在任意一条记忆上
2. 预期：出现浮层显示摘要、情绪、人物、地点等关键信息
3. 鼠标移出后浮层消失，不影响点击编辑/删除操作

## 34. [UX] 编辑记忆后无法撤销 [✅]

**问题**: 当前 undo 栈仅覆盖删除操作。用户误编辑了一条记忆的 label/summary/情绪等字段后无法撤销，只能手动重新编辑恢复。对于涉及数据资产的操作缺乏安全感。
**改动范围**:
- `src/store/AppContext.tsx`: 将 undo 栈从仅存储 RawMemory 扩展为存储 { action: 'delete' | 'edit', snapshot: RawMemory } 结构，updateMemory 时先保存旧快照到 undo 栈
- `src/components/Navigation.tsx`: 撤销按钮文案区分"撤销删除"和"撤销编辑"
**验证方式**:
1. 编辑一条记忆的标签，保存
2. 点击"撤销"按钮
3. 预期：记忆恢复到编辑前的标签内容
4. 连续执行删除→编辑→撤销，预期按 LIFO 顺序逐个恢复

## 35. [UX] 无法按情绪类型筛选记忆 [✅]

**问题**: 导航侧栏支持按地点分类筛选（家庭/学习/社交/兴趣），但无法按情绪类型筛选。用户想查看"所有悲伤的记忆"或"最近快乐的记忆"时没有入口。
**改动范围**:
- `src/components/Navigation.tsx`: 在导航顶部或图例区域增加情绪筛选条（12 种情绪色块按钮，点击高亮选中，支持多选），选中后记忆列表和 3D 粒子同时过滤
- `src/store/AppContext.tsx`: 增加 emotionFilter 状态（EmotionType[]），getVisibleMemories 和 3D 组件同时消费此状态
**验证方式**:
1. 点击"快乐"情绪色块
2. 预期：侧栏列表仅显示快乐情绪的记忆，3D 星云仅显示对应粒子
3. 再点击"悲伤"，预期同时显示快乐和悲伤的记忆（多选）
4. 取消所有选中，恢复全部显示

## 36. [UX] 缺少收藏/置顶功能，高频访问记忆难以快速定位 [✅]

**问题**: 用户反复查看的几条重要记忆（如里程碑事件）每次都需在列表中滚动查找或在 3D 中逐个点击。数据模型中已有 accessCount 字段但 UI 未利用。
**改动范围**:
- `src/store/AppContext.tsx`: 增加 favoriteIds 状态（string[]），toggleFavorite action
- `src/components/DetailPanel.tsx`: 详情面板标题栏增加 ⭐ 收藏按钮
- `src/components/Navigation.tsx`: 记忆列表顶部增加"收藏"分组（置顶显示收藏的记忆），收藏记忆在 3D 中增加小型光晕标识
**验证方式**:
1. 打开一条记忆详情，点击 ⭐ 收藏
2. 预期：该记忆在侧栏列表顶部"收藏"分组中出现
3. 在 3D 星云中，收藏的粒子有额外光晕标识
4. 再次点击 ⭐ 取消收藏

## 37. [UX] 操作后缺乏即时反馈（Toast 通知）

**问题**: 创建记忆、删除记忆、编辑保存、ChatGPT 导入完成等操作后，用户只能通过观察列表变化来确认操作成功。没有全局性的操作反馈机制，尤其在面板关闭后更难感知。
**改动范围**:
- 新增 `src/components/Toast.tsx`: 轻量 Toast 组件（自动消失，支持 success/error/info 类型，固定在右上角或底部居中）
- `src/store/AppContext.tsx`: 增加 toasts 状态和 addToast/removeToast actions
- 各组件在关键操作后调用 addToast：创建成功（"记忆原子已创建"）、删除成功（"已删除，可撤销"）、编辑保存（"已保存"）、导入完成（"已导入 N 条记忆"）
**验证方式**:
1. 创建一条新记忆
2. 预期：右上角出现绿色 Toast "记忆原子已创建"，2 秒后自动消失
3. 删除一条记忆，预期出现 "已删除，可撤销" Toast，带"撤销"快捷按钮

## 38. [UX] 3D 粒子缺少悬停交互，无 tooltip 和连接线高亮

**问题**: 用户在 3D 星云中悬停到粒子上时没有任何视觉反馈——不知道这个粒子是什么记忆、属于什么情绪、与哪些洞察关联。只有长按 400ms 才显示 ClusterTag，普通鼠标悬停完全无响应。
**改动范围**:
- `src/components/MemCloud3D.tsx`: 为 ParticleCloud 增加 onPointerMove/onPointerOut 事件，悬停时显示轻量 HTML tooltip（记忆标签 + 情绪色块 + ID），并高亮该记忆关联的洞察连线（opacity 从 0.3 提升到 0.8）
- 悬停阈值使用现有的 raycaster 距离检测（复用 HoldTagController 的 findNearest 逻辑）
**验证方式**:
1. 鼠标悬停在任意粒子上
2. 预期：出现小 tooltip 显示记忆标签和情绪，关联的洞察连线变亮
3. 鼠标移出后 tooltip 消失，连线恢复正常透明度

## 39. [UX] 3D 记忆星云视觉全面升级：从散点图到星云

**问题**: `pointsMaterial` 未设置 `map` 纹理，Three.js 默认将每个粒子渲染为方形像素，"记忆星云"看起来像散点图而非星云。原始设计意图是"全3D、酷炫"的沉浸式体验，当前视觉效果远未达到。

**设计约束**（来自 PRD 4.2）：
- 目标硬件：2015 MacBook Pro，Intel Iris Pro 集成显卡
- 粒子数上限：60（50 raw + 10 insight）
- 不使用 bloom/glow 后处理
- 目标帧率 >= 30fps

**改动范围**:
- `src/components/MemCloud3D.tsx` — 所有改动集中在此文件，不引入新依赖

**改动清单**:

1. **圆形辉光纹理（核心改动）**
   - 用 canvas 程序化生成 64x64 径向渐变纹理，设为粒子 `map`
   - `AdditiveBlending` 让粒子自然叠加产生星云辉光
   - 性能开销：一张 64x64 canvas 纹理，几乎为零

2. **自定义 ShaderMaterial 替代 pointsMaterial**
   - 支持逐粒子大小（`gl_PointSize`）和透明度
   - 使用 glow 纹理 + vertex colors
   - 性能与 pointsMaterial 无差异（同样的 GPU 指令）

3. **粒子尺寸抖动 + 重要性加权**
   - `importance`（1-10）决定基础大小（0.2-0.8）
   - ±20% 随机偏移打破均匀感
   - 里程碑记忆（`isMilestone`）额外 ×1.5 放大

4. **粒子透明度变化**
   - 每个粒子随机 ±15% 透明度，增加层次感
   - 重要记忆 0.9-1.0，普通记忆 0.6-0.8

5. **Insight 节点增强**
   - 缓慢自转（`useFrame` 中 `rotation.y += delta * 0.15`）
   - 脉冲缩放（`1 + sin(t*2) * 0.05`，微弱呼吸效果）
   - 中心发光 sprite（复用 glow 纹理，强化"洞察光晕"）

6. **悬停交互增强**
   - 复用 `findNearest` 逻辑改为 `onPointerMove` 触发
   - 悬停时：粒子放大、显示 tooltip（标签+情绪色块）、关联连线高亮
   - 通过 lifted state 将 hoveredMemoryId 传给 InsightNetworkLines

7. **背景氛围粒子（轻量星尘）**
   - 80-120 个微小粒子（0.02-0.05 size），透明度 0.1-0.3
   - 缓慢正弦漂移，白色/淡蓝
   - 填补粒子间空间，营造"星云弥漫"感

8. **连线视觉优化**
   - 因果连线（sharedCount >= 5）：实线，较粗
   - 支撑连线（sharedCount >= 2）：虚线
   - 关联连线（sharedCount >= 1）：点线
   - 悬停高亮时连线变实线 + 透明度提升

**验证方式**:
1. `npm run dev` 启动开发服务器
2. 暗色主题：粒子为圆形发光体（非方块）、有大小层次、insight 缓慢自转、背景有星尘
3. 亮色主题：同样检查，确认无视觉异常
4. 悬停粒子：tooltip 出现，关联连线高亮
5. Chrome DevTools Performance：帧率 >= 30fps
6. 切换视图（全局/家庭/学习/情绪）：粒子布局正确更新
