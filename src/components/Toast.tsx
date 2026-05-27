import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';

export default function ToastContainer() {
  const { toasts, removeToast, theme } = useAppState();
  const isDark = theme === 'dark';

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} isDark={isDark} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, isDark, onRemove }: {
  toast: { id: string; message: string; type: 'success' | 'error' | 'info' };
  isDark: boolean;
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 2500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const bgColor = toast.type === 'success'
    ? isDark ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
    : toast.type === 'error'
    ? isDark ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
    : isDark ? 'bg-[#00f2ff]/15 border-[#00f2ff]/20 text-[#00f2ff]' : 'bg-blue-50 border-blue-200 text-blue-700';

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`px-4 py-2.5 rounded-lg border text-xs font-medium shadow-lg backdrop-blur-sm pointer-events-auto ${bgColor}`}
    >
      {toast.message}
    </motion.div>
  );
}
