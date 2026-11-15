// ── 71 Game of Life
(() => {
    const t = tile(71, "Game of Life", "<canvas id='gol-c' width='220' height='180' style='border-radius:8px;background:#0a0a0a;cursor:pointer'></canvas><div style='display:flex;gap:6px;margin-top:6px'><button onclick=\"window._golRun=!window._golRun;this.textContent=window._golRun?'PAUSE':'PLAY'\" style='background:#22c55e;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem'>PAUSE</button><button onclick='window._golInit()' style='background:none;border:1.5px solid var(--border);border-radius:6px;padding:4px 10px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem;color:var(--dim)'>RESET</button></div>", "w2", "background:#0a0a0a");
    const c = document.getElementById("gol-c"), ctx = c.getContext("2d"); const W = 44, H = 36, S = 5;
    let grid = new Uint8Array(W * H); window._golRun = true;
    window._golInit = () => { for (let i = 0; i < W * H; i++)grid[i] = Math.random() < 0.3 ? 1 : 0 };
    window._golInit();
    c.addEventListener("click", e => { const r = c.getBoundingClientRect(); const x = Math.floor((e.clientX - r.left) / S), y = Math.floor((e.clientY - r.top) / S); if (x < W && y < H) { grid[y * W + x] = grid[y * W + x] ? 0 : 1 } });
    let frame = 0;
    (function loop() {
        if (window._golRun && frame++ % 6 === 0) { const n = new Uint8Array(W * H); for (let y = 0; y < H; y++)for (let x = 0; x < W; x++) { let nb = 0; for (let dy = -1; dy <= 1; dy++)for (let dx = -1; dx <= 1; dx++) { if (dx === 0 && dy === 0) continue; const nx = (x + dx + W) % W, ny = (y + dy + H) % H; nb += grid[ny * W + nx] } const i = y * W + x; n[i] = grid[i] ? nb === 2 || nb === 3 ? 1 : 0 : nb === 3 ? 1 : 0 } grid = n }
        ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, 220, 180);
        for (let y = 0; y < H; y++)for (let x = 0; x < W; x++) { if (grid[y * W + x]) { ctx.fillStyle = `hsl(${(x + y) * 5 % 360},70%,55%)`; ctx.fillRect(x * S, y * S, S - 1, S - 1) } }
        requestAnimationFrame(loop)
    })();
})();

// ── 72 Spirograph
(() => {
    const t = tile(72, "Spirograph · Click", "<canvas id='sp-c' width='200' height='200' style='border-radius:50%;cursor:pointer;background:#fff'></canvas>");
    const c = document.getElementById("sp-c"), ctx = c.getContext("2d"); let spt = 0, R = 80, r2 = 30, d = 50, hue = 0, spDrawing = true;
    function newSpiro() { R = 40 + Math.random() * 50; r2 = 10 + Math.random() * 35; d = 10 + Math.random() * 50; hue = Math.random() * 360; spt = 0; spDrawing = true; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 200, 200); whoosh() }
    newSpiro(); c.addEventListener("click", newSpiro);
    (function loop() { if (spDrawing && spt < Math.PI * 2 * 60) { for (let i = 0; i < 5; i++) { const x = 100 + (R - r2) * Math.cos(spt) + (d) * Math.cos((R - r2) * spt / r2); const y = 100 + (R - r2) * Math.sin(spt) - (d) * Math.sin((R - r2) * spt / r2); spt === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); ctx.strokeStyle = `hsla(${hue},80%,50%,0.6)`; ctx.lineWidth = 1; ctx.stroke(); spt += 0.05 } }; requestAnimationFrame(loop) })();
})();

// ── 73 Reaction Diffusion
(() => {
    const t = tile(73, "Reaction-Diffusion", "<canvas id='rd-c' width='120' height='120' style='border-radius:8px;cursor:pointer;image-rendering:pixelated'></canvas><div style='font-family:JetBrains Mono,monospace;font-size:0.55rem;color:var(--dim);margin-top:4px'>Click to seed</div>");
    const c = document.getElementById("rd-c"), ctx = c.getContext("2d"); const W = 60, H = 60;
    let A = new Float32Array(W * H).fill(1), B = new Float32Array(W * H);
    const seed = () => { for (let i = 25; i < 35; i++)for (let j = 25; j < 35; j++)B[i * W + j] = 1 };
    seed(); c.addEventListener("click", () => { A.fill(1); B.fill(0); seed() });
    const img = ctx.createImageData(W, H);
    let rdFrame = 0;
    (function loop() {
        if (rdFrame++ % 2 === 0) {
            const na = new Float32Array(W * H), nb = new Float32Array(W * H); for (let y = 1; y < H - 1; y++)for (let x = 1; x < W - 1; x++) { const i = y * W + x; const la = (A[i - W] + A[i + W] + A[i - 1] + A[i + 1] - 4 * A[i]); const lb = (B[i - W] + B[i + W] + B[i - 1] + B[i + 1] - 4 * B[i]); const abb = A[i] * B[i] * B[i]; na[i] = A[i] + 0.1 * la - abb + 0.035 * (1 - A[i]); nb[i] = B[i] + 0.05 * lb + abb - (0.035 + 0.065) * B[i]; na[i] = Math.max(0, Math.min(1, na[i])); nb[i] = Math.max(0, Math.min(1, nb[i])) } A = na; B = nb;
            for (let i = 0; i < W * H; i++) { const v = Math.floor((A[i] - B[i] + 1) * 127); img.data[i * 4] = v; img.data[i * 4 + 1] = Math.floor(v * 0.7); img.data[i * 4 + 2] = 255 - v; img.data[i * 4 + 3] = 255 }
            ctx.putImageData(img, 0, 0)
        } requestAnimationFrame(loop)
    })();
})();

// ── 74 Compass
(() => {
    tile(74, "Digital Compass", `<div style="display:flex;flex-direction:column;align-items:center;gap:8px"><canvas id="comp-c" width="140" height="140" style="cursor:pointer"></canvas><div id="comp-deg" style="font-family:JetBrains Mono,monospace;font-size:0.9rem;font-weight:700">0°N</div></div>`);
    const c = document.getElementById("comp-c"), ctx = c.getContext("2d"); let cAng = 0, cTarget = 0;
    c.addEventListener("click", e => { const r = c.getBoundingClientRect(); cTarget = Math.atan2(e.clientY - r.top - 70, e.clientX - r.left - 70); tone(440, "sine", 0.1, 0.08) });
    (function loop() {
        cAng += (cTarget - cAng) * 0.08; ctx.clearRect(0, 0, 140, 140); ctx.save(); ctx.translate(70, 70);
        const g = ctx.createRadialGradient(0, 0, 30, 0, 0, 60); g.addColorStop(0, "#f8f8f8"); g.addColorStop(1, "#e0e0e0"); ctx.beginPath(); ctx.arc(0, 0, 62, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = "#ccc"; ctx.lineWidth = 2; ctx.stroke();
        for (let i = 0; i < 36; i++) { ctx.save(); ctx.rotate(i * Math.PI / 18); ctx.fillStyle = i % 9 === 0 ? "#333" : "#aaa"; ctx.font = `${i % 9 === 0 ? "bold 8px" : "6px"} JetBrains Mono`; ctx.fillRect(-0.5, 48, 1, i % 9 === 0 ? 10 : 6); ctx.restore() }
        const dirs = ["N", "E", "S", "W"]; dirs.forEach((d, i) => { ctx.save(); ctx.rotate(i * Math.PI / 2); ctx.fillStyle = i === 0 ? "#e63946" : "#333"; ctx.font = "bold 10px JetBrains Mono"; ctx.textAlign = "center"; ctx.fillText(d, -Math.sin(i * Math.PI / 2) * 42, Math.cos(i * Math.PI / 2) * 42 + 4); ctx.restore() });
        ctx.rotate(cAng); ctx.beginPath(); ctx.moveTo(0, -52); ctx.lineTo(5, 0); ctx.lineTo(-5, 0); ctx.closePath(); ctx.fillStyle = "#e63946"; ctx.fill(); ctx.beginPath(); ctx.moveTo(0, 52); ctx.lineTo(5, 0); ctx.lineTo(-5, 0); ctx.closePath(); ctx.fillStyle = "#555"; ctx.fill();
        ctx.restore(); const deg = Math.round(((cAng * 180 / Math.PI) % 360 + 360) % 360); const dirs2 = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]; document.getElementById("comp-deg").textContent = deg + "° " + dirs2[Math.round(deg / 45) % 8];
        requestAnimationFrame(loop)
    })();
})();

// ── 75 Bubble Pop Counter
(() => {
    let tot = 0;
    const t = tile(75, "Pop Counter", "<div style='display:flex;flex-direction:column;align-items:center;gap:10px'><div id='pop-cnt' style='font-family:JetBrains Mono,monospace;font-size:3rem;font-weight:800;color:#3a86ff;transition:transform 0.1s'>0</div><div id='pop-grid' style='display:grid;grid-template-columns:repeat(5,1fr);gap:5px'></div><button onclick='window._refillPops()' style='background:none;border:1.5px solid var(--border);border-radius:7px;padding:4px 10px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem;color:var(--dim)'>REFILL</button></div>", "w2");
    window._refillPops = () => { const g = document.getElementById("pop-grid"); g.innerHTML = ""; for (let i = 0; i < 25; i++) { const b = document.createElement("div"); b.style.cssText = "width:32px;height:32px;border-radius:50%;background:radial-gradient(at 35% 35%,rgba(200,230,255,0.9),rgba(100,180,255,0.7));border:1.5px solid rgba(100,180,255,0.5);cursor:pointer;transition:all 0.1s;box-shadow:inset -2px -2px 4px rgba(0,0,80,0.1)"; b.addEventListener("click", () => { if (!b._popped) { b._popped = true; b.style.background = "rgba(200,200,200,0.15)"; b.style.boxShadow = "none"; b.style.transform = "scale(0.8)"; tot++; const el = document.getElementById("pop-cnt"); el.textContent = tot; el.style.transform = "scale(1.3)"; setTimeout(() => el.style.transform = "", 150); pop() } }); g.appendChild(b) } };
    window._refillPops();
})();

// ── 76 Neon Clock
(() => {
    const t = tile(76, "Neon Clock", "<canvas id='clk-c' width='160' height='160' style='border-radius:50%;background:#0a0a0a'></canvas>", "", "background:#0a0a0a");
    const c = document.getElementById("clk-c"), ctx = c.getContext("2d");
    (function loop() {
        const now = new Date(); const s = now.getSeconds() + now.getMilliseconds() / 1000, m = now.getMinutes() + s / 60, h = now.getHours() % 12 + m / 60;
        ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, 160, 160); ctx.save(); ctx.translate(80, 80);
        ctx.strokeStyle = "rgba(0,255,200,0.15)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 12; i++) { ctx.save(); ctx.rotate(i * Math.PI / 6); ctx.strokeStyle = `rgba(0,255,200,${i % 3 === 0 ? 0.8 : 0.3})`; ctx.lineWidth = i % 3 === 0 ? 2 : 1; ctx.beginPath(); ctx.moveTo(0, -65); ctx.lineTo(0, -58); ctx.stroke(); ctx.restore() }
        const hands = [{ a: h / 12 * Math.PI * 2, l: 40, w: 3, col: "rgba(255,100,100,0.9)" }, { a: m / 60 * Math.PI * 2, l: 55, w: 2, col: "rgba(100,200,255,0.9)" }, { a: s / 60 * Math.PI * 2, l: 65, w: 1, col: "rgba(0,255,200,0.9)" }];
        hands.forEach(({ a, l, w, col }) => { ctx.save(); ctx.rotate(a - Math.PI / 2); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.shadowColor = col; ctx.shadowBlur = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(l, 0); ctx.stroke(); ctx.restore() });
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill(); ctx.restore(); requestAnimationFrame(loop)
    })();
})();

// ── 77 Sonar Ping
(() => {
    const t = tile(77, "Sonar", "<canvas id='son-c' width='180' height='180' style='border-radius:50%;background:#050a05;cursor:pointer'></canvas>", "", "background:#050a05");
    const c = document.getElementById("son-c"), ctx = c.getContext("2d"); const pings = [], blips = [];
    for (let i = 0; i < 5; i++)blips.push({ a: Math.random() * Math.PI * 2, r: 20 + Math.random() * 70 });
    c.addEventListener("click", () => { pings.push({ r: 0, a: 0 }); nz(0.05, 0.08, 200, 600) });
    let scanA = 0;
    (function loop() {
        scanA += 0.02; ctx.fillStyle = "rgba(5,10,5,0.15)"; ctx.fillRect(0, 0, 180, 180); ctx.save(); ctx.translate(90, 90);
        [30, 50, 70, 85].forEach(r => { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.strokeStyle = "rgba(0,255,80,0.1)"; ctx.lineWidth = 1; ctx.stroke() });
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 85, scanA - 0.2, scanA); ctx.fillStyle = "rgba(0,255,80,0.15)"; ctx.fill();
        ctx.strokeStyle = "rgba(0,255,80,0.6)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(scanA) * 85, Math.sin(scanA) * 85); ctx.stroke();
        blips.forEach(b => { const bx = Math.cos(b.a) * b.r, by = Math.sin(b.a) * b.r; const angDiff = ((b.a - scanA) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2); const fade = 1 - angDiff / (Math.PI * 2); ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2); ctx.fillStyle = `rgba(0,255,80,${fade * 0.8})`; ctx.fill() });
        ctx.restore(); requestAnimationFrame(loop)
    })();
})();

// ── 78 Magnetism
(() => {
    const t = tile(78, "Magnetic Field · Move", "<canvas id='mag-c' width='220' height='180' style='border-radius:10px;background:#030308;cursor:crosshair'></canvas>", "w2", "background:#030308");
    const c = document.getElementById("mag-c"), ctx = c.getContext("2d"); let mx = 110, my = 90;
    c.addEventListener("mousemove", e => { const r = c.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top });
    (function loop() {
        ctx.fillStyle = "#030308"; ctx.fillRect(0, 0, 220, 180);
        for (let y = 10; y < 180; y += 20)for (let x = 10; x < 220; x += 20) { const dx = mx - x, dy = my - y, d = Math.hypot(dx, dy) + 1; const ang = Math.atan2(dy, dx); const str = Math.min(1, 800 / d / d); ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.strokeStyle = `rgba(255,${Math.floor(100 + str * 155)},50,${0.3 + str * 0.7})`; ctx.lineWidth = 1 + str; ctx.beginPath(); ctx.moveTo(-8 * str, 0); ctx.lineTo(8 * str, 0); ctx.moveTo(5 * str, -3 * str); ctx.lineTo(8 * str, 0); ctx.lineTo(5 * str, 3 * str); ctx.stroke(); ctx.restore() }
        ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,180,50,0.9)"; ctx.fill(); ctx.strokeStyle = "rgba(255,180,50,0.4)"; ctx.lineWidth = 8; ctx.stroke();
        requestAnimationFrame(loop)
    })();
})();

// ── 79 Pulse Heart
(() => {
    let bpm2 = 60;
    tile(79, "Heartbeat", `<div style="display:flex;flex-direction:column;align-items:center;gap:10px"><canvas id="hb-c" width="200" height="80" style="background:#0a0004;border-radius:8px"></canvas><div style="display:flex;align-items:center;gap:10px"><div id="hb-em" style="font-size:2.5rem">❤️</div><div id="hb-bpm" style="font-family:JetBrains Mono,monospace;font-size:1.2rem;font-weight:700;color:#e63946">60 BPM</div></div><input type="range" min="40" max="200" value="60" style="width:100%;color:#e63946" oninput="window._hbBpm=+this.value;document.getElementById('hb-bpm').textContent=this.value+' BPM'"></div>`, "w2");
    const c = document.getElementById("hb-c"), ctx = c.getContext("2d"); window._hbBpm = 60;
    const wave = new Float32Array(200); let hbt = 0, hbpos = 0;
    (function loop() {
        hbt += 0.016; const period = 60 / window._hbBpm; const phase = (hbt % period) / period; let v = 0; if (phase < 0.04) v = phase / 0.04; else if (phase < 0.08) v = 1 - (phase - 0.04) / 0.04; else if (phase < 0.12) v = -(phase - 0.08) / 0.04 * 0.3; else if (phase < 0.16) v = -0.3 + (phase - 0.12) / 0.04 * 1.6; else if (phase < 0.22) v = 1.3 - (phase - 0.16) / 0.06 * 1.6; else v = -(0.3 * (1 - (phase - 0.22) / 0.1)); wave[Math.floor(hbt % (200 / 60 * window._hbBpm * 200) % 200)] = v;
        ctx.fillStyle = "rgba(10,0,4,0.3)"; ctx.fillRect(0, 0, 200, 80); ctx.beginPath(); ctx.strokeStyle = "#e63946"; ctx.lineWidth = 2; for (let i = 0; i < 200; i++) { const idx = (hbpos + i) % 200; const y = 40 - wave[idx] * 35; i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y) } ctx.stroke(); hbpos = (hbpos + 1) % 200; wave[hbpos] = v;
        const em = document.getElementById("hb-em"); const beat = phase < 0.25; em.style.transform = beat ? "scale(1.2)" : "scale(1)";
        requestAnimationFrame(loop)
    })();
})();

// ── 80 Color Sorter
(() => {
    const cols = ["#e63946", "#ff6b6b", "#f9c74f", "#06d6a0", "#4cc9f0", "#3a86ff", "#8b5cf6", "#f72585"];
    function shuffle(a) { return [...a].sort(() => Math.random() - 0.5) }
    let items = shuffle(cols), sorted = false;
    const t = tile(80, "Color Sort", "<div id='cs-row' style='display:flex;gap:5px;margin-bottom:8px'></div><button id='cs-sort' style='background:#1a1a1a;color:#fff;border:none;border-radius:8px;padding:6px 16px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.65rem;letter-spacing:0.1em'>SORT</button>", "w2");
    function render() { const row = document.getElementById("cs-row"); if (!row) return; row.innerHTML = ""; items.forEach((c, i) => { const d = document.createElement("div"); d.style.cssText = `width:28px;height:55px;border-radius:6px;background:${c};flex:1;cursor:grab;transition:transform 0.3s,height 0.4s;box-shadow:0 2px 8px rgba(0,0,0,0.15)`; row.appendChild(d) }) }
    render();
    document.getElementById("cs-sort").addEventListener("click", () => { if (!sorted) { const sorted2 = [...items].sort((a, b) => { const ha = parseInt(a.slice(1), 16), hb = parseInt(b.slice(1), 16); return ha - hb }); items = sorted2; sorted = true } else { items = shuffle(cols); sorted = false } render(); tone(sorted ? 880 : 440, "sine", 0.2, 0.1) });
})();
