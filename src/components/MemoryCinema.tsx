import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RawMemory } from '../types';
import { EMOTION_COLORS } from '../types';
import { generateFirstPersonNarrative } from '../utils/narrativeUtils';

interface Props {
  open: boolean;
  onClose: () => void;
  memories: RawMemory[];
  theme: 'dark' | 'light';
}

export default function MemoryCinema({ open, onClose, memories, theme }: Props) {
  const isDark = theme === 'dark';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [source, setSource] = useState<'week' | 'month' | 'all'>('all');

  const filteredMemories = useMemo(() => {
    const now = Date.now();
    const sorted = [...memories].sort((a, b) => b.dimensions.temporal.timestamp - a.dimensions.temporal.timestamp);
    if (source === 'week') {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      return sorted.filter(m => m.dimensions.temporal.timestamp >= weekAgo).slice(0, 10);
    }
    if (source === 'month') {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      return sorted.filter(m => m.dimensions.temporal.timestamp >= monthAgo).slice(0, 10);
    }
    return sorted.slice(0, 10);
  }, [memories, source]);

  const currentMemory = filteredMemories[currentIndex];
  const progress = filteredMemories.length > 0 ? (currentIndex + 1) / filteredMemories.length : 0;
  const isFinished = currentIndex >= filteredMemories.length;

  // Auto-play
  useEffect(() => {
    if (!open || !isPlaying || isFinished) return;
    const timer = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [open, isPlaying, isFinished, currentIndex]);

  // Reset when opening
  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  }, [open, source]);

  // Keyboard controls
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => Math.min(prev + 1, filteredMemories.length));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredMemories.length, onClose]);

  const emotionColor = currentMemory
    ? EMOTION_COLORS[currentMemory.dimensions.emotional.primary as keyof typeof EMOTION_COLORS] || '#888'
    : isDark ? '#0a101f' : '#f5f6f8';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: emotionColor + '15' }}
        >
          {/* Background gradient */}
          <motion.div
            className="absolute inset-0"
            animate={{ backgroundColor: emotionColor + '10' }}
            transition={{ duration: 1.5 }}
          />

          {/* Header */}
          <div className={`relative z-10 flex items-center justify-between px-6 py-3 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium">🎬 记忆微电影</h2>
              <select
                value={source}
                onChange={e => setSource(e.target.value as 'week' | 'month' | 'all')}
                className={`text-xs px-2 py-1 rounded border ${
                  isDark ? 'bg-[#0d1525] border-[#ffffff08] text-gray-400' : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                <option value="week">最近一周</option>
                <option value="month">最近一月</option>
                <option value="all">全部</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-3 py-1.5 text-xs rounded cursor-pointer ${
                  isDark ? 'bg-[#ffffff08] text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isPlaying ? '⏸ 暂停' : '▶ 继续'}
              </button>
              <button
                onClick={onClose}
                className={`text-lg cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden">
            {!isFinished && currentMemory ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                  className="text-center max-w-lg px-8"
                >
                  {/* Emoji or image */}
                  {currentMemory.dimensions.sensory.images.length > 0 ? (
                    <img
                      src={currentMemory.dimensions.sensory.images[0]}
                      alt={currentMemory.label}
                      className="w-32 h-32 mx-auto rounded-xl object-cover mb-6"
                    />
                  ) : (
                    <div className="text-6xl mb-6">
                      {currentMemory.dimensions.emotional.primary === '快乐' ? '😊' :
                       currentMemory.dimensions.emotional.primary === '悲伤' ? '😢' :
                       currentMemory.dimensions.emotional.primary === '好奇' ? '🤔' :
                       currentMemory.dimensions.emotional.primary === '骄傲' ? '😤' :
                       currentMemory.dimensions.emotional.primary === '感激' ? '🙏' :
                       '💭'}
                    </div>
                  )}

                  {/* Date */}
                  <p className={`text-xs mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {new Date(currentMemory.dimensions.temporal.timestamp).toLocaleDateString('zh-CN', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>

                  {/* Narrative */}
                  <p className={`text-lg leading-relaxed mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {generateFirstPersonNarrative(currentMemory)}
                  </p>

                  {/* Emotion tag */}
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                    style={{
                      backgroundColor: emotionColor + '20',
                      color: emotionColor,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: emotionColor }} />
                    {currentMemory.dimensions.emotional.primary}
                  </span>
                </motion.div>
              </AnimatePresence>
            ) : (
              /* Finished */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className={`text-2xl mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  这就是你最近的 {filteredMemories.length} 个瞬间
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  每一个都值得被记住
                </p>
              </motion.div>
            )}
          </div>

          {/* Progress bar */}
          <div className={`relative z-10 px-6 py-3`}>
            <div className={`h-1 rounded-full ${isDark ? 'bg-[#ffffff08]' : 'bg-gray-200'}`}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: emotionColor }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className={`text-[10px] mt-1 text-center ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
              {currentIndex + 1} / {filteredMemories.length} · 按空格暂停/继续 · 按→跳过
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
