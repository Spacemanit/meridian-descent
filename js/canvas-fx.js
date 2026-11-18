/**
 * Full-Viewport Atmospheric FX Canvas & Climax Apparition Renderer
 * - Renders subtle analog film grain scaling smoothly with descent
 * - Organic VHS horizontal tear glitches in deeper acts
 * - Dust motes illuminated inside the flashlight cone
 * - Climax canvas renders `assets/entity-climax.jpg` with breathing zoom,
 *   cursor-tracking lean, cold CRT RGB split tremors, and shadow vignette.
 */
export class HorrorOverlayCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.progress = 0;
    this.mouseX = window.innerWidth * 0.5;
    this.mouseY = window.innerHeight * 0.5;
    this.glitchAmount = 0;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Pre-generate offscreen grain tile for ultra-fast 60fps tiling
    this.grainCanvas = document.createElement('canvas');
    this.grainCanvas.width = 160;
    this.grainCanvas.height = 160;
    this.grainCtx = this.grainCanvas.getContext('2d');
    this._rebuildGrainTile();

    // Floating dust motes visible in flashlight cone during Acts V-VII
    this.motes = Array.from({ length: 42 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.15 - Math.random() * 0.35,
      r: 0.8 + Math.random() * 1.6,
      alpha: 0.2 + Math.random() * 0.45,
    }));

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.floor(this.w * dpr);
    this.canvas.height = Math.floor(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _rebuildGrainTile() {
    const img = this.grainCtx.createImageData(160, 160);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = v;
      d[i + 1] = v;
      d[i + 2] = v;
      d[i + 3] = 28;
    }
    this.grainCtx.putImageData(img, 0, 0);
  }

  triggerGlitch(intensity = 1) {
    if (this.reducedMotion) return;
    this.glitchAmount = Math.max(this.glitchAmount, intensity);
  }

  setState(progress, mouseX, mouseY) {
    this.progress = progress;
    this.mouseX = mouseX;
    this.mouseY = mouseY;
  }

  render(frameCount) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);

    if (this.progress < 0.24 && this.glitchAmount <= 0.01) return;

    // 1. Subtle film grain scaling smoothly from Act III onward
    const grainAlpha = Math.max(0, (this.progress - 0.24) * 0.55);
    if (grainAlpha > 0.01) {
      if (!this.reducedMotion && frameCount % 3 === 0) {
        this._rebuildGrainTile();
      }
      ctx.save();
      ctx.globalAlpha = Math.min(0.45, grainAlpha);
      const pattern = ctx.createPattern(this.grainCanvas, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, this.w, this.h);
      }
      ctx.restore();
    }

    // 2. Dust motes illuminated inside flashlight beam in Acts V-VII
    if (this.progress > 0.56 && !this.reducedMotion) {
      const moteIntensity = Math.min(1, (this.progress - 0.56) / 0.25);
      ctx.save();
      for (const m of this.motes) {
        m.x += m.vx;
        m.y += m.vy;
        if (m.y < -10) {
          m.y = this.h + 10;
          m.x = Math.random() * this.w;
        }
        if (m.x < -10) m.x = this.w + 10;
        if (m.x > this.w + 10) m.x = -10;

        const dx = m.x - this.mouseX;
        const dy = m.y - this.mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < 260) {
          const beam = (1 - dist / 260) * m.alpha * moteIntensity;
          ctx.fillStyle = `rgba(218, 224, 218, ${beam.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 3. Occasional organic VHS tear slices at deep scroll levels or manual triggers
    if (!this.reducedMotion && this.progress > 0.65 && Math.random() < 0.008 * this.progress) {
      this.glitchAmount = Math.max(this.glitchAmount, 0.45);
    }

    if (this.glitchAmount > 0.02) {
      const slices = Math.ceil(this.glitchAmount * 7);
      ctx.save();
      for (let i = 0; i < slices; i++) {
        const y = Math.random() * this.h;
        const h = 1.5 + Math.random() * (14 * this.glitchAmount);
        ctx.fillStyle = i % 2 === 0
          ? `rgba(185, 28, 28, ${(0.18 * this.glitchAmount).toFixed(3)})`
          : `rgba(210, 230, 225, ${(0.1 * this.glitchAmount).toFixed(3)})`;
        ctx.fillRect(0, y, this.w, h);
      }
      ctx.restore();
      this.glitchAmount *= 0.84;
    } else {
      this.glitchAmount = 0;
    }
  }
}

/**
 * Interactive Climax Stage Canvas
 * Draws the apparition behind glass with slow breathing zoom, pointer tracking,
 * subtle chromatic aberration split, and safe low-frequency dread pulses.
 */
export class ClimaxStageCanvas {
  constructor(canvas, imageSrc) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.img = new Image();
    this.loaded = false;
    this.active = false;
    this.revealStart = 0;
    this.mouseNormX = 0;
    this.mouseNormY = 0;
    this.smoothX = 0;
    this.smoothY = 0;
    this.aberration = 0;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.img.onload = () => {
      this.loaded = true;
    };
    this.img.src = imageSrc;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.w = Math.max(1, rect.width || window.innerWidth);
    this.h = Math.max(1, rect.height || window.innerHeight);
    this.canvas.width = Math.floor(this.w * dpr);
    this.canvas.height = Math.floor(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  activate() {
    this.active = true;
    this.revealStart = performance.now();
    this.aberration = 1.0;
    this.resize();
  }

  reset() {
    this.active = false;
    this.aberration = 0;
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  setPointer(normX, normY) {
    this.mouseNormX = normX;
    this.mouseNormY = normY;
  }

  render(now) {
    if (!this.active || !this.loaded) return;
    const ctx = this.ctx;
    const elapsed = (now - this.revealStart) / 1000;

    // Smoothly track user cursor so the figure subtly leans toward wherever they move
    this.smoothX += (this.mouseNormX - this.smoothX) * 0.045;
    this.smoothY += (this.mouseNormY - this.smoothY) * 0.045;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.w, this.h);

    // Cover scaling + eerie slow breathing zoom toward the viewer
    const imgRatio = this.img.width / this.img.height;
    const viewRatio = this.w / this.h;
    let drawW, drawH;
    if (viewRatio > imgRatio) {
      drawW = this.w;
      drawH = this.w / imgRatio;
    } else {
      drawH = this.h;
      drawW = this.h * imgRatio;
    }

    const breath = this.reducedMotion
      ? 1.02
      : 1.02 + Math.min(0.11, elapsed * 0.012) + Math.sin(elapsed * 0.85) * 0.016;

    const scaledW = drawW * breath;
    const scaledH = drawH * breath;
    const offsetX = (this.w - scaledW) * 0.5 - (this.reducedMotion ? 0 : this.smoothX * 22);
    const offsetY = (this.h - scaledH) * 0.5 - (this.reducedMotion ? 0 : this.smoothY * 14);

    // Occasional soft chromatic tremor (never rapid flashing)
    if (!this.reducedMotion && Math.random() < 0.012) {
      this.aberration = Math.max(this.aberration, 0.55);
    }

    // Subtle slow brightness swell mimicking cold monitor glow
    const exposure = this.reducedMotion ? 0.92 : 0.86 + Math.sin(elapsed * 0.55) * 0.1;

    ctx.save();
    ctx.globalAlpha = Math.min(1, exposure);
    ctx.drawImage(this.img, offsetX, offsetY, scaledW, scaledH);

    // Chromatic RGB ghosting split during impact / tremors
    if (this.aberration > 0.03 && !this.reducedMotion) {
      const shift = this.aberration * 11;
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.24 * this.aberration;
      ctx.drawImage(this.img, offsetX - shift, offsetY, scaledW, scaledH);
      ctx.globalAlpha = 0.16 * this.aberration;
      ctx.drawImage(this.img, offsetX + shift, offsetY + 2, scaledW, scaledH);
      this.aberration *= 0.93;
    }
    ctx.restore();

    // Deep atmospheric radial vignette blending seamlessly into pure black edges
    const grad = ctx.createRadialGradient(
      this.w * 0.5,
      this.h * 0.48,
      Math.min(this.w, this.h) * 0.18,
      this.w * 0.5,
      this.h * 0.5,
      Math.max(this.w, this.h) * 0.68
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.46)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.96)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.w, this.h);
  }
}
