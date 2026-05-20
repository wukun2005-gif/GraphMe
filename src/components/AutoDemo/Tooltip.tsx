import { motion, AnimatePresence } from 'framer-motion';

export default function Tooltip({ text, position }: { text: string; position: { x: number; y: number } | null }) {
  if (!text || !position) return null;

  // Keep tooltip on screen
  const tooltipWidth = Math.min(text.length * 14, 480);
  const left = Math.max(10, Math.min(position.x - tooltipWidth / 2, window.innerWidth - tooltipWidth - 10));
  const top = position.y > window.innerHeight - 80
    ? position.y - 48  // above cursor if near bottom
    : position.y + 30; // below cursor normally

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text}
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="fixed z-[105] px-4 py-2.5 text-sm font-medium rounded-xl shadow-[0_4px_24px_rgba(255,184,0,0.25)] pointer-events-none max-w-[480px] text-center leading-relaxed"
        style={{
          left,
          top,
          background: 'linear-gradient(135deg, rgba(255,184,0,0.95), rgba(255,140,0,0.95))',
          color: '#0a101f',
          backdropFilter: 'blur(8px)',
        }}
      >
        {text}
      </motion.div>
    </AnimatePresence>
  );
}
