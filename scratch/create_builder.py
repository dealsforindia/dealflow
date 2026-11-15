import os

# Helper to write python builder script
script_file = r"e:\Rudranildocs0066543\html-yt\scratch\build_perfect_simulation.py"

content = '''import os

output_path = r"e:\\Rudranildocs0066543\\html-yt\\wdg4g-lhb-simulation.html"

# We will write in chunks to guarantee zero corruption and clean formatting
with open(output_path, "w", encoding="utf-8") as f:
    f.write("""<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Indian Railways WDG4G + LHB Express Consist — 3D Blueprint, GLSL Shader & Multi-Body Physics Simulation</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

    <style>
        * {
            box-sizing: border-box;
            user-select: none;
            -webkit-user-select: none;
        }
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #050811;
            font-family: 'Inter', sans-serif;
            color: #f1f5f9;
        }
        .mono {
            font-family: 'JetBrains Mono', monospace;
        }
        #canvas-container {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            cursor: grab;
        }
        #canvas-container:active {
            cursor: grabbing;
        }
        .glass-panel {
            background: rgba(8, 13, 24, 0.88);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border: 1px solid rgba(148, 163, 184, 0.2);
            box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.8);
        }
        .glass-pill {
            background: rgba(15, 23, 42, 0.94);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(250, 204, 21, 0.45);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.65);
        }
        input[type="range"] {
            -webkit-appearance: none;
            appearance: none;
            background: rgba(51, 65, 85, 0.75);
            height: 6px;
            border-radius: 999px;
            outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background: #facc15;
            border: 2px solid #ffffff;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(250, 204, 21, 0.85);
            transition: transform 0.15s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.18);
        }
        .callout-card {
            position: absolute;
            transform: translate(-50%, -50%);
            pointer-events: none;
            transition: opacity 0.22s ease;
            z-index: 15;
        }
        .flow-step {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .flow-step.active {
            border-color: #facc15;
            background: rgba(161, 98, 7, 0.38);
            box-shadow: 0 0 16px rgba(250, 204, 21, 0.35);
            color: #ffffff;
        }
        ::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }
        ::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.4);
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(100, 116, 139, 0.6);
            border-radius: 999px;
        }
    </style>
</head>
<body class="relative w-full h-full select-none overflow-hidden">

    <!-- 3D WebGL Canvas Container -->
    <div id="canvas-container"></div>

    <!-- 2D SVG Overlay for Crisp Blueprint Leader Lines & Anchor Dots -->
    <svg id="leader-svg" class="fixed inset-0 w-full h-full pointer-events-none z-10"></svg>

    <!-- Floating HTML Callout Container -->
    <div id="callouts-container" class="fixed inset-0 w-full h-full pointer-events-none z-10 overflow-hidden"></div>

    <header class="fixed top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div class="glass-panel rounded-xl px-3.5 py-2 pointer-events-auto flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_12px_#facc15]"></div>
            <div>
                <div class="flex items-center gap-2">
                    <h1 class="text-xs sm:text-sm font-bold tracking-wider uppercase text-yellow-400">Indian Railways • CAMTECH Express Consist</h1>
                    <span class="text-[10px] mono px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/35">WDG-4G + LHB EOG &amp; AC Coaches</span>
                    <span class="hidden xl:inline-block text-[10px] mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">PBR Studio HDRI • 3D Perforated Shell • Kinematic Linkages</span>
                </div>
                <p class="text-[10px] text-slate-400 hidden sm:block">GEVO-12 (4500 HP Slider-Crank) • 5GMG210B2 • 6x 5GEB24 • Coupled LHB LWLRRM (2×500 kVA V12 EOG) &amp; LWACCN/EC (3D Windows, S-Curve Chairs, Berths, FIAT Disc Brakes)</p>
            </div>
        </div>

        <nav class="glass-panel rounded-xl p-1.5 pointer-events-auto flex flex-wrap items-center gap-1">
            <button data-stage="0" class="stage-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all bg-yellow-400 text-slate-950 shadow-sm">
                1. Express Consist &amp; Cutaway
            </button>
            <button data-stage="1" class="stage-btn px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all">
                2. WDG4G &amp; LHB Interiors (16)
            </button>
            <button data-stage="2" class="stage-btn px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all">
                3. Exploded Blueprint
            </button>
            <button data-stage="3" class="stage-btn px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all">
                4. AC-AC + 750V EOG Hotel Load
            </button>
            <button data-stage="4" class="stage-btn px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all">
                5. Thermal Shader &amp; Brake Physics
            </button>
            <div class="h-4 w-[1px] bg-slate-700/80 mx-1 hidden sm:block"></div>
            <button id="horn-btn" class="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 hover:bg-yellow-500/35 active:scale-95 flex items-center gap-1 shadow-sm" title="Hold to Sound WDG4G Dual-Tone Pneumatic Horn">
                <span>📯</span>
                <span class="hidden sm:inline">Horn</span>
            </button>
            <button id="sound-toggle-btn" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <span id="sound-icon">🔊</span>
                <span id="sound-label">Audio: ON</span>
            </button>
        </nav>
    </header>

    <aside class="fixed top-20 left-3 z-20 flex flex-col gap-2 max-h-[calc(100vh-190px)] w-72 sm:w-80 pointer-events-none">
        <div class="glass-panel rounded-xl p-2.5 pointer-events-auto flex flex-col gap-1.5">
            <div class="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-slate-300">
                <span>Consist Camera Target</span>
                <span id="active-car-badge" class="mono text-yellow-400">Full Rake</span>
            </div>
            <div class="grid grid-cols-4 gap-1">
                <button data-focus="rake" class="focus-btn py-1 px-1.5 rounded text-[10px] font-semibold bg-yellow-400 text-slate-950 transition-all">Full Express</button>
                <button data-focus="loco" class="focus-btn py-1 px-1.5 rounded text-[10px] font-medium bg-slate-800/90 text-slate-300 hover:text-white transition-all">WDG4G Loco</button>
                <button data-focus="eog" class="focus-btn py-1 px-1.5 rounded text-[10px] font-medium bg-slate-800/90 text-slate-300 hover:text-white transition-all">LHB EOG Car</button>
                <button data-focus="coach" class="focus-btn py-1 px-1.5 rounded text-[10px] font-medium bg-slate-800/90 text-slate-300 hover:text-white transition-all">LHB AC Coach</button>
            </div>
        </div>

        <div id="inspector-panel" class="glass-panel rounded-xl p-3 pointer-events-auto flex flex-col overflow-hidden transition-all duration-300">
            <div class="flex items-center justify-between pb-2 mb-1.5 border-b border-slate-700/70">
                <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-yellow-400"></span>
                    <span class="text-[11px] font-semibold tracking-wide text-slate-200 uppercase">WDG4G &amp; LHB Systems (16)</span>
                </div>
                <button id="clear-highlight-btn" class="text-[11px] text-yellow-400 hover:text-yellow-300 font-medium hidden">Show All</button>
            </div>
            <div id="component-list" class="flex flex-col gap-1 overflow-y-auto pr-1 text-xs max-h-48">
            </div>
        </div>

        <div id="camtech-maint-panel" class="glass-panel rounded-xl p-3 pointer-events-auto flex flex-col gap-1.5 transition-all duration-300">
            <div class="flex items-center justify-between border-b border-slate-700/70 pb-1.5">
                <span class="text-[10.5px] font-bold uppercase tracking-wider text-yellow-400">CAMTECH Blueprint Specification</span>
                <span id="maint-code-badge" class="text-[9px] mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">WDG4G + LHB</span>
            </div>
            <div id="maint-sys-title" class="text-xs font-bold text-white">WDG4G (ES43ACmi) + LHB Rajdhani Express Rake</div>
            <div id="maint-sys-specs" class="text-[10.5px] text-slate-300 leading-relaxed">
                • WDG4G Loco: <span class="mono text-yellow-300">22,567 mm • 132 t • GEVO-12 (4,500 HP)</span><br>
                • LHB Shell: <span class="mono text-rose-300">23,540 mm Body (24.0 m CBC) • 3,240 mm W</span><br>
                • Bogies: <span class="mono text-sky-300">Co-Co (6x 5GEB24) + FIAT (2,560 mm WB, 640mm Discs)</span>
            </div>
        </div>
    </aside>

    <aside class="fixed top-20 right-3 z-20 flex flex-col gap-2 max-h-[calc(100vh-190px)] w-72 sm:w-80 pointer-events-none">
        <div class="glass-panel rounded-xl p-3 pointer-events-auto flex flex-col gap-2">
            <div class="flex items-center justify-between">
                <span class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-300">3-Ph Traction &amp; CBC Coupler Physics</span>
                <span id="freq-readout" class="text-[10.5px] mono text-yellow-400 font-semibold">740 VDC • +142 kN Draft</span>
            </div>
            <div class="relative w-full h-16 bg-slate-950/90 rounded-lg border border-slate-800 overflow-hidden">
                <canvas id="scope-canvas" class="w-full h-full block"></canvas>
                <div class="absolute bottom-1 left-2 right-2 flex justify-between text-[8.5px] mono">
                    <span class="text-yellow-400">━ 1400V DC</span>
                    <span class="text-rose-400">● 3-Ph Motor</span>
                    <span class="text-emerald-400">━ CBC Coupler Force</span>
                    <span class="text-sky-400">● Bogie Bounce</span>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800">
                <div class="bg-slate-900/75 rounded-lg p-1.5 border border-slate-800/90">
                    <div class="flex justify-between text-[9px] uppercase tracking-wider text-slate-400">
                        <span>GEVO-12 RPM</span>
                        <span id="notch-badge" class="mono text-yellow-400 font-bold">NOTCH 3</span>
                    </div>
                    <div class="flex items-baseline gap-1 mt-0.5">
                        <span id="rpm-readout" class="text-sm font-bold mono text-white">705</span>
                        <span class="text-[9.5px] mono text-yellow-400">RPM</span>
                    </div>
                    <div class="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div id="rpm-bar" class="h-full bg-gradient-to-r from-sky-400 to-yellow-400 w-[55%] transition-all duration-150"></div>
                    </div>
                </div>

                <div class="bg-slate-900/75 rounded-lg p-1.5 border border-slate-800/90">
                    <div class="flex justify-between text-[9px] uppercase tracking-wider text-slate-400">
                        <span>5GMG210 + EOG</span>
                        <span id="hp-readout" class="mono text-emerald-400 font-bold">1520 HP</span>
                    </div>
                    <div class="flex items-baseline gap-1 mt-0.5">
                        <span id="volt-readout" class="text-sm font-bold mono text-yellow-300">890</span>
                        <span class="text-[9.5px] mono text-slate-400">VDC / 750V</span>
                    </div>
                    <div class="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div id="volt-bar" class="h-full bg-gradient-to-r from-emerald-400 to-yellow-400 w-[64%] transition-all duration-150"></div>
                    </div>
                </div>

                <div class="bg-slate-900/75 rounded-lg p-1.5 border border-slate-800/90">
                    <div class="flex justify-between text-[9px] uppercase tracking-wider text-slate-400">
                        <span>Express Speed</span>
                        <span id="te-readout" class="mono text-sky-300">280 kN TE</span>
                    </div>
                    <div class="flex items-baseline gap-1 mt-0.5">
                        <span id="speed-readout" class="text-sm font-bold mono text-white">42</span>
                        <span class="text-[9.5px] mono text-sky-400">km/h</span>
                    </div>
                </div>

                <div class="bg-slate-900/75 rounded-lg p-1.5 border border-slate-800/90">
                    <div class="flex justify-between text-[9px] uppercase tracking-wider text-slate-400">
                        <span>Core / Disc Temp</span>
                        <span id="mr-readout" class="mono text-cyan-300">BP 5.0 kg/cm²</span>
                    </div>
                    <div class="flex items-baseline gap-1 mt-0.5">
                        <span id="temp-readout" class="text-sm font-bold mono text-emerald-400">78.4</span>
                        <span class="text-[9.5px] mono text-slate-400">°C</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="glass-panel rounded-xl p-3 pointer-events-auto flex flex-col gap-2">
            <div class="flex flex-col gap-1">
                <div class="flex justify-between text-[10.5px] text-slate-300">
                    <span class="font-semibold uppercase tracking-wider">GLSL Render &amp; Shell Mode</span>
                    <span id="housing-mode-label" class="mono text-yellow-400">Cutaway Interior</span>
                </div>
                <div class="grid grid-cols-5 gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
                    <button data-housing="solid" class="housing-btn py-1 rounded text-[9.5px] font-medium text-slate-300 hover:text-white transition-all">Livery</button>
                    <button data-housing="cutaway" class="housing-btn py-1 rounded text-[9.5px] font-semibold bg-yellow-400 text-slate-950 transition-all">Cutaway</button>
                    <button data-housing="xray" class="housing-btn py-1 rounded text-[9.5px] font-medium text-slate-300 hover:text-white transition-all">X-Ray</button>
                    <button data-housing="blueprint" class="housing-btn py-1 rounded text-[9.5px] font-medium text-sky-300 hover:text-white transition-all">Blueprint</button>
                    <button data-housing="thermal" class="housing-btn py-1 rounded text-[9.5px] font-medium text-rose-300 hover:text-white transition-all">Thermal</button>
                </div>
            </div>

            <div class="flex flex-col gap-1">
                <div class="flex justify-between text-[10.5px] text-slate-300">
                    <span>CCA Throttle Notch (EFI)</span>
                    <span id="notch-slider-val" class="mono text-yellow-400 font-semibold">Notch 3 (705 RPM)</span>
                </div>
                <input id="notch-slider" type="range" min="0" max="9" step="1" value="4" class="w-full">
                <div class="flex justify-between text-[8px] mono text-slate-500 px-0.5">
                    <span>APU</span><span>IDLE</span><span>N1</span><span>N2</span><span>N3</span><span>N4</span><span>N5</span><span>N6</span><span>N7</span><span>N8</span>
                </div>
            </div>

            <div class="flex flex-col gap-1">
                <div class="flex justify-between text-[10.5px] text-slate-300">
                    <span>Consist Exploded Blueprint</span>
                    <span id="explode-val" class="mono text-yellow-400">0%</span>
                </div>
                <input id="explode-slider" type="range" min="0" max="100" value="0" class="w-full">
            </div>

            <div class="flex flex-col gap-1 pt-0.5 border-t border-slate-800/80">
                <div class="flex justify-between text-[10.5px] text-slate-300">
                    <span>🚂 GEVO-12 + FIAT Joint Clack</span>
                    <span id="audio-telemetry-readout" class="mono text-emerald-400 text-[9.5px]">V12 + EOG 50Hz</span>
                </div>
                <div class="flex items-center gap-2">
                    <input id="volume-slider" type="range" min="0" max="100" value="75" class="w-full">
                    <span id="volume-val" class="mono text-[10px] text-slate-400 w-8 text-right">75%</span>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-1.5 pt-0.5">
                <button id="toggle-flux-btn" class="px-2 py-1.5 rounded-lg text-[10.5px] font-medium border border-sky-500/40 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 transition-all flex items-center justify-center gap-1">
                    <span>⚡</span> Traction &amp; 750V EOG
                </button>
                <button id="toggle-dynbrake-btn" class="px-2 py-1.5 rounded-lg text-[10.5px] font-medium border border-rose-500/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 transition-all flex items-center justify-center gap-1">
                    <span>🔥</span> DB + 640mm Disc Brake
                </button>
                <button id="jolt-physics-btn" class="px-2 py-1.5 rounded-lg text-[10.5px] font-medium border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-1" title="Inject Track Turnout Impulse into Co-Co & FIAT Bogie Suspension">
                    <span>〰️</span> Track Turnout Jolt
                </button>
                <button id="toggle-night-btn" class="px-2 py-1.5 rounded-lg text-[10.5px] font-medium border border-indigo-500/40 bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 transition-all flex items-center justify-center gap-1">
                    <span>🌙</span> Night Express Lights
                </button>
                <button id="toggle-deep-labels-btn" class="px-2 py-1.5 rounded-lg text-[10.5px] font-medium border border-yellow-500/40 bg-yellow-500/15 text-yellow-300 hover:bg-yellow-500/25 transition-all flex items-center justify-center gap-1">
                    <span>🔬</span> All Blueprint Tags
                </button>
                <button id="bogie-cam-btn" class="px-2 py-1.5 rounded-lg text-[10.5px] font-medium border border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 transition-all flex items-center justify-center gap-1">
                    <span>⚙️</span> FIAT Bogie &amp; Discs
                </button>
            </div>
        </div>
    </aside>

    <footer class="fixed bottom-3 left-3 right-3 z-20 flex flex-col items-center gap-2 pointer-events-none">
        <div id="caption-banner" class="glass-pill rounded-xl px-5 py-1.5 text-center max-w-3xl pointer-events-auto transition-all duration-300">
            <div id="caption-title" class="text-xs sm:text-sm font-bold text-white tracking-wide">
                Indian Railways WDG4G (GE ES43ACmi) + LHB Express Coaches — Blueprint &amp; Physics Simulation
            </div>
            <div id="caption-sub" class="text-[11px] sm:text-xs text-yellow-300 mt-0.5">
                GEVO-12 (4500 HP) • 6x 5GEB24 Motors • AAR Type-H Tightlock Couplers • LHB EOG (2×500 kVA V12) • LHB AC 3-Tier &amp; Executive Chair Interior
            </div>
        </div>

        <div id="flowchart-bar" class="glass-panel rounded-xl px-3 py-1.5 pointer-events-auto hidden sm:flex items-center gap-1.5 text-[10px] max-w-5xl overflow-x-auto">
            <div data-flow="0" class="flow-step active px-2 py-1 rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200 whitespace-nowrap font-medium">
                1. GEVO-12 (4500 HP) + 7S1712 Turbo
            </div>
            <span class="text-yellow-400 font-bold">→</span>
            <div data-flow="1" class="flow-step px-2 py-1 rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200 whitespace-nowrap font-medium">
                2. 5GMG210B2 (1400 VDC) → 6x IGBT
            </div>
            <span class="text-yellow-400 font-bold">→</span>
            <div data-flow="2" class="flow-step px-2 py-1 rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200 whitespace-nowrap font-medium">
                3. 6x 5GEB24 Motors (544 kN TE)
            </div>
            <span class="text-yellow-400 font-bold">→</span>
            <div data-flow="3" class="flow-step px-2 py-1 rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200 whitespace-nowrap font-medium">
                4. AAR Type-H Tightlock CBC Draft Gear
            </div>
            <span class="text-yellow-400 font-bold">→</span>
            <div data-flow="4" class="flow-step px-2 py-1 rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200 whitespace-nowrap font-medium">
                5. LHB EOG 2×500 kVA (750V 3-Ph Hotel Bus)
            </div>
            <span class="text-yellow-400 font-bold">→</span>
            <div data-flow="5" class="flow-step px-2 py-1 rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200 whitespace-nowrap font-medium">
                6. LHB 2×7 TR RMPUs + FIAT Disc Brakes
            </div>
        </div>

        <div class="glass-panel rounded-xl px-4 py-2 w-full max-w-4xl pointer-events-auto flex items-center gap-3">
            <button id="play-pause-btn" class="w-8 h-8 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 flex items-center justify-center font-bold text-sm transition-all shadow">
                ⏸
            </button>
            <div class="flex flex-col flex-1 gap-1">
                <div class="flex justify-between text-[10px] mono text-slate-400">
                    <span id="timeline-stage-name" class="text-yellow-300 font-semibold">STAGE 1: WDG4G + COUPLED LHB EXPRESS CONSIST &amp; INTERIOR CUTAWAY</span>
                    <span><span id="time-current" class="text-white">00:00</span> / 00:45</span>
                </div>
                <input id="timeline-scrubber" type="range" min="0" max="45" step="0.05" value="0" class="w-full">
            </div>
            <button id="reset-cam-btn" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all">
                Reset View
            </button>
        </div>
    </footer>
""")
print("Base HTML structure initialized.")
'''

with open(script_file, "w", encoding="utf-8") as f:
    f.write(content)
print("Builder script base created.")
