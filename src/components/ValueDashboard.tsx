import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { getTop5HighValue, getForgettingRiskWarnings } from '../utils/valueUtils';
import { EMOTION_COLORS } from '../types';

const RISK_COLORS: Record<string, string> = {
  high: '#ff4444',
  medium: '#ffb800',
  low: '#44ccaa',
};

const RISK_DARK_COLORS: Record<string, string> = {
  high: '#ff6666',
  medium: '#ffcc00',
  low: '#66ddbb',
};

const RISK_LABELS: Record<string, string> = {
  high: '⚠️ 高',
  medium: '⚡ 中',
  low: '✓ 低',
};

export default function ValueDashboard() {
  const { rawMemories, detailOpen, selectMemory, theme } = useAppState();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(false);

  const top5 = useMemo(() => getTop5HighValue(rawMemories), [rawMemories]);
  const riskWarnings = useMemo(() => getForgettingRiskWarnings(rawMemories), [rawMemories]);

  const riskColorMap = isDark ? RISK_DARK_COLORS : RISK_COLORS;

  return (
    <>
      <button
        id="val-dash-trigger"
        onClick={() => setOpen(!open)}
        className={`fixed bottom-20 w-12 h-12 bg-[#ffb800]/15 border border-[#ffb800]/20 rounded-full flex items-center justify-center text-xl hover:bg-[#ffb800]/25 transition-all z-20 shadow-[0_0_15px_rgba(255,184,0,0.1)] ${
          detailOpen ? 'right-[436px]' : 'right-6'
        }`}
        title="价值看板"
      >
        📊
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed bottom-20 w-[380px] max-h-[520px] backdrop-blur-xl border rounded-xl p-4 z-20 shadow-2xl overflow-hidden flex flex-col ${
              isDark ? 'bg-[#1a1020]/98 border-[#ffffff08]' : 'bg-white/98 border-gray-200'
            } ${
              detailOpen ? 'right-[436px]' : 'right-6'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className={`font-medium text-sm ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                📊 价值看板
              </h3>
              <button
                onClick={() => setOpen(false)}
                className={`text-lg leading-none ${
                  isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4">
              <section>
                <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  🏆 高价值记忆 Top 5
                </h4>
                <div className="space-y-1.5">
                  {top5.map((item, i) => (
                    <button
                      key={item.memory.id}
                      onClick={() => { selectMemory(item.memory); setOpen(false); }}
                      className={`w-full text-left p-2 rounded-lg transition-all cursor-pointer ${
                        isDark
                          ? 'hover:bg-[#ffffff08] bg-[#ffffff03]'
                          : 'hover:bg-black/5 bg-black/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: EMOTION_COLORS[item.memory.dimensions.emotional.primary] }}
                        />
                        <span className={`text-xs flex-1 truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {item.memory.label}
                        </span>
                        <span className={`text-xs font-mono flex-shrink-0 ${
                          isDark ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {item.score.toFixed(0)}分
                        </span>
                      </div>
                      <div className={`flex gap-3 mt-1 pl-4 text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                        <span>重要性 {item.breakdown.importance.toFixed(0)}</span>
                        <span>CQI {item.breakdown.cqi.toFixed(0)}</span>
                        <span>情感 {item.breakdown.emotionalIntensity.toFixed(0)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  🔔 遗忘风险预警
                </h4>
                {riskWarnings.length === 0 ? (
                  <div className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    ✅ 当前无高风险记忆
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {riskWarnings.map((item) => (
                      <button
                        key={item.memory.id}
                        onClick={() => { selectMemory(item.memory); setOpen(false); }}
                        className={`w-full text-left p-2 rounded-lg transition-all cursor-pointer ${
                          isDark
                            ? 'hover:bg-[#ffffff08] bg-[#ffffff03]'
                            : 'hover:bg-black/5 bg-black/[0.02]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                            style={{
                              color: riskColorMap[item.level],
                              backgroundColor: `${riskColorMap[item.level]}15`,
                            }}
                          >
                            {RISK_LABELS[item.level]}
                          </span>
                          <span className={`text-xs flex-1 truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.memory.label}
                          </span>
                          <span className={`text-xs flex-shrink-0 ${
                            isDark ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {item.daysSinceCreation.toFixed(0)}天前
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}