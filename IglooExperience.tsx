"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// --- Types ---
interface BrickData {
  id: number;
  mesh: THREE.Mesh;
  restPosition: THREE.Vector3;
  restRotation: THREE.Euler;
  restNormal: THREE.Vector3;
  restCenter: THREE.Vector3;
  currentOffset: number;
  targetOffset: number;
  isLifted: boolean;
}

interface ProjectData {
  title: string;
  slug: string;
  url: string;
  text: string;
  linkText: string;
  linkHref: string;
  hasDiscover: boolean;
}

const PROJECTS: Record<string, ProjectData> = {
  pudgy: {
    title: "///// Summary — Pudgy Penguins",
    slug: "pudgy-penguins",
    url: "/portfolio/pudgy-penguins",
    text: "Pudgy Penguins is an intellectual property powerhouse built directly from onchain roots. Through massive viral reach, physical toy distribution in major global retail channels, and decentralized brand stewardship, Pudgy Penguins transforms Web3 characters into beloved mainstream cultural icons.",
    linkText: "Visit Portfolio ↗",
    linkHref: "https://pudgypenguins.com",
    hasDiscover: false,
  },
  overpass: {
    title: "///// Summary — Overpass",
    slug: "overpass",
    url: "/portfolio/overpass",
    text: "Overpass is the decentralized licensing marketplace revolutionizing brand monetization. By allowing rights holders and creators to seamlessly negotiate, track royalties, and verify onchain intellectual property ownership, Overpass creates the frictionless legal rails for modern digital culture.",
    linkText: "Visit Overpass ↗",
    linkHref: "https://overpass.ip",
    hasDiscover: true,
  },
};


const CONFIG = {
  brickRings: 7,
  iglooRadius: 5.7,
  iglooHeight: 5.1,
  clusterRadius: 2.9,
  maxDisplacement: 0.62,
  popOutK: 14.0, // fast pop-out (~0.25s)
  returnK: 3.6,  // slow fluid settle (~0.8s)
  particleCount: 24000,
  scrollMax: 6000,
  scrollSensitivity: 0.0004,
  audioVolume: 0.8,
};

const CIPHER_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-_/[]{}<>~!=";

// --- Simplex Noise Shader Chunk ---
const simplexShaderChunk = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute( permute( permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }
`;


const IGLOO_STYLES = `
  .scroll-progress-line {
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    background: linear-gradient(90deg, #38bdf8, #818cf8);
    z-index: 100;
    transition: width 0.1s linear;
  }

  #rainbow-flare {
    position: fixed;
    inset: -10%;
    z-index: 60;
    pointer-events: none;
    opacity: 0;
    mix-blend-mode: screen;
    background:
      conic-gradient(from 210deg at 50% 38%,
        rgba(255, 90, 160, 0.55) 0deg,
        rgba(255, 210, 90, 0.55) 42deg,
        rgba(120, 255, 200, 0.5) 96deg,
        rgba(90, 190, 255, 0.65) 150deg,
        rgba(190, 120, 255, 0.5) 214deg,
        rgba(255, 255, 255, 0.75) 268deg,
        rgba(255, 90, 160, 0.55) 360deg),
      radial-gradient(60% 50% at 50% 34%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.15) 40%, transparent 72%);
    filter: blur(26px) saturate(150%);
    transition: opacity 0.45s ease;
  }

  .bg-drifting-text-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    transition: opacity 0.8s ease;
  }

  .drifting-text-item {
    position: absolute;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-weight: 800;
    letter-spacing: 4px;
    color: rgba(71, 85, 105, 0.12);
    user-select: none;
    text-transform: uppercase;
  }

  .info-pill {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 15;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 1.6px;
    text-transform: uppercase;
    color: #475569;
    background: rgba(255, 255, 255, 0.45);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    padding: 5px 14px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.6);
    pointer-events: none;
    transition: all 0.4s ease;
  }

  .dark-mode .info-pill {
    color: #94a3b8;
    background: rgba(15, 23, 42, 0.5);
    border-color: rgba(255, 255, 255, 0.12);
  }

  /* HUD Layer */
  .hud-layer {
    position: fixed;
    inset: 0;
    z-index: 10;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 30px 34px;
  }

  .hud-row-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 40px;
  }

  .brand-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: auto;
  }

  .igloo-wordmark {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-weight: 800;
    font-size: 21px;
    letter-spacing: 2.4px;
    line-height: 1;
    color: #0f172a;
    transition: color 0.5s ease, text-shadow 0.7s ease;
    cursor: pointer;
    user-select: none;
  }

  .igloo-wordmark.glow-bright,
  .dark-mode .igloo-wordmark {
    color: #ffffff;
    text-shadow: 0 0 24px rgba(190, 236, 255, 1), 0 0 60px rgba(255, 255, 255, 0.75);
  }

  .copyright-block {
    font-size: 10px;
    line-height: 1.65;
    letter-spacing: 0.4px;
    color: #475569;
    white-space: pre-line;
    cursor: pointer;
    transition: color 0.3s ease;
  }

  .copyright-block:hover { color: #0f172a; }
  .dark-mode .copyright-block { color: #94a3b8; }
  .dark-mode .copyright-block:hover { color: #f8fafc; }

  .manifesto-block {
    max-width: 330px;
    text-align: right;
    pointer-events: auto;
    transition: opacity 0.6s ease;
  }

  .manifesto-title {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.4px;
    color: #0f172a;
    margin-bottom: 6px;
    transition: color 0.4s ease;
  }

  .dark-mode .manifesto-title { color: #ffffff; }

  .manifesto-body {
    font-size: 10px;
    line-height: 1.8;
    letter-spacing: 0.35px;
    color: #475569;
    white-space: pre-line;
    transition: color 0.3s ease;
    cursor: pointer;
  }

  .manifesto-body:hover { color: #0f172a; }
  .dark-mode .manifesto-body { color: #94a3b8; }
  .dark-mode .manifesto-body:hover { color: #f8fafc; }

  .hud-row-bottom {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 24px;
  }

  .bottom-left-block {
    display: flex;
    flex-direction: column;
    gap: 14px;
    pointer-events: auto;
  }

  .scroll-prompt {
    font-size: 10px;
    letter-spacing: 0.9px;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: opacity 0.5s ease;
  }

  .sound-toggle-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: 0;
    padding: 2px 0;
    color: #1e293b;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.9px;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .sound-toggle-btn:hover { color: #0284c7; }
  .dark-mode .sound-toggle-btn { color: #e2e8f0; }
  .dark-mode .sound-toggle-btn:hover { color: #38bdf8; }

  /* Dais Arrows */
  .dais-nav-arrow {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    z-index: 25;
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: #e2e8f0;
    font-size: 22px;
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s ease;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .dais-nav-arrow.active {
    opacity: 1;
    pointer-events: auto;
  }

  .dais-nav-arrow:hover {
    background: rgba(15, 23, 42, 0.95);
    color: #38bdf8;
    border-color: rgba(56, 189, 248, 0.4);
    transform: translateY(-50%) scale(1.08);
  }

  .dais-arrow-left { left: 24px; }
  .dais-arrow-right { right: 24px; }

  /* Scene Jumper Rail */
  .scene-nav-bar {
    position: fixed;
    left: 50%;
    bottom: 24px;
    transform: translateX(-50%);
    z-index: 30;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 8px;
    border-radius: 30px;
    background: rgba(15, 23, 42, 0.82);
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(18px) saturate(140%);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
  }

  .nav-pill {
    position: relative;
    background: none;
    border: 0;
    border-radius: 20px;
    color: #94a3b8;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.6px;
    padding: 6px 12px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.25s ease;
  }

  .nav-pill:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
  }

  .nav-pill.active {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.2);
    font-weight: 600;
    box-shadow: 0 0 14px rgba(255, 255, 255, 0.2);
  }

  /* Preloader Overlay */
  #preloader-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: #dce5f0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.8s ease;
  }

  .ascii-preloader-text {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 14px;
    letter-spacing: 8px;
    color: #1e293b;
    font-weight: 700;
  }

  /* Freeze Summary Modal */
  #modal-container {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s ease;
    background: radial-gradient(120% 90% at 50% 40%, rgba(8, 13, 22, 0.65) 0%, rgba(5, 8, 14, 0.94) 62%, rgba(3, 5, 9, 0.99) 100%);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  #modal-container.active {
    opacity: 1;
    pointer-events: auto;
  }

  .modal-card {
    position: relative;
    width: min(660px, calc(100vw - 48px));
    max-height: 80vh;
    overflow-y: auto;
    padding: 28px 36px;
    background: rgba(11, 17, 28, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    color: #f8fafc;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
  }

  .modal-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 16px;
    margin-bottom: 24px;
  }

  .modal-category-title {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 2px;
    color: #38bdf8;
    text-transform: uppercase;
  }

  .corner-bracket-wrap {
    position: relative;
    padding: 6px 14px;
    display: inline-flex;
    align-items: center;
  }

  .corner-tl { position: absolute; top: 0; left: 0; font-size: 11px; color: rgba(255, 255, 255, 0.5); }
  .corner-tr { position: absolute; top: 0; right: 0; font-size: 11px; color: rgba(255, 255, 255, 0.5); }
  .corner-bl { position: absolute; bottom: 0; left: 0; font-size: 11px; color: rgba(255, 255, 255, 0.5); }
  .corner-br { position: absolute; bottom: 0; right: 0; font-size: 11px; color: rgba(255, 255, 255, 0.5); }

  .modal-close-btn {
    background: none;
    border: 0;
    color: #f1f5f9;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 1.6px;
    text-transform: uppercase;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .modal-close-btn:hover { color: #38bdf8; }
  .corner-bracket-wrap:hover span { color: #38bdf8; }

  .modal-body-scramble-text {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 13px;
    line-height: 2;
    color: #cbd5e1;
    white-space: pre-line;
    margin-bottom: 24px;
    min-height: 120px;
    cursor: crosshair;
  }

  .modal-discover-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 18px;
  }

  .modal-discover-label {
    font-size: 10px;
    letter-spacing: 1.6px;
    color: #94a3b8;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }

  .modal-external-link {
    color: #38bdf8;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .modal-external-link:hover { color: #bae6fd; }

  @media (max-width: 768px) {
    .hud-layer { padding: 18px 20px; }
    .manifesto-block { max-width: 200px; }
    .manifesto-body, .copyright-block { font-size: 9px; }
    .scene-nav-bar { bottom: 16px; padding: 4px; overflow-x: auto; max-width: 90vw; }
    .nav-pill { padding: 4px 8px; font-size: 8.5px; }
    .modal-card { padding: 20px 24px; }
  }
`;

export function IglooExperience() {
  const [mounted, setMounted] = useState(false);
  const [activeSceneName, setActiveSceneName] = useState("igloo");
  const [stagePillText, setStagePillText] = useState("Scene B: Interactive Arctic Igloo Dome");
  const [scrollPercent, setScrollPercent] = useState(0);
  const [showScrollPrompt, setShowScrollPrompt] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [preloaderActive, setPreloaderActive] = useState(true);
  const [asciiText, setAsciiText] = useState("=+==--==++");
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProjectKey, setActiveProjectKey] = useState<"pudgy" | "overpass">("pudgy");
  const [modalDisplayText, setModalDisplayText] = useState("");
  const [manifestoText, setManifestoText] = useState(
    "Our mission is to build the next generation of consumer brands at the intersection of Community, AI, and crypto."
  );
  const [copyrightText, setCopyrightText] = useState("// Copyright © 2026\nIgloo, Inc. All Rights Reserved.");
  const [showDaisArrows, setShowDaisArrows] = useState(false);
  const [showDriftingText, setShowDriftingText] = useState(false);
  const [daisMorphIndex, setDaisMorphIndex] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hudCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const glitchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const flareRef = useRef<HTMLDivElement | null>(null);

  // References for WebGL & Simulation internals
  const stateRef = useRef({
    scrollPos: 0,
    targetScrollPos: 0,
    isDragging: false,
    dragStartY: 0,
    mouseNDC: new THREE.Vector2(-999, -999),
    mouseScreen: new THREE.Vector2(0, 0),
    mouseVelocity: new THREE.Vector2(0, 0),
    lastMouse: new THREE.Vector2(0, 0),
    soundEnabled: true,
    audioInitialized: false,
    pudgyTemp1: 35.14,
    pudgyTemp2: 1.75,
    overpassTemp1: 29.66,
    overpassTemp2: -1.30,
    daisMorphTarget: 0,
    averageParticleSpeed: 0,
    isModalOpen: false,
  });

  // Audio References
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const vortexFilterRef = useRef<BiquadFilterNode | null>(null);
  const vortexGainRef = useRef<GainNode | null>(null);

  // --- Audio Synthesis Functions ---
  const initAudio = useCallback(() => {
    if (stateRef.current.audioInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.8, ctx.currentTime);
      master.connect(ctx.destination);
      masterGainRef.current = master;

      // Arctic Wind Noise Buffer
      const bufferSize = ctx.sampleRate * 2.0;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const windSource = ctx.createBufferSource();
      windSource.buffer = noiseBuffer;
      windSource.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = "lowpass";
      windFilter.frequency.setValueAtTime(390, ctx.currentTime);

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.2, ctx.currentTime);

      windSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(master);
      windSource.start();

      // Particle Vortex Synth Node
      const vBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const vData = vBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) vData[i] = Math.random() * 2 - 1;

      const vSource = ctx.createBufferSource();
      vSource.buffer = vBuffer;
      vSource.loop = true;

      const vFilter = ctx.createBiquadFilter();
      vFilter.type = "bandpass";
      vFilter.frequency.setValueAtTime(600, ctx.currentTime);
      vFilter.Q.setValueAtTime(3.2, ctx.currentTime);
      vortexFilterRef.current = vFilter;

      const vGain = ctx.createGain();
      vGain.gain.setValueAtTime(0.0, ctx.currentTime);
      vortexGainRef.current = vGain;

      vSource.connect(vFilter);
      vFilter.connect(vGain);
      vGain.connect(master);
      vSource.start();

      stateRef.current.audioInitialized = true;
    } catch {
      // Audio autoplay restrictions
    }
  }, []);

  const playBrickThud = useCallback((panX = 0) => {
    if (!audioContextRef.current || !stateRef.current.soundEnabled) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

    osc.type = "sine";
    const baseFreq = 92 + (Math.random() - 0.5) * 18;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.12);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    if (panner && masterGainRef.current) {
      panner.pan.setValueAtTime(Math.max(-0.6, Math.min(0.6, panX)), now);
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(masterGainRef.current);
    } else if (masterGainRef.current) {
      osc.connect(gain);
      gain.connect(masterGainRef.current);
    }
    osc.start(now);
    osc.stop(now + 0.15);

    // High tick
    const tick = ctx.createOscillator();
    const tGain = ctx.createGain();
    tick.type = "triangle";
    tick.frequency.setValueAtTime(1450 + Math.random() * 350, now);
    tGain.gain.setValueAtTime(0.05, now);
    tGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
    if (masterGainRef.current) {
      tick.connect(tGain);
      tGain.connect(masterGainRef.current);
    }
    tick.start(now);
    tick.stop(now + 0.035);
  }, []);

  const playTextTick = useCallback(() => {
    if (!audioContextRef.current || !stateRef.current.soundEnabled) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(2200 + Math.random() * 700, now);
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
    if (masterGainRef.current) {
      osc.connect(gain);
      gain.connect(masterGainRef.current);
    }
    osc.start(now);
    osc.stop(now + 0.02);
  }, []);

  const playBraaamHit = useCallback((freq = 60, duration = 0.5) => {
    if (!audioContextRef.current || !stateRef.current.soundEnabled) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + duration);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, now);

    if (masterGainRef.current) {
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGainRef.current);
    }
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }, []);

  const playDaisShimmer = useCallback(() => {
    if (!audioContextRef.current || !stateRef.current.soundEnabled) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const chord = [2400, 3200, 4200, 4700];
    chord.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + idx * 0.04);
      gain.gain.setValueAtTime(0.08, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      if (masterGainRef.current) {
        osc.connect(gain);
        gain.connect(masterGainRef.current);
      }
      osc.start(now + idx * 0.04);
      osc.stop(now + 0.85);
    });
  }, []);

  // --- Wave Decode Helper ---
  const waveDecodeText = useCallback((fullText: string, setter: (val: string) => void) => {
    let progress = 0;
    const totalLen = fullText.length;
    const interval = setInterval(() => {
      progress += 4;
      let display = "";
      for (let i = 0; i < totalLen; i++) {
        if (fullText[i] === " " || fullText[i] === "\n") {
          display += fullText[i];
        } else if (i < progress) {
          display += fullText[i];
        } else {
          display += CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
        }
      }
      setter(display);
      if (Math.random() < 0.35) playTextTick();
      if (progress >= totalLen + 16) {
        clearInterval(interval);
        setter(fullText);
      }
    }, 28);
  }, [playTextTick]);

  // Modal Handlers
  const handleOpenModal = useCallback((projectKey: "pudgy" | "overpass") => {
    const p = PROJECTS[projectKey];
    if (!p) return;
    initAudio();
    setActiveProjectKey(projectKey);
    setModalOpen(true);
    stateRef.current.isModalOpen = true;
    window.history.pushState({ project: projectKey }, p.title, p.url);
    waveDecodeText(p.text, setModalDisplayText);
    playBraaamHit(65, 0.45);
  }, [initAudio, waveDecodeText, playBraaamHit]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    stateRef.current.isModalOpen = false;
    window.history.pushState({}, "Igloo Inc.", "/");
    playBraaamHit(125, 0.35);

    // Trigger red/cyan thaw glitch
    if (glitchCanvasRef.current) {
      const gCanvas = glitchCanvasRef.current;
      const gCtx = gCanvas.getContext("2d");
      if (gCtx) {
        gCanvas.style.opacity = "1";
        let frame = 0;
        const maxFrames = 14;
        const renderThaw = () => {
          frame++;
          gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
          for (let b = 0; b < 6; b++) {
            const y = Math.random() * gCanvas.height;
            const h = Math.random() * 28 + 6;
            gCtx.fillStyle = `rgba(239, 68, 68, ${Math.random() * 0.35})`;
            gCtx.fillRect(0, y - 4, gCanvas.width, h);
            gCtx.fillStyle = `rgba(14, 165, 233, ${Math.random() * 0.35})`;
            gCtx.fillRect(0, y + 4, gCanvas.width, h);
          }
          if (frame < maxFrames) {
            requestAnimationFrame(renderThaw);
          } else {
            gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
            gCanvas.style.opacity = "0";
          }
        };
        renderThaw();
      }
    }
  }, [playBraaamHit]);

  // Sound Toggle
  const toggleSound = useCallback(() => {
    initAudio();
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    stateRef.current.soundEnabled = nextState;
    if (masterGainRef.current && audioContextRef.current) {
      const now = audioContextRef.current.currentTime;
      masterGainRef.current.gain.cancelScheduledValues(now);
      const target = nextState ? 0.8 : 0.0;
      masterGainRef.current.gain.linearRampToValueAtTime(target, now + 0.3);
    }
  }, [initAudio, soundEnabled]);

  // Main WebGL Setup & Animation Loop
  useEffect(() => {
    setMounted(true);
    if (!canvasRef.current || !hudCanvasRef.current || !glitchCanvasRef.current) return;

    const canvas = canvasRef.current;
    const hudCanvas = hudCanvasRef.current;
    const hudCtx = hudCanvas.getContext("2d");
    const glitchCanvas = glitchCanvasRef.current;
    const glitchCtx = glitchCanvas.getContext("2d");

    // Scene & Camera
    const scene = new THREE.Scene();
    const arcticSkyColor = new THREE.Color(0xdce5f0);
    scene.background = arcticSkyColor;
    const expFog = new THREE.FogExp2(0xdce5f0, 0.016);
    scene.fog = expFog;

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 700);
    camera.position.set(0, 3.4, 15.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      hudCanvas.width = window.innerWidth;
      hudCanvas.height = window.innerHeight;
      glitchCanvas.width = window.innerWidth;
      glitchCanvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xc8d8e8, 1.1);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffdfa, 1.6);
    sunLight.position.set(24, 45, 24);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x7ce2fe, 0.95);
    rimLight.position.set(-25, 15, -25);
    scene.add(rimLight);

    const iglooCoreLight = new THREE.PointLight(0xffffff, 5.0, 11.0);
    iglooCoreLight.position.set(0, 1.4, 0);
    scene.add(iglooCoreLight);

    // Distant Mountain Ridges
    const mountainGroup = new THREE.Group();
    scene.add(mountainGroup);
    for (let m = 0; m < 4; m++) {
      const mGeo = new THREE.PlaneGeometry(200, 35, 80, 16);
      const mPos = mGeo.attributes.position;
      for (let i = 0; i < mPos.count; i++) {
        const x = mPos.getX(i);
        const y = mPos.getY(i);
        if (y > -12) {
          const ridge = Math.sin(x * 0.06 + m * 2.3) * 5.5 + Math.cos(x * 0.12) * 2.8;
          mPos.setY(i, y + ridge);
        }
      }
      mGeo.computeVertexNormals();
      const mColor = new THREE.Color().setHSL(0.58, 0.2, 0.72 - m * 0.08);
      const mMat = new THREE.MeshBasicMaterial({ color: mColor, transparent: true, opacity: 0.85 - m * 0.15 });
      const mMesh = new THREE.Mesh(mGeo, mMat);
      mMesh.position.set(0, 2.0 - m * 2.5, -55 - m * 30);
      mountainGroup.add(mMesh);
    }

    // Terrain with Radial Noise-Edged Reveal Shader
    const terrainGeo = new THREE.PlaneGeometry(160, 160, 140, 140);
    terrainGeo.rotateX(-Math.PI / 2);
    const tPos = terrainGeo.attributes.position;
    for (let i = 0; i < tPos.count; i++) {
      const x = tPos.getX(i);
      const z = tPos.getZ(i);
      const dist = Math.hypot(x, z);
      let y = Math.sin(x * 0.05) * 2.2 + Math.cos(z * 0.06) * 2.5 + Math.sin(x * 0.02 + z * 0.025) * 4.5;
      if (dist < 9.0) {
        y *= Math.pow(dist / 9.0, 2.5);
        y -= 0.18;
      }
      tPos.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    const terrainUniforms = {
      uRevealRadius: { value: 0.0 },
      uIglooCenter: { value: new THREE.Vector3(0, 0, 0) },
      uTime: { value: 0.0 },
      uNoiseScale: { value: 0.16 },
      uNoiseAmplitude: { value: 2.6 },
      uGlowIntensity: { value: 2.2 },
    };

    const terrainMat = new THREE.ShaderMaterial({
      uniforms: terrainUniforms,
      vertexShader: `
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        ${simplexShaderChunk}
        uniform float uRevealRadius;
        uniform vec3 uIglooCenter;
        uniform float uTime;
        uniform float uNoiseScale;
        uniform float uNoiseAmplitude;
        uniform float uGlowIntensity;
        varying vec3 vWorldPos;
        varying vec3 vNormal;

        void main() {
            float dist = length(vWorldPos - uIglooCenter);
            float n = snoise(vWorldPos * uNoiseScale + vec3(0.0, uTime * 0.2, 0.0));
            float noisyDist = dist + n * uNoiseAmplitude;
            float edgeWidth = 1.8;
            float revealMask = smoothstep(uRevealRadius - edgeWidth, uRevealRadius, noisyDist);
            float emissiveRim = smoothstep(uRevealRadius - edgeWidth, uRevealRadius - edgeWidth * 0.5, noisyDist)
                              * (1.0 - smoothstep(uRevealRadius - edgeWidth * 0.5, uRevealRadius, noisyDist));

            vec3 lightDir = normalize(vec3(0.4, 0.85, 0.4));
            float diff = max(dot(vNormal, lightDir), 0.25);
            float slope = 1.0 - vNormal.y;
            vec3 snowColor = vec3(0.96, 0.98, 1.0) * diff + vec3(0.12, 0.16, 0.24);
            vec3 rockColor = vec3(0.32, 0.36, 0.42) * diff * 0.75;
            vec3 terrainColor = mix(snowColor, rockColor, smoothstep(0.4, 0.78, slope));
            vec3 wireColor = vec3(0.75, 0.82, 0.9);

            vec3 finalColor = mix(terrainColor, wireColor, revealMask);
            finalColor += vec3(0.4, 0.85, 1.0) * emissiveRim * uGlowIntensity;
            gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.position.y = -0.5;
    scene.add(terrainMesh);

    // Plexus Wireframe
    const plexusMesh = new THREE.LineSegments(
      new THREE.WireframeGeometry(terrainGeo),
      new THREE.LineBasicMaterial({ color: 0x94a9c4, transparent: true, opacity: 0.45 })
    );
    plexusMesh.position.y = -0.48;
    scene.add(plexusMesh);

    // Igloo Core
    const coreMesh = new THREE.Mesh(
      new THREE.SphereGeometry(CONFIG.iglooRadius * 0.76, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide })
    );
    scene.add(coreMesh);

    // Sculpted Snow Bricks
    const iglooBricks: BrickData[] = [];
    const iglooGroup = new THREE.Group();
    scene.add(iglooGroup);

    const createBrickGeo = (w: number, h: number, d: number) => {
      const geo = new THREE.BoxGeometry(w, h, d, 4, 3, 4);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const noise = (Math.sin(x * 7.0) + Math.cos(y * 9.0) + Math.sin(z * 7.0)) * 0.038;
        pos.setXYZ(i, x + noise, y + noise * 0.5, z + noise);
      }
      geo.computeVertexNormals();
      return geo;
    };

    const brickSnowMat = new THREE.MeshStandardMaterial({ color: 0xfafcff, roughness: 0.78, metalness: 0.02 });
    let bCounter = 1;

    for (let r = 0; r < 7; r++) {
      const phi = (r / 7) * (Math.PI * 0.44);
      const ringRadius = CONFIG.iglooRadius * Math.cos(phi);
      const yPos = CONFIG.iglooHeight * Math.sin(phi);
      const bricksInRing = Math.max(4, Math.round(18 * Math.cos(phi)));

      for (let b = 0; b < bricksInRing; b++) {
        const theta = (b / bricksInRing) * Math.PI * 2;
        if (r < 2 && theta > Math.PI * 0.42 && theta < Math.PI * 0.58) continue;

        const x = ringRadius * Math.sin(theta);
        const z = ringRadius * Math.cos(theta);
        const w = (ringRadius * 2 * Math.PI / bricksInRing) * 0.94;
        const geo = createBrickGeo(w, 0.68, 0.98);
        const mesh = new THREE.Mesh(geo, brickSnowMat.clone());

        const restPos = new THREE.Vector3(x, yPos + 0.35, z);
        const restNorm = new THREE.Vector3(x, yPos * 0.55, z).normalize();

        mesh.position.copy(restPos);
        mesh.lookAt(x + restNorm.x, yPos + restNorm.y, z + restNorm.z);

        const bData: BrickData = {
          id: bCounter++,
          mesh,
          restPosition: restPos.clone(),
          restRotation: mesh.rotation.clone(),
          restNormal: restNorm.clone(),
          restCenter: restPos.clone(),
          currentOffset: 0,
          targetOffset: 0,
          isLifted: false,
        };
        iglooBricks.push(bData);
        iglooGroup.add(mesh);
      }
    }

    // Entrance Arch Bricks
    for (let arch = 0; arch < 6; arch++) {
      const archAngle = (arch / 5) * Math.PI;
      const ax = Math.cos(archAngle) * 1.42;
      const ay = Math.sin(archAngle) * 1.55 + 0.32;
      const az = CONFIG.iglooRadius + 0.85;

      const geo = createBrickGeo(0.68, 0.48, 0.88);
      const mesh = new THREE.Mesh(geo, brickSnowMat.clone());
      const restPos = new THREE.Vector3(ax, ay, az);
      const restNorm = new THREE.Vector3(ax * 0.85, ay * 0.85, 1.0).normalize();

      mesh.position.copy(restPos);
      mesh.lookAt(restPos.x + restNorm.x, restPos.y + restNorm.y, restPos.z + restNorm.z);

      const bData: BrickData = {
        id: bCounter++,
        mesh,
        restPosition: restPos.clone(),
        restRotation: mesh.rotation.clone(),
        restNormal: restNorm.clone(),
        restCenter: restPos.clone(),
        currentOffset: 0,
        targetOffset: 0,
        isLifted: false,
      };
      iglooBricks.push(bData);
      iglooGroup.add(mesh);
    }

    // Atmospheric Snow Flakes
    const snowCount = 2000;
    const snowGeo = new THREE.BufferGeometry();
    const snowPositions = new Float32Array(snowCount * 3);
    const snowVelocities = new Float32Array(snowCount * 3);
    for (let i = 0; i < snowCount; i++) {
      snowPositions[i * 3 + 0] = (Math.random() - 0.5) * 60;
      snowPositions[i * 3 + 1] = Math.random() * 25;
      snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      snowVelocities[i * 3 + 0] = -0.5 - Math.random() * 1.5;
      snowVelocities[i * 3 + 1] = -0.2 - Math.random() * 0.4;
      snowVelocities[i * 3 + 2] = 0.2 + (Math.random() - 0.5) * 0.5;
    }
    snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPositions, 3));
    const snowParticles = new THREE.Points(
      snowGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.14, transparent: true, opacity: 0.85 })
    );
    scene.add(snowParticles);

    // Procedural Refractive Ice Blocks
    const icePhysicalMat = new THREE.MeshPhysicalMaterial({
      color: 0xdff2ff,
      transmission: 0.88,
      opacity: 1.0,
      transparent: true,
      roughness: 0.12,
      ior: 1.31,
      thickness: 2.8,
      specularIntensity: 1.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
    });

    const iceGroup1 = new THREE.Group();
    const iceGroup2 = new THREE.Group();
    iceGroup1.position.set(0, -35, 0);
    iceGroup2.position.set(0, -65, 0);
    scene.add(iceGroup1, iceGroup2);

    const crystalGeo1 = new THREE.DodecahedronGeometry(3.4, 1);
    const crystalMesh1 = new THREE.Mesh(crystalGeo1, icePhysicalMat);
    crystalMesh1.userData = { isIceBlock: true, project: "pudgy" };
    iceGroup1.add(crystalMesh1);

    // Sculpted Penguin Model inside Block 1
    const pPenguin = new THREE.Group();
    const pBody = new THREE.Mesh(new THREE.SphereGeometry(1.4, 28, 28), new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.35 }));
    pBody.scale.set(0.9, 1.25, 0.9);
    const pBelly = new THREE.Mesh(new THREE.SphereGeometry(1.22, 24, 24), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 }));
    pBelly.scale.set(0.72, 1.12, 0.5);
    pBelly.position.set(0, -0.08, 0.58);
    const pBeak = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.48, 5), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 }));
    pBeak.rotateX(Math.PI / 2);
    pBeak.position.set(0, 0.42, 1.15);
    pPenguin.add(pBody, pBelly, pBeak);
    iceGroup1.add(pPenguin);

    // Overpass Badge inside Block 2
    const crystalGeo2 = new THREE.OctahedronGeometry(3.7, 2);
    const crystalMesh2 = new THREE.Mesh(crystalGeo2, icePhysicalMat);
    crystalMesh2.userData = { isIceBlock: true, project: "overpass" };
    iceGroup2.add(crystalMesh2);

    const badgeGroup = new THREE.Group();
    const badgeShield = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 0.42, 6),
      new THREE.MeshStandardMaterial({ color: 0x25384e, metalness: 0.75, roughness: 0.25 })
    );
    badgeShield.rotateX(Math.PI / 2);
    const ringBorder = new THREE.Mesh(
      new THREE.TorusGeometry(1.58, 0.08, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0xa5c9ed, metalness: 0.9, roughness: 0.15 })
    );
    badgeGroup.add(badgeShield, ringBorder);
    iceGroup2.add(badgeGroup);

    // Portal Rings & Stepped Dais
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, -90, 0);
    scene.add(portalGroup);

    const outerRingMesh = new THREE.Mesh(
      new THREE.RingGeometry(3.6, 5.0, 32),
      new THREE.MeshStandardMaterial({ color: 0x8697b0, metalness: 0.8, roughness: 0.2, side: THREE.DoubleSide })
    );
    outerRingMesh.rotation.x = Math.PI / 2;
    const innerRingMesh = new THREE.Mesh(
      new THREE.RingGeometry(2.9, 3.3, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    innerRingMesh.rotation.x = Math.PI / 2;
    innerRingMesh.position.y = 0.06;
    portalGroup.add(outerRingMesh, innerRingMesh);

    const daisGroup = new THREE.Group();
    daisGroup.position.set(0, -115, 0);
    scene.add(daisGroup);

    for (let step = 0; step < 3; step++) {
      const radius = 9.2 - step * 2.3;
      const sMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius + 0.32, 0.48, 48),
        new THREE.MeshStandardMaterial({ color: 0x1b222d, roughness: 0.35, metalness: 0.6 })
      );
      sMesh.position.y = -step * 0.48;
      const gMesh = new THREE.Mesh(
        new THREE.RingGeometry(radius - 0.16, radius, 48),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      gMesh.rotation.x = -Math.PI / 2;
      gMesh.position.y = -step * 0.48 + 0.245;
      daisGroup.add(sMesh, gMesh);
    }

    // Volumetric 28,000 Particle Cloud & Morph Targets
    const pCount = CONFIG.particleCount;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(pCount * 3);
    const particleVelocities = new Float32Array(pCount * 3);
    const particleColors = new Float32Array(pCount * 3);

    const morphTargets = [new Float32Array(pCount * 3), new Float32Array(pCount * 3), new Float32Array(pCount * 3)];

    for (let i = 0; i < pCount; i++) {
      // Shape 0: Penguin
      const u = Math.random(), v = Math.random();
      const theta = u * 2.0 * Math.PI, phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 2.3;
      morphTargets[0][i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta) * 0.92;
      morphTargets[0][i * 3 + 1] = r * Math.cos(phi) * 1.45 + 2.9;
      morphTargets[0][i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) * 0.92;

      // Shape 1: Torus Galaxy
      const tTheta = Math.random() * Math.PI * 2, tPhi = Math.random() * Math.PI * 2;
      const R = 2.5, rSmall = 0.85 * Math.random();
      morphTargets[1][i * 3 + 0] = (R + rSmall * Math.cos(tPhi)) * Math.cos(tTheta);
      morphTargets[1][i * 3 + 1] = rSmall * Math.sin(tPhi) + 3.2;
      morphTargets[1][i * 3 + 2] = (R + rSmall * Math.cos(tPhi)) * Math.sin(tTheta);

      // Shape 2: Double-Cone Hourglass / "X"
      const h = (Math.random() - 0.5) * 5.2;
      const rH = Math.abs(h) * 0.8 + 0.28;
      const a = Math.random() * Math.PI * 2;
      morphTargets[2][i * 3 + 0] = Math.cos(a) * rH * Math.random();
      morphTargets[2][i * 3 + 1] = h + 3.2;
      morphTargets[2][i * 3 + 2] = Math.sin(a) * rH * Math.random();

      particlePositions[i * 3 + 0] = morphTargets[0][i * 3 + 0];
      particlePositions[i * 3 + 1] = morphTargets[0][i * 3 + 1];
      particlePositions[i * 3 + 2] = morphTargets[0][i * 3 + 2];
      particleColors[i * 3 + 0] = 0.22;
      particleColors[i * 3 + 1] = 0.26;
      particleColors[i * 3 + 2] = 0.32;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const volumetricParticles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({ size: 0.08, vertexColors: true, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending })
    );
    daisGroup.add(volumetricParticles);

    // Raycaster
    const raycaster = new THREE.Raycaster();

    // Mouse Listeners
    const handleMouseMove = (e: MouseEvent) => {
      stateRef.current.mouseScreen.set(e.clientX, e.clientY);
      stateRef.current.mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      stateRef.current.mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
      stateRef.current.mouseVelocity.set(e.clientX - stateRef.current.lastMouse.x, e.clientY - stateRef.current.lastMouse.y);
      stateRef.current.lastMouse.set(e.clientX, e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleWheel = (e: WheelEvent) => {
      if (stateRef.current.isModalOpen) return;
      stateRef.current.targetScrollPos += e.deltaY * 0.95;
      if (stateRef.current.targetScrollPos < 0) stateRef.current.targetScrollPos = 0;
      if (stateRef.current.targetScrollPos > CONFIG.scrollMax) {
        // Infinite Loop Wrap
        if (flareRef.current) {
          flareRef.current.style.opacity = "1";
          playBraaamHit(50, 0.65);
          setTimeout(() => {
            stateRef.current.scrollPos = 0;
            stateRef.current.targetScrollPos = 0;
            if (flareRef.current) flareRef.current.style.opacity = "0";
            iglooBricks.forEach((b) => {
              b.currentOffset = 2.6;
              b.targetOffset = 0;
            });
            waveDecodeText(
              "Our mission is to build the next generation of consumer brands at the intersection of Community, AI, and crypto.",
              setManifestoText
            );
            waveDecodeText("// Copyright © 2026\nIgloo, Inc. All Rights Reserved.", setCopyrightText);
          }, 450);
        }
      }
      if (stateRef.current.targetScrollPos > 120 && !stateRef.current.isModalOpen) {
        setShowScrollPrompt(false);
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });

    // Click Detection on 3D Ice Blocks
    const handleClick = () => {
      initAudio();
      if (stateRef.current.isModalOpen) return;
      raycaster.setFromCamera(stateRef.current.mouseNDC, camera);
      const hits = raycaster.intersectObjects([crystalMesh1, crystalMesh2], true);
      if (hits.length > 0) {
        const hit = hits[0].object;
        const project = hit.userData.project || (hit.parent && hit.parent.userData.project);
        if (project === "pudgy" || project === "overpass") {
          handleOpenModal(project);
        }
      }
    };
    window.addEventListener("click", handleClick);

    // Initial Intro Animation
    const preloaderTimeout = setTimeout(() => {
      setPreloaderActive(false);
      const start = performance.now();
      const revealStep = (now: number) => {
        const elapsed = (now - start) / 1000;
        if (elapsed < 2.5) {
          terrainUniforms.uRevealRadius.value = (elapsed / 2.5) * 52.0;
          requestAnimationFrame(revealStep);
        } else {
          terrainUniforms.uRevealRadius.value = 999.0;
        }
      };
      requestAnimationFrame(revealStep);
    }, 1800);

    // Render Loop
    let animId = 0;
    let lastTime = performance.now();
    let hasShimmered = false;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const currentTime = performance.now();
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      terrainUniforms.uTime.value = currentTime * 0.001;

      // Camera Track along Y-axis
      stateRef.current.scrollPos += (stateRef.current.targetScrollPos - stateRef.current.scrollPos) * 0.085;
      const sFraction = stateRef.current.scrollPos / CONFIG.scrollMax;
      setScrollPercent(sFraction * 100);

      const targetCamY = 3.4 - sFraction * 122.0;
      camera.position.y += (targetCamY - camera.position.y) * 0.08;

      // Mouse Parallax
      const targetCamX = stateRef.current.mouseNDC.x * 1.6;
      const targetCamZ = 15.2 + Math.sin(sFraction * Math.PI) * 2.2;
      camera.position.x += (targetCamX - camera.position.x) * 0.055;
      camera.position.z += (targetCamZ - camera.position.z) * 0.055;
      camera.lookAt(0, camera.position.y - 1.25, 0);

      // Stage Pill Update
      if (sFraction < 0.18) {
        setStagePillText("Scene B: Interactive Arctic Igloo Dome");
        setActiveSceneName("igloo");
        setShowDaisArrows(false);
        setShowDriftingText(false);
      } else if (sFraction < 0.42) {
        setStagePillText("Scene C1: Procedural Ice Block — Pudgy Penguins");
        setActiveSceneName("pudgy");
        setShowDaisArrows(false);
        setShowDriftingText(true);
      } else if (sFraction < 0.62) {
        setStagePillText("Scene C2: Procedural Ice Block — Overpass");
        setActiveSceneName("overpass");
        setShowDaisArrows(false);
        setShowDriftingText(true);
      } else if (sFraction < 0.78) {
        setStagePillText("Scene E1: Counter-Rotating Ring Portal");
        setActiveSceneName("portal");
        setShowDaisArrows(false);
        setShowDriftingText(false);
      } else {
        setStagePillText("Scene E2: Volumetric Particle Dais & Floor Links");
        setActiveSceneName("dais");
        setShowDaisArrows(true);
        setShowDriftingText(true);
      }

      // Transition Fog & Glitch
      if (sFraction > 0.16 && sFraction < 0.25) {
        const t = (sFraction - 0.16) / 0.09;
        const peak = Math.sin(t * Math.PI);
        expFog.density = 0.016 + peak * 0.045;
        if (glitchCtx) {
          glitchCanvas.style.opacity = "1";
          glitchCtx.clearRect(0, 0, glitchCanvas.width, glitchCanvas.height);
          for (let b = 0; b < Math.floor(peak * 10); b++) {
            const gy = Math.random() * glitchCanvas.height;
            glitchCtx.fillStyle = `rgba(239, 68, 68, ${peak * 0.28})`;
            glitchCtx.fillRect(0, gy - 3, glitchCanvas.width, 22);
            glitchCtx.fillStyle = `rgba(14, 165, 233, ${peak * 0.28})`;
            glitchCtx.fillRect(0, gy + 3, glitchCanvas.width, 22);
          }
        }
      } else if (sFraction > 0.68 && sFraction < 0.77) {
        const t = (sFraction - 0.68) / 0.09;
        const peak = Math.sin(t * Math.PI);
        expFog.density = 0.016 + peak * 0.05;
      } else {
        expFog.density = 0.016;
        if (glitchCtx && !stateRef.current.isModalOpen) {
          glitchCtx.clearRect(0, 0, glitchCanvas.width, glitchCanvas.height);
          glitchCanvas.style.opacity = "0";
        }
      }

      // Igloo Brick Hover Physics & Asymmetric Spring Damping
      raycaster.setFromCamera(stateRef.current.mouseNDC, camera);
      const bMeshes = iglooBricks.map((b) => b.mesh);
      const bHits = raycaster.intersectObjects(bMeshes);
      const hitPoint = bHits.length > 0 && sFraction < 0.22 ? bHits[0].point : null;
      const liftedCoords: { id: number; x: number; y: number }[] = [];

      for (const brick of iglooBricks) {
        if (hitPoint) {
          const d = brick.restCenter.distanceTo(hitPoint);
          if (d < CONFIG.clusterRadius) {
            const w = Math.pow(1.0 - d / CONFIG.clusterRadius, 2.0);
            brick.targetOffset = w * CONFIG.maxDisplacement;
          } else {
            brick.targetOffset = 0;
          }
        } else {
          brick.targetOffset = 0;
        }

        const k = brick.targetOffset > brick.currentOffset ? CONFIG.popOutK : CONFIG.returnK;
        const alpha = 1.0 - Math.exp(-k * dt);
        brick.currentOffset += (brick.targetOffset - brick.currentOffset) * alpha;

        brick.mesh.position.copy(brick.restPosition).addScaledVector(brick.restNormal, brick.currentOffset);
        brick.mesh.rotation.x = brick.restRotation.x + brick.currentOffset * 0.18;
        brick.mesh.rotation.z = brick.restRotation.z + brick.currentOffset * 0.12;

        if (brick.currentOffset > 0.12) {
          brick.isLifted = true;
          const sVec = brick.mesh.position.clone().project(camera);
          const sx = (sVec.x * 0.5 + 0.5) * window.innerWidth;
          const sy = (-(sVec.y * 0.5) + 0.5) * window.innerHeight;
          liftedCoords.push({ id: brick.id, x: sx, y: sy });
          if (brick.currentOffset > 0.22 && Math.random() < 0.08) {
            playBrickThud(stateRef.current.mouseNDC.x);
          }
        } else {
          brick.isLifted = false;
        }
      }

      // 2D HUD Canvas Overlay
      if (hudCtx) {
        hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);

        // Brick HUD Lines & IDs
        if (liftedCoords.length > 0 && sFraction < 0.22) {
          hudCtx.strokeStyle = "rgba(15, 23, 42, 0.4)";
          hudCtx.lineWidth = 1;
          hudCtx.fillStyle = "#0f172a";
          hudCtx.font = "10px 'JetBrains Mono', monospace";

          for (let i = 0; i < liftedCoords.length; i++) {
            for (let j = i + 1; j < liftedCoords.length; j++) {
              const p1 = liftedCoords[i];
              const p2 = liftedCoords[j];
              if (Math.hypot(p1.x - p2.x, p1.y - p2.y) < 92) {
                hudCtx.beginPath();
                hudCtx.moveTo(p1.x, p1.y);
                hudCtx.lineTo(p2.x, p2.y);
                hudCtx.stroke();
              }
            }
          }
          liftedCoords.forEach((p) => {
            hudCtx.fillRect(p.x - 2, p.y - 2, 4, 4);
            hudCtx.fillText(p.id.toString(), p.x + 6, p.y - 4);
          });
        }

        // Telemetry Callouts for Ice Blocks
        if (sFraction > 0.18 && sFraction < 0.48) {
          stateRef.current.pudgyTemp1 += 0.012 * dt;
          stateRef.current.pudgyTemp2 += 0.008 * dt;
          const sc = iceGroup1.position.clone().project(camera);
          const cx = (sc.x * 0.5 + 0.5) * window.innerWidth;
          const cy = (-(sc.y * 0.5) + 0.5) * window.innerHeight;

          hudCtx.strokeStyle = "rgba(2, 132, 199, 0.65)";
          hudCtx.lineWidth = 1;
          hudCtx.fillStyle = "#0f172a";
          hudCtx.font = "11px 'JetBrains Mono', monospace";

          hudCtx.beginPath();
          hudCtx.moveTo(cx - 145, cy - 85);
          hudCtx.lineTo(cx - 62, cy - 32);
          hudCtx.stroke();
          hudCtx.fillRect(cx - 64, cy - 34, 4, 4);
          hudCtx.fillText("PORTFOLIO_CO_01", cx - 235, cy - 95);
          hudCtx.fillText("PUDGY PENGUINS", cx - 235, cy - 80);
          hudCtx.fillText("TEMP", cx + 115, cy - 95);
          hudCtx.fillText(`${stateRef.current.pudgyTemp1.toFixed(2)} / +${stateRef.current.pudgyTemp2.toFixed(2)}`, cx + 115, cy - 80);
          hudCtx.fillText("D 01.02.2020", cx + 115, cy + 92);
          hudCtx.fillText("CLICK TO EXPLORE ↗", cx + 115, cy + 108);
        }

        if (sFraction > 0.42 && sFraction < 0.68) {
          stateRef.current.overpassTemp1 -= 0.015 * dt;
          stateRef.current.overpassTemp2 -= 0.009 * dt;
          const sc = iceGroup2.position.clone().project(camera);
          const cx = (sc.x * 0.5 + 0.5) * window.innerWidth;
          const cy = (-(sc.y * 0.5) + 0.5) * window.innerHeight;

          hudCtx.strokeStyle = "rgba(2, 132, 199, 0.65)";
          hudCtx.lineWidth = 1;
          hudCtx.fillStyle = "#0f172a";
          hudCtx.font = "11px 'JetBrains Mono', monospace";

          hudCtx.beginPath();
          hudCtx.moveTo(cx - 145, cy - 85);
          hudCtx.lineTo(cx - 62, cy - 32);
          hudCtx.stroke();
          hudCtx.fillRect(cx - 64, cy - 34, 4, 4);
          hudCtx.fillText("PORTFOLIO_CO_02", cx - 225, cy - 95);
          hudCtx.fillText("OVERPASS", cx - 225, cy - 80);
          hudCtx.fillText("TEMP", cx + 115, cy - 95);
          hudCtx.fillText(`${stateRef.current.overpassTemp1.toFixed(2)} / ${stateRef.current.overpassTemp2.toFixed(2)}`, cx + 115, cy - 80);
          hudCtx.fillText("D 06.01.2023", cx + 115, cy + 92);
          hudCtx.fillText("CLICK TO EXPLORE ↗", cx + 115, cy + 108);
        }

        // Dais Floor Navigation Labels
        if (sFraction > 0.76) {
          const sc = daisGroup.position.clone().project(camera);
          const dx = (sc.x * 0.5 + 0.5) * window.innerWidth;
          const dy = (-(sc.y * 0.5) + 0.5) * window.innerHeight;
          hudCtx.font = "12px 'JetBrains Mono', monospace";

          const items = [
            { name: "Medium", idx: 1, x: dx - 185 },
            { name: "LinkedIn", idx: 0, x: dx - 45 },
            { name: "X / Twitter", idx: 2, x: dx + 105 },
          ];
          items.forEach((item) => {
            if (stateRef.current.daisMorphTarget === item.idx) {
              hudCtx.fillStyle = "#ffffff";
              hudCtx.fillText(`┌ ${item.name} ┘`, item.x, dy + 185);
            } else {
              hudCtx.fillStyle = "#64748b";
              hudCtx.fillText(item.name, item.x, dy + 185);
            }
          });

          if (!hasShimmered) {
            hasShimmered = true;
            playDaisShimmer();
          }
        } else {
          hasShimmered = false;
        }
      }

      // Crystal Rotations
      iceGroup1.rotation.y += 0.006;
      iceGroup1.rotation.x = stateRef.current.mouseNDC.y * 0.25;
      iceGroup1.rotation.z = stateRef.current.mouseNDC.x * 0.15;

      iceGroup2.rotation.y += 0.007;
      iceGroup2.rotation.x = stateRef.current.mouseNDC.y * 0.22;
      iceGroup2.rotation.z = -stateRef.current.mouseNDC.x * 0.18;

      outerRingMesh.rotation.z += 0.012;
      innerRingMesh.rotation.z -= 0.018;

      // Volumetric Particle Swirling Vortex
      const posArr = particleGeo.attributes.position.array as Float32Array;
      const colArr = particleGeo.attributes.color.array as Float32Array;
      const targetArr = morphTargets[stateRef.current.daisMorphTarget];
      let tSpeed = 0;
      const mSpeed = stateRef.current.mouseVelocity.length();
      const mWorld = new THREE.Vector3(stateRef.current.mouseNDC.x * 6.0, -112.0 + stateRef.current.mouseNDC.y * 3.5, 0.0);

      for (let i = 0; i < pCount; i++) {
        const idx = i * 3;
        let px = posArr[idx + 0], py = posArr[idx + 1], pz = posArr[idx + 2];
        let vx = particleVelocities[idx + 0], vy = particleVelocities[idx + 1], vz = particleVelocities[idx + 2];

        // Target Spring
        vx += (targetArr[idx + 0] - px) * 3.4 * dt;
        vy += (targetArr[idx + 1] - py) * 3.4 * dt;
        vz += (targetArr[idx + 2] - pz) * 3.4 * dt;

        // Mouse Vortex Swirl & Upward Tornado Lift
        if (sFraction > 0.72) {
          const distToM = Math.hypot(px - mWorld.x, pz - mWorld.z);
          if (distToM < 4.4) {
            const w = Math.pow(1.0 - distToM / 4.4, 1.5);
            const tanX = -(pz - mWorld.z) / (distToM + 0.1);
            const tanZ = (px - mWorld.x) / (distToM + 0.1);
            vx += (tanX * mSpeed * 0.085 + Math.sin(currentTime * 0.01 + i) * 0.45) * w;
            vy += 2.0 * mSpeed * 0.045 * w;
            vz += (tanZ * mSpeed * 0.085 + Math.cos(currentTime * 0.01 + i) * 0.45) * w;
          }
        }

        vx *= Math.exp(-2.2 * dt);
        vy *= Math.exp(-2.2 * dt);
        vz *= Math.exp(-2.2 * dt);

        particleVelocities[idx + 0] = vx;
        particleVelocities[idx + 1] = vy;
        particleVelocities[idx + 2] = vz;

        posArr[idx + 0] += vx * dt * 12.0;
        posArr[idx + 1] += vy * dt * 12.0;
        posArr[idx + 2] += vz * dt * 12.0;

        const spd = Math.hypot(vx, vy, vz);
        tSpeed += spd;
        const factor = Math.min(1.0, spd * 0.85);
        colArr[idx + 0] = 0.22 + factor * 0.78;
        colArr[idx + 1] = 0.26 + factor * 0.74;
        colArr[idx + 2] = 0.32 + factor * 0.68;
      }

      particleGeo.attributes.position.needsUpdate = true;
      particleGeo.attributes.color.needsUpdate = true;

      stateRef.current.averageParticleSpeed = tSpeed / pCount;
      if (vortexFilterRef.current && vortexGainRef.current && audioContextRef.current && stateRef.current.soundEnabled) {
        const cutoff = 400 + stateRef.current.averageParticleSpeed * 1200;
        const gain = Math.min(0.22, stateRef.current.averageParticleSpeed * 0.16);
        vortexFilterRef.current.frequency.setValueAtTime(cutoff, audioContextRef.current.currentTime);
        vortexGainRef.current.gain.setValueAtTime(gain, audioContextRef.current.currentTime);
      }

      // Snow Movement
      const sPosArr = snowGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < snowCount; i++) {
        sPosArr[i * 3 + 0] += snowVelocities[i * 3 + 0] * dt * 5.0;
        sPosArr[i * 3 + 1] += snowVelocities[i * 3 + 1] * dt * 5.0;
        sPosArr[i * 3 + 2] += snowVelocities[i * 3 + 2] * dt * 5.0;
        if (sPosArr[i * 3 + 1] < -0.5) sPosArr[i * 3 + 1] = 25;
        if (sPosArr[i * 3 + 0] < -30) sPosArr[i * 3 + 0] = 30;
        if (sPosArr[i * 3 + 2] < -30) sPosArr[i * 3 + 2] = 30;
      }
      snowGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(preloaderTimeout);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("click", handleClick);
      renderer.dispose();
    };
  }, [handleOpenModal, playBraaamHit, playBrickThud, playDaisShimmer, waveDecodeText, initAudio]);

  // Morph Controls
  const handleMorph = (dir: number) => {
    initAudio();
    const nextIdx = (daisMorphIndex + dir + 3) % 3;
    setDaisMorphIndex(nextIdx);
    stateRef.current.daisMorphTarget = nextIdx;
    playTextTick();
  };

  // Scene Navigation Click
  const handleJumpScene = (sceneName: string) => {
    initAudio();
    setActiveSceneName(sceneName);
    if (sceneName === "intro") {
      setPreloaderActive(true);
      setTimeout(() => setPreloaderActive(false), 1800);
    } else if (sceneName === "igloo") {
      stateRef.current.targetScrollPos = 0;
    } else if (sceneName === "pudgy") {
      stateRef.current.targetScrollPos = 2400;
    } else if (sceneName === "overpass") {
      stateRef.current.targetScrollPos = 4800;
    } else if (sceneName === "portal") {
      stateRef.current.targetScrollPos = 6800;
    } else if (sceneName === "dais") {
      stateRef.current.targetScrollPos = 8400;
    } else if (sceneName === "loop") {
      stateRef.current.targetScrollPos = CONFIG.scrollMax;
    }
  };

  // Cursor brush scramble on modal body
  const handleBrushScramble = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!modalOpen) return;
    const fullText = PROJECTS[activeProjectKey].text;
    const rect = e.currentTarget.getBoundingClientRect();
    const relY = (e.clientY - rect.top) / rect.height;
    const charIndex = Math.floor(relY * fullText.length);

    let scrambled = "";
    for (let i = 0; i < fullText.length; i++) {
      if (Math.abs(i - charIndex) < 18 && fullText[i] !== " ") {
        scrambled += CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
      } else {
        scrambled += fullText[i];
      }
    }
    setModalDisplayText(scrambled);
    playTextTick();

    const t = setTimeout(() => {
      setModalDisplayText(fullText);
    }, 200);
    return () => clearTimeout(t);
  };

  if (!mounted) return null;

  return (
    <div className={`relative w-full h-screen overflow-hidden ${modalOpen ? "dark-mode" : ""}`}>
      <style>{IGLOO_STYLES}</style>
      {/* Scroll Progress Bar */}
      <div className="scroll-progress-line" style={{ width: `${scrollPercent}%` }} />

      {/* WebGL Canvas */}
      <canvas ref={canvasRef} id="webgl-canvas" className="absolute inset-0 w-full h-full block z-1" />

      {/* 2D HUD Canvas */}
      <canvas ref={hudCanvasRef} id="hud-canvas" className="absolute inset-0 w-full h-full pointer-events-none z-5" />

      {/* Glitch Overlay Canvas */}
      <canvas ref={glitchCanvasRef} id="glitch-overlay" className="absolute inset-0 w-full h-full pointer-events-none z-35 opacity-0" />

      {/* Rainbow Flare */}
      <div ref={flareRef} id="rainbow-flare" className="absolute inset-0 z-60 pointer-events-none opacity-0 transition-opacity duration-400" />

      {/* Drifting Background Text (Scene C & E) */}
      <div className={`bg-drifting-text-layer ${showDriftingText ? "opacity-100" : "opacity-0"}`}>
        <div className="drifting-text-item top-[18%] left-[8%] text-[80px]">DATA</div>
        <div className="drifting-text-item top-[36%] right-[5%] text-[54px]">PRE LOAD OFF / 2</div>
        <div className="drifting-text-item top-[55%] left-[12%] text-[50px]">002 NON FUNGIBLE TOKEN</div>
        <div className="drifting-text-item top-[72%] right-[14%] text-[66px]">01 DEFI</div>
        <div className="drifting-text-item top-[86%] left-[22%] text-[44px]">00.001.22</div>
      </div>

      {/* Stage Pill */}
      <div className="info-pill">{stagePillText}</div>

      {/* Persistent HUD Layer */}
      <div className="hud-layer">
        <div className="hud-row-top">
          <div className="brand-block">
            <div className={`igloo-wordmark ${modalOpen ? "glow-bright" : ""}`}>IGLOO</div>
            <div
              className="copyright-block"
              onClick={() => waveDecodeText("// Copyright © 2026\nIgloo, Inc. All Rights Reserved.", setCopyrightText)}
            >
              {copyrightText.split("\n").map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </div>
          </div>

          <div
            className="manifesto-block"
            onMouseEnter={() =>
              waveDecodeText(
                "Our mission is to build the next generation of consumer brands at the intersection of Community, AI, and crypto.",
                setManifestoText
              )
            }
          >
            <div className="manifesto-title">///// Manifesto</div>
            <div className="manifesto-body">{manifestoText}</div>
          </div>
        </div>

        <div className="hud-row-bottom">
          <div className="bottom-left-block">
            {showScrollPrompt && (
              <div className="scroll-prompt">
                <span>Scroll down to discover.</span>
                <span>↓</span>
              </div>
            )}
            <button className="sound-toggle-btn" onClick={toggleSound}>
              <span className="sound-speaker-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  {soundEnabled && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />}
                </svg>
              </span>
              <span>Sound: {soundEnabled ? "On" : "Off"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dais Morph Arrows */}
      <button className={`dais-nav-arrow dais-arrow-left ${showDaisArrows ? "active" : ""}`} onClick={() => handleMorph(-1)}>
        ‹
      </button>
      <button className={`dais-nav-arrow dais-arrow-right ${showDaisArrows ? "active" : ""}`} onClick={() => handleMorph(1)}>
        ›
      </button>

      {/* Bottom Scene Jumper Bar */}
      <div className="scene-nav-bar">
        {[
          { key: "intro", label: "Intro (0:04)" },
          { key: "igloo", label: "Igloo Dome (0:10)" },
          { key: "pudgy", label: "Pudgy Penguins (0:22)" },
          { key: "overpass", label: "Overpass (0:37)" },
          { key: "portal", label: "Portal Ring (0:48)" },
          { key: "dais", label: "Particle Dais (0:54)" },
          { key: "loop", label: "Loop Reset (0:58)" },
        ].map((s) => (
          <button
            key={s.key}
            className={`nav-pill ${activeSceneName === s.key ? "active" : ""}`}
            onClick={() => handleJumpScene(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ASCII Preloader */}
      {preloaderActive && (
        <div id="preloader-overlay">
          <div className="ascii-preloader-text">{asciiText}</div>
        </div>
      )}

      {/* Freeze Summary Modal */}
      <div id="modal-container" className={modalOpen ? "active" : ""}>
        <div className="modal-card">
          <div className="modal-header-row">
            <div className="modal-category-title">{PROJECTS[activeProjectKey]?.title}</div>
            <div className="corner-bracket-wrap">
              <span className="corner-tl">┌</span>
              <span className="corner-tr">┐</span>
              <span className="corner-bl">└</span>
              <span className="corner-br">┘</span>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
          <div className="modal-body-scramble-text" onMouseMove={handleBrushScramble}>
            {modalDisplayText}
          </div>
          {PROJECTS[activeProjectKey]?.hasDiscover && (
            <div className="modal-discover-row">
              <div className="modal-discover-label">/// Discover</div>
              <div className="corner-bracket-wrap">
                <span className="corner-tl">┌</span>
                <span className="corner-tr">┐</span>
                <span className="corner-bl">└</span>
                <span className="corner-br">┘</span>
                <a
                  href={PROJECTS[activeProjectKey]?.linkHref}
                  target="_blank"
                  rel="noreferrer"
                  className="modal-external-link"
                >
                  {PROJECTS[activeProjectKey]?.linkText}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IglooExperience;
