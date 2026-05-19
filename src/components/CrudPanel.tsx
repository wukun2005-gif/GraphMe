import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import type { RawMemory, EmotionType } from '../types';
import { EMOTION_COLORS } from '../types';

let createIdCounter = 2000;

export default function CrudPanel() {
  const { crudOpen, toggleCrud, addMemory, rawMemories } = useAppState();
  const [formOpen, setFormOpen] = useState(false);

  const [label, setLabel] = useState('');
  const [summary, setSummary] = useState('');
  const [emotion, setEmotion] = useState<EmotionType>('快乐');
  const [placeType, setPlaceType] = useState<RawMemory['dimensions']['spatial']['placeType']>('家');
  const [storyline, setStoryline] = useState('');

  const handleCreate = () => {
    if (!label || !summary) return;
    const id = `mem_${createIdCounter++}`;
    const x = (Math.random() * 6 - 3).toFixed(1);
    const y = (Math.random() * 3 - 1.5).toFixed(1);
    const z = (Math.random() * 4 - 2).toFixed(1);
    const px = parseFloat(x), py = parseFloat(y), pz = parseFloat(z);

    const newMem: RawMemory = {
      type: 'raw',
      id,
      label,
      summary,
      dimensions: {
        temporal: { timestamp: Date.now(), dateType: '普通日', timeOfDay: '下午', season: '夏', duration: 30 },
        spatial: { placeType, room: '客厅', landmark: '手动添加' },
        social: { persons: [], relationship: [], groupInteraction: false, intimacy: 0.3 },
        emotional: { primary: emotion, intensity: 0.7, trigger: '用户手动添加' },
        activity: { type: '活动', detail: summary },
        sensory: { images: [], audio: [], videos: [], gesture: null },
        semantic: { knowledge: [], preferences: {}, skills: [] },
        value: { importance: 0.3, cqi: 0.2, accessCount: 0, privacyLevel: '家庭可见' },
        narrative: { storyline, previousRefs: [], nextRefs: [], isMilestone: false },
        robotState: { device: 'Loona', batteryLevel: 80, firmwareVersion: '2.1.0' },
      },
      position3D: [px, py, pz],
      color: EMOTION_COLORS[emotion],
      size: 0.5,
      positions: {
        '全局视图': [px, py, pz],
        '家庭视图': [(px + 3) % 10 - 5, (py + 2) % 6 - 3, (pz + 3) % 8 - 4],
        '学习视图': [px * 0.7, py * 0.6, pz * 0.7],
        '情绪视图': [px * 0.7, py * 0.6, pz * 0.7],
      },
    };

    addMemory(newMem);
    setLabel('');
    setSummary('');
    setEmotion('快乐');
    setFormOpen(false);
  };

  return (
    <>
      <button
        onClick={toggleCrud}
        className="fixed left-[232px] bottom-6 w-10 h-10 bg-[#00f2ff]/10 border border-[#00f2ff]/20 rounded-lg flex items-center justify-center text-sm hover:bg-[#00f2ff]/20 transition-all z-20"
        title="管理记忆"
      >
        ⚙️
      </button>

      <AnimatePresence>
        {crudOpen && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-[220px] top-0 h-full w-[320px] bg-[#0d0d1a]/95 backdrop-blur-xl border-r border-[#ffffff08] p-4 z-20 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-300 font-medium text-sm">⚙️ 记忆管理</h3>
              <button onClick={toggleCrud} className="text-gray-600 hover:text-gray-300 text-lg">✕</button>
            </div>

            <button
              onClick={() => setFormOpen(!formOpen)}
              className="w-full py-2 mb-4 bg-[#00f2ff]/10 border border-[#00f2ff]/20 rounded-lg text-sm text-[#00f2ff] hover:bg-[#00f2ff]/20 transition-colors"
            >
              {formOpen ? '取消' : '➕ 新建记忆原子'}
            </button>

            <AnimatePresence>
              {formOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="space-y-3 bg-[#1a1a2e]/50 rounded-lg p-3 border border-[#ffffff08]">
                    <input
                      type="text"
                      placeholder="标签（必填）"
                      value={label}
                      onChange={e => setLabel(e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-[#ffffff08] rounded px-2 py-1.5 text-xs text-gray-300 placeholder-gray-600"
                    />
                    <textarea
                      placeholder="摘要描述（必填）"
                      value={summary}
                      onChange={e => setSummary(e.target.value)}
                      rows={3}
                      className="w-full bg-[#0a0a0f] border border-[#ffffff08] rounded px-2 py-1.5 text-xs text-gray-300 placeholder-gray-600 resize-none"
                    />
                    <div className="flex gap-2">
                      <select
                        value={emotion}
                        onChange={e => setEmotion(e.target.value as EmotionType)}
                        className="flex-1 bg-[#0a0a0f] border border-[#ffffff08] rounded px-2 py-1.5 text-xs text-gray-300"
                      >
                        {Object.keys(EMOTION_COLORS).map(e => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                      <select
                        value={placeType}
                        onChange={e => setPlaceType(e.target.value as any)}
                        className="flex-1 bg-[#0a0a0f] border border-[#ffffff08] rounded px-2 py-1.5 text-xs text-gray-300"
                      >
                        <option value="家">🏠 家</option>
                        <option value="学校">🏫 学校</option>
                        <option value="公园">🌳 公园</option>
                        <option value="游乐场">🎡 游乐场</option>
                        <option value="商场">🛍️ 商场</option>
                        <option value="其他">📍 其他</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="故事线标签（可选）"
                      value={storyline}
                      onChange={e => setStoryline(e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-[#ffffff08] rounded px-2 py-1.5 text-xs text-gray-300 placeholder-gray-600"
                    />
                    <button
                      onClick={handleCreate}
                      className="w-full py-1.5 bg-[#00f2ff]/15 text-[#00f2ff] text-xs rounded-lg hover:bg-[#00f2ff]/25 transition-colors"
                    >
                      创建记忆原子
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <p className="text-gray-600 text-xs mb-2">
                共 {rawMemories.length} 条原始记忆
              </p>
              <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                {rawMemories.slice(-20).reverse().map(mem => (
                  <div key={mem.id} className="px-2 py-1.5 rounded bg-[#0a0a0f]/50 text-xs text-gray-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: mem.color }} />
                    <span className="truncate flex-1">{mem.id}</span>
                    <span className="text-gray-700">{mem.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}