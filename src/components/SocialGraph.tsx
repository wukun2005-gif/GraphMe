import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { generateSocialGraph, type SocialNode } from '../utils/socialUtils';
import { EMOTION_COLORS } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SocialGraph({ open, onClose }: Props) {
  const { rawMemories, theme, selectMemory } = useAppState();
  const isDark = theme === 'dark';
  const [hoveredNode, setHoveredNode] = useState<SocialNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<SocialNode | null>(null);

  const graph = useMemo(() => generateSocialGraph(rawMemories), [rawMemories]);

  const centerX = 200;
  const centerY = 200;
  const maxCount = Math.max(...graph.nodes.map(n => n.count), 1);

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
                🕸️ 关系星图
              </h2>
              <button
                onClick={onClose}
                className={`text-lg leading-none cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
              >
                ✕
              </button>
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {graph.summaryText}
            </p>
          </div>

          {/* SVG Graph */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <svg viewBox="0 0 400 400" className="w-full max-w-[360px] mx-auto">
              {/* Edges */}
              {graph.edges.map((edge, i) => {
                const fromNode = graph.nodes.find(n => n.name === edge.from);
                const toNode = graph.nodes.find(n => n.name === edge.to);
                if (!fromNode || !toNode) return null;

                const fi = graph.nodes.indexOf(fromNode);
                const ti = graph.nodes.indexOf(toNode);
                const angle1 = (fi / graph.nodes.length) * Math.PI * 2 - Math.PI / 2;
                const angle2 = (ti / graph.nodes.length) * Math.PI * 2 - Math.PI / 2;
                const r1 = 60 + (1 - fromNode.count / maxCount) * 100;
                const r2 = 60 + (1 - toNode.count / maxCount) * 100;

                return (
                  <line
                    key={i}
                    x1={centerX + Math.cos(angle1) * r1}
                    y1={centerY + Math.sin(angle1) * r1}
                    x2={centerX + Math.cos(angle2) * r2}
                    y2={centerY + Math.sin(angle2) * r2}
                    stroke={isDark ? '#ffffff' : '#000000'}
                    strokeWidth={0.5 + edge.coOccurrence * 0.5}
                    opacity={0.1 + edge.coOccurrence * 0.05}
                  />
                );
              })}

              {/* Center (user) */}
              <circle cx={centerX} cy={centerY} r={20} fill={isDark ? '#00f2ff' : '#0088cc'} opacity={0.2} />
              <text x={centerX} y={centerY + 4} textAnchor="middle" fill={isDark ? '#ffffff' : '#1a1a1a'} fontSize={12} fontWeight="bold">
                你
              </text>

              {/* Nodes */}
              {graph.nodes.map((node, i) => {
                const angle = (i / graph.nodes.length) * Math.PI * 2 - Math.PI / 2;
                const r = 60 + (1 - node.count / maxCount) * 100;
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;
                const nodeR = 8 + (node.count / maxCount) * 12;
                const isHovered = hoveredNode?.name === node.name;
                const isSelected = selectedNode?.name === node.name;

                return (
                  <g
                    key={node.name}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => setSelectedNode(isSelected ? null : node)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isHovered && (
                      <circle cx={x} cy={y} r={nodeR + 4} fill="none" stroke={node.emotionColor} strokeWidth={1.5} opacity={0.5} />
                    )}
                    <circle cx={x} cy={y} r={nodeR} fill={node.emotionColor} opacity={isHovered ? 0.6 : 0.35} />
                    <text
                      x={x}
                      y={y + nodeR + 12}
                      textAnchor="middle"
                      fill={isDark ? '#ffffff' : '#1a1a1a'}
                      fontSize={9}
                      opacity={isHovered ? 1 : 0.7}
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Tooltip */}
            {hoveredNode && (
              <div className={`mt-2 p-2 rounded-lg border text-xs ${
                isDark ? 'bg-[#ffffff05] border-[#ffffff08]' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredNode.emotionColor }} />
                  <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{hoveredNode.name}</span>
                </div>
                <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {hoveredNode.count} 条记忆 · 主导情绪{hoveredNode.dominantEmotion} · 亲密度 {hoveredNode.avgIntimacy}
                </p>
              </div>
            )}

            {/* Selected node details */}
            {selectedNode && (
              <div className={`mt-3 p-3 rounded-lg border ${isDark ? 'bg-[#ffffff03] border-[#ffffff08]' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {selectedNode.name} 的记忆
                </h4>
                <div className="space-y-1">
                  {selectedNode.memoryIds.slice(0, 5).map(id => {
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
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
