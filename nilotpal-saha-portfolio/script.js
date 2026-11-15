/* ==========================================================================
   NILOTPAL SAHA — ULTRA-EXPERIENCE JAVASCRIPT ENGINE
   Standard: ui-ux-pro-max (Spatial Audio, Interactive Canvas Constellation,
   Magnetic Cursor, Draggable Before/After Slider, Scope Calculator, Command HUD)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. PROCEDURAL WEB AUDIO SYNTHESIZER (ZERO-ASSET SPATIAL AUDIO)
     ========================================================================== */
  let audioCtx = null;
  let soundEnabled = localStorage.getItem('nilotpal_sfx_enabled') === 'true';

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTap(freq = 600, duration = 0.04) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + duration);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function playChime() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.35);
        }, idx * 70);
      });
    } catch (e) {}
  }

  function playWhoosh() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(250, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {}
  }

  // Audio Toggle Button
  const sfxToggleBtn = document.getElementById('sfxToggleBtn');
  const sfxStatusText = document.getElementById('sfxStatusText');

  function updateSfxUI() {
    if (!sfxToggleBtn) return;
    if (soundEnabled) {
      sfxToggleBtn.classList.add('sound-active');
      if (sfxStatusText) sfxStatusText.textContent = 'SFX: ON';
    } else {
      sfxToggleBtn.classList.remove('sound-active');
      if (sfxStatusText) sfxStatusText.textContent = 'SFX: MUTED';
    }
  }
  updateSfxUI();

  if (sfxToggleBtn) {
    sfxToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('nilotpal_sfx_enabled', soundEnabled);
      updateSfxUI();
      if (soundEnabled) {
        initAudio();
        playChime();
        showToast('🔊 Interactive Sound FX Enabled');
      } else {
        showToast('🔇 Sound FX Muted');
      }
    });
  }

  // Attach soft clicks to all buttons & links
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, a, .filter-pill, .tool-pill, .project-card, .estimator-opt-btn');
    if (target && !target.isSameNode(sfxToggleBtn)) {
      playTap(700, 0.04);
    }
  });

  /* ==========================================================================
     2. TOAST NOTIFICATION UTILITY
     ========================================================================== */
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(message) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  /* ==========================================================================
     3. INTERACTIVE CANVAS CONSTELLATION & AURORA
     ========================================================================== */
  const canvas = document.getElementById('experienceCanvas');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(Math.floor((width * height) / 22000), 55);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 0.8,
        baseAlpha: Math.random() * 0.45 + 0.2
      });
    }

    const mouse = { x: -1000, y: -1000, radius: 140 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    let animationFrameId = null;

    function renderCanvas() {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(renderCanvas);
        return;
      }
      ctx.clearRect(0, 0, width, height);

      // Render & update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse avoidance/gentle push
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${p.baseAlpha})`;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${0.12 * (1 - dist2 / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderCanvas);
    }
    renderCanvas();
  }

  /* ==========================================================================
     4. CUSTOM FLUID MAGNETIC CURSOR
     ========================================================================== */
  const cursorDot = document.getElementById('customCursorDot');
  const cursorRing = document.getElementById('customCursorRing');
  const cursorBadge = document.getElementById('cursorBadge');

  if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
      if (cursorBadge) {
        cursorBadge.style.left = `${mouseX}px`;
        cursorBadge.style.top = `${mouseY}px`;
      }
    });

    function renderCursor() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Hover Target Expansion & Context Badges
    const hoverTargets = document.querySelectorAll('a, button, [data-project], .estimator-opt-btn, .comparison-wrapper');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorRing.classList.add('cursor-hover');
        const badgeText = el.getAttribute('data-cursor');
        if (badgeText && cursorBadge) {
          cursorBadge.textContent = badgeText;
          cursorBadge.classList.add('visible');
        }
      });
      el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('cursor-hover');
        if (cursorBadge) cursorBadge.classList.remove('visible');
      });
    });

    // Magnetic Pull on elements with [data-magnetic]
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    magneticElements.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.28;
        const deltaY = (e.clientY - centerY) * 0.28;
        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ==========================================================================
     5. THEME ATMOSPHERE ENGINE (4 LUXE PRESETS)
     ========================================================================== */
  const themePillBtn = document.getElementById('themePillBtn');
  const themeMenuPopover = document.getElementById('themeMenuPopover');
  const themeOptions = document.querySelectorAll('.theme-option');

  if (themePillBtn && themeMenuPopover) {
    themePillBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeMenuPopover.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!themeMenuPopover.contains(e.target) && e.target !== themePillBtn) {
        themeMenuPopover.classList.remove('open');
      }
    });

    themeOptions.forEach((opt) => {
      opt.addEventListener('click', () => {
        const theme = opt.getAttribute('data-theme');
        document.body.className = '';
        if (theme !== 'theme-deep-space') {
          document.body.classList.add(theme);
        }
        themeOptions.forEach((o) => o.classList.remove('active'));
        opt.classList.add('active');
        themeMenuPopover.classList.remove('open');
        playChime();
        showToast(`Atmosphere switched to ${opt.textContent.trim()}`);
      });
    });
  }

  /* ==========================================================================
     6. LIVE TELEMETRY & CLOCK (KOLKATA TIME & SCROLL PROGRESS)
     ========================================================================== */
  const clockEl = document.getElementById('telemetryClock');
  function updateKolkataTime() {
    if (!clockEl) return;
    const now = new Date();
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    clockEl.textContent = `KOLKATA • ${new Intl.DateTimeFormat('en-US', options).format(now)} IST`;
  }
  updateKolkataTime();
  setInterval(updateKolkataTime, 1000);

  // Scroll Progress Line & Back-to-Top Button
  const scrollLine = document.getElementById('scrollProgressLine');
  const backToTopBtn = document.getElementById('backToTopBtn');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / docHeight) * 100;

    if (scrollLine) scrollLine.style.width = `${progress}%`;
    if (backToTopBtn) {
      backToTopBtn.style.opacity = scrollTop > 300 ? '1' : '0.6';
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================================================
     7. PHOTO SWITCHER (STUDIO PORTRAIT VS LIFESTYLE BIKE TOUR)
     ========================================================================== */
  const heroImg = document.getElementById('heroPortraitImg');
  const btnStudio = document.getElementById('btnPortraitStudio');
  const btnLifestyle = document.getElementById('btnPortraitLifestyle');

  if (heroImg && btnStudio && btnLifestyle) {
    btnStudio.addEventListener('click', () => {
      heroImg.style.opacity = '0';
      heroImg.style.transform = 'scale(0.96)';
      playWhoosh();
      setTimeout(() => {
        heroImg.src = 'assets/nilotpal_portrait.jpg';
        heroImg.style.opacity = '1';
        heroImg.style.transform = 'scale(1)';
        btnStudio.classList.add('active');
        btnLifestyle.classList.remove('active');
        showToast('Switched to Studio Portrait');
      }, 180);
    });

    btnLifestyle.addEventListener('click', () => {
      heroImg.style.opacity = '0';
      heroImg.style.transform = 'scale(0.96)';
      playWhoosh();
      setTimeout(() => {
        heroImg.src = 'assets/nilotpal_bike.jpg';
        heroImg.style.opacity = '1';
        heroImg.style.transform = 'scale(1)';
        btnLifestyle.classList.add('active');
        btnStudio.classList.remove('active');
        showToast('Switched to Lifestyle & Adventure View');
      }, 180);
    });
  }

  /* ==========================================================================
     8. INTERACTIVE DRAGGABLE BEFORE / AFTER SLIDER
     ========================================================================== */
  const compWrapper = document.getElementById('comparisonWrapper');
  const compAfter = document.getElementById('comparisonAfter');
  const compHandle = document.getElementById('comparisonHandle');

  if (compWrapper && compAfter && compHandle) {
    let isDragging = false;

    function updateSlider(clientX) {
      const rect = compWrapper.getBoundingClientRect();
      let offsetX = clientX - rect.left;
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;
      const percentage = (offsetX / rect.width) * 100;
      compAfter.style.width = `${percentage}%`;
      compHandle.style.left = `${percentage}%`;
    }

    compWrapper.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSlider(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updateSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch support
    compWrapper.addEventListener('touchstart', (e) => {
      isDragging = true;
      updateSlider(e.touches[0].clientX);
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      updateSlider(e.touches[0].clientX);
    });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  /* ==========================================================================
     9. VIDEO REEL PLAYER HUD CONTROLS
     ========================================================================== */
  const videoPlayBtn = document.getElementById('videoPlayBtn');
  const videoTimecode = document.getElementById('videoTimecode');
  const videoSpeedPill = document.getElementById('videoSpeedPill');
  const scrubberFill = document.getElementById('scrubberFill');
  const scrubberTrack = document.getElementById('scrubberTrack');

  let isPlaying = false;
  let playInterval = null;
  let currentSec = 14;
  const totalSec = 105;
  const speeds = [1, 1.5, 2, 0.5];
  let speedIdx = 0;

  function formatTime(s) {
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  if (videoPlayBtn && scrubberFill) {
    videoPlayBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        videoPlayBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
        showToast('▶ Playing Reel Preview Simulation');
        playInterval = setInterval(() => {
          currentSec++;
          if (currentSec > totalSec) currentSec = 0;
          if (videoTimecode) videoTimecode.textContent = `${formatTime(currentSec)} / ${formatTime(totalSec)}`;
          scrubberFill.style.width = `${(currentSec / totalSec) * 100}%`;
        }, 1000 / speeds[speedIdx]);
      } else {
        videoPlayBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
        clearInterval(playInterval);
      }
    });
  }

  if (videoSpeedPill) {
    videoSpeedPill.addEventListener('click', () => {
      speedIdx = (speedIdx + 1) % speeds.length;
      videoSpeedPill.textContent = `${speeds[speedIdx]}x`;
      showToast(`Reel Speed: ${speeds[speedIdx]}x`);
    });
  }

  if (scrubberTrack) {
    scrubberTrack.addEventListener('click', (e) => {
      const rect = scrubberTrack.getBoundingClientRect();
      const clickPos = (e.clientX - rect.left) / rect.width;
      currentSec = Math.floor(clickPos * totalSec);
      if (videoTimecode) videoTimecode.textContent = `${formatTime(currentSec)} / ${formatTime(totalSec)}`;
      if (scrubberFill) scrubberFill.style.width = `${clickPos * 100}%`;
    });
  }

  /* ==========================================================================
     10. BENTO PORTFOLIO FILTERING & INSTANT SEARCH
     ========================================================================== */
  const filterPills = document.querySelectorAll('.filter-pill');
  const projectCards = document.querySelectorAll('.project-card');
  const searchInput = document.getElementById('projectSearchInput');

  function filterProjects() {
    const activeFilter = document.querySelector('.filter-pill.active')?.getAttribute('data-filter') || 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    projectCards.forEach((card) => {
      const category = card.getAttribute('data-category') || '';
      const title = card.querySelector('.project-title')?.textContent.toLowerCase() || '';
      const tags = card.getAttribute('data-tags')?.toLowerCase() || '';

      const matchesFilter = activeFilter === 'all' || category === activeFilter;
      const matchesQuery = !query || title.includes(query) || tags.includes(query) || category.includes(query);

      if (matchesFilter && matchesQuery) {
        card.style.display = 'flex';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      } else {
        card.style.display = 'none';
        card.style.opacity = '0';
      }
    });
  }

  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      filterProjects();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterProjects);
  }

  /* ==========================================================================
     11. PROJECT CASE STUDY LIGHTBOX MODAL
     ========================================================================== */
  const projectModal = document.getElementById('projectModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalProjectTitle = document.getElementById('modalProjectTitle');
  const modalProjectCategory = document.getElementById('modalProjectCategory');
  const modalProjectImg = document.getElementById('modalProjectImg');
  const modalMetric1 = document.getElementById('modalMetric1');
  const modalMetricLabel1 = document.getElementById('modalMetricLabel1');
  const modalMetric2 = document.getElementById('modalMetric2');
  const modalMetricLabel2 = document.getElementById('modalMetricLabel2');
  const modalMetric3 = document.getElementById('modalMetric3');
  const modalMetricLabel3 = document.getElementById('modalMetricLabel3');
  const modalProjectDescription = document.getElementById('modalProjectDescription');
  const modalProjectTools = document.getElementById('modalProjectTools');

  const projectDetails = {
    branding: {
      title: 'Brand Identity & Marketing Collaterals',
      category: 'Graphic Design & Typography',
      img: 'assets/project_graphic_design.jpg',
      m1: '+37%',
      ml1: 'Traffic Increase',
      m2: '4K Master',
      ml2: 'Resolution Quality',
      m3: '50+ Assets',
      ml3: 'Delivered Collateral',
      desc: 'Executed end-to-end brand guidelines, creative advertising posters, packaging design, and multi-channel social media creatives. Blending strong aesthetic sense, modern typography, and color psychology to elevate brand presence and maximize engagement.',
      tools: ['Photoshop', 'Illustrator', 'CorelDRAW', 'Typography', 'Print Collateral', 'Canva']
    },
    video: {
      title: 'Commercial Video Editing & Motion Graphics Suite',
      category: 'Premiere Pro & After Effects',
      img: 'assets/project_video_editing.jpg',
      m1: '+85%',
      ml1: 'Viewer Retention',
      m2: '60 FPS',
      ml2: 'Smooth Motion',
      m3: '100+ Edits',
      ml3: 'Completed Commercials',
      desc: 'Directing dynamic pacing, multi-layer timeline sequencing, audio mastering, and color grading. From viral social reels and YouTube video edits to corporate commercial explainers, ensuring every frame captivates audiences.',
      tools: ['Premiere Pro', 'After Effects', 'Color Grading', 'Sound Design', 'Motion Graphics', 'Transitions']
    },
    animation: {
      title: '3D Animation & Digital Character Illustration',
      category: 'Maya & Digital Illustration',
      img: 'assets/project_3d_animation.jpg',
      m1: 'Diploma',
      ml1: '3D Certified',
      m2: 'Maya 3D',
      ml2: 'Modeling & Rigging',
      m3: 'Vector Art',
      ml3: 'Animate CC Workflows',
      desc: 'Formally trained in 3D Animation at Arena Animation with hands-on expertise in Autodesk Maya. Creating 3D character assets, digital environment illustrations, and vector animations with precise lighting and spatial depth.',
      tools: ['Autodesk Maya', 'Animate CC', 'Digital Illustration', '3D Modeling', 'Photoshop']
    },
    saas: {
      title: 'SaaS Product Architecture & Visual Identity',
      category: 'Figma & Web Design',
      img: 'assets/saas_landing_page.jpg',
      m1: '+42%',
      ml1: 'Sign-up Conversion',
      m2: 'Figma Auto-Layout',
      ml2: 'Design System',
      m3: 'Pixel-Perfect',
      ml3: 'Responsive Matrix',
      desc: 'High-conversion visual landing page architecture, modular design components, and custom illustrations for B2B SaaS platforms. Engineered with glassmorphic depth and clear value proposition hierarchies.',
      tools: ['Figma', 'Photoshop', 'Illustrator', 'Web Design', 'Design Systems']
    },
    mobile: {
      title: 'Finova Mobile Financial App High-Fidelity Design',
      category: 'Mobile UX & Interface Design',
      img: 'assets/finova_mobile_app.jpg',
      m1: '4.9★',
      ml1: 'User Rating',
      m2: 'Dark Mode',
      ml2: 'OLED Luminous',
      m3: '12 Screens',
      ml3: 'Complete Prototype',
      desc: 'Comprehensive mobile fintech interface design featuring multi-tier biometric security states, dynamic spending graphs, and an elegant midnight glass aesthetic tailored for iOS and Android.',
      tools: ['Figma', 'Photoshop', 'Iconography', 'Mobile Design', 'Micro-Interactions']
    },
    dashboard: {
      title: 'Enterprise Analytics Intelligence Dashboard Visuals',
      category: 'Data Visualization & Information Architecture',
      img: 'assets/analytics_dashboard.jpg',
      m1: 'Real-Time',
      ml1: 'Telemetry Feeds',
      m2: 'Zero Clutter',
      ml2: 'Clean Spacing',
      m3: 'Enterprise',
      ml3: 'Ready Deliverables',
      desc: 'Modern corporate analytics layout featuring dense data charts, telemetry cards, and color-coded KPIs crafted to simplify complex executive metrics into immediate actionable insights.',
      tools: ['Figma', 'Illustrator', 'Infographics', 'Dashboard UI', 'Data Visuals']
    }
  };

  function openProjectModal(key) {
    const data = projectDetails[key];
    if (!data || !projectModal) return;

    modalProjectTitle.textContent = data.title;
    modalProjectCategory.textContent = data.category;
    modalProjectImg.src = data.img;
    modalProjectImg.alt = data.title;
    modalMetric1.textContent = data.m1;
    modalMetricLabel1.textContent = data.ml1;
    modalMetric2.textContent = data.m2;
    modalMetricLabel2.textContent = data.ml2;
    modalMetric3.textContent = data.m3;
    modalMetricLabel3.textContent = data.ml3;
    modalProjectDescription.textContent = data.desc;

    modalProjectTools.innerHTML = '';
    data.tools.forEach((tool) => {
      const badge = document.createElement('span');
      badge.className = 'pill-badge';
      badge.textContent = tool;
      modalProjectTools.appendChild(badge);
    });

    projectModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    playWhoosh();
  }

  function closeProjectModal() {
    if (!projectModal) return;
    projectModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  projectCards.forEach((card) => {
    card.addEventListener('click', () => {
      const key = card.getAttribute('data-project');
      if (key) openProjectModal(key);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeProjectModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProjectModal();
      closeCommandPalette();
    }
  });

  /* ==========================================================================
     12. INTERACTIVE PROJECT SCOPE & TIMELINE ESTIMATOR
     ========================================================================== */
  const scopeBtns = document.querySelectorAll('.opt-scope');
  const speedBtns = document.querySelectorAll('.opt-speed');
  const addonBtns = document.querySelectorAll('.opt-addon');

  const estTime = document.getElementById('estTime');
  const estDeliverables = document.getElementById('estDeliverables');
  const estComplexity = document.getElementById('estComplexity');
  const applyScopeBtn = document.getElementById('applyScopeBtn');

  let currentScope = 'video';
  let currentSpeed = 'standard';
  let selectedAddons = new Set(['grading']);

  function calculateEstimates() {
    let days = 6;
    let deliverables = 3;
    let complexity = 'Moderate';

    if (currentScope === 'branding') {
      days = 7;
      deliverables = 8;
      complexity = 'Comprehensive';
    } else if (currentScope === 'video') {
      days = 5;
      deliverables = 4;
      complexity = 'High Pacing';
    } else if (currentScope === '3d') {
      days = 12;
      deliverables = 2;
      complexity = 'Expert / VFX';
    } else if (currentScope === 'retainer') {
      days = 30;
      deliverables = 25;
      complexity = 'Dedicated Lead';
    }

    if (currentSpeed === 'priority') {
      days = Math.max(2, Math.floor(days * 0.5));
    } else if (currentSpeed === 'rush') {
      days = 1;
      complexity += ' (Blitz)';
    }

    deliverables += selectedAddons.size * 2;

    if (estTime) estTime.textContent = days === 1 ? '24 - 48 Hours' : `${days} - ${days + 2} Days`;
    if (estDeliverables) estDeliverables.textContent = `${deliverables}+ Master Assets`;
    if (estComplexity) estComplexity.textContent = complexity;
  }

  scopeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      scopeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentScope = btn.getAttribute('data-value');
      calculateEstimates();
    });
  });

  speedBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      speedBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentSpeed = btn.getAttribute('data-value');
      calculateEstimates();
    });
  });

  addonBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const val = btn.getAttribute('data-value');
      if (selectedAddons.has(val)) selectedAddons.delete(val);
      else selectedAddons.add(val);
      calculateEstimates();
    });
  });

  if (applyScopeBtn) {
    applyScopeBtn.addEventListener('click', () => {
      const scopeName = document.querySelector('.opt-scope.active .opt-title')?.textContent || 'Creative Project';
      const speedName = document.querySelector('.opt-speed.active .opt-title')?.textContent || 'Standard';

      const projectSelect = document.getElementById('projectType');
      const userMessage = document.getElementById('userMessage');

      if (projectSelect) {
        if (currentScope === 'branding') projectSelect.value = 'Graphic Design & Branding';
        else if (currentScope === 'video') projectSelect.value = 'Video Editing & Reels';
        else if (currentScope === '3d') projectSelect.value = 'Motion Graphics & 3D';
        else projectSelect.value = 'Full-Time Creative Role';
      }

      if (userMessage) {
        userMessage.value = `Hi Nilotpal,\n\nI used your interactive scope calculator. I am interested in:\n- Scope: ${scopeName}\n- Timeline: ${speedName}\n- Estimated Turnaround: ${estTime.textContent}\n- Key Addons: ${Array.from(selectedAddons).join(', ')}\n\nLooking forward to discussing our creative roadmap!`;
      }

      // Smooth scroll to contact
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        showToast('✓ Scope Applied to Inquiry Form Below!');
        const nameInput = document.getElementById('userName');
        if (nameInput) setTimeout(() => nameInput.focus(), 600);
      }
    });
  }

  /* ==========================================================================
     13. COMMAND PALETTE HUD (CMD+K / CTRL+K)
     ========================================================================== */
  const commandPalette = document.getElementById('commandPalette');
  const commandInput = document.getElementById('commandInput');
  const commandItems = document.querySelectorAll('.command-item');
  const openCmdBtn = document.getElementById('openCmdBtn');

  function openCommandPalette() {
    if (!commandPalette) return;
    commandPalette.classList.add('open');
    if (commandInput) {
      commandInput.value = '';
      commandInput.focus();
    }
    playWhoosh();
  }

  function closeCommandPalette() {
    if (!commandPalette) return;
    commandPalette.classList.remove('open');
  }

  if (openCmdBtn) openCmdBtn.addEventListener('click', openCommandPalette);

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (commandPalette && commandPalette.classList.contains('open')) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
    }
  });

  if (commandPalette) {
    commandPalette.addEventListener('click', (e) => {
      if (e.target === commandPalette) closeCommandPalette();
    });
  }

  if (commandInput) {
    commandInput.addEventListener('input', () => {
      const q = commandInput.value.toLowerCase().trim();
      commandItems.forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? 'flex' : 'none';
      });
    });
  }

  commandItems.forEach((item) => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      closeCommandPalette();

      if (action.startsWith('scroll:')) {
        const id = action.replace('scroll:', '');
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      } else if (action.startsWith('theme:')) {
        const theme = action.replace('theme:', '');
        document.body.className = '';
        if (theme !== 'theme-deep-space') document.body.classList.add(theme);
        playChime();
        showToast(`Atmosphere switched to ${theme.replace('theme-', '')}`);
      } else if (action === 'sfx') {
        if (sfxToggleBtn) sfxToggleBtn.click();
      } else if (action === 'confetti') {
        launchConfetti();
        showToast('🎉 Celebration Confetti Cannon Activated!');
      } else if (action === 'resume') {
        const link = document.createElement('a');
        link.href = 'assets/nilotpal_resume.pdf';
        link.download = 'Nilotpal_Saha_Resume.pdf';
        link.click();
      }
    });
  });

  /* ==========================================================================
     14. CONFETTI CANNON (PURE PROCEDURAL CANVAS)
     ========================================================================== */
  function launchConfetti() {
    const c = document.createElement('canvas');
    c.style.position = 'fixed';
    c.style.top = '0';
    c.style.left = '0';
    c.style.width = '100vw';
    c.style.height = '100vh';
    c.style.pointerEvents = 'none';
    c.style.zIndex = '99999';
    document.body.appendChild(c);

    const ctx = c.getContext('2d');
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    const pieces = [];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: c.width / 2,
        y: c.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rot: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        alpha: 1
      });
    }

    let frames = 0;
    function anim() {
      ctx.clearRect(0, 0, c.width, c.height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45; // gravity
        p.rot += p.vRot;
        p.alpha -= 0.012;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frames++;
      if (frames < 90) {
        requestAnimationFrame(anim);
      } else {
        c.remove();
      }
    }
    anim();
  }

  /* ==========================================================================
     15. CONTACT FORM SUBMISSION
     ========================================================================== */
  const contactForm = document.getElementById('contactForm');
  const sendBtn = document.getElementById('sendBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('userName').value.trim();
      const email = document.getElementById('userEmail').value.trim();
      const message = document.getElementById('userMessage').value.trim();

      if (!name || !email || !message) {
        showToast('Please fill in your name, email, and project message.');
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showToast('Please enter a valid email address.');
        return;
      }

      const originalHtml = sendBtn.innerHTML;
      sendBtn.innerHTML = `<span>Transmitting Brief...</span>`;
      sendBtn.disabled = true;

      setTimeout(() => {
        sendBtn.innerHTML = originalHtml;
        sendBtn.disabled = false;
        contactForm.reset();
        launchConfetti();
        playChime();
        showToast(`Thank you, ${name}! Your brief has been dispatched to Nilotpal Saha.`);
      }, 1200);
    });
  }

  // Copy Email Trigger
  const copyEmailTrigger = document.getElementById('copyEmailTrigger');
  if (copyEmailTrigger) {
    copyEmailTrigger.addEventListener('click', async () => {
      const email = 'sahanilotpal005@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        showToast('Copied sahanilotpal005@gmail.com to clipboard!');
      } catch (err) {
        showToast('Email: sahanilotpal005@gmail.com');
      }
    });
  }

  // Mobile Menu Toggle
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const navMenu = document.getElementById('navMenu');
  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });
    navMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => navMenu.classList.remove('mobile-open'));
    });
  }

  // 3D Perspective Tilt on Interactive Cards
  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Current year in footer
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
