import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { generateTerrain, getZoomLevels, type TerrainNode } from '../utils/terrainUtils';
import { generateLetter, type GeneratedLetter, type LetterSegment } from '../utils/letterUtils';

interface Props {
  open: boolean;
  onClose: () => void;
}

// Pre-compute star positions for terrain background
const TERRAIN_STARS = Array.from({ length: 50 }, (_, i) => ({
  x: ((i * 37 + 13) % 100),
  y: ((i * 53 + 7) % 100),
  size: 1 + ((i * 17) % 15) / 10,
  color: ['#00f2ff', '#ffb800', '#a78bfa', '#ffffff'][i % 4],
  duration: 3 + ((i * 23) % 30) / 10,
  delay: ((i * 11) % 20) / 10,
}));

export default function CognitiveTerrain({ open, onClose }: Props) {
  const { rawMemories, insightMemories, theme, selectMemory } = useAppState();
  const isDark = theme === 'dark';
  const svgRef = useRef<SVGSVGElement>(null);

  const terrain = useMemo(
    () => generateTerrain(rawMemories, insightMemories),
    [rawMemories, insightMemories]
  );

  const zoomLevels = useMemo(() => getZoomLevels(terrain), [terrain]);

  const [currentZoom, setCurrentZoom] = useState(zoomLevels[0]);
  const [hoveredNode, setHoveredNode] = useState<TerrainNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showLetter, setShowLetter] = useState(false);
  const [letter, setLetter] = useState<GeneratedLetter | null>(null);
  const [letterIndex, setLetterIndex] = useState(0);
  const [letterText, setLetterText] = useState('');

  // Drag (pan) state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setCurrentZoom(zoomLevels[0]);
      setShowLetter(false);
      setLetter(null);
      setLetterIndex(0);
      setLetterText('');
      setPanOffset({ x: 0, y: 0 });
    }
  }, [open, zoomLevels]);

  const handleNodeClick = useCallback((node: TerrainNode) => {
    const zl = zoomLevels.find(z => z.id === node.id);
    if (zl) setCurrentZoom(zl);
    else setCurrentZoom({ id: node.id, label: node.label, cx: node.x, cy: node.y, scale: 2 });
    setPanOffset({ x: 0, y: 0 });
  }, [zoomLevels]);

  const handleResetZoom = useCallback(() => {
    setCurrentZoom(zoomLevels[0]);
    setPanOffset({ x: 0, y: 0 });
  }, [zoomLevels]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    // Handle drag pan
    if (isDragging.current) {
      const dx = (e.clientX - dragStart.current.x) / currentZoom.scale;
      const dy = (e.clientY - dragStart.current.y) / currentZoom.scale;
      setPanOffset({
        x: panStart.current.x - dx,
        y: panStart.current.y - dy,
      });
    }
  }, [currentZoom.scale]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start drag on left button and not on interactive elements
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'button' || target.closest('button')) return;

    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...panOffset };
    (e.currentTarget as HTMLElement).style.cursor = 'grabbing';
  }, [panOffset]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    isDragging.current = false;
    (e.currentTarget as HTMLElement).style.cursor = 'grab';
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setCurrentZoom(prev => {
      const newScale = Math.max(0.5, Math.min(4, prev.scale + delta));
      return { ...prev, scale: newScale };
    });
  }, []);

  // Letter generation
  const handleGenerateLetter = useCallback(() => {
    const l = generateLetter(rawMemories, insightMemories);
    setLetter(l);
    setShowLetter(true);
    setLetterIndex(0);
    setLetterText('');
  }, [rawMemories, insightMemories]);

  // Typewriter effect
  useEffect(() => {
    if (!showLetter || !letter) return;

    const allText = [
      letter.greeting + '\n\n',
      ...letter.segments.map(s => s.text),
      '\n\n' + letter.closing,
    ].join('');

    if (letterIndex >= allText.length) return;

    const timer = setTimeout(() => {
      setLetterText(allText.slice(0, letterIndex + 1));
      setLetterIndex(i => i + 1);
    }, 25);

    return () => clearTimeout(timer);
  }, [showLetter, letter, letterIndex]);

  // Save as PNG
  const handleSavePNG = useCallback(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graphme-cognitive-terrain-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Compute viewBox based on zoom and pan
  const viewBox = useMemo(() => {
    const w = terrain.width / currentZoom.scale;
    const h = terrain.height / currentZoom.scale;
    const x = currentZoom.cx - w / 2 + panOffset.x;
    const y = currentZoom.cy - h / 2 + panOffset.y;
    return `${x} ${y} ${w} ${h}`;
  }, [currentZoom, terrain, panOffset]);

  const renderableNodes = terrain.nodes.filter(n => n.type !== 'insight-ruin' || currentZoom.scale < 1.5);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Click-outside backdrop */}
          <div className="fixed inset-0 z-40" onClick={onClose} />

          {/* Centering container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center" onMouseMove={handleMouseMove}>

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="w-[750px] max-w-[92vw] h-[75vh] rounded-2xl overflow-hidden
                         backdrop-blur-xl border shadow-2xl flex flex-col"
              style={{
                background: isDark ? 'rgba(8,12,28,0.92)' : 'rgba(255,255,255,0.95)',
                borderColor: isDark ? '#ffffff12' : '#e5e7eb',
                boxShadow: '0 0 60px rgba(0,242,255,0.08), 0 25px 50px rgba(0,0,0,0.4)',
              }}
            >
              {/* Internal starfield */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                <div className="absolute inset-0" style={{
                  background: `radial-gradient(ellipse at 30% 40%, ${isDark ? '#00f2ff08' : '#0088cc05'} 0%, transparent 60%),
                               radial-gradient(ellipse at 70% 60%, ${isDark ? '#ffb80006' : '#ffb80003'} 0%, transparent 50%)`,
                }} />
                {TERRAIN_STARS.map((star, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: `${star.x}%`, top: `${star.y}%`,
                      width: `${star.size}px`, height: `${star.size}px`,
                      background: star.color,
                      boxShadow: `0 0 ${star.size * 2}px ${star.color}50`,
                    }}
                    animate={{ opacity: [0.1, 0.6, 0.1] }}
                    transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
                  />
                ))}
              </div>

              {/* Header */}
              <div className={`relative z-10 flex items-center justify-between px-5 py-2.5 border-b ${
                isDark ? 'border-[#ffffff08]' : 'border-gray-200'
              }`}>
            <div className="flex items-center gap-3">
              <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🗺️ 认知地图
              </h2>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {rawMemories.length} 条记忆 · {insightMemories.length} 个洞察
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom breadcrumb */}
              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
                isDark ? 'bg-[#ffffff08] text-gray-400' : 'bg-gray-100 text-gray-500'
              }`}>
                {currentZoom.id !== 'overview' && (
                  <button
                    onClick={handleResetZoom}
                    className="hover:underline cursor-pointer"
                  >
                    全景
                  </button>
                )}
                {currentZoom.id !== 'overview' && (
                  <>
                    <span>/</span>
                    <span className={isDark ? 'text-[#00f2ff]' : 'text-blue-600'}>
                      {currentZoom.label}
                    </span>
                  </>
                )}
                {currentZoom.id === 'overview' && <span>全景</span>}
              </div>

              <button
                id="terrain-letter"
                onClick={handleGenerateLetter}
                className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-[#ffb800]/10 text-[#ffb800] hover:bg-[#ffb800]/20 border border-[#ffb800]/20'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                💌 让小哥为你写封信
              </button>

              <button
                id="terrain-save"
                onClick={handleSavePNG}
                className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-[#ffffff08] text-gray-400 hover:bg-[#ffffff15] border border-[#ffffff08]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                💾 导出地图
              </button>

              <button
                id="terrain-close"
                onClick={onClose}
                className={`text-lg leading-none cursor-pointer ml-2 ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Main content */}
          <div
            className="relative z-10 flex-1 overflow-hidden cursor-grab"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ perspective: '1200px' }}
          >
            {/* SVG Terrain */}
            <svg
              ref={svgRef}
              viewBox={viewBox}
              className="w-full h-full"
              style={{ transform: 'rotateX(12deg)', transformOrigin: 'center 60%' }}
            >
              <defs>
                {/* Glow filter */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Fog filter */}
                <filter id="fog-blur">
                  <feGaussianBlur stdDeviation="20" />
                </filter>

                {/* Mountain shadow — ground shadow beneath 3D nodes */}
                <filter id="mountain-shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
                  <feOffset dx="3" dy="8" result="offsetBlur" />
                  <feFlood floodColor="#000000" floodOpacity="0.3" result="color" />
                  <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />
                  <feMerge>
                    <feMergeNode in="shadow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Mountain dome gradient — creates 3D sphere illusion */}
                <radialGradient id="mountain-dome" cx="40%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="white" stopOpacity="0" />
                </radialGradient>

                {/* River gradient */}
                <linearGradient id="river-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={isDark ? '#00f2ff' : '#0088cc'} stopOpacity="0.3" />
                  <stop offset="50%" stopColor={isDark ? '#00f2ff' : '#0088cc'} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={isDark ? '#00f2ff' : '#0088cc'} stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Background */}
              <rect x="-500" y="-500" width="2200" height="1900" fill={isDark ? '#060b18' : '#f0f4f8'} />

              {/* Climate zones (background) */}
              {terrain.climateZones.map((zone, i) => (
                <g key={`climate-${i}`}>
                  <circle
                    cx={zone.x}
                    cy={zone.y}
                    r={zone.radius}
                    fill={zone.color}
                    opacity={0.06 * zone.intensity}
                    filter="url(#fog-blur)"
                  />
                  {currentZoom.scale >= 1.5 && (
                    <text
                      x={zone.x}
                      y={zone.y + zone.radius + 15}
                      textAnchor="middle"
                      fill={zone.color}
                      opacity={0.4}
                      fontSize={10}
                    >
                      {zone.emotion}
                    </text>
                  )}
                </g>
              ))}

              {/* Fog zones */}
              {terrain.fogZones.map((fog, i) => (
                <circle
                  key={`fog-${i}`}
                  cx={fog.x}
                  cy={fog.y}
                  r={fog.radius}
                  fill={isDark ? '#ffffff' : '#000000'}
                  opacity={fog.opacity * 0.15}
                  filter="url(#fog-blur)"
                />
              ))}

              {/* Connections (rivers & bridges) */}
              {terrain.connections.map((conn, i) => {
                const fromNode = terrain.nodes.find(n => n.id === conn.from);
                const toNode = terrain.nodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;

                const midX = (fromNode.x + toNode.x) / 2;
                const midY = (fromNode.y + toNode.y) / 2 - 20;

                if (conn.type === 'river') {
                  return (
                    <g key={`conn-${i}`}>
                      <path
                        d={`M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY} ${toNode.x} ${toNode.y}`}
                        fill="none"
                        stroke={isDark ? '#00f2ff' : '#0088cc'}
                        strokeWidth={1 + conn.strength * 2}
                        opacity={0.2 + conn.strength * 0.3}
                      />
                      {/* Animated water dots */}
                      <circle r={2} fill={isDark ? '#00f2ff' : '#0088cc'} opacity={0.5}>
                        <animateMotion
                          dur={`${3 + i * 0.5}s`}
                          repeatCount="indefinite"
                          path={`M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY} ${toNode.x} ${toNode.y}`}
                        />
                      </circle>
                    </g>
                  );
                }

                return (
                  <path
                    key={`conn-${i}`}
                    d={`M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY} ${toNode.x} ${toNode.y}`}
                    fill="none"
                    stroke={isDark ? '#ffb800' : '#d97706'}
                    strokeWidth={1 + conn.strength}
                    opacity={0.15 + conn.strength * 0.2}
                    strokeDasharray="6 4"
                  />
                );
              })}

              {/* Nodes */}
              {renderableNodes.map(node => {
                const isHovered = hoveredNode?.id === node.id;
                const isRuin = node.type === 'insight-ruin';

                return (
                  <g
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => handleNodeClick(node)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Glow ring */}
                    {isHovered && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.radius + 8}
                        fill="none"
                        stroke={node.color}
                        strokeWidth={2}
                        opacity={0.5}
                        filter="url(#glow)"
                      />
                    )}

                    {/* Node body */}
                    {isRuin ? (
                      // Insight ruin: dashed circle
                      <>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.radius}
                          fill="none"
                          stroke={node.color}
                          strokeWidth={1}
                          strokeDasharray="4 3"
                          opacity={node.opacity}
                        />
                        <text
                          x={node.x}
                          y={node.y + 3}
                          textAnchor="middle"
                          fill={node.color}
                          fontSize={8}
                          opacity={0.5}
                        >
                          ?
                        </text>
                      </>
                    ) : node.type === 'concept' ? (
                      // Concept mountain: 3D dome with shadow
                      <g filter="url(#mountain-shadow)">
                        {/* Base circle — mountain body */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.radius}
                          fill={node.color}
                          opacity={node.opacity * 0.2}
                          stroke={node.color}
                          strokeWidth={1.5}
                          strokeOpacity={0.4}
                        />
                        {/* Inner dome — 3D highlight */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.radius * 0.7}
                          fill={node.color}
                          opacity={node.opacity * 0.35}
                        />
                        {/* Dome specular highlight */}
                        <circle
                          cx={node.x - node.radius * 0.2}
                          cy={node.y - node.radius * 0.2}
                          r={node.radius * 0.4}
                          fill="url(#mountain-dome)"
                          opacity={0.6}
                        />
                        {/* Mountain peak icon */}
                        <text
                          x={node.x}
                          y={node.y - node.radius - 8}
                          textAnchor="middle"
                          fontSize={12}
                          opacity={0.7}
                        >
                          ⛰️
                        </text>
                      </g>
                    ) : (
                      // Person island: 3D island with shadow
                      <g filter="url(#mountain-shadow)">
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.radius}
                          fill={node.color}
                          opacity={node.opacity * 0.25}
                          stroke={node.color}
                          strokeWidth={1.5}
                          strokeOpacity={0.5}
                          strokeDasharray={node.type === 'person' ? '3 2' : 'none'}
                        />
                        {/* Island dome highlight */}
                        <circle
                          cx={node.x - node.radius * 0.15}
                          cy={node.y - node.radius * 0.15}
                          r={node.radius * 0.5}
                          fill="url(#mountain-dome)"
                          opacity={0.4}
                        />
                        <text
                          x={node.x}
                          y={node.y - node.radius - 6}
                          textAnchor="middle"
                          fontSize={11}
                          opacity={0.7}
                        >
                          🏝️
                        </text>
                      </g>
                    )}

                    {/* Label */}
                    <text
                      x={node.x}
                      y={node.y + (isRuin ? -node.radius - 6 : node.radius + 14)}
                      textAnchor="middle"
                      fill={isDark ? '#ffffff' : '#1a1a1a'}
                      fontSize={isHovered ? 11 : 9}
                      opacity={isHovered ? 1 : 0.7}
                      style={{ transition: 'font-size 0.2s, opacity 0.2s' }}
                    >
                      {node.label}
                    </text>

                    {/* Memory count */}
                    {!isRuin && node.memoryCount > 0 && (
                      <text
                        x={node.x}
                        y={node.y + node.radius + 24}
                        textAnchor="middle"
                        fill={isDark ? '#666' : '#999'}
                        fontSize={8}
                      >
                        {node.memoryCount} 条记忆
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Center decoration — user avatar placeholder */}
              <g>
                <circle
                  cx={terrain.centerX}
                  cy={terrain.centerY}
                  r={25}
                  fill={isDark ? '#ffb800' : '#f59e0b'}
                  opacity={0.2}
                  stroke={isDark ? '#ffb800' : '#f59e0b'}
                  strokeWidth={1.5}
                  strokeOpacity={0.4}
                />
                <text
                  x={terrain.centerX}
                  y={terrain.centerY + 5}
                  textAnchor="middle"
                  fontSize={16}
                  opacity={0.7}
                >
                  👤
                </text>
                <text
                  x={terrain.centerX}
                  y={terrain.centerY + 38}
                  textAnchor="middle"
                  fill={isDark ? '#ffffff' : '#1a1a1a'}
                  fontSize={10}
                  opacity={0.6}
                >
                  你
                </text>
              </g>
            </svg>

            {/* Hover tooltip */}
            {hoveredNode && !showLetter && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute pointer-events-none z-20 rounded-xl border shadow-lg px-4 py-3 max-w-[260px] ${
                  isDark ? 'bg-[#0d1525] border-[#ffffff10] text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
                style={{
                  left: mousePos.x + 16,
                  top: mousePos.y - 10,
                  transform: mousePos.x > 800 ? 'translateX(-120%)' : 'none',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: hoveredNode.color, opacity: hoveredNode.opacity }}
                  />
                  <span className="text-sm font-medium">{hoveredNode.label}</span>
                </div>
                {hoveredNode.type !== 'insight-ruin' && (
                  <>
                    <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {hoveredNode.type === 'concept' ? '⛰️ 概念山脉' : '🏝️ 人物岛屿'}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      包含 {hoveredNode.memoryCount} 条记忆
                    </p>
                    {hoveredNode.memories.length > 0 && (
                      <div className={`mt-2 pt-2 border-t text-xs ${isDark ? 'border-[#ffffff08]' : 'border-gray-100'}`}>
                        <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          代表记忆：
                        </p>
                        {hoveredNode.memories.slice(0, 2).map(m => (
                          <p key={m.id} className={`truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            · {m.label}
                          </p>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {hoveredNode.type === 'insight-ruin' && (
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    🔍 洞察遗址（已被新版本替代）
                  </p>
                )}
              </motion.div>
            )}

            {/* Letter overlay */}
            <AnimatePresence>
              {showLetter && letter && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  className={`absolute inset-0 z-30 flex items-center justify-center ${
                    isDark ? 'bg-black/60' : 'bg-black/40'
                  } backdrop-blur-sm`}
                  onClick={() => setShowLetter(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    onClick={e => e.stopPropagation()}
                    className={`relative w-full max-w-lg mx-4 rounded-2xl border shadow-2xl overflow-hidden ${
                      isDark ? 'bg-[#0d0d1a] border-[#ffffff10]' : 'bg-white border-gray-200'
                    }`}
                  >
                    {/* Letter header */}
                    <div className={`px-6 pt-5 pb-3 border-b ${isDark ? 'border-[#ffffff08]' : 'border-gray-100'}`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`text-base font-medium ${isDark ? 'text-[#ffb800]' : 'text-amber-700'}`}>
                          💌 来自小哥的信
                        </h3>
                        <button
                          onClick={() => setShowLetter(false)}
                          className={`text-lg cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
                        >
                          ✕
                        </button>
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        基于 {letter.memoryCount} 条记忆和 {letter.insightCount} 个洞察生成
                      </p>
                    </div>

                    {/* Letter body */}
                    <div className={`px-6 py-5 max-h-[60vh] overflow-y-auto ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <div className="text-sm leading-relaxed font-serif">
                        {/* Greeting */}
                        <p className="mb-3">{letter.greeting}</p>

                        {/* Segments with memory links */}
                        <div className="whitespace-pre-wrap">
                          {(() => {
                            // Calculate cumulative text for typewriter effect
                            let charCount = 0;
                            const allText = letter.segments.map(s => s.text).join('');
                            const revealed = letterIndex - (letter.greeting + '\n\n').length;

                            return letter.segments.map((seg, i) => {
                              const segStart = charCount;
                              charCount += seg.text.length;
                              const segEnd = charCount;

                              // How much of this segment is revealed
                              const revealedInSeg = Math.max(0, Math.min(seg.text.length, revealed - segStart));
                              if (revealedInSeg <= 0) return null;

                              const visibleText = seg.text.slice(0, revealedInSeg);

                              if (seg.type === 'memory-link' && seg.memoryId) {
                                return (
                                  <span
                                    key={i}
                                    onClick={() => {
                                      const mem = rawMemories.find(m => m.id === seg.memoryId);
                                      if (mem) {
                                        selectMemory(mem);
                                        setShowLetter(false);
                                      }
                                    }}
                                    className={`cursor-pointer underline decoration-dotted underline-offset-2 transition-colors ${
                                      isDark ? 'text-[#00f2ff] hover:text-[#00f2ff]/80' : 'text-blue-600 hover:text-blue-500'
                                    }`}
                                    title={`点击查看: ${seg.memoryLabel || seg.memoryId}`}
                                  >
                                    {visibleText}
                                  </span>
                                );
                              }

                              return <span key={i}>{visibleText}</span>;
                            });
                          })()}
                          {letterIndex < [
                            letter.greeting + '\n\n',
                            ...letter.segments.map(s => s.text),
                            '\n\n' + letter.closing,
                          ].join('').length && (
                            <span className="inline-block w-0.5 h-4 bg-current animate-pulse ml-0.5" />
                          )}
                        </div>

                        {/* Closing */}
                        {letterIndex >= [
                          letter.greeting + '\n\n',
                          ...letter.segments.map(s => s.text),
                        ].join('').length && (
                          <p className="mt-3 text-right">{letter.closing}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Zoom controls */}
            <div className={`absolute bottom-4 left-4 flex flex-col gap-1 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <button
                onClick={() => {
                  const idx = zoomLevels.findIndex(z => z.id === currentZoom.id);
                  if (idx > 0) setCurrentZoom(zoomLevels[idx - 1]);
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer text-sm ${
                  isDark ? 'bg-[#ffffff08] hover:bg-[#ffffff15]' : 'bg-white/80 hover:bg-white shadow-sm'
                }`}
              >
                −
              </button>
              <button
                onClick={() => {
                  const idx = zoomLevels.findIndex(z => z.id === currentZoom.id);
                  if (idx < zoomLevels.length - 1) setCurrentZoom(zoomLevels[idx + 1]);
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer text-sm ${
                  isDark ? 'bg-[#ffffff08] hover:bg-[#ffffff15]' : 'bg-white/80 hover:bg-white shadow-sm'
                }`}
              >
                +
              </button>
            </div>

            {/* Legend */}
            <div className={`absolute bottom-4 right-4 text-xs space-y-1 px-3 py-2 rounded-lg ${
              isDark ? 'bg-[#0d1525]/80 text-gray-500' : 'bg-white/80 text-gray-400'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-current opacity-50" />
                <span>⛰️ 概念山脉</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full border border-current opacity-50" style={{ borderStyle: 'dashed' }} />
                <span>🏝️ 人物岛屿</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full border border-current opacity-30" style={{ borderStyle: 'dotted' }} />
                <span>🔍 洞察遗址</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 bg-current opacity-40" />
                <span>知识河流</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 bg-current opacity-30" style={{ borderTop: '1px dashed currentColor' }} />
                <span>关联桥梁</span>
              </div>
            </div>
          </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
