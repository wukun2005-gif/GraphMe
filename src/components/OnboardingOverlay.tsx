import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'graphme-onboarding-done';

const STEPS = [
  {
    target: null,
    title: '欢迎来到 GraphMe',
    description: '这是你的记忆星云——每颗粒子是一条记忆。让我们一起探索。',
    position: 'center' as const,
  },
  {
    target: '.absolute.left-0.top-0',
    title: '记忆分类',
    description: '左侧是记忆分类面板，帮你按家庭、学习、情绪快速定位记忆。',
    position: 'right' as const,
  },
  {
    target: '#btn-auto-demo',
    title: '一键演示',
    description: '点击这里可以观看自动演示，了解 GraphMe 的核心功能。',
    position: 'bottom' as const,
  },
  {
    target: null,
    title: '开始探索',
    description: '按 1/2/3/4 切换视图，Ctrl+F 搜索记忆，🎲 发现隐藏连接。祝你探索愉快！',
    position: 'center' as const,
  },
];

export default function OnboardingOverlay() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setActive(true);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      localStorage.setItem(STORAGE_KEY, '1');
      setActive(false);
    }
  }, [step]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, '1');
    setActive(false);
  }, []);

  if (!active) return null;

  const currentStep = STEPS[step];

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dark overlay with cutout */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className={`w-80 p-6 rounded-2xl border shadow-2xl ${
            'bg-[#0d0d1a] border-[#ffffff15]'
          }`}>
            <div className={`text-xs mb-3 ${'text-[#00f2ff]/50'}`}>
              步骤 {step + 1} / {STEPS.length}
            </div>
            <h3 className="text-base font-medium text-white mb-2">
              {currentStep.title}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              {currentStep.description}
            </p>
            <div className="flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-xs text-gray-600 hover:text-gray-400 cursor-pointer transition-colors"
              >
                跳过
              </button>
              <button
                onClick={handleNext}
                className="text-xs px-4 py-1.5 rounded-lg bg-[#00f2ff]/15 text-[#00f2ff] hover:bg-[#00f2ff]/25 cursor-pointer transition-colors"
              >
                {step < STEPS.length - 1 ? '下一步' : '开始探索'}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? 'bg-[#00f2ff]' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
