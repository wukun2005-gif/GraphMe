import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { weaveStoryline, getStorylineNames } from '../utils/storyUtils';
import { EMOTION_COLORS } from '../types';

export default function StoryWeaver({ onClose }: { onClose: () => void }) {
  const { rawMemories, theme, selectMemory } = useAppState();
  const isDark = theme === 'dark';
  const storylines = useMemo(() => getStorylineNames(rawMemories), [rawMemories]);
  const [selected, setSelected] = useState<string>(storylines[0] || '');
  const [playing, setPlaying] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const woven = useMemo(() => selected ? weaveStoryline(rawMemories, selected) : null, [rawMemories, selected]);

  useEffect(() => {
    if (!playing || !woven) return;
    playRef.current = setInterval(() => {
      setPlayIndex(prev => {
        if (prev >= woven.nodes.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [playing, woven]);

  const handlePlay = () => {
    setPlayIndex(0);
    setPlaying(true);
  };

  return (
    <div className={`flex-1 overflow-y-auto px-5 py-4 space-y-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
      {/* Storyline selector */}
      {storylines.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {storylines.map(name => (
            <button
              key={name}
              onClick={() => { setSelected(name); setPlaying(false); setPlayIndex(0); }}
              className={`text-[10px] px-2 py-1 rounded-full cursor-pointer transition-colors ${
                selected === name
                  ? isDark ? 'bg-[#00f2ff]/20 text-[#00f2ff]' : 'bg-[#0088cc]/20 text-[#0088cc]'
                  : isDark ? 'bg-[#ffffff08] text-gray-500 hover:text-gray-300' : 'bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {!woven ? (
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          暂无线索记忆来编织故事
        </p>
      ) : (
        <>
          {/* Narrative paragraph */}
          <div className={`p-3 rounded-lg text-xs leading-relaxed ${
            isDark ? 'bg-[#00f2ff]/5 text-gray-300 border border-[#00f2ff]/10' : 'bg-blue-50 text-gray-600 border border-blue-100'
          }`}>
            {woven.narrative}
          </div>

          {/* Play button */}
          <div className="flex justify-center">
            <button
              onClick={playing ? () => setPlaying(false) : handlePlay}
              className={`text-xs px-4 py-1.5 rounded-full cursor-pointer transition-all ${
                playing
                  ? isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                  : isDark ? 'bg-[#00f2ff]/15 text-[#00f2ff] hover:bg-[#00f2ff]/25' : 'bg-[#0088cc]/15 text-[#0088cc] hover:bg-[#0088cc]/25'
              }`}
            >
              {playing ? '⏸ 暂停' : '▶ 播放'}
            </button>
          </div>

          {/* Timeline */}
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className={`absolute left-2.5 top-0 bottom-0 w-0.5 ${isDark ? 'bg-[#ffffff10]' : 'bg-gray-200'}`} />

            {woven.nodes.map((node, i) => {
              const isActive = !playing || i <= playIndex;
              const isCurrent = playing && i === playIndex;

              return (
                <div key={node.memory.id} className="relative mb-4 last:mb-0">
                  {/* Connection line segment */}
                  {i > 0 && (
                    <div
                      className="absolute left-[-14px] top-[-16px] w-0.5 h-4"
                      style={{
                        background: `linear-gradient(${woven.connections[i - 1]?.from.emotionColor}, ${node.emotionColor})`,
                        opacity: isActive ? 0.6 : 0.15,
                      }}
                    />
                  )}

                  {/* Node dot */}
                  <div
                    className={`absolute left-[-18px] top-1.5 w-3 h-3 rounded-full border-2 transition-all ${
                      isCurrent ? 'scale-125 ring-2 ring-offset-1' : ''
                    }`}
                    style={{
                      backgroundColor: node.emotionColor,
                      borderColor: isDark ? '#0d0d1a' : '#fff',
                      opacity: isActive ? 1 : 0.3,
                      // @ts-expect-error Tailwind ring color utility
                      '--tw-ring-color': node.emotionColor,
                    }}
                  />

                  {/* Card */}
                  <motion.div
                    initial={playing ? { opacity: 0, x: -10 } : false}
                    animate={{ opacity: isActive ? 1 : 0.3, x: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => { selectMemory(node.memory); onClose(); }}
                    className={`p-3 rounded-lg cursor-pointer transition-all border ${
                      isCurrent
                        ? isDark ? 'bg-[#ffffff08] border-[#00f2ff]/30 shadow-lg' : 'bg-white border-[#0088cc]/30 shadow-lg'
                        : isDark ? 'bg-[#ffffff03] border-[#ffffff06] hover:bg-[#ffffff06]' : 'bg-gray-50/50 border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Photo or emotion dot */}
                      {node.memory.dimensions.sensory.images.length > 0 ? (
                        <img src={node.memory.dimensions.sensory.images[0]} alt=""
                          className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded flex items-center justify-center text-base flex-shrink-0"
                          style={{ background: `${node.emotionColor}15` }}>
                          {node.memory.dimensions.emotional.primary === '快乐' ? '😊' :
                           node.memory.dimensions.emotional.primary === '骄傲' ? '🏆' :
                           node.memory.dimensions.emotional.primary === '好奇' ? '🔍' :
                           node.memory.dimensions.emotional.primary === '悲伤' ? '😢' :
                           node.memory.dimensions.emotional.primary === '感激' ? '🙏' : '💭'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            {node.memory.label}
                          </span>
                          {node.memory.dimensions.narrative.isMilestone && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-[#ffb800]/15 text-[#ffb800]">里程碑</span>
                          )}
                        </div>
                        <p className={`text-[10px] mt-0.5 line-clamp-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {node.memory.summary}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="w-2 h-2 rounded-full" style={{ background: node.emotionColor }} />
                          <span className={`text-[9px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            {node.memory.dimensions.emotional.primary}
                          </span>
                          <span className={`text-[9px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            {new Date(node.memory.dimensions.temporal.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Connection label */}
                    {i < woven.connections.length && (
                      <div className={`mt-1.5 text-[9px] pl-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                        ↓ {woven.connections[i].emotionTransition}
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
