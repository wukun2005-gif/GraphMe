import { useState, useEffect, useCallback } from 'react';
import { getSoundscapeEngine, destroySoundscapeEngine } from '../utils/audioUtils';
import type { EmotionDistribution } from '../utils/audioUtils';

interface SoundscapeToggleProps {
  theme: 'dark' | 'light';
  emotionDistribution: EmotionDistribution;
}

export default function SoundscapeToggle({ theme, emotionDistribution }: SoundscapeToggleProps) {
  const [isOn, setIsOn] = useState(false);
  const isDark = theme === 'dark';

  const handleToggle = useCallback(async () => {
    const engine = getSoundscapeEngine();
    if (isOn) {
      engine.stop();
      setIsOn(false);
    } else {
      await engine.start();
      setIsOn(true);
    }
  }, [isOn]);

  // Update engine when distribution changes
  useEffect(() => {
    if (!isOn) return;
    const engine = getSoundscapeEngine();
    engine.updateDistribution(emotionDistribution);
  }, [isOn, emotionDistribution]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isOn) {
        destroySoundscapeEngine();
      }
    };
  }, [isOn]);

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
        isOn
          ? isDark
            ? 'bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/30'
            : 'bg-[#0088cc]/20 text-[#0088cc] border border-[#0088cc]/30'
          : isDark
            ? 'bg-[#ffffff08] text-gray-500 hover:text-gray-400 border border-transparent'
            : 'bg-gray-100 text-gray-500 hover:text-gray-600 border border-transparent'
      }`}
      title={isOn ? '关闭声音景观' : '开启声音景观'}
    >
      <span className={`text-sm ${isOn ? 'animate-pulse' : ''}`}>
        {isOn ? '🔊' : '🔇'}
      </span>
      <span>声音景观</span>
    </button>
  );
}
