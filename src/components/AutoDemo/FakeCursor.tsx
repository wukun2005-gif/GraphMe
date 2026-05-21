import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Tooltip from './Tooltip';

interface FakeCursorProps {
  isPlaying: boolean;
  onStop: () => void;
}

export default function FakeCursor({ isPlaying, onStop }: FakeCursorProps) {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isClicking, setIsClicking] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const [progress, setProgress] = useState(0);

  const stopDemoRef = useRef<() => void>(() => {});

  stopDemoRef.current = () => {
    setTooltipText('');
    setPosition({ x: -100, y: -100 });
    setProgress(0);
    onStop();
  };

  const stopDemo = useCallback(() => stopDemoRef.current(), []);

  useEffect(() => {
    if (!isPlaying) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stopDemo();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPlaying, stopDemo]);

  useEffect(() => {
    if (!isPlaying) return;

    let timeoutIds: ReturnType<typeof setTimeout>[] = [];
    let isCancelled = false;

    const TOTAL_DURATION = 90_000; // 90 seconds
    const startTime = Date.now();

    // Progress tracker
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(100, (elapsed / TOTAL_DURATION) * 100));
    }, 200);

    const wait = (ms: number) => new Promise<void>(resolve => {
      const id = setTimeout(resolve, ms);
      timeoutIds.push(id);
    });

    const moveTo = async (x: number, y: number, text: string) => {
      if (isCancelled) return;
      setTooltipText(text);
      setPosition({ x, y });
      await wait(700);
    };

    const moveAndClick = async (elementId: string, text: string, waitAfter: number = 2000) => {
      if (isCancelled) return;
      const el = document.getElementById(elementId);
      if (el) {
        setTooltipText(text);
        const rect = el.getBoundingClientRect();
        setPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        await wait(700);
        if (isCancelled) return;
        setIsClicking(true);
        await wait(200);
        if (isCancelled) return;
        el.click();
        setIsClicking(false);
        await wait(waitAfter);
      } else {
        console.warn('FakeCursor: element not found:', elementId);
        await wait(500);
      }
    };

    const moveToCenter = async (text: string, waitAfter: number = 2000) => {
      if (isCancelled) return;
      setTooltipText(text);
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      await wait(700);
      if (isCancelled) return;
      await wait(waitAfter);
    };

    const dispatchCameraMove = (action: string = 'rotate') => {
      window.dispatchEvent(new CustomEvent('demo-camera-move', { detail: { action } }));
    };

    /** Dispatch a custom event so AppInner can call selectMemory with a specific memory id */
    const dispatchSelectMemory = (memoryId: string) => {
      window.dispatchEvent(new CustomEvent('demo-select-memory', { detail: { id: memoryId } }));
    };

    /** Simulate typing into an input */
    const simulateType = async (elementId: string, text: string) => {
      if (isCancelled) return;
      const el = document.getElementById(elementId) as HTMLInputElement | null;
      if (!el) return;
      el.focus();
      // Use native input value setter to trigger React's onChange
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set;
      if (nativeInputValueSetter) {
        for (let i = 0; i <= text.length; i++) {
          if (isCancelled) return;
          nativeInputValueSetter.call(el, text.slice(0, i));
          el.dispatchEvent(new Event('input', { bubbles: true }));
          await wait(60);
        }
      }
    };

    const runSequence = async () => {
      if (isCancelled) return;

      // INTRO (2s)
      setTooltipText('🚀 开始一键演示：90秒全面探索 GraphMe（按 ESC 随时退出）');
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      await wait(2000);
      if (isCancelled) return;

      // P1: 星云探索 · 3D交互 (10s)
      dispatchCameraMove('zoom-in');
      await moveToCenter('🌌 三维记忆星云：缩放查看语义距离，粒子越近语义越相似', 2500);
      if (isCancelled) return;

      dispatchCameraMove('rotate');
      await moveToCenter('🔄 旋转星云从不同角度观察记忆聚类结构', 2500);
      if (isCancelled) return;

      dispatchCameraMove('pan');
      await moveToCenter('🖐 拖拽平移视角，浏览整个记忆空间', 2500);
      if (isCancelled) return;

      dispatchCameraMove('zoom-out');
      await wait(2000);
      if (isCancelled) return;

      // P2: 分类导航 · 多视图切换 (12s)
      await moveAndClick('nav-cat-家庭生活', '📂 通过多维分类导航聚焦不同生活侧面', 2000);
      if (isCancelled) return;

      await moveAndClick('nav-sub-快乐时光', '🔍 "快乐时光"子分类——星云自动重新聚类显示相关记忆', 3000);
      if (isCancelled) return;

      await moveAndClick('nav-cat-家庭生活', '🔙 取消分类返回全局视图', 2000);
      if (isCancelled) return;

      await moveAndClick('nav-cat-学习与成长', '📂 切换到"学习与成长"分类', 2000);
      if (isCancelled) return;

      await moveAndClick('nav-sub-编程学习', '💻 "编程学习"子分类——不同视图下星云内容自动变化', 3000);
      if (isCancelled) return;

      // P3: 记忆卡片 · 原始记忆 + 洞察记忆 (12s)
      dispatchSelectMemory('mem_007');
      await moveTo(window.innerWidth - 210, window.innerHeight / 3,
        '📖 点击记忆粒子，打开原始记忆卡片详情面板');
      await wait(3500);
      if (isCancelled) return;

      await moveTo(window.innerWidth - 210, window.innerHeight * 0.55,
        '🧠 查看多维信息：时间、地点、人物、情绪、活动、CQI等');
      await wait(3000);
      if (isCancelled) return;

      dispatchSelectMemory('insight_001');
      await moveTo(window.innerWidth - 210, window.innerHeight / 3,
        '💡 金色圆环代表洞察记忆：AI从原子中推理出的高阶认知');
      await wait(3500);
      if (isCancelled) return;

      window.dispatchEvent(new CustomEvent('demo-close-detail'));
      await wait(500);
      if (isCancelled) return;

      // P4: 记忆卡编辑流程 (10s)
      dispatchSelectMemory('mem_007');
      await wait(800);
      if (isCancelled) return;

      window.dispatchEvent(new CustomEvent('demo-detail-edit'));
      await wait(300);
      if (isCancelled) return;
      await moveTo(window.innerWidth - 210, window.innerHeight / 3,
        '✏️ 进入编辑模式，修改记忆卡片');
      await wait(2000);
      if (isCancelled) return;

      await moveAndClick('demo-edit-label', '📝 选中标签字段，输入新标签', 500);
      if (isCancelled) return;
      await simulateType('demo-edit-label', '儿童节游乐园冒险日');
      await wait(1500);
      if (isCancelled) return;

      await moveAndClick('demo-edit-summary', '📝 选中摘要字段，更新摘要内容', 500);
      if (isCancelled) return;
      await simulateType('demo-edit-summary', '六一儿童节在游乐园度过快乐的一天，玩了过山车和旋转木马');
      await wait(1500);
      if (isCancelled) return;

      window.dispatchEvent(new CustomEvent('demo-detail-cancel-edit'));
      await wait(300);
      if (isCancelled) return;
      await moveTo(window.innerWidth - 210, window.innerHeight * 0.6,
        '↩️ 取消编辑返回阅读模式');
      await wait(1500);
      if (isCancelled) return;

      window.dispatchEvent(new CustomEvent('demo-close-detail'));
      await wait(500);
      if (isCancelled) return;

      // P5: 价值看板 + 记忆健康 (10s)
      await moveAndClick('val-dash-trigger', '📊 打开价值看板——查看高价值记忆排行与遗忘预警', 2500);
      if (isCancelled) return;

      await moveAndClick('val-dash-health-tab', '❤️ 切换到"记忆健康"——10维度覆盖率雷达图', 3000);
      if (isCancelled) return;

      const valDashEl = document.getElementById('val-dash-trigger');
      const valRect = valDashEl?.getBoundingClientRect();
      const vdX = valRect ? valRect.left : window.innerWidth - 40;
      const vdY = valRect ? valRect.bottom - 200 : window.innerHeight - 200;
      await moveTo(vdX, vdY,
        '📈 雷达图展示各维度记忆覆盖情况，发现知识空白');
      await wait(3000);
      if (isCancelled) return;

      await moveAndClick('val-dash-trigger', '关闭价值看板', 1000);
      if (isCancelled) return;

      // P6: ChatGPT 导入 (8s)
      await moveAndClick('nav-memory-mgr', '⚙️ 打开记忆管理面板', 2000);
      if (isCancelled) return;

      await moveAndClick('nav-chatgpt-import', '🤖 从 ChatGPT 一键导入聊天记录转化为记忆碎片', 2000);
      if (isCancelled) return;

      await moveToCenter('📥 模拟导入过程：聊天记录 → 记忆碎片 → 洞察记忆', 3000);
      if (isCancelled) return;

      await moveAndClick('nav-memory-mgr', '收起记忆管理面板', 1000);
      if (isCancelled) return;

      // P7: Chatbot 问答 + 记忆链接 (10s)
      await moveAndClick('chat-trigger', '💬 打开 GraphMe 对话助手', 1500);
      if (isCancelled) return;

      window.dispatchEvent(new CustomEvent('demo-chat-expand', { detail: { index: 0 } }));
      await wait(800);
      if (isCancelled) return;

      const chatPanel = document.querySelector('.fixed.bottom-20.w-\\[360px\\]');
      const chatRect = chatPanel?.getBoundingClientRect();
      if (chatRect) {
        await moveTo(chatRect.left + chatRect.width / 2, chatRect.top + 100,
          '❓ AI 基于记忆网络生成深度分析回答');
      } else {
        await moveToCenter('❓ AI 基于记忆网络生成深度分析回答');
      }
      await wait(3000);
      if (isCancelled) return;

      await moveAndClick('chat-link-0', '🔗 点击记忆链接直接跳转到相关记忆详情', 3000);
      if (isCancelled) return;

      window.dispatchEvent(new CustomEvent('demo-close-detail'));
      await wait(300);
      if (isCancelled) return;
      await moveAndClick('chat-trigger', '关闭对话助手', 500);
      if (isCancelled) return;

      // P8: Story Board 叙事展示 (8s)
      await moveAndClick('nav-storyboard', '📖 打开"小哥说我"——AGI 用记忆讲述你的故事', 3000);
      if (isCancelled) return;

      await moveToCenter('📖 图文并茂的叙事：原始记忆讲述过去，洞察记忆描绘未来', 3000);
      if (isCancelled) return;

      await moveToCenter('点击遮罩或关闭按钮退出 Story Board', 2000);
      if (isCancelled) return;

      // Close Story Board by clicking backdrop (center of screen is covered by modal)
      // Click the close button area - near top right
      await moveAndClick('nav-storyboard', '收起小哥说我', 1000);
      if (isCancelled) return;

      // OUTRO (3s)
      setTooltipText('✅ 演示结束！GraphMe — 让每一段记忆都有迹可循');
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      setProgress(100);
      await wait(3000);

      if (!isCancelled) {
        stopDemo();
      }
    };

    runSequence();

    return () => {
      isCancelled = true;
      clearInterval(progressInterval);
      timeoutIds.forEach(clearTimeout);
    };
  }, [isPlaying]);

  if (!isPlaying) return null;

  return (
    <>
      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 w-full h-1 z-[120] bg-black/20">
        <motion.div
          className="h-full bg-gradient-to-r from-[#00f2ff] to-[#ffb800]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Stop button */}
      <button
        onClick={stopDemo}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[120] px-4 py-2 rounded-full
          bg-red-500/20 hover:bg-red-500/40 text-red-300 text-xs font-medium backdrop-blur-sm
          border border-red-500/30 transition-all cursor-pointer shadow-lg
          flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-sm bg-red-400 inline-block" />
        停止演示 (ESC)
      </button>

      {/* Tooltip */}
      <Tooltip text={tooltipText} position={position} />

      {/* Cursor */}
      <motion.div
        className="fixed z-[110] pointer-events-none"
        animate={{
          x: position.x,
          y: position.y,
          scale: isClicking ? 0.7 : 1,
        }}
        transition={{
          duration: 0.6,
          ease: 'anticipate',
        }}
        style={{ left: 0, top: 0, marginLeft: -12, marginTop: -12 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 2L20 10.6667L12 13L10 21L4 2Z" fill="white" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
        {/* Click ripple */}
        {isClicking && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-[#00f2ff]"
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </motion.div>
    </>
  );
}
