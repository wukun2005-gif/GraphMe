import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { getSurpriseCandidate } from '../utils/valueUtils';
import { EMOTION_COLORS } from '../types';
import type { RawMemory } from '../types';
import { useI18n } from '../i18n';
import { joinContentT, emotionNameT } from '../i18n/dataTranslations';
import { memoryLabelT, memorySummaryT } from '../i18n/memoryData';

const STORAGE_KEY = 'graphme-surprise-last-date';

function getLastSurpriseDate(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch (e) {
    console.warn('[MemorySurprise] Failed to read last surprise date:', e);
    return '';
  }
}

function setLastSurpriseDate(date: string) {
  try {
    localStorage.setItem(STORAGE_KEY, date);
  } catch (e) {
    console.warn('[MemorySurprise] Failed to save last surprise date:', e);
  }
}

export default function MemorySurprise() {
  const { rawMemories, selectMemory, reinforceMemory, addToast, theme } = useAppState();
  const { t, language, tList } = useI18n();
  const warmMessages = useMemo(() => tList('surprise.warmMessages'), [tList]);
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const [candidate, setCandidate] = useState<RawMemory | null>(null);
  const [warmMessage, setWarmMessage] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = getLastSurpriseDate();
    if (lastDate === today) return; // Already shown today
    if (rawMemories.length === 0) return;

    const c = getSurpriseCandidate(rawMemories);
    if (!c) return;

    setCandidate(c);
    setWarmMessage(warmMessages[Math.floor(Math.random() * warmMessages.length)]);
    setShowBox(true);
  }, [rawMemories]);

  const handleOpen = () => {
    setIsOpen(true);
    const today = new Date().toISOString().slice(0, 10);
    setLastSurpriseDate(today);
  };

  const handleReinforce = () => {
    if (candidate) {
      reinforceMemory(candidate.id);
      addToast(t('surprise.revisited'), 'success');
    }
    handleClose();
  };

  const handleClose = () => {
    setShowBox(false);
    setIsOpen(false);
    setCandidate(null);
  };

  const handleViewDetail = () => {
    if (candidate) {
      selectMemory(candidate);
      handleClose();
    }
  };

  const handleNext = () => {
    const next = getSurpriseCandidate(rawMemories);
    if (next) {
      setCandidate(next);
      setWarmMessage(warmMessages[Math.floor(Math.random() * warmMessages.length)]);
    }
  };

  if (!showBox || !candidate) return null;

  const emotionColor = EMOTION_COLORS[candidate.dimensions.emotional.primary] || '#888';
  const daysAgo = Math.floor((Date.now() - candidate.dimensions.temporal.timestamp) / (1000 * 60 * 60 * 24));

  return (
    <AnimatePresence>
      {showBox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backdropFilter: 'blur(4px)', backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <AnimatePresence mode="wait">
            {!isOpen ? (
              <motion.div
                key="box"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 10, opacity: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="cursor-pointer select-none"
                id="demo-surprise-open"
                onClick={handleOpen}
              >
                <div className="relative">
                  {/* Gift box */}
                  <div
                    className={`w-32 h-32 rounded-2xl border-2 flex items-center justify-center text-6xl shadow-2xl ${
                      isDark ? 'bg-[#1a1020] border-[#ffb800]/30' : 'bg-white border-amber-300'
                    }`}
                    style={{ boxShadow: `0 0 40px ${emotionColor}30` }}
                  >
                    🎁
                  </div>
                  {/* Sparkle particles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full bg-amber-400"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                        y: [0, -20 - Math.random() * 20],
                      }}
                      transition={{
                        duration: 1.5 + Math.random(),
                        repeat: Infinity,
                        delay: Math.random() * 1,
                      }}
                    />
                  ))}
                  <p className={`text-center mt-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t('surprise.giftTitle')}
                  </p>
                  <p className={`text-center mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {t('surprise.giftSubtitle')}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="card"
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className={`w-[340px] rounded-2xl border shadow-2xl overflow-hidden ${
                  isDark ? 'bg-[#1a1020] border-[#ffffff15]' : 'bg-white border-gray-200'
                }`}
              >
                {/* Header with emotion color */}
                <div
                  className="px-5 py-4"
                  style={{ background: `linear-gradient(135deg, ${emotionColor}20, ${emotionColor}05)` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">✨</span>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {t('surprise.memoryGift')}
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {warmMessage}
                  </p>
                </div>

                {/* Memory card */}
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: emotionColor }}
                    />
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {memoryLabelT(language, candidate.id, candidate.label)}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {memorySummaryT(language, candidate.id, candidate.summary).length > 100
                      ? memorySummaryT(language, candidate.id, candidate.summary).slice(0, 100) + '...'
                      : memorySummaryT(language, candidate.id, candidate.summary)}
                  </p>
                  <div className={`flex items-center gap-3 text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <span>{emotionNameT(language, candidate.dimensions.emotional.primary)}</span>
                    <span>·</span>
                    <span>{daysAgo > 0 ? t('common.daysAgo', { count: daysAgo }) : t('common.today')}</span>
                    {candidate.dimensions.social.persons.length > 0 && (
                      <>
                        <span>·</span>
                        <span>👤 {joinContentT(language, candidate.dimensions.social.persons)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className={`px-5 py-3 border-t flex gap-2 ${isDark ? 'border-[#ffffff08]' : 'border-gray-100'}`}>
                  <button
                    id="demo-surprise-reinforce"
                    onClick={handleReinforce}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isDark ? 'bg-[#ffb800]/15 text-[#ffb800] hover:bg-[#ffb800]/25' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                  >
                    🔄 {t('surprise.revisit')}
                  </button>
                  <button
                    id="demo-surprise-detail"
                    onClick={handleViewDetail}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isDark ? 'bg-[#ffffff08] text-gray-400 hover:bg-[#ffffff12]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📖 {t('surprise.viewDetail')}
                  </button>
                  <button
                    id="demo-surprise-next"
                    onClick={handleNext}
                    className={`px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title={t('surprise.anotherOne')}
                  >
                    🎲
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
