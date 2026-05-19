import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import type { RawMemory, InsightMemory } from '../types';
import { EMOTION_COLORS, CATEGORY_LABELS } from '../types';

interface VersionEntry {
  version: number;
  statement: string;
  confidence: number;
  date: string;
  change: string;
}

const MOCK_VERSIONS: Record<string, VersionEntry[]> = {
  'insight_001': [
    { version: 1, statement: '孩子对编程有兴趣', confidence: 0.72, date: '4月15日', change: '初始发现' },
    { version: 2, statement: '孩子对图形化编程的兴趣在上升', confidence: 0.85, date: '5月20日', change: '印证加深' },
  ],
  'insight_003': [
    { version: 1, statement: '孩子面对困难时倾向于求助', confidence: 0.68, date: '4月10日', change: '初始发现' },
    { version: 2, statement: '孩子相信通过努力可以解决难题', confidence: 0.82, date: '5月18日', change: '新数据修正结论' },
  ],
  'insight_008': [
    { version: 1, statement: '孩子的数学能力在具象操作阶段', confidence: 0.75, date: '4月5日', change: '初始发现' },
    { version: 2, statement: '数学直觉从具象操作向抽象符号过渡', confidence: 0.73, date: '5月22日', change: '分数题表现改变结论' },
  ],
  'insight_010': [
    { version: 1, statement: '孩子遇到问题第一反应是求助他人', confidence: 0.78, date: '4月8日', change: '初始发现' },
    { version: 2, statement: '处理挫折的策略从求助到尝试独立解决', confidence: 0.68, date: '5月25日', change: '独立编程里程碑修正' },
  ],
};

function RawDetail({ memory }: { memory: RawMemory }) {
  const d = memory.dimensions;
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🧠</span>
        <span className="text-[#00f2ff] font-medium">{memory.id}</span>
      </div>
      <p className="text-gray-300 leading-relaxed">{memory.summary}</p>
      {d.sensory.images.length > 0 && (
        <div className="flex gap-2 py-2">
          {d.sensory.images.map((img, i) => (
            <div key={i} className="w-20 h-20 bg-[#1a1a2e] rounded flex items-center justify-center text-xs text-gray-500">
              📷 照片
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-gray-400">
        <div><span className="text-gray-600">⏰ 时间</span> {d.temporal.dateType}</div>
        <div><span className="text-gray-600">📍 地点</span> {d.spatial.landmark}</div>
        <div><span className="text-gray-600">👤 人物</span> {d.social.persons.join('、') || '无'}</div>
        <div>
          <span className="text-gray-600">😊 情绪</span>
          <span style={{ color: EMOTION_COLORS[d.emotional.primary] }}> {d.emotional.primary} {d.emotional.intensity.toFixed(2)}</span>
        </div>
        <div><span className="text-gray-600">🎮 活动</span> {d.activity.detail}</div>
        {d.semantic.knowledge.length > 0 && (
          <div className="col-span-2"><span className="text-gray-600">📝 知识</span> {d.semantic.knowledge.join('、')}</div>
        )}
        <div><span className="text-gray-600">⭐ 重要性</span> {d.value.importance.toFixed(2)}</div>
        <div><span className="text-gray-600">📊 CQI</span> {d.value.cqi.toFixed(2)}</div>
        {d.narrative.storyline && (
          <div className="col-span-2"><span className="text-gray-600">🔗 故事线</span> {d.narrative.storyline}</div>
        )}
      </div>
    </div>
  );
}

function InsightDetail({ memory }: { memory: InsightMemory }) {
  const versions = MOCK_VERSIONS[memory.id];

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💡</span>
        <span className="text-[#ffb800] font-medium">{memory.id}</span>
      </div>
      <div className="bg-[#1a1a2e] rounded-lg p-3 border border-[#ffb800]/20">
        <p className="text-[#ffb800] font-medium text-sm">{CATEGORY_LABELS[memory.category]}：{memory.statement}</p>
        <p className="text-gray-400 mt-1 text-xs leading-relaxed">{memory.description}</p>
        <div className="mt-2 bg-[#0a0a0f] rounded h-2 overflow-hidden">
          <div className="h-full bg-[#ffb800] rounded" style={{ width: `${memory.confidence * 100}%` }} />
        </div>
        <p className="text-gray-500 text-xs mt-1">Confidence {Math.round(memory.confidence * 100)}%</p>
      </div>
      <div>
        <p className="text-gray-600 text-xs mb-1">📊 依据（共 {memory.sourceRawMemoryIds.length} 条原始记忆）</p>
        <div className="text-gray-500 text-xs space-y-0.5 max-h-32 overflow-y-auto">
          {memory.sourceRawMemoryIds.map((id) => (
            <div key={id} className="pl-2 border-l border-[#ffb800]/20">{id}</div>
          ))}
        </div>
      </div>
      {versions && versions.length > 1 && (
        <div>
          <p className="text-gray-600 text-xs mb-1">📖 版本历史（认知演化）</p>
          <div className="space-y-0">
            {versions.map((v, i) => {
              const isLatest = i === versions.length - 1;
              return (
                <div key={v.version} className="relative pl-4 pb-3">
                  {i < versions.length - 1 && (
                    <div className="absolute left-[5px] top-3 bottom-0 w-[2px] bg-[#ffb800]/20" />
                  )}
                  <div className={`absolute left-0 top-1.5 w-[12px] h-[12px] rounded-full border-2 ${
                    isLatest ? 'bg-[#ffb800]/30 border-[#ffb800]' : 'bg-transparent border-[#ffb800]/30'
                  }`} />
                  <div className="text-xs">
                    <span className="text-gray-500">v{v.version}</span>
                    <span className="text-gray-700 mx-1">({v.date})</span>
                    <span className={`text-xs ${isLatest ? 'text-[#ffb800]' : 'text-gray-500'}`}>
                      {isLatest ? ' ← 当前版本' : ''}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">{v.statement}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 bg-[#0a0a0f] rounded-full overflow-hidden">
                      <div className="h-full bg-[#ffb800]/40 rounded" style={{ width: `${v.confidence * 100}%` }} />
                    </div>
                    <span className="text-gray-600 text-xs">{Math.round(v.confidence * 100)}%</span>
                  </div>
                  <span className="text-gray-600 text-xs">{v.change}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {memory.previousVersionId && !versions && (
        <div className="text-gray-500 text-xs">
          📖 版本 v{memory.version - 1} → v{memory.version}
        </div>
      )}
    </div>
  );
}

export default function DetailPanel() {
  const { selectedMemory, detailOpen, toggleDetail, deleteMemory } = useAppState();

  return (
    <AnimatePresence>
      {detailOpen && selectedMemory && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-[380px] bg-[#0d0d1a]/95 backdrop-blur-xl border-l border-[#ffffff08] p-6 overflow-y-auto z-20 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-300 font-medium">
              {selectedMemory.type === 'raw' ? '记忆原子详情' : '小哥的发现'}
            </h3>
            <button onClick={toggleDetail} className="text-gray-600 hover:text-gray-300 transition-colors text-xl leading-none">
              ✕
            </button>
          </div>
          {selectedMemory.type === 'raw'
            ? <RawDetail memory={selectedMemory} />
            : <InsightDetail memory={selectedMemory} />}
          <div className="mt-6 flex gap-2 border-t border-[#ffffff08] pt-4">
            <button className="px-3 py-1.5 text-xs bg-[#1a1a2e] hover:bg-[#2a2a3e] text-gray-400 rounded transition-colors">✏️ 编辑</button>
            <button
              onClick={() => deleteMemory(selectedMemory.id)}
              className="px-3 py-1.5 text-xs bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded transition-colors"
            >
              🗑️ 删除
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}