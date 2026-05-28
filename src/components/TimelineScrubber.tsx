import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useAppState } from '../store/AppContext';

export default function TimelineScrubber() {
  const { rawMemories, theme, timeRangeFilter, setTimeRangeFilter, detailOpen } = useAppState();
  const isDark = theme === 'dark';
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);

  const range = useMemo(() => {
    if (rawMemories.length === 0) return { min: 0, max: 1 };
    const timestamps = rawMemories.map(m => m.dimensions.temporal.timestamp);
    return { min: Math.min(...timestamps), max: Math.max(...timestamps) };
  }, [rawMemories]);

  const currentFilter = timeRangeFilter || [range.min, range.max];
  const filterRef = useRef(currentFilter);
  filterRef.current = currentFilter;

  const toPercent = useCallback((ts: number) => {
    if (range.max === range.min) return 0;
    return ((ts - range.min) / (range.max - range.min)) * 100;
  }, [range]);

  const fromPercent = useCallback((pct: number) => {
    return range.min + (pct / 100) * (range.max - range.min);
  }, [range]);

  const handleMouseDown = useCallback((handle: 'start' | 'end') => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(handle);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const ts = fromPercent(pct);
      const f = filterRef.current;
      const newRange = dragging === 'start'
        ? [Math.min(ts, f[1]), f[1]] as [number, number]
        : [f[0], Math.max(ts, f[0])] as [number, number];
      setTimeRangeFilter(newRange);
    };
    const handleUp = () => setDragging(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, fromPercent, setTimeRangeFilter]);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const isFiltered = timeRangeFilter !== null;
  const startPct = toPercent(currentFilter[0]);
  const endPct = toPercent(currentFilter[1]);

  // Count memories in range
  const inRangeCount = useMemo(() => {
    return rawMemories.filter(m => {
      const ts = m.dimensions.temporal.timestamp;
      return ts >= currentFilter[0] && ts <= currentFilter[1];
    }).length;
  }, [rawMemories, currentFilter]);

  return (
    <div className={`absolute bottom-14 left-[240px] right-4 z-10 transition-all duration-300 ${
      detailOpen ? 'right-[436px]' : 'right-4'
    }`}>
      <div className={`px-4 py-2.5 rounded-xl backdrop-blur-md border shadow-lg ${
        isDark ? 'bg-[#0d1525] border-[#ffffff08]' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {formatDate(currentFilter[0])}
          </span>

          <div ref={trackRef} className="relative flex-1 h-6 flex items-center">
            {/* Track background */}
            <div className={`absolute inset-x-0 h-1.5 rounded-full ${isDark ? 'bg-[#ffffff08]' : 'bg-gray-200'}`} />

            {/* Active range */}
            <div
              className="absolute h-1.5 rounded-full bg-[#00f2ff]/30"
              style={{ left: `${startPct}%`, right: `${100 - endPct}%` }}
            />

            {/* Memory dots on track */}
            {rawMemories.map(m => {
              const pct = toPercent(m.dimensions.temporal.timestamp);
              const inRange = m.dimensions.temporal.timestamp >= currentFilter[0] && m.dimensions.temporal.timestamp <= currentFilter[1];
              return (
                <div
                  key={m.id}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    left: `${pct}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: m.color,
                    opacity: inRange ? 0.6 : 0.15,
                  }}
                />
              );
            })}

            {/* Start handle */}
            <div
              onMouseDown={handleMouseDown('start')}
              className={`absolute w-3.5 h-3.5 rounded-full border-2 cursor-ew-resize transition-colors z-10 ${
                dragging === 'start' ? 'scale-110' : ''
              }`}
              style={{
                left: `${startPct}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: isDark ? '#0d1525' : '#fff',
                borderColor: '#00f2ff',
              }}
            />

            {/* End handle */}
            <div
              onMouseDown={handleMouseDown('end')}
              className={`absolute w-3.5 h-3.5 rounded-full border-2 cursor-ew-resize transition-colors z-10 ${
                dragging === 'end' ? 'scale-110' : ''
              }`}
              style={{
                left: `${endPct}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: isDark ? '#0d1525' : '#fff',
                borderColor: '#00f2ff',
              }}
            />
          </div>

          <span className={`text-[10px] flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {formatDate(currentFilter[1])}
          </span>

          {isFiltered && (
            <button
              onClick={() => setTimeRangeFilter(null)}
              className={`text-[10px] px-2 py-0.5 rounded cursor-pointer flex-shrink-0 transition-colors ${
                isDark ? 'bg-[#00f2ff]/10 text-[#00f2ff] hover:bg-[#00f2ff]/20' : 'bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20'
              }`}
            >
              全部
            </button>
          )}

          <span className={`text-[10px] flex-shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            {inRangeCount} 条
          </span>
        </div>
      </div>
    </div>
  );
}
