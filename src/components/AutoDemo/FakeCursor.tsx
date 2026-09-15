import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Tooltip from './Tooltip';
import { Z_INDEX } from '../../types';
import { useI18n } from '../../i18n';

interface FakeCursorProps {
  isPlaying: boolean;
  onStop: () => void;
}

export default function FakeCursor({ isPlaying, onStop }: FakeCursorProps) {
  const { t, language } = useI18n();
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isClicking, setIsClicking] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const [progress, setProgress] = useState(0);

  const stopDemoRef = useRef<() => void>(() => {});

  stopDemoRef.current = () => {
    setTooltipText('');
    setPosition({ x: -100, y: -100 });
    setProgress(0);
    onStop();
  };

  const stopDemo = useCallback(() => stopDemoRef.current(), []);

  useEffect(() => {
    if (!isPlaying) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') stopDemo(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPlaying, stopDemo]);

  useEffect(() => {
    if (!isPlaying) return;

    let timeoutIds: ReturnType<typeof setTimeout>[] = [];
    let isCancelled = false;

    const TOTAL_DURATION = 300_000;
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      setProgress(Math.min(100, ((Date.now() - startTime) / TOTAL_DURATION) * 100));
    }, 200);

    const wait = (ms: number) => new Promise<void>(resolve => {
      const id = setTimeout(resolve, ms); timeoutIds.push(id);
    });

    const checkCancelled = () => { if (isCancelled) throw new Error('__CANCELLED__'); };

    const moveTo = async (x: number, y: number, text: string) => {
      checkCancelled(); setTooltipText(text); setPosition({ x, y }); await wait(700); checkCancelled();
    };

    const moveToCenter = async (text: string, waitAfter = 2000) => {
      checkCancelled(); setTooltipText(text);
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      await wait(700); checkCancelled(); await wait(waitAfter); checkCancelled();
    };

    const moveAndClick = async (elementId: string, text: string, waitAfter = 2000): Promise<boolean> => {
      checkCancelled();
      for (let attempt = 0; attempt < 3; attempt++) {
        const el = document.getElementById(elementId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setTooltipText(text);
            setPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            await wait(700); checkCancelled();
            setIsClicking(true); await wait(250); checkCancelled();
            el.click(); setIsClicking(false);
            await wait(waitAfter); return true;
          }
        }
        await wait(800); checkCancelled();
      }
      console.warn(`[FakeCursor] Element "${elementId}" not found after 3 attempts, skipping step: "${text}"`);
      return false;
    };

    const requireClick = async (id: string, text: string, waitAfter = 2000) => {
      if (!(await moveAndClick(id, text, waitAfter))) throw new Error(`"${id}" not found`);
    };

    const tryClick = async (id: string, text: string, waitAfter = 2000) => {
      await moveAndClick(id, text, waitAfter);
    };

    const dispatchCameraMove = (action = 'rotate') => {
      window.dispatchEvent(new CustomEvent('demo-camera-move', { detail: { action } }));
    };

    const dispatchSelectMemory = (memoryId: string) => {
      window.dispatchEvent(new CustomEvent('demo-select-memory', { detail: { id: memoryId } }));
    };

    const dispatchResetFilters = () => {
      window.dispatchEvent(new CustomEvent('demo-reset-filters'));
    };

    const getParticleScreenPos = async (particleId: string): Promise<{ x: number; y: number } | null> => {
      const tryOnce = (): Promise<{ x: number; y: number } | null> => new Promise(resolve => {
        let done = false;
        const handler = (e: Event) => {
          const d = (e as CustomEvent).detail as Record<string, { x: number; y: number }>;
          if (d[particleId] && !done) { done = true; window.removeEventListener('demo-particle-positions', handler); resolve(d[particleId]); }
        };
        window.addEventListener('demo-particle-positions', handler);
        window.dispatchEvent(new CustomEvent('demo-request-particle-positions'));
        setTimeout(() => { if (!done) { done = true; window.removeEventListener('demo-particle-positions', handler); resolve(null); } }, 500);
      });
      let pos = await tryOnce(); if (pos) return pos;
      await wait(1500); checkCancelled(); pos = await tryOnce(); if (pos) return pos;
      await wait(3000); checkCancelled(); return await tryOnce();
    };

    const clickParticle = async (particleId: string, text: string, waitAfter = 2000) => {
      checkCancelled(); setTooltipText(text);
      const pos = await getParticleScreenPos(particleId); checkCancelled();
      setPosition(pos ? { x: pos.x, y: pos.y } : { x: window.innerWidth / 2, y: window.innerHeight / 2 });
      await wait(700); checkCancelled();
      dispatchSelectMemory(particleId);
      setIsClicking(true); await wait(250); checkCancelled();
      setIsClicking(false); await wait(waitAfter); checkCancelled();
    };

    const clickMorePanelFeature = async (featureId: string, text: string, waitAfter = 2000): Promise<boolean> => {
      checkCancelled();
      if (!(await moveAndClick('btn-more', t('more.title'), 800))) return false;
      checkCancelled();
      return await moveAndClick(`btn-${featureId}`, text, waitAfter);
    };

    const collapseNav = async () => {
      checkCancelled();
      await moveAndClick('nav-collapse', '', 500);
    };

    const typeInSearchInput = async (text: string, waitAfter = 2000) => {
      checkCancelled();
      const input = document.getElementById('demo-search-input') as HTMLInputElement | null;
      if (!input) return;
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (!nativeInputValueSetter) return;
      nativeInputValueSetter.call(input, text);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await wait(waitAfter); checkCancelled();
    };

    // ═══════════════════════════════════════════════
    //  5-MINUTE COMPETITION DEMO
    //  Timing: moveToCenter=700+w, moveAndClick=950+w
    //  clickParticle≈5700+w, clickMorePanelFeature≈2700+w
    // ═══════════════════════════════════════════════

    const runSequence = async () => {
      try {
      checkCancelled();

      // ─── INTRO (0:00–0:16, 16s) ─────────────────
      await wait(1500);
      await moveToCenter(t('demo.step.intro1'), 3500);
      await moveToCenter(t('demo.step.intro2'), 3500);
      dispatchCameraMove('rotate');
      await moveToCenter(t('demo.step.intro3'), 4000);

      // ─── CORE MAGIC (0:16–0:48, 32s) ─────────────
      await clickParticle('mem_007', t('demo.step.clickParticle'), 3500);
      await moveTo(window.innerWidth - 210, window.innerHeight * 0.35,
        t('demo.step.dimensions'));
      await wait(4000);
      await requireClick('demo-find-similar-btn', t('demo.step.findSimilar'), 3000);
      window.dispatchEvent(new CustomEvent('demo-close-detail'));
      await wait(1500);
      // Reset filters (selecting a memory auto-sets category filter via Navigation)
      dispatchResetFilters();
      await wait(500); checkCancelled();
      const legendOk = await moveAndClick('nav-legend', t('demo.step.legend'), 1500);
      if (legendOk) {
        await tryClick('emotion-filter-快乐', t('demo.step.emotionFilter'), 2500);
        await tryClick('emotion-filter-快乐', t('demo.step.emotionFilterCancel'), 1000);
        await moveAndClick('nav-legend', '', 800);
        await collapseNav();
      }

      // ─── DIMENSION VIEWS ──────────────────────────
      await moveToCenter(t('demo.step.viewSwitch'), 3000);
      await moveToCenter(t('demo.step.viewSwitchDesc'), 3000);
      dispatchCameraMove('zoom-out');
      await wait(2000); checkCancelled();
      await requireClick(`btn-view-${t('view.familyFull')}`, t('demo.step.switchFamily'), 2000);
      await wait(4000); checkCancelled();
      await moveToCenter(t('demo.step.familyDesc'), 3000);
      await requireClick(`btn-view-${t('view.learningFull')}`, t('demo.step.switchLearning'), 2000);
      await wait(4000); checkCancelled();
      await moveToCenter(t('demo.step.learningDesc'), 3000);
      await requireClick(`btn-view-${t('view.emotionFull')}`, t('demo.step.switchEmotion'), 2000);
      await wait(4000); checkCancelled();
      await moveToCenter(t('demo.step.emotionDesc'), 3000);
      await requireClick(`btn-view-${t('view.globalFull')}`, t('demo.step.switchGlobal'), 2000);
      await wait(3000); checkCancelled();
      await moveToCenter(t('demo.step.fourViews'), 2500);

      // ─── CATEGORY NAV ─────────────────────────────
      await tryClick('nav-expand', t('demo.step.navExpand'), 500);
      await moveToCenter(t('demo.step.navCategory'), 2500);
      await moveAndClick('nav-cat-家庭生活', t('demo.step.clickFamily'), 1500);
      await wait(2000); checkCancelled();
      dispatchCameraMove('zoom-out');
      await wait(1500); checkCancelled();
      await moveToCenter(t('demo.step.familyRecluster'), 3000);
      await moveAndClick('nav-cat-学习与成长', t('demo.step.clickLearning'), 1500);
      await wait(2000); checkCancelled();
      await moveToCenter(t('demo.step.learningRecluster'), 3000);
      await moveAndClick('nav-cat-社交与情感', t('demo.step.clickSocial'), 1500);
      await wait(2000); checkCancelled();
      await moveToCenter(t('demo.step.socialRecluster'), 3000);
      // Reset all filters to restore full universe
      dispatchResetFilters();
      await wait(1000); checkCancelled();
      await moveToCenter(t('demo.step.allReturn'), 2500);
      await collapseNav();

      // ─── SEARCH (1:40–1:48, 8s) ─────────────────
      await requireClick('btn-search', t('demo.step.search'), 2000);
      await moveToCenter(t('demo.step.searchDesc'), 2500);
      await moveTo(window.innerWidth / 2, window.innerHeight * 0.08, '');
      await wait(300); checkCancelled();
      await typeInSearchInput(language === 'en' ? 'coding' : '编程', 3000);
      await moveToCenter(t('demo.step.searchResult'), 3000);
      await moveToCenter(t('demo.step.searchMulti'), 2500);
      await typeInSearchInput('', 500);
      dispatchResetFilters();
      await requireClick('btn-search', '', 800);

      // ─── MEMORY BANK (0:56–1:08, 12s) ────────────
      await moveToCenter('', 300);
      await requireClick('memory-bank-trigger', t('demo.step.memoryBank'), 2000);
      await moveToCenter(t('demo.step.memoryBankTimeline'), 3000);
      await moveToCenter(t('demo.step.memoryBankStats'), 2500);
      await tryClick('memory-bank-close', '', 1000);

      // ─── CHAT (1:08–1:37, 29s) ───────────────────
      await requireClick('chat-trigger', t('demo.step.chat'), 2500);
      await moveToCenter(t('demo.step.chatDesc'), 3500);
      await tryClick('chat-qa-0', t('demo.step.chatQuestion'), 2500);
      await moveToCenter(t('demo.step.chatAnswer'), 2500);
      await tryClick('chat-link-0', t('demo.step.chatLink'), 2500);
      await moveToCenter(t('demo.step.chatTrace'), 3500);
      await tryClick('chat-close', '', 1000);
      // Close detail panel that may have opened from memory link click
      window.dispatchEvent(new CustomEvent('demo-close-detail'));
      dispatchResetFilters();
      await wait(800);

      // ─── AI SUPERPOWERS (1:37–3:43, 126s) ───────
      // ChatGPT Import (28s)
      await tryClick('nav-expand', t('demo.step.navExpand'), 500);
      await requireClick('nav-memory-mgr', t('demo.step.chatgptImport'), 2000);
      await requireClick('nav-chatgpt-import', t('demo.step.chatgptImportDesc'), 4000);
      await moveToCenter(t('demo.step.chatgptPipeline'), 3000);
      await moveToCenter(t('demo.step.chatgptAuto'), 2500);
      await tryClick('nav-memory-mgr', '', 1000);
      await collapseNav();

      // Storyboard (60s) ★ COMPLETE
      await tryClick('nav-expand', t('demo.step.navExpand'), 500);
      await requireClick('nav-storyboard', t('demo.step.storyboard'), 2500);
      await requireClick('storyweaver-play-btn', t('demo.step.storyboardPlay'), 3000);
      await moveToCenter(t('demo.step.storyboardTimeline'), 4000);
      await moveToCenter(t('demo.step.storyboardChapter'), 3500);
      // Click on a visible memory node to demonstrate interaction
      await clickParticle('mem_003', t('demo.step.storyboardClick'), 3000);
      window.dispatchEvent(new CustomEvent('demo-close-detail'));
      await wait(1000);
      await moveToCenter(t('demo.step.storyboardAuto'), 3000);
      await tryClick('nav-storyboard', '', 1000);
      await collapseNav();

      // Cinema (18s)
      await requireClick('btn-cinema', t('demo.step.cinema'), 2500);
      await moveToCenter(t('demo.step.cinemaDesc'), 3500);
      await moveToCenter(t('demo.step.cinemaRange'), 2500);
      await tryClick('cinema-close', '', 1000);

      // Value Dashboard (60s) ★ COMPLETE with all tabs
      await requireClick('val-dash-trigger', t('demo.step.valueDashboard'), 2500);
      await moveToCenter(t('demo.step.valueTop5'), 4000);
      await requireClick('val-dash-health-tab', t('demo.step.valueHealth'), 3000);
      await requireClick('val-dash-decay-tab', t('demo.step.valueDecay'), 3000);
      await tryClick('demo-review-btn', t('demo.step.valueReview'), 2500);
      await requireClick('val-dash-journey-tab', t('demo.step.valueJourney'), 3000);
      await moveToCenter(t('demo.step.valueJourneyDesc'), 3000);
      await requireClick('val-dash-weekly-tab', t('demo.step.valueWeekly'), 3000);
      await moveToCenter(t('demo.step.valueWeeklyDesc'), 3000);
      await requireClick('val-dash-flywheel-tab', t('demo.step.valueFlywheel'), 3000);
      await moveToCenter(t('demo.step.valueFlywheelDesc'), 3500);
      await moveToCenter(t('demo.step.valueFlywheelUser'), 3000);
      await tryClick('val-dash-close', '', 1000);

      // ─── EMOTIONAL PEAK (3:43–4:20, 37s) ────────
      try {
        const ok = await clickMorePanelFeature('serendipity', t('demo.step.serendipity'), 3000);
        if (ok) {
          await moveToCenter(t('demo.step.serendipityDesc'), 3000);
          await tryClick('serendipity-refresh', t('demo.step.serendipityRefresh'), 2500);
          await moveToCenter(t('demo.step.serendipityNew'), 2500);
          await moveToCenter(t('demo.step.serendipityInsight'), 2000);
          window.dispatchEvent(new CustomEvent('demo-close-serendipity'));
          await wait(800);
        }
      } catch (e) { /* serendipity feature may not exist */ console.debug?.('[FakeCursor] Serendipity demo skipped:', e); }

      try {
        const ok = await clickMorePanelFeature('dream', t('demo.step.dream'), 2500);
        if (ok) {
          await moveToCenter(t('demo.step.dreamDesc'), 3000);
          await moveToCenter(t('demo.step.dreamNarrative'), 2500);
          await tryClick('demo-dream-sources', t('demo.step.dreamSources'), 2000);
          window.dispatchEvent(new CustomEvent('demo-close-dream'));
          await wait(500);
        }
      } catch (e) { /* dream feature may not exist */ console.debug?.('[FakeCursor] Dream demo skipped:', e); }

      // ─── FLYWHEEL (4:20–5:00, 40s) ───────────────
      try {
        const ok = await clickMorePanelFeature('annual', t('demo.step.annual'), 2500);
        if (ok) {
          await moveToCenter(t('demo.step.annualDesc'), 3500);
          window.dispatchEvent(new CustomEvent('demo-close-annual-report'));
          await wait(800);
        }
      } catch (e) { /* annual report feature may not exist */ console.debug?.('[FakeCursor] Annual report demo skipped:', e); }

      // ─── TAGLINE EXIT ─────────────────────────────
      setTooltipText(t('demo.step.outro1'));
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      setProgress(100);
      await wait(6000);

      setTooltipText(t('demo.step.outro2'));
      await wait(6000);

      setTooltipText(t('demo.step.outro3'));
      await wait(6000);

      dispatchCameraMove('rotate');
      await wait(6500);

      setTooltipText('');
      await wait(5500);
      if (!isCancelled) stopDemo();

      } catch (err: any) {
        if (err?.message === '__CANCELLED__') return;
        console.error('FakeCursor demo error:', err);
        setTooltipText(`Demo stopped: ${err?.message || 'unknown error'}`);
        setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        await wait(3000);
        if (!isCancelled) stopDemo();
      }
    };

    runSequence();

    return () => {
      isCancelled = true;
      clearInterval(progressInterval);
      timeoutIds.forEach(clearTimeout);
    };
  }, [isPlaying, t, language]);

  if (!isPlaying) return null;

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-1 bg-black/20" style={{ zIndex: Z_INDEX.DEMO_BAR }}>
        <motion.div className="h-full bg-gradient-to-r from-[#00f2ff] to-[#ffb800]"
          animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
      </div>
      <Tooltip text={tooltipText} position={position} />
      <motion.div className="fixed pointer-events-none"
        animate={{ x: position.x, y: position.y, scale: isClicking ? 0.7 : 1 }}
        transition={{ duration: 0.6, ease: 'anticipate' }}
        style={{ left: 0, top: 0, marginLeft: -12, marginTop: -12, zIndex: Z_INDEX.DEMO }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 2L20 10.6667L12 13L10 21L4 2Z" fill="white" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
        {isClicking && (
          <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-[#00f2ff]"
            initial={{ scale: 0.5, opacity: 1 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 0.4 }} />
        )}
      </motion.div>
    </>
  );
}
