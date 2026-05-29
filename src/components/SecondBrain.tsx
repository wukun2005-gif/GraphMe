import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { generateNetworkData, type NetworkNode } from '../utils/networkUtils';
import { CATEGORY_LABELS, EMOTION_COLORS } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  trend: '#00f2ff',
  belief: '#ffb800',
  relationship: '#ff6b6b',
  preference: '#44ccaa',
  habit: '#cc44ff',
  growth: '#88aa44',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SecondBrain({ open, onClose }: Props) {
  const { insightMemories, theme, selectMemory } = useAppState();
  const isDark = theme === 'dark';
  const svgRef = useRef<SVGSVGElement>(null);

  const network = useMemo(() => generateNetworkData(insightMemories), [insightMemories]);

  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [zoomNode, setZoomNode] = useState<NetworkNode | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleNodeClick = useCallback((node: NetworkNode) => {
    const ins = insightMemories.find(i => i.id === node.id);
    if (ins) {
      selectMemory(ins);
      setZoomNode(node);
    }
  }, [insightMemories, selectMemory]);

  const handleResetZoom = useCallback(() => setZoomNode(null), []);

  // Stats
  const stats = useMemo(() => {
    const active = network.nodes.filter(n => !n.deprecated);
    const avgConf = active.length > 0 ? active.reduce((s, n) => s + n.confidence, 0) / active.length : 0;
    const highestCategory = network.islands.reduce((best, island) => {
      const count = network.nodes.filter(n => n.category === island.category && !n.deprecated).length;
      return count > best.count ? { ...island, count } : best;
    }, { label: '', count: 0 });
    return { total: active.length, avgConf, highestCategory: highestCategory.label };
  }, [network]);

  // ViewBox
  const viewBox = useMemo(() => {
    if (zoomNode) {
      const w = 300;
      const h = 200;
      return `${zoomNode.x - w / 2} ${zoomNode.y - h / 2} ${w} ${h}`;
    }
    return `50 50 900 600`;
  }, [zoomNode]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col"
          onMouseMove={handleMouseMove}
        >
          <div className={`absolute inset-0 ${isDark ? 'bg-[#060b18]' : 'bg-[#f0f4f8]'}`} />

          {/* Header */}
          <div className={`relative z-10 flex items-center justify-between px-6 py-3 border-b ${
            isDark ? 'border-[#ffffff08] bg-[#0a101f]/80' : 'border-gray-200 bg-white/80'
          } backdrop-blur-sm`}>
            <div className="flex items-center gap-3">
              <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🧠 第二大脑
              </h2>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {stats.total} 个活跃洞察 · 平均置信度 {Math.round(stats.avgConf * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              {zoomNode && (
                <button
                  onClick={handleResetZoom}
                  className={`text-xs px-2 py-1 rounded cursor-pointer ${
                    isDark ? 'bg-[#ffffff08] text-gray-400 hover:text-gray-200' : 'bg-gray-100 text-gray-600 hover:text-gray-800'
                  }`}
                >
                  ← 返回全景
                </button>
              )}
              <button
                onClick={onClose}
                className={`text-lg leading-none cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
              >
                ✕
              </button>
            </div>
          </div>

          {/* SVG Network */}
          <div className="relative flex-1 overflow-hidden">
            <svg
              ref={svgRef}
              viewBox={viewBox}
              className="w-full h-full"
              style={{ transition: 'viewBox 0.6s ease' }}
            >
              <defs>
                <filter id="brain-glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Island backgrounds */}
              {network.islands.map(island => {
                const count = network.nodes.filter(n => n.category === island.category && !n.deprecated).length;
                if (count === 0) return null;
                const color = CATEGORY_COLORS[island.category] || '#888';

                return (
                  <g key={island.category}>
                    <circle
                      cx={island.cx}
                      cy={island.cy}
                      r={50 + count * 5}
                      fill={color}
                      opacity={0.04}
                    />
                    <text
                      x={island.cx}
                      y={island.cy - 55 - count * 5}
                      textAnchor="middle"
                      fill={color}
                      fontSize={10}
                      opacity={0.6}
                    >
                      {island.label}
                    </text>
                    <text
                      x={island.cx}
                      y={island.cy - 42 - count * 5}
                      textAnchor="middle"
                      fill={isDark ? '#666' : '#999'}
                      fontSize={8}
                    >
                      {count} 个洞察
                    </text>
                  </g>
                );
              })}

              {/* Edges */}
              {network.edges.map((edge, i) => {
                const from = network.nodes.find(n => n.id === edge.from);
                const to = network.nodes.find(n => n.id === edge.to);
                if (!from || !to) return null;

                const color = edge.type === 'causal' ? '#ff6b6b' : edge.type === 'supporting' ? '#00f2ff' : '#888';
                const dashArray = edge.type === 'causal' ? 'none' : edge.type === 'supporting' ? '6 3' : '3 3';

                return (
                  <line
                    key={i}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={color}
                    strokeWidth={0.5 + edge.weight * 2}
                    opacity={0.15 + edge.weight * 0.25}
                    strokeDasharray={dashArray}
                  />
                );
              })}

              {/* Nodes */}
              {network.nodes.map(node => {
                const isHovered = hoveredNode?.id === node.id;
                const color = CATEGORY_COLORS[node.category] || '#888';
                const radius = 6 + node.confidence * 10;

                if (node.deprecated) {
                  return (
                    <g
                      key={node.id}
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius * 0.7}
                        fill="none"
                        stroke="#666"
                        strokeWidth={0.5}
                        strokeDasharray="3 2"
                        opacity={0.3}
                      />
                    </g>
                  );
                }

                return (
                  <g
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => handleNodeClick(node)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isHovered && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius + 5}
                        fill="none"
                        stroke={color}
                        strokeWidth={1.5}
                        opacity={0.5}
                        filter="url(#brain-glow)"
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius}
                      fill={color}
                      opacity={isHovered ? 0.5 : 0.25}
                      stroke={color}
                      strokeWidth={1}
                      strokeOpacity={0.5}
                    />
                    {node.version > 1 && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius + 2}
                        fill="none"
                        stroke={color}
                        strokeWidth={0.5}
                        strokeOpacity={0.3}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover tooltip */}
            {hoveredNode && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute pointer-events-none z-20 rounded-xl border shadow-lg px-4 py-3 max-w-[280px] ${
                  isDark ? 'bg-[#0d1525] border-[#ffffff10] text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
                style={{
                  left: mousePos.x + 16,
                  top: mousePos.y - 10,
                  transform: mousePos.x > 700 ? 'translateX(-120%)' : 'none',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[hoveredNode.category] }} />
                  <span className="text-xs font-medium">{CATEGORY_LABELS[hoveredNode.category]}</span>
                  {hoveredNode.deprecated && <span className="text-xs text-gray-500">(已废弃)</span>}
                </div>
                <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {hoveredNode.statement}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    置信度 {Math.round(hoveredNode.confidence * 100)}%
                  </span>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    v{hoveredNode.version}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Stats bar */}
            <div className={`absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2 rounded-lg ${
              isDark ? 'bg-[#0d1525]/80 text-gray-400' : 'bg-white/80 text-gray-500'
            }`}>
              <span className="text-xs">共 {stats.total} 个活跃洞察</span>
              <span className="text-xs">平均置信度 {Math.round(stats.avgConf * 100)}%</span>
              {stats.highestCategory && (
                <span className="text-xs">最多类别：{stats.highestCategory}</span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
