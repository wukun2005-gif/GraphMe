import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { useI18n } from '../i18n';
import { memoryLabelT, insightStatementT } from '../i18n/memoryData';

export default function FlywheelFeedback() {
  const { lastAction, theme } = useAppState();
  const { t, language } = useI18n();
  const isDark = theme === 'dark';
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!lastAction) return;

    const { type, context } = lastAction;
    let msg = '';

    switch (type) {
      case 'confirm':
        msg = t('flywheel.confirmFeedback', {
          statement: insightStatementT(language, context.id, context.statement || '').slice(0, 15),
          confidence: Math.round((context.confidence || 0) * 100),
          sourceCount: context.sourceCount || 0,
        });
        break;
      case 'correct':
        msg = t('flywheel.correctFeedback');
        break;
      case 'reinforce':
        msg = t('flywheel.reinforceFeedback', { label: memoryLabelT(language, context.id, context.label || '') });
        break;
      case 'addTag':
        msg = t('flywheel.addTagFeedback');
        break;
      default:
        return;
    }

    setMessage(msg);
    setVisible(true);

    const timer = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(timer);
  }, [lastAction]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-md px-5 py-3 rounded-xl border shadow-lg backdrop-blur-sm ${
            isDark ? 'bg-[#0d1525]/90 border-[#ffffff10] text-gray-300' : 'bg-white/90 border-gray-200 text-gray-700'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">🔄</span>
            <p className="text-xs leading-relaxed">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
