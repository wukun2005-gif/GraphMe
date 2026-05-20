import { useEffect, useState, useCallback } from 'react';
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
  const [progress, setProgress] = useState(0); // 0-100

  const stopDemo = useCallback(() => {
    setTooltipText('');
    setPosition({ x: -100, y: -100 });
    setProgress(0);
    onStop();
  }, [onStop]);

  // ESC key exit
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

      // ═══════════════════════════════════════════
      // INTRO (3s)
      // ═══════════════════════════════════════════
      setTooltipText('🚀 开始一键演示：90秒全面探索 GraphMe（按 ESC 随时退出）');
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      await wait(3000);
      if (isCancelled) return;

      // ═══════════════════════════════════════════
      // P1: 星云探索 · 3D交互 (15s total)
      // ═══════════════════════════════════════════
      dispatchCameraMove('zoom-in');
      await moveToCenter('🌌 全局视图下的三维星云：可以缩放、拖拽、转动', 3000);
      if (isCancelled) return;

      dispatchCameraMove('rotate');
      await moveToCenter('距离越近，语义越相似，颜色代表情绪色彩', 3000);
      if (isCancelled) return;

      dispatchCameraMove('pan');
      await moveToCenter('每一颗粒子代表一个原始记忆原子，金色圆环代表洞察记忆', 3000);
      if (isCancelled) return;

      dispatchCameraMove('zoom-out');
      await wait(2000);
      if (isCancelled) return;

      // ═══════════════════════════════════════════
      // P2: 分类导航 · 视图切换 (12s total)
      // ═══════════════════════════════════════════
      await moveAndClick('nav-cat-学习与成长', '📂 通过多维分类导航，快速聚焦不同生活侧面', 2000);
      if (isCancelled) return;

      await moveAndClick('nav-sub-编程学习', '🔍 进入子分类后，星云自动重新聚类，只显示相关记忆', 3000);
      if (isCancelled) return;

      // dispatchCameraMove to show new clustering
      dispatchCameraMove('rotate');
      await moveToCenter('✨ 不同视图下，星云内容自动变化', 2000);
      if (isCancelled) return;

      // Clear category selection to go back to global
      await moveAndClick('nav-cat-学习与成长', '🔙 点击取消分类，返回全局视图', 2000);
      if (isCancelled) return;

      // ═══════════════════════════════════════════
      // P3: 原始记忆卡片阅读 (12s total)
      // ═══════════════════════════════════════════
      // Select a raw memory via custom event to open DetailPanel
      dispatchSelectMemory('mem_007');
      await moveTo(window.innerWidth - 210, window.innerHeight / 3,
        '📖 点击记忆粒子，打开原始记忆卡片详情面板');
      await wait(3000);
      if (isCancelled) return;

      // Scroll through detail info
      await moveTo(window.innerWidth - 210, window.innerHeight / 2,
        '🧠 查看多维信息：时间、地点、人物、情绪、活动等');
      await wait(3000);
      if (isCancelled) return;

      await moveTo(window.innerWidth - 210, window.innerHeight * 0.6,
        '⭐ 每条记忆都有重要性评分和 CQI 综合质量指标');
      await wait(3000);
      if (isCancelled) return;

      // ═══════════════════════════════════════════
      // P4: 记忆卡编辑 (10s total)
      // ═══════════════════════════════════════════
      // Click the edit button in DetailPanel
      // DetailPanel's edit button doesn't have an id yet, let's add one via the click approach
      // The edit button is inside DetailPanel. We need an ID on it.
      // Since we can dispatch, let's use the custom event approach:
      window.dispatchEvent(new CustomEvent('demo-detail-edit'));
      await moveTo(window.innerWidth - 210, window.innerHeight / 3,
        '✏️ 点击编辑按钮，进入记忆卡片编辑模式');
      await wait(3000);
      if (isCancelled) return;

      await moveTo(window.innerWidth - 210, window.innerHeight / 2,
        '📝 可以修改标签、摘要、情绪、地点等所有维度字段');
      await wait(3000);
      if (isCancelled) return;

      // Cancel edit
      window.dispatchEvent(new CustomEvent('demo-detail-cancel-edit'));
      await moveTo(window.innerWidth - 210, window.innerHeight * 0.6,
        '↩️ 取消编辑，返回阅读模式');
      await wait(2000);
      if (isCancelled) return;

      // Close detail panel
      window.dispatchEvent(new CustomEvent('demo-close-detail'));
      await wait(500);
      if (isCancelled) return;

      // ═══════════════════════════════════════════
      // P5: 洞察记忆卡片阅读 (12s total)
      // ═══════════════════════════════════════════
      // Open legend to show insight toggle
      await moveAndClick('nav-legend', '📖 打开图例说明，了解记忆类型', 1500);
      if (isCancelled) return;

      await moveAndClick('btn-toggle-raw', '🔵 隐藏原始记忆，只显示洞察网络', 2000);
      if (isCancelled) return;

      // Select an insight memory
      dispatchSelectMemory('insight_001');
      await moveTo(window.innerWidth - 210, window.innerHeight / 3,
        '💡 金色圆环代表洞察记忆：AI从原子中推理出的高阶认知');
      await wait(3000);
      if (isCancelled) return;

      await moveTo(window.innerWidth - 210, window.innerHeight * 0.55,
        '📊 查看置信度、支撑记忆来源和版本演化历程');
      await wait(3000);
      if (isCancelled) return;

      // Close detail, restore raw, close legend
      window.dispatchEvent(new CustomEvent('demo-close-detail'));
      await wait(300);
      if (isCancelled) return;
      await moveAndClick('btn-toggle-raw', '🔵 恢复全量视图', 1000);
      if (isCancelled) return;
      await moveAndClick('nav-legend', '📖 收起图例', 500);
      if (isCancelled) return;

      // ═══════════════════════════════════════════
      // P6: 价值看板展示 (10s total)
      // ═══════════════════════════════════════════
      await moveAndClick('val-dash-trigger', '📊 打开价值看板，查看高价值记忆与遗忘预警', 2000);
      if (isCancelled) return;

      // Get value dashboard panel position
      await moveTo(window.innerWidth - 210, window.innerHeight - 250,
        '🏆 Top 5 高价值记忆排行：综合重要性、CQI、情感强度评分');
      await wait(3000);
      if (isCancelled) return;

      await moveTo(window.innerWidth - 210, window.innerHeight - 150,
        '🔔 遗忘风险预警：提醒你哪些重要记忆需要回顾加固');
      await wait(3000);
      if (isCancelled) return;

      // Close value dashboard
      await moveAndClick('val-dash-trigger', '关闭价值看板', 500);
      if (isCancelled) return;

      // ═══════════════════════════════════════════
      // P7: 小哥对话 & 记忆链接跳转 (12s total)
      // ═══════════════════════════════════════════
      await moveAndClick('chat-trigger', '💬 打开 GraphMe 对话助手', 1500);
      if (isCancelled) return;

      // Click first Q&A to expand it (the first question button in chat panel)
      // ChatPanel's questions are buttons inside the panel but don't have IDs
      // We'll use a custom event to expand the first QA
      window.dispatchEvent(new CustomEvent('demo-chat-expand', { detail: { index: 0 } }));
      // Move cursor to the chat area
      const chatPanel = document.querySelector('.fixed.bottom-20.w-\\[360px\\]');
      const chatRect = chatPanel?.getBoundingClientRect();
      if (chatRect) {
        await moveTo(chatRect.left + chatRect.width / 2, chatRect.top + 80,
          '❓ 问一个问题：AI 基于记忆网络生成深度分析');
      } else {
        await moveToCenter('❓ 问一个问题：AI 基于记忆网络生成深度分析');
      }
      await wait(3000);
      if (isCancelled) return;

      // Click on the memory link
      await moveAndClick('chat-link-0', '🔗 点击记忆链接，直接跳转到相关记忆的详情', 3000);
      if (isCancelled) return;

      await moveTo(window.innerWidth - 210, window.innerHeight / 3,
        '🔗 记忆链接让对话与记忆网络无缝连接');
      await wait(2000);
      if (isCancelled) return;

      // Close detail & chat
      window.dispatchEvent(new CustomEvent('demo-close-detail'));
      await wait(300);
      if (isCancelled) return;
      await moveAndClick('chat-trigger', '关闭对话助手', 500);
      if (isCancelled) return;

      // ═══════════════════════════════════════════
      // OUTRO (3s)
      // ═══════════════════════════════════════════
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
  }, [isPlaying, stopDemo]);

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
