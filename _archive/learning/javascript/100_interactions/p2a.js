// ── 61 Etch-a-Sketch
(() => {
    const t = tile(61, "Etch-a-Sketch", `<canvas id="ea-c" width="200" height="160" style="border-radius:4px;background:#eee;cursor:crosshair;border:4px solid #c00"></canvas><div style="display:flex;gap:8px;margin-top:6px"><button onclick="const c=document.getElementById('ea-c');c.getContext('2d').fillStyle='#eee';c.getContext('2d').fillRect(0,0,200,160)" style="background:#c00;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem">SHAKE</button></div>`, "w2");
    const c = document.getElementById("ea-c"), ctx = c.getContext("2d"); ctx.strokeStyle = "#222"; ctx.lineWidth = 2; ctx.lineCap = "round";
    let px = 100, py = 80, drawing = false;
    c.addEventListener("mousedown", e => { drawing = true; const r = c.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; ctx.beginPath(); ctx.moveTo(px, py) });
    c.addEventListener("mouseup", () => drawing = false); c.addEventListener("mouseleave", () => drawing = false);
    c.addEventListener("mousemove", e => { if (!drawing) return; const r = c.getBoundingClientRect(); const nx = e.clientX - r.left, ny = e.clientY - r.top; ctx.lineTo(nx, ny); ctx.stroke(); tone(200 + Math.abs(nx - px) * 5, "sine", 0.02, 0.02); px = nx; py = ny });
})();

// ── 62 Dice Roller
(() => {
    const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    tile(62, "Dice Roller", `<div style="display:flex;flex-direction:column;align-items:center;gap:10px"><div id="dice-em" style="font-size:4rem;cursor:pointer;transition:transform 0.2s;display:inline-block" onclick="this.style.transform='rotateX(720deg) rotateY(360deg)';setTimeout(()=>{this.style.transform='';document.getElementById('dice-val').textContent=${JSON.stringify(faces)}[Math.floor(Math.random()*6)];},600);nz(0.1,0.2,300,2000)">⚀</div><div id="dice-val" style="font-family:JetBrains Mono,monospace;font-size:0.7rem;color:var(--dim)">Click to roll</div></div>`, "", "background:#fffaf0");
})();

// ── 63 Metronome
(() => {
    let bpm = 120, iv = null, beat = 0;
    tile(63, "Metronome", `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:100%"><div style="display:flex;align-items:center;gap:8px"><div id="met-dot" style="width:16px;height:16px;border-radius:50%;background:#ddd;transition:background 0.05s"></div><div id="met-bpm" style="font-family:JetBrains Mono,monospace;font-size:1rem;font-weight:700">120</div><span style="font-family:JetBrains Mono,monospace;font-size:0.6rem;color:var(--dim)">BPM</span></div><input type="range" min="40" max="240" value="120" style="width:100%;color:#e63946" oninput="window._metBpm=+this.value;document.getElementById('met-bpm').textContent=this.value"><div style="display:flex;gap:8px"><button id="met-start" onclick="window._metStart()" style="background:#1a1a1a;color:#fff;border:none;border-radius:7px;padding:5px 12px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem">START</button><button onclick="clearInterval(window._metIv);window._metIv=null;document.getElementById('met-dot').style.background='#ddd';document.getElementById('met-start').textContent='START'" style="background:none;border:1.5px solid var(--border);border-radius:7px;padding:5px 12px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem;color:var(--dim)">STOP</button></div></div>`);
    window._metBpm = 120; window._metIv = null;
    window._metStart = () => { if (window._metIv) return; let b = 0; const tick = () => { b++; const dot = document.getElementById("met-dot"); dot.style.background = b % 4 === 1 ? "#e63946" : "#555"; setTimeout(() => dot.style.background = "#ddd", 80); if (b % 4 === 1) tone(880, "square", 0.05, 0.15); else tone(440, "square", 0.05, 0.08); window._metIv = setTimeout(tick, 60000 / window._metBpm) }; tick() };
})();

// ── 64 Gravity Well
(() => {
    const t = tile(64, "Gravity Well · Click", "<canvas id='gw-c' width='220' height='180' style='border-radius:10px;background:#050510;cursor:pointer'></canvas>", "w2", "background:#050510");
    const c = document.getElementById("gw-c"), ctx = c.getContext("2d"); const W = 220, H = 180;
    const ps = Array.from({ length: 60 }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, hue: Math.random() * 360 }));
    let wells = [{ x: 110, y: 90 }];
    c.addEventListener("click", e => { const r = c.getBoundingClientRect(); wells = [{ x: e.clientX - r.left, y: e.clientY - r.top }]; thud() });
    (function loop() {
        ctx.fillStyle = "rgba(5,5,16,0.15)"; ctx.fillRect(0, 0, W, H);
        ps.forEach(p => { wells.forEach(w => { const dx = w.x - p.x, dy = w.y - p.y, d = Math.hypot(dx, dy) + 1; p.vx += dx / d / d * 5; p.vy += dy / d / d * 5 }); const spd = Math.hypot(p.vx, p.vy); if (spd > 6) { p.vx = p.vx / spd * 6; p.vy = p.vy / spd * 6 } p.x = (p.x + p.vx + W) % W; p.y = (p.y + p.vy + H) % H; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fillStyle = `hsl(${p.hue},80%,60%)`; ctx.fill() });
        wells.forEach(w => { ctx.beginPath(); ctx.arc(w.x, w.y, 8, 0, Math.PI * 2); ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 2; ctx.stroke() });
        requestAnimationFrame(loop)
    })();
})();

// ── 65 Typewriter
(() => {
    const msgs = ["Hello, World!", "Be curious.", "Stay creative.", "Keep building.", "You're amazing!"];
    let mi = 0, ci = 0, typing = true;
    tile(65, "Typewriter", `<div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:100%"><div id="tw-txt" style="font-family:JetBrains Mono,monospace;font-size:0.9rem;min-height:3em;text-align:center;color:#1a1a1a;padding:8px;background:#fffff0;border-radius:8px;width:100%;border:1.5px solid #ddd">_</div><button onclick="window._twRestart&&window._twRestart()" style="background:none;border:1.5px solid var(--border);border-radius:7px;padding:4px 12px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem;color:var(--dim)">RETYPE</button></div>`);
    let twIv = null;
    window._twRestart = () => { clearInterval(twIv); mi = (mi + 1) % msgs.length; ci = 0; typing = true; document.getElementById("tw-txt").textContent = "_"; twIv = setInterval(doType, 80) };
    function doType() { const el = document.getElementById("tw-txt"); if (!el) return; if (typing) { if (ci < msgs[mi].length) { el.textContent = msgs[mi].slice(0, ++ci) + "_"; tone(300 + ci * 5, "square", 0.02, 0.03) } else { typing = false; setTimeout(() => { typing = false; clearInterval(twIv); twIv = setInterval(() => { if (ci > 0) { el.textContent = msgs[mi].slice(0, --ci) + "_" } else { clearInterval(twIv); setTimeout(() => { mi = (mi + 1) % msgs.length; ci = 0; typing = true; twIv = setInterval(doType, 80) }, 500) } }, 40) }, 1200) } } };
    twIv = setInterval(doType, 80);
})();

// ── 66 Color Cycle
(() => {
    let hue = 0, speed = 1, running = true;
    tile(66, "Color Cycle", `<div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:100%"><div id="cc-sq" style="width:80px;height:80px;border-radius:16px;background:hsl(0,80%,55%);box-shadow:0 4px 20px rgba(0,0,0,0.2);cursor:pointer" onclick="window._ccRunning=!window._ccRunning"></div><input type="range" min="1" max="20" value="1" style="width:100%;color:#888" oninput="window._ccSpeed=+this.value"><span style="font-family:JetBrains Mono,monospace;font-size:0.58rem;color:var(--dim)">Click square to pause</span></div>`);
    window._ccSpeed = 1; window._ccRunning = true;
    (function loop() { if (window._ccRunning) { hue = (hue + window._ccSpeed) % 360; const el = document.getElementById("cc-sq"); if (el) el.style.background = `hsl(${hue},80%,55%)` } requestAnimationFrame(loop) })();
})();

// ── 67 Maze Generator
(() => {
    const t = tile(67, "Maze · Click to new", "<canvas id='mz-c' width='220' height='200' style='border-radius:6px;cursor:pointer'></canvas>", "w2 tall");
    const c = document.getElementById("mz-c"), ctx = c.getContext("2d"); const W = 22, H = 20, S = 10;
    function genMaze() {
        const vis = new Uint8Array(W * H), walls = { r: new Uint8Array(W * H), b: new Uint8Array(W * H) }; for (let i = 0; i < W * H; i++) { walls.r[i] = 1; walls.b[i] = 1 }
        const stk = [0]; vis[0] = 1; while (stk.length) { const cur = stk[stk.length - 1], x = cur % W, y = Math.floor(cur / W), nb = []; if (x > 0 && !vis[cur - 1]) nb.push({ n: cur - 1, d: "l" }); if (x < W - 1 && !vis[cur + 1]) nb.push({ n: cur + 1, d: "r" }); if (y > 0 && !vis[cur - W]) nb.push({ n: cur - W, d: "u" }); if (y < H - 1 && !vis[cur + W]) nb.push({ n: cur + W, d: "d" }); if (nb.length) { const { n, d } = nb[Math.floor(Math.random() * nb.length)]; if (d === "r") walls.r[cur] = 0; if (d === "l") walls.r[n] = 0; if (d === "d") walls.b[cur] = 0; if (d === "u") walls.b[n] = 0; vis[n] = 1; stk.push(n) } else stk.pop() }
        ctx.fillStyle = "#f8f8f8"; ctx.fillRect(0, 0, 220, 200); ctx.strokeStyle = "#333"; ctx.lineWidth = 1.5;
        for (let y = 0; y < H; y++)for (let x = 0; x < W; x++) { if (walls.r[y * W + x] && x < W - 1) { ctx.beginPath(); ctx.moveTo((x + 1) * S, (y) * S); ctx.lineTo((x + 1) * S, (y + 1) * S); ctx.stroke() } if (walls.b[y * W + x] && y < H - 1) { ctx.beginPath(); ctx.moveTo(x * S, (y + 1) * S); ctx.lineTo((x + 1) * S, (y + 1) * S); ctx.stroke() } }
        ctx.strokeStyle = "#333"; ctx.strokeRect(0, 0, W * S, H * S)
    }
    genMaze(); c.addEventListener("click", () => { genMaze(); whoosh() });
})();

// ── 68 Rhythm Tap
(() => {
    let taps = [], avg = 0;
    tile(68, "Rhythm Tap", `<div style="display:flex;flex-direction:column;align-items:center;gap:10px"><div id="rt-bpm" style="font-family:JetBrains Mono,monospace;font-size:2rem;font-weight:800;color:#3a86ff">TAP</div><button id="rt-btn" style="width:90px;height:90px;border-radius:50%;background:radial-gradient(at 35% 30%,#4cc9f0,#3a86ff);border:none;cursor:pointer;box-shadow:0 6px 0 #1e40af,0 8px 15px rgba(58,134,255,0.4);font-size:0.65rem;font-family:JetBrains Mono,monospace;color:#fff;letter-spacing:0.1em" onmousedown="this.style.transform='translateY(5px)';this.style.boxShadow='0 1px 0 #1e40af';window._rtTap()" onmouseup="this.style.transform='';this.style.boxShadow=''">TAP</button><div style="font-family:JetBrains Mono,monospace;font-size:0.58rem;color:var(--dim)">Tap to find BPM</div></div>`);
    window._rtTap = () => { const now = Date.now(); nz(0.04, 0.2, 400, 2000); if (taps.length && now - taps[taps.length - 1] > 3000) taps = []; taps.push(now); if (taps.length > 1) { const diffs = taps.slice(1).map((t, i) => t - taps[i]); avg = Math.round(60000 / (diffs.reduce((a, b) => a + b) / diffs.length)); document.getElementById("rt-bpm").textContent = avg + " BPM" } };
})();

// ── 69 Slime Blob
(() => {
    const t = tile(69, "Slime · Click", "<canvas id='sl-c' width='180' height='160' style='cursor:pointer'></canvas>", "w2");
    const c = document.getElementById("sl-c"), ctx = c.getContext("2d"); const pts = 20; let phase = 0, clicked = 0;
    c.addEventListener("click", () => { clicked += 0.8; nz(0.1, 0.15, 100, 500) });
    (function loop() {
        phase += 0.03; clicked *= 0.92; ctx.fillStyle = "rgba(240,240,240,0.3)"; ctx.fillRect(0, 0, 180, 160);
        ctx.beginPath(); for (let i = 0; i <= pts; i++) { const a = i / pts * Math.PI * 2, r = 55 + Math.sin(a * 3 + phase) * 10 + Math.sin(a * 5 - phase * 1.3) * 7 + clicked * 8; ctx.lineTo(90 + Math.cos(a) * r, 80 + Math.sin(a) * r * (0.8 + clicked * 0.1)) } ctx.closePath();
        const g = ctx.createRadialGradient(82, 72, 5, 90, 80, 65); g.addColorStop(0, "rgba(100,255,150,0.9)"); g.addColorStop(1, "rgba(0,180,80,0.7)"); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = "rgba(0,120,50,0.4)"; ctx.lineWidth = 2; ctx.stroke();
        requestAnimationFrame(loop)
    })();
})();

// ── 70 Wave Synthesizer
(() => {
    const t = tile(70, "Wave Synth", "<canvas id='ws-c' width='220' height='100' style='border-radius:8px;background:#0a0a1a'></canvas><div style='display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;justify-content:center'><button onclick=\"window._wsType='sine'\" style='background:#3a86ff;color:#fff;border:none;border-radius:5px;padding:3px 8px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.55rem'>SINE</button><button onclick=\"window._wsType='square'\" style='background:#e63946;color:#fff;border:none;border-radius:5px;padding:3px 8px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.55rem'>SQR</button><button onclick=\"window._wsType='sawtooth'\" style='background:#06d6a0;color:#fff;border:none;border-radius:5px;padding:3px 8px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.55rem'>SAW</button><button onclick=\"window._wsType='triangle'\" style='background:#f9c74f;color:#111;border:none;border-radius:5px;padding:3px 8px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.55rem'>TRI</button></div><input type='range' min='0.5' max='8' step='0.1' value='1' style='width:100%;margin-top:4px;color:#3a86ff' oninput='window._wsFreq=+this.value'>", "w2");
    const c = document.getElementById("ws-c"), ctx = c.getContext("2d"); window._wsType = "sine"; window._wsFreq = 1; let wt = 0;
    (function loop() { wt += 0.05; ctx.fillStyle = "rgba(10,10,26,0.3)"; ctx.fillRect(0, 0, 220, 100); ctx.beginPath(); ctx.strokeStyle = "#4cc9f0"; ctx.lineWidth = 2; for (let x = 0; x < 220; x++) { const phase = x / 220 * Math.PI * 2 * window._wsFreq * 4 + wt; let y; const t = window._wsType; if (t === "sine") y = Math.sin(phase); else if (t === "square") y = Math.sign(Math.sin(phase)); else if (t === "sawtooth") y = ((phase % (Math.PI * 2)) / Math.PI) - 1; else y = Math.abs(((phase % (Math.PI * 2)) / Math.PI) - 1) * 2 - 1; ctx.lineTo(x, 50 + y * 40) }; ctx.stroke(); requestAnimationFrame(loop) })();
})();
