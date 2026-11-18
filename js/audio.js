/**
 * Procedural Web Audio Horror Soundscape Engine
 * Zero external audio assets — pure Web Audio API synthesis that smoothly
 * escalates from faint fluorescent office buzz into binaural infrasound dread,
 * detuned bowed strings, accelerating heartbeat, and a cinematic climax drop.
 */
export class SoundscapeEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.initialized = false;
    this.masterGain = null;
    this.progress = 0;

    // Continuous layer gain nodes
    this.layers = {};
    this.heartbeatTimer = null;
    this.isSilenced = false;
  }

  init() {
    if (this.initialized) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);

    // Procedural dark corridor convolution reverb
    const reverb = this._createReverb(2.6, 2.8);
    const reverbGain = this.ctx.createGain();
    reverbGain.gain.value = 0.42;
    reverb.connect(reverbGain);
    reverbGain.connect(this.masterGain);
    this.reverb = reverb;

    this._buildFluorescentLayer();
    this._buildSubDroneLayer();
    this._buildDreadStringsLayer();
    this._buildStaticLayer();

    this.initialized = true;
    this._startHeartbeatLoop();
  }

  _createReverb(duration, decay) {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = this.ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    const convolver = this.ctx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  }

  _buildFluorescentLayer() {
    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 180;
    filter.Q.value = 2.2;

    const osc60 = this.ctx.createOscillator();
    osc60.type = 'sawtooth';
    osc60.frequency.value = 60;

    const osc120 = this.ctx.createOscillator();
    osc120.type = 'triangle';
    osc120.frequency.value = 120.4;

    // Subtle erratic flicker LFO
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 6.5;
    const lfoDepth = this.ctx.createGain();
    lfoDepth.gain.value = 0.004;
    lfo.connect(lfoDepth);
    lfoDepth.connect(gain.gain);

    osc60.connect(filter);
    osc120.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc60.start();
    osc120.start();
    lfo.start();
    this.layers.fluorescent = gain;
  }

  _buildSubDroneLayer() {
    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    // Binaural low-frequency beating (41Hz left vs 42.6Hz right) creates visceral physical tension
    const merger = this.ctx.createChannelMerger(2);

    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.value = 41;

    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.value = 42.6;

    const subHarmonic = this.ctx.createOscillator();
    subHarmonic.type = 'triangle';
    subHarmonic.frequency.value = 55;
    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.value = 110;
    const subHarmGain = this.ctx.createGain();
    subHarmGain.gain.value = 0.28;

    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    subHarmonic.connect(subFilter);
    subFilter.connect(subHarmGain);
    subHarmGain.connect(gain);

    merger.connect(gain);
    gain.connect(this.masterGain);

    oscL.start();
    oscR.start();
    subHarmonic.start();
    this.layers.subDrone = gain;
  }

  _buildDreadStringsLayer() {
    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    // Dissonant minor-second / tritone bowed cluster (D#3 + E3 + A3)
    const freqs = [155.56, 164.81, 220.0];
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.Q.value = 4.2;

    // Slow creepy filter sweep
    const sweepLfo = this.ctx.createOscillator();
    sweepLfo.frequency.value = 0.09;
    const sweepGain = this.ctx.createGain();
    sweepGain.gain.value = 210;
    sweepLfo.connect(sweepGain);
    sweepGain.connect(filter.frequency);

    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      osc.detune.value = (idx - 1) * 9;
      osc.connect(filter);
      osc.start();
    });

    sweepLfo.start();
    filter.connect(gain);
    gain.connect(this.reverb);
    gain.connect(this.masterGain);
    this.layers.strings = gain;
    this.layers.stringsFilter = filter;
  }

  _buildStaticLayer() {
    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1850;
    filter.Q.value = 0.9;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
    this.layers.static = gain;
  }

  _startHeartbeatLoop() {
    const beat = () => {
      if (this.enabled && !this.isSilenced && this.ctx && this.progress > 0.56 && this.progress < 0.97) {
        const intensity = Math.min(1, (this.progress - 0.56) / 0.36);
        this._triggerHeartThump(0.24 * intensity, 0);
        this._triggerHeartThump(0.16 * intensity, 0.21);
      }
      // Accelerates subtly from 56 BPM to 96 BPM near the abyss
      const bpm = 56 + Math.max(0, this.progress - 0.56) * 100;
      const intervalMs = Math.max(580, Math.round(60000 / bpm));
      this.heartbeatTimer = window.setTimeout(beat, intervalMs);
    };
    beat();
  }

  _triggerHeartThump(volume, delay) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(68, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.16);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(volume, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  enable() {
    this.init();
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.enabled = true;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(0.75, now, 0.25);
    this.update(this.progress);
    return true;
  }

  disable() {
    this.enabled = false;
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(0.0001, now, 0.15);
  }

  toggle() {
    if (this.enabled) {
      this.disable();
      return false;
    }
    return this.enable();
  }

  update(progress) {
    this.progress = Math.max(0, Math.min(1, progress));
    if (!this.initialized || !this.enabled || this.isSilenced) return;

    const now = this.ctx.currentTime;
    const p = this.progress;

    // Layer 1: Fluorescent hum ramps up in Act II-IV, fades slightly into abyss
    const fluo = p < 0.16 ? 0 : p < 0.72 ? Math.min(0.042, (p - 0.16) * 0.09) : Math.max(0.012, 0.042 - (p - 0.72) * 0.1);
    this.layers.fluorescent.gain.setTargetAtTime(fluo, now, 0.2);

    // Layer 2: Binaural infrasound sub-drone builds steadily from Act III to Climax
    const sub = p < 0.28 ? 0 : Math.min(0.32, Math.pow((p - 0.28) / 0.72, 1.4) * 0.32);
    this.layers.subDrone.gain.setTargetAtTime(sub, now, 0.25);

    // Layer 3: Bowed minor-second dread strings emerge in Act V-VII
    const str = p < 0.48 ? 0 : Math.min(0.068, Math.pow((p - 0.48) / 0.52, 1.5) * 0.068);
    this.layers.strings.gain.setTargetAtTime(str, now, 0.3);

    // Layer 4: Low CRT/tape hiss in Act VI-VII
    const stat = p < 0.68 ? 0 : Math.min(0.028, (p - 0.68) * 0.085);
    this.layers.static.gain.setTargetAtTime(stat, now, 0.2);
  }

  playNotification(isEerie = false) {
    if (!this.initialized || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = isEerie ? 'triangle' : 'sine';

    if (!isEerie) {
      // Friendly SaaS chime
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.09);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.06, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    } else {
      // Detuned unsettling descending two-tone ping
      osc.frequency.setValueAtTime(415, now);
      osc.frequency.exponentialRampToValueAtTime(389, now + 0.38);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.075, now + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    }

    osc.connect(g);
    g.connect(isEerie ? this.reverb : this.masterGain);
    osc.start(now);
    osc.stop(now + 0.58);
  }

  playGlitchBurst(duration = 0.14) {
    if (!this.initialized || !this.enabled) return;
    const now = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * duration);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (i % 19 < 10 ? 1 : 0.2);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 900;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.09, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);

    src.connect(filter);
    filter.connect(g);
    g.connect(this.masterGain);
    src.start(now);
  }

  /**
   * Anticipation beat: cuts all sound dead silent for `silenceMs`, then hits
   * a deep, cinematic horror movie bass drop + dissonant metallic screech.
   */
  playClimaxSequence(silenceMs = 700, onHitCallback = null) {
    if (!this.initialized || !this.enabled) {
      window.setTimeout(() => {
        if (onHitCallback) onHitCallback();
      }, silenceMs);
      return;
    }

    // 1. Cut everything into total dead silence (horror anticipation!)
    this.isSilenced = true;
    const now = this.ctx.currentTime;
    Object.values(this.layers).forEach((node) => {
      if (node && node.gain) {
        node.gain.cancelScheduledValues(now);
        node.gain.setTargetAtTime(0.0001, now, 0.04);
      }
    });

    // 2. Hit the cinematic horror drop after the silence beat
    window.setTimeout(() => {
      if (onHitCallback) onHitCallback();
      if (!this.ctx || !this.enabled) return;

      const hit = this.ctx.currentTime;

      // Deep cinematic sub impact (95Hz -> 24Hz)
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(98, hit);
      sub.frequency.exponentialRampToValueAtTime(24, hit + 1.8);
      subGain.gain.setValueAtTime(0.001, hit);
      subGain.gain.linearRampToValueAtTime(0.75, hit + 0.025);
      subGain.gain.exponentialRampToValueAtTime(0.001, hit + 3.8);
      sub.connect(subGain);
      subGain.connect(this.masterGain);
      sub.start(hit);
      sub.stop(hit + 3.9);

      // Dissonant horror brass/waterphone cluster
      const clusterFreqs = [138.59, 146.83, 277.18, 587.33, 622.25];
      clusterFreqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = i < 2 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(f, hit);
        osc.frequency.linearRampToValueAtTime(f * (i % 2 === 0 ? 0.94 : 1.04), hit + 3.2);

        const filt = this.ctx.createBiquadFilter();
        filt.type = 'bandpass';
        filt.frequency.value = f * 1.4;
        filt.Q.value = 3.5;

        g.gain.setValueAtTime(0.001, hit);
        g.gain.linearRampToValueAtTime(0.095, hit + 0.06);
        g.gain.exponentialRampToValueAtTime(0.0008, hit + 3.6);

        osc.connect(filt);
        filt.connect(g);
        g.connect(this.reverb);
        g.connect(this.masterGain);
        osc.start(hit);
        osc.stop(hit + 3.7);
      });

      this.playGlitchBurst(0.28);

      // Gently restore ominous abyssal drone after impact
      window.setTimeout(() => {
        this.isSilenced = false;
        this.update(this.progress);
      }, 2800);
    }, silenceMs);
  }
}
