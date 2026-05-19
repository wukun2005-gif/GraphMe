import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import type { DimensionView } from '../types';

const DEMO_STEPS: { message: string; view?: DimensionView }[] = [
  { message: '欢迎来到小哥的记忆星云 ✨\n这里是你的内在图景——所有记忆与洞察的可视化呈现。', view: '全局视图' },
  { message: '首先，让我们从家庭维度审视小哥的记忆。\n切换到"家庭视图"，你会看到记忆在家庭空间中的分布。', view: '家庭视图' },
  { message: '接下来是"学习视图"。\n这些粒子代表了小哥在学习领域的每一点进步和探索。', view: '学习视图' },
  { message: '"情绪视图"展现了小哥的情绪色谱。\n暖色=快乐，冷色=平静，紫色=成就，蓝色=低落。', view: '情绪视图' },
  { message: '回到"全局视图"，你可以自由旋转和缩放。\n每个粒子都是一个记忆原子，金色光环是洞察记忆。', view: '全局视图' },
  { message: '右下角是 Chat Assistant。\n点击💬按钮，试试问"小哥今天情绪怎么样？"\n对话窗口就会自动展开。' },
  { message: 'Demo 自动巡航即将结束 🎉\n你可以继续自由探索记忆星云，或者点击右下角的💬向小哥提问。' },
];

const INTERVAL_MS = 14000;

export default function DemoController() {
  const { demoMode, demoStep, setDemoMode, setDemoStep, setCurrentView, toggleChat } = useAppState();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(demoStep);

  useEffect(() => {
    stepRef.current = demoStep;
  }, [demoStep]);

  const advanceStep = useCallback(() => {
    const next = stepRef.current + 1;

    const prevStep = DEMO_STEPS[stepRef.current - 1];
    if (prevStep?.view) setCurrentView(prevStep.view);
    if (stepRef.current === 6) toggleChat();

    if (next > DEMO_STEPS.length) {
      setDemoMode(false);
      return;
    }
    setDemoStep(next);
  }, [setCurrentView, setDemoMode, setDemoStep, toggleChat]);

  const runDemo = useCallback(() => {
    if (timerRef.current) return;
    advanceStep();
    timerRef.current = setInterval(advanceStep, INTERVAL_MS);
  }, [advanceStep]);

  const stopDemo = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setDemoMode(false);
  }, [setDemoMode]);

  useEffect(() => {
    if (demoMode) {
      runDemo();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [demoMode, runDemo]);

  if (!demoMode) {
    return (
      <button
        onClick={() => { setDemoStep(1); setDemoMode(true); }}
        className="absolute top-6 left-1/2 -translate-x-1/2 px-5 py-2 bg-[#ffb800]/10 border border-[#ffb800]/20 rounded-full text-sm text-[#ffb800] hover:bg-[#ffb800]/20 transition-all z-20 backdrop-blur-sm"
      >
        🎬 一键演示
      </button>
    );
  }

  const currentStep = DEMO_STEPS[demoStep - 1];

  return (
    <AnimatePresence>
      <motion.div
        key="demo-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-30 pointer-events-none"
      >
        {currentStep && (
          <motion.div
            key={`step-${demoStep}`}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[#0d0d1a]/95 backdrop-blur-xl border border-[#ffb800]/20 rounded-2xl px-8 py-5 max-w-md pointer-events-auto shadow-[0_0_40px_rgba(255,184,0,0.08)]"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div className="flex-1">
                <p className="text-[#ffb800] font-medium text-sm mb-2">
                  {demoStep}/{DEMO_STEPS.length}
                </p>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {currentStep.message}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1 bg-[#ffffff08] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ffb800]/50 rounded-full transition-all duration-1000"
                      style={{ width: `${(demoStep / DEMO_STEPS.length) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={stopDemo}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors pointer-events-auto"
                  >
                    跳过
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}