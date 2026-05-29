import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import type { RawMemory, InsightMemory, EmotionType, FarewellRecord } from '../types';
import { EMOTION_COLORS, CATEGORY_LABELS } from '../types';
import { computeDiff } from '../utils/valueUtils';
import { renderMemoryCard, downloadBlob } from '../utils/cardUtils';
import { getMemoryConnections } from '../utils/navUtils';
import type { MemoryConnection } from '../utils/navUtils';

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

type EditData = {
  label: string;
  summary: string;
  emotion: EmotionType;
  placeType: string;
  landmark: string;
  activity: string;
  storyline: string;
  importance: number;
  persons: string;
  knowledge: string;
  privacyLevel: '公开' | '家庭可见' | '仅自己' | '加密';
  tags: string[];
};

function RawDetail({ memory }: { memory: RawMemory }) {
  const { theme, rawMemories, insightMemories, selectMemory } = useAppState();
  const isDark = theme === 'dark';
  const d = memory.dimensions;

  const connections = useMemo(
    () => getMemoryConnections(memory.id, rawMemories, insightMemories),
    [memory.id, rawMemories, insightMemories]
  );
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🧠</span>
        <span className={isDark ? 'text-[#00f2ff] font-medium' : 'text-[#0088cc] font-medium'}>{memory.id}</span>
      </div>
      <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{memory.summary}</p>
      {d.sensory.images.length > 0 && (
        <div className="flex gap-2 py-2 overflow-x-auto">
          {d.sensory.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`记忆照片 ${i + 1}`}
              className={`w-24 h-24 rounded-lg object-cover border-2 flex-shrink-0 ${
                isDark ? 'border-[#ffffff10]' : 'border-gray-200'
              }`}
              loading="lazy"
            />
          ))}
        </div>
      )}
      <div className={`grid grid-cols-2 gap-x-4 gap-y-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        <div><span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>⏰ 时间</span> {d.temporal.dateType}</div>
        <div><span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>📍 地点</span> {d.spatial.landmark}</div>
        <div><span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>👤 人物</span> {d.social.persons.join('、') || '无'}</div>
        <div>
          <span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>😊 情绪</span>
          <span style={{ color: EMOTION_COLORS[d.emotional.primary] }}> {d.emotional.primary} ({d.emotional.intensity.toFixed(2)})</span>
        </div>
        <div><span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>🎮 活动</span> {d.activity.detail}</div>
        {d.semantic.knowledge.length > 0 && (
          <div className="col-span-2"><span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>📝 知识</span> {d.semantic.knowledge.join('、')}</div>
        )}
        <div><span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>⭐ 重要性</span> {d.value.importance.toFixed(2)}</div>
        <div><span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>📊 CQI</span> {d.value.cqi.toFixed(2)}</div>
        <div><span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>🔒 隐私</span> {d.value.privacyLevel}</div>
        {d.narrative.storyline && (
          <div className="col-span-2"><span className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`}>🔗 故事线</span> {d.narrative.storyline}</div>
        )}
      </div>
      {memory.tags && memory.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {memory.tags.map(tag => (
            <span
              key={tag}
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                isDark ? 'bg-[#00f2ff]/10 text-[#00f2ff]' : 'bg-[#0088cc]/10 text-[#0088cc]'
              }`}
            >
              🏷 {tag}
            </span>
          ))}
        </div>
      )}

      {connections.length > 0 && (
        <div className={`mt-4 pt-3 border-t ${isDark ? 'border-[#ffffff08]' : 'border-gray-200'}`}>
          <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            🌌 这条记忆的连接 ({connections.length})
          </h4>
          <div className="space-y-1">
            {connections.slice(0, 8).map(conn => {
              const typeIcon = conn.type === 'insight' ? '💡' : conn.type === 'storyline' ? '🔗' : '👤';
              const typeColor = conn.type === 'insight'
                ? isDark ? 'text-[#ffb800]' : 'text-[#b8860b]'
                : conn.type === 'storyline'
                  ? isDark ? 'text-[#00f2ff]' : 'text-[#0088cc]'
                  : isDark ? 'text-purple-400' : 'text-purple-600';
              return (
                <button
                  key={conn.id}
                  onClick={() => selectMemory(conn.memory)}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                    isDark ? 'hover:bg-[#ffffff08]' : 'hover:bg-black/5'
                  }`}
                >
                  <span>{typeIcon}</span>
                  <span className={`flex-1 truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{conn.label}</span>
                  <span className={`text-[10px] flex-shrink-0 ${typeColor}`}>{conn.detail}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function InsightDetail({ memory }: { memory: InsightMemory }) {
  const { rawMemories, theme, selectMemory, updateInsight } = useAppState();
  const isDark = theme === 'dark';
  const versions = MOCK_VERSIONS[memory.id];
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState(memory.userNote || '');
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);
  const [correctionText, setCorrectionText] = useState(memory.userCorrection || '');

  const sourceSummaries = memory.sourceRawMemoryIds.map(id => {
    const raw = rawMemories.find(m => m.id === id);
    return { id, summary: raw?.summary || '未知记忆', rawMem: raw };
  });

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💡</span>
        <span className={`font-medium ${isDark ? 'text-[#ffb800]' : 'text-[#b8860b]'}`}>{memory.id}</span>
      </div>
      <div className={`rounded-lg p-3 border ${
        isDark ? 'bg-[#1a1a2e] border-[#ffb800]/20' : 'bg-yellow-50 border-yellow-200'
      }`}>
        <p className={`font-medium text-sm ${isDark ? 'text-[#ffb800]' : 'text-[#b8860b]'}`}>{CATEGORY_LABELS[memory.category]}：{memory.statement}</p>
        <p className={`mt-1 text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{memory.description}</p>
        <div className={`mt-2 rounded h-2 overflow-hidden ${isDark ? 'bg-[#0a0a0f]' : 'bg-gray-200'}`}>
          <div className="h-full bg-[#ffb800] rounded" style={{ width: `${memory.confidence * 100}%` }} />
        </div>
        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Confidence {Math.round(memory.confidence * 100)}%</p>
      </div>
      <div>
        <p className={`text-xs mb-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>📊 依据（共 {memory.sourceRawMemoryIds.length} 条原始记忆）</p>
        <div className={`text-xs space-y-1 max-h-32 overflow-y-auto ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
          {sourceSummaries.map(({ id, summary, rawMem }) => (
            <button
              key={id}
              onClick={() => rawMem && selectMemory(rawMem)}
              className={`pl-2 pr-2 py-0.5 border-l text-left w-full transition-colors rounded-r cursor-pointer ${
                isDark
                  ? 'border-[#ffb800]/20 hover:border-[#ffb800]/60 hover:bg-[#ffb800]/5'
                  : 'border-yellow-300 hover:border-yellow-500 hover:bg-yellow-50'
              }`}
            >
              <span className={isDark ? 'text-[#ffb800]/80' : 'text-[#b8860b]'}>{id}</span>
              <span className={`ml-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>— {summary.length > 40 ? summary.slice(0, 40) + '...' : summary}</span>
            </button>
          ))}
        </div>
      </div>
      {versions && versions.length > 1 && (
        <div>
          <p className={`text-xs mb-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>📖 版本历史（认知演化）</p>
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
                    <span className={`${isDark ? 'text-gray-500' : 'text-gray-400'}`}>v{v.version}</span>
                    <span className={`mx-1 ${isDark ? 'text-gray-700' : 'text-gray-300'}`}>({v.date})</span>
                    <span className={`text-xs ${isLatest ? (isDark ? 'text-[#ffb800]' : 'text-[#b8860b]') : (isDark ? 'text-gray-500' : 'text-gray-400')}`}>
                      {isLatest ? ' ← 当前版本' : ''}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{v.statement}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className={`flex-1 h-1 rounded-full overflow-hidden ${isDark ? 'bg-[#0a0a0f]' : 'bg-gray-200'}`}>
                      <div className="h-full bg-[#ffb800]/40 rounded" style={{ width: `${v.confidence * 100}%` }} />
                    </div>
                    <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{Math.round(v.confidence * 100)}%</span>
                  </div>
                  <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{v.change}</span>
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

      <div className={`pt-3 border-t ${isDark ? 'border-[#ffffff08]' : 'border-gray-200'}`}>
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => updateInsight(memory.id, { userConfirmed: !memory.userConfirmed })}
            className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors cursor-pointer ${
              memory.userConfirmed
                ? isDark ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-green-100 text-green-700 border border-green-300'
                : isDark ? 'bg-[#ffffff08] text-gray-400 hover:bg-[#ffffff12]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {memory.userConfirmed ? '👍 已确认' : '👍 确认'}
          </button>
          <button
            onClick={() => setShowCorrectionInput(!showCorrectionInput)}
            className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors cursor-pointer ${
              memory.userCorrection
                ? isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-700 border border-amber-300'
                : isDark ? 'bg-[#ffffff08] text-gray-400 hover:bg-[#ffffff12]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ✏️ {memory.userCorrection ? '已纠正' : '纠正'}
          </button>
          <button
            onClick={() => setShowNoteInput(!showNoteInput)}
            className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors cursor-pointer ${
              memory.userNote
                ? isDark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-100 text-blue-700 border border-blue-300'
                : isDark ? 'bg-[#ffffff08] text-gray-400 hover:bg-[#ffffff12]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            💬 {memory.userNote ? '已备注' : '备注'}
          </button>
        </div>

        {memory.userCorrection && !showCorrectionInput && (
          <div className={`text-xs px-2 py-1 rounded mb-2 ${
            isDark ? 'bg-amber-500/10 text-amber-400/80' : 'bg-amber-50 text-amber-700'
          }`}>
            纠正：{memory.userCorrection}
          </div>
        )}

        {showCorrectionInput && (
          <div className="flex gap-1 mb-2">
            <input
              type="text"
              value={correctionText}
              onChange={e => setCorrectionText(e.target.value)}
              placeholder="输入纠正内容..."
              className={`flex-1 border rounded px-2 py-1 text-xs ${
                isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
              }`}
            />
            <button
              onClick={() => {
                updateInsight(memory.id, { userCorrection: correctionText });
                setShowCorrectionInput(false);
              }}
              className={`px-2 py-1 text-xs rounded cursor-pointer ${
                isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
              }`}
            >
              保存
            </button>
          </div>
        )}

        {showNoteInput && (
          <div className="flex gap-1">
            <input
              type="text"
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="输入备注..."
              className={`flex-1 border rounded px-2 py-1 text-xs ${
                isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
              }`}
            />
            <button
              onClick={() => {
                updateInsight(memory.id, { userNote: noteText });
                setShowNoteInput(false);
              }}
              className={`px-2 py-1 text-xs rounded cursor-pointer ${
                isDark ? 'bg-[#00f2ff]/10 text-[#00f2ff]' : 'bg-[#0088cc]/10 text-[#0088cc]'
              }`}
            >
              保存
            </button>
          </div>
        )}

        {memory.userNote && !showNoteInput && (
          <div className={`text-xs px-2 py-1 rounded ${
            isDark ? 'bg-blue-500/10 text-blue-400/80' : 'bg-blue-50 text-blue-700'
          }`}>
            备注：{memory.userNote}
          </div>
        )}
      </div>
    </div>
  );
}

function CompareView({ memory, compareTarget, onSelectTarget, allMemories, theme }: {
  memory: RawMemory;
  compareTarget: string | null;
  onSelectTarget: (id: string | null) => void;
  allMemories: RawMemory[];
  theme: 'dark' | 'light';
}) {
  const isDark = theme === 'dark';
  const target = compareTarget ? allMemories.find(m => m.id === compareTarget) : null;
  const diffs = target ? computeDiff(memory, target) : [];

  // Same storyline memories for quick selection
  const storylineMems = allMemories.filter(m =>
    m.id !== memory.id &&
    m.dimensions.narrative.storyline &&
    m.dimensions.narrative.storyline === memory.dimensions.narrative.storyline
  );

  if (!target) {
    return (
      <div className="space-y-3">
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          选择一条记忆进行对比
        </p>
        {storylineMems.length > 0 && (
          <div>
            <p className={`text-[10px] mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              同故事线记忆
            </p>
            <div className="space-y-1">
              {storylineMems.map(m => (
                <button
                  key={m.id}
                  onClick={() => onSelectTarget(m.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                    isDark ? 'hover:bg-[#ffffff08] text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                  <span className="truncate">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className={`text-[10px] mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            所有记忆
          </p>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {allMemories.filter(m => m.id !== memory.id).slice(0, 20).map(m => (
              <button
                key={m.id}
                onClick={() => onSelectTarget(m.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-[#ffffff08] text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                <span className="truncate">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>对比模式</p>
        <button
          onClick={() => onSelectTarget(null)}
          className={`text-[10px] cursor-pointer ${isDark ? 'text-[#00f2ff]' : 'text-[#0088cc]'}`}
        >
          更换
        </button>
      </div>

      {/* Two cards side by side */}
      <div className="grid grid-cols-2 gap-2">
        {[memory, target].map((mem, idx) => {
          const emoColor = EMOTION_COLORS[mem.dimensions.emotional.primary] || '#888';
          return (
            <div key={mem.id} className={`p-2.5 rounded-lg border ${isDark ? 'bg-[#ffffff03] border-[#ffffff06]' : 'bg-gray-50 border-gray-100'}`}>
              <p className={`text-[10px] mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {idx === 0 ? '早期' : '后期'}
              </p>
              <p className={`text-xs font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {mem.label}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-2 h-2 rounded-full" style={{ background: emoColor }} />
                <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {mem.dimensions.emotional.primary}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrow */}
      <div className={`text-center text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>→</div>

      {/* Diffs */}
      <div className="space-y-1.5">
        {diffs.map(d => (
          <div key={d.dimension} className={`flex items-center gap-2 px-2.5 py-1.5 rounded ${isDark ? 'bg-[#ffffff03]' : 'bg-gray-50'}`}>
            <span className={`text-[10px] w-16 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{d.label}</span>
            <span className={`text-xs font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{d.from}</span>
            <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>→</span>
            <span className={`text-xs font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{d.to}</span>
            <span className={`text-xs ml-auto ${
              d.direction === '↑' ? 'text-green-400' : d.direction === '↓' ? 'text-red-400' : 'text-gray-500'
            }`}>
              {d.direction} {Math.abs(d.delta).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DetailPanel() {
  const { selectedMemory, detailOpen, toggleDetail, deleteMemory, updateMemory, theme, favoriteIds, toggleFavorite, collections, addToCollection, removeFromCollection, allRawMemories, findSimilar, clearSimilar, similarMemoryIds, farewellMemory } = useAppState();
  const isDark = theme === 'dark';
  const [editMode, setEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareTarget, setCompareTarget] = useState<string | null>(null);
  const [farewellMode, setFarewellMode] = useState(false);
  const [farewellNote, setFarewellNote] = useState('');
  const [farewellStyle, setFarewellStyle] = useState<FarewellRecord['releaseStyle']>('深海');

  useEffect(() => {
    if (!detailOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleDetail();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [detailOpen, toggleDetail]);

  useEffect(() => {
    if (!confirmDelete) return;
    const timer = setTimeout(() => setConfirmDelete(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmDelete]);

  useEffect(() => { setConfirmDelete(false); }, [selectedMemory?.id]);
  const [edit, setEdit] = useState<EditData>({
    label: '',
    summary: '',
    emotion: '快乐',
    placeType: '家',
    landmark: '',
    activity: '',
    storyline: '',
    importance: 0.5,
    persons: '',
    knowledge: '',
    privacyLevel: '家庭可见',
    tags: [],
  });

  useEffect(() => {
    if (selectedMemory && selectedMemory.type === 'raw') {
      const m = selectedMemory as RawMemory;
      setEdit({
        label: m.label,
        summary: m.summary,
        emotion: m.dimensions.emotional.primary,
        placeType: m.dimensions.spatial.placeType,
        landmark: m.dimensions.spatial.landmark,
        activity: m.dimensions.activity.detail,
        storyline: m.dimensions.narrative.storyline,
        importance: m.dimensions.value.importance,
        persons: m.dimensions.social.persons.join('、'),
        knowledge: m.dimensions.semantic.knowledge.join('、'),
        privacyLevel: m.dimensions.value.privacyLevel,
        tags: m.tags || [],
      });
      setEditMode(false);
    }
  }, [selectedMemory]);

  const startEdit = () => {
    if (!selectedMemory || selectedMemory.type !== 'raw') return;
    const m = selectedMemory as RawMemory;
    setEdit({
      label: m.label,
      summary: m.summary,
      emotion: m.dimensions.emotional.primary,
      placeType: m.dimensions.spatial.placeType,
      landmark: m.dimensions.spatial.landmark,
      activity: m.dimensions.activity.detail,
      storyline: m.dimensions.narrative.storyline,
      importance: m.dimensions.value.importance,
      persons: m.dimensions.social.persons.join('、'),
      knowledge: m.dimensions.semantic.knowledge.join('、'),
      privacyLevel: m.dimensions.value.privacyLevel,
      tags: m.tags || [],
    });
    setEditMode(true);
  };

  const saveEdit = () => {
    if (!selectedMemory || !edit.label || !edit.summary) return;
    const memory = selectedMemory as RawMemory;
    updateMemory(selectedMemory.id, {
      label: edit.label,
      summary: edit.summary,
      color: EMOTION_COLORS[edit.emotion],
      tags: edit.tags,
      dimensions: {
        ...memory.dimensions,
        emotional: {
          ...memory.dimensions.emotional,
          primary: edit.emotion,
        },
        spatial: {
          ...memory.dimensions.spatial,
          placeType: edit.placeType as RawMemory['dimensions']['spatial']['placeType'],
          landmark: edit.landmark,
        },
        activity: {
          ...memory.dimensions.activity,
          detail: edit.activity,
        },
        narrative: {
          ...memory.dimensions.narrative,
          storyline: edit.storyline,
        },
        value: {
          ...memory.dimensions.value,
          importance: edit.importance,
          privacyLevel: edit.privacyLevel,
        },
        social: {
          ...memory.dimensions.social,
          persons: edit.persons ? edit.persons.split('、').map(s => s.trim()).filter(Boolean) : [],
        },
        semantic: {
          ...memory.dimensions.semantic,
          knowledge: edit.knowledge ? edit.knowledge.split('、').map(s => s.trim()).filter(Boolean) : [],
        },
      },
    });
    setEditMode(false);
  };

  const cancelEdit = () => {
    setEditMode(false);
  };

  // Listen for demo events to programmatically enter/exit edit mode
  useEffect(() => {
    const onDemoEdit = () => {
      if (selectedMemory && selectedMemory.type === 'raw') startEdit();
    };
    const onDemoCancelEdit = () => cancelEdit();

    window.addEventListener('demo-detail-edit-internal', onDemoEdit);
    window.addEventListener('demo-detail-cancel-edit-internal', onDemoCancelEdit);
    return () => {
      window.removeEventListener('demo-detail-edit-internal', onDemoEdit);
      window.removeEventListener('demo-detail-cancel-edit-internal', onDemoCancelEdit);
    };
  });

  const updateEdit = (field: keyof EditData, value: string | number) => {
    setEdit(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      {detailOpen && selectedMemory && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`fixed right-0 top-0 h-full w-[420px] backdrop-blur-xl border-l p-6 overflow-y-auto z-20 shadow-2xl ${
            isDark ? 'bg-[#0d0d1a] border-[#ffffff08]' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
              {selectedMemory.type === 'raw' ? '记忆原子详情' : 'GraphMe 的发现'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                id="demo-favorite-btn"
                onClick={() => toggleFavorite(selectedMemory.id)}
                className={`transition-colors text-lg cursor-pointer ${
                  favoriteIds.includes(selectedMemory.id)
                    ? 'text-amber-400'
                    : isDark ? 'text-gray-600 hover:text-amber-400' : 'text-gray-400 hover:text-amber-400'
                }`}
                title={favoriteIds.includes(selectedMemory.id) ? '取消收藏' : '收藏'}
              >
                {favoriteIds.includes(selectedMemory.id) ? '⭐' : '☆'}
              </button>
              {collections.length > 0 && selectedMemory.type === 'raw' && (
                <div className="relative group">
                  <button
                    className={`transition-colors text-sm cursor-pointer ${isDark ? 'text-gray-600 hover:text-purple-400' : 'text-gray-400 hover:text-purple-500'}`}
                    title="添加到精选集"
                  >
                    📁
                  </button>
                  <div className={`absolute right-0 top-full mt-1 w-40 rounded-lg border shadow-lg z-50 hidden group-hover:block ${
                    isDark ? 'bg-[#1a1020] border-[#ffffff15]' : 'bg-white border-gray-200'
                  }`}>
                    {collections.map(col => {
                      const isIn = col.memoryIds.includes(selectedMemory.id);
                      return (
                        <button
                          key={col.id}
                          onClick={() => isIn ? removeFromCollection(col.id, selectedMemory.id) : addToCollection(col.id, selectedMemory.id)}
                          className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                            isDark ? 'hover:bg-[#ffffff08] text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          <span>{col.emoji}</span>
                          <span className="flex-1 truncate">{col.name}</span>
                          {isIn && <span className="text-[9px] text-green-400">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <button onClick={toggleDetail} className={`transition-colors text-xl leading-none cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}>
                ✕
              </button>
            </div>
          </div>

          {editMode && selectedMemory.type === 'raw' ? (
            <div className="space-y-3 text-sm">
              <div className="space-y-3">
                <div>
                  <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Label</label>
                  <input
                    id="demo-edit-label"
                    type="text"
                    value={edit.label}
                    onChange={e => updateEdit('label', e.target.value)}
                    className={`w-full border rounded px-3 py-1.5 text-sm focus:outline-none ${
                      isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300 focus:border-[#00f2ff]/30' : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-[#0088cc]/30'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Summary</label>
                  <textarea
                    id="demo-edit-summary"
                    value={edit.summary}
                    onChange={e => updateEdit('summary', e.target.value)}
                    rows={3}
                    className={`w-full border rounded px-3 py-1.5 text-sm resize-none focus:outline-none ${
                      isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300 focus:border-[#00f2ff]/30' : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-[#0088cc]/30'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>情绪</label>
                    <select
                      value={edit.emotion}
                      onChange={e => updateEdit('emotion', e.target.value)}
                      className={`w-full border rounded px-2 py-1.5 text-xs focus:outline-none ${
                        isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300 focus:border-[#00f2ff]/30' : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-[#0088cc]/30'
                      }`}
                    >
                      {Object.keys(EMOTION_COLORS).map(key => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>地点类型</label>
                    <select
                      value={edit.placeType}
                      onChange={e => updateEdit('placeType', e.target.value)}
                      className={`w-full border rounded px-2 py-1.5 text-xs focus:outline-none ${
                        isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300 focus:border-[#00f2ff]/30' : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-[#0088cc]/30'
                      }`}
                    >
                      <option value="家">🏠 家</option>
                      <option value="学校">🏫 学校</option>
                      <option value="公园">🌳 公园</option>
                      <option value="游乐场">🎡 游乐场</option>
                      <option value="商场">🛍️ 商场</option>
                      <option value="其他">📍 其他</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>地标</label>
                  <input
                    type="text"
                    value={edit.landmark}
                    onChange={e => updateEdit('landmark', e.target.value)}
                    className={`w-full border rounded px-3 py-1.5 text-xs focus:outline-none ${
                      isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300 focus:border-[#00f2ff]/30' : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-[#0088cc]/30'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>活动</label>
                  <input
                    type="text"
                    value={edit.activity}
                    onChange={e => updateEdit('activity', e.target.value)}
                    className={`w-full border rounded px-3 py-1.5 text-xs focus:outline-none ${
                      isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300 focus:border-[#00f2ff]/30' : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-[#0088cc]/30'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>故事线</label>
                  <input
                    type="text"
                    value={edit.storyline}
                    onChange={e => updateEdit('storyline', e.target.value)}
                    className={`w-full border rounded px-3 py-1.5 text-xs focus:outline-none ${
                      isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300 focus:border-[#00f2ff]/30' : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-[#0088cc]/30'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>人物（用、分隔）</label>
                  <input
                    type="text"
                    value={edit.persons}
                    onChange={e => updateEdit('persons', e.target.value)}
                    className={`w-full border rounded px-3 py-1.5 text-xs focus:outline-none ${
                      isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300 focus:border-[#00f2ff]/30' : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-[#0088cc]/30'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>知识标签（用、分隔）</label>
                  <input
                    type="text"
                    value={edit.knowledge}
                    onChange={e => updateEdit('knowledge', e.target.value)}
                    className={`w-full border rounded px-3 py-1.5 text-xs focus:outline-none ${
                      isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300 focus:border-[#00f2ff]/30' : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-[#0088cc]/30'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>重要性 ({edit.importance.toFixed(2)})</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={edit.importance}
                    onChange={e => updateEdit('importance', parseFloat(e.target.value))}
                    className="w-full accent-[#00f2ff]"
                  />
                </div>
                <div>
                  <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>隐私级别</label>
                  <select
                    value={edit.privacyLevel}
                    onChange={e => updateEdit('privacyLevel', e.target.value)}
                    className={`w-full border rounded px-2 py-1.5 text-xs focus:outline-none ${
                      isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300 focus:border-[#00f2ff]/30' : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-[#0088cc]/30'
                    }`}
                  >
                    <option value="公开">🌐 公开</option>
                    <option value="家庭可见">👨‍👩‍👧 家庭可见</option>
                    <option value="仅自己">🔒 仅自己</option>
                    <option value="加密">🔐 加密</option>
                  </select>
                </div>
                <div>
                  <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>标签</label>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {edit.tags.map(tag => (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs cursor-pointer transition-colors ${
                          isDark ? 'bg-[#00f2ff]/10 text-[#00f2ff] hover:bg-red-500/20 hover:text-red-400' : 'bg-[#0088cc]/10 text-[#0088cc] hover:bg-red-100 hover:text-red-600'
                        }`}
                        onClick={() => setEdit(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                        title={`删除标签 "${tag}"`}
                      >
                        {tag} ×
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="输入标签，回车添加"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val && !edit.tags.includes(val)) {
                            setEdit(prev => ({ ...prev, tags: [...prev.tags, val] }));
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                      className={`flex-1 border rounded px-2 py-1 text-xs focus:outline-none ${
                        isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300 focus:border-[#00f2ff]/30' : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-[#0088cc]/30'
                      }`}
                    />
                  </div>
                </div>
              </div>
              <div className={`flex gap-2 pt-3 border-t ${isDark ? 'border-[#ffffff08]' : 'border-gray-200'}`}>
                <button onClick={saveEdit} className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${
                  isDark ? 'bg-[#00f2ff]/15 text-[#00f2ff] hover:bg-[#00f2ff]/25' : 'bg-[#0088cc]/15 text-[#0088cc] hover:bg-[#0088cc]/25'
                }`}>💾 保存</button>
                <button onClick={cancelEdit} className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${
                  isDark ? 'bg-[#ffffff08] text-gray-400 hover:bg-[#ffffff10]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>取消</button>
              </div>
            </div>
          ) : (
            <>
              {compareMode && selectedMemory.type === 'raw' ? (
                <CompareView
                  memory={selectedMemory}
                  compareTarget={compareTarget}
                  onSelectTarget={setCompareTarget}
                  allMemories={allRawMemories}
                  theme={theme}
                />
              ) : selectedMemory.type === 'raw'
                ? <RawDetail memory={selectedMemory} />
                : <InsightDetail memory={selectedMemory} />}
              <div className={`mt-6 flex gap-2 border-t pt-4 ${isDark ? 'border-[#ffffff08]' : 'border-gray-200'}`}>
                {selectedMemory.type === 'raw' && (
                  <>
                    <button
                      id="demo-edit-btn"
                      onClick={startEdit}
                      className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${
                        isDark ? 'bg-[#1a1a2e] hover:bg-[#2a2a3e] text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                      }`}
                    >✏️ 编辑</button>
                    <button
                      id="demo-compare-btn"
                      onClick={() => { setCompareMode(!compareMode); setCompareTarget(null); }}
                      className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${
                        compareMode
                          ? isDark ? 'bg-[#00f2ff]/15 text-[#00f2ff]' : 'bg-[#0088cc]/15 text-[#0088cc]'
                          : isDark ? 'bg-[#1a1a2e] hover:bg-[#2a2a3e] text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                      }`}
                    >{compareMode ? '📄 详情' : '📊 对比'}</button>
                    <button
                      id="demo-export-btn"
                      onClick={async () => {
                        const blob = await renderMemoryCard(selectedMemory);
                        const date = new Date(selectedMemory.dimensions.temporal.timestamp);
                        const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
                        downloadBlob(blob, `${selectedMemory.id}_${dateStr}.png`);
                      }}
                      className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${
                        isDark ? 'bg-[#1a1a2e] hover:bg-[#2a2a3e] text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                      }`}
                    >📸 导出</button>
                    <button
                      id="demo-find-similar-btn"
                      onClick={() => {
                        if (similarMemoryIds.length > 0) {
                          clearSimilar();
                        } else {
                          findSimilar(selectedMemory.id);
                        }
                      }}
                      className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${
                        similarMemoryIds.length > 0
                          ? isDark ? 'bg-[#00f2ff]/15 text-[#00f2ff]' : 'bg-[#0088cc]/15 text-[#0088cc]'
                          : isDark ? 'bg-[#1a1a2e] hover:bg-[#2a2a3e] text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                      }`}
                    >🔗 {similarMemoryIds.length > 0 ? '清除相似' : '找相似'}</button>
                  </>
                )}
                <div className="relative">
                  <button
                    onClick={() => {
                      if (confirmDelete) {
                        deleteMemory(selectedMemory.id);
                        setConfirmDelete(false);
                      } else {
                        setConfirmDelete(true);
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setFarewellMode(true);
                    }}
                    className={`px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${
                      confirmDelete
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-900/20 hover:bg-red-900/40 text-red-400'
                    }`}
                    title="右键点击进入摆渡模式（仪式性告别）"
                  >
                    {confirmDelete ? '确认删除？' : '🗑️ 删除'}
                  </button>
                </div>

                {/* Farewell mode overlay */}
                {farewellMode && selectedMemory.type === 'raw' && (
                  <div className={`fixed inset-0 z-50 flex items-center justify-center ${
                    isDark ? 'bg-black/70' : 'bg-black/50'
                  }`} onClick={(e) => { if (e.target === e.currentTarget) setFarewellMode(false); }}>
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`w-[360px] rounded-xl border shadow-2xl p-5 ${
                        isDark ? 'bg-[#1a1020] border-[#ffffff15]' : 'bg-white border-gray-200'
                      }`}
                    >
                      <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        🕊 记忆摆渡
                      </h3>
                      <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        你即将释放这段记忆。它曾在你的生命中留下痕迹，现在你选择让它自由。
                      </p>

                      <div className="mb-3">
                        <label className={`text-xs mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>告别语（可选）</label>
                        <textarea
                          value={farewellNote}
                          onChange={e => setFarewellNote(e.target.value)}
                          placeholder="写一段告别的话..."
                          rows={2}
                          className={`w-full border rounded px-2 py-1.5 text-xs resize-none ${
                            isDark ? 'bg-[#0a0a0f] border-[#ffffff08] text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        />
                      </div>

                      <div className="mb-4">
                        <label className={`text-xs mb-1.5 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>释放方式</label>
                        <div className="flex gap-2">
                          {([
                            { value: '深海' as const, emoji: '🌊', label: '沉入深海' },
                            { value: '星光' as const, emoji: '🔥', label: '化为星光' },
                            { value: '微风' as const, emoji: '🌬', label: '随风飘散' },
                          ]).map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => setFarewellStyle(opt.value)}
                              className={`flex-1 py-2 rounded-lg text-xs text-center cursor-pointer transition-colors ${
                                farewellStyle === opt.value
                                  ? isDark ? 'bg-[#ffb800]/15 text-[#ffb800] border border-[#ffb800]/30' : 'bg-amber-100 text-amber-700 border border-amber-300'
                                  : isDark ? 'bg-[#ffffff05] text-gray-400 hover:bg-[#ffffff08]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {opt.emoji} {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            farewellMemory(selectedMemory.id, farewellNote, farewellStyle);
                            setFarewellMode(false);
                            setFarewellNote('');
                          }}
                          className="flex-1 px-3 py-2 rounded-lg text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 cursor-pointer transition-colors"
                        >
                          🕊 释放记忆
                        </button>
                        <button
                          onClick={() => setFarewellMode(false)}
                          className={`px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                            isDark ? 'bg-[#ffffff08] text-gray-400 hover:bg-[#ffffff12]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          取消
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}