import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { getGardenPlantData } from '../utils/valueUtils';
import type { GardenPlant } from '../utils/valueUtils';

export default function MemoryGarden({ onClose }: { onClose: () => void }) {
  const { rawMemories, theme, selectMemory, reinforceMemory, addToast } = useAppState();
  const isDark = theme === 'dark';
  const [selectedPlant, setSelectedPlant] = useState<GardenPlant | null>(null);
  const [wateringId, setWateringId] = useState<string | null>(null);
  const wateringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const plants = useMemo(() => getGardenPlantData(rawMemories), [rawMemories]);

  useEffect(() => {
    return () => { if (wateringTimerRef.current) clearTimeout(wateringTimerRef.current); };
  }, []);

  const handleWater = (plant: GardenPlant) => {
    setWateringId(plant.memory.id);
    reinforceMemory(plant.memory.id);
    addToast('已浇水，记忆恢复活力', 'success');
    if (wateringTimerRef.current) clearTimeout(wateringTimerRef.current);
    wateringTimerRef.current = setTimeout(() => setWateringId(null), 1500);
  };

  return (
    <div className={`h-full flex flex-col ${isDark ? 'bg-[#0a0f1a]' : 'bg-gradient-to-b from-sky-50 to-green-50'}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-inherit flex-shrink-0">
        <h2 className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          🌻 记忆花园
        </h2>
        <button
          onClick={onClose}
          className={`p-1 rounded transition-colors cursor-pointer ${
            isDark ? 'text-gray-400 hover:text-white hover:bg-[#ffffff10]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Garden ground */}
        <div className={`relative rounded-xl p-4 min-h-[300px] ${
          isDark ? 'bg-[#0d1a0d] border border-[#1a3a1a]' : 'bg-gradient-to-b from-green-100 to-amber-50 border border-green-200'
        }`}>
          {/* Sun */}
          <div className="absolute top-2 right-4 text-2xl animate-pulse">☀️</div>

          {/* Plants grid */}
          <div className="flex flex-wrap gap-3 justify-center pt-6">
            {plants.map((plant) => {
              const isWatering = wateringId === plant.memory.id;
              return (
                <motion.button
                  key={plant.memory.id}
                  className="relative cursor-pointer group"
                  style={{ fontSize: `${plant.size * 24}px` }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPlant(selectedPlant?.memory.id === plant.memory.id ? null : plant)}
                >
                  <motion.span
                    animate={isWatering ? {
                      scale: [1, 1.3, 1],
                      rotate: [0, -10, 10, 0],
                    } : {}}
                    transition={{ duration: 0.8 }}
                  >
                    {plant.emoji}
                  </motion.span>
                  {plant.plantType === 'wilting' && (
                    <motion.div
                      className="absolute -top-1 -right-1 text-[10px]"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      💧
                    </motion.div>
                  )}
                  {isWatering && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5 }}
                    >
                      <span className="text-lg">💧</span>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {plants.length === 0 && (
            <div className={`text-center py-12 text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              花园空空如也，去创建一些记忆吧
            </div>
          )}
        </div>

        {/* Selected plant detail */}
        <AnimatePresence>
          {selectedPlant && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className={`mt-3 p-3 rounded-lg border ${
                isDark ? 'bg-[#ffffff05] border-[#ffffff08]' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{selectedPlant.emoji}</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {selectedPlant.memory.label}
                  </span>
                  <span className="text-xs" style={{ color: selectedPlant.color }}>
                    {selectedPlant.memory.dimensions.emotional.primary}
                  </span>
                </div>
                <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedPlant.memory.summary.length > 80
                    ? selectedPlant.memory.summary.slice(0, 80) + '...'
                    : selectedPlant.memory.summary}
                </p>
                <div className={`text-[10px] mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {selectedPlant.plantType === 'wilting' && '⚠️ 这株记忆之花快枯萎了，需要浇水（重温）'}
                  {selectedPlant.plantType === 'tree' && '🌳 这是一棵里程碑之树'}
                  {selectedPlant.plantType === 'flower' && '🌸 这朵花正在盛开'}
                </div>
                <div className="flex gap-2">
                  <button
                    id="demo-garden-water"
                    onClick={() => handleWater(selectedPlant)}
                    className={`px-3 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                      isDark ? 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    💧 浇水（重温）
                  </button>
                  <button
                    id="demo-garden-detail"
                    onClick={() => { selectMemory(selectedPlant.memory); onClose(); }}
                    className={`px-3 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                      isDark ? 'bg-[#ffffff08] text-gray-400 hover:bg-[#ffffff12]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📖 查看详情
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
