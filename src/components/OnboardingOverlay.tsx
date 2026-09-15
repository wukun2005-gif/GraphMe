import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Z_INDEX } from '../types';
import { useI18n } from '../i18n';

const STORAGE_KEY = 'graphme-onboarding-done';

export default function OnboardingOverlay() {
  const { t } = useI18n();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  const STEPS = useMemo(() => [
    {
      target: null,
      title: t('onboarding.welcome.title'),
      description: t('onboarding.welcome.desc'),
      position: 'center' as const,
    },
    {
      target: '.absolute.left-0.top-0',
      title: t('onboarding.nav.title'),
      description: t('onboarding.nav.desc'),
      position: 'right' as const,
    },
    {
      target: '#btn-auto-demo',
      title: t('onboarding.demo.title'),
      description: t('onboarding.demo.desc'),
      position: 'bottom' as const,
    },
    {
      target: null,
      title: t('onboarding.explore.title'),
      description: t('onboarding.explore.desc'),
      position: 'center' as const,
    },
  ], [t]);

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
    <div className="fixed inset-0" style={{ zIndex: Z_INDEX.MODAL }}>
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
              {t('onboarding.step', { current: step + 1, total: STEPS.length })}
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
                {t('onboarding.skip')}
              </button>
              <button
                onClick={handleNext}
                className="text-xs px-4 py-1.5 rounded-lg bg-[#00f2ff]/15 text-[#00f2ff] hover:bg-[#00f2ff]/25 cursor-pointer transition-colors"
              >
                {step < STEPS.length - 1 ? t('onboarding.next') : t('onboarding.startExploring')}
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
