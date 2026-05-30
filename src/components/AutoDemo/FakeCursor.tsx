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
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') stopDemo(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPlaying, stopDemo]);

  useEffect(() => {
    if (!isPlaying) return;

    let timeoutIds: ReturnType<typeof setTimeout>[] = [];
    let isCancelled = false;

    const TOTAL_DURATION = 300_000;
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      setProgress(Math.min(100, ((Date.now() - startTime) / TOTAL_DURATION) * 100));
    }, 200);

    const wait = (ms: number) => new Promise<void>(resolve => {
      const id = setTimeout(resolve, ms); timeoutIds.push(id);
    });

    const checkCancelled = () => { if (isCancelled) throw new Error('__CANCELLED__'); };

    const moveTo = async (x: number, y: number, text: string) => {
      checkCancelled(); setTooltipText(text); setPosition({ x, y }); await wait(700); checkCancelled();
    };

    const moveToCenter = async (text: string, waitAfter = 2000) => {
      checkCancelled(); setTooltipText(text);
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      await wait(700); checkCancelled(); await wait(waitAfter); checkCancelled();
    };

    const moveAndClick = async (elementId: string, text: string, waitAfter = 2000): Promise<boolean> => {
      checkCancelled();
      for (let attempt = 0; attempt < 3; attempt++) {
        const el = document.getElementById(elementId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setTooltipText(text);
            setPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            await wait(700); checkCancelled();
            setIsClicking(true); await wait(250); checkCancelled();
            el.click(); setIsClicking(false);
            await wait(waitAfter); return true;
          }
        }
        await wait(800); checkCancelled();
      }
      return false;
    };

    const requireClick = async (id: string, text: string, waitAfter = 2000) => {
      if (!(await moveAndClick(id, text, waitAfter))) throw new Error(`"${id}" not found`);
    };

    const tryClick = async (id: string, text: string, waitAfter = 2000) => {
      await moveAndClick(id, text, waitAfter);
    };

    const dispatchCameraMove = (action = 'rotate') => {
      window.dispatchEvent(new CustomEvent('demo-camera-move', { detail: { action } }));
    };

    const dispatchSelectMemory = (memoryId: string) => {
      window.dispatchEvent(new CustomEvent('demo-select-memory', { detail: { id: memoryId } }));
    };

    const getParticleScreenPos = async (particleId: string): Promise<{ x: number; y: number } | null> => {
      const tryOnce = (): Promise<{ x: number; y: number } | null> => new Promise(resolve => {
        let done = false;
        const handler = (e: Event) => {
          const d = (e as CustomEvent).detail as Record<string, { x: number; y: number }>;
          if (d[particleId] && !done) { done = true; window.removeEventListener('demo-particle-positions', handler); resolve(d[particleId]); }
        };
        window.addEventListener('demo-particle-positions', handler);
        window.dispatchEvent(new CustomEvent('demo-request-particle-positions'));
        setTimeout(() => { if (!done) { done = true; window.removeEventListener('demo-particle-positions', handler); resolve(null); } }, 500);
      });
      let pos = await tryOnce(); if (pos) return pos;
      await wait(1500); checkCancelled(); pos = await tryOnce(); if (pos) return pos;
      await wait(3000); checkCancelled(); return await tryOnce();
    };

    const clickParticle = async (particleId: string, text: string, waitAfter = 2000) => {
      checkCancelled(); setTooltipText(text);
      const pos = await getParticleScreenPos(particleId); checkCancelled();
      setPosition(pos ? { x: pos.x, y: pos.y } : { x: window.innerWidth / 2, y: window.innerHeight / 2 });
      await wait(700); checkCancelled();
      dispatchSelectMemory(particleId);
      setIsClicking(true); await wait(250); checkCancelled();
      setIsClicking(false); await wait(waitAfter); checkCancelled();
    };

    const clickMorePanelFeature = async (featureId: string, text: string, waitAfter = 2000): Promise<boolean> => {
      checkCancelled();
      if (!(await moveAndClick('btn-more', '更多功能', 800))) return false;
      checkCancelled();
      return await moveAndClick(`btn-${featureId}`, text, waitAfter);
    };

    // ═══════════════════════════════════════════════
    //  5-MINUTE COMPETITION DEMO
    //  Timing: moveToCenter=700+w, moveAndClick=950+w
    //  clickParticle≈5700+w, clickMorePanelFeature≈2700+w
    // ═══════════════════════════════════════════════

    const runSequence = async () => {
      try {
      checkCancelled();

      // ─── INTRO (0:00–0:16, 16s) ─────────────────
      await wait(1500);
      await moveToCenter('你的记忆不是文件夹里的文字', 3500);
      await moveToCenter('而是一个活着的宇宙', 3500);
      dispatchCameraMove('rotate');
      await moveToCenter('每颗粒子是一段记忆，颜色是情绪，大小是重要性', 4000);

      // ─── CORE MAGIC (0:16–0:48, 32s) ─────────────
      await clickParticle('mem_007', '点击一颗星，打开 10 维数据', 3500);
      await moveTo(window.innerWidth - 210, window.innerHeight * 0.35,
        '时间、地点、人物、情绪、活动、CQI……每段记忆都是多维宇宙');
      await wait(4000);
      await requireClick('demo-find-similar-btn', '找相似——发现语义相近的记忆', 3000);
      window.dispatchEvent(new CustomEvent('demo-close-detail'));
      await wait(1500);
      const legendOk = await moveAndClick('nav-legend', '图例——粒子颜色 = 情绪色彩', 1500);
      if (legendOk) {
        await tryClick('emotion-filter-快乐', '点击"快乐"——星云只显示快乐记忆', 2500);
        await tryClick('emotion-filter-快乐', '再次点击取消筛选', 1000);
      }

      // ─── DIMENSION VIEWS (0:40–1:10, 30s) ─────────
      await moveToCenter('顶部维度切换——同一组记忆，四种视角', 3000);
      await moveToCenter('每个视角重新排列所有记忆粒子，发现不同维度的关联', 3000);
      await requireClick('btn-view-家庭视图', '切换到家庭视图', 2000);
      await moveToCenter('家庭记忆聚在一起，学习记忆散落四周——关系一目了然', 4000);
      await requireClick('btn-view-学习视图', '切换到学习视图', 2000);
      await moveToCenter('编程、数学、阅读各自成簇——知识版图清晰可见', 4000);
      await requireClick('btn-view-情绪视图', '切换到情绪视图', 2000);
      await moveToCenter('快乐金光闪闪，悲伤冷蓝幽幽——情绪光谱尽收眼底', 4000);
      await requireClick('btn-view-全局视图', '切回全局视图', 2000);
      await moveToCenter('四种视角，同一组记忆，不同的理解方式', 3000);

      // ─── CATEGORY NAV (1:10–1:40, 30s) ────────────
      await moveToCenter('左侧分类导航——按生活领域快速筛选', 3000);
      // First expand the sidebar by clicking the expand button
      const expandOk = await moveAndClick('nav-expand', '展开导航侧栏', 1500);
      if (expandOk) {
        await moveAndClick('nav-cat-家庭生活', '点击"家庭生活"', 2000);
        await moveToCenter('星云实时重排，只显示家庭相关记忆', 3000);
        await moveToCenter('父子协作、快乐时光、日常生活——三个子分类清晰呈现', 3500);
        await moveAndClick('nav-cat-学习与成长', '切换到"学习与成长"', 2000);
        await moveToCenter('学习记忆重新聚类——编程、数学、阅读各成体系', 3500);
        await moveAndClick('nav-cat-社交与情感', '切换到"社交与情感"', 2000);
        await moveToCenter('朋友互动、情感表达——社交网络跃然眼前', 3500);
        await moveAndClick('nav-cat-家庭生活', '再次点击取消筛选', 1500);
        await moveToCenter('所有记忆回归——完整宇宙重现', 2500);
      }

      // ─── SEARCH (1:40–1:48, 8s) ─────────────────
      await requireClick('btn-search', '搜索——快速定位任何记忆', 2000);
      await moveToCenter('输入关键词，实时筛选记忆粒子', 2500);
      await moveToCenter('支持记忆 ID、标签、摘要、人物等多维度搜索', 2500);

      // ─── MEMORY BANK (0:56–1:08, 12s) ────────────
      await requireClick('memory-bank-trigger', '记忆银行——你的收藏夹和统计', 2000);
      await moveToCenter('收藏的记忆按时间线排列，越用越丰富', 3000);
      await moveToCenter('记忆统计——收藏总数、时间分布、情绪分布', 2500);
      await tryClick('memory-bank-close', '', 1000);

      // ─── CHAT (1:08–1:37, 29s) ───────────────────
      await requireClick('chat-trigger', '聊天——和 AI 对话探索记忆', 2500);
      await moveToCenter('AI 基于你的记忆回答问题，不是通用聊天', 3500);
      await tryClick('chat-qa-0', '点击一个预设问题', 2500);
      await moveToCenter('AI 回答并引用真实记忆——可点击跳转', 2500);
      await tryClick('chat-link-0', '点击记忆链接——跳转到原始记忆', 2500);
      await moveToCenter('每个回答都可追溯来源，AI 越了解你回答越精准', 3500);
      await tryClick('chat-close', '', 1000);
      // Close detail panel that may have opened from memory link click
      window.dispatchEvent(new CustomEvent('demo-close-detail'));
      await wait(800);

      // ─── AI SUPERPOWERS (1:37–3:43, 126s) ───────
      // ChatGPT Import (28s)
      await requireClick('nav-memory-mgr', '记忆管理——外部 Agent 记忆一键导入', 2000);
      await requireClick('nav-chatgpt-import', '从 ChatGPT 导入聊天记录，自动转化为结构化记忆', 4000);
      await moveToCenter('聊天记录 → 记忆碎片 → 洞察记忆', 3000);
      await moveToCenter('全链路自动化，ChatGPT 的记忆现在也有了 10 维结构', 2500);
      await tryClick('nav-memory-mgr', '', 1000);

      // Storyboard (60s) ★ COMPLETE
      await requireClick('nav-storyboard', '"我的侧写"——AGI 用记忆讲述你的故事', 2500);
      await requireClick('storyweaver-play-btn', '播放：记忆节点逐一亮起，情绪轨迹线流动', 3000);
      await moveToCenter('从过去到现在，从现在到未来', 4000);
      await moveToCenter('每段记忆都是故事的一个章节', 3500);
      // Click on a visible memory node to demonstrate interaction
      await clickParticle('mem_003', '点击故事中的一个节点——查看这段记忆', 3000);
      window.dispatchEvent(new CustomEvent('demo-close-detail'));
      await wait(1000);
      await moveToCenter('AI 自动编织记忆叙事，无需手动整理', 3000);
      await tryClick('nav-storyboard', '', 1000);

      // Cinema (18s)
      await requireClick('btn-cinema', '微电影——记忆变成电影画面', 2500);
      await moveToCenter('记忆碎片变成连贯的微电影，自动配乐', 3500);
      await moveToCenter('选择不同时间范围，生成不同时长的影片', 2500);
      await tryClick('cinema-close', '', 1000);

      // Value Dashboard (60s) ★ COMPLETE with all tabs
      await requireClick('val-dash-trigger', '价值看板——你的记忆理财顾问', 2500);
      await moveToCenter('高价值记忆排行 + 遗忘风险预警', 4000);
      await requireClick('val-dash-health-tab', '记忆健康——10 维度覆盖率', 3000);
      await requireClick('val-dash-decay-tab', '遗忘曲线——艾宾浩斯理论 vs 实际衰减', 3000);
      await tryClick('demo-review-btn', '点击"温故"——重温记忆，遗忘曲线重置', 2500);
      await moveToCenter('你刚才唤醒了一条快要沉睡的记忆——这就是飞轮', 4000);
      await requireClick('val-dash-journey-tab', '情感旅程——连续情绪曲线', 3000);
      await moveToCenter('从好奇到骄傲，你的情绪就是你的成长轨迹', 3000);
      await requireClick('val-dash-weekly-tab', '本周回顾——新增记忆 + 情绪分布', 3000);
      await moveToCenter('每周回顾让你看到记忆积累的轨迹', 3000);
      await requireClick('val-dash-flywheel-tab', '记忆飞轮——小哥是怎么越来越懂你的', 3000);
      await moveToCenter('记忆积累 → 模式发现 → 洞察生成 → 用户反馈 → 理解加深 → 循环继续', 3500);
      await moveToCenter('你参与得越多，AI 越懂你——这就是飞轮效应', 3000);
      await tryClick('val-dash-close', '', 1000);

      // ─── EMOTIONAL PEAK (3:43–4:20, 37s) ────────
      try {
        const ok = await clickMorePanelFeature('serendipity', '记忆碰碰对：发现记忆之间隐藏的联系', 3000);
        if (ok) {
          await moveToCenter('两条看似无关的记忆，其实共享同一个周六上午', 3000);
          await tryClick('serendipity-refresh', '换一组——发现新的隐藏联系', 2500);
          await moveToCenter('每次换组都能发现新的隐藏联系', 2500);
          await moveToCenter('这是 AI 的"顿悟"——从数据中发现意义', 2000);
          window.dispatchEvent(new CustomEvent('demo-close-serendipity'));
          await wait(800);
        }
      } catch (e) { /* serendipity feature may not exist */ console.debug?.('[FakeCursor] Serendipity demo skipped:', e); }

      try {
        const ok = await clickMorePanelFeature('dream', '记忆梦境——AI 重组记忆碎片', 2500);
        if (ok) {
          await moveToCenter('从不同时间线抽取碎片，拼接成超现实叙事', 3000);
          await moveToCenter('你梦见公园变成了教室，爸爸正在编程', 2500);
          await tryClick('demo-dream-sources', '查看灵感来源——每个梦境都有迹可循', 2000);
          window.dispatchEvent(new CustomEvent('demo-close-dream'));
          await wait(500);
        }
      } catch (e) { /* dream feature may not exist */ console.debug?.('[FakeCursor] Dream demo skipped:', e); }

      // ─── FLYWHEEL (4:20–5:00, 40s) ───────────────
      try {
        const ok = await clickMorePanelFeature('annual', '年度记忆报告——你的 2026 记忆人格', 2500);
        if (ok) {
          await moveToCenter('情绪分布、月度活跃、年度关键词', 3500);
          window.dispatchEvent(new CustomEvent('demo-close-annual-report'));
          await wait(800);
        }
      } catch (e) { /* annual report feature may not exist */ console.debug?.('[FakeCursor] Annual report demo skipped:', e); }

      // ─── TAGLINE EXIT ─────────────────────────────
      setTooltipText('GraphMe — 让每一段记忆都有迹可循');
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      setProgress(100);
      await wait(6000);

      setTooltipText('记忆不是孤岛，而是星座');
      await wait(6000);

      setTooltipText('GraphMe — 你的记忆宇宙');
      await wait(6000);

      dispatchCameraMove('rotate');
      await wait(6500);

      setTooltipText('');
      await wait(5500);
      if (!isCancelled) stopDemo();

      } catch (err: any) {
        if (err?.message === '__CANCELLED__') return;
        console.error('FakeCursor demo error:', err);
        setTooltipText(`Demo stopped: ${err?.message || 'unknown error'}`);
        setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        await wait(3000);
        if (!isCancelled) stopDemo();
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
      <div className="fixed top-0 left-0 w-full h-1 z-[120] bg-black/20">
        <motion.div className="h-full bg-gradient-to-r from-[#00f2ff] to-[#ffb800]"
          animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
      </div>
      <Tooltip text={tooltipText} position={position} />
      <motion.div className="fixed z-[110] pointer-events-none"
        animate={{ x: position.x, y: position.y, scale: isClicking ? 0.7 : 1 }}
        transition={{ duration: 0.6, ease: 'anticipate' }}
        style={{ left: 0, top: 0, marginLeft: -12, marginTop: -12 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 2L20 10.6667L12 13L10 21L4 2Z" fill="white" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
        {isClicking && (
          <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-[#00f2ff]"
            initial={{ scale: 0.5, opacity: 1 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 0.4 }} />
        )}
      </motion.div>
    </>
  );
}
