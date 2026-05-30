import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeatureItem {
  id: string;
  emoji: string;
  label: string;
  description: string;
  onClick: () => void;
}

interface Props {
  features: FeatureItem[];
  theme: 'dark' | 'light';
  isShow: boolean;
  onClose: () => void;
}

export default function MorePanel({ features, theme, isShow, onClose }: Props) {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {isShow && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`absolute top-12 right-0 z-50 w-72 rounded-xl border shadow-xl backdrop-blur-sm overflow-hidden ${
            isDark ? 'bg-[#0d1525]/95 border-[#ffffff10]' : 'bg-white/95 border-gray-200'
          }`}
        >
          <div className={`px-4 py-2 border-b ${isDark ? 'border-[#ffffff08]' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                更多功能
              </h3>
              <button
                onClick={onClose}
                className={`text-xs cursor-pointer ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto">
            {features.map(feature => (
              <button
                key={feature.id}
                id={`btn-${feature.id}`}
                onClick={() => { feature.onClick(); onClose(); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-[#ffffff08]' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{feature.emoji}</span>
                  <div>
                    <p className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {feature.label}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
