/**
 * Web Audio API 合成器 — 根据情绪分布实时合成环境音
 *
 * 设计原则：
 * - 柔和的环境音，不是刺耳的噪音
 * - 根据情绪分布动态变化
 * - 使用低频嗡鸣 + 和弦叠加
 */

export type EmotionDistribution = {
  [key: string]: { count: number; avgIntensity: number };
};

// 和弦频率（低频，柔和）
const CHORDS = {
  major: [130.81, 164.81, 196.00], // C3, E3, G3
  minor: [130.81, 155.56, 196.00], // C3, Eb3, G3
  ambient: [110.00, 146.83, 174.61], // A2, D3, F3
};

// 情绪到和弦类型的映射
const EMOTION_CHORD_MAP: Record<string, keyof typeof CHORDS> = {
  '快乐': 'major',
  '好奇': 'major',
  '感激': 'major',
  '骄傲': 'major',
  '悲伤': 'minor',
  '愤怒': 'minor',
  '恐惧': 'minor',
  '厌恶': 'minor',
  '沮丧': 'minor',
  '惊讶': 'ambient',
  '中性': 'ambient',
  '思念': 'ambient',
};

export class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private gains: GainNode[] = [];
  private isPlaying = false;
  private currentDistribution: EmotionDistribution = {};
  private updateTimer: ReturnType<typeof setInterval> | null = null;

  async start() {
    if (this.isPlaying) return;

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);

    // Resume context if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.isPlaying = true;

    // Fade in master volume
    this.masterGain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 2);

    // Create initial ambient sounds
    this.createAmbientLayer();

    // Start periodic update
    this.updateTimer = setInterval(() => {
      this.updateSounds();
    }, 3000); // Update every 3 seconds
  }

  stop() {
    if (!this.isPlaying || !this.ctx) return;

    // Stop update timer
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }

    // Fade out
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
    }

    // Clean up oscillators after fade
    setTimeout(() => {
      this.oscillators.forEach(osc => {
        try { osc.stop(); } catch {}
      });
      this.oscillators = [];
      this.gains = [];
      this.ctx?.close();
      this.ctx = null;
      this.masterGain = null;
      this.isPlaying = false;
    }, 1100);
  }

  updateDistribution(distribution: EmotionDistribution) {
    this.currentDistribution = distribution;
  }

  private createAmbientLayer() {
    if (!this.ctx || !this.masterGain) return;

    // Create 3 oscillators for a soft ambient chord
    const baseFreqs = CHORDS.ambient;

    baseFreqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.value = freq;

      // Very soft gain
      gain.gain.value = 0.03 / (i + 1);

      // Low pass filter for warmth
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      filter.Q.value = 0.5;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start();

      this.oscillators.push(osc);
      this.gains.push(gain);
    });

    // Add a subtle LFO for movement
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // Very slow
    lfoGain.gain.value = 5; // Subtle frequency modulation

    lfo.connect(lfoGain);
    lfoGain.connect(this.oscillators[0].frequency);
    lfo.start();
    this.oscillators.push(lfo);
  }

  private updateSounds() {
    if (!this.ctx || !this.isPlaying) return;

    const totalParticles = Object.values(this.currentDistribution).reduce((sum, d) => sum + d.count, 0);

    if (totalParticles === 0) {
      // No particles visible - very quiet ambient
      this.gains.forEach((gain, i) => {
        gain.gain.linearRampToValueAtTime(0.01 / (i + 1), this.ctx!.currentTime + 1);
      });
      return;
    }

    // Find dominant emotion
    const dominantEntry = Object.entries(this.currentDistribution)
      .filter(([_, d]) => d.count > 0)
      .sort((a, b) => b[1].count - a[1].count)[0];

    if (!dominantEntry) return;

    const [emotion, data] = dominantEntry;
    const chordType = EMOTION_CHORD_MAP[emotion] || 'ambient';
    const targetFreqs = CHORDS[chordType];

    // Smoothly transition to new chord
    this.oscillators.slice(0, 3).forEach((osc, i) => {
      osc.frequency.linearRampToValueAtTime(
        targetFreqs[i],
        this.ctx!.currentTime + 2
      );
    });

    // Adjust volume based on particle count and emotion intensity
    const volumeFactor = Math.min(1, totalParticles / 20) * data.avgIntensity;
    this.gains.forEach((gain, i) => {
      const targetGain = 0.02 + volumeFactor * 0.04 / (i + 1);
      gain.gain.linearRampToValueAtTime(targetGain, this.ctx!.currentTime + 1);
    });
  }
}

// Singleton instance
let engine: SoundscapeEngine | null = null;

export function getSoundscapeEngine(): SoundscapeEngine {
  if (!engine) {
    engine = new SoundscapeEngine();
  }
  return engine;
}

export function destroySoundscapeEngine() {
  if (engine) {
    engine.stop();
    engine = null;
  }
}
