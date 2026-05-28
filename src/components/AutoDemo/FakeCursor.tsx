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

    const SPEED_FACTOR = 1.25;
    const TOTAL_DURATION = 150_000 / SPEED_FACTOR; // 120s at 1.25x
    const startTime = Date.now();

    // Progress tracker
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(100, (elapsed / TOTAL_DURATION) * 100));
    }, 200);

    const wait = (ms: number) => new Promise<void>(resolve => {
      const id = setTimeout(resolve, ms / SPEED_FACTOR);
      timeoutIds.push(id);
    });

    const moveTo = async (x: number, y: number, text: string) => {
      if (isCancelled) return;
      setTooltipText(text);
      setPosition({ x, y });
      await wait(700);
    };

    const clickAt = async (x: number, y: number, text: string, waitAfter: number = 1500) => {
      if (isCancelled) return;
      setTooltipText(text);
      setPosition({ x, y });
      await wait(700);
      if (isCancelled) return;
      setIsClicking(true);
      await wait(250);
      if (isCancelled) return;
      setIsClicking(false);
      await wait(waitAfter);
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
        await wait(250);
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

    const getParticleScreenPos = async (particleId: string): Promise<{ x: number; y: number } | null> => {
      const tryOnce = (): Promise<{ x: number; y: number } | null> => {
        return new Promise(resolve => {
          let resolved = false;
          const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail as Record<string, { x: number; y: number }>;
            if (detail[particleId] && !resolved) {
              resolved = true;
              window.removeEventListener('demo-particle-positions', handler);
              resolve(detail[particleId]);
            }
          };
          window.addEventListener('demo-particle-positions', handler);
          window.dispatchEvent(new CustomEvent('demo-request-particle-positions'));
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              window.removeEventListener('demo-particle-positions', handler);
              resolve(null);
            }
          }, 300);
        });
      };

      // First attempt
      let pos = await tryOnce();
      if (pos) return pos;

      // Wait 1s for camera/animation to settle, then retry
      await wait(1000);
      pos = await tryOnce();
      if (pos) return pos;

      // Final fallback: screen center
      return null;
    };

    const clickParticle = async (particleId: string, text: string, waitAfter: number = 2000) => {
      if (isCancelled) return;
      setTooltipText(text);
      const pos = await getParticleScreenPos(particleId);
      if (pos) {
        setPosition({ x: pos.x, y: pos.y });
        await wait(700);
      } else {
        setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        await wait(700);
      }
      if (isCancelled) return;
      dispatchSelectMemory(particleId);
      setIsClicking(true);
      await wait(250);
      setIsClicking(false);
      await wait(waitAfter);
    };

    /** Simulate typing into an input or textarea */
    const simulateType = async (elementId: string, text: string) => {
      if (isCancelled) return;
      const el = document.getElementById(elementId);
      if (!el) return;
      if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return;
      el.focus();
      const proto = Object.getPrototypeOf(el);
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (nativeInputValueSetter) {
        for (let i = 0; i <= text.length; i++) {
          if (isCancelled) return;
          nativeInputValueSetter.call(el, text.slice(0, i));
          el.dispatchEvent(new Event('input', { bubbles: true }));
          await wait(60);
        }
      } else {
        el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        await wait(200);
      }
    };

    /** 通过 React 受控组件 setter 安全设置 input 值 */
    const setInputValue = (id: string, value: string) => {
      const el = document.getElementById(id);
      if (!el || !(el instanceof HTMLInputElement)) return;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      if (setter) { setter.call(el, value); el.dispatchEvent(new Event('input', { bubbles: true })); }
    };

    const runSequence = async () => {
      if (isCancelled) return;
      try {

      // ─── INTRO (3s) ───────────────────────────────
      setTooltipText('🌌 你的记忆不是文件夹里的文字，而是一个活着的宇宙');
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      await wait(3000);
      if (isCancelled) return;

      // ─── P1: 宇宙诞生 (6s) ────────────────────────
      dispatchCameraMove('zoom-in');
      await moveToCenter('✨ 每颗粒子是一段记忆，颜色是情绪，大小是重要性', 2500);
      if (isCancelled) return;
      dispatchCameraMove('rotate');
      await moveToCenter('🔄 语义相近的记忆自动聚类，形成星座', 2500);
      if (isCancelled) return;
      dispatchCameraMove('zoom-out');
      await wait(1500);
      if (isCancelled) return;

      // ─── P1.5: 粒子悬停 (3s) ──────────────────────
      await moveToCenter('🖱 悬停粒子显示标签+情绪色块，关联连线自动高亮', 1500);
      if (isCancelled) return;
      await moveTo(window.innerWidth * 0.4, window.innerHeight * 0.4,
        '✨ 记忆星云是可交互的宇宙');
      await wait(1200);
      if (isCancelled) return;

      // ─── P2: 触摸一颗星 (7s) ──────────────────────
      await wait(500);
      if (isCancelled) return;
      await clickParticle('mem_007', '📖 点击一颗星，打开 10 维数据', 2000);
      if (isCancelled) return;
      await moveTo(window.innerWidth - 210, window.innerHeight * 0.35,
        '🧠 时间、地点、人物、情绪、活动、CQI……每段记忆都是多维宇宙');
      await wait(2500);
      if (isCancelled) return;
      window.dispatchEvent(new CustomEvent('demo-close-detail'));
      await wait(500);
      if (isCancelled) return;

      // ─── P2.5: 全局搜索 (4s) ──────────────────────
      await moveAndClick('btn-search', '🔍 全局搜索——在记忆宇宙中快速定位', 800);
      if (isCancelled) return;
      await moveTo(window.innerWidth - 100, 16, '输入关键词，匹配粒子自动高亮放大');
      await wait(400);
      if (isCancelled) return;
      setInputValue('demo-search-input', '编程');
      await wait(2000);
      if (isCancelled) return;
      setInputValue('demo-search-input', '');
      await wait(300);
      if (isCancelled) return;
      await moveAndClick('btn-search', '关闭搜索', 500);
      if (isCancelled) return;

      // ─── P3: 分类导航 (5s) ────────────────────────
      await moveAndClick('nav-cat-家庭生活', '📂 多维分类导航——聚焦"家庭生活"', 1500);
      if (isCancelled) return;
      await moveAndClick('nav-sub-快乐时光', '🔍 子分类"快乐时光"——星云自动重新聚类', 1500);
      if (isCancelled) return;
      await moveAndClick('nav-cat-家庭生活', '🔙 再次点击取消分类', 1000);
      if (isCancelled) return;

      // ─── P4: 情绪筛选 (4s) ────────────────────────
      await moveAndClick('nav-legend', '🎨 图例区域——粒子颜色 = 情绪色彩', 800);
      if (isCancelled) return;
      await moveAndClick('emotion-filter-快乐', '😊 点击"快乐"——星云只显示快乐记忆', 1800);
      if (isCancelled) return;
      await moveAndClick('emotion-filter-快乐', '再次点击取消筛选', 800);
      if (isCancelled) return;

      // ─── P5: 四种视角 (6s) ────────────────────────
      await moveAndClick('btn-view-家庭视图', '🏠 家庭视角——家庭记忆聚拢', 1500);
      if (isCancelled) return;
      await moveAndClick('btn-view-学习视图', '🎓 学习视角——学习记忆浮出', 1500);
      if (isCancelled) return;
      await moveAndClick('btn-view-情绪视图', '😊 情绪视角——按情感重排', 1500);
      if (isCancelled) return;
      await moveAndClick('btn-view-全局视图', '🌐 回到全局视图', 800);
      if (isCancelled) return;

      // ─── P6: 记忆碰碰对 (10s) ★ 高潮 ─────────────
      await moveAndClick('btn-serendipity', '🎲 机缘引擎：发现记忆之间隐藏的联系', 2500);
      if (isCancelled) return;
      await moveToCenter('🔗 看！两条看似无关的记忆，其实共享同一个周六上午', 3000);
      if (isCancelled) return;
      await moveToCenter('🎲 每次"换一组"都能发现新的隐藏联系', 2000);
      if (isCancelled) return;
      window.dispatchEvent(new CustomEvent('demo-close-serendipity'));
      await wait(800);
      if (isCancelled) return;

      // ─── P7: AI 洞察 (8s) ────────────────────────
      await wait(500);
      if (isCancelled) return;
      await clickParticle('insight_001', '💡 金色圆环——AI 推理出的高阶认知', 2000);
      if (isCancelled) return;
      await moveTo(window.innerWidth - 210, window.innerHeight * 0.45,
        '🧠 趋势、信念、关系、偏好、习惯、成长——超越原始记忆');
      await wait(3000);
      if (isCancelled) return;
      window.dispatchEvent(new CustomEvent('demo-close-detail'));
      await wait(500);
      if (isCancelled) return;

      // ─── P8: 收藏+导出 (6s) ──────────────────────
      await clickParticle('mem_007', '📖 再次打开记忆详情', 1500);
      if (isCancelled) return;
      await moveAndClick('demo-favorite-btn', '⭐ 收藏——高频星星被置顶', 1500);
      if (isCancelled) return;
      await moveTo(window.innerWidth - 210, window.innerHeight * 0.65,
        '📸 导出记忆卡片——可保存为 PNG 分享给家人');
      await wait(1500);
      if (isCancelled) return;
      window.dispatchEvent(new CustomEvent('demo-close-detail'));
      await wait(500);
      if (isCancelled) return;

      // ─── P9: ChatGPT 导入 (8s) ───────────────────
      await moveAndClick('nav-memory-mgr', '⚙️ 记忆管理——外部 Agent 记忆一键导入', 1500);
      if (isCancelled) return;
      await moveAndClick('nav-chatgpt-import', '🤖 从 ChatGPT 导入聊天记录，自动转化为结构化记忆', 2500);
      if (isCancelled) return;
      await moveToCenter('📥 聊天记录 → 记忆碎片 → 洞察记忆，全链路自动化', 2000);
      if (isCancelled) return;
      await moveAndClick('nav-memory-mgr', '收起面板', 800);
      if (isCancelled) return;

      // ─── P9.5: 记忆银行 (6s) ─────────────────────
      await moveAndClick('memory-bank-trigger', '💰 记忆银行——生命维度投资组合', 1500);
      if (isCancelled) return;
      await moveToCenter('📊 5个生命维度：快乐、逻辑、社交、户外、创意', 1500);
      if (isCancelled) return;
      await moveToCenter('🧬 心智模型气质画像——基于记忆的行为模式分析', 1500);
      if (isCancelled) return;
      await moveAndClick('memory-bank-close', '关闭', 800);
      if (isCancelled) return;

      // ─── P10: StoryWeaver (10s) ───────────────────
      await moveAndClick('nav-storyboard', '📖 "我的侧写"——AGI 用记忆讲述你的故事', 1500);
      if (isCancelled) return;
      await moveAndClick('storyweaver-play-btn', '▶ 播放：记忆节点逐一亮起，情绪轨迹线流动', 1500);
      if (isCancelled) return;
      await moveToCenter('📖 从过去到现在，从现在到未来', 3500);
      if (isCancelled) return;
      await moveToCenter('🔮 每段记忆都是故事的一个章节', 2000);
      if (isCancelled) return;
      await moveAndClick('nav-storyboard', '关闭侧写', 800);
      if (isCancelled) return;

      // ─── P11: 价值看板 (12s) ─────────────────────
      await moveAndClick('val-dash-trigger', '📊 价值看板——高价值记忆排行与遗忘预警', 2000);
      if (isCancelled) return;
      await moveToCenter('📈 高价值记忆排行 + 遗忘风险预警', 2000);
      if (isCancelled) return;
      await moveAndClick('val-dash-health-tab', '❤️ 记忆健康——10 维度覆盖率雷达图', 2000);
      if (isCancelled) return;
      await moveToCenter('📊 雷达图展示各维度记忆覆盖情况，发现知识空白', 2000);
      if (isCancelled) return;
      await moveAndClick('val-dash-decay-tab', '📉 遗忘曲线——艾宾浩斯理论 vs 实际衰减', 2000);
      if (isCancelled) return;
      await moveAndClick('demo-review-btn', '🔄 点击"温故"——重温记忆，遗忘曲线重置', 1500);
      if (isCancelled) return;
      await moveAndClick('val-dash-trigger', '关闭价值看板', 800);
      if (isCancelled) return;

      // ─── P12: 年度报告 (8s) ──────────────────────
      await moveAndClick('btn-annual-report', '📊 年度记忆报告——你的 2026 记忆人格', 2000);
      if (isCancelled) return;
      await moveToCenter('📈 情绪分布、月度活跃、年度关键词', 2500);
      if (isCancelled) return;
      await moveToCenter('🌈 你的情绪以快乐和好奇为主，最常出现的人物是爸爸', 2000);
      if (isCancelled) return;
      window.dispatchEvent(new CustomEvent('demo-close-annual-report'));
      await wait(800);
      if (isCancelled) return;

      // ─── OUTRO (3s) ───────────────────────────────
      setTooltipText('✅ GraphMe — 让每一段记忆都有迹可循');
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      setProgress(100);
      await wait(3000);
      if (!isCancelled) stopDemo();

      } catch (err) {
        console.error('FakeCursor demo sequence error:', err);
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
