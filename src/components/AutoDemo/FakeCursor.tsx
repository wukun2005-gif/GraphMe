import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!isPlaying) return;

    let timeoutIds: ReturnType<typeof setTimeout>[] = [];
    let isCancelled = false;

    const wait = (ms: number) => new Promise<void>(resolve => {
      const id = setTimeout(resolve, ms);
      timeoutIds.push(id);
    });

    const moveAndClick = async (elementId: string, text: string, waitAfter: number = 2000, triggerEvents: boolean = true) => {
      if (isCancelled) return;
      const el = document.getElementById(elementId);
      if (el) {
        setTooltipText(text);
        const rect = el.getBoundingClientRect();
        // Move to center of element
        setPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        
        await wait(800); // wait for cursor to arrive
        if (isCancelled) return;

        if (triggerEvents) {
          setIsClicking(true);
          await wait(200);
          if (isCancelled) return;
          el.click();
          setIsClicking(false);
        }
        await wait(waitAfter);
      } else {
        console.warn('FakeCursor: Element not found', elementId);
      }
    };

    const moveToCenter = async (text: string, waitAfter: number = 2000) => {
      if (isCancelled) return;
      setTooltipText(text);
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      await wait(800);
      if (isCancelled) return;
      await wait(waitAfter);
    };

    const dispatchCameraMove = () => {
      window.dispatchEvent(new CustomEvent('demo-camera-move', { detail: { action: 'rotate' } }));
    };

    const runSequence = async () => {
      if (isCancelled) return;

      // START DEMO
      setTooltipText('开始一键演示：90秒自动探索');
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      await wait(2000);
      if (isCancelled) return;

      // P1 星云探索 (15s)
      dispatchCameraMove();
      await moveToCenter('全局视图下的三维星云：可以缩放、拖拽、转动，直观展示语义距离', 6000);
      if (isCancelled) return;
      dispatchCameraMove();
      await moveToCenter('距离越近，语义越相似，自动形成记忆聚类簇', 6000);
      if (isCancelled) return;

      // P2 原子阅读 (20s)
      // Open memory manager first to see raw memory if 3D clicking is hard to simulate
      await moveAndClick('nav-memory-mgr', '打开记忆管理面板', 1500);
      if (isCancelled) return;
      await moveAndClick('mem-item-edit-0', '点击编辑任意记忆原子', 2000);
      if (isCancelled) return;
      await moveToCenter('每一颗粒子都代表一个包含多维信息的原始记忆原子', 4000);
      if (isCancelled) return;
      await moveAndClick('mem-item-cancel-0', '阅读完毕', 1000);
      if (isCancelled) return;
      await moveAndClick('nav-memory-mgr', '收起记忆管理面板', 1000);
      if (isCancelled) return;

      // P4 洞察 (20s)
      await moveAndClick('nav-legend', '查看图例说明', 1500);
      if (isCancelled) return;
      await moveAndClick('btn-toggle-raw', '隐藏原始记忆，聚焦洞察', 3000);
      if (isCancelled) return;
      await moveToCenter('金色圆环代表洞察记忆：AI从孤立的原子中推理出的高阶认知', 5000);
      if (isCancelled) return;
      await moveAndClick('btn-toggle-raw', '恢复全量视图', 2000);
      if (isCancelled) return;
      await moveAndClick('nav-legend', '收起图例说明', 1000);
      if (isCancelled) return;

      // P5 分类导航 (15s)
      await moveAndClick('nav-cat-学习与成长', '通过导航快速聚焦生活侧面', 2000);
      if (isCancelled) return;
      await moveAndClick('nav-sub-编程学习', '不同视图下，星云内容自动变化，重新聚类', 4000);
      if (isCancelled) return;
      await moveAndClick('nav-cat-学习与成长', '返回全局视图', 2000);
      if (isCancelled) return;

      // P6 价值看板
      await moveAndClick('val-dash-trigger', '点击展开价值看板，查看高价值记忆与遗忘预警', 4000);
      if (isCancelled) return;

      // P7 小哥助手 (10s)
      await moveAndClick('chat-trigger', '上下文感知的小哥对话助手，带你穿梭在记忆网络中', 3000);
      if (isCancelled) return;
      await moveAndClick('chat-link-0', '点击解答中的记忆链接，溯源上下文', 3000);
      if (isCancelled) return;

      setTooltipText('演示结束');
      await wait(2000);

      if (!isCancelled) {
        onStop();
      }
    };

    runSequence();

    return () => {
      isCancelled = true;
      timeoutIds.forEach(clearTimeout);
    };
  }, [isPlaying, onStop]);

  if (!isPlaying) return null;

  return (
    <>
      <Tooltip text={tooltipText} position={position} />
      <motion.div
        className="fixed z-[110] pointer-events-none"
        animate={{ 
          x: position.x, 
          y: position.y,
          scale: isClicking ? 0.8 : 1
        }}
        transition={{ 
          duration: 0.6, 
          ease: "anticipate" 
        }}
        style={{ left: 0, top: 0, marginLeft: -12, marginTop: -12 }} // center the cursor visually
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 2L20 10.6667L12 13L10 21L4 2Z" fill="white" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      </motion.div>
    </>
  );
}
