/**
 * ZERO UNIVERSITY — 2026 COMPLETE PRODUCTION CREATIVE ENGINE
 * Recreating why.zero.university (Awwwards Site of the Day September 2026)
 * Built with authentic extracted models, KTX2 Basis Universal textures,
 * post-processing bloom, the Under 3D City, Volumetric Clouds, and Energy Beacon.
 */

import * as THREE from 'three';
import { KTX2Loader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/KTX2Loader.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/DRACOLoader.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/postprocessing/UnrealBloomPass.js';

// ==========================================================================
// 1. AUTHENTIC AUDIO ENGINE (Multi-Stage Ambient & Authentic SFX)
// ==========================================================================
class ZeroProductionAudio {
  constructor() {
    this.ambientTracks = {
      stage1: new Audio('assets/audio/amb_stage1.mp3'),
      stage2: new Audio('assets/audio/amb_stage2-3.mp3'),
      stage4: new Audio('assets/audio/amb_stage4-5.mp3'),
      stage5: new Audio('assets/audio/amb_stage5.mp3')
    };

    Object.values(this.ambientTracks).forEach(t => {
      t.loop = true;
      t.volume = 0;
    });

    this.currentAmbientKey = null;

    this.sfx = {
      unlock: new Audio('assets/audio/fx_loader.mp3'),
      drag: new Audio('assets/audio/fx_loader-drag.mp3'),
      shatter: new Audio('assets/audio/fx_glass-shatter.mp3'),
      burn: new Audio('assets/audio/fx_money-burn.mp3'),
      tunnel: new Audio('assets/audio/fx_tunnel.mp3'),
      whoosh: new Audio('assets/audio/fx_whoosh.mp3'),
      topup: new Audio('assets/audio/fx_xp-topup.mp3')
    };

    this.sfx.unlock.volume = 0.85;
    this.sfx.drag.volume = 0.35;
    this.sfx.shatter.volume = 0.85;
    this.sfx.burn.volume = 0.45;
    this.sfx.burn.loop = true;
    this.sfx.tunnel.volume = 0.7;
    this.sfx.whoosh.volume = 0.5;
    this.sfx.topup.volume = 0.75;

    this.isMuted = false;
    this.hasUnlocked = false;
  }

  setAmbientStage(stageKey) {
    if (this.isMuted || !this.hasUnlocked) return;
    if (this.currentAmbientKey === stageKey) return;

    if (this.currentAmbientKey && this.ambientTracks[this.currentAmbientKey]) {
      const prev = this.ambientTracks[this.currentAmbientKey];
      if (window.gsap) {
        gsap.to(prev, {
          volume: 0,
          duration: 1.2,
          onComplete: () => prev.pause()
        });
      } else {
        prev.pause();
      }
    }

    this.currentAmbientKey = stageKey;
    const next = this.ambientTracks[stageKey];
    if (next) {
      next.play().then(() => {
        if (window.gsap) gsap.to(next, { volume: 0.55, duration: 1.2 });
        else next.volume = 0.55;
      }).catch(() => {});
    }
  }

  playSFX(name) {
    if (this.isMuted || !this.sfx[name]) return;
    try {
      if (name === 'burn') {
        if (this.sfx.burn.paused) this.sfx.burn.play().catch(() => {});
      } else {
        const sound = this.sfx[name];
        sound.currentTime = 0;
        sound.play().catch(() => {});
      }
    } catch(e) {}
  }

  stopSFX(name) {
    if (this.sfx[name]) {
      try {
        this.sfx[name].pause();
        this.sfx[name].currentTime = 0;
      } catch(e) {}
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      Object.values(this.ambientTracks).forEach(t => t.pause());
      this.sfx.burn.pause();
    } else {
      if (this.currentAmbientKey && this.ambientTracks[this.currentAmbientKey]) {
        this.ambientTracks[this.currentAmbientKey].play().catch(() => {});
      }
    }
    return !this.isMuted;
  }
}

const prodAudio = new ZeroProductionAudio();

// ==========================================================================
// 2. GESTURE UNLOCK ENGINE (Draw "0" on Frost Overlay)
// ==========================================================================
class GestureUnlockEngine {
  constructor(onUnlockCallback) {
    this.overlay = document.getElementById('draw-overlay');
    this.canvas = document.getElementById('draw-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.trackerCircle = document.getElementById('tracker-progress');
    this.onUnlock = onUnlockCallback;
    this.isDrawing = false;
    this.points = [];
    this.isUnlocked = false;

    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.bindEvents();
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  bindEvents() {
    const start = (e) => {
      if (this.isUnlocked) return;
      this.isDrawing = true;
      this.points = [];
      const pt = this.getPoint(e);
      this.points.push(pt);
      this.clearCanvas();
    };

    const move = (e) => {
      if (!this.isDrawing || this.isUnlocked) return;
      const pt = this.getPoint(e);
      this.points.push(pt);
      this.drawTrail();
      prodAudio.playSFX('drag');

      const progress = Math.min(1.0, this.points.length / 28);
      if (this.trackerCircle) {
        const offset = 176 - (176 * progress);
        this.trackerCircle.style.strokeDashoffset = offset;
      }

      if (this.points.length > 25 && this.isCircleClosed()) {
        this.unlock();
      }
    };

    const end = () => {
      if (this.isUnlocked) return;
      this.isDrawing = false;
      if (this.trackerCircle) this.trackerCircle.style.strokeDashoffset = 176;
      setTimeout(() => this.clearCanvas(), 300);
    };

    this.canvas.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);

    this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); start(e.touches[0]); }, { passive: false });
    window.addEventListener('touchmove', (e) => { if (this.isDrawing) move(e.touches[0]); }, { passive: true });
    window.addEventListener('touchend', end);

    const skipBtn = document.getElementById('skip-unlock-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.unlock();
      });
    }

    // Auto-unlock on wheel / trackpad scroll
    window.addEventListener('wheel', () => {
      if (!this.isUnlocked) this.unlock();
    }, { once: true, passive: true });
  }

  getPoint(e) {
    return { x: e.clientX, y: e.clientY };
  }

  drawTrail() {
    if (!this.ctx || this.points.length < 2) return;
    this.ctx.strokeStyle = 'rgba(34, 211, 238, 0.85)';
    this.ctx.lineWidth = 6;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.shadowColor = '#22d3ee';
    this.ctx.shadowBlur = 14;

    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      this.ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    this.ctx.stroke();
  }

  clearCanvas() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  isCircleClosed() {
    const first = this.points[0];
    const last = this.points[this.points.length - 1];
    const dist = Math.hypot(first.x - last.x, first.y - last.y);
    return dist < 80;
  }

  unlock() {
    if (this.isUnlocked) return;
    this.isUnlocked = true;
    prodAudio.hasUnlocked = true;
    prodAudio.playSFX('unlock');

    if (window.gsap && this.overlay) {
      gsap.to(this.overlay, {
        opacity: 0,
        duration: 0.85,
        ease: 'power2.inOut',
        onComplete: () => {
          this.overlay.style.display = 'none';
          if (this.onUnlock) this.onUnlock();
        }
      });
    } else if (this.overlay) {
      this.overlay.style.display = 'none';
      if (this.onUnlock) this.onUnlock();
    }
  }
}

// ==========================================================================
// 3. SHADER ENGINE: SIMPLEX FBM NOISE PAPER BURN (yb + bb reverse-engineered)
// ==========================================================================
function createBurnMaterial(baseTexture, options = {}) {
  const {
    direction = 'in2out',
    aspect = 1.0,
    emberColor = [0.651, 1.0, 0.835], // #a6ffd5
    emberTip = [1.0, 1.0, 1.0],
    charColor = [0.02, 0.05, 0.03],
    seed = 0.0,
    burnDelay = 0.0,
    burnSpeed = 1.0
  } = options;

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  const fragmentShader = `
    uniform sampler2D uTexture;
    uniform float uBurnProgress;
    uniform float uTime;
    uniform float uSeed;
    uniform float uAspect;
    uniform vec3 uEmberColor;
    uniform vec3 uEmberTip;
    uniform vec3 uCharColor;
    varying vec2 vUv;
    varying vec3 vNormal;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m * m; m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    float fbm(vec2 p) {
      float total = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 4; i++) {
        total += snoise(p) * amp;
        p *= 2.15;
        amp *= 0.48;
      }
      return total;
    }

    void main() {
      vec2 uv = vUv;
      float noise = fbm(uv * 4.5 + vec2(uSeed, uTime * 0.05));
      vec2 center = vec2(0.5, 0.5);
      vec2 aspectUv = vec2((uv.x - center.x) * uAspect + center.x, uv.y);
      float dist = length(aspectUv - center);

      ${direction === 'in2out' 
        ? 'float burnFront = dist * 1.8 + noise * 0.35;'
        : 'float burnFront = (1.0 - dist * 1.5) + noise * 0.35;'
      }

      float threshold = uBurnProgress * 1.5;
      if (burnFront < threshold - 0.18) {
        discard;
      }

      vec4 texColor = texture2D(uTexture, vUv);
      float emberDist = burnFront - (threshold - 0.18);
      float emberFactor = clamp(1.0 - (emberDist / 0.18), 0.0, 1.0);

      if (emberFactor > 0.0) {
        vec3 ember = mix(uEmberColor, uEmberTip, pow(emberFactor, 2.5));
        vec3 charGrad = mix(uCharColor, ember, emberFactor);
        texColor.rgb = mix(texColor.rgb, charGrad, clamp(emberFactor * 1.4, 0.0, 1.0));
        texColor.rgb += ember * pow(emberFactor, 3.0) * 4.2;
      }

      gl_FragColor = texColor;
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTexture: { value: baseTexture },
      uBurnProgress: { value: 0.0 },
      uTime: { value: 0.0 },
      uSeed: { value: seed },
      uAspect: { value: aspect },
      uEmberColor: { value: new THREE.Vector3(...emberColor) },
      uEmberTip: { value: new THREE.Vector3(...emberTip) },
      uCharColor: { value: new THREE.Vector3(...charColor) }
    },
    transparent: true,
    side: THREE.DoubleSide
  });
}

// Authentic Stage 3 floating money note positions from live bundle
const LX_MONEY_SHREDS = [
  { position: [.022, 0, 0], rotation: [0, 0, 0], scale: 1.0, burnStart: .3, burnEnd: 1.5 },
  { position: [.2, .05, -.3], rotation: [15, -25, 35], scale: .8, burnStart: .15, burnEnd: .9 },
  { position: [-.2, -.15, -.15], rotation: [-20, 45, -60], scale: .9, burnStart: .25, burnEnd: 1.25 },
  { position: [.1, .1, .15], rotation: [25, -45, -40], scale: 1.0, burnStart: .1, burnEnd: 1.3 },
  { position: [.05, -.07, .6], rotation: [-15, 20, 30], scale: .85, burnStart: .2, burnEnd: 1.5 },
  { position: [-.05, .3, -.3], rotation: [-15, 20, 30], scale: .85, burnStart: .2, burnEnd: 1.5 },
  { position: [.4, -.2, -.1], rotation: [30, -40, 20], scale: .75, burnStart: .35, burnEnd: 1.2 },
  { position: [-.35, .25, -.15], rotation: [-25, 35, -45], scale: .7, burnStart: .4, burnEnd: 1.3 },
  { position: [.15, -.3, -.2], rotation: [40, -20, 55], scale: .65, burnStart: .45, burnEnd: 1.4 },
  { position: [-.25, .15, -.25], rotation: [-35, 50, -30], scale: .72, burnStart: .38, burnEnd: 1.25 }
];

// Cloud slices from why.zero.university (vS array)
const CLOUD_SLICES = [
  { u: 0/2048, v: 1 - 570/2048, w: 1019/2048, h: 570/2048, aspect: 1019/570 },
  { u: 1028/2048, v: 1 - 569/2048, w: 1020/2048, h: 569/2048, aspect: 1020/569 },
  { u: 0/2048, v: 1 - 961/2048, w: 973/2048, h: 377/2048, aspect: 973/377 },
  { u: 928/2048, v: 1 - 1487/2048, w: 1120/2048, h: 411/2048, aspect: 1120/411 },
  { u: 0/2048, v: 1 - 2002/2048, w: 973/2048, h: 515/2048, aspect: 973/515 },
  { u: 1053/2048, v: 1 - 2002/2048, w: 995/2048, h: 505/2048, aspect: 995/505 }
];

// Stage 5 Coordinates & Shaders
const eD = { x: -0.008, y: -0.017, sizeX: 1.73, sizeY: 0.91 };
const cD = { towerColor: '#4dff4d', towerOpacity: 1.6, rippleColor: '#4dff4d', rippleOpacity: 0.5 };
const sD = 0x4dff4d;

const uD_vertex = `
  varying vec2 vLocal;
  void main() {
    vLocal = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const dD_fragment = `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uOuterR;
  varying vec2 vLocal;
  void main() {
    float r = length(vLocal) / uOuterR;
    float alpha = pow(smoothstep(0.78, 0.95, r), 2.5) * uOpacity;
    gl_FragColor = vec4(uColor * alpha, alpha);
  }
`;

const gD_vertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const _D_fragment = `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uBaseAlpha;
  uniform float uCapR;
  uniform float uHeight;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float u = vUv.x * 2.0 - 1.0;
    float arc = sqrt(max(0.0, 1.0 - u * u));
    float botC = uCapR;
    float topFull = 1.0 - uCapR;
    float topC = mix(botC, topFull, clamp(uHeight, 0.0, 1.0));
    if (vUv.y > topC + uCapR * arc) discard;
    if (vUv.y < botC - uCapR * arc) discard;
    float span = max(topC - botC, 1e-4);
    float vGrad = clamp((topC - vUv.y) / span, 0.0, 1.0);
    float shade = 0.45 + 0.55 * arc;
    float a = vGrad * shade * uBaseAlpha * step(0.0001, uHeight);
    float h = clamp(((vUv.y + uCapR * arc) - botC) / span, 0.0, 1.0);
    float wd = abs(h - fract(uTime * 0.22));
    wd = min(wd, 1.0 - wd);
    float wave = 1.0 - smoothstep(0.0, 0.16, wd);
    a *= 1.0 + wave * 1.1;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

const mD_vertex = `
  uniform float uTime;
  uniform float uRiseH;
  uniform float uVh;
  attribute vec3 aInfo;
  varying float vAlpha;
  void main() {
    float t = fract(uTime * aInfo.x + aInfo.y);
    vec3 p = position;
    p.y += t * uRiseH;
    p.x += sin((t + aInfo.y) * 12.566) * uRiseH * 0.02;
    vAlpha = smoothstep(0.0, 0.15, t) * (1.0 - smoothstep(0.6, 1.0, t));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aInfo.z * uVh * projectionMatrix[1][1] * 0.5;
  }
`;

const hD_fragment = `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uAlpha;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.1, d) * vAlpha * uAlpha;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

// Dynamic ribbon canvas generator for top beacon rim
function createWaitlistRibbonTexture() {
  const w = 2048, h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#4dff4d';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 88px monospace';
  
  const text = 'JOIN THE WAITLIST';
  ctx.fillText(text, w * 0.25, h * 0.52);
  ctx.fillText(text, w * 0.75, h * 0.52);
  ctx.fillText('•', w * 0.5, h * 0.5);
  ctx.fillText('•', 0, h * 0.5);
  ctx.fillText('•', w, h * 0.5);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;
  return texture;
}

// ==========================================================================
// 4. THREE.JS PRODUCTION WORLD
// ==========================================================================
class ZeroProductionWorld {
  constructor() {
    this.canvas = document.getElementById('webgl');
    this.scene = new THREE.Scene();

    // Perspective Camera (Blender FOV 24.3°)
    this.camera = new THREE.PerspectiveCamera(24.3, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Orthographic Camera for Stage 5 City Map View
    const aspect = window.innerWidth / window.innerHeight;
    const orthoSize = 4.0;
    this.orthoCamera = new THREE.OrthographicCamera(-orthoSize * aspect, orthoSize * aspect, orthoSize, -orthoSize, 0.1, 100);
    this.orthoCamera.position.set(0, 0, 5);
    this.orthoCamera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });

    this.scrollProgress = 0;
    this.targetScroll = 0;
    this.clock = new THREE.Clock();

    // Draco & KTX2 Basis Universal Loaders
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('vendor/draco/');

    this.ktx2Loader = new KTX2Loader();
    this.ktx2Loader.setTranscoderPath('vendor/basis/');
    this.ktx2Loader.detectSupport(this.renderer);

    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
    this.gltfLoader.setKTX2Loader(this.ktx2Loader);

    this.textureLoader = new THREE.TextureLoader();

    // Post-Processing Composer (UnrealBloomPass)
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.35,  // strength
      0.85,  // radius
      0.22   // threshold
    );
    this.composer.addPass(this.bloomPass);

    // Mouse Tracking for Parallax
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // Stage 1 Objects
    this.cam1Action = null;
    this.cam1Mixer = null;
    this.cam1Duration = 18.57;
    this.cam1Ref = null;
    this.fancyHandGroup = null;
    this.fancyHandMixer = null;
    this.humanHandGroup = null;
    this.humanHandMixer = null;
    this.palmPortalMesh = null;
    this.palmBurnMaterial = null;
    this.gardenGroup = new THREE.Group();

    // Stage 2 Glass Shatter
    this.glassGroup = null;
    this.glassMixer = null;
    this.glassAction = null;
    this.glassDuration = 1.0;
    this.glassShards = [];

    // Stage 3 Money Notes Vortex
    this.moneyNotes = [];

    // Stage 4 Tunnel & Clouds
    this.cam2Action = null;
    this.cam2Mixer = null;
    this.cam2Duration = 16.33;
    this.cam2Ref = null;
    this.tunnelModel = null;
    this.tunnelMaterial = null;
    this.cloudsGroup = new THREE.Group();
    this.cloudMeshes = [];

    // Stage 4 & 5 Under 3D City & Energy Beacon
    this.worldGroup = new THREE.Group();
    this.cityImage = null;
    this.stage5CityPlane = null;
    this.beaconGroup = new THREE.Group();
    this.rippleRings = [];
    this.towerMesh = null;
    this.towerParticles = null;
    this.topRibbonMesh = null;

    // Stage 5 Interactive Map Navigation State
    this.mapPan = { x: 0, y: 0 };
    this.mapPanTarget = { x: 0, y: 0 };
    this.mapZoom = 4.0;
    this.mapZoomTarget = 4.0;
    this.isDraggingMap = false;
    this.dragStart = { x: 0, y: 0 };

    // Floating Embers Particles
    this.embersParticles = null;

    this.currentActiveStage = 1;
    this.shatterSfxPlayed = false;

    this.initRenderer();
    this.setupLighting();
    this.createEmbersField();
    this.loadProductionPipeline();
    this.bindInteractions();
    this.render();
  }

  initRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.composer.setSize(window.innerWidth, window.innerHeight);

    this.camera.position.set(1.1826, 0.9288, 0.3920);
    this.camera.quaternion.set(0.0064455, 0.7185957, -0.0066608, 0.6953662);

    window.addEventListener('resize', () => {
      const w = window.innerWidth, h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();

      const orthoAspect = w / h;
      this.orthoCamera.left = -this.mapZoom * orthoAspect;
      this.orthoCamera.right = this.mapZoom * orthoAspect;
      this.orthoCamera.top = this.mapZoom;
      this.orthoCamera.bottom = -this.mapZoom;
      this.orthoCamera.updateProjectionMatrix();

      this.renderer.setSize(w, h);
      this.composer.setSize(w, h);
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0xd4f6eb, 1.8);
    this.scene.add(ambient);

    const keySpot = new THREE.SpotLight(0xffffff, 3.5);
    keySpot.position.set(5, 10, 8);
    keySpot.angle = Math.PI / 4;
    keySpot.penumbra = 0.5;
    this.scene.add(keySpot);

    const cyanRim = new THREE.PointLight(0x22d3ee, 4.2, 25);
    cyanRim.position.set(-4, 2, -2);
    this.scene.add(cyanRim);

    this.palmLight = new THREE.PointLight(0x34d399, 2.5, 8);
    this.palmLight.position.set(0.564, 0.947, 0.4);
    this.scene.add(this.palmLight);
  }

  createEmbersField() {
    const count = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 24;

      velocities[i * 3] = (Math.random() - 0.5) * 0.008;
      velocities[i * 3 + 1] = 0.008 + Math.random() * 0.015;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.008;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const material = new THREE.PointsMaterial({
      color: 0xa7f3d0,
      size: 0.075,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.embersParticles = new THREE.Points(geometry, material);
    this.scene.add(this.embersParticles);
  }

  loadProductionPipeline() {
    const matcapHand = this.textureLoader.load('assets/textures/matcap-hand.webp');
    const matcapCert = this.textureLoader.load('assets/textures/matcap-certificate.webp');

    // 1. CAMERA 1 (assets/models/camera_1.glb)
    this.gltfLoader.load('assets/models/camera_1.glb', (gltf) => {
      console.log('✓ Camera_1 loaded');
      gltf.scene.traverse((node) => {
        if (node.name === 'Camera' && (node.isCamera || node.isPerspectiveCamera)) {
          this.cam1Ref = node;
          this.cam1Ref.aspect = window.innerWidth / window.innerHeight;
          this.cam1Ref.updateProjectionMatrix();
        }
      });
      if (gltf.animations && gltf.animations.length > 0) {
        const clip = gltf.animations[0];
        this.cam1Duration = clip.duration || 18.57;
        this.cam1Mixer = new THREE.AnimationMixer(gltf.scene);
        this.cam1Action = this.cam1Mixer.clipAction(clip);
        this.cam1Action.play();
        this.cam1Action.paused = true;
      }
      this.scene.add(gltf.scene);
    });

    // 2. CAMERA 2 (assets/models/camera_2.glb)
    this.gltfLoader.load('assets/models/camera_2.glb', (gltf) => {
      console.log('✓ Camera_2 loaded');
      gltf.scene.traverse((node) => {
        if ((node.name === 'Camera.001' || node.name === 'Camera') && (node.isCamera || node.isPerspectiveCamera)) {
          this.cam2Ref = node;
          this.cam2Ref.aspect = window.innerWidth / window.innerHeight;
          this.cam2Ref.updateProjectionMatrix();
        }
      });
      if (gltf.animations && gltf.animations.length > 0) {
        const clip = gltf.animations[0];
        this.cam2Duration = clip.duration || 16.33;
        this.cam2Mixer = new THREE.AnimationMixer(gltf.scene);
        this.cam2Action = this.cam2Mixer.clipAction(clip);
        this.cam2Action.play();
        this.cam2Action.paused = true;
      }
      this.scene.add(gltf.scene);
    });

    // 3. FANCY HAND (assets/models/fancy_hand_2.glb)
    this.gltfLoader.load('assets/models/fancy_hand_2.glb', (gltf) => {
      console.log('✓ Fancy Hand loaded');
      this.fancyHandGroup = gltf.scene;

      const handMat = new THREE.MeshMatcapMaterial({
        matcap: matcapHand,
        color: 0xffffff,
        transparent: true
      });

      this.fancyHandGroup.traverse((child) => {
        if (child.isMesh || child.isSkinnedMesh) {
          const mat = handMat.clone();
          if (child.isSkinnedMesh) mat.skinning = true;
          child.material = mat;
        }
      });

      if (gltf.animations && gltf.animations.length > 0) {
        this.fancyHandMixer = new THREE.AnimationMixer(this.fancyHandGroup);
        const action = this.fancyHandMixer.clipAction(gltf.animations[0]);
        action.play();
      }

      this.scene.add(this.fancyHandGroup);
    });

    // 4. HUMAN HAND 1 (assets/models/human_hand_1.glb)
    this.gltfLoader.load('assets/models/human_hand_1.glb', (gltf) => {
      console.log('✓ Human Hand 1 loaded');
      this.humanHandGroup = gltf.scene;
      const handMat = new THREE.MeshMatcapMaterial({ matcap: matcapHand, color: 0xffffff, transparent: true });
      this.humanHandGroup.traverse((child) => {
        if (child.isMesh || child.isSkinnedMesh) {
          const mat = handMat.clone();
          if (child.isSkinnedMesh) mat.skinning = true;
          child.material = mat;
        }
      });
      if (gltf.animations && gltf.animations.length > 0) {
        this.humanHandMixer = new THREE.AnimationMixer(this.humanHandGroup);
        const action = this.humanHandMixer.clipAction(gltf.animations[0]);
        action.play();
      }
      this.scene.add(this.humanHandGroup);
    });

    // 5. STAGE 1 PALM BURNING PORTAL
    this.palmBurnMaterial = createBurnMaterial(matcapCert, {
      direction: 'in2out',
      aspect: 1.0,
      emberColor: [0.651, 1.0, 0.835],
      emberTip: [1.0, 1.0, 1.0],
      charColor: [0.02, 0.05, 0.03],
      seed: 0,
      burnDelay: 0,
      burnSpeed: 1.0
    });
    this.palmPortalMesh = new THREE.Mesh(new THREE.CircleGeometry(0.46, 64), this.palmBurnMaterial);
    this.palmPortalMesh.position.set(0.5643, 0.947, 0.4);
    this.palmPortalMesh.rotation.y = Math.PI / 2;
    this.palmPortalMesh.scale.set(1.5, 1.5, 1.5);
    this.scene.add(this.palmPortalMesh);

    // 6. STAGE 1 BOTANICAL PARALLAX GARDEN (assets/atlases/garden-godrays.ktx2)
    this.ktx2Loader.load('assets/atlases/garden-godrays.ktx2', (texture) => {
      console.log('✓ Stage 1 Garden Atlas loaded');
      this.buildBotanicalGarden(texture);
    }, undefined, () => console.warn('garden-godrays.ktx2 load fallback'));

    // 7. STAGE 2 GLASS SHATTER (assets/models/stage2_glass-shatter.glb)
    this.gltfLoader.load('assets/models/stage2_glass-shatter.glb', (gltf) => {
      console.log('✓ Stage 2 Glass Shatter loaded (98 Voronoi cells)');
      this.glassGroup = gltf.scene;
      this.glassGroup.position.set(0, -0.3, 0);

      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xa5f3fc,
        transmission: 0.92,
        roughness: 0.06,
        thickness: 0.8,
        transparent: true,
        opacity: 0.88,
        ior: 1.52,
        reflectivity: 0.9
      });

      this.glassGroup.traverse((child) => {
        if (child.isMesh) {
          child.material = glassMat;
          this.glassShards.push(child);
        }
      });

      if (gltf.animations && gltf.animations.length > 0) {
        const clip = gltf.animations[0];
        this.glassDuration = clip.duration || 1.0;
        this.glassMixer = new THREE.AnimationMixer(this.glassGroup);
        this.glassAction = this.glassMixer.clipAction(clip);
        this.glassAction.play();
        this.glassAction.paused = true;
      }

      this.scene.add(this.glassGroup);
    });

    // 8. STAGE 3 FLOATING DEGREE NOTES
    const noteGeo = new THREE.PlaneGeometry(0.345, 0.15, 16, 8);
    const degToRad = Math.PI / 180;

    LX_MONEY_SHREDS.forEach((item, index) => {
      const noteMat = createBurnMaterial(matcapCert, {
        direction: 'out2in',
        aspect: 2.3,
        seed: index * 0.33,
        burnDelay: 0.1 * index,
        burnSpeed: 1.2
      });

      const mesh = new THREE.Mesh(noteGeo, noteMat);
      mesh.position.set(item.position[0] * 3.5, item.position[1] * 3.5 - 2.5, item.position[2] * 3.5 - 4.0);
      mesh.rotation.set(item.rotation[0] * degToRad, item.rotation[1] * degToRad, item.rotation[2] * degToRad);
      mesh.scale.setScalar(item.scale * 1.8);
      mesh.userData = {
        initPos: mesh.position.clone(),
        burnMat: noteMat,
        rotSeed: Math.random() * 2
      };

      this.moneyNotes.push(mesh);
      this.scene.add(mesh);
    });

    // 9. STAGE 4 WARP TUNNEL (assets/models/tunnel_new_new.glb)
    this.gltfLoader.load('assets/models/tunnel_new_new.glb', (gltf) => {
      console.log('✓ Stage 4 Tunnel loaded');
      this.tunnelModel = gltf.scene;
      this.tunnelModel.position.set(0, -1.0, -18);
      this.tunnelModel.scale.set(12, 12, 12);

      this.tunnelMaterial = new THREE.MeshStandardMaterial({
        color: 0x064e3b,
        emissive: 0x10b981,
        emissiveIntensity: 0.65,
        roughness: 0.25,
        wireframe: true
      });

      this.tunnelModel.traverse((child) => {
        if (child.isMesh) child.material = this.tunnelMaterial;
      });

      this.scene.add(this.tunnelModel);
    });

    // 10. STAGE 4 FLOATING VOLUMETRIC CLOUDS (assets/atlases/clouds.ktx2)
    this.ktx2Loader.load('assets/atlases/clouds.ktx2', (texture) => {
      console.log('✓ Clouds Atlas loaded');
      this.buildCloudsSystem(texture);
    }, undefined, () => console.warn('clouds.ktx2 load fallback'));

    // 11. THE UNDER 3D CITY & ENERGY BEACON (assets/atlases/world.ktx2)
    this.ktx2Loader.load('assets/atlases/world.ktx2', (texture) => {
      console.log('✓ Under 3D City Atlas loaded (8192x4096)');
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      this.buildCityAndBeacon(texture);
    }, undefined, (err) => console.error('world.ktx2 load error:', err));
  }

  // Botanical Garden Parallax Generator (6 Layers from bundle)
  buildBotanicalGarden(atlasTexture) {
    const lx = 4096, ux = 2661;
    const layers = [
      { rect: [2382, 19, 1714, 1714], pos: [0.5, 0.55], scale: 3.2, z: -3.8 },
      { rect: [0, 2, 1751, 815], pos: [0.5, 0.0], scale: 3.0, z: -2.8 },
      { rect: [0, 819, 1751, 531], pos: [0.5, 0.23], scale: 2.8, z: -2.2 },
      { rect: [0, 1354, 1751, 547], pos: [0.5, 0.28], scale: 2.6, z: -1.6 },
      { rect: [2048, 0, 325, 629], pos: [0.72, 0.54], scale: 1.8, z: -1.2 },
      { rect: [1760, 0, 269, 538], pos: [0.28, 0.54], scale: 1.9, z: -1.0 }
    ];

    layers.forEach((l, idx) => {
      const [rx, ry, rw, rh] = l.rect;
      const uScale = rw / lx;
      const vScale = rh / ux;
      const uOffset = rx / lx;
      const vOffset = 1.0 - (ry + rh) / ux;

      const layerTex = atlasTexture.clone();
      layerTex.offset.set(uOffset, vOffset);
      layerTex.repeat.set(uScale, vScale);
      layerTex.needsUpdate = true;

      const aspect = rw / rh;
      const geo = new THREE.PlaneGeometry(l.scale, l.scale / aspect);
      const mat = new THREE.MeshBasicMaterial({
        map: layerTex,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((l.pos[0] - 0.5) * 3.5, (l.pos[1] - 0.5) * 3.5 + 0.8, l.z);
      mesh.userData = { basePos: mesh.position.clone(), depthFactor: 0.05 * (idx + 1) };
      this.gardenGroup.add(mesh);
    });

    this.scene.add(this.gardenGroup);
  }

  // Floating Volumetric Cloud System
  buildCloudsSystem(atlasTexture) {
    const cloudCount = 32;
    for (let i = 0; i < cloudCount; i++) {
      const slice = CLOUD_SLICES[i % CLOUD_SLICES.length];
      const tex = atlasTexture.clone();
      tex.offset.set(slice.u, slice.v);
      tex.repeat.set(slice.w, slice.h);
      tex.needsUpdate = true;

      const width = 4.5 + Math.random() * 6.5;
      const height = width / slice.aspect;
      const geo = new THREE.PlaneGeometry(width, height);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.35 + Math.random() * 0.45,
        depthWrite: false,
        blending: THREE.NormalBlending
      });

      const mesh = new THREE.Mesh(geo, mat);
      const z = -4.0 - Math.random() * 36;
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 16 - 2,
        z
      );
      mesh.userData = {
        speedX: 0.003 + Math.random() * 0.008,
        bobPhase: Math.random() * Math.PI * 2,
        baseY: mesh.position.y
      };

      this.cloudMeshes.push(mesh);
      this.cloudsGroup.add(mesh);
    }
    this.scene.add(this.cloudsGroup);
  }

  // Under 3D City Plane & Zero University Beacon System
  buildCityAndBeacon(cityTexture) {
    const cityAspect = 8192 / 4096; // 2.0
    const cityHeight = 10.0;
    const cityWidth = cityHeight * cityAspect; // 20.0

    // 1. Stage 4 Under City Flyover Plane (At Z = -40)
    const stage4CityGeo = new THREE.PlaneGeometry(cityWidth * 2.5, cityHeight * 2.5);
    const stage4CityMat = new THREE.MeshBasicMaterial({
      map: cityTexture,
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });
    this.cityImage = new THREE.Mesh(stage4CityGeo, stage4CityMat);
    this.cityImage.position.set(0, -5, 0.01);
    this.worldGroup.name = 'world';
    this.worldGroup.position.set(0, 0, -40);
    this.worldGroup.add(this.cityImage);
    this.scene.add(this.worldGroup);

    // 2. Stage 5 Overhead/Orthographic City Map Plane
    const stage5CityGeo = new THREE.PlaneGeometry(cityWidth, cityHeight);
    const stage5CityMat = new THREE.MeshBasicMaterial({
      map: cityTexture,
      depthWrite: false
    });
    this.stage5CityPlane = new THREE.Mesh(stage5CityGeo, stage5CityMat);
    this.stage5CityPlane.position.set(0, 0, 0);

    // 3. Target Base Outer Ring
    const targetR = cityHeight * 0.075; // 0.75
    const outerRingGeo = new THREE.RingGeometry(targetR - 0.006, targetR, 96);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x4dff4d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRingMesh.position.set(eD.x * cityHeight, eD.y * cityHeight, 0.02);
    this.beaconGroup.add(outerRingMesh);

    // Target backdrop soft disc
    const softDiscGeo = new THREE.CircleGeometry(targetR, 64);
    const softDiscMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      depthWrite: false
    });
    const softDiscMesh = new THREE.Mesh(softDiscGeo, softDiscMat);
    softDiscMesh.position.set(eD.x * cityHeight, eD.y * cityHeight, 0.01);
    this.beaconGroup.add(softDiscMesh);

    // 4. Concentric Ripple Rings (3 expanding rings)
    const rippleGeo = new THREE.CircleGeometry(targetR, 64);
    for (let i = 0; i < 3; i++) {
      const rippleMat = new THREE.ShaderMaterial({
        vertexShader: uD_vertex,
        fragmentShader: dD_fragment,
        uniforms: {
          uColor: { value: new THREE.Color(cD.rippleColor) },
          uOpacity: { value: 0.8 },
          uOuterR: { value: targetR }
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
      rippleMesh.position.set(eD.x * cityHeight, eD.y * cityHeight, 0.015);
      rippleMesh.userData = { phase: i * 0.33 };
      this.rippleRings.push(rippleMesh);
      this.beaconGroup.add(rippleMesh);
    }

    // 5. 3D Rising Isometric Light Cylinder / Energy Tower
    const g = targetR * eD.sizeX;
    const _ = targetR * eD.sizeY;
    const fD = 3.4;
    const v = g * fD;
    const y = v + 2 * _;

    const towerGeo = new THREE.PlaneGeometry(g * 2, y);
    const towerMat = new THREE.ShaderMaterial({
      vertexShader: gD_vertex,
      fragmentShader: _D_fragment,
      uniforms: {
        uColor: { value: new THREE.Color(cD.towerColor) },
        uBaseAlpha: { value: cD.towerOpacity },
        uCapR: { value: _ / y },
        uHeight: { value: 0.0 },
        uTime: { value: 0.0 }
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    this.towerMesh = new THREE.Mesh(towerGeo, towerMat);
    this.towerMesh.position.set(eD.x * cityHeight, eD.y * cityHeight + v * 0.5, 0.012);
    this.beaconGroup.add(this.towerMesh);

    // 6. Vertical Particle Fountain (28 rising sparks)
    const pD = 28;
    const partGeo = new THREE.BufferGeometry();
    const partPos = new THREE.Float32Array(pD * 3);
    const partInfo = new THREE.Float32Array(pD * 3);

    for (let i = 0; i < pD; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rad = (i % 3 === 0) ? (1.05 + Math.random() * 0.45) : Math.sqrt(Math.random());
      partPos[i * 3] = Math.cos(angle) * g * rad;
      partPos[i * 3 + 1] = Math.sin(angle) * _ * rad;
      partPos[i * 3 + 2] = 0;

      partInfo[i * 3] = 0.09 + Math.random() * 0.07; // speed
      partInfo[i * 3 + 1] = Math.random();          // phase
      partInfo[i * 3 + 2] = g * (0.012 + Math.random() * 0.018); // size
    }

    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    partGeo.setAttribute('aInfo', new THREE.BufferAttribute(partInfo, 3));

    const partMat = new THREE.ShaderMaterial({
      vertexShader: mD_vertex,
      fragmentShader: hD_fragment,
      uniforms: {
        uColor: { value: new THREE.Color(sD) },
        uAlpha: { value: 1.0 },
        uTime: { value: 0.0 },
        uRiseH: { value: v },
        uVh: { value: window.innerHeight }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.towerParticles = new THREE.Points(partGeo, partMat);
    this.towerParticles.position.set(eD.x * cityHeight, eD.y * cityHeight, 0.013);
    this.beaconGroup.add(this.towerParticles);

    // 7. Rotating Top Waitlist Ribbon
    const ribbonTex = createWaitlistRibbonTexture();
    const ribbonGeo = new THREE.CylinderGeometry(g * 1.001, g * 1.001, g * 0.68, 80, 1, true);
    const ribbonMat = new THREE.MeshBasicMaterial({
      map: ribbonTex,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.topRibbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    const ribbonPivot = new THREE.Group();
    ribbonPivot.rotation.x = -Math.asin(Math.min(1, eD.sizeY / eD.sizeX));
    ribbonPivot.position.set(eD.x * cityHeight, eD.y * cityHeight + v * 0.1, 0.02);
    ribbonPivot.add(this.topRibbonMesh);
    this.beaconGroup.add(ribbonPivot);

    this.stage5CityPlane.add(this.beaconGroup);
    this.scene.add(this.stage5CityPlane);

    // Stage 5 is initially invisible until reached
    this.stage5CityPlane.visible = false;
  }

  bindInteractions() {
    // Wheel & Trackpad scrolling
    window.addEventListener('wheel', (e) => {
      if (this.currentActiveStage === 5) {
        // In Stage 5, wheel zooms the city map!
        this.mapZoomTarget = Math.max(1.2, Math.min(6.5, this.mapZoomTarget + e.deltaY * 0.003));
      } else {
        this.targetScroll = Math.max(0, Math.min(1, this.targetScroll + e.deltaY * 0.00062));
      }
    }, { passive: true });

    // Touch dragging
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      const deltaY = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      if (this.currentActiveStage === 5) {
        this.mapPanTarget.y += deltaY * 0.005;
      } else {
        this.targetScroll = Math.max(0, Math.min(1, this.targetScroll + deltaY * 0.0011));
      }
    }, { passive: true });

    // Stage 5 Drag-to-Pan on Canvas
    this.canvas.addEventListener('mousedown', (e) => {
      if (this.currentActiveStage === 5) {
        this.isDraggingMap = true;
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.canvas.style.cursor = 'grabbing';
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDraggingMap && this.currentActiveStage === 5) {
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;
        this.dragStart = { x: e.clientX, y: e.clientY };

        const factor = (this.mapZoom / window.innerHeight) * 2;
        this.mapPanTarget.x -= dx * factor;
        this.mapPanTarget.y += dy * factor;

        // Clamp to city boundaries
        this.mapPanTarget.x = Math.max(-8.0, Math.min(8.0, this.mapPanTarget.x));
        this.mapPanTarget.y = Math.max(-4.0, Math.min(4.0, this.mapPanTarget.y));
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isDraggingMap) {
        this.isDraggingMap = false;
        this.canvas.style.cursor = 'default';
      }
    });

    // Arrow keys & PageUp/Down
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        this.targetScroll = Math.max(0, Math.min(1, this.targetScroll + 0.08));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        this.targetScroll = Math.max(0, Math.min(1, this.targetScroll - 0.08));
      }
    });

    // BZ Stage Ruler Step Clicks
    document.querySelectorAll('.ruler-step').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = parseFloat(btn.getAttribute('data-target'));
        if (window.gsap) {
          gsap.to(this, {
            targetScroll: target,
            duration: 1.4,
            ease: "power2.inOut"
          });
        } else {
          this.targetScroll = target;
        }
      });
    });

    // Replay button
    const replayBtn = document.getElementById('replay-btn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        if (window.gsap) gsap.to(this, { targetScroll: 0, duration: 1.6, ease: "power2.inOut" });
        else this.targetScroll = 0;
      });
    }

    // Confetti button
    const confettiBtn = document.getElementById('launch-confetti-btn');
    if (confettiBtn) {
      confettiBtn.addEventListener('click', () => {
        prodAudio.playSFX('topup');
        if (window.confetti) confetti({ particleCount: 150, spread: 110, origin: { y: 0.6 } });
      });
    }

    // Stage 5 HUD Buttons
    const zoomInBtn = document.getElementById('zoom-in-btn');
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => { this.mapZoomTarget = Math.max(1.2, this.mapZoomTarget * 0.75); });

    const zoomOutBtn = document.getElementById('zoom-out-btn');
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => { this.mapZoomTarget = Math.min(6.5, this.mapZoomTarget / 0.75); });

    const recenterBtn = document.getElementById('recenter-btn');
    if (recenterBtn) recenterBtn.addEventListener('click', () => {
      this.mapPanTarget = { x: eD.x * 10, y: eD.y * 10 };
      this.mapZoomTarget = 3.2;
    });
  }

  updateScroll() {
    this.scrollProgress += (this.targetScroll - this.scrollProgress) * 0.08;
    const p = this.scrollProgress;

    const pct = Math.round(p * 100);
    const pctEl = document.getElementById('scroll-percentage');
    if (pctEl) pctEl.innerText = `${pct}% EXPLORED`;
    const fillEl = document.getElementById('progress-bar-fill');
    if (fillEl) fillEl.style.width = `${pct}%`;

    // 1. Camera Spline Scrubbing
    if (p < 0.88) {
      // Perspective Camera Active (Stages 1-4)
      this.renderPass.camera = this.camera;
      if (this.stage5CityPlane) this.stage5CityPlane.visible = false;
      const mapPanel = document.getElementById('map-controls-panel');
      if (mapPanel) mapPanel.classList.add('hidden');

      if (p <= 0.46) {
        if (this.cam1Action && this.cam1Mixer) {
          const t1 = (p / 0.46) * this.cam1Duration;
          this.cam1Action.time = t1;
          this.cam1Mixer.update(0);
          if (this.cam1Ref) {
            this.cam1Ref.getWorldPosition(this.camera.position);
            this.cam1Ref.getWorldQuaternion(this.camera.quaternion);
          }
        }
      } else {
        if (this.cam2Action && this.cam2Mixer) {
          const t2 = ((p - 0.46) / 0.42) * this.cam2Duration;
          this.cam2Action.time = t2;
          this.cam2Mixer.update(0);
          if (this.cam2Ref) {
            this.cam2Ref.getWorldPosition(this.camera.position);
            this.cam2Ref.getWorldQuaternion(this.camera.quaternion);
          }
        } else {
          this.camera.position.z = THREE.MathUtils.lerp(0.39, -32, (p - 0.46) / 0.42);
          this.camera.position.y = THREE.MathUtils.lerp(0.93, -1.0, (p - 0.46) / 0.42);
        }
      }
    } else {
      // Stage 5: Switch to Orthographic City Metropolis Camera!
      this.renderPass.camera = this.orthoCamera;
      if (this.stage5CityPlane) this.stage5CityPlane.visible = true;
      const mapPanel = document.getElementById('map-controls-panel');
      if (mapPanel) mapPanel.classList.remove('hidden');

      // Smooth pan and zoom interpolation
      this.mapPan.x += (this.mapPanTarget.x - this.mapPan.x) * 0.1;
      this.mapPan.y += (this.mapPanTarget.y - this.mapPan.y) * 0.1;
      this.mapZoom += (this.mapZoomTarget - this.mapZoom) * 0.1;

      const orthoAspect = window.innerWidth / window.innerHeight;
      this.orthoCamera.left = -this.mapZoom * orthoAspect + this.mapPan.x;
      this.orthoCamera.right = this.mapZoom * orthoAspect + this.mapPan.x;
      this.orthoCamera.top = this.mapZoom + this.mapPan.y;
      this.orthoCamera.bottom = -this.mapZoom + this.mapPan.y;
      this.orthoCamera.updateProjectionMatrix();

      // Animate tower rise
      if (this.towerMesh) {
        const riseProgress = Math.min(1.0, (p - 0.88) / 0.10);
        this.towerMesh.material.uniforms.uHeight.value = riseProgress;
      }
    }

    // 2. Stage 1 Palm Burning Portal
    if (this.palmBurnMaterial) {
      const burnP = Math.max(0, Math.min(1.0, p * 3.8));
      this.palmBurnMaterial.uniforms.uBurnProgress.value = burnP;
      this.palmLight.intensity = (1.0 - burnP) * 3.5 + Math.sin(p * 20) * 0.5;
    }

    // 3. Stage 2 Glass Shatter Scrubbing
    if (this.glassAction && this.glassMixer) {
      const glassP = Math.max(0, Math.min(1.0, (p - 0.22) / 0.24));
      this.glassAction.time = glassP * this.glassDuration;
      this.glassMixer.update(0);

      if (p > 0.24 && p < 0.28 && !this.shatterSfxPlayed) {
        prodAudio.playSFX('shatter');
        this.shatterSfxPlayed = true;
      } else if (p < 0.20) {
        this.shatterSfxPlayed = false;
      }
    }

    // 4. Stage 3 Floating Money Notes Scrubbing
    if (p > 0.42 && p < 0.76) {
      prodAudio.playSFX('burn');
      const noteProgress = (p - 0.42) / 0.34;
      this.moneyNotes.forEach((note, i) => {
        note.userData.burnMat.uniforms.uBurnProgress.value = Math.min(1.0, noteProgress * 1.5);
        note.position.y = note.userData.initPos.y + Math.sin(p * 10 + i) * 0.08;
      });
    } else {
      prodAudio.stopSFX('burn');
    }

    // 5. Stage 4 Tunnel Pulse & Under City Flyover
    if (p > 0.68 && p < 0.92) {
      if (this.tunnelMaterial) {
        this.tunnelMaterial.emissiveIntensity = 0.6 + Math.sin(p * 30) * 0.4;
      }
      if (p > 0.70 && p < 0.74) prodAudio.playSFX('tunnel');

      // Scale and reveal world city under the tunnel
      if (this.worldGroup) {
        const cityScale = 1.0 + ((p - 0.68) / 0.24) * 0.8;
        this.worldGroup.scale.setScalar(cityScale);
      }
    }

    // 6. Narrative Scene Stage & BZ Ruler Update
    let currentStage = 1;
    let bzLabel = '-100 BZ';

    if (p < 0.20) {
      currentStage = 1;
      bzLabel = '-100 BZ';
      prodAudio.setAmbientStage('stage1');
    } else if (p < 0.45) {
      currentStage = 2;
      bzLabel = '-75 BZ';
      prodAudio.setAmbientStage('stage2');
    } else if (p < 0.68) {
      currentStage = 3;
      bzLabel = '-50 BZ';
      prodAudio.setAmbientStage('stage2');
    } else if (p < 0.88) {
      currentStage = 4;
      bzLabel = '-25 BZ';
      prodAudio.setAmbientStage('stage4');
    } else {
      currentStage = 5;
      bzLabel = '0 BZ';
      prodAudio.setAmbientStage('stage5');
    }

    if (currentStage !== this.currentActiveStage) {
      this.currentActiveStage = currentStage;
      prodAudio.playSFX('whoosh');

      document.querySelectorAll('.story-scene').forEach(sec => {
        const idx = parseInt(sec.getAttribute('data-index'));
        if (idx === currentStage) sec.classList.add('active');
        else sec.classList.remove('active');
      });

      document.querySelectorAll('.ruler-step').forEach(btn => {
        const st = parseInt(btn.getAttribute('data-stage'));
        if (st === currentStage) btn.classList.add('active');
        else btn.classList.remove('active');
      });

      const counterEl = document.getElementById('scene-counter');
      if (counterEl) counterEl.innerText = bzLabel;
    }
  }

  render() {
    requestAnimationFrame(() => this.render());
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Mouse Parallax Smooth Lag
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // 1. Stage 1 Botanical Parallax Garden Drift
    this.gardenGroup.children.forEach(child => {
      const f = child.userData.depthFactor || 0.05;
      child.position.x = child.userData.basePos.x + this.mouse.x * f;
      child.position.y = child.userData.basePos.y + this.mouse.y * f;
    });

    // 2. Stage 4 Floating Volumetric Clouds Drift
    this.cloudMeshes.forEach(cloud => {
      cloud.position.x += cloud.userData.speedX;
      cloud.position.y = cloud.userData.baseY + Math.sin(elapsedTime * 0.8 + cloud.userData.bobPhase) * 0.2;
      if (cloud.position.x > 18) cloud.position.x = -18;
    });

    // 3. Stage 5 Beacon Shaders Update
    if (this.towerMesh) {
      this.towerMesh.material.uniforms.uTime.value = elapsedTime;
    }
    if (this.towerParticles) {
      this.towerParticles.material.uniforms.uTime.value = elapsedTime;
    }
    this.rippleRings.forEach(ring => {
      const cycle = (elapsedTime * 0.45 + ring.userData.phase) % 1.0;
      const scale = 0.2 + cycle * 0.8;
      ring.scale.set(scale, scale, 1);
      ring.material.uniforms.uOpacity.value = (1.0 - cycle) * 0.85;
    });
    if (this.topRibbonMesh) {
      this.topRibbonMesh.rotation.y += 0.012;
    }

    // 4. Floating Embers Particles Rise
    if (this.embersParticles) {
      const pos = this.embersParticles.geometry.attributes.position.array;
      const vel = this.embersParticles.geometry.attributes.velocity.array;
      for (let i = 0; i < pos.length / 3; i++) {
        pos[i * 3 + 1] += vel[i * 3 + 1];
        pos[i * 3] += Math.sin(elapsedTime + i) * 0.003;
        if (pos[i * 3 + 1] > 8) pos[i * 3 + 1] = -8;
      }
      this.embersParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Update Shaders Time
    if (this.palmBurnMaterial) {
      this.palmBurnMaterial.uniforms.uTime.value = elapsedTime;
    }
    this.moneyNotes.forEach(note => {
      if (note.userData.burnMat) {
        note.userData.burnMat.uniforms.uTime.value = elapsedTime;
      }
    });

    // 6. Update Skeletal Hand Idle Mixers
    if (this.fancyHandMixer) this.fancyHandMixer.update(delta);
    if (this.humanHandMixer) this.humanHandMixer.update(delta);

    this.updateScroll();

    // Render through Post-Processing Bloom Pipeline
    this.composer.render();
  }
}

// ==========================================================================
// 5. BOOTSTRAP INITIALIZATION
// ==========================================================================
function startZeroEngine() {
  console.log('🚀 Booting Zero University Production Creative Engine...');
  const world = new ZeroProductionWorld();

  const gesture = new GestureUnlockEngine(() => {
    prodAudio.setAmbientStage('stage1');
  });

  const audioBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');

  if (audioBtn && audioIcon) {
    audioBtn.addEventListener('click', () => {
      const active = prodAudio.toggleMute();
      audioIcon.innerText = active ? '🔊' : '🔇';
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startZeroEngine);
} else {
  startZeroEngine();
}
