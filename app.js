/**
 * START.NG · GOOD VIBES. GOOD GAMES.
 * Kinetic Whimsical Diorama Engine
 * - Dangling "Play now" button with pendulum physics
 * - Pluckable diagonal zipline with trophy trolley
 * - Dangling/hoistable 5th tournament icon
 * - Upgraded 1.8x character leaping across community cards
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. COZY AUDIO SYNTHESIZER (WEB AUDIO API)
     Marimba pops, string plucks, ratchet clicks, tea clinks, star chimes
     ========================================================================== */
  class CozyAudioEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      if (this.enabled) this.init();
      return this.enabled;
    }

    playMarimbaPop(pitch = 520) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.75, now + 0.12);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    }

    playStringPluck(pitch = 240) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.98, now + 0.35);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }

    playRatchetWinch() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + i * 0.04;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(680 + i * 80, t);
        osc.frequency.exponentialRampToValueAtTime(320, t + 0.025);

        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.025);
      }
    }

    playStarChime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [659.25, 880, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.06, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.22);
      });
    }
  }

  const audio = new CozyAudioEngine();

  /* ==========================================================================
     2. SUSPENDED DUAL-ROPE "PLAY NOW" BUTTON CONTROLLER (PENDULUM PHYSICS)
     Suspended from navbar, continuous gentle sway, impulse kicks, eye-tracking
     ========================================================================== */
  class DanglingPlayButtonController {
    constructor() {
      this.rig = document.getElementById('suspended-cradle-rig');
      this.chassis = document.getElementById('pendulum-chassis');
      this.btn = document.getElementById('btn-play-now');
      this.perchedChar = document.getElementById('sway-perched-char');
      this.pupilL = document.getElementById('comp-pupil-left');
      this.pupilR = document.getElementById('comp-pupil-right');
      this.speech = document.getElementById('companion-speech');
      this.speechText = document.getElementById('companion-speech-text');

      // Physics state
      this.currentAngle = 0;
      this.targetAngle = 0;
      this.angularVelocity = 0;
      this.k = 0.08;        // spring tension
      this.damping = 0.94;  // friction damping
      this.lastMouseX = 0;
      this.lastMouseY = 0;

      this.init();
    }

    init() {
      if (!this.rig || !this.chassis) return;

      // Mouse tracking for physics impulses and pupil eye-tracking
      window.addEventListener('mousemove', (e) => {
        this.trackCursor(e.clientX, e.clientY);
        this.checkPhysicsImpulse(e.clientX, e.clientY);
      }, { passive: true });

      // Click button bounce
      if (this.btn) {
        this.btn.addEventListener('click', () => {
          this.applyImpulse(8);
          audio.playMarimbaPop(760);
        });
      }

      this.updatePhysics();
    }

    checkPhysicsImpulse(mouseX, mouseY) {
      if (!this.chassis) return;
      const rect = this.chassis.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dist = Math.hypot(mouseX - centerX, mouseY - centerY);

      // If cursor brushes near the button or cables (< 90px)
      if (dist < 90) {
        const mouseSpeedX = mouseX - this.lastMouseX;
        if (Math.abs(mouseSpeedX) > 4) {
          const impulse = (mouseSpeedX / 12);
          this.applyImpulse(Math.max(-10, Math.min(10, impulse)));
        }
      }

      this.lastMouseX = mouseX;
      this.lastMouseY = mouseY;
    }

    applyImpulse(force) {
      this.angularVelocity += force;
      // Temporarily pause CSS animation while physics spring resolves
      if (this.chassis) {
        this.chassis.style.animation = 'none';
      }
    }

    updatePhysics() {
      requestAnimationFrame(() => this.updatePhysics());

      // If there's active impulse velocity
      if (Math.abs(this.angularVelocity) > 0.02 || Math.abs(this.currentAngle) > 0.02) {
        const springForce = -this.k * this.currentAngle;
        this.angularVelocity = (this.angularVelocity + springForce) * this.damping;
        this.currentAngle += this.angularVelocity;

        if (this.chassis) {
          this.chassis.style.transform = `rotate(${this.currentAngle.toFixed(2)}deg)`;
        }
      } else if (this.chassis && this.chassis.style.animation === 'none') {
        // Return back to gentle ambient pendulum sway
        this.chassis.style.animation = 'pendulum-drift 4.2s infinite ease-in-out';
        this.chassis.style.transform = '';
      }
    }

    trackCursor(mouseX, mouseY) {
      if (!this.perchedChar) return;
      const head = document.getElementById('comp-head');
      if (!head) return;

      const rect = head.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const dx = mouseX - eyeCenterX;
      const dy = mouseY - eyeCenterY;
      const distance = Math.hypot(dx, dy);

      const maxOffset = 2.0;
      const angle = Math.atan2(dy, dx);
      const intensity = Math.min(1, distance / 360);

      const offsetX = Math.cos(angle) * maxOffset * intensity;
      const offsetY = Math.sin(angle) * maxOffset * intensity;

      if (this.pupilL) {
        this.pupilL.setAttribute('cx', (32 + offsetX).toFixed(2));
        this.pupilL.setAttribute('cy', (21 + offsetY).toFixed(2));
      }
      if (this.pupilR) {
        this.pupilR.setAttribute('cx', (42 + offsetX).toFixed(2));
        this.pupilR.setAttribute('cy', (21 + offsetY).toFixed(2));
      }
    }
  }

  /* ==========================================================================
     3. PLUCKABLE DIAGONAL ZIPLINE & TROPHY TRAVELER CONTROLLER
     Stretches from start.ng logo down to Tournament card, vibrates on hover/pluck
     ========================================================================== */
  class ZiplineTrolleyController {
    constructor() {
      this.cable = document.getElementById('zipline-cable');
      this.trolley = document.getElementById('zipline-trolley');
      this.speech = document.getElementById('zipline-speech');
      this.anchorTop = document.getElementById('zipline-anchor-top');
      this.anchorBottom = document.getElementById('zipline-anchor-bottom');

      // Coordinates
      this.x1 = 0;
      this.y1 = 0;
      this.x2 = 0;
      this.y2 = 0;

      // Trolley travel progress
      this.progress = 0.08;
      this.direction = 1;
      this.speed = 0.0016;
      this.paused = false;

      // String pluck physics
      this.isPlucking = false;
      this.pluckAmp = 0;
      this.pluckTime = 0;

      this.init();
    }

    init() {
      if (!this.cable || !this.trolley) return;

      this.updateAnchors();
      window.addEventListener('resize', () => this.updateAnchors());
      window.addEventListener('scroll', () => this.updateAnchors(), { passive: true });

      // Pluck cable on mouseenter/mousemove
      if (this.cable) {
        this.cable.addEventListener('mouseenter', () => this.pluckString());
      }

      // Loop animation
      this.animate();
    }

    updateAnchors() {
      if (!this.anchorTop || !this.anchorBottom) return;

      const topRect = this.anchorTop.getBoundingClientRect();
      const botRect = this.anchorBottom.getBoundingClientRect();

      // Absolute coordinates inside document
      this.x1 = topRect.left + topRect.width / 2;
      this.y1 = topRect.top + window.scrollY + 14;

      this.x2 = botRect.left + botRect.width / 2;
      this.y2 = botRect.top + window.scrollY;

      this.updateCableGeometry();
    }

    pluckString() {
      this.pluckAmp = 18;
      this.pluckTime = 0;
      audio.playStringPluck(280);
      showToast('Zipline cable plucked! 🎶');
    }

    updateCableGeometry() {
      if (!this.cable) return;

      // Vibrating sine wave displacement if plucked
      let vibrationOffset = 0;
      if (this.pluckAmp > 0.1) {
        this.pluckTime += 0.28;
        vibrationOffset = Math.sin(this.pluckTime) * this.pluckAmp;
        this.pluckAmp *= 0.94; // damping
      }

      // Midpoint sag + pluck vibration
      const midX = (this.x1 + this.x2) / 2 + vibrationOffset * 0.5;
      const midY = (this.y1 + this.y2) / 2 + 18 + vibrationOffset;

      this.cable.setAttribute('d', `M ${this.x1} ${this.y1} Q ${midX} ${midY} ${this.x2} ${this.y2}`);

      // Calculate current trolley coordinates along the quadratic curve
      const t = this.progress;
      const curX = (1 - t) * (1 - t) * this.x1 + 2 * (1 - t) * t * midX + t * t * this.x2;
      const curY = (1 - t) * (1 - t) * this.y1 + 2 * (1 - t) * t * midY + t * t * this.y2;

      // Angle of travel
      const dx = 2 * (1 - t) * (midX - this.x1) + 2 * t * (this.x2 - midX);
      const dy = 2 * (1 - t) * (midY - this.y1) + 2 * t * (this.y2 - midY);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      if (this.trolley) {
        this.trolley.setAttribute('transform', `translate(${curX}, ${curY}) rotate(${angle})`);
      }
    }

    animate() {
      requestAnimationFrame(() => this.animate());

      if (!this.paused) {
        this.progress += this.speed * this.direction;

        // Reached tournament card destination!
        if (this.progress >= 0.92 && this.direction === 1) {
          this.progress = 0.92;
          this.paused = true;
          this.direction = -1;
          if (this.speech) {
            this.speech.textContent = "Delivered today's cup! 🏆";
          }
          audio.playStarChime();
          // Pause for 3 seconds then zip back
          setTimeout(() => {
            this.paused = false;
            if (this.speech) {
              this.speech.textContent = "Heading back up! 💨";
            }
          }, 3000);
        }
        // Returned to top
        else if (this.progress <= 0.08 && this.direction === -1) {
          this.progress = 0.08;
          this.paused = true;
          this.direction = 1;
          if (this.speech) {
            this.speech.textContent = "Trophy incoming! 🏆";
          }
          setTimeout(() => {
            this.paused = false;
          }, 2400);
        }
      }

      this.updateCableGeometry();
    }
  }

  /* ==========================================================================
     4. THE DANGLING 5TH TOURNAMENT ICON & MINI CRANE RIGGER CONTROLLER
     Miniature crane operator lowering/hoisting Game #5 into the tournament row
     ========================================================================== */
  class DanglingTournamentIconController {
    constructor() {
      this.rig = document.getElementById('dangling-5th-rig');
      this.cranePost = document.getElementById('crane-rigger-post');
      this.speech = document.getElementById('crane-speech');
      this.ropeLine = document.getElementById('crane-rope-line');
      this.thumb5 = document.getElementById('suspended-5th-thumb');
      this.isHoisted = false;

      this.init();
    }

    init() {
      if (!this.rig) return;

      const toggleAction = () => this.toggle();

      this.rig.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAction();
      });

      if (this.cranePost) {
        this.cranePost.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleAction();
        });
      }
    }

    toggle() {
      this.isHoisted = !this.isHoisted;
      audio.playRatchetWinch();

      if (this.isHoisted) {
        this.rig.classList.add('hoisted');
        if (this.ropeLine) {
          this.ropeLine.setAttribute('y2', '16');
        }
        if (this.speech) {
          this.speech.textContent = 'Game #5 locked in! 🎯';
          this.speech.classList.add('active');
        }
        audio.playStarChime();
        showToast('Puff Catch locked into Today\'s Tournament!');
      } else {
        this.rig.classList.remove('hoisted');
        if (this.ropeLine) {
          this.ropeLine.setAttribute('y2', '52');
        }
        if (this.speech) {
          this.speech.textContent = 'Lowering game #5! 🏗️';
          this.speech.classList.add('active');
        }
        audio.playMarimbaPop(420);
      }

      setTimeout(() => {
        if (this.speech) this.speech.classList.remove('active');
      }, 2500);
    }
  }

  /* ==========================================================================
     5. UPGRADED 1.8X CARETAKER LEAPING ACROSS COMMUNITY CARDS
     Parabolic jumping across cards with dynamic game commentary speech bubbles
     ========================================================================== */
  const GAME_COMMENTS = {
    'the-hangout': 'The Hangout is the coziest community spot! 🌿',
    'pick-me': 'Pick Me has mind-bending logic puzzles! 🔢',
    'star-dash': 'Star Dash is high-speed neon perfection! ⭐',
    'portal-pals': 'Floating sky islands are purely magical! 🏝️',
    'boju-boju': 'Boju Boju is a vibrant community classic! 🎭',
    'star-catcher': 'Catching stars feels so rewarding! ✨',
    'inkbreak': 'The rhythm beats on Inkbreak are infectious! 🎧',
    'relic-rush-3d': 'Relic Rush 3D is a thrilling ancient dash! 🏃'
  };

  class LeapingCaretakerController {
    constructor() {
      this.caretaker = document.getElementById('leaping-caretaker');
      this.speech = document.getElementById('leaper-speech');
      this.speechText = document.getElementById('leaper-speech-text');
      this.arena = document.getElementById('cards-arena');
      this.legs = document.getElementById('leaper-legs');

      this.currentCardIndex = 0;
      this.isLeaping = false;

      this.init();
    }

    init() {
      if (!this.caretaker || !this.arena) return;

      // Position initially on Card #1
      this.positionOnCard(0, false);

      // Listen to card hovers
      this.arena.addEventListener('mouseover', (e) => {
        const card = e.target.closest('.community-card');
        if (!card) return;

        const cards = Array.from(this.arena.querySelectorAll('.community-card'));
        const index = cards.indexOf(card);
        const gameId = card.getAttribute('data-id');

        if (index !== -1 && index !== this.currentCardIndex && !this.isLeaping) {
          this.leapToCard(index, gameId);
        }
      });
    }

    positionOnCard(index, animate = false) {
      const cards = this.arena.querySelectorAll('.community-card');
      if (!cards[index]) return;

      const card = cards[index];
      const arenaRect = this.arena.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      // Align character over the top-left area of the card
      const targetX = cardRect.left - arenaRect.left + 24;
      const targetY = -48;

      if (!animate) {
        this.caretaker.style.transform = `translate(${targetX}px, ${targetY}px)`;
      }

      this.currentCardIndex = index;
    }

    leapToCard(targetIndex, gameId) {
      const cards = this.arena.querySelectorAll('.community-card');
      if (!cards[targetIndex]) return;

      this.isLeaping = true;
      const card = cards[targetIndex];
      const arenaRect = this.arena.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      const targetX = cardRect.left - arenaRect.left + 24;
      const targetY = -48;

      // Face jumping direction
      const goingRight = targetIndex > this.currentCardIndex;
      const flipScale = goingRight ? 1 : -1;

      // Squat prep
      this.caretaker.style.transition = 'transform 0.12s ease-in';
      this.caretaker.style.transform += ' scaleY(0.85)';
      audio.playMarimbaPop(580);

      setTimeout(() => {
        // High parabolic jump curve through CSS
        this.caretaker.style.transition = 'transform 0.45s cubic-bezier(0.25, 1.4, 0.5, 1)';
        this.caretaker.style.transform = `translate(${targetX}px, ${targetY}px) scaleX(${flipScale})`;

        // Audio pop on landing
        setTimeout(() => {
          audio.playMarimbaPop(720);
          this.isLeaping = false;
          this.currentCardIndex = targetIndex;

          // Update speech bubble with authentic game praise
          if (this.speechText && GAME_COMMENTS[gameId]) {
            this.speechText.textContent = GAME_COMMENTS[gameId];
            if (this.speech) {
              this.speech.style.transform = 'translateX(-50%) translateY(-4px)';
              setTimeout(() => {
                this.speech.style.transform = 'translateX(-50%) translateY(0)';
              }, 200);
            }
          }
        }, 450);

      }, 120);
    }
  }

  /* ==========================================================================
     6. AUTHENTIC START.NG COMMUNITY GAMES & MODAL ENGINE
     ========================================================================== */
  const COMMUNITY_GAMES = [
    {
      id: 'the-hangout',
      title: 'The Hangout',
      subdomain: 'start.ng/hangout',
      creator: 'by start.ng',
      featured: true,
      thumbSvg: `
        <svg viewBox="0 0 320 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="hangout-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#C2E0B8"/>
              <stop offset="60%" stop-color="#E2EFE0"/>
              <stop offset="100%" stop-color="#B2D8A6"/>
            </linearGradient>
          </defs>
          <rect width="320" height="200" fill="url(#hangout-sky)"/>
          <polygon points="0,150 120,120 220,140 320,110 320,200 0,200" fill="#88B87A"/>
          <polygon points="0,170 160,150 320,165 320,200 0,200" fill="#6A9E5C"/>
          <circle cx="50" cy="110" r="22" fill="#528344"/>
          <rect x="47" y="128" width="6" height="22" fill="#5C4033"/>
          <circle cx="85" cy="100" r="18" fill="#5F934F"/>
          <rect x="83" y="115" width="5" height="24" fill="#5C4033"/>
          <circle cx="280" cy="95" r="24" fill="#528344"/>
          <rect x="277" y="115" width="6" height="25" fill="#5C4033"/>
          <circle cx="150" cy="140" r="4" fill="#F7D1BA"/>
          <rect x="147" y="144" width="6" height="12" fill="#E26D5C"/>
          <circle cx="162" cy="138" r="4" fill="#F7D1BA"/>
          <rect x="159" y="142" width="6" height="14" fill="#1C1C1E"/>
          <circle cx="174" cy="140" r="4" fill="#F7D1BA"/>
          <rect x="171" y="144" width="6" height="12" fill="#688B77"/>
        </svg>
      `
    },
    {
      id: 'pick-me',
      title: 'Pick Me',
      subdomain: 'pick-me.start.ng',
      creator: 'by Al',
      featured: false,
      thumbSvg: `
        <svg viewBox="0 0 320 200" preserveAspectRatio="none">
          <rect width="320" height="200" fill="#0D0D0C"/>
          <text x="160" y="55" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">PICK ME</text>
          <rect x="110" y="85" width="100" height="28" rx="4" fill="#1C1C1E" stroke="#333" stroke-width="1"/>
          <circle cx="125" cy="99" r="4" fill="#FF5A5F"/>
          <circle cx="140" cy="99" r="4" fill="#FF5A5F"/>
          <circle cx="155" cy="99" r="4" fill="#FF5A5F"/>
          <text x="185" y="103" font-family="'JetBrains Mono', monospace" font-size="12" fill="#FF5A5F" font-weight="bold">16</text>
          <rect x="110" y="125" width="100" height="28" rx="4" fill="#1C1C1E" stroke="#333" stroke-width="1"/>
          <circle cx="125" cy="139" r="4" fill="#B8F135"/>
          <circle cx="140" cy="139" r="4" fill="#B8F135"/>
          <circle cx="155" cy="139" r="4" fill="#B8F135"/>
          <text x="185" y="143" font-family="'JetBrains Mono', monospace" font-size="12" fill="#B8F135" font-weight="bold">14</text>
        </svg>
      `
    },
    {
      id: 'star-dash',
      title: 'Star Dash',
      subdomain: 'star-dash.start.ng',
      creator: 'by Ajibade',
      featured: false,
      thumbSvg: `
        <svg viewBox="0 0 320 200" preserveAspectRatio="none">
          <rect width="320" height="200" fill="#1B8A74"/>
          <text x="160" y="130" font-family="'Plus Jakarta Sans', sans-serif" font-size="92" font-weight="800" fill="#FFFFFF" text-anchor="middle">S</text>
        </svg>
      `
    },
    {
      id: 'portal-pals',
      title: 'Portal Pals',
      subdomain: 'portal-pals.start.ng',
      creator: 'by maryam',
      featured: false,
      thumbSvg: `
        <svg viewBox="0 0 320 200" preserveAspectRatio="none">
          <rect width="320" height="200" fill="#BFE3F7"/>
          <circle cx="250" cy="45" r="14" fill="#F4D35E"/>
          <polygon points="120,80 180,60 240,80 180,100" fill="#9BC88B"/>
          <polygon points="120,80 180,100 180,120 120,100" fill="#846C5B"/>
          <polygon points="180,100 240,80 240,100 180,120" fill="#6E5646"/>
          <polygon points="40,100 100,80 160,100 100,120" fill="#9BC88B"/>
          <polygon points="40,100 100,120 100,140 40,120" fill="#846C5B"/>
          <polygon points="100,120 160,100 160,120 100,140" fill="#6E5646"/>
          <ellipse cx="215" cy="82" rx="7" ry="11" fill="#E26D9B"/>
          <rect x="20" y="20" width="85" height="24" rx="4" fill="#FFFFFF"/>
          <text x="62" y="36" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="800" fill="#1C1C1E" text-anchor="middle">SKY ISLAND</text>
        </svg>
      `
    },
    {
      id: 'boju-boju',
      title: 'Boju Boju',
      subdomain: 'boju-boju.start.ng',
      creator: 'by 99PlusOne',
      featured: false,
      thumbSvg: `
        <svg viewBox="0 0 320 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="boju-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#D6B89D"/>
              <stop offset="100%" stop-color="#C29F80"/>
            </linearGradient>
          </defs>
          <rect width="320" height="200" fill="url(#boju-sky)"/>
          <text x="75" y="45" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" fill="#FFFFFF">Boju Boju</text>
          <ellipse cx="190" cy="145" rx="22" ry="32" fill="#E24E42"/>
          <circle cx="190" cy="98" r="12" fill="#F4D35E"/>
          <circle cx="180" cy="135" r="3" fill="#FFF"/>
          <circle cx="190" cy="135" r="3" fill="#FFF"/>
          <circle cx="200" cy="135" r="3" fill="#FFF"/>
          <rect x="40" y="70" width="100" height="40" fill="#2E4A3E" rx="2"/>
          <text x="90" y="94" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" fill="#FFF" text-anchor="middle">THIS HOUSE IS NOT FOR SALE</text>
        </svg>
      `
    },
    {
      id: 'star-catcher',
      title: 'Star Catcher',
      subdomain: 'star-catcher.start.ng',
      creator: 'by Harshila',
      featured: false,
      thumbSvg: `
        <svg viewBox="0 0 320 200" preserveAspectRatio="none">
          <rect width="320" height="200" fill="#90C3E5"/>
          <text x="160" y="38" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="800" fill="#FFFFFF" text-anchor="middle">Star Catcher</text>
          <line x1="0" y1="140" x2="320" y2="140" stroke="#FFD166" stroke-width="1.5"/>
          <rect x="146" y="90" width="28" height="26" fill="#F7D1BA" rx="2"/>
          <rect x="140" y="116" width="40" height="34" fill="#C05C7E" rx="2"/>
          <polygon points="230,65 234,75 244,75 236,81 239,91 230,85 221,91 224,81 216,75 226,75" fill="#F4D35E"/>
        </svg>
      `
    },
    {
      id: 'inkbreak',
      title: 'Inkbreak',
      subdomain: 'inkbreak.start.ng',
      creator: 'by henryuks',
      featured: false,
      thumbSvg: `
        <svg viewBox="0 0 320 200" preserveAspectRatio="none">
          <rect width="320" height="200" fill="#EBE7DE"/>
          <text x="65" y="65" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800" fill="#1C1C1E">INK<tspan fill="#B8F135">BREAK</tspan></text>
          <ellipse cx="230" cy="155" rx="50" ry="14" fill="#DDECEB"/>
          <circle cx="230" cy="98" r="12" fill="#E4AA7D"/>
          <rect x="222" y="110" width="16" height="22" fill="#2E6F69" rx="3"/>
        </svg>
      `
    },
    {
      id: 'relic-rush-3d',
      title: 'Relic Rush 3d',
      subdomain: 'relic-rush-3d.start.ng',
      creator: 'by Noble',
      featured: false,
      thumbSvg: `
        <svg viewBox="0 0 320 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="relic-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#4A3B32"/>
              <stop offset="50%" stop-color="#7D624C"/>
              <stop offset="100%" stop-color="#D4A373"/>
            </linearGradient>
          </defs>
          <rect width="320" height="200" fill="url(#relic-bg)"/>
          <text x="65" y="45" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="800" fill="#F4D35E">RELIC</text>
          <text x="65" y="65" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="800" fill="#FFFFFF">RUSH 3D</text>
          <polygon points="160,80 180,80 280,200 40,200" fill="#997B66"/>
          <rect x="70" y="100" width="14" height="60" fill="#584031"/>
          <rect x="236" y="100" width="14" height="60" fill="#584031"/>
        </svg>
      `
    }
  ];

  class CommunityGamesManager {
    constructor() {
      this.grid = document.getElementById('community-grid');
      this.searchInput = document.getElementById('community-search');
      this.clearSearchBtn = document.getElementById('btn-clear-search');
      this.emptyBox = document.getElementById('empty-search-box');
      this.resetBtn = document.getElementById('btn-reset-search');
      this.countText = document.getElementById('catalog-count-text');
      this.coinEl = document.getElementById('coin-amount');

      this.searchQuery = '';
      this.likedGames = new Set();
      this.coins = 0;

      this.render();
      this.initEvents();
    }

    initEvents() {
      if (this.searchInput) {
        this.searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.toLowerCase().trim();
          if (this.clearSearchBtn) {
            this.clearSearchBtn.style.display = this.searchQuery ? 'block' : 'none';
          }
          this.render();
        });
      }

      if (this.clearSearchBtn) {
        this.clearSearchBtn.addEventListener('click', () => {
          this.searchInput.value = '';
          this.searchQuery = '';
          this.clearSearchBtn.style.display = 'none';
          this.searchInput.focus();
          this.render();
        });
      }

      if (this.resetBtn) {
        this.resetBtn.addEventListener('click', () => {
          this.searchInput.value = '';
          this.searchQuery = '';
          if (this.clearSearchBtn) this.clearSearchBtn.style.display = 'none';
          this.render();
        });
      }
    }

    render() {
      if (!this.grid) return;

      const filtered = COMMUNITY_GAMES.filter((game) => {
        if (!this.searchQuery) return true;
        return game.title.toLowerCase().includes(this.searchQuery) ||
               game.subdomain.toLowerCase().includes(this.searchQuery) ||
               game.creator.toLowerCase().includes(this.searchQuery);
      });

      if (filtered.length === 0) {
        this.grid.innerHTML = '';
        if (this.emptyBox) this.emptyBox.style.display = 'block';
        if (this.countText) this.countText.textContent = `0 of ${COMMUNITY_GAMES.length}`;
        return;
      }

      if (this.emptyBox) this.emptyBox.style.display = 'none';
      if (this.countText) this.countText.textContent = `1-${filtered.length} of 133`;

      this.grid.innerHTML = filtered.map((game) => {
        const isFeatured = game.featured;
        const isLiked = this.likedGames.has(game.id);

        return `
          <div class="community-card ${isFeatured ? 'has-lime-glow' : ''}" data-id="${game.id}">
            <div class="card-thumb-frame">
              ${game.thumbSvg}
            </div>
            <div class="card-details">
              <h3 class="card-name">${game.title}</h3>
              <a href="https://${game.subdomain}" target="_blank" class="card-subdomain" onclick="event.stopPropagation();">${game.subdomain}</a>
              <span class="card-creator">${game.creator}</span>

              <div class="card-action-bar">
                <button type="button" class="card-like-btn ${isLiked ? 'liked' : ''}" data-id="${game.id}" aria-label="Like ${game.title}">
                  ${isLiked ? '♥' : '♡'}
                </button>
                <div class="card-links-group">
                  <a href="#leaderboard" class="card-lb-link" data-id="${game.id}" onclick="event.stopPropagation();">Leaderboard</a>
                  <span class="card-play-pill">Play ↗</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      this.attachCardInteractions();
    }

    attachCardInteractions() {
      const cards = this.grid.querySelectorAll('.community-card');
      cards.forEach((card) => {
        const id = card.getAttribute('data-id');
        const game = COMMUNITY_GAMES.find(g => g.id === id);

        card.addEventListener('click', () => {
          audio.playMarimbaPop(580);
          playModal.open(game);
        });

        const likeBtn = card.querySelector('.card-like-btn');
        if (likeBtn) {
          likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleLike(id, likeBtn);
          });
        }
      });
    }

    toggleLike(id, btn) {
      if (this.likedGames.has(id)) {
        this.likedGames.delete(id);
        btn.classList.remove('liked');
        btn.textContent = '♡';
        audio.playMarimbaPop(380);
      } else {
        this.likedGames.add(id);
        btn.classList.add('liked');
        btn.textContent = '♥';
        audio.playStarChime();
        this.addCoin();
        showToast('Saved to your favorites! 🪙 +1 Community Coin');
      }
    }

    addCoin() {
      this.coins++;
      if (this.coinEl) {
        this.coinEl.textContent = this.coins;
        this.coinEl.style.transform = 'scale(1.25)';
        this.coinEl.style.transition = 'transform 0.15s ease';
        setTimeout(() => {
          this.coinEl.style.transform = 'scale(1)';
        }, 150);
      }
    }
  }

  /* ==========================================================================
     7. IN-PLACE PLAY MODAL
     ========================================================================== */
  class StartPlayModal {
    constructor() {
      this.modal = document.getElementById('game-modal');
      this.closeBtn = document.getElementById('modal-close-btn');
      this.titleEl = document.getElementById('modal-game-heading');
      this.subdomainEl = document.getElementById('modal-game-subdomain');
      this.creatorEl = document.getElementById('modal-creator-tag');
      this.openTabBtn = document.getElementById('btn-modal-open-new-tab');
      
      this.canvas = document.getElementById('play-canvas');
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.promptOverlay = document.getElementById('canvas-start-prompt');
      this.promptTitle = document.getElementById('prompt-game-title');
      this.launchBtn = document.getElementById('btn-launch-canvas-game');
      this.hudScore = document.getElementById('hud-score-val');
      this.hudStars = document.getElementById('hud-stars-val');

      this.gameActive = false;
      this.score = 0;
      this.starsCollected = 0;
      this.playerX = 340;
      this.playerY = 280;
      this.playerVy = 0;
      this.isJumping = false;
      this.keys = { left: false, right: false };
      this.stars = [];
      this.animId = null;

      this.init();
    }

    init() {
      if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
      if (this.modal) {
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) this.close();
        });
      }

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal && this.modal.style.display !== 'none') {
          this.close();
        }
        if (this.gameActive) {
          if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
          if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
          if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            e.preventDefault();
            this.jump();
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
      });

      if (this.launchBtn) {
        this.launchBtn.addEventListener('click', () => this.startPlay());
      }
    }

    open(game) {
      if (!this.modal) return;
      this.currentGame = game;
      if (this.titleEl) this.titleEl.textContent = game.title;
      if (this.subdomainEl) this.subdomainEl.textContent = game.subdomain;
      if (this.creatorEl) this.creatorEl.innerHTML = `Created ${game.creator}`;
      if (this.promptTitle) this.promptTitle.textContent = `Play ${game.title}`;
      if (this.openTabBtn) this.openTabBtn.textContent = `Open at ${game.subdomain} ↗`;

      this.modal.style.display = 'flex';
      this.stop();
      if (this.promptOverlay) this.promptOverlay.style.display = 'flex';
      this.drawBackdrop();
    }

    close() {
      if (!this.modal) return;
      this.stop();
      this.modal.style.display = 'none';
    }

    drawBackdrop() {
      if (!this.ctx || !this.canvas) return;
      const w = this.canvas.width;
      const h = this.canvas.height;
      this.ctx.fillStyle = '#F6F6F2';
      this.ctx.fillRect(0, 0, w, h);
      this.ctx.fillStyle = '#C2E0B8';
      this.ctx.fillRect(0, h - 60, w, 60);
      this.ctx.fillStyle = '#88B87A';
      this.ctx.fillRect(0, h - 50, w, 50);
    }

    startPlay() {
      if (this.promptOverlay) this.promptOverlay.style.display = 'none';
      this.gameActive = true;
      this.score = 0;
      this.starsCollected = 0;
      this.playerX = this.canvas.width / 2;
      this.playerY = this.canvas.height - 95;
      this.playerVy = 0;
      this.isJumping = false;

      this.stars = [
        { x: 120, y: 190, collected: false },
        { x: 230, y: 140, collected: false },
        { x: 340, y: 190, collected: false },
        { x: 450, y: 140, collected: false },
        { x: 560, y: 190, collected: false },
      ];

      this.updateHud();
      audio.playMarimbaPop(600);
      this.loop();
    }

    jump() {
      if (!this.isJumping) {
        this.playerVy = -11;
        this.isJumping = true;
        audio.playMarimbaPop(740);
      }
    }

    stop() {
      this.gameActive = false;
      cancelAnimationFrame(this.animId);
    }

    updateHud() {
      if (this.hudScore) this.hudScore.textContent = this.score;
      if (this.hudStars) this.hudStars.textContent = `${this.starsCollected}/${this.stars.length}`;
    }

    loop() {
      if (!this.gameActive || !this.ctx) return;
      this.animId = requestAnimationFrame(() => this.loop());

      const w = this.canvas.width;
      const h = this.canvas.height;
      const groundY = h - 95;

      if (this.keys.left && this.playerX > 30) this.playerX -= 4.5;
      if (this.keys.right && this.playerX < w - 30) this.playerX += 4.5;

      this.playerVy += 0.55;
      this.playerY += this.playerVy;
      if (this.playerY >= groundY) {
        this.playerY = groundY;
        this.playerVy = 0;
        this.isJumping = false;
      }

      this.stars.forEach(s => {
        if (!s.collected && Math.hypot(s.x - this.playerX, s.y - this.playerY) < 28) {
          s.collected = true;
          this.starsCollected++;
          this.score += 100;
          this.updateHud();
          audio.playStarChime();
          if (this.starsCollected === this.stars.length) {
            showToast('All stars collected! High score on start.ng! ⭐');
          }
        }
      });

      this.ctx.fillStyle = '#F6F6F2';
      this.ctx.fillRect(0, 0, w, h);

      this.ctx.fillStyle = '#E8EFE5';
      this.ctx.beginPath();
      this.ctx.arc(140, h - 30, 120, Math.PI, Math.PI * 2);
      this.ctx.arc(480, h - 30, 160, Math.PI, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#C2E0B8';
      this.ctx.fillRect(0, h - 60, w, 10);
      this.ctx.fillStyle = '#88B87A';
      this.ctx.fillRect(0, h - 50, w, 50);

      this.stars.forEach(s => {
        if (!s.collected) {
          this.ctx.fillStyle = '#FFA726';
          this.ctx.beginPath();
          this.ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.strokeStyle = '#1C1C1E';
          this.ctx.lineWidth = 1.5;
          this.ctx.stroke();
        }
      });

      const px = this.playerX;
      const py = this.playerY;

      this.ctx.fillStyle = 'rgba(28, 28, 30, 0.12)';
      this.ctx.beginPath();
      this.ctx.ellipse(px, groundY + 32, 16, 4, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#E26D5C';
      this.ctx.beginPath();
      this.ctx.roundRect(px - 10, py + 12, 20, 20, [4]);
      this.ctx.fill();
      this.ctx.strokeStyle = '#1C1C1E';
      this.ctx.lineWidth = 1.8;
      this.ctx.stroke();

      this.ctx.fillStyle = '#F7D1BA';
      this.ctx.beginPath();
      this.ctx.arc(px, py, 11, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#B8F135';
      this.ctx.beginPath();
      this.ctx.ellipse(px, py - 9, 10, 4, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#1C1C1E';
      this.ctx.beginPath();
      this.ctx.arc(px - 3.5, py - 1, 1.2, 0, Math.PI * 2);
      this.ctx.arc(px + 3.5, py - 1, 1.2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /* ==========================================================================
     8. GLOBAL TOASTS & HANDLERS
     ========================================================================== */
  function showToast(message) {
    const hub = document.getElementById('toast-hub');
    if (!hub) return;
    const toast = document.createElement('div');
    toast.className = 'start-toast';
    toast.innerHTML = `<span>✨</span><span>${message}</span>`;
    hub.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px) scale(0.95)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  function initGlobalHandlers() {
    const soundBtn = document.getElementById('btn-sound-toggle');
    const soundIcon = document.getElementById('sound-icon');
    if (soundBtn && soundIcon) {
      soundBtn.addEventListener('click', () => {
        const on = audio.toggle();
        soundIcon.textContent = on ? '🔈' : '🔇';
        showToast(on ? 'Sound effects on' : 'Sound muted');
      });
    }

    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        audio.playMarimbaPop(500);
        showToast('Night mode preview: Good night, community builder! 🌙');
      });
    }

    const helpBtn = document.getElementById('btn-floating-help');
    if (helpBtn) {
      helpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        audio.playMarimbaPop(620);
        showToast('Need help? Hover over the dangling button or pluck the zipline cable! 🎮');
      });
    }

    const scrollBtn = document.getElementById('btn-scroll-bottom');
    if (scrollBtn) {
      scrollBtn.addEventListener('click', () => {
        const catalog = document.getElementById('games-catalog');
        if (catalog) {
          catalog.scrollIntoView({ behavior: 'smooth' });
          audio.playMarimbaPop(540);
        }
      });
    }

    const enterBtn = document.getElementById('btn-enter-tournament');
    const tourneyPlayers = document.getElementById('tourney-players-count');
    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        enterBtn.textContent = 'Entered! 🎉';
        enterBtn.style.backgroundColor = '#B8F135';
        enterBtn.style.color = '#1C1C1E';
        if (tourneyPlayers) tourneyPlayers.textContent = '13 players';
        audio.playStarChime();
        showToast('You are registered for today\'s tournament! Good luck! 🏆');
      });
    }

    // Dot anchor click
    const dotAnchor = document.getElementById('living-dot-anchor');
    const livingDot = document.getElementById('hero-living-dot');
    const dotSpeech = document.getElementById('caretaker-1-speech');
    if (dotAnchor && livingDot) {
      dotAnchor.addEventListener('click', () => {
        livingDot.classList.toggle('tilted');
        const isTilted = livingDot.classList.contains('tilted');
        audio.playMarimbaPop(isTilted ? 440 : 660);
        if (dotSpeech) {
          dotSpeech.textContent = isTilted ? 'A little whimsical tilt! ✨' : 'All leveled up! ✨';
          dotSpeech.classList.add('active');
          setTimeout(() => dotSpeech.classList.remove('active'), 2000);
        }
      });
    }
  }

  // Active instances
  let playBtnController;
  let ziplineController;
  let danglingIconController;
  let leapingCaretaker;
  let communityGames;
  let playModal;

  document.addEventListener('DOMContentLoaded', () => {
    playBtnController = new DanglingPlayButtonController();
    ziplineController = new ZiplineTrolleyController();
    danglingIconController = new DanglingTournamentIconController();
    leapingCaretaker = new LeapingCaretakerController();
    playModal = new StartPlayModal();
    communityGames = new CommunityGamesManager();
    initGlobalHandlers();
  });

})();
