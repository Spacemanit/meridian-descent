/**
 * Diegetic SaaS Support Chat Widget ("Maya from Meridian")
 * Starts as a cheerful corporate Intercom bubble and gradually deteriorates
 * into a haunted, self-aware observer as the user scrolls deeper.
 */
export class CorruptedChatWidget {
  constructor(soundEngine, getTelemetry) {
    this.sound = soundEngine;
    this.getTelemetry = getTelemetry;

    this.nudge = document.getElementById('chat-nudge');
    this.nudgeText = document.getElementById('chat-nudge-text');
    this.nudgeClose = document.getElementById('nudge-close');
    this.panel = document.getElementById('chat-panel');
    this.launcher = document.getElementById('chat-launcher');
    this.badge = document.getElementById('chat-badge');
    this.closeBtn = document.getElementById('chat-close');
    this.messagesEl = document.getElementById('chat-messages');
    this.form = document.getElementById('chat-form');
    this.input = document.getElementById('chat-input');
    this.agentName = document.getElementById('agent-name');
    this.agentStatus = document.getElementById('agent-status');
    this.agentAvatar = document.getElementById('agent-avatar');

    this.isOpen = false;
    this.nudgeDismissedByUser = false;
    this.highestStage = 0;
    this.currentAct = 1;
    this.unreadCount = 0;

    // Hijacked typing buffer for Acts V-VII
    this.hijackPhrases = [
      'PLEASE LET ME CLOSE THIS TAB',
      'WHO IS BEHIND THE GLASS',
      'I SHOULD NOT HAVE SCROLLED DOWN',
      'IT CAN HEAR ME TYPING',
    ];
    this.hijackIdx = 0;
    this.hijackCharCount = 0;

    this._bindEvents();
  }

  _bindEvents() {
    this.launcher.addEventListener('click', () => this.togglePanel());
    this.closeBtn.addEventListener('click', () => this.closePanel());
    this.nudge.addEventListener('click', (e) => {
      if (e.target === this.nudgeClose) return;
      this.openPanel();
    });
    this.nudgeClose.addEventListener('click', (e) => {
      e.stopPropagation();
      this.nudgeDismissedByUser = true;
      this.nudge.hidden = true;
    });

    // In Acts V+, user typing gets eerily hijacked into frantic pleas!
    this.input.addEventListener('input', () => {
      if (this.currentAct < 5) return;
      const phrase = this.hijackPhrases[this.hijackIdx % this.hijackPhrases.length];
      this.hijackCharCount = Math.min(phrase.length, this.hijackCharCount + 1);
      this.input.value = phrase.slice(0, this.hijackCharCount);
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = this.input.value.trim();
      if (!text) return;
      this._appendMessage(text, 'user');
      this.input.value = '';
      this.hijackCharCount = 0;
      this.hijackIdx++;

      window.setTimeout(() => this._replyToUser(text), 620);
    });
  }

  togglePanel() {
    if (this.isOpen) this.closePanel();
    else this.openPanel();
  }

  openPanel() {
    this.isOpen = true;
    this.panel.hidden = false;
    this.nudge.hidden = true;
    this.unreadCount = 0;
    this.badge.hidden = true;
    this.input.focus();
  }

  closePanel() {
    this.isOpen = false;
    this.panel.hidden = true;
  }

  _appendMessage(text, role = 'bot', isHorror = false) {
    const div = document.createElement('div');
    div.className = `msg ${role}${isHorror ? ' horror' : ''}`;
    div.textContent = text;
    this.messagesEl.appendChild(div);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  _replyToUser() {
    const tel = this.getTelemetry();
    if (this.currentAct <= 2) {
      this._appendMessage(
        'Great question! Meridian deploys in minutes with zero engineering lift. Scroll down to see how teams keep 98.4% of visitors forever.',
        'bot'
      );
      this.sound.playNotification(false);
    } else if (this.currentAct <= 4) {
      this._appendMessage(
        `We already logged your session from a ${tel.viewport} viewport at ${tel.clock}. You don't need to submit a form — you're already enrolled.`,
        'bot',
        true
      );
      this.sound.playNotification(true);
    } else {
      const replies = [
        'Shhh. Do not keep typing. Look at the dark glass behind the basement door.',
        `It noticed you ${tel.elapsed} seconds ago. Closing the chat won't close the door.`,
        'I can see the glow of your monitor on your face.',
      ];
      this._appendMessage(replies[this.hijackIdx % replies.length], 'bot', true);
      this.sound.playNotification(true);
    }
  }

  updateByScroll(progress, act) {
    this.currentAct = act;
    const tel = this.getTelemetry();

    // Update support agent identity smoothly as acts escalate
    if (act <= 2) {
      this.agentName.textContent = 'Maya from Meridian';
      this.agentAvatar.textContent = 'M';
      this.agentStatus.innerHTML = '<i class="status-dot"></i>Typically replies instantly';
    } else if (act === 3) {
      this.agentName.textContent = 'Maya (Floor 04)';
      this.agentAvatar.textContent = 'M';
      this.agentStatus.innerHTML = '<i class="status-dot"></i>Watching this tab';
    } else if (act === 4) {
      this.agentName.textContent = 'MAYA // STILL HERE';
      this.agentAvatar.textContent = '!';
      this.agentStatus.innerHTML = '<i class="status-dot"></i>Always online';
    } else if (act === 5) {
      this.agentName.textContent = 'DO NOT SCROLL DOWN';
      this.agentAvatar.textContent = '×';
      this.agentStatus.innerHTML = '<i class="status-dot"></i>Typing from Basement B3';
    } else {
      this.agentName.textContent = 'IT IS BEHIND THE GLASS';
      this.agentAvatar.textContent = '◉';
      this.agentStatus.innerHTML = '<i class="status-dot"></i>INSIDE THE ROOM';
    }

    // Trigger escalating diegetic notifications at key scroll thresholds
    const milestones = [
      { stage: 1, threshold: 0.17, text: 'Quick tip: everything on this page reacts to you in real time.', eerie: false },
      { stage: 2, threshold: 0.34, text: 'Notice how quiet your room got while you were reading?', eerie: true },
      { stage: 3, threshold: 0.51, text: `${tel.elapsed} seconds on page. Most visitors stop before the corridor.`, eerie: true },
      { stage: 4, threshold: 0.67, text: 'Please stop scrolling. Do not let CAM 04 finish loading.', eerie: true },
      { stage: 5, threshold: 0.82, text: 'IT HEARD THE SCROLL WHEEL.', eerie: true },
      { stage: 6, threshold: 0.94, text: 'DON’T TURN AROUND.', eerie: true },
    ];

    for (const m of milestones) {
      if (progress >= m.threshold && this.highestStage < m.stage) {
        this.highestStage = m.stage;
        this._pushEscalation(m.text, m.eerie);
      }
    }
  }

  _pushEscalation(text, isEerie) {
    this._appendMessage(text, 'bot', isEerie);
    this.sound.playNotification(isEerie);

    if (!this.isOpen) {
      this.unreadCount++;
      this.badge.textContent = String(this.unreadCount);
      this.badge.hidden = false;
      // Re-surface nudge even if earlier corporate nudge was dismissed once horror begins!
      if (!this.nudgeDismissedByUser || isEerie) {
        this.nudgeText.textContent = text;
        this.nudge.hidden = false;
      }
    }
  }

  reset() {
    this.highestStage = 0;
    this.currentAct = 1;
    this.unreadCount = 0;
    this.nudgeDismissedByUser = false;
    this.badge.hidden = true;
    this.closePanel();
    this.messagesEl.innerHTML =
      '<div class="msg bot">Hi there! Welcome to Meridian. Ask me anything about pricing, integrations, or onboarding.</div>';
    this.nudgeText.textContent = '👋 Hi! Have questions about Meridian?';
    this.nudge.hidden = false;
    this.updateByScroll(0, 1);
  }
}
