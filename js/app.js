import { SoundscapeEngine } from './audio.js';
import { HorrorOverlayCanvas, ClimaxStageCanvas } from './canvas-fx.js';
import { CorruptedChatWidget } from './chat-widget.js';

/**
 * MERIDIAN — THE DESCENT
 * Master scroll orchestrator, atmosphere interpolator, live telemetry gaslighter,
 * backtrack DOM corruption engine, flashlight secret revealer, and horror climax controller.
 */

const state = {
  startTime: Date.now(),
  scrollProgress: 0,
  maxProgress: 0,
  lastScrollY: 0,
  scrollVelocity: 0,
  mouseX: window.innerWidth * 0.5,
  mouseY: window.innerHeight * 0.5,
  currentAct: 1,
  climaxTriggered: false,
  corruptedAbove: false,
  climaxCorruptedAbove: false,
  loggedMilestones: new Set(),
  evasiveCount: 0,
  frameCount: 0,
};

const root = document.documentElement;
const body = document.body;

// Instantiate subsystems
const sound = new SoundscapeEngine();
const fxCanvas = new HorrorOverlayCanvas(document.getElementById('fx-canvas'));
const climaxCanvas = new ClimaxStageCanvas(
  document.getElementById('climax-canvas'),
  'assets/entity-climax.jpg'
);

// Helper: real-time visitor telemetry
function getTelemetry() {
  const now = new Date();
  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return {
    clock: `${hh}:${mm}:${ss}`,
    hour: now.getHours(),
    elapsed,
    viewport: `${window.innerWidth} × ${window.innerHeight}`,
    cursor: `${Math.round(state.mouseX)}, ${Math.round(state.mouseY)}`,
  };
}

const chat = new CorruptedChatWidget(sound, getTelemetry);

/* ==========================================================================
   COLOR INTERPOLATION ENGINE (Seamless daylight white -> abyssal pitch black)
   ========================================================================== */
const BG_STOPS = [
  { p: 0.00, bg: [255, 255, 255], ink: [15, 23, 42], sec: [71, 85, 105] },
  { p: 0.22, bg: [248, 250, 251], ink: [15, 23, 42], sec: [71, 85, 105] },
  { p: 0.36, bg: [229, 235, 228], ink: [22, 30, 26], sec: [66, 79, 71] },
  { p: 0.48, bg: [34, 39, 36],    ink: [226, 231, 226], sec: [160, 170, 163] },
  { p: 0.64, bg: [14, 16, 15],    ink: [220, 224, 219], sec: [143, 150, 144] },
  { p: 0.80, bg: [6, 7, 7],       ink: [214, 214, 206], sec: [126, 132, 126] },
  { p: 0.94, bg: [0, 0, 0],       ink: [228, 228, 220], sec: [115, 115, 115] },
  { p: 1.00, bg: [0, 0, 0],       ink: [228, 228, 220], sec: [115, 115, 115] },
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function samplePalette(p) {
  for (let i = 0; i < BG_STOPS.length - 1; i++) {
    const a = BG_STOPS[i];
    const b = BG_STOPS[i + 1];
    if (p >= a.p && p <= b.p) {
      const t = (p - a.p) / Math.max(0.0001, b.p - a.p);
      const rgb = (k) =>
        `rgb(${Math.round(lerp(a[k][0], b[k][0], t))}, ${Math.round(
          lerp(a[k][1], b[k][1], t)
        )}, ${Math.round(lerp(a[k][2], b[k][2], t))})`;
      return { bg: rgb('bg'), ink: rgb('ink'), sec: rgb('sec') };
    }
  }
  return { bg: 'rgb(0,0,0)', ink: 'rgb(228,228,220)', sec: 'rgb(115,115,115)' };
}

function computeAct(p) {
  if (p < 0.14) return 1;
  if (p < 0.28) return 2;
  if (p < 0.44) return 3;
  if (p < 0.62) return 4;
  if (p < 0.78) return 5;
  if (p < 0.91) return 6;
  return 7;
}

/* ==========================================================================
   DYNAMIC FAVICON & DOCUMENT TITLE MUTATION
   ========================================================================== */
const faviconEl = document.getElementById('dynamic-favicon');
let lastTitleAct = 0;

function updateTabIdentity(act) {
  if (act === lastTitleAct && !state.climaxTriggered) return;
  lastTitleAct = act;

  if (state.climaxTriggered) {
    document.title = 'WE ARE ALREADY INSIDE';
    faviconEl.href =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23050505'/%3E%3Cellipse cx='16' cy='16' rx='11' ry='6.5' fill='none' stroke='%23dc2626' stroke-width='2.2'/%3E%3Ccircle cx='16' cy='16' r='3.5' fill='%23ef4444'/%3E%3C/svg%3E";
    return;
  }

  const titles = {
    1: 'Meridian — Turn every visitor into a lifelong customer',
    2: 'Meridian — Always beside your audience',
    3: 'Meridian — Stay a little longer',
    4: 'Meridian — You are still here',
    5: 'Don’t scroll down',
    6: 'CAM 04 — MOTION DETECTED',
    7: 'IT IS RIGHT BEHIND THE GLASS',
  };
  document.title = titles[act] || titles[1];

  if (act >= 5) {
    faviconEl.href =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23450a0a'/%3E%3Cellipse cx='16' cy='16' rx='10' ry='6' fill='none' stroke='%23ef4444' stroke-width='2'/%3E%3Ccircle cx='16' cy='16' r='3.2' fill='%23ef4444'/%3E%3C/svg%3E";
  } else {
    faviconEl.href =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%234f46e5'/%3E%3Ccircle cx='16' cy='16' r='8' fill='none' stroke='white' stroke-width='2.4'/%3E%3Ccircle cx='16' cy='16' r='2.8' fill='white'/%3E%3C/svg%3E";
  }
}

/* ==========================================================================
   NAVBAR & BRAND EYE TRACKING
   ========================================================================== */
const navLinks = document.querySelectorAll('.nav-links a');
const navCta = document.getElementById('nav-cta');
const navSignin = document.getElementById('nav-signin');
const brandName = document.getElementById('brand-name');
const brandPupil = document.getElementById('brand-pupil');
const soundLabel = document.getElementById('sound-label');
const soundToggleBtn = document.getElementById('sound-toggle');

function updateNavbar(act) {
  navLinks.forEach((link) => {
    if (act <= 2) link.textContent = link.dataset.normal;
    else if (act <= 4) link.textContent = link.dataset.uncanny;
    else link.textContent = link.dataset.horror;
  });

  if (act <= 2) {
    brandName.textContent = 'Meridian';
    navSignin.textContent = 'Sign in';
    navCta.textContent = 'Start Free Trial';
  } else if (act === 3) {
    brandName.textContent = 'Meridian';
    navSignin.textContent = 'Already signed in';
    navCta.textContent = 'Stay enrolled';
  } else if (act === 4) {
    brandName.textContent = 'MERIDIAN';
    navSignin.textContent = 'Floor 04';
    navCta.textContent = 'No Exit Available';
  } else if (act === 5) {
    brandName.textContent = 'M E R I D I A N';
    navSignin.textContent = 'STOP';
    navCta.textContent = 'TURN BACK';
  } else {
    brandName.textContent = 'STILL HERE';
    navSignin.textContent = '';
    navCta.textContent = 'LOCKED';
  }

  updateSoundLabel();
}

function updateSoundLabel() {
  if (!sound.enabled) {
    soundLabel.textContent = state.currentAct >= 5 ? 'Listen (Muted)' : 'Audio: Off';
  } else {
    if (state.currentAct <= 2) soundLabel.textContent = 'Audio: On';
    else if (state.currentAct <= 4) soundLabel.textContent = 'Listening...';
    else soundLabel.textContent = 'CAN YOU HEAR IT?';
  }
}

soundToggleBtn.addEventListener('click', () => {
  const active = sound.toggle();
  soundToggleBtn.setAttribute('aria-pressed', String(active));
  updateSoundLabel();
});

// Auto-arm subtle ambient audio on first explicit click anywhere (except clicking mute off)
let autoArmedAudio = false;
window.addEventListener(
  'pointerdown',
  (e) => {
    if (autoArmedAudio) return;
    if (e.target.closest('#sound-toggle')) {
      autoArmedAudio = true;
      return;
    }
    autoArmedAudio = true;
    const active = sound.enable();
    soundToggleBtn.setAttribute('aria-pressed', String(active));
    updateSoundLabel();
  },
  { passive: true }
);

/* ==========================================================================
   BACKTRACK CORRUPTION ("THE PAGE REMEMBERS WHAT YOU SAW")
   ========================================================================== */
function applyBacktrackCorruption(postClimax = false) {
  body.dataset.corrupted = 'true';

  const pillBadge = document.getElementById('pill-badge');
  const pillText = document.getElementById('pill-text');
  const heroTitle = document.getElementById('hero-title');
  const heroSubtitle = document.getElementById('hero-subtitle');
  const heroPrimaryCta = document.getElementById('hero-primary-cta');
  const heroFootnote = document.getElementById('hero-footnote');
  const dashUrl = document.getElementById('dashboard-url');
  const dashStatus = document.getElementById('dashboard-status-label');
  const statVal1 = document.getElementById('stat-val-1');
  const statVal2 = document.getElementById('stat-val-2');
  const statVal3 = document.getElementById('stat-val-3');
  const statDelta1 = document.getElementById('stat-delta-1');
  const chartLine = document.getElementById('chart-line');
  const chartArea = document.getElementById('chart-area');
  const chartDot = document.getElementById('chart-dot');
  const chartGradTop = document.getElementById('chart-grad-top');
  const logoLabel = document.getElementById('logo-cloud-label');

  pillBadge.textContent = 'LIVE';
  pillText.textContent = postClimax
    ? '1 visitor returned to the surface — IT FOLLOWED YOU UP'
    : 'Session locked — Basement B3 corridor unlocked';

  heroTitle.innerHTML = postClimax
    ? 'You scrolled back up. <span class="gradient-text">It followed you.</span>'
    : 'Turn every visitor into a <span class="gradient-text">permanent fixture.</span>';

  heroSubtitle.textContent = postClimax
    ? 'The marketing site was only the lobby. Look closely at the people in the customer stories now.'
    : 'You already saw what sits below the pricing table. Scrolling back up does not close the glass door.';

  heroPrimaryCta.textContent = postClimax ? 'There is no trial' : 'You are already enrolled';
  heroFootnote.textContent = 'Exit paths disabled · Reflection synced · Floor 04 lights extinguished';

  dashUrl.textContent = 'app.meridian.io/basement/subject-0894';
  dashStatus.textContent = 'CONTAINMENT ACTIVE';
  statVal1.textContent = '1';
  statDelta1.textContent = 'Only you are left';
  statVal2.textContent = '100.0%';
  statVal3.textContent = '∞';

  // Turn growth chart crimson and plunge it straight down
  chartLine.setAttribute(
    'd',
    'M0,38 C80,44 150,52 220,66 C300,82 370,118 450,148 C495,160 520,166 540,168'
  );
  chartLine.setAttribute('stroke', '#dc2626');
  chartArea.setAttribute(
    'd',
    'M0,38 C80,44 150,52 220,66 C300,82 370,118 450,148 C495,160 520,166 540,168 L540,170 L0,170 Z'
  );
  chartGradTop.setAttribute('stop-color', '#dc2626');
  chartDot.setAttribute('cx', '540');
  chartDot.setAttribute('cy', '168');
  chartDot.setAttribute('fill', '#dc2626');

  logoLabel.textContent = 'READ THE LOGOS LEFT TO RIGHT';
  document.querySelectorAll('.partner-logo').forEach((el) => {
    if (!el.dataset.original) el.dataset.original = el.textContent;
    el.textContent = el.dataset.corrupt;
  });

  // Corrupt testimonial quotes
  document.querySelectorAll('.t-quote').forEach((q) => {
    if (!q.dataset.original) q.dataset.original = q.textContent;
    q.textContent = q.dataset.corrupt;
  });

  const act4 = document.getElementById('activity-4');
  if (act4) {
    act4.innerHTML =
      '<span class="act-dot" style="background:#dc2626"></span><span><strong>Subject #0894</strong> tried scrolling back to safety</span><time>just now</time>';
  }
}

/* ==========================================================================
   LIVE TELEMETRY, OBSERVATION LOG & CCTV CLOCK
   ========================================================================== */
const telTime = document.getElementById('tel-time');
const telViewport = document.getElementById('tel-viewport');
const telElapsed = document.getElementById('tel-elapsed');
const telCursor = document.getElementById('tel-cursor');
const telPosture = document.getElementById('tel-posture');
const descentSecondsEl = document.getElementById('descent-seconds');
const consoleLog = document.getElementById('console-log');
const cctvClock = document.getElementById('cctv-clock');
const cctvDistance = document.getElementById('cctv-distance');
const reticleLabel = document.getElementById('reticle-label');

function appendConsoleLog(text, isAlert = false) {
  if (!consoleLog) return;
  const line = document.createElement('div');
  line.className = `log-line${isAlert ? ' alert' : ''}`;
  line.textContent = `> ${text}`;
  consoleLog.appendChild(line);
  consoleLog.scrollTop = consoleLog.scrollHeight;
}

const POSTURE_NOTES = [
  'Leaning slightly closer',
  'Reading slower than average',
  'Cursor hesitation near edge',
  'Still illuminated by screen glow',
  'Breathing interval recorded',
];

window.setInterval(() => {
  const tel = getTelemetry();
  if (telTime) telTime.textContent = tel.clock;
  if (telViewport) telViewport.textContent = tel.viewport;
  if (telElapsed) telElapsed.textContent = `${tel.elapsed}s`;
  if (telCursor) telCursor.textContent = tel.cursor;
  if (descentSecondsEl) descentSecondsEl.textContent = String(tel.elapsed);

  if (telPosture && tel.elapsed > 0 && tel.elapsed % 7 === 0) {
    const idx = Math.floor(tel.elapsed / 7) % POSTURE_NOTES.length;
    telPosture.textContent = POSTURE_NOTES[idx];
  }

  // Live CCTV timestamp down to milliseconds
  if (cctvClock) {
    const d = new Date();
    const ms = String(d.getMilliseconds()).padStart(3, '0');
    const dateStr = d.toISOString().slice(0, 10);
    cctvClock.textContent = `${dateStr} ${tel.clock}.${ms}`;
  }
}, 120);

function updateObservationLogs(p) {
  const tel = getTelemetry();

  if (p >= 0.42 && !state.loggedMilestones.has('m1')) {
    state.loggedMilestones.add('m1');
    const timeNote =
      tel.hour < 5 || tel.hour >= 22
        ? `Local clock reads ${tel.clock}. Why are you still awake?`
        : `Local clock reads ${tel.clock}. The room behind you is unusually quiet.`;
    appendConsoleLog(timeNote);
  }

  if (p >= 0.50 && !state.loggedMilestones.has('m2')) {
    state.loggedMilestones.add('m2');
    appendConsoleLog(`Viewport ${tel.viewport} centered. Reflections calibrated.`);
  }

  if (p >= 0.56 && !state.loggedMilestones.has('m3')) {
    state.loggedMilestones.add('m3');
    appendConsoleLog(
      `Scroll speed ${Math.round(Math.abs(state.scrollVelocity))} px/s. Subject continues descending voluntarily.`,
      true
    );
  }

  if (p >= 0.62 && !state.loggedMilestones.has('m4')) {
    state.loggedMilestones.add('m4');
    appendConsoleLog('WARNING: Basement B3 door sensor triggered.', true);
  }
}

/* ==========================================================================
   INTERACTIVE HORROR DETAILS (Evasive Decline, Broken Unsubscribe, FAQ)
   ========================================================================== */
const declineBtn = document.getElementById('decline-forever-btn');
const acceptBtn = document.getElementById('accept-forever-btn');
const unsubBtn = document.getElementById('broken-unsub');
const unsubErr = document.getElementById('unsub-error');

if (declineBtn) {
  const evade = () => {
    state.evasiveCount++;
    const x = (Math.random() - 0.5) * 90;
    const y = (Math.random() - 0.5) * 24;
    declineBtn.style.transform = `translate(${x}px, ${y}px)`;
    declineBtn.style.color = '#ef4444';
    const labels = [
      'You already agreed',
      'There is no decline',
      'Stay a little longer',
      'Look below the footer',
    ];
    declineBtn.textContent = labels[(state.evasiveCount - 1) % labels.length];
    sound.playGlitchBurst(0.08);
    fxCanvas.triggerGlitch(0.45);
  };
  declineBtn.addEventListener('mouseenter', evade);
  declineBtn.addEventListener('click', evade);
}

if (acceptBtn) {
  acceptBtn.addEventListener('click', () => {
    acceptBtn.textContent = 'ENROLLED PERMANENTLY';
    acceptBtn.style.background = '#7f1d1d';
    appendConsoleLog('Subject manually confirmed permanent enrollment.', true);
    sound.playNotification(true);
  });
}

document.querySelectorAll('.plan-btn[data-plan]').forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.textContent = 'Redirected to Permanent Tier';
    sound.playNotification(true);
    document.getElementById('forever-plan')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});

if (unsubBtn) {
  let attempts = 0;
  unsubBtn.addEventListener('click', () => {
    attempts++;
    unsubBtn.classList.remove('shake');
    void unsubBtn.offsetWidth;
    unsubBtn.classList.add('shake');
    sound.playGlitchBurst(0.16);
    fxCanvas.triggerGlitch(0.8);
    const msgs = [
      'ERR_NO_EXIT: Session cannot be terminated.',
      'ERR_BOUND: Something is holding the connection open.',
      'STOP CLICKING. IT HEARS YOU.',
    ];
    unsubErr.textContent = msgs[Math.min(attempts - 1, msgs.length - 1)];
  });
}

const faqCorridor = document.getElementById('faq-corridor');
if (faqCorridor) {
  faqCorridor.addEventListener('toggle', () => {
    if (faqCorridor.open) {
      sound.playGlitchBurst(0.18);
      fxCanvas.triggerGlitch(0.75);
    }
  });
}

/* ==========================================================================
   FLASHLIGHT SECRET WALL MASK COORDINATES
   ========================================================================== */
const hiddenWalls = document.querySelectorAll('.hidden-walls');

function updateFlashlightMasks() {
  root.style.setProperty('--mouse-x', `${state.mouseX}px`);
  root.style.setProperty('--mouse-y', `${state.mouseY}px`);

  // Update local coordinates for each scratched-wall container so cursor beam aligns 1:1
  hiddenWalls.forEach((wall) => {
    const rect = wall.getBoundingClientRect();
    wall.style.setProperty('--local-mx', `${state.mouseX - rect.left}px`);
    wall.style.setProperty('--local-my', `${state.mouseY - rect.top}px`);
  });

  // Subtle pupil tracking in navbar logo (starts gently in Act II+)
  if (brandPupil && state.scrollProgress > 0.1) {
    const rect = brandPupil.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.5;
    const angle = Math.atan2(state.mouseY - cy, state.mouseX - cx);
    const maxOffset = Math.min(3.4, 1.4 + state.scrollProgress * 2.4);
    const tx = Math.cos(angle) * maxOffset;
    const ty = Math.sin(angle) * maxOffset;
    brandPupil.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
  }

  // Normalized pointer for Climax apparition tracking
  const nx = (state.mouseX / Math.max(1, window.innerWidth)) * 2 - 1;
  const ny = (state.mouseY / Math.max(1, window.innerHeight)) * 2 - 1;
  climaxCanvas.setPointer(nx, ny);
}

window.addEventListener(
  'pointermove',
  (e) => {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
    updateFlashlightMasks();
  },
  { passive: true }
);

/* ==========================================================================
   ACT VII — CHOREOGRAPHED HORROR MOVIE CLIMAX
   ========================================================================== */
const climaxStage = document.getElementById('climax-stage');
const climaxKicker = document.getElementById('climax-kicker');
const climaxHeadline = document.getElementById('climax-headline');
const climaxSub = document.getElementById('climax-sub');
const climaxControls = document.getElementById('climax-controls');

function typeText(el, text, speed = 46) {
  return new Promise((resolve) => {
    el.textContent = '';
    let i = 0;
    const tick = () => {
      if (!state.climaxTriggered) return resolve();
      el.textContent = text.slice(0, ++i);
      if (i < text.length) {
        window.setTimeout(tick, speed + Math.random() * 26);
      } else {
        resolve();
      }
    };
    tick();
  });
}

function triggerClimax() {
  if (state.climaxTriggered) return;
  state.climaxTriggered = true;

  // Step 1: Anticipation — Flashlight dies + 750ms oppressive dead silence
  body.classList.add('flashlight-dead');
  updateTabIdentity(7);

  sound.playClimaxSequence(750, async () => {
    if (!state.climaxTriggered) return;

    // Step 2: Impact — Apparition emerges right behind the glass + hairline cracks + tremor
    body.classList.remove('flashlight-dead');
    body.classList.add('climax-active', 'climax-tremor');
    fxCanvas.triggerGlitch(1.25);

    climaxCanvas.activate();
    climaxStage.classList.add('revealed');

    window.setTimeout(() => {
      climaxStage.classList.add('cracked');
    }, 280);

    window.setTimeout(() => {
      body.classList.remove('climax-tremor');
    }, 650);

    // Corrupt the entire site above permanently so looking back is horrifying
    state.climaxCorruptedAbove = true;
    applyBacktrackCorruption(true);

    // Step 3: Haunting typewriter delivery
    const tel = getTelemetry();
    await new Promise((r) => window.setTimeout(r, 700));
    await typeText(climaxKicker, `SESSION COMPLETE · ${tel.elapsed} SECONDS`, 42);
    await new Promise((r) => window.setTimeout(r, 320));
    await typeText(climaxHeadline, 'WE ARE ALREADY INSIDE.', 68);
    await new Promise((r) => window.setTimeout(r, 420));
    await typeText(climaxSub, 'THANK YOU FOR STAYING UNTIL THE END. DON’T TURN AROUND.', 36);

    window.setTimeout(() => {
      climaxControls.classList.add('visible');
    }, 900);
  });
}

// Climax escape / replay buttons
document.getElementById('scroll-back-btn')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('reset-btn')?.addEventListener('click', () => {
  state.climaxTriggered = false;
  state.maxProgress = 0;
  state.corruptedAbove = false;
  state.climaxCorruptedAbove = false;
  state.startTime = Date.now();
  state.loggedMilestones.clear();
  climaxCanvas.reset();
  climaxStage.classList.remove('revealed', 'cracked');
  climaxControls.classList.remove('visible');
  climaxKicker.textContent = '';
  climaxHeadline.textContent = '';
  climaxSub.textContent = '';
  body.classList.remove('flashlight-dead', 'climax-tremor');
  chat.reset();
  window.location.reload();
});

/* ==========================================================================
   INTERSECTION OBSERVER FOR SCROLL REVEALS
   ========================================================================== */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.14, rootMargin: '0px 0px -6% 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ==========================================================================
   MAIN SCROLL & ANIMATION LOOP (60fps GPU-composited)
   ========================================================================== */
function updateScrollState() {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const y = window.scrollY;
  const p = Math.max(0, Math.min(1, y / maxScroll));

  state.scrollVelocity = y - state.lastScrollY;
  state.lastScrollY = y;
  state.scrollProgress = p;
  state.maxProgress = Math.max(state.maxProgress, p);

  const act = computeAct(p);
  if (act !== state.currentAct) {
    state.currentAct = act;
    body.dataset.act = String(act);
    updateNavbar(act);
    updateTabIdentity(act);
  }

  // Seamless color & atmosphere interpolation
  const palette = samplePalette(p);
  root.style.setProperty('--descent', p.toFixed(4));
  // If user scrolled back up after corruption, subtly bleach daylight white into eerie hospital gray
  const bg = state.corruptedAbove && p < 0.24 ? 'rgb(233, 236, 233)' : palette.bg;
  root.style.setProperty('--page-bg', bg);
  root.style.setProperty('--ink-primary', palette.ink);
  root.style.setProperty('--ink-secondary', palette.sec);
  root.style.setProperty('--scroll-pct', `${(p * 100).toFixed(2)}%`);
  root.style.setProperty(
    '--progress-color',
    p < 0.44 && !state.corruptedAbove ? '#4f46e5' : p < 0.65 ? '#991b1b' : '#dc2626'
  );

  // Restore full navbar visibility if user scrolls back up out of climax stage
  if (state.climaxTriggered && p < 0.90) {
    body.classList.remove('climax-active');
  } else if (state.climaxTriggered && p >= 0.94) {
    body.classList.add('climax-active');
  }

  // Vignette, scanlines & flashlight intensity ramp
  const vignette = Math.max(0, Math.min(0.75, (p - 0.25) / 0.62));
  const flashlight = p < 0.54 ? 0 : p > 0.94 ? Math.max(0, 1 - (p - 0.94) / 0.05) : Math.min(0.88, (p - 0.54) / 0.14);
  const scanlines = Math.max(0, Math.min(0.32, (p - 0.58) * 0.9));
  const tilt = p < 0.26 ? 0 : Math.min(2.0, (p - 0.26) * 2.8);

  root.style.setProperty('--vignette-opacity', vignette.toFixed(3));
  root.style.setProperty('--flashlight-opacity', flashlight.toFixed(3));
  root.style.setProperty('--scanline-opacity', scanlines.toFixed(3));
  root.style.setProperty('--drift-tilt', `${tilt.toFixed(2)}deg`);

  // Dynamic CCTV distance closing in as you scroll through Act VI!
  if (cctvDistance && p > 0.72) {
    const dist = Math.max(0.1, 4.4 - ((p - 0.72) / 0.22) * 4.3);
    cctvDistance.textContent =
      dist <= 0.25 ? 'DISTANCE TO LENS: 0.0M (CONTACT)' : `DISTANCE TO LENS: ${dist.toFixed(1)}M`;
    if (reticleLabel && dist < 1.2) {
      reticleLabel.textContent = 'LOCKED ON VIEWER · DO NOT MOVE';
    }
  }

  // Trigger backtrack DOM corruption memory once user crosses Act V threshold
  if (state.maxProgress >= 0.58 && !state.corruptedAbove) {
    state.corruptedAbove = true;
    applyBacktrackCorruption(false);
  }

  // Subtle glitch spike if user rapidly panics and scrolls back up from deep Acts
  if (p > 0.55 && state.scrollVelocity < -110) {
    fxCanvas.triggerGlitch(0.6);
  }

  updateObservationLogs(p);
  chat.updateByScroll(p, act);
  sound.update(p);
  updateFlashlightMasks();

  // Trigger Act VII Climax when reaching the abyss stage
  if (p >= 0.955 && !state.climaxTriggered) {
    triggerClimax();
  }
}

window.addEventListener('scroll', updateScrollState, { passive: true });
window.addEventListener('resize', updateScrollState, { passive: true });

// Kick off initial state + 60fps canvas animation loop
updateScrollState();

function animate(now) {
  state.frameCount++;
  fxCanvas.setState(state.scrollProgress, state.mouseX, state.mouseY);
  fxCanvas.render(state.frameCount);
  climaxCanvas.render(now);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
