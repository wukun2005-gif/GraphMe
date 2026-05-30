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

// Pre-compute star positions deterministically
const STARS = Array.from({ length: 80 }, (_, i) => ({
  x: ((i * 37 + 13) % 100),
  y: ((i * 53 + 7) % 100),
  size: 1.5 + ((i * 17) % 20) / 10,
  color: ['#00f2ff', '#ffb800', '#ff6b9d', '#a78bfa', '#ffffff'][i % 5],
  duration: 2 + ((i * 23) % 30) / 10,
  delay: ((i * 11) % 20) / 10,
}));

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

  useEffect(() => {
    if (!open || !isPlaying || isFinished) return;
    const timer = setTimeout(() => setCurrentIndex(prev => prev + 1), 3000);
    return () => clearTimeout(timer);
  }, [open, isPlaying, isFinished, currentIndex]);

  useEffect(() => {
    if (open) { setCurrentIndex(0); setIsPlaying(true); }
  }, [open, source]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') { e.preventDefault(); setIsPlaying(prev => !prev); }
      else if (e.key === 'ArrowRight') setCurrentIndex(prev => Math.min(prev + 1, filteredMemories.length));
      else if (e.key === 'Escape') onClose();
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
        <>
          {/* ── Backdrop + centering container ── */}
          <div
            className="fixed inset-0 z-40 flex items-center justify-center"
            onClick={onClose}
          >
            {/* ── Cinema card (centered floating panel with internal starfield) ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="rounded-2xl overflow-hidden backdrop-blur-xl border shadow-2xl flex flex-col"
              style={{
                zIndex: 50,
                width: '560px',
                maxWidth: '90vw',
                maxHeight: '80vh',
                background: isDark ? 'rgba(8,12,28,0.92)' : 'rgba(255,255,255,0.95)',
                borderColor: isDark ? '#ffffff12' : '#e5e7eb',
                boxShadow: `0 0 60px ${emotionColor}15, 0 25px 50px rgba(0,0,0,0.4)`,
              }}
            >
            {/* Internal starfield */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
              {/* Nebula glow */}
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse at 30% 40%, ${emotionColor}12 0%, transparent 60%),
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
                <h2 className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  🎬 记忆微电影
                </h2>
                <select
                  value={source}
                  onChange={e => setSource(e.target.value as 'week' | 'month' | 'all')}
                  className={`text-[10px] px-1.5 py-0.5 rounded border ${
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
                  id="cinema-play"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-2.5 py-1 text-[10px] rounded cursor-pointer ${
                    isDark ? 'bg-[#ffffff08] text-gray-400' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isPlaying ? '⏸ 暂停' : '▶ 继续'}
                </button>
                <button
                  id="cinema-close"
                  onClick={onClose}
                  className={`text-base cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex items-center justify-center overflow-hidden px-6 py-8">
              {!isFinished && currentMemory ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-md"
                  >
                    {currentMemory.dimensions.sensory.images.length > 0 ? (
                      <img
                        src={currentMemory.dimensions.sensory.images[0]}
                        alt={currentMemory.label}
                        className="w-24 h-24 mx-auto rounded-xl object-cover mb-4"
                      />
                    ) : (
                      <div className="text-5xl mb-4">
                        {currentMemory.dimensions.emotional.primary === '快乐' ? '😊' :
                         currentMemory.dimensions.emotional.primary === '悲伤' ? '😢' :
                         currentMemory.dimensions.emotional.primary === '好奇' ? '🤔' :
                         currentMemory.dimensions.emotional.primary === '骄傲' ? '😤' :
                         currentMemory.dimensions.emotional.primary === '感激' ? '🙏' : '💭'}
                      </div>
                    )}

                    <p className={`text-[10px] mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(currentMemory.dimensions.temporal.timestamp).toLocaleDateString('zh-CN', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>

                    <p className={`text-base leading-relaxed mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {generateFirstPersonNarrative(currentMemory)}
                    </p>

                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                      style={{ backgroundColor: emotionColor + '20', color: emotionColor }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: emotionColor }} />
                      {currentMemory.dimensions.emotional.primary}
                    </span>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <p className={`text-xl mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    这就是你最近的 {filteredMemories.length} 个瞬间
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    每一个都值得被记住
                  </p>
                </motion.div>
              )}
            </div>

            {/* Progress bar */}
            <div className="relative z-10 px-5 pb-3">
              <div className={`h-0.5 rounded-full ${isDark ? 'bg-[#ffffff08]' : 'bg-gray-200'}`}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: emotionColor }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className={`text-[9px] mt-1 text-center ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                {currentIndex + 1} / {filteredMemories.length} · 空格暂停 · →跳过
              </p>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
