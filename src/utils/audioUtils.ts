/**
 * Web Audio API 合成器 — 根据情绪分布实时合成声音
 *
 * 快乐 = 明亮谐波/C大调音阶
 * 悲伤 = 柔和低频/小调
 * 好奇 = 上升琶音
 * 粒子密度 = 音量
 * 情绪强度 = 声音丰富度
 * 空白区域 = 低沉宇宙背景嗡鸣
 */

export type EmotionDistribution = {
  [key: string]: { count: number; avgIntensity: number };
};

// C 大调音阶频率 (Hz)
const C_MAJOR = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
// A 小调音阶频率 (Hz)
const A_MINOR = [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00];

// 情绪到声音参数的映射
const EMOTION_SOUND_MAP: Record<string, { type: OscillatorType; baseFreq: number; scale: number[] }> = {
  '快乐': { type: 'sine', baseFreq: 261.63, scale: C_MAJOR },
  '悲伤': { type: 'sine', baseFreq: 220.00, scale: A_MINOR },
  '好奇': { type: 'triangle', baseFreq: 329.63, scale: C_MAJOR },
  '惊讶': { type: 'square', baseFreq: 392.00, scale: C_MAJOR },
  '愤怒': { type: 'sawtooth', baseFreq: 196.00, scale: A_MINOR },
  '恐惧': { type: 'sine', baseFreq: 174.61, scale: A_MINOR },
  '厌恶': { type: 'triangle', baseFreq: 196.00, scale: A_MINOR },
  '期待': { type: 'sine', baseFreq: 349.23, scale: C_MAJOR },
  '信任': { type: 'sine', baseFreq: 293.66, scale: C_MAJOR },
  '平静': { type: 'sine', baseFreq: 261.63, scale: C_MAJOR },
  '感激': { type: 'triangle', baseFreq: 329.63, scale: C_MAJOR },
  '困惑': { type: 'triangle', baseFreq: 246.94, scale: A_MINOR },
};

export class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private lfoOscillators: OscillatorNode[] = [];
  private isPlaying = false;
  private currentDistribution: EmotionDistribution = {};

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
    this.createAmbientDrone();
  }

  stop() {
    if (!this.isPlaying || !this.ctx) return;

    // Fade out
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    }

    // Clean up oscillators after fade
    setTimeout(() => {
      this.oscillators.forEach(osc => {
        try { osc.stop(); } catch {}
      });
      this.lfoOscillators.forEach(osc => {
        try { osc.stop(); } catch {}
      });
      this.oscillators = [];
      this.lfoOscillators = [];
      this.ctx?.close();
      this.ctx = null;
      this.masterGain = null;
      this.isPlaying = false;
    }, 600);
  }

  updateDistribution(distribution: EmotionDistribution) {
    this.currentDistribution = distribution;
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const totalParticles = Object.values(distribution).reduce((sum, d) => sum + d.count, 0);

    // Volume based on particle density (more particles = louder)
    const targetVolume = Math.min(0.3, totalParticles * 0.02);
    this.masterGain.gain.linearRampToValueAtTime(targetVolume, this.ctx.currentTime + 0.3);

    // Clear existing emotion oscillators
    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    this.oscillators = [];

    // Create new oscillators based on dominant emotions
    const dominantEmotions = Object.entries(distribution)
      .filter(([_, d]) => d.count > 0)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3); // Top 3 emotions

    dominantEmotions.forEach(([emotion, data], index) => {
      const soundParams = EMOTION_SOUND_MAP[emotion] || EMOTION_SOUND_MAP['平静'];
      const intensity = data.avgIntensity;

      // Create oscillator
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = soundParams.type;

      // Frequency based on emotion and some randomness
      const freqIndex = Math.floor(Math.random() * soundParams.scale.length);
      osc.frequency.value = soundParams.scale[freqIndex];

      // Gain based on emotion count and intensity
      const emotionGain = (data.count / totalParticles) * intensity * 0.3;
      gain.gain.value = emotionGain / (index + 1); // Reduce volume for secondary emotions

      // Add LFO for subtle vibrato
      const lfo = this.ctx!.createOscillator();
      const lfoGain = this.ctx!.createGain();
      lfo.frequency.value = 0.5 + Math.random() * 2; // 0.5-2.5 Hz
      lfoGain.gain.value = 2; // 2 Hz vibrato depth
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start();

      this.oscillators.push(osc);
      this.lfoOscillators.push(lfo);
    });
  }

  private createAmbientDrone() {
    if (!this.ctx || !this.masterGain) return;

    // Low frequency ambient drone
    const drone = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    drone.type = 'sine';
    drone.frequency.value = 55; // Low A
    droneGain.gain.value = 0.05;

    filter.type = 'lowpass';
    filter.frequency.value = 200;

    drone.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(this.masterGain);
    drone.start();

    this.oscillators.push(drone);
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
