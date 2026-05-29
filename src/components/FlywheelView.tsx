import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '../store/AppContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

const STAGES = [
  { emoji: '🧩', label: '记忆积累', desc: '新的记忆原子加入星云' },
  { emoji: '🔍', label: '模式发现', desc: 'AI 从记忆聚类中发现规律' },
  { emoji: '💡', label: '洞察生成', desc: '推理生成洞察记忆' },
  { emoji: '👆', label: '用户反馈', desc: '确认、纠正、重温' },
  { emoji: '🎯', label: '理解加深', desc: '置信度提升，认知进化' },
  { emoji: '🔄', label: '循环继续', desc: '新记忆触发新一轮推理' },
];

export default function FlywheelView({ open, onClose }: Props) {
  const { rawMemories, insightMemories, theme } = useAppState();
  const isDark = theme === 'dark';

  const stats = useMemo(() => {
    const activeInsights = insightMemories.filter(i => !i.deprecatedAt);
    const confirmed = activeInsights.filter(i => i.userConfirmed).length;
    const avgConf = activeInsights.length > 0
      ? activeInsights.reduce((s, i) => s + i.confidence, 0) / activeInsights.length
      : 0;
    return {
      totalMemories: rawMemories.length,
      totalInsights: activeInsights.length,
      confirmed,
      avgConfidence: Math.round(avgConf * 100),
    };
  }, [rawMemories, insightMemories]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isDark ? 'bg-black/60' : 'bg-black/40'
      } backdrop-blur-sm`}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className={`relative w-full max-w-lg mx-4 rounded-2xl border shadow-2xl overflow-hidden ${
          isDark ? 'bg-[#0d0d1a] border-[#ffffff10]' : 'bg-white border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`px-6 pt-5 pb-3 border-b ${isDark ? 'border-[#ffffff08]' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              🔄 记忆飞轮
            </h2>
            <button
              onClick={onClose}
              className={`text-lg cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-6">
          {/* Flywheel animation */}
          <div className="relative flex items-center justify-center py-4">
            <svg viewBox="0 0 300 300" className="w-64 h-64">
              {/* Center circle */}
              <circle cx="150" cy="150" r="40" fill={isDark ? '#ffb80020' : '#ffb80015'} stroke="#ffb800" strokeWidth="1.5" strokeOpacity="0.4" />
              <text x="150" y="145" textAnchor="middle" fill={isDark ? '#ffb800' : '#b8860b'} fontSize="10" fontWeight="bold">飞轮</text>
              <text x="150" y="160" textAnchor="middle" fill={isDark ? '#ffb800' : '#b8860b'} fontSize="10" fontWeight="bold">核心</text>

              {/* Stage nodes arranged in circle */}
              {STAGES.map((stage, i) => {
                const angle = (i / STAGES.length) * Math.PI * 2 - Math.PI / 2;
                const x = 150 + Math.cos(angle) * 100;
                const y = 150 + Math.sin(angle) * 100;

                return (
                  <g key={i}>
                    {/* Connection line to center */}
                    <line x1="150" y1="150" x2={x} y2={y} stroke={isDark ? '#ffffff' : '#000000'} strokeWidth="0.5" opacity="0.1" />

                    {/* Arrow between stages */}
                    {i < STAGES.length - 1 && (
                      (() => {
                        const nextAngle = ((i + 1) / STAGES.length) * Math.PI * 2 - Math.PI / 2;
                        const nx = 150 + Math.cos(nextAngle) * 100;
                        const ny = 150 + Math.sin(nextAngle) * 100;
                        const midX = (x + nx) / 2;
                        const midY = (y + ny) / 2;
                        const perpX = -(ny - y) * 0.15;
                        const perpY = (nx - x) * 0.15;
                        return (
                          <path
                            key={`arrow-${i}`}
                            d={`M ${x} ${y} Q ${midX + perpX} ${midY + perpY} ${nx} ${ny}`}
                            fill="none"
                            stroke={isDark ? '#00f2ff' : '#0088cc'}
                            strokeWidth="1"
                            opacity="0.3"
                            strokeDasharray="4 2"
                          />
                        );
                      })()
                    )}

                    {/* Stage node */}
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="20"
                      fill={isDark ? '#ffffff08' : '#f5f5f5'}
                      stroke={isDark ? '#ffffff15' : '#e0e0e0'}
                      strokeWidth="1"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                    <text x={x} y={y - 5} textAnchor="middle" fontSize="14">{stage.emoji}</text>
                    <text x={x} y={y + 10} textAnchor="middle" fill={isDark ? '#ffffff' : '#1a1a1a'} fontSize="7" fontWeight="medium">
                      {stage.label}
                    </text>
                  </g>
                );
              })}

              {/* Closing arrow from last to first */}
              {(() => {
                const lastAngle = ((STAGES.length - 1) / STAGES.length) * Math.PI * 2 - Math.PI / 2;
                const firstAngle = -Math.PI / 2;
                const lx = 150 + Math.cos(lastAngle) * 100;
                const ly = 150 + Math.sin(lastAngle) * 100;
                const fx = 150 + Math.cos(firstAngle) * 100;
                const fy = 150 + Math.sin(firstAngle) * 100;
                return (
                  <path
                    d={`M ${lx} ${ly} Q ${150 + Math.cos(Math.PI) * 130} ${150 + Math.sin(Math.PI) * 130} ${fx} ${fy}`}
                    fill="none"
                    stroke={isDark ? '#ffb800' : '#b8860b'}
                    strokeWidth="1.5"
                    opacity="0.3"
                    strokeDasharray="4 2"
                  />
                );
              })()}
            </svg>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-2 gap-3 text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-[#ffffff05]' : 'bg-gray-50'}`}>
              <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>记忆总数</span>
              <div className="text-lg font-medium">{stats.totalMemories}</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-[#ffffff05]' : 'bg-gray-50'}`}>
              <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>活跃洞察</span>
              <div className="text-lg font-medium">{stats.totalInsights}</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-[#ffffff05]' : 'bg-gray-50'}`}>
              <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>已确认洞察</span>
              <div className="text-lg font-medium">{stats.confirmed}</div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-[#ffffff05]' : 'bg-gray-50'}`}>
              <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>平均置信度</span>
              <div className="text-lg font-medium">{stats.avgConfidence}%</div>
            </div>
          </div>

          {/* Summary */}
          <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            每一次互动，都在让这个记忆星云更懂你。
          </p>
        </div>
      </motion.div>
    </div>
  );
}
