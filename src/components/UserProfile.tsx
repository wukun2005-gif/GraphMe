import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { generateUserProfile } from '../utils/profileUtils';
import { EMOTION_COLORS } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UserProfile({ open, onClose }: Props) {
  const { rawMemories, insightMemories, theme, selectMemory } = useAppState();
  const isDark = theme === 'dark';
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);

  const profile = useMemo(
    () => generateUserProfile(rawMemories, insightMemories),
    [rawMemories, insightMemories]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 500, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 500, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`fixed right-0 top-0 h-full w-full max-w-[420px] backdrop-blur-xl border-l z-30 shadow-2xl overflow-hidden flex flex-col ${
            isDark ? 'bg-[#0d0d1a] border-[#ffffff08]' : 'bg-white border-gray-200'
          }`}
        >
          {/* Header */}
          <div className={`px-5 pt-5 pb-3 border-b ${isDark ? 'border-[#ffffff08]' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                👤 小哥眼中的你
              </h2>
              <button
                onClick={onClose}
                className={`text-lg leading-none cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
              >
                ✕
              </button>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {profile.summaryText}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Basic Info */}
            <section>
              <h3 className={`text-xs font-medium mb-2 ${isDark ? 'text-[#00f2ff]' : 'text-blue-600'}`}>
                📊 基本信息
              </h3>
              <div className={`grid grid-cols-2 gap-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#ffffff05]' : 'bg-gray-50'}`}>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>记忆总数</span>
                  <div className="text-lg font-medium">{profile.totalMemories}</div>
                </div>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#ffffff05]' : 'bg-gray-50'}`}>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>时间跨度</span>
                  <div className="text-lg font-medium">{profile.timeSpanDays} 天</div>
                </div>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#ffffff05]' : 'bg-gray-50'}`}>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>最常见情绪</span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: EMOTION_COLORS[profile.topEmotion as keyof typeof EMOTION_COLORS] }} />
                    {profile.topEmotion}
                  </div>
                </div>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#ffffff05]' : 'bg-gray-50'}`}>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>最常地点</span>
                  <div>{profile.topPlace}</div>
                </div>
              </div>
            </section>

            {/* Persons */}
            {profile.persons.length > 0 && (
              <section>
                <h3 className={`text-xs font-medium mb-2 ${isDark ? 'text-[#ffb800]' : 'text-amber-600'}`}>
                  👥 人物关系 ({profile.persons.length})
                </h3>
                <div className="space-y-1.5">
                  {profile.persons.map(p => {
                    const emoColor = EMOTION_COLORS[p.dominantEmotion as keyof typeof EMOTION_COLORS] || '#888';
                    const isExpanded = expandedPerson === p.name;
                    return (
                      <div key={p.name}>
                        <button
                          onClick={() => setExpandedPerson(isExpanded ? null : p.name)}
                          className={`w-full text-left p-2 rounded-lg border transition-colors cursor-pointer ${
                            isDark
                              ? 'bg-[#ffffff03] border-[#ffffff08] hover:border-[#ffb800]/30'
                              : 'bg-gray-50 border-gray-200 hover:border-amber-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: emoColor }} />
                              <span className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                {p.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {p.count} 条记忆
                              </span>
                              <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                                {isExpanded ? '▲' : '▼'}
                              </span>
                            </div>
                          </div>
                        </button>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className={`ml-4 mt-1 space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                          >
                            <p className="text-[10px]">
                              主导情绪：{p.dominantEmotion} · 平均亲密度：{p.avgIntimacy}
                            </p>
                            <div className="space-y-0.5">
                              {p.memoryIds.slice(0, 3).map(id => {
                                const mem = rawMemories.find(m => m.id === id);
                                if (!mem) return null;
                                return (
                                  <button
                                    key={id}
                                    onClick={() => selectMemory(mem)}
                                    className={`block w-full text-left text-[10px] truncate cursor-pointer ${
                                      isDark ? 'text-[#00f2ff] hover:underline' : 'text-blue-600 hover:underline'
                                    }`}
                                  >
                                    · {mem.label}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Habits */}
            {profile.habits.length > 0 && (
              <section>
                <h3 className={`text-xs font-medium mb-2 ${isDark ? 'text-[#44ccaa]' : 'text-teal-600'}`}>
                  🔄 习惯与节律 ({profile.habits.length})
                </h3>
                <div className="space-y-1.5">
                  {profile.habits.map((h, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border text-xs ${
                        isDark ? 'bg-[#ffffff03] border-[#ffffff08]' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{h.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{h.frequency}</span>
                        <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>·</span>
                        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                          置信度 {Math.round(h.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Preferences */}
            {profile.preferences.length > 0 && (
              <section>
                <h3 className={`text-xs font-medium mb-2 ${isDark ? 'text-[#cc44ff]' : 'text-purple-600'}`}>
                  ❤️ 偏好清单 ({profile.preferences.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.preferences.slice(0, 10).map((p, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] ${
                        p.type === 'explicit'
                          ? isDark ? 'bg-[#cc44ff]/10 text-[#cc44ff]' : 'bg-purple-100 text-purple-700'
                          : isDark ? 'bg-[#ffffff08] text-gray-400' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {p.label.length > 20 ? p.label.slice(0, 20) + '…' : p.label}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Growth */}
            {profile.growth.length > 0 && (
              <section>
                <h3 className={`text-xs font-medium mb-2 ${isDark ? 'text-[#88aa44]' : 'text-green-600'}`}>
                  🌱 成长轨迹 ({profile.growth.length})
                </h3>
                <div className="space-y-1.5">
                  {profile.growth.map((g, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border text-xs ${
                        isDark ? 'bg-[#ffffff03] border-[#ffffff08]' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{g.trend === 'up' ? '📈' : g.trend === 'down' ? '📉' : '➡️'}</span>
                        <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                          {g.area}
                        </span>
                      </div>
                      <p className={`mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{g.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
