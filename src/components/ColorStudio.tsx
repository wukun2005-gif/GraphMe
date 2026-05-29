import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import type { EmotionType } from '../types';
import { EMOTION_COLORS } from '../types';

interface ColorStudioProps {
  open: boolean;
  onClose: () => void;
}

const COLOR_PRESETS = [
  {
    id: 'default',
    name: '经典暖色',
    colors: EMOTION_COLORS,
  },
  {
    id: 'pastel',
    name: '柔和粉彩',
    colors: {
      '快乐': '#fbbf24',
      '悲伤': '#93c5fd',
      '愤怒': '#fca5a5',
      '惊讶': '#fcd34d',
      '恐惧': '#c4b5fd',
      '厌恶': '#a3e635',
      '中性': '#d1d5db',
      '好奇': '#67e8f9',
      '骄傲': '#d8b4fe',
      '沮丧': '#a5b4fc',
      '感激': '#6ee7b7',
      '思念': '#f0abfc',
    },
  },
  {
    id: 'high-contrast',
    name: '高对比度',
    colors: {
      '快乐': '#ffd700',
      '悲伤': '#0000ff',
      '愤怒': '#ff0000',
      '惊讶': '#ff6600',
      '恐惧': '#800080',
      '厌恶': '#008000',
      '中性': '#808080',
      '好奇': '#00ffff',
      '骄傲': '#ff00ff',
      '沮丧': '#000080',
      '感激': '#00ff00',
      '思念': '#ff69b4',
    },
  },
];

export default function ColorStudio({ open, onClose }: ColorStudioProps) {
  const { theme, emotionColorMap, updateEmotionColor, resetEmotionColors, applyColorPreset } = useAppState();
  const isDark = theme === 'dark';

  const currentColors = emotionColorMap || EMOTION_COLORS;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`fixed right-0 top-0 h-full w-[380px] backdrop-blur-xl border-l p-6 overflow-y-auto z-30 shadow-2xl ${
            isDark ? 'bg-[#0d0d1a] border-[#ffffff08]' : 'bg-white border-gray-200'
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
              🎨 情绪配色工作室
            </h3>
            <button
              onClick={onClose}
              className={`transition-colors text-xl leading-none cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
            >
              ✕
            </button>
          </div>

          <p className={`text-xs mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            自定义每种情绪的颜色，打造属于你的记忆星云
          </p>

          {/* Color pickers */}
          <div className="space-y-3 mb-8">
            {(Object.keys(EMOTION_COLORS) as EmotionType[]).map(emotion => (
              <div
                key={emotion}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isDark ? 'bg-[#ffffff03] border-[#ffffff08]' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <span className="text-sm w-16">{emotion}</span>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={currentColors[emotion]}
                    onChange={e => updateEmotionColor(emotion, e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                  <span className={`text-xs font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {currentColors[emotion]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Presets */}
          <div className="mb-6">
            <h4 className={`text-xs font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              预设配色方案
            </h4>
            <div className="space-y-2">
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => {
                    if (confirm(`应用"${preset.name}"配色方案？`)) {
                      applyColorPreset(preset.colors);
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-[#ffffff03] border-[#ffffff08] hover:border-[#ffffff15]'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {preset.name}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {Object.values(preset.colors).slice(0, 6).map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full"
                        style={{ background: color }}
                      />
                    ))}
                    <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                      +{Object.values(preset.colors).length - 6}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={() => {
              if (confirm('恢复默认配色？')) {
                resetEmotionColors();
              }
            }}
            className={`w-full px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
              isDark ? 'bg-[#ffffff08] hover:bg-[#ffffff12] text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            🔄 恢复默认
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
