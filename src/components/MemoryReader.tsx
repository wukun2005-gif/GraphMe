import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RawMemory } from '../types';
import { EMOTION_COLORS, Z_INDEX } from '../types';
import { generateFirstPersonNarrative } from '../utils/narrativeUtils';

// Stars for background effect
const STARS = Array.from({ length: 20 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  color: ['#00f2ff', '#ffb800', '#ff6b6b', '#44ccaa'][Math.floor(Math.random() * 4)],
  duration: Math.random() * 3 + 2,
  delay: Math.random() * 2,
}));

interface MemoryReaderProps {
  memories: RawMemory[];
  theme: 'dark' | 'light';
  onClose: () => void;
  onMemoryChange?: (memory: RawMemory | null) => void;
}

export default function MemoryReader({ memories, theme, onClose, onMemoryChange }: MemoryReaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [firstPerson, setFirstPerson] = useState(false);
  const isDark = theme === 'dark';

  // Sort by time (newest first)
  const sortedMemories = [...memories].sort(
    (a, b) => b.dimensions.temporal.timestamp - a.dimensions.temporal.timestamp
  );

  const currentMemory = sortedMemories[currentIndex];

  // Notify parent of memory change
  useEffect(() => {
    onMemoryChange?.(currentMemory || null);
    return () => onMemoryChange?.(null);
  }, [currentMemory, onMemoryChange]);

  const goToNext = useCallback(() => {
    if (currentIndex < sortedMemories.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, sortedMemories.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, onClose]);

  const d = currentMemory?.dimensions;
  if (!d) return null;
  const emoColor = EMOTION_COLORS[d.emotional.primary] || '#888';
  const date = new Date(d.temporal.timestamp);
  const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;

  const timeOfDayEmoji: Record<string, string> = {
    '清晨': '🌅',
    '上午': '☀️',
    '下午': '🌤',
    '傍晚': '🌇',
    '深夜': '🌙',
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      rotateY: direction > 0 ? 15 : -15,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      rotateY: direction > 0 ? -15 : 15,
    }),
  };

  return (
    <AnimatePresence>
      {sortedMemories.length > 0 && (
        <>
          {/* ── Backdrop + centering container ── */}
          <div
            className="fixed inset-0 z-40 flex items-center justify-center"
            onClick={onClose}
          >
            {/* ── Reader card (centered floating panel with internal starfield) ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="rounded-2xl overflow-hidden backdrop-blur-xl border shadow-2xl flex flex-col"
              style={{
                zIndex: Z_INDEX.MODAL,
                width: '600px',
                maxWidth: '90vw',
                maxHeight: '80vh',
                background: isDark ? 'rgba(8,12,28,0.92)' : 'rgba(255,255,255,0.95)',
                borderColor: isDark ? '#ffffff12' : '#e5e7eb',
                boxShadow: `0 0 60px ${emoColor}15, 0 25px 50px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Internal starfield */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                {/* Nebula glow */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at 30% 40%, ${emoColor}12 0%, transparent 60%),
                                 radial-gradient(ellipse at 70% 60%, #00f2ff08 0%, transparent 50%)`,
                  }}
                />
                {/* Stars */}
                {STARS.map((star, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: `${star.x}%`,
                      top: `${star.y}%`,
                      width: `${star.size}px`,
                      height: `${star.size}px`,
                      background: star.color,
                      boxShadow: `0 0 ${star.size * 2}px ${star.color}50`,
                    }}
                    animate={{ opacity: [0.1, 0.7, 0.1], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
                  />
                ))}
              </div>

              {/* Header */}
              <div className={`relative z-10 flex items-center justify-between px-5 py-3 border-b ${
                isDark ? 'border-[#ffffff08]' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">📖</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    记忆阅读
                  </span>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    第 {currentIndex + 1} / {sortedMemories.length} 页
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFirstPerson(!firstPerson)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                      firstPerson
                        ? isDark ? 'bg-[#ffb800]/15 text-[#ffb800]' : 'bg-amber-100 text-amber-700'
                        : isDark ? 'bg-[#ffffff08] hover:bg-[#ffffff12] text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    {firstPerson ? '第一人称' : '第三人称'}
                  </button>
                  <button
                    onClick={onClose}
                    className={`text-lg leading-none cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-4 overflow-hidden perspective-[1000px]">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentMemory.id}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={`max-w-lg w-full p-6 rounded-xl ${
                      isDark ? 'bg-[#ffffff08] border border-[#ffffff10]' : 'bg-white/80 border border-gray-200'
                    }`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
            {/* Date and time */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{timeOfDayEmoji[d.temporal.timeOfDay] || '📅'}</span>
              <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {dateStr}，一个{d.temporal.season}天的{d.temporal.timeOfDay}
              </span>
            </div>

            {/* Title */}
            <h2 className={`text-2xl font-light mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {currentMemory.label}
            </h2>

            {/* Emotion badge */}
            <div className="flex items-center gap-2 mb-6">
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: `${emoColor}20`,
                  color: emoColor,
                  border: `1px solid ${emoColor}40`,
                }}
              >
                {d.emotional.primary}
              </span>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                强度 {d.emotional.intensity.toFixed(2)}
              </span>
            </div>

            {/* Summary */}
            <p className={`text-base leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {firstPerson ? generateFirstPersonNarrative(currentMemory) : currentMemory.summary}
            </p>

            {/* Metadata */}
            <div className={`flex flex-wrap gap-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <span>📍 {d.spatial.landmark || d.spatial.placeType}</span>
              {d.social.persons.length > 0 && (
                <span>👤 {d.social.persons.join('、')}</span>
              )}
              <span>🎮 {d.activity.detail}</span>
              {d.narrative.storyline && (
                <span>🔗 {d.narrative.storyline}</span>
              )}
            </div>

            {/* Tags */}
            {currentMemory.tags && currentMemory.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {currentMemory.tags.map(tag => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      isDark ? 'bg-[#ffffff08] text-gray-400' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    🏷 {tag}
                  </span>
                ))}
              </div>
            )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer navigation */}
              <div className={`relative z-10 flex items-center justify-between px-5 py-3 border-t ${
                isDark ? 'border-[#ffffff08]' : 'border-gray-200'
              }`}>
                <button
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                    currentIndex === 0
                      ? isDark ? 'text-gray-700 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                      : isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-[#ffffff08]' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  ← 上一页
                </button>

                {/* Page dots */}
                <div className="flex gap-1">
                  {sortedMemories.slice(Math.max(0, currentIndex - 3), currentIndex + 4).map((m, i) => {
                    const idx = Math.max(0, currentIndex - 3) + i;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setDirection(idx > currentIndex ? 1 : -1);
                          setCurrentIndex(idx);
                        }}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                          idx === currentIndex
                            ? isDark ? 'bg-[#00f2ff]' : 'bg-[#0088cc]'
                            : isDark ? 'bg-[#ffffff15] hover:bg-[#ffffff25]' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    );
                  })}
                </div>

                <button
                  onClick={goToNext}
                  disabled={currentIndex === sortedMemories.length - 1}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                    currentIndex === sortedMemories.length - 1
                      ? isDark ? 'text-gray-700 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                      : isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-[#ffffff08]' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  下一页 →
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
