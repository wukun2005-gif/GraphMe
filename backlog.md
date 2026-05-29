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

## 37. [UX] 操作后缺乏即时反馈（Toast 通知） [✅]

**问题**: 创建记忆、删除记忆、编辑保存、ChatGPT 导入完成等操作后，用户只能通过观察列表变化来确认操作成功。没有全局性的操作反馈机制，尤其在面板关闭后更难感知。
**改动范围**:
- 新增 `src/components/Toast.tsx`: 轻量 Toast 组件（自动消失，支持 success/error/info 类型，固定在右上角或底部居中）
- `src/store/AppContext.tsx`: 增加 toasts 状态和 addToast/removeToast actions
- 各组件在关键操作后调用 addToast：创建成功（"记忆原子已创建"）、删除成功（"已删除，可撤销"）、编辑保存（"已保存"）、导入完成（"已导入 N 条记忆"）
**验证方式**:
1. 创建一条新记忆
2. 预期：右上角出现绿色 Toast "记忆原子已创建"，2 秒后自动消失
3. 删除一条记忆，预期出现 "已删除，可撤销" Toast，带"撤销"快捷按钮

## 38. [UX] 3D 粒子缺少悬停交互，无 tooltip 和连接线高亮 [✅]

**问题**: 用户在 3D 星云中悬停到粒子上时没有任何视觉反馈——不知道这个粒子是什么记忆、属于什么情绪、与哪些洞察关联。只有长按 400ms 才显示 ClusterTag，普通鼠标悬停完全无响应。
**改动范围**:
- `src/components/MemCloud3D.tsx`: 为 ParticleCloud 增加 onPointerMove/onPointerOut 事件，悬停时显示轻量 HTML tooltip（记忆标签 + 情绪色块 + ID），并高亮该记忆关联的洞察连线（opacity 从 0.3 提升到 0.8）
- 悬停阈值使用现有的 raycaster 距离检测（复用 HoldTagController 的 findNearest 逻辑）
**验证方式**:
1. 鼠标悬停在任意粒子上
2. 预期：出现小 tooltip 显示记忆标签和情绪，关联的洞察连线变亮
3. 鼠标移出后 tooltip 消失，连线恢复正常透明度

## 39. [UX] 3D 记忆星云视觉全面升级：从散点图到星云 [✅]

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

---

### 40. [UX] 记忆日签 / "那年今日" — 每日记忆触点 [✅]

**问题**: 用户打开 GraphMe 后面对的是静态 3D 星云，系统被动展示记忆，从不主动"打招呼"。缺少一个温暖的每日记忆触点——像 iPhone 照片的"回忆"功能。用户可能一周不打开，打开后也没有"今天有什么特别的"的感知。
**改动范围**:
- 新建 `src/components/DailyMemoryCard.tsx`: 优雅的记忆日签卡片组件，展示"历史上的今天"记忆（日期匹配往年同日）或高价值但接近遗忘阈值的记忆，含照片/emoji、摘要、距今多久，5 秒后自动淡出
- `src/App.tsx`: 集成 DailyMemoryCard，在 3D 星云上方显示
- `src/utils/valueUtils.ts`: 新增 `getDailyMemory` 函数，按日期匹配 + 遗忘风险降级策略选取当日推荐记忆
**验证方式**:
1. 打开应用，如有"历史上的今天"记忆，预期顶部浮现日签卡片
2. 如无匹配日期，预期从高遗忘风险记忆中选取一条展示
3. 卡片 5 秒后自动淡出，用户可点击卡片进入记忆详情
4. 刷新页面，同一天展示同一条记忆

### 41. [UX] 记忆衰减可视化 / 遗忘曲线 [✅]

**问题**: `valueUtils.ts` 的 `computeForgettingRisk` 能算出遗忘风险，`ValueDashboard.tsx` 仅以列表展示"即将遗忘的 3 条记忆"。PRD 强调的遗忘曲线概念完全未被可视化——用户看不到记忆随时间如何衰减，也看不到"重温"行为是否减缓了遗忘。
**改动范围**:
- `src/components/ValueDashboard.tsx`: 新增"遗忘曲线"SVG 图表面板，X 轴为天数、Y 轴为记忆 retained 程度，叠加艾宾浩斯理论曲线与用户实际数据点，标注"记忆深渊"（risk > 0.7 的记忆数量），每条数据点可 hover 查看具体记忆
- `src/utils/valueUtils.ts`: 新增 `computeDecayCurve` 函数（返回理论衰减点 + 实际记忆衰减点数组）
- `src/store/AppContext.tsx`: 新增 `reinforceMemory` 方法——调用后记忆 accessCount += 1、CQI 临时提升、遗忘曲线重置
**验证方式**:
1. 打开 ValueDashboard，预期看到遗忘曲线图表
2. 鼠标悬停数据点，预期显示对应记忆标签
3. 点击"重温"按钮，预期对应记忆的衰减曲线回升，遗忘风险降级
4. 关闭 ValueDashboard 后再次打开，重温效果持久

### 42. [UX] 情绪日历热力图 [✅]

**问题**: 时间维度仅以列表或 DetailPanel 中的单条展示，用户无法在宏观层面"一眼看到"哪些天情绪好。PRD §2.2 家长视角中"孩子最近整体心情怎么样？"和"情感趋势曲线"需求未实现。MemoryBank 的趋势线是硬编码模拟数据。
**改动范围**:
- `src/components/ValueDashboard.tsx`: 新增 GitHub 贡献图风格的情绪日历热力图 SVG 组件，每个格子=一天，颜色=当天情绪主色调（快乐=暖金、悲伤=冷蓝、好奇=青），格子大小=记忆数量，hover 显示当天关键事件摘要，默认展示过去 3 个月
- `src/utils/valueUtils.ts`: 新增 `computeDailyEmotionMap` 函数，按天聚合情绪数据返回 { date, primaryEmotion, count, summaries }
**验证方式**:
1. 打开 ValueDashboard，预期看到 3 个月的情绪日历热力图
2. 有记忆的日期显示对应情绪颜色，无记忆的日期为空
3. Hover 某天，出现 tooltip 显示当天记忆摘要
4. 删除一条快乐记忆，对应日期的颜色可能变化

### 43. [Features] 记忆故事编织器 [✅]

**问题**: PRD 数据模型中每条记忆有 `narrative.storyline`、`previousRefs`、`nextRefs`、`isMilestone` 四个叙事字段，`storyUtils.ts` 的 `generateStory` 只生成侧栏"Story Board"的全屏 Modal 文本，没有可视化叙事线体验。
**改动范围**:
- 新建 `src/components/StoryWeaver.tsx`: 用户选择 story line 后，将属于该线记忆按时间排序，展示为可视化叙事时间线——每条记忆是一个节点，节点间彩色轨迹线连接（颜色=情绪变化），节点展示关键照片/文本摘要，顶部自动生成自然语言叙事段落，支持"播放"模式逐节点推进
- `src/utils/storyUtils.ts`: 增强 `generateStory` → 新增 `weaveStoryline` 函数，返回结构化章节数据（节点数组 + 连接线 + 叙事文本）
- `src/components/Navigation.tsx`: Story Board 入口改为打开 StoryWeaver 面板（替代全屏 Modal）
**验证方式**:
1. 在侧栏 Story Board 中选择"小明的编程之旅"
2. 预期：面板展示时间线节点（从早到晚排列），节点间有彩色情绪连线
3. 顶部有自动生成的叙事段落（如"小明从 4 月开始接触手掰编程，到 9 月已能独立完成..."）
4. 点击"播放"，节点逐一亮起推进，叙事文本滚动跟随

### 44. [Features] 时光机 / 时间轴穿梭 [✅]

**问题**: 时间维度的浏览非常薄弱。`currentView` 的四种视图切换均不是基于时间的。`MemoryBank` 的周/月/季范围切换只影响统计图表，不影响 3D 星云展示。用户无法"滑动时间线"只看某个月/某段日期的记忆。
**改动范围**:
- 新建 `src/components/TimelineScrubber.tsx`: 水平时间轴滑块组件，覆盖全量记忆时间跨度，双滑块选择起止日期，下方显示该时间窗口内的记忆缩略列表
- `src/components/MemCloud3D.tsx`: 新增 `timeRange` prop（[start, end]），粒子根据记忆 timestamp 过滤——窗口外粒子 opacity→0.1 + 缩小 size，窗口内粒子正常显示 + 淡入动画
- `src/store/AppContext.tsx`: 新增 `timeRangeFilter: [number, number] | null` 状态
**验证方式**:
1. 拖动时间轴滑块到某月范围
2. 预期：3D 星云中只有该月记忆粒子正常显示，其余粒子淡出
3. 拖动起止滑块改变范围，粒子实时更新
4. 清除时间过滤（点击"全部"），恢复全量粒子显示

### 45. [UX] 记忆共振波纹 [✅]

**问题**: `DetailPanel` 打开时 3D 星云完全静止——被选中的粒子无高亮反馈，相关记忆无视觉"响应"。PRD 强调"记忆不是孤岛，而是星座"，但选中=没选中（3D 效果上）。
**改动范围**:
- `src/components/MemCloud3D.tsx`: 新增 `RippleEffect` 逻辑——当 `selectedMemory` 为 RawMemory 时，对应粒子发光 + 脉冲；与该记忆共享 storyline / same persons 的粒子产生弱同心圆波纹扩散动画（强度随语义距离衰减）；当为 InsightMemory 时，其所有 sourceRawMemoryIds 粒子短暂高亮
- `src/components/DetailPanel.tsx`: 选择变化时无需额外改动（已有 selectMemory → AppContext → MemCloud3D 数据流）
**验证方式**:
1. 点击一条"和爸爸在公园"的记忆
2. 预期：该粒子发光脉冲，同 storyline 的其他粒子出现同心圆波纹
3. 点击一条洞察记忆，预期其依据的原始记忆粒子短暂高亮（1-2 秒）
4. 关闭 DetailPanel，所有波纹消失

### 46. [Features] 记忆精选集 / 收藏夹升级 [✅]

**问题**: 当前 `favoriteIds: string[]` 是扁平 ID 数组，收藏是二进制的。用户无法创建多个主题收藏集（如"爸爸和我"、"编程里程碑"），也无法排序或加说明。
**改动范围**:
- `src/types/index.ts`: 新增 `MemoryCollection` 类型 { id, name, emoji, memoryIds: string[], createdAt }
- `src/store/AppContext.tsx`: `favoriteIds` → `collections: MemoryCollection[]`，新增 `addCollection`、`removeCollection`、`renameCollection`、`addToCollection`、`removeFromCollection` 方法，localStorage 持久化
- `src/components/Navigation.tsx`: 侧栏新增"📁 我的精选集"区域，展示所有集合（名称+记忆数），点击展开该集合记忆列表，支持新建/重命名/删除集合
- `src/components/DetailPanel.tsx`: 新增"添加到精选集"下拉菜单
**验证方式**:
1. 新建精选集"爸爸和我"，emoji=👨‍👦
2. 打开一条记忆详情，点击"添加到精选集" → 选择"爸爸和我"
3. 预期：侧栏"爸爸和我"集合显示计数+1，展开可见该记忆
4. 删除集合，记忆本身不删除，仅解除关联

### 47. [Features] 机缘引擎 / 意外发现 [✅]

**问题**: 用户倾向于只看主动寻找或系统推荐的内容。PRD 强调"照亮深埋已久的高价值时刻"，但目前唯一的主动发现机制是"遗忘预警"（负向的"再不看来不及了"），没有正向的惊喜发现。
**改动范围**:
- 新建 `src/components/SerendipityModal.tsx`: 机缘卡片 Modal，展示两条表面不相关记忆的隐藏连接（共享人物、相似活动、时间间隔整数年/月、或语义向量余弦相似度 > 阈值），连接描述以自然语言呈现
- `src/utils/navUtils.ts`: 新增 `findHiddenConnection` 函数——从 rawMemories 中随机选取 2 条不同 category 的记忆，分析共享维度，生成连接描述文本
- `src/App.tsx`: 顶部栏新增"🎲 机缘"按钮
**验证方式**:
1. 点击"🎲 机缘"按钮
2. 预期：弹出 Modal，展示 2 条记忆卡片 + 连接描述（如"你知道吗？[公园骑行] 和 [教室编程课] 都发生在周六上午，而且都有爸爸在场"）
3. 点击卡片可跳转到对应记忆详情
4. 再次点击得到不同的机缘组合

### 48. [UX] 记忆前后对比 / Then vs Now [✅]

**问题**: PRD §3.5 定义了"成长（Growth）"洞察类别，§2.2 家长视角有"成长里程碑"需求，但仅通过洞察文字描述体现。用户无法直观对比两个时间点的状态（如 3 个月前 vs 现在的编程能力）。
**改动范围**:
- `src/components/DetailPanel.tsx`: 新增"对比模式"按钮——点击后进入选择阶段，从时间线选两个时间点（或两条同 story line 记忆），展示并列对比卡片（早期 vs 后期：情绪、活动、知识标签、CQI、importance），中间箭头标注变化方向
- `src/utils/valueUtils.ts`: 新增 `computeDiff` 函数，接收两条 RawMemory，返回各维度的变化方向与幅度（↑/↓/→ + 数值）
**验证方式**:
1. 在 DetailPanel 中点击"📊 对比"
2. 选择两条同 story line 的记忆（如第一条编程课 vs 最近一次编程项目）
3. 预期：并列展示两张卡片，标注变化（如 importance 0.60 → 0.90 ↑、CQI 0.65 → 0.88 ↑）
4. 对比面板可关闭返回普通详情视图

### 49. [Features] 记忆强化提醒 / 间隔复习 [✅]

**问题**: `computeForgettingRisk` 已计算遗忘风险，但仅被动展示。没有主动的"建议复习"机制，也没有"复习后衰减重置"。这是一条未打通的闭环——PRD §3.4 的价值看板理念（"让 GraphMe 从记忆查看器进化为记忆理财顾问"）未完全实现。
**改动范围**:
- `src/components/ValueDashboard.tsx`: 新增"📌 今日推荐重温"模块，展示 2 条高价值+高遗忘风险的记忆卡片（摘要+情绪+距今几天），每条有"重温"按钮
- `src/store/AppContext.tsx`: 新增 `reinforceMemory(id)` 方法——调用后记忆 accessCount += 1、CQI 临时提升（current + 0.05）、遗忘曲线重置（timestamp 权重刷新），3D 星云中对应粒子短暂闪亮
- `src/utils/valueUtils.ts`: 新增 `getReviewCandidates` 函数——按遗忘风险×价值权重排序返回 Top 3
**验证方式**:
1. 打开 ValueDashboard，"今日推荐重温"显示 2 条记忆
2. 点击某条的"重温"按钮，预期显示 Toast"已重温，遗忘曲线已重置"
3. 该记忆的 accessCount 增加，CQI 提升，遗忘风险降级
4. 3D 星云中对应粒子短暂闪亮后恢复正常

### 50. [UX] 记忆导出卡片 [✅]

**问题**: GraphMe 是封闭体验——记忆只能在应用内看。用户想把某条特别记忆以精美卡片形式保存、打印或分享给家人。PRD §3.2 展示了"分享"按钮但未实现。
**改动范围**:
- `src/components/DetailPanel.tsx`: 新增"📸 导出卡片"按钮，点击后使用 Canvas API 渲染一张 PNG 卡片（记忆照片/emoji + 日期 + 摘要 + 情绪标签 + 人物标签 + AI 生成的温暖文案），触发浏览器下载
- 新建 `src/utils/cardUtils.ts`: `renderMemoryCard` 函数——使用 offscreen Canvas 绘制卡片布局，返回 Blob URL
**验证方式**:
1. 打开一条有照片的记忆详情，点击"📸 导出卡片"
2. 预期：触发浏览器下载 PNG 文件，文件名=记忆 ID + 日期
3. 打开下载的 PNG，预期包含所有卡片元素（照片、日期、摘要、情绪色块、人物列表）
4. 无照片的记忆用 emoji 占位

### 51. [UX] 全局快捷键系统 [✅]

**问题**: 仅有 ESC 关闭面板一个快捷键。所有交互依赖鼠标。极客用户（Persona C）对键盘操作的"操控感"有明确诉求。DetailPanel/ChatPanel/MemoryBank 各有独立的 ESC 监听但分散不统一。
**改动范围**:
- `src/App.tsx`: 新增 `useKeyboardShortcuts` hook，统一全局键盘监听（非输入框聚焦时生效）：
  - `Space` — 切换 Demo 模式
  - `1/2/3/4` — 切换全局/家庭/学习/情绪视图
  - `Ctrl/Cmd+F` — 打开搜索框
  - `Ctrl/Cmd+Z` — 撤销（undoDelete）
  - `R` — 重置 3D 视角
  - `?` — 显示快捷键帮助面板
- 移除各组件中分散的 ESC 监听，统一由全局 hook 处理
**验证方式**:
1. 按 `1`，预期切换为全局视图，3D 粒子布局更新
2. 按 `Ctrl+F`，预期顶部搜索框打开并聚焦
3. 按 `Shift+/`（即 `?`），预期弹出快捷键帮助面板
4. 在输入框内聚焦时按 `1`，预期输入"1"而不触发视图切换

### 52. [Features] 年度记忆报告 [✅]

**问题**: 用户累积记忆数据后没有周期性总结。Spotify Wrapped 式年度回顾在记忆领域有强大感染力，但 GraphMe 完全没有此能力。
**改动范围**:
- 新建 `src/components/AnnualReport.tsx`: 全屏独立页面式报告，包含：全年记忆总数、情绪分布饼图（SVG）、最活跃月份柱状图、Top 3 高光时刻卡片、最常出现人物排行、年度关键词（从记忆摘要提取高频词）、"你的 2026 记忆人格"总结段落，支持导出为图片
- `src/utils/valueUtils.ts`: 新增年度统计函数集（`computeAnnualStats`、`computeMonthlyActivity`、`extractAnnualKeywords`）
- `src/App.tsx`: 顶部栏或侧栏新增"📊 记忆年报"入口
**验证方式**:
1. 点击"📊 记忆年报"
2. 预期：全屏展示年度报告，情绪饼图、月度柱状图、Top 3 记忆卡片均基于真实数据
3. 年度关键词从记忆摘要中提取（如"编程"、"爸爸"、"公园"出现频率高）
4. 点击"导出"生成报告图片

### 53. [UX] 首次引导 / Onboarding [✅]

**问题**: 用户打开 GraphMe 直接面对 3D 星云+侧栏+多个浮动按钮，无任何引导。一键演示（AutoDemo）是功能演示而非循序渐进的 onboarding。PRD 定义的 5 种用户画像对新系统的理解门槛不同。
**改动范围**:
- 新建 `src/components/OnboardingOverlay.tsx`: 4 步交互式引导——1) "这是你的记忆星云，每颗粒子是一条记忆"（暗色遮罩+高亮粒子群）；2) "点击粒子查看记忆详情"（引导点击任意粒子）；3) "左侧是记忆分类，帮你快速定位"（高亮侧栏）；4) "右下角有小哥，随时可以提问"（高亮 Chat 按钮）。localStorage 记住已完成状态，已完成的用户不再显示
- `src/App.tsx`: 集成 OnboardingOverlay，首次访问且未完成引导时自动展示
**验证方式**:
1. 首次打开应用（清除 localStorage），预期自动展示第 1 步引导
2. 按"下一步"走完 4 步，预期引导消失，localStorage 记录已完成
3. 刷新页面，引导不再出现
4. 清除 localStorage 后刷新，引导重新出现

### 54. [UX] 情绪轨迹线 — 3D 中的情绪流动 [✅]

**问题**: 3D 星云中粒子之间无连线表示关系。PRD §3.8 洞察网络有连线（支撑/关联/因果），但那是 Insight 层面。同一天内多条记忆之间的情绪过渡（如早晨快乐→下午沮丧→晚上感激）在 3D 中完全看不到。
**改动范围**:
- `src/components/MemCloud3D.tsx`: 新增 `EmotionTrajectoryLines` 组件——当用户选择某一天（或默认当前聚焦天），同天内记忆粒子之间用淡色曲线连接，线颜色从起点情绪色渐变到终点情绪色（通过 vertexColors），hover 轨迹线时显示 HTML tooltip（"上午→下午情绪从好奇变为沮丧"）
- `src/utils/valueUtils.ts`: 新增 `computeDailyTrajectories` 函数——按天分组记忆，返回当天内按时间排序的记忆对及情绪变化描述
**验证方式**:
1. 在 3D 星云中，同一天有多条记忆时，粒子间出现淡色轨迹线
2. 线的颜色从起点情绪色渐变到终点
3. Hover 任意轨迹线，预期 tooltip 显示情绪变化描述
4. 只有 1 条记忆的日期不显示轨迹线

---

## 55. [UX] 记忆标签系统 — 用户自定义标签 [✅]

**问题**: 当前记忆分类完全依赖固定的导航结构（家庭/学习/社交/兴趣），用户无法自定义标签（如"重要"、"好笑"、"待回顾"、"和爸爸的周末"）。数据模型中无标签字段，Navigation.tsx 的 NAV_STRUCTURE 是硬编码的。用户想打"重要"标签只能靠收藏集，粒度太粗。
**改动范围**:
- `src/types/index.ts`: RawMemory 增加 `tags: string[]` 字段
- `src/store/AppContext.tsx`: 增加 `addTag(memoryId, tag)` / `removeTag(memoryId, tag)` / `allTags` 派生状态方法，localStorage 持久化
- `src/components/Navigation.tsx`: 记忆列表每项展示已有标签（彩色小圆角徽章），可点击添加/删除标签；侧栏新增"🏷 我的标签"区域，按标签分组查看记忆
- `src/components/DetailPanel.tsx`: 编辑模式中增加标签输入（自由输入+回车确认），详情视图显示当前标签
- `src/components/MemCloud3D.tsx`: 支持按标签筛选高亮粒子
**验证方式**:
1. 在 DetailPanel 编辑模式下为记忆添加标签"重要"
2. 预期：该记忆在列表中显示"重要"徽章
3. 侧栏"🏷 我的标签"区域出现"重要"分组，展开可见该记忆
4. 点击标签徽章可删除标签

---

## 56. [UX] 记忆相似度探索 — "寻找类似的记忆" [✅]

**问题**: 当前"机缘引擎"（SerendipityModal）随机展示两条记忆的隐藏连接，是被动的碰撞。用户无法在查看某条记忆时主动发起"找相似"——"还有哪些记忆和这条很像？"。PRD 强调"语义距离→粒子的远与近"，但用户无法利用这个空间关系做定向探索。
**改动范围**:
- 新建 `src/utils/similarityUtils.ts`: 基于 dimensions 的共享特征（相同 persons、相同 placeType、相近 emotion、相同 storyline、时间接近度）计算多维相似度评分，返回 Top 5 最相似记忆及相似理由
- `src/components/DetailPanel.tsx`: 详情面板标题栏增加"🔗 找相似"按钮
- `src/components/MemCloud3D.tsx`: 接收相似记忆 ID 列表，高亮相似记忆粒子（发光+放大），其余粒子半透明
- `src/components/Navigation.tsx`: 侧栏列表弹出"相似记忆"临时分组
- `src/store/AppContext.tsx`: 增加 `similarMemoryIds` 状态和 `findSimilar(memoryId)` 方法
**验证方式**:
1. 打开一条"公园骑车"记忆详情，点击"🔗 找相似"
2. 预期：3D 星云中相似记忆粒子发光高亮，其余粒子半透明
3. 侧栏列表出现"相似记忆"分组，展示 Top 5 相似记忆及相似理由（如"同一天"、"和爸爸在一起"）
4. 关闭面板后相似高亮自动清除

---

## 57. [UX] 记忆情感旅程地图 — 连续情感曲线 [✅]

**问题**: 情绪日历热力图（#42）以"天"为单位展示色块，是离散的。用户无法看到情绪如何随时间连续流动——"从 4 月到 6 月，我的情绪是先升后降还是一路上升？"。PRD §2.2 家长视角有"情感趋势曲线"需求，目前 Memory Bank 的趋势线是点状数据连线，缺乏叙事感。
**改动范围**:
- `src/utils/valueUtils.ts`: 新增 `computeEmotionCurve` 函数——按时间排序记忆，返回情绪强度+颜色映射的曲线数据点，标注关键事件节点（里程碑、情绪转折点）
- `src/components/ValueDashboard.tsx`: 新增"情感旅程"SVG 面板——一条连续的贝塞尔曲线（X 轴=时间，Y 轴=情绪强度），曲线颜色根据 emotional.primary 渐变映射（快乐=暖金、悲伤=冷蓝），X 轴下方用小图标标注关键事件节点；支持拖动时间范围滑块缩放曲线；hover 曲线点显示当日情绪摘要；支持按 storyline 过滤
**验证方式**:
1. 打开 ValueDashboard，切换到"情感旅程"面板
2. 预期：看到从最早记忆到最新记忆的连续情绪曲线，颜色随情绪变化渐变
3. 拖动时间范围缩小到最近 2 个月，曲线范围同步更新
4. hover 曲线上某点，显示当日情绪+记忆摘要 tooltip

---

## 58. [UX] 记忆盲盒 — "今天，你收到一份记忆礼物" [✅]

**问题**: 用户打开 GraphMe 后面对的是被动展示的 3D 星云。DailyMemoryCard（#40）展示"那年今日"是被动触发，没有惊喜感。心理学研究表明随机奖励比固定奖励更能驱动行为，用户需要一种"打开盲盒"的惊喜体验来驱动日常打开。
**改动范围**:
- 新建 `src/components/MemorySurprise.tsx`: 每天首次打开时，在 3D 星云中心浮现一个旋转的"记忆礼盒"（3D 立方体+粒子环绕动画），用户点击后礼盒"打开"（展开动画），展示一条随机选取的高价值+低访问频次记忆，配上温暖文案（如"这是你 3 个月前的一个下午，和爸爸在公园里的笑声——它已经被遗忘太久了"）；附带"重温"按钮和"再看看别的"按钮（随机抽取下一条）；每天仅触发一次（localStorage 记录上次触发日期）
- `src/utils/valueUtils.ts`: 新增 `getSurpriseCandidate` 函数——按价值×遗忘风险权重随机采样
- `src/components/MemCloud3D.tsx`: 支持粒子聚拢成礼盒动画 + 礼盒展开后粒子归位动画
- `src/App.tsx`: 集成 MemorySurprise 组件，应用启动时自动检测是否触发
**验证方式**:
1. 今天首次打开应用，预期 3D 星云中央浮现旋转礼盒
2. 点击礼盒，预期展开展示一条记忆卡片+温暖文案
3. 点击"重温"，触发 reinforceMemory，卡片关闭，粒子归位
4. 关闭后再次打开不再触发（同一天内）
5. 第二天打开，触发新的盲盒

---

## 59. [UX] 记忆周报 / 月度回顾卡片 [✅]

**问题**: 年度报告（#52）周期太长——用户等一年才看到一次总结。缺少中间节奏的定期回顾。iOS 照片的"每周回忆"、Spotify 的"每周推荐"都证明周期性触点对留存至关重要。
**改动范围**:
- `src/utils/valueUtils.ts`: 新增 `computeWeeklyReport`、`computeMonthlyReport` 函数——按时间窗口统计新增记忆数、主要情绪分布、对比上周/上月变化箭头
- `src/components/ValueDashboard.tsx`: 新增"📋 本周回顾"选项卡，包含：本周新增记忆数、主要情绪分布迷你饼图、"本周最快乐的时刻"+"本周值得关注的记忆"、"本周洞察更新"（confidence 提升/新生成）、对比上周情绪变化箭头（↑/↓ + 百分比）；轻量卡片风格，非全屏
**验证方式**:
1. 打开 ValueDashboard，切换到"📋 本周回顾"
2. 预期：展示本周记忆统计 + 情绪分布饼图 + 对比上周变化
3. 切换到上月，数据范围同步变化
4. 本周无新增记忆时，显示"本周暂无新记忆，去看看过去的回忆吧"

---

## 60. [UX] 记忆关联图谱（个人版） — 单条记忆的连接宇宙 [✅]

**问题**: 在 DetailPanel 中查看一条记忆时，只能看到它内容的 10 个维度字段。用户看不到"这条记忆撑起了哪些洞察？""这条记忆和哪些其他记忆属于同一个故事线？"——记忆被孤立展示，与 PRD 强调的"记忆不是孤岛，而是星座"相悖。
**改动范围**:
- `src/components/DetailPanel.tsx`: 详情面板底部新增"🌌 这条记忆的连接"迷你图区域——以该记忆为中心节点，放射状展示：它支持的洞察记忆（带线连接+支撑类型标签）、同 storyline 的前后记忆（时间线箭头）、共享人物的其他记忆（人物标签连线）；使用轻量 SVG 放射状布局，点击连接节点可跳转
- `src/utils/navUtils.ts`: 新增 `getMemoryConnections` 函数——给定 memoryId，返回 insightConnections（该记忆支撑的洞察）、storylineConnections（同故事线前后记忆）、personConnections（共享人物的其他记忆）
**验证方式**:
1. 打开一条"和爸爸在公园"记忆详情，滚动到底部
2. 预期：看到放射状连接图，中心为当前记忆
3. 连接的洞察显示"支撑：父子互动频率高"等
4. 点击连接节点，跳转到对应记忆/洞察详情

---

## 61. [Features] 记忆人格画像 2.0 — 动态演化的"你是怎样的记忆者" [✅]

**问题**: Memory Bank（#21）的 Mental Model 画像目前是"探索者/守护者/记录者/反思者/连接者"静态分类+一段文字。PRD 强调"可进化"——用户的记忆模式会随时间变化，画像应该是动态的、可回看的。
**改动范围**:
- `src/utils/memoryBankUtils.ts`: 新增 `computePersonaEvolution` 函数——按季度计算画像分值（情绪丰富度、社交密度、知识深度、叙事连贯性、回顾频率 5 维度），检测类型变化，生成演化描述；新增 `computePersonaRadar` 函数返回雷达图数据
- `src/components/MemoryBank.tsx`: 气质画像面板升级为：雷达图（5 维度 SVG 实现，可选"过去 3 个月 vs 全部"对比）；画像演化时间轴——"3 个月前你是'记录者型'，现在更偏向'连接者型'——你开始更关注记忆之间的关联了"；每种画像类型附带个性化记忆管理建议
**验证方式**:
1. 打开 Memory Bank，滚动到"气质画像"区域
2. 预期：看到 5 维度雷达图 + 与 3 个月前对比覆盖层
3. 画像类型下方显示演化描述和建议
4. 添加几条社交类记忆，画像中社交密度分值更新

---

## 62. [UX] 记忆衰减花园 — 用植物隐喻替代遗忘曲线 [❌ 已删除 - 从demo移除]

**问题**: 遗忘曲线（#41）是临床式的科学图表，冷冰冰的。普通用户（家长、陪伴需求者）对"遗忘风险 0.7"无感，但会对"这株记忆之花快枯萎了"产生情感共鸣。记忆的衰减本质上是情感的流逝，应该用有机的隐喻来表达。
**改动范围**:
- 新建 `src/components/MemoryGarden.tsx`: 一个 2D/伪3D 花园场景——每粒记忆是一株植物：高价值+低遗忘风险=盛开的花朵 🌸、高价值+高遗忘风险=枯萎中的花朵 🥀（叶片发黄抖动）、频繁回顾的记忆=有蝴蝶/蜜蜂环绕 🦋、洞察记忆=藤蔓/树（连接多个花朵）；点击花朵查看对应记忆详情；"浇水"=重温（触发 reinforceMemory），花朵恢复活力动画
- `src/utils/valueUtils.ts`: 新增 `getGardenPlantData` 函数——将记忆映射为植物状态（类型、颜色、大小、枯萎程度）
- `src/App.tsx`: 侧栏新增"🌻 记忆花园"入口，花园作为 ValueDashboard 的新选项卡或独立面板
- `src/store/AppContext.tsx`: reinforceMemory 触发花园中对应植物恢复动画
**验证方式**:
1. 点击"🌻 记忆花园"入口
2. 预期：看到花园场景，每条记忆对应一朵花/一棵植物
3. 高遗忘风险的记忆显示为枯萎花色，往回跳动画
4. 点击枯萎的花 → 查看详情 → 点击"重温"，花恢复盛开动画
5. 洞察记忆显示为藤蔓连接多个花朵

---

## 63. [Features] 记忆梦境生成器 — AI 重组记忆碎片 [✅]

**问题**: GraphMe 所有功能都是"还原"式的——展示记忆的真实样子。但人类记忆最有魅力的部分是重组——梦境、联想、创造性的错误记忆。PRD 提到巴特莱特的记忆重构理论，但产品中完全没有体现记忆的"创造性重组"。
**改动范围**:
- 新建 `src/components/DreamWeaver.tsx`: 点击"🌙 生成梦境"按钮，系统从记忆中随机抽取 3-5 个碎片（不同时间线、不同类别），按模板拼接生成超现实叙事；生成结果以优美排版呈现（深色背景+星光粒子装饰），底部标注"灵感来源：N 条记忆"，可点击查看原始记忆
- `src/utils/storyUtils.ts`: 新增 `generateDream` 函数——随机选取跨类别/跨故事线的记忆碎片，使用叙事模板引擎拼接（如"你梦见[地点A]变成了[地点B]，[人物A]正在做[活动B]，而你[情绪C]地[动作D]"）
- `src/App.tsx`: 顶部栏或侧栏新增"🌙 梦境"入口
**验证方式**:
1. 点击"🌙 梦境"按钮
2. 预期：生成一段超现实叙事文本（优美排版、深色背景、星光装饰）
3. 底部显示灵感来源列表，点击可查看原始记忆
4. 再次点击生成新的不同梦境
5. Demo 阶段不接入 LLM，使用模板拼接

---

## 64. [UX] 记忆摆渡（遗忘仪式） — 让删除变成有意义的告别 [✅]

**问题**: 删除记忆是冷冰冰的确认→消失。但有些记忆之所以要删除，是因为它们代表了一段需要放下的过去。当代数字产品普遍缺乏"告别"的设计语言。PRD 将记忆定义为"数字精神资产"，资产的"清算"应该是仪式性的。
**改动范围**:
- `src/types/index.ts`: 新增 `FarewellRecord` 类型 { id, memoryLabel, memorySummary, farewellNote, releaseStyle: '深海' | '星光' | '微风', releasedAt }
- `src/store/AppContext.tsx`: 新增 `farewellRecords` 状态（localStorage 持久化）+ `farewellMemory(id, note, style)` 方法（先保存记录再删除记忆）
- `src/components/DetailPanel.tsx`: 删除按钮长按（2 秒）触发"摆渡模式"——弹出仪式面板："你即将释放这段记忆。它曾在你的生命中留下痕迹，现在你选择让它自由。"；可选写告别语，选择释放方式——🌊 沉入深海 / 🔥 化为星光 / 🌬 随风飘散
- `src/components/MemCloud3D.tsx`: 监听 farewell 事件，粒子执行对应动画（深蓝色下沉/金色上升消散/淡出飘移，带拖尾效果）
- `src/components/Navigation.tsx`: 侧栏新增"🪦 已释放的记忆"区域（仅名称+释放日期，不可查看）
**验证方式**:
1. 在 DetailPanel 中长按删除按钮 2 秒
2. 预期：弹出仪式面板（非普通确认框），包含告别语输入和释放方式选择
3. 写"谢谢你陪伴我的那段时光"，选择"🌊 沉入深海"，确认
4. 3D 星云中该粒子执行下沉动画后消失
5. 侧栏"已释放的记忆"显示该记录

---

## 65. [Features] 记忆时间胶囊 — 封存记忆，未来的自己开启 [✅]

**问题**: DailyMemoryCard 是"过去→现在"的被动回顾。缺少"现在→未来"的主动机制——把今天的记忆封存起来，设定未来某天自动开启。这是"写给未来的信"的记忆版本，让回顾变成一种期待。
**改动范围**:
- `src/types/index.ts`: 新增 `TimeCapsule` 类型 { id, memoryId, sealedAt, unlockDate, note: string, opened: boolean }
- `src/store/AppContext.tsx`: 新增 `capsules` 状态（localStorage 持久化）+ `createCapsule(memoryId, unlockDate, note)` / `openCapsule(id)` 方法
- `src/components/DetailPanel.tsx`: 详情面板增加"⏳ 封存"按钮——点击后选择解锁日期（"3 个月后"、"明年今天"、"自定义日期"），写一段"给未来自己的话"，封存后记忆在列表中显示 🔒 图标
- `src/components/DailyMemoryCard.tsx`: 启动时检测是否有今日到期的胶囊，优先展示到期的胶囊（带动画开箱效果）
- `src/components/Navigation.tsx`: 侧栏新增"⏳ 时间胶囊"区域，展示所有胶囊（已封存/已开启）
**验证方式**:
1. 打开一条记忆详情，点击"⏳ 封存"
2. 选择"3 个月后"，写"未来的我，还记得这天吗？"
3. 预期：记忆在列表中显示 🔒 图标，侧栏"时间胶囊"区域新增一条记录
4. 将系统时间调到 3 个月后，打开应用，预期 DailyMemoryCard 展示胶囊开箱动画
5. 已开启的胶囊在列表中标记为"已开启"

---

## 66. [UX] 记忆回声 — 新建/查看记忆时自动发现跨时间的"记忆对话" [✅]

**问题**: 当前创建新记忆后，系统只是把粒子加入星云。但用户不知道这条新记忆是否与过去的某条记忆"对话"——比如今天在公园的笑声，和3个月前另一条在公园的记忆形成呼应。`findSimilar`（#56）需要用户手动触发，且只做了特征匹配，没有"跨时间呼应"的叙事维度。PRD强调"记忆不是孤岛，而是星座"，但跨时间的记忆对话尚未被挖掘。
**改动范围**:
- `src/utils/similarityUtils.ts`: 新增 `findEcho` 函数——当用户创建/打开一条记忆时，自动扫描所有记忆，查找不同storyline、不同日期（间隔>7天）、但共享3+维度特征（相同地点类型+相同情绪+相同人物）的记忆，生成自然语言呼应按描述
- `src/components/DetailPanel.tsx`: 详情底部新增"回声记忆"区域，展示1-2条隔空呼应的记忆卡片+描述文本
- `src/components/MemCloud3D.tsx`: 两个回声粒子之间出现短暂闪烁虚线动画（2秒后淡出）
- `src/store/AppContext.tsx`: 新增 echo 状态（echoMemoryIds + echoDescription）
**验证方式**:
1. 打开一条"和爸爸在公园"的记忆详情
2. 预期：详情底部出现回声区域，展示3个月前另一条公园记忆，配文如"3个月前的今天，你也在公园和爸爸度过了快乐的下午"
3. 3D星云中两个粒子之间出现短暂闪烁虚线
4. 创建一条新记忆后，自动展示回声

## 67. [UX] 记忆声音景观 — 3D星云的Web Audio声音化体验 [❌ 已删除 - 体验不好]

**问题**: 整个GraphMe体验是视觉独占的，没有任何听觉反馈。PRD 10维数据模型中情感维度（D4）包含12种情绪强度——这些丰富的情绪数据完全可以转化为声音。心理学研究证明多感官体验能显著增强记忆唤起和情感连接。当前暗黑色调的3D星云搭配环境音，能创造近乎冥想式的记忆探索体验。
**改动范围**:
- 新建 `src/utils/audioUtils.ts`: Web Audio API合成器——根据当前视角下可见记忆粒子的情绪分布实时合成声音（快乐=明亮谐波/C大调音阶，悲伤=柔和低频/小调，好奇=上升琶音），粒子密度=音量，情绪强度=声音丰富度，空白区域=低沉宇宙背景嗡鸣
- 新建 `src/components/SoundscapeToggle.tsx`: 底部栏"🔊 声音景观"开关按钮，默认关闭
- `src/App.tsx`: 集成soundscape开关状态，传递给MemCloud3D用于驱动音频合成
- `src/components/MemCloud3D.tsx`: 监听可见粒子变化，将情绪分布数据传递给audioUtils合成器
**验证方式**:
1. 点击底部栏"🔊 声音景观"按钮开启声音
2. 视角靠近快乐记忆密集的区域（暖金色粒子群），预期听到明亮的谐波音
3. 视角移向悲伤记忆密集区（蓝色粒子群），预期声音转为柔和低频
4. 缩放远离子群到空白区域，预期听到低沉背景嗡鸣
5. 视角内粒子数量变化时，音量随之变化

## 68. [Features] 记忆星座工坊 — 用户自定义记忆连线与星座命名 [❌ 已删除 - 体验不好]

**问题**: 当前所有记忆之间的连线都是系统计算的——洞察连线（#39）、轨迹线（#54）、连接图谱（#60）。用户始终无法亲手在星云中"画线"并为之命名。PRD将记忆比喻为"星座"（Constellation），但用户无权决定哪些星组成什么星座。缺少核心的"自我表达"维度。
**改动范围**:
- `src/types/index.ts`: 新增 `Constellation` 类型 { id, name, connections: [{ fromId, toId, color, label }], createdAt }
- `src/store/AppContext.tsx`: 新增 `constellations` 状态（localStorage持久化）+ `addConstellation`/`removeConstellation`/`addConnection`/`removeConnection`/`renameConstellation` 方法
- `src/components/MemCloud3D.tsx`: 新增"星座编辑模式"——光标变为十字准星，点击粒子间建立连线，连线用Line渲染（颜色/粗细用户可选），命名后连线在3D星云中持续可见（默认淡色，hover高亮）
- `src/components/Navigation.tsx`: 侧栏新增"🌌 我的星座"区域，展示所有用户创建的星座（名称+连线数），展开可见连线详情，支持删除/重命名
**验证方式**:
1. 点击顶部"✨ 星座"进入编辑模式
2. 先后点击两个粒子，弹出连线命名输入框，输入"父子时刻"，选择金黄色连线
3. 预期：两个粒子间出现金黄色连线，hover时高亮并显示"父子时刻"
4. 侧栏"🌌 我的星座"区域出现该星座，展开可见连线详情
5. 退出编辑模式，连线持续可见

## 69. [UX] 记忆潮汐 — 3D星云中基于访问频率的潮汐可视化 [✅]

**问题**: 现有的遗忘曲线（#41）是2D图表，记忆花园（#62）是独立2D场景，它们与3D星云是割裂的体验。用户在3D星云中看不到哪些记忆是"活的"（频繁被回顾的）、哪些是"沉睡的"。reinforceMemory机制存在（#49）但它的效果（粒子闪亮一下）太短暂，没有持续性的状态可视化。
**改动范围**:
- `src/utils/valueUtils.ts`: 新增 `computeTideLevel` 函数——基于 accessCount + forgettingRisk 计算潮汐系数（高频=高潮位，低频=低潮位，濒危=濒危潮位）
- `src/components/MemCloud3D.tsx`: 粒子shader/material中增加潮汐参数——高频粒子周围柔和蓝色/青色半透明光晕，低频粒子暗淡灰色光晕，濒危粒子微弱呼吸式脉冲；粒子size乘以潮汐系数（accessCount归一化值）
- 无需新增UI，是现有粒子渲染上加一层视觉数据层
**验证方式**:
1. 反复查看某条记忆（增加accessCount），预期该粒子周围逐渐出现青色光晕
2. 长期不访问的记忆粒子周围呈现暗淡灰色光晕
3. 接近遗忘阈值的粒子有微弱呼吸式脉冲
4. 粒子大小随访问频率变化（高频粒子稍大，低频粒子稍小）

## 70. [UX] 记忆传声筒 — 循着关联链式探索，走一条记忆小路 [✅]

**问题**: 当前所有关联发现都是"一步到位"的——找相似（#56）返回Top 5列表，机缘引擎（#47）随机碰撞两张卡片，记忆回声（#66）只展示单条呼应。但记忆空间的魅力在于连锁反应——一条记忆关联到另一条，那一条又关联到更远的一条，走着走着就到了一个你从没想过会到达的地方。现有功能都无法提供这种"循着线索走一条记忆小路"的体验。
**改动范围**:
- `src/utils/similarityUtils.ts`: 新增 `buildMemoryChain` 函数——从当前记忆出发，自动寻找最相似记忆（第1步），再从那条找到它的最相似（第2步），链式传递4-6步；每步标注连接原因（"相同情绪→"、"同一天→"、"共享人物→"）；多候选时随机选择下一步，每次可能走出不同路线
- `src/components/DetailPanel.tsx`: 详情面板新增"📞 传声筒"按钮；点击后在面板中展示链条每一步的缩略记忆卡片（标签+情绪色块+连接原因箭头），用户可点击任意一步跳转到详情
- `src/components/MemCloud3D.tsx`: 链条中所有节点粒子之间绘制渐变色曲线路径（起点的情绪色→终点的情绪色），2秒后自动淡出，粒子在链条显示期间放大高亮
**验证方式**:
1. 打开一条"公园骑车"记忆详情，点击"📞 传声筒"
2. 预期：面板展示4-6步链条卡片（"公园骑车 → 共享人物 → 编程课 → 相同情绪 → 数学课 → ..."）
3. 3D星云中出现渐变色路径串联所有节点粒子
4. 再次点击"传声筒"，预期走出不同的路线（随机性）
5. 点击链条中任意步骤卡片，预期跳转到对应记忆详情

## 71. [UX] 记忆阅读模式 — 把记忆变成一本可以翻的书 [✅]

**问题**: 当前记忆浏览要么是3D星云的空间探索，要么是侧栏列表的线性滚动，要么是DetailPanel的单条查看。缺少一种"沉浸式连续阅读"体验——像翻一本关于自己的书一样，一条一条地翻阅记忆。StoryWeaver（#43）是叙事时间线的概览，不是翻书体验。
**改动范围**:
- 新建 `src/components/MemoryReader.tsx`: 全屏阅读模式——暗色背景+居中排版；每条记忆是一张"书页"（大号记忆标签为标题、优雅排版的summary文本、情绪色块点缀、日期描述如"2026年5月18日，一个晴朗的下午"、人物和地点标签）；左右箭头翻页（支持键盘←→），翻页动画使用CSS 3D transform书本揭页效果；按时间排序（最新→最早），支持按storyline筛选；底部显示页码"第3页/共50页"
- `src/App.tsx`: 顶部工具栏或侧栏新增"📖 阅读模式"入口按钮，管理阅读模式状态
- `src/components/MemCloud3D.tsx`: 阅读模式下，当前翻阅的记忆粒子在3D星云中高亮放大，其余粒子半透明
**验证方式**:
1. 点击"📖 阅读模式"进入全屏阅读
2. 预期：居中展示第一条记忆的优雅排版书页
3. 按→翻到下一页，预期3D翻页动画+新记忆书页
4. 按←回到上一页
5. 3D星云中当前书页记忆粒子高亮，其余半透明
6. 按ESC或点击关闭按钮退出阅读模式

## 72. [UX] 记忆回旋镖 — 发现跨越时间的远距记忆呼应 [✅]

**问题**: 记忆回声（#66）是创建/查看时自动触发的"当下呼应"，但缺少一个让用户主动探索的"远距呼应发现器"。输入一个记忆，找出与之时间跨度大（≥30天）但语义维度高度相似的其他记忆。这不同于"找相似"（#56，只考虑特征匹配），也不同于"机缘引擎"（#47，随机碰撞）。回旋镖强调的是"跨越时间的本质相似"。
**改动范围**:
- `src/utils/similarityUtils.ts`: 新增 `findBoomerang` 函数——扫描所有记忆，匹配条件：时间间隔≥30天、不同storyline、但emotional.intensity差值≤0.15、activity.type属于同一大类（如都是"学习"类活动），返回1-2条回旋镖记忆+自然语言描述
- `src/components/DetailPanel.tsx`: 详情面板新增"🪃 回旋镖"按钮，点击后展示回旋镖结果卡片（描述如"这条数学课的困惑→顿悟模式，在8个月后的编程课上完美重现了"），点击可跳转
- `src/components/MemCloud3D.tsx`: 两个回旋镖粒子之间出现抛物线轨迹动画（非直线），3秒后淡出
**验证方式**:
1. 打开一条"数学课困惑"记忆详情，点击"🪃 回旋镖"
2. 预期：找到8个月前的"编程课"记忆，描述"你在这条数学课上从困惑到顿悟用了20分钟，在8个月前的编程课上也表现出完全相同的模式"
3. 3D星云中出现抛物线轨迹连接两个粒子
4. 点击回旋镖卡片跳转到对应记忆

## 73. [UX] 情绪配色工作室 — 用户自定义情绪颜色映射 [❌ 已删除 - 体验不好]

**问题**: 当前12种情绪颜色是固定的设计规范（`EMOTION_COLORS`），快乐=金色、悲伤=蓝色等。但对不同文化背景的用户，颜色-情绪的映射是不同的。PRD定义了5种用户画像——儿童和陪伴需求者对颜色的感受也与家长不同。给用户颜色选择权本身就是一种"我的记忆我做主"的UX宣言。
**改动范围**:
- 新建 `src/components/ColorStudio.tsx`: 右侧滑入面板，展示12种情绪的当前颜色色块，每个色块旁有颜色选择器（input type="color"）；底部"恢复默认"按钮+3个预设配色方案（经典暖色/柔和粉彩/高对比度）；颜色选择实时反映到所有使用情绪颜色的地方
- `src/types/index.ts`: 新增 `ColorPreset` 类型 { id, name, colors: Record<EmotionType, string> }
- `src/store/AppContext.tsx`: 新增 `emotionColorMap` 状态（localStorage持久化）+ `updateEmotionColor`/`resetEmotionColors`/`applyColorPreset` 方法
- 多个组件改为从context消费动态颜色（MemCloud3D、Navigation情绪筛选条、ValueDashboard情绪日历热力图、DetailPanel情绪标签等），替换静态 `EMOTION_COLORS` 导入
**验证方式**:
1. 点击顶部/侧栏"🎨 配色"打开配色工作室
2. 将"快乐"的金色改为粉色，预期3D星云中快乐粒子立即变为粉色
3. 情绪筛选条、情绪日历热力图、DetailPanel情绪标签同步变色
4. 点击"柔和粉彩"预设并确认，所有颜色切换为预设方案
5. 刷新页面，自定义配色保留


---

## 记忆宫殿实体化系列 — 打破黑盒，把 AI 的记忆可视化、可触摸、可修正

> 以下 11 条 Feature 围绕 **"将 AI 的记忆与世界观实体化展现"** 核心目标，从"让 AI 内部世界可见 / 让记忆可触摸可互动 / 让记忆空间有体感"三个维度展开。编号接续 #73。

---

### 74. [Features] AI 认知地形图 — "小哥眼中的你"全景画像 + 记忆情书 [✅]

**问题**: Memory Bank 的 5 维雷达图 + 气质画像（#61）是对用户的抽象概括，但仍是"统计数字+文字"的组合。用户看不到 AI 内部到底把这些偏好、习惯、关系组织成了什么样的认知结构。简言之——用户不知道在 AI 脑中，"自己"到底长什么样。同时缺少一种"有温度的、AI 基于对你全量记忆的理解而主动写给你的一封信"。

**改动范围**:
- 新建 `src/components/CognitiveTerrain.tsx`: 一张以用户为中心的 2D 拓扑地图，将 AI 对用户的所有认知可视化为有机的"心智大陆"——概念山脉（高频记忆聚成的山峰）、知识河流（关联概念间的连接路径）、情感气候带（情绪密度决定颜色温度）、人物岛屿（每个重要人物的关联记忆聚成岛屿）、未探索迷雾区（AI confidence 低的区域覆盖半透明迷雾）、洞察遗址（已被推翻的旧洞察标记为虚线轮廓）
- 新建 `src/utils/terrainUtils.ts`: 地形生成算法——从 rawMemories + insightMemories 数据计算概念聚类、密度热力、人物聚合、置信度分布，转换为地形图层数据
- 地图底部增加"💌 让小哥为你写封信"按钮——点击后在地图上方以打字机逐字出现动画展示自然语言书信，信件结构：问候 → 变化对比 → 坚持的事 → 被遗忘的瞬间 → 祝愿；人名/地名/活动名可点击跳转到对应记忆位置
- 新建 `src/utils/letterUtils.ts`: 信函模板引擎——基于全量记忆数据拼接叙事文本，规则化生成自然语言信件
- `src/App.tsx`: 顶部工具栏新增"🗺️ 认知地图"入口按钮
- 全部基于现有 rawMemories + insightMemories 数据，不引入新依赖

**验证方式**:
1. 点击"🗺️ 认知地图"进入全屏视图
2. 看到以用户为中心的心智大陆地图，有山脉、河流、岛屿、迷雾等地理隐喻
3. hover 任意区域显示该区域的记忆密度 + 代表记忆摘要
4. 点击区域 zoom in 层层深入
5. 点击"💌 让小哥为你写封信"，地图上方出现打字机动画书信
6. 点击信中人名/地名可跳转到对应记忆，地图同步定位
7. 点击"💾 保存这封信"导出 PNG

---

### 75. [UX] 记忆引力场 — 展示"重要记忆如何弯曲记忆空间" [❌ 已删除 - 无价值]

**问题**: 3D 星云中粒子的空间位置由降维算法决定，但用户看不到"为什么这些粒子在这里"。PRD 强调"语义距离=粒子的远与近"，但这个距离是静态的。高 importance、高 CQI 的里程碑记忆应该像大质量天体一样对周围记忆产生"引力"，让它们围绕自己排列。

**改动范围**:
- `src/components/MemCloud3D.tsx`: 新增"引力场渲染模式"——高 importance（≥8）记忆粒子周围渲染半透明引力场球体（Three.js Ring 或自定义 shader 光环），半径与 importance 成正比；关联记忆粒子在引力场影响下缓慢绕轨道运动（useFrame 中微调 position）；多个高价值记忆引力场重叠时形成"双星系统"可视化；用户拖拽粒子靠近另一个时，两者间引力线实时绘制
- `src/App.tsx`: 顶部栏新增"引力场模式"切换按钮（普通模式 / 引力场模式）
- 不引入新依赖，基于现有 Three.js 能力

**验证方式**:
1. 点击切换为"引力场模式"
2. 预期：高 importance 记忆粒子周围出现半透明引力场球体
3. 其关联记忆粒子缓慢绕轨道运动
4. 引力场颜色与主导情绪一致（快乐=暖金辉光，悲伤=冷蓝辉光）
5. 多引力场重叠时呈现双星/多星系统效果
6. 帧率不低于 30fps

---

### 76. [Features] AI 的困惑日记 — "关于你，小哥还有很多不解" [✅]

**问题**: AI 对用户的认知不是完美的。但在 GraphMe 中，用户看到的全是 AI 已确认的"洞察"。AI 的不确定性被隐藏在 confidence 数字后面，用户不知道 AI 对哪些方面还"困惑"——而这正是"黑盒"的核心：AI 的不确定区域比确定区域更能揭示它的认知边界。

**改动范围**:
- 新建 `src/components/ConfusionDiary.tsx`: 右侧滑入面板，展示 AI 对用户认知中的"空白"与"矛盾"——矛盾检测（两条洞察互相矛盾时高亮展示）、低 confidence 洞察公开（confidence < 60% 以"？"标记展示）、认知空白（10 维数据中某维度长期无新记忆时提示"最近 3 个月没有户外活动记录了，你还好吗？"）、提问建议（AI 生成 2-3 个问题建议用户回答以填补空白）
- 新建 `src/utils/confusionUtils.ts`: 困惑检测算法——交叉比对洞察记忆检测矛盾、扫描各维度时间分布检测空白、按空白权重生成自然语言提问
- 面板以温暖谦逊的语气呈现（"关于你，我还有很多不懂的地方…"）
- `src/App.tsx`: 顶部工具栏新增"🤔 小哥的困惑"入口按钮

**验证方式**:
1. 点击"🤔 小哥的困惑"打开面板
2. 预期：看到矛盾洞察高亮（如有）、低 confidence 洞察标记"？"、认知空白提示
3. 提问建议以自然语言呈现，如"你最近有在学习新东西吗？我没有看到相关记录。"
4. 点击某条困惑展开关联的记忆依据和矛盾详情
5. 无困惑时显示"关于你，我目前都很确定 😊"

---

### 77. [UX] 记忆蝴蝶效应 — "纠正一条记忆，看整个世界如何重塑" [✅]

**问题**: 用户纠正洞察或修改记忆后，只有该条数据变了，看不到它对整个记忆空间的影响。PRD 强调"可进化"，但进化是静默的。用户需要直观看到——改了一个字，AI 对你的认知网络产生怎样的连锁反应。

**改动范围**:
- `src/components/MemCloud3D.tsx`: 当用户对洞察记忆执行"纠正"操作后，触发蝴蝶效应动画——被纠正的洞察粒子发出脉冲波（shader shockwave 效果）；受影响的关联洞察粒子按依赖链顺序依次短暂闪烁（0.3s 间隔）；受影响的 insight 连线短暂变红后恢复新连接颜色
- `src/components/DetailPanel.tsx`: 纠正操作完成后，面板底部出现"涟漪报告"——列出受影响的洞察名称 + confidence 变化（↑/↓ + 箭头）；如果纠正导致某洞察 confidence 跌破阈值，粒子直径缩小 + 变色警告
- `src/store/AppContext.tsx`: updateInsight 方法中新增影响链计算，将受影响的洞察 ID 列表传给 3D 组件
- 整体动画持续 3 秒，之后恢复正常

**验证方式**:
1. 打开一条洞察记忆详情，点击"✏️ 纠正"，输入纠正内容并保存
2. 预期：3D 星云中该洞察粒子发出脉冲波向外扩散
3. 受影响关联洞察粒子依次闪烁，连线短暂变红
4. DetailPanel 底部出现涟漪报告，列出受影响洞察 + confidence 变化
5. 动画 3 秒后恢复正常

---

### 78. [UX] 记忆层叠术 — 像考古一样分层挖掘记忆 [❌ 已删除]

**问题**: 时间维度只有 TimelineScrubber 的线性滑块和情绪日历的离散格子。缺少一种"层叠式"的时间探索——像考古挖掘现场一样，一层层揭开不同时期的记忆地层。2 年前的记忆和昨天的记忆在"质地"上是不同的，这种质感差异在 3D 星云中完全丢失。

**改动范围**:
- `src/components/MemCloud3D.tsx`: 新增"考古模式"——记忆粒子按时间分层排列在 Y 轴上（最近=顶层，最老=底层）；层间有半透明"地层"平面（颜色从暖到冷代表从新到旧）；用户上下滚动切换地层——上层粒子降低透明度，当前层粒子高亮，下层粒子呈"被掩埋"暗色；每层标注时间范围 + 记忆数量 + 情绪主色调；层间有关联的粒子出现纵向虚线连接；"发掘"动画：切换到旧地层时粒子从暗变亮
- `src/App.tsx`: 顶部栏新增"考古模式"切换按钮（星云模式 / 考古模式）
- 与现有 3D 星云共享同一个 Canvas，通过模式切换改变粒子布局逻辑

**验证方式**:
1. 点击切换为"考古模式"
2. 预期：记忆粒子按时间分层排列，最近在上，最老在下
3. 上下滚动切换地层，当前层高亮，其他层半透明
4. 层间有关联的粒子出现纵向虚线连接
5. 切换到旧地层时粒子"发掘"动画（从暗到亮）
6. 帧率不低于 30fps

---

### 79. [Features] 小哥的"第二大脑" — AI 内部知识图谱全景 [❌ 已删除]

**问题**: 洞察记忆是 AI 从原始记忆中推理出的结论，但这些洞察之间如何关联、如何形成 AI 的"信念体系"，用户看不到。PRD §3.8 定义了洞察网络，但在 DetailPanel 底部的 ConnectionGraph 只是局部视图，缺少全局鸟瞰。

**改动范围**:
- 新建 `src/components/SecondBrain.tsx`: 全屏视图——所有洞察记忆的全局网络图，洞察节点按类别（趋势/信念/关系/偏好/习惯/成长）分区排列形成 6 个"思维岛屿"；岛屿间由 insight 连线桥接（线宽=共享底层记忆数）；节点大小=confidence × importance，颜色深度=版本迭代次数；已被推翻的洞察用虚线+半透明渲染为"幽灵洞察"悬浮在活跃洞察上方
- 新建 `src/utils/networkUtils.ts`: force-directed layout 算法——计算洞察节点布局、连线权重、聚类分区
- 交互：点击洞察节点 zoom in 到局部网络；hover 节点时关联原始记忆在侧边浮现；支持拖拽手动重新布局；底栏显示网络统计（总洞察数、平均 confidence、最高频连接类别）
- `src/App.tsx`: 顶部工具栏新增"🧠 第二大脑"入口按钮

**验证方式**:
1. 点击"🧠 第二大脑"进入全屏视图
2. 预期：看到 6 个思维岛屿，洞察节点按类别分区排列
3. 岛屿间有连线桥接，线宽反映共享记忆数
4. 点击任意洞察节点 zoom in 到局部网络
5. hover 节点时侧边浮现关联原始记忆列表
6. 已推翻洞察渲染为虚线半透明"幽灵"

---

### 80. [UX] 记忆的多棱镜 — 同一段记忆，三种角色的视角 [❌ 已删除]

**问题**: PRD 定义了 5 种用户画像（家长/儿童/陪伴需求者/极客/教育者），但当前 Demo 只有家长视角。PRD §2.2 详细定义了每种角色的直觉维度和产品映射，但从未实现。同一组记忆数据，从不同角色的"棱镜"看过去，应呈现完全不同的视觉和叙事。

**改动范围**:
- `src/store/AppContext.tsx`: 新增 `userPersona: '家长' | '陪伴者' | '极客'` 状态 + `setUserPersona` action，localStorage 持久化
- `src/App.tsx`: 顶部栏新增角色选择器（👨‍👩‍👧 家长 / 🤗 陪伴者 / 🔧 极客）
- `src/components/MemCloud3D.tsx`: 根据 persona 切换粒子渲染策略——家长视角=当前默认；陪伴者视角=粒子以"情感温度"着色（暖=被理解的时刻，冷=孤独的时刻），粒子带柔和光晕持续时长，高亮 AI 的"懂得"时刻；极客视角=粒子叠加"数据图层"（confidence 标签、向量坐标、关联密度数字）
- `src/components/Navigation.tsx`: 陪伴者视角下导航文案风格变为温暖语气（"小哥眼中的你：一个值得被温柔对待的人"）；极客视角下侧栏显示 API 级记忆查询界面
- `src/components/DetailPanel.tsx`: 陪伴者视角下详情面板文案风格从"分析式"转为"共情式"
- 儿童视角标记为"未来迭代"，当前不做 UI

**验证方式**:
1. 点击顶部角色选择器切换到"🤗 陪伴者"
2. 预期：3D 星云粒子以情感温度着色，导航文案变为温暖语气
3. 切换到"🔧 极客"
4. 预期：粒子显示 confidence 标签、向量坐标等数据图层，侧栏显示 API 查询界面
5. 刷新页面后视角选择保留

---

### 81. [UX] 记忆触感 — 粒子拖拽与"手感"反馈 [❌ 已删除 - 与OrbitControls冲突]

**问题**: 3D 星云中所有交互都是"点击查看"或"旋转缩放"。用户不能"触摸"记忆粒子，不能拖动它们重新排列。PRD 强调"让用户直观看到、触摸和管理 AI 脑子里的自己"——但"触摸"维度缺失。

**改动范围**:
- `src/components/MemCloud3D.tsx`: 为粒子增加可拖拽交互——鼠标长按（300ms）后粒子跟随光标在 XY 平面移动；拖拽时有弹性手感（拉远后松手弹回原位，spring animation）；拖到另一个粒子的引力场范围内自动"吸附"并创建星座连线；拖拽过程中周围连线实时重绘
- `src/store/AppContext.tsx`: 新增 `draggedMemoryId` 状态 + 拖拽吸附后自动调用星座工坊 addConnection 方法
- 拖拽时粒子周围出现半透明"拖拽环"；已收藏记忆拖拽阻力更大
- 不引入新依赖，全部基于 R3F 的 pointer events

**验证方式**:
1. 长按任意记忆粒子 300ms
2. 预期：粒子跟随光标移动，周围出现拖拽环
3. 拖到另一个粒子附近松手，预期吸附并显示"已关联"提示
4. 拖到空白区域松手，预期粒子弹回原位（spring 动画）
5. 已收藏记忆拖拽时移动速度更慢（更大阻力）
6. 吸附后在星座工坊中自动创建连线

---

### 82. [UX] 记忆温度计 — 3D 星云的"体感"氛围层 [✅]

**问题**: SoundscapeToggle（#67）解决了听觉，但视觉"氛围"仍是静态的——背景色、粒子颜色不随"当下心情"变化。用户今天看了很多快乐记忆，整个空间应该"感受到"温暖。

**改动范围**:
- `src/components/MemCloud3D.tsx`: 统计当前可见粒子的情绪主导分布，动态调整——背景色温微调（快乐多=向暖金调，悲伤多=向冷蓝调）；背景星尘粒子颜色随主导情绪变化（快乐=金色星尘，悲伤=蓝色星尘）；ambientLight.intensity 随情绪强度波动
- 顶部出现细条状"氛围指示器"——从冷蓝到暖金的渐变色条，当前状态有呼吸式光标
- 切换分类/时间范围时，氛围平滑过渡（lerp 插值，2 秒）
- 不引入新依赖

**验证方式**:
1. 筛选只显示快乐记忆，预期 3D 星云背景向暖金色微调，星尘变金色
2. 筛选只显示悲伤记忆，预期背景向冷蓝色微调，星尘变蓝色
3. 顶部氛围指示器光标移动到对应色温位置
4. 切换时氛围平滑过渡，无跳变

---

### 83. [UX] 记忆的面纱 — 隐私记忆的视觉加密 [✅]

**问题**: 隐私级别（#25）实现了数据层面区分，但视觉层面仅靠标签文字。用户可能在公共场合打开 GraphMe，"仅自己"可见的记忆应有一个视觉"面纱"防止被旁人一眼看到内容。

**改动范围**:
- `src/components/MemCloud3D.tsx`: "仅自己"级别粒子表面覆盖"磨砂玻璃"纹理效果（shader 半透明+模糊化）；"加密"级别粒子以像素化着色器渲染（GLSL fragment shader 马赛克效果），不透露任何信息
- `src/components/DetailPanel.tsx`: "仅自己"记忆的详情面板默认将 summary 和详情字段以模糊文字显示（CSS `filter: blur()`），需点击"显示"按钮后才清晰；"加密"记忆需 hover 确认后才解密
- `src/components/Navigation.tsx`: 侧栏列表中隐私记忆以 🔒 + 模糊文字展示
- App.tsx 底部工具栏：显示当前"隐私模式"状态（👁 公开浏览 / 🔒 隐私浏览）；演示模式下所有隐私记忆自动模糊

**验证方式**:
1. 在 3D 星云中，"仅自己"记忆粒子表面呈现磨砂玻璃效果
2. "加密"记忆粒子以马赛克效果渲染
3. 打开"仅自己"记忆详情，summary 模糊，点击"显示"后清晰
4. 侧栏列表隐私记忆显示 🔒 + 模糊文字
5. 演示模式下所有隐私记忆自动模糊

---

### 84. [UX] 记忆的对跖点 — 找到与当前记忆"最遥远"的那一条 [✅]

**问题**: 找相似（#56）和回旋镖（#72）都关注"相近"的记忆。但从认知心理学来看，最远的记忆也能揭示重要信息——那个与你今天完全相反的你，那个早已遗忘的兴趣。这种"对跖点"视角是对记忆空间的一种哲学式探索。

**改动范围**:
- `src/utils/similarityUtils.ts`: 新增 `findAntipode` 函数——计算当前记忆与所有其他记忆的 10 维特征距离，返回距离最大的那条
- `src/components/DetailPanel.tsx`: 详情面板新增"🌍 对跖点"按钮——点击后展示对跖点记忆卡片 + 自然语言对比描述
- `src/components/MemCloud3D.tsx`: 两个对跖点粒子之间出现最长虚线（颜色=两粒子的情绪中间色），短暂闪烁后恢复

**验证方式**:
1. 打开一条"快乐家庭聚会"记忆详情，点击"🌍 对跖点"
2. 预期：找到一条最遥远的记忆（如"独自在房间编程"），展示对比描述
3. 3D 星云中两个粒子出现最长虚线连接

---

## 记忆宫殿实体化系列 II — 让 AI 的"记忆"有结构、有纹理、有温度

> 以下 10 条 Feature 围绕 **"打破黑盒，把 AI 的记忆宫殿实体化"** 核心目标，不做新的视觉隐喻，而是让现有数据产生新的信息维度。编号接续 #84。

---

### 85. [Features] "小哥如何记住你" — 结构化用户画像面板 [✅]

**问题**: 现有 Memory Bank（#21/#61）虽然提供了雷达图和气质分类，但仍然是"统计数字+抽象标签"。用户无法直观看到 AI 内部到底把自己组织成了怎样的结构化认知。Cognitive Terrain（#74）用了地理隐喻，美但抽象。用户需要一个"AI 关于你的使用说明书"——像维基百科人物条目一样，把 AI 记住的所有关于你的信息，结构化、可浏览地呈现出来。

**改动范围**:
- 新建 `src/components/UserProfile.tsx`: 侧栏面板，按"AI 所知维度"组织成结构化条目卡片——基本信息区（AI 推断的年龄/生活圈）、人物关系网络区（每个重要人物的关系标签+共享记忆数+情绪趋势）、习惯与节律区（AI 学到的你的时间模式）、偏好清单区（显式偏好+隐式偏好）、成长轨迹区（技能/知识/情绪变化摘要）。每个条目可点击展开链接到支撑记忆
- 新建 `src/utils/profileUtils.ts`: 从 rawMemories + insightMemories 生成结构化画像数据的函数集
- `src/App.tsx`: 顶部工具栏或侧栏新增"👤 小哥眼中的你"入口按钮
- 面板顶部显示一句温暖的总结语，如"关于你，小哥记住了 X 件事、Y 个人、Z 个习惯"

**验证方式**:
1. 点击"👤 小哥眼中的你"打开面板
2. 预期：看到结构化条目卡片——基本信息、人物关系、习惯节律、偏好清单、成长轨迹
3. 点击"人物关系"中"爸爸"的卡片，展开该人物的记忆列表+AI 推断的关系描述
4. 每个条目可点击跳转到对应的记忆详情或洞察
5. 面板顶部总结语基于真实数据（记忆数/人物数/习惯数）

---

### 86. [UX] 关系星图 — "AI 眼中的你的社交宇宙" [✅]

**问题**: 社交维度（persons）在当前产品中仅以"标签列表"形式出现在 DetailPanel 和悬停 tooltip 中。但 PRD 10 维模型中社交维度的深度（人物×关系×亲密度的组合）远未被利用。用户看不到"AI 认为哪些人在你的生活中最重要"，也看不到人与人之间通过共享记忆形成的网络。

**改动范围**:
- 新建 `src/components/SocialGraph.tsx`: 悬浮面板或独立视图——以用户为中心节点，放射状展示所有被记忆过的人物。每个人物是一个节点：节点大小=出现频率、距离用户远近=intimacy 平均值、节点颜色=与该人物在一起时的主导情绪、节点间连线=两人同时出现在同一记忆中的次数（线宽=次数）。点击人物节点展开：该人物的记忆列表+AI 推断的关系描述。面板底部有"AI 的社交洞察"自然语言总结
- 新建 `src/utils/socialUtils.ts`: 从 rawMemories 计算社交网络数据（人物共现矩阵、intimacy 统计、情绪关联）
- `src/App.tsx`: 顶部工具栏或侧栏新增"🕸️ 关系星图"入口按钮
- 使用静态 SVG 放射状布局+清晰的标签文字，不做力导向布局炫技动画

**验证方式**:
1. 点击"🕸️ 关系星图"打开面板
2. 预期：看到以用户为中心的放射状社交网络，人物节点大小/距离/颜色各不相同
3. hover 人物节点，显示该人物的记忆数+主导情绪+平均亲密度 tooltip
4. 点击人物节点，展开该人物的记忆列表+AI 推断的关系描述（如"你的主要玩伴，35 次记忆中有 30 次情绪为快乐"）
5. 两个经常同时出现的人物之间有连线，线宽反映共现频率

---

### 87. [UX] 记忆溯源链 — "这条洞察是怎么来的？" [✅]

**问题**: PRD §3.5 定义了洞察记忆的"依据链接"（sourceRawMemoryIds），DetailPanel 确实展示了依据列表。但这个展示是静态的——一串 ID 列表。用户看不到"这些原始记忆是如何一步步聚合成这条洞察的"——推理过程（reasoningTrace 字段）是纯文本，从未被可视化。这正是"AI 黑盒"的核心：用户知道结论，不知道推导过程。

**改动范围**:
- `src/components/DetailPanel.tsx`: 洞察详情中新增"🔬 溯源"按钮，点击后展开步骤化推理链视图——Step 1 到 Step N 逐步展示推理过程（如"我注意到这 47 条记忆中，有 38 条的情绪是'快乐'"→"其中 32 条的人物包含'爸爸'"→"这 32 条的快乐强度均值为 0.88，显著高于全员均值 0.62"→"结论：你和爸爸在一起时最开心"）。每一步可展开查看具体记忆列表；用户可在任一步骤点击"这里不对"进行纠正
- 新建 `src/utils/insightUtils.ts`: 推理链拆解函数——将 reasoningTrace 文本拆解为步骤化展示结构，或基于 sourceRawMemoryIds 反向生成推理步骤
- `src/components/MemCloud3D.tsx`: 溯源模式下，当前步骤涉及的所有粒子在 3D 星云中同步高亮
- `src/store/AppContext.tsx`: 新增 `traceStep` 状态控制溯源步骤

**验证方式**:
1. 打开一条洞察记忆详情，点击"🔬 溯源"
2. 预期：面板展开步骤化推理视图，Step 1 到 Step N 逐条展示
3. 逐步点击展开，每步高亮对应的 3D 粒子
4. 在某步骤点击"这里不对"，弹出纠正输入框
5. 所有步骤走完后，显示最终结论+confidence+原始依据数

---

### 88. [UX] 时间指纹 — "AI 学会的你的生活节律" [✅]

**问题**: 时间维度目前仅以 TimelineScrubber 的线性滑块和情绪日历的离散色块呈现。但 AI 从大量时间戳数据中学到的"你的生活节律"——周几做什么、几点喜欢什么活动、哪个月份最活跃——完全不可见。这个 feature 的核心不是展示"哪天发生了什么事"（已有），而是展示"AI 从时间模式中发现的关于你的规律"。

**改动范围**:
- `src/components/ValueDashboard.tsx`: 新增"⏰ 时间指纹"选项卡——一张 24h×7d 的热力网格（横轴=周一至周日，纵轴=0 点至 23 点），每个格子颜色=该时段记忆密度（深色=高频），hover 显示该时段最常发生的活动类型+主导情绪。下方显示"AI 发现的节律"自然语言卡片（如"你的记忆高峰在周六上午 10 点，通常是在户外活动""你周日晚上 8 点的情绪比平时低 20%"）。右侧显示"月份活跃度"柱状图
- 新建 `src/utils/rhythmUtils.ts`: 从 rawMemories 计算时间指纹数据——按小时×星期聚合、按月份聚合、节律描述生成
- 全部基于真实数据动态计算，timeRange 切换时重新聚合

**验证方式**:
1. 打开 ValueDashboard，切换到"⏰ 时间指纹"选项卡
2. 预期：看到 24h×7d 热力网格 + "AI 发现的节律"卡片 + 月份活跃度柱状图
3. hover 热力网格任意格子，显示该时段最常活动类型+主导情绪 tooltip
4. 切换时间范围（周/月/季），数据重新聚合
5. 无记忆覆盖的时段显示为空

---

### 89. [UX] 记忆拼图完成度 — "AI 对你了解多少？" [✅]

**问题**: AI 对用户的认知永远是片面的。但当前产品只展示"AI 知道什么"，不展示"AI 还不知道什么"。ConfusionDiary（#76）从矛盾/低 confidence 角度切入，但没有回答一个更直观的问题：在 10 个记忆维度上，AI 对你的认知完整度分别是多少？这本身就是"黑盒"透明度的重要维度——让用户知道 AI 在哪些方面对你了如指掌、哪些方面几乎一无所知。

**改动范围**:
- 新建 `src/components/KnowledgeGap.tsx`: 面板展示 10 维度的"拼图完成度"进度条——时间维度（有记忆覆盖的月份/过去 12 个月）、社交维度（出现过的不同人物数 vs 记忆总数比）、活动维度（活动类型覆盖度）等。每个维度下方有 AI 生成的"补全建议"（如"你最近 3 个月没有户外活动记录了，要不要创建一条？"）。顶部汇总行："AI 对你的了解程度：65%。最了解你的情绪（92%），最不了解你的感官体验（12%）"
- 新建 `src/utils/gapUtils.ts`: 计算各维度覆盖度 + 生成补全建议的函数
- `src/App.tsx`: 顶部工具栏新增"🧩 了解程度"入口按钮
- 数字旁边的进度条使用简洁的条形图（非圆环，保持与 ValueDashboard 风格一致）

**验证方式**:
1. 点击"🧩 了解程度"打开面板
2. 预期：看到 10 维度的完成度进度条+补全建议+顶部汇总行
3. 情绪维度完成度高（记忆多），感官维度完成度低（感官数据少）
4. 删除一条记忆后，该记忆所属维度的完成度可能下降
5. 补全建议以自然语言呈现，点击建议可直接跳转到创建记忆表单

---

### 90. [UX] 偏好演化树 — "你喜欢的东西是怎么变的" [✅]

**问题**: 洞察记忆中的"偏好"类别是静态文本（如"你更喜欢图形化编程"）。但偏好不是突然形成的——它们随时间演化。PRD 强调"可进化"、"皮亚杰的同化与顺应"，但偏好演化的过程从未被可视化。用户看不到 AI 如何追踪自己口味的变化。

**改动范围**:
- `src/components/MemoryBank.tsx`: 气质画像面板或新增"🌿 偏好演化"选项卡——选择一个偏好领域（从记忆数据中自动提取，如编程方式、活动类型、社交偏好），以横向时间轴树状图展示其演化历程。每一条分支代表一次偏好转变，节点大小=confidence，分支标注转变原因。树根是最早的偏好记录，叶子是当前状态。点击任意节点展开该时间点的支撑记忆
- 新建 `src/utils/preferenceUtils.ts`: 偏好提取+演化分析函数——从 insightMemories（category='preference'）和 rawMemories 的 semantic.preferences 字段构建演化树数据
- 使用纯 SVG 树状图，x 轴=时间、y 轴=偏好分支

**验证方式**:
1. 打开 Memory Bank，切换到"🌿 偏好演化"选项卡
2. 预期：看到一个或多个偏好领域的演化树，如"编程方式：手掰→图形化"
3. 节点大小反映 confidence，时间轴标注转变时间点
4. 点击任意节点展开支撑记忆列表
5. 偏好未发生变化时显示"该偏好保持稳定，未观察到显著变化"

---

### 91. [UX] 记忆的"重量" — 重要性的多维分解 [✅]

**问题**: 当前 importance 只是一个 0-1 的数字，显示在 DetailPanel 的字段里。但"重要"是一个多维概念——有些记忆因为情绪强度高而重要、有些因为出现频率高、有些因为是里程碑、有些因为被反复回顾。用户看不到 importance 的"成分"，3D 粒子大小也不能反映这种层次。

**改动范围**:
- `src/components/DetailPanel.tsx`: 记忆详情中将 importance 数字替换为"重要性分解雷达图"（微型 SVG 五边形）——5 轴：情绪强度、出现频率、社交密度、是否里程碑、用户操作次数（accessCount+收藏+回顾）。每个轴有实际数值，hover 显示解释
- `src/components/MemCloud3D.tsx`: 粒子大小不再仅由 importance 决定，改为 5 维重要性分解的加权结果（让情绪强+社交密+被回顾次数多的记忆粒子更大更亮）
- `src/utils/valueUtils.ts`: 新增 `computeImportanceBreakdown` 函数——返回 5 维分解数据

**验证方式**:
1. 打开一条记忆详情，查看重要性区域
2. 预期：看到微型 5 轴雷达图（替换原来的纯数字），每轴有标签+数值
3. hover 雷达图各轴，显示该维度的解释（如"情绪强度 0.95——这条记忆的快乐程度非常高"）
4. 3D 星云中，情绪强+回顾次数多的粒子明显比只有高 importance 数字的粒子更大
5. 对比两条 importance 相同的记忆，它们的雷达图形状可能不同

---

### 92. [UX] 记忆"感官档案" — AI 学到的你的感官世界 [✅]

**问题**: 10 维模型中 sensory 维度目前仅用于存储 images/audio/videos，但 PRD 强调的"感官记忆"——声音、气味、触感的记忆——完全是空白。用户最有情感共鸣的往往不是"事实"而是"感官"：那个下午的风的味道、那首歌的前奏。这些在当前产品中全部缺失。

**改动范围**:
- `src/components/DetailPanel.tsx`: 为 sensory 维度新增"感官卡片"——如果有 images/audio 数据，展示缩略图/音频播放器；如果没有感官数据，从记忆 summary 文本中提取感官关键词（如"花香""微风""笑声""温暖""柔软的"），以优雅的排版展示为"感官印象"标签云
- `src/components/ValueDashboard.tsx`: 新增"👁️ 感官档案"选项卡——统计 AI 记录的你最常出现的感官词（如"笑声"出现 15 次）、最常见的场景颜色推断、声音类型分布
- 新建 `src/utils/sensoryUtils.ts`: 感官关键词提取 + 档案统计函数
- Demo 阶段不接入真实感官数据，从 summary 文本中提取

**验证方式**:
1. 打开一条有"笑声""微风"等感官词 summary 的记忆详情
2. 预期：感官卡片以优雅排版展示"感官印象"标签云
3. 如果记忆有 images 数据，展示缩略图
4. 打开 ValueDashboard →"👁️ 感官档案"，查看全局感官统计
5. 无感官关键词的记忆显示"这条记忆没有记录感官细节"

---

### 93. [UX] "如果记忆会说话" — 第一人称记忆叙事 [✅]

**问题**: 所有记忆展示都是第三人称客观视角——"某年某月某日，发生了某事"。这种视角缺乏情感温度。PRD 的"陪伴需求者"画像最需要的是"被记住的温暖感"，而非数据分析。现有的 MemoryReader（#71）是翻书式排版但仍为第三人称。MemorySurprise（#58）的文案有温度但只有一句话。

**改动范围**:
- `src/components/MemoryReader.tsx`: 新增"第一人称叙事模式"切换按钮——切换后，每条记忆以第一人称重新叙述（基于 10 维数据模板化生成）。如将"5 月 18 日，和爸爸在公园骑车，情绪快乐"转换为"那个周六的下午，风吹过我的脸，爸爸在后面扶着车把。我第一次不用辅助轮骑了那么远。我笑得停不下来。"
- 新建 `src/utils/narrativeUtils.ts`: 第一人称叙事模板引擎——时间→自然语言（timestamp→"那个周六的下午"/"一个冬天的早晨"）、人物→关系称谓（"爸爸"/"妈妈"）、活动→动词短语（"骑车"→"骑着车飞驰"）、情绪→身体感受描述（"快乐"→"笑得停不下来"/"心里暖暖的"）
- `src/components/MemCloud3D.tsx`: 第一人称叙事模式下，当前翻阅的记忆粒子出现柔和呼吸光晕
- 非 AI 生成，全部基于规则模板拼接，保证可控性和一致性

**验证方式**:
1. 打开 MemoryReader，点击"💬 第一人称"模式切换
2. 预期：记忆文案从第三人称变为温暖的第一人称叙事
3. 时间/人物/情绪的描述都转换为自然语言，不同记忆有不同表达
4. 翻页时 3D 星云中当前粒子有呼吸光晕
5. 切回第三人称模式恢复正常

---

### 94. [Features] 记忆微电影 — "从你的记忆里剪一部微电影" [✅]

**问题**: AnnualReport（#52）是年终静态总结。但用户可能在任意时刻想要一个"此刻的我的微缩片段"——选取最近 5-10 条记忆，按时间+情绪弧线排列成一个自动播放的"记忆微电影"。不需要真实视频渲染，而是用现有的记忆数据+优雅的自动翻页动画。

**改动范围**:
- 新建 `src/components/MemoryCinema.tsx`: 全屏微电影播放模式——按时间顺序播放最近 N 条记忆（默认 10 条，或用户自选），每条记忆展示为全屏卡片（大号 emoji/图片 + 自然语言重构的叙事文本 + 日期），3 秒自动翻页。翻页动画使用 fade+scale。背景色随记忆情绪变化渐变过渡。底部显示播放进度条。播放结束展示"这就是你最近的 N 个瞬间"总结页。支持暂停/继续/跳过。支持选择记忆来源（最近一周/最近一月/自定义精选集）
- `src/App.tsx`: 顶部工具栏新增"🎬 记忆微电影"入口按钮
- 复用 MemoryReader 的自然语言模板引擎（narrativeUtils.ts）
- Demo 阶段不接入真实视频/音频渲染，纯 CSS 动画卡片播放

**验证方式**:
1. 点击"🎬 记忆微电影"进入全屏播放
2. 预期：第一张记忆卡片出现（全屏大号 emoji/图片+叙事文本+日期），背景色匹配情绪
3. 3 秒后 fade+scale 翻页动画切换到下一张记忆
4. 背景色随之渐变过渡（如快乐的金色→好奇的青色）
5. 底部进度条显示播放进度
6. 按空格暂停/继续，按→跳过当前
7. 播放结束显示"这就是你最近的 N 个瞬间"总结
8. 可通过下拉菜单选择播放最近一周/一月/自定义精选集

---

## 记忆飞轮系列 — Demo Metrics 与数据闭环飞轮

> 以下 7 条 Feature 围绕 **"让用户感知到'小哥在越来越懂我'的数据闭环飞轮"** 核心目标。
> 策略：不做 metrics dashboard（冰冷数字看板），做 flywheel storytelling（故事化、可感知的飞轮动画）。
> 编号接续 #94。

---

### 95. [Features] "小哥懂了" — 飞轮反馈流（Flywheel Feedback Stream） [✅]

**问题**: 用户操作（确认洞察、纠正洞察、重温记忆、添加标签、创建精选集）后只有 Toast 提示"已保存"。这些操作对 AI 认知的影响完全不可见。用户不知道"我的每一次互动，都在让小哥更懂我"。`reinforceMemory()` 已实现但其效果只在 ValueDashboard 的数字里体现，没有叙事性反馈。
**改动范围**:
- 新建 `src/components/FlywheelFeedback.tsx`: 轻量飞轮反馈卡片组件——半透明浮层，从底部滑入，3 秒后自动消失。根据用户操作类型展示自然语言反馈文案。示例：
  - 确认洞察 → *"收到。小哥把你对'编程兴趣'的理解又加深了一层。这条洞察现在的 confidence 从 72% → 85%。已经有 7 条记忆为它提供了证据。"*
  - 重温记忆 → *"你刚刚唤醒了一条快要沉睡的记忆。小哥重新评估了它在记忆空间中的位置——它不再濒危了。记忆潮汐正在变化。"*
  - 纠正洞察 → *"你的纠正触发了蝴蝶效应。小哥正在重新审视 3 条关联洞察。你对'竞争性活动'的态度可能和之前想的不一样。"*
  - 添加标签/精选 → *"你正在亲手编织自己的记忆星座。小哥会根据你的分类更精准地推荐相似记忆。"*
- `src/store/AppContext.tsx`: 新增 `lastAction: { type: string, context: any, timestamp: number } | null` 状态，在关键 action（confirmInsight、correctInsight、reinforceMemory、addTag、addToCollection）后设置，供 FlywheelFeedback 消费
- `src/App.tsx`: 集成 FlywheelFeedback 组件，固定在底部居中位置
- 全部基于现有数据（confidence、accessCount、sourceRawMemoryIds.length 等）动态生成文案，不引入新依赖
**验证方式**:
1. 打开一条洞察记忆详情，点击"👍 确认"
2. 预期：底部滑入飞轮反馈卡片，文案包含 confidence 变化和依据记忆数
3. 卡片 3 秒后自动淡出消失
4. 连续执行多个操作，卡片依次展示（不堆叠，新的替换旧的）
5. 在 ValueDashboard 中点击"重温"，同样触发飞轮反馈

### 96. [UX] 飞轮闭环可视化 — "小哥是怎么越来越懂你的" [✅]

**问题**: PRD §1.3 花大量篇幅讲"可进化"机制（巴特莱特的图式理论、皮亚杰的同化与顺应），但在产品中没有一个地方让用户直观看到"进化"的整体图景。洞察版本链（v1→v2→v3）是局部的，蝴蝶效应动画是瞬时的。需要一次性讲清楚"记忆飞轮"的完整概念。
**改动范围**:
- `src/components/CognitiveTerrain.tsx` 或 `src/components/ValueDashboard.tsx`: 新增"飞轮"视图——一个优美的 SVG 动画循环，6 个阶段：
  1. 🧩 记忆积累（粒子从虚空中浮现）
  2. 🔍 模式发现（粒子聚拢，动画展示聚类）
  3. 💡 洞察生成（粒子中心亮起琥珀金光环）
  4. 👆 用户反馈（用户确认/纠正的节点脉冲扩散）
  5. 🎯 理解加深（光环变大变亮，confidence 数字跳动上升）
  6. 🔄 回到第 1 步（新粒子加入，循环继续）
- 基于 Demo 中已产生的交互（用户确认/纠正/重温操作）渲染摘要动画——"你已经推动了几圈飞轮"
- 飞轮下方展示一句话总结："每一次互动，都在让这个记忆星云更懂你。"
- 使用纯 CSS/SVG 动画，不引入新依赖
**验证方式**:
1. 点击入口进入"🔄 记忆飞轮"视图
2. 预期：看到 6 阶段循环动画，每个阶段有文字说明
3. 动画自动循环播放，不卡顿
4. 底部显示自然语言总结
5. 可在 CognitiveTerrain 中作为子面板、或在 ValueDashboard 中作为独立 Tab

### 97. [UX] "小哥学会的关于你的 N 件事" — 飞轮进度摘要 [✅]

**问题**: 用户做完一系列操作（或 Demo 演示完一圈）后，没有一个"收获总结"。就像游戏副本结束时的战利品页面——你刚才到底改变了什么？
**改动范围**:
- 新建 `src/components/SessionSummary.tsx`: 会话摘要面板，展示本次会话中用户操作带来的变化：
  - *"小哥对你的了解从 47% 提升到了 53%"*（基于 #89 的维度覆盖度算法）
  - *"小哥新学到了 2 个关于你的模式"*（本次确认+新生成的洞察）
  - *"你拯救了 3 条即将被遗忘的记忆"*（本次重温/强化的记忆）
  - *"小哥现在更确信你是'连接者型'记忆者"*（画像 precision 提升）
  - 底部一句温暖的话：*"每一次互动，都在让这个记忆星云更懂你。"*
- 复用 `gapUtils.ts`（#89）和 `memoryBankUtils.ts`（#61）的现有计算函数
- `src/App.tsx`: 在 Demo 演示结束、或用户主动点击入口时展示
- `src/store/AppContext.tsx`: 新增 `sessionStats` 计算——对比会话开始前/后的关键指标变化
**验证方式**:
1. 完成一轮 AutoDemo 演示，或在 Demo 中手动操作 3-5 个交互
2. 点击"📊 会话总结"入口
3. 预期：展示 4 项变化指标 + 底部温暖文案
4. 各指标数字基于实际数据变化（非硬编码）
5. 关闭面板后可再次打开查看

### 98. [UX] ValueDashboard 增加"飞轮指标"选项卡 [✅]

**问题**: ValueDashboard 目前有遗忘曲线、情绪日历、情感旅程、本周回顾等面板，但没有一个地方把"用户行为 → 记忆质量提升"这个因果链展示出来。`reinforceMemory()` 改了 accessCount 和 CQI，但这些变化散落在各个面板里，用户感知不到累积效应。
**改动范围**:
- `src/components/ValueDashboard.tsx`: 新增"🔄 飞轮"选项卡，展示 3 个轻量指标：
  1. 记忆活跃度趋势——过去 N 天里被重温/查看的记忆数量（柱状图，已有数据 `accessCount`）
  2. 洞察质量提升——被用户确认的洞察数量 vs 总洞察数，以及平均 confidence 变化
  3. 遗忘挽救率——有多少条濒危记忆被重温后恢复了（已有数据 `forgettingRisk` + `reinforceMemory`）
- 每个指标下方有一行自然语言总结（非冰冷数字）：
  - *"这个月你重温了 12 条记忆，挽救了其中 8 条——它们现在重新亮起来了。"*
- `src/utils/valueUtils.ts`: 新增 2-3 个聚合函数——`computeActivityTrend`、`computeInsightQualityChange`、`computeRescueRate`
- 局部使用简洁 SVG 柱状图，与 ValueDashboard 现有风格一致
**验证方式**:
1. 打开 ValueDashboard，切换到"🔄 飞轮"选项卡
2. 预期：看到 3 个指标区域，各有图表 + 自然语言总结
3. 重温一条记忆后切换回飞轮选项卡，记忆活跃度数字更新
4. 确认一条洞察后，洞察质量指标更新
5. 无数据时段显示友好空状态

### 99. [Features] Demo 模式的"飞轮叙事线" [✅]

**问题**: 当前 AutoDemo（一键演示）按照功能点顺序展示：打开粒子 → 查看详情 → 切换视图 → 搜索 → Chat 问答 → 查看洞察。这是一个"功能列表"式的演示，不是"故事"式的演示。缺少"飞轮"概念的叙事锚点。
**改动范围**:
- `src/components/AutoDemo/FakeCursor.tsx`: 在 Demo 步骤序列中插入"飞轮时刻"——关键操作节点间暂停，展示半屏叙事文案：
  - *"你已经和小哥互动了 5 分钟。在这 5 分钟里，小哥对'你的编程兴趣'的置信度从 72% 提升到了 85%。"*
  - *"这就是记忆飞轮——你用得越多，它越懂你。"*
- 叙事文案以优雅的大字浮层展示，2-3 秒后自动进入下一步
- 调整 Demo 步骤顺序，让"确认洞察"操作排在"查看洞察"之后，形成"查看 → 反馈 → 飞轮"的叙事弧线
- 不引入新依赖，纯步骤序列 + 文案调整
**验证方式**:
1. 点击"一键演示"，观察 Demo 流程
2. 预期：在关键步骤之间有叙事文案浮层出现，而非纯功能展示
3. 文案内容与当前 Demo 上下文一致（如确认洞察后才展示飞轮文案）
4. 叙事浮层 2-3 秒后自动消失，不打断演示节奏

### 100. [UX] 粒子"进化"动画 — 让飞轮事件在 3D 空间可见 [✅]

**问题**: 当 `reinforceMemory()` 被调用或洞察被确认后，`accessCount`、`CQI`、`confidence` 等数字在 state 中更新了，但在 3D 星云中几乎看不到变化（除了短暂的闪亮）。用户在空间层面感觉不到"记忆在进化"。
**改动范围**:
- `src/components/MemCloud3D.tsx`: 新增 `EvolutionEffect` 逻辑——当关键飞轮事件发生时：
  - 被确认的洞察光环从琥珀金短暂变为亮白色再恢复（"被点亮"的感觉）
  - 被重温的记忆粒子短暂释放一圈微粒（`Points` 子对象，10-15 个微粒子从中心向外扩散后消失，颜色 = 该粒子的情绪色）
  - 被纠正的洞察粒子先短暂变红再恢复（"被挑战"的视觉隐喻）
- `src/store/AppContext.tsx`: 新增 `evolutionEvent: { memoryId, type: 'confirmed' | 'reinforced' | 'corrected', timestamp } | null` 状态
- MemCloud3D 监听 evolutionEvent，触发对应动画，动画持续 1-2 秒后清除事件
- 粒子扩散使用轻量 Points（10-15 点），不影响帧率（目标 ≥30fps）
**验证方式**:
1. 确认一条洞察，预期 3D 星云中对应光环粒子从琥珀金→亮白→琥珀金（约 1.5 秒）
2. 重温一条记忆，预期对应粒子释放一圈微粒向外扩散后消失
3. 纠正一条洞察，预期对应粒子短暂变红后恢复
4. 连续操作多条，动画按顺序播放不重叠
5. Chrome DevTools Performance：帧率不低于 30fps

### 101. [Features] "如果小哥会说话" — 飞轮驱动的动态个性化问候 [✅]

**问题**: ChatPanel 的预设问答是静态的 5 条 Q&A。不管用户在 Demo 中做了什么操作，小哥的回答都不变。飞轮的本质是"交互改变 AI 的认知"，但 Chat 完全没有体现这一点。
**改动范围**:
- `src/components/ChatPanel.tsx`: 小哥的初始问候语根据用户当前交互状态动态变化：
  - 刚打开 Demo，未做任何操作 → *"你好，我是小哥。我记住了关于你的 50 个瞬间，想从哪里开始？"*
  - 用户刚确认了一条洞察 → *"谢谢你告诉我。我刚才重新看了'编程兴趣'相关的所有记忆，更确信你在向图形化编程过渡。"*
  - 用户刚纠正了一条洞察 → *"谢谢你纠正我。我会重新审视这个结论。你的反馈让我更准确了。"*
  - 用户重温了一条濒危记忆 → *"那条记忆已经等待你 47 天了。它现在重新亮起来了。"*
- `src/store/AppContext.tsx`: `lastAction` 状态（与 #95 共享）供 ChatPanel 消费
- 动态问候基于规则模板（lastAction.type + context）+ 自然语言拼接，不接入 LLM
- 预设 5 条 QA 保留不变，仅初始问候语动态化
**验证方式**:
1. 刚打开应用时打开 Chat，预期看到默认问候语
2. 确认一条洞察后重新打开 Chat，预期问候语变为确认相关
3. 重温一条记忆后打开 Chat，预期问候语变为重温相关
4. 关闭 Chat 后再次打开，如果期间无新操作，保持上次的问候语
5. 预设 QA 功能不受影响，照常匹配
