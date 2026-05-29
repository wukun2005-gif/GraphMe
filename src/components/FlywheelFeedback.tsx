import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';

export default function FlywheelFeedback() {
  const { lastAction, theme } = useAppState();
  const isDark = theme === 'dark';
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!lastAction) return;

    const { type, context } = lastAction;
    let msg = '';

    switch (type) {
      case 'confirm':
        msg = `收到。小哥把对"${context.statement?.slice(0, 15)}…"的理解又加深了一层。这条洞察的置信度现在是 ${Math.round((context.confidence || 0) * 100)}%，已经有 ${context.sourceCount || 0} 条记忆为它提供了证据。`;
        break;
      case 'correct':
        msg = `你的纠正触发了蝴蝶效应。小哥正在重新审视相关联的洞察。谢谢你让它更准确。`;
        break;
      case 'reinforce':
        msg = `你刚刚唤醒了一条快要沉睡的记忆——"${context.label}"。小哥重新评估了它在记忆空间中的位置，它不再濒危了。`;
        break;
      case 'addTag':
        msg = `你正在亲手编织自己的记忆星座。小哥会根据你的分类更精准地推荐相似记忆。`;
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
