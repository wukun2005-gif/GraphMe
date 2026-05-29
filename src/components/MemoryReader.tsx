import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RawMemory } from '../types';
import { EMOTION_COLORS } from '../types';
import { generateFirstPersonNarrative } from '../utils/narrativeUtils';

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

  if (!currentMemory) {
    return (
      <div className={`flex items-center justify-center h-full ${isDark ? 'bg-[#0a0a0f] text-gray-500' : 'bg-white text-gray-400'}`}>
        <p>没有可阅读的记忆</p>
      </div>
    );
  }

  const d = currentMemory.dimensions;
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
    <div className={`fixed inset-0 z-50 flex flex-col ${isDark ? 'bg-[#0a0a0f]' : 'bg-white'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b ${
        isDark ? 'border-[#ffffff08]' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-lg">📖</span>
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            记忆阅读模式
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            第 {currentIndex + 1} 页 / 共 {sortedMemories.length} 页
          </span>
          <button
            onClick={() => setFirstPerson(!firstPerson)}
            className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${
              firstPerson
                ? isDark ? 'bg-[#ffb800]/15 text-[#ffb800]' : 'bg-amber-100 text-amber-700'
                : isDark ? 'bg-[#ffffff08] hover:bg-[#ffffff12] text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            💬 {firstPerson ? '第三人称' : '第一人称'}
          </button>
          <button
            onClick={onClose}
            className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${
              isDark ? 'bg-[#ffffff08] hover:bg-[#ffffff12] text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            ✕ 关闭
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-8 overflow-hidden perspective-[1000px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentMemory.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`max-w-2xl w-full p-8 rounded-2xl ${
              isDark ? 'bg-[#ffffff03] border border-[#ffffff08]' : 'bg-gray-50 border border-gray-200'
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
      <div className={`flex items-center justify-between px-6 py-4 border-t ${
        isDark ? 'border-[#ffffff08]' : 'border-gray-200'
      }`}>
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className={`px-4 py-2 text-sm rounded transition-colors cursor-pointer ${
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
          className={`px-4 py-2 text-sm rounded transition-colors cursor-pointer ${
            currentIndex === sortedMemories.length - 1
              ? isDark ? 'text-gray-700 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
              : isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-[#ffffff08]' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          下一页 →
        </button>
      </div>
    </div>
  );
}
