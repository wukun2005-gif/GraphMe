import { useState, useEffect, useMemo } from 'react';
import { useAppState } from '../store/AppContext';
import { getDailyMemory } from '../utils/valueUtils';
import { EMOTION_COLORS } from '../types';

export default function DailyMemoryCard() {
  const { rawMemories, theme, selectMemory } = useAppState();
  const isDark = theme === 'dark';
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const daily = useMemo(() => getDailyMemory(rawMemories), [rawMemories]);

  useEffect(() => {
    if (!daily || dismissed) return;
    // Check if already dismissed today
    const today = new Date();
    const key = `graphme-daily-dismissed-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    if (localStorage.getItem(key)) {
      setDismissed(true);
      return;
    }
    const showTimer = setTimeout(() => setVisible(true), 800);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setDismissed(true), 600);
    }, 8000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [daily, dismissed]);

  if (!daily || dismissed) return null;

  const { memory, reason, daysAgo } = daily;
  const emotionColor = EMOTION_COLORS[memory.dimensions.emotional.primary] || '#888';

  const handleClick = () => {
    selectMemory(memory);
    setVisible(false);
    setTimeout(() => setDismissed(true), 600);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    const today = new Date();
    const key = `graphme-daily-dismissed-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    localStorage.setItem(key, '1');
    setTimeout(() => setDismissed(true), 600);
  };

  const timeLabel = daysAgo < 1
    ? '今天'
    : daysAgo < 365
      ? `${daysAgo} 天前`
      : `${Math.floor(daysAgo / 365)} 年前`;

  return (
    <div
      onClick={handleClick}
      className={`absolute top-20 left-1/2 -translate-x-1/2 z-30 cursor-pointer transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      <div className={`relative px-5 py-3.5 rounded-xl backdrop-blur-md shadow-lg border max-w-sm ${
        isDark
          ? 'bg-[#0d1525] border-[#ffffff12]'
          : 'bg-white border-gray-200'
      }`}>
        <button
          onClick={handleDismiss}
          className={`absolute top-1.5 right-2 text-xs cursor-pointer transition-colors ${
            isDark ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          ✕
        </button>

        <div className="flex items-start gap-3">
          {/* Emoji / photo */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ background: `${emotionColor}20` }}>
            {memory.dimensions.sensory.images.length > 0 ? (
              <img
                src={memory.dimensions.sensory.images[0]}
                alt=""
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <span>{reason === 'anniversary' ? '📅' : '💡'}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                isDark ? 'bg-[#00f2ff]/15 text-[#00f2ff]' : 'bg-[#0088cc]/15 text-[#0088cc]'
              }`}>
                {reason === 'anniversary' ? '那年今日' : '记忆提醒'}
              </span>
              <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                {timeLabel}
              </span>
            </div>
            <p className={`text-sm font-medium leading-snug truncate ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              {memory.label}
            </p>
            <p className={`text-xs mt-0.5 line-clamp-2 leading-relaxed ${
              isDark ? 'text-gray-500' : 'text-gray-500'
            }`}>
              {memory.summary}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: emotionColor }}
              />
              <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {memory.dimensions.emotional.primary}
              </span>
              {memory.dimensions.social.persons.length > 0 && (
                <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  · {memory.dimensions.social.persons.join('、')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
