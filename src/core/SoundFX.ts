export class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private ensureContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Tạo White Noise buffer để tổng hợp tiếng gió chém kiếm (Air Slash) và tiếng nổ
   */
  private createNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
    const bufferSize = Math.floor(ctx.sampleRate * durationSec);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Tiếng phóng kiếm khí mỗi khi gõ đúng 1 phím Romaji
   */
  public playKeySlash(comboPitchBoost = 0): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Tiếng gió xé (Filtered White Noise)
    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(ctx, 0.07);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800 + comboPitchBoost * 80, now);
    filter.frequency.exponentialRampToValueAtTime(4200, now + 0.065);
    filter.Q.value = 3.0;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.16, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    // 2. Tiếng thép ngân nhẹ (Katana Ring)
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    const baseFreq = 920 + Math.min(comboPitchBoost * 25, 600);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.45, now + 0.055);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.11, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  /**
   * Tiếng kim loại va chạm "KENG" khi hoàn thành 1 âm tiết Kana
   */
  public playSyllableClang(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const partials = [1380, 2140, 3420];

    partials.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx === 0 ? 'sine' : 'square';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.96, now + 0.14);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.07 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    });
  }

  /**
   * Tiếng nhát chém kết liễu (Crescent Blade Slash + Nổ hạt ánh sáng)
   */
  public playKillSlash(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Tiếng KENG sắc bén của Katana
    const metalFreqs = [1760, 2640, 4180, 5200];
    metalFreqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.08, now + 0.28);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.09 / (i + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.29);
    });

    // 2. Tiếng nổ trầm (Sub-bass impact)
    const bass = ctx.createOscillator();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(160, now);
    bass.frequency.exponentialRampToValueAtTime(36, now + 0.24);

    const bassGain = ctx.createGain();
    bassGain.gain.setValueAtTime(0.32, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    bass.connect(bassGain);
    bassGain.connect(ctx.destination);
    bass.start(now);
    bass.stop(now + 0.26);

    // 3. Tiếng gió chém bán nguyệt
    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(ctx, 0.22);

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(3200, now);
    bandpass.frequency.exponentialRampToValueAtTime(600, now + 0.22);
    bandpass.Q.value = 1.8;

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.24, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    noise.connect(bandpass);
    bandpass.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(now);
  }

  /**
   * Tiếng Phá Giáp Kanji (Armor Break - Phím Tab)
   */
  public playArmorBreak(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tiếng khiên sắt vỡ vụn
    const shatterFreqs = [880, 1320, 1980, 2950, 4400];
    shatterFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.015);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.55, now + 0.32);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.09, now + idx * 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.015);
      osc.stop(now + 0.35);
    });

    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(ctx, 0.28);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(1500, now);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.26, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    noise.connect(hp);
    hp.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(now);
  }

  /**
   * Tiếng Tuyệt Kỹ "Thu Kiếm - Iaijutsu" (Nhất Đao Lưỡng Đoạn)
   */
  public playIaijutsuUltimate(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Tiếng tra kiếm vào vỏ "KACHIN"
    const click = ctx.createOscillator();
    click.type = 'sine';
    click.frequency.setValueAtTime(3600, now);
    click.frequency.exponentialRampToValueAtTime(1800, now + 0.08);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.25, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    click.connect(clickGain);
    clickGain.connect(ctx.destination);
    click.start(now);
    click.stop(now + 0.09);

    // 2. Loạt nhát chém xé toạc không gian
    for (let i = 0; i < 5; i++) {
      const delay = 0.06 + i * 0.055;
      const noise = ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(ctx, 0.18);

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(2400 + i * 400, now + delay);
      bp.frequency.exponentialRampToValueAtTime(750, now + delay + 0.18);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.25, now + delay);
      g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);

      noise.connect(bp);
      bp.connect(g);
      g.connect(ctx.destination);
      noise.start(now + delay);
    }

    // 3. Tiếng sấm kết liễu toàn màn hình
    const sub = ctx.createOscillator();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(120, now + 0.1);
    sub.frequency.exponentialRampToValueAtTime(28, now + 0.65);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.35, now + 0.1);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now + 0.1);
    sub.stop(now + 0.66);
  }

  /**
   * Tiếng gõ sai phím
   */
  public playError(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(95, now + 0.11);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Tiếng bị quái chạm vào người
   */
  public playDamage(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.35);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.37);
  }
}

