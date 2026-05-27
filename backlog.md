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

### 13. [Stability] 全局状态管理缺乏 undo/redo 能力

**问题**: 用户删除或编辑记忆后无法撤销，对涉及数据资产的操作缺乏安全感。
**改动范围**:
- `src/store/AppContext.tsx`: 引入简单 undo 栈（最近 5 步快照），或删除时保留到"回收站"
**验证方式**:
1. 删除一条记忆，点击"撤销"
2. 预期：记忆恢复到删除前状态

### 14. [Security] ChatGPT 导入 setInterval 无错误处理和清理

**问题**: `startChatGPTImport` 使用 `setInterval` 模拟导入进度，组件卸载时未清除会导致内存泄漏。
**改动范围**:
- `src/store/AppContext.tsx`: 在 cleanup 中清除 interval，或改用 `requestAnimationFrame` + 超时
**验证方式**:
1. 开始 ChatGPT 导入，在进度条跑完前切换页面/关闭面板
2. 预期：无控制台错误，无内存泄漏警告
