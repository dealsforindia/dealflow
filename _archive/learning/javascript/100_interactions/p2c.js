// ── 81 Word Scramble
(() => {
    const words = ["JAVASCRIPT", "INTERACTION", "CANVAS", "PHYSICS", "ANIMATION", "CREATIVE", "SATISFYING"];
    let wi = 0, word = "", guessed = "";
    function nextWord() { word = words[wi++ % words.length]; guessed = ""; document.getElementById("ws-display").textContent = [...word].sort(() => Math.random() - 0.5).join(" "); document.getElementById("ws-input").value = ""; document.getElementById("ws-msg").textContent = "" }
    tile(81, "Word Scramble", `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:100%"><div id="ws-display" style="font-family:JetBrains Mono,monospace;font-size:1rem;font-weight:700;letter-spacing:0.2em;color:#3a86ff;min-height:2em;text-align:center"></div><input id="ws-input" type="text" style="width:100%;background:#f0f0f0;border:1.5px solid #ddd;border-radius:8px;padding:6px;font-family:JetBrains Mono,monospace;font-size:0.8rem;text-align:center;text-transform:uppercase" placeholder="your guess..." oninput="const v=this.value.toUpperCase();if(v===document.getElementById('ws-word').dataset.word){bell(880);document.getElementById('ws-msg').textContent='✓ Correct!';document.getElementById('ws-msg').style.color='#22c55e';setTimeout(()=>window._wsNext&&window._wsNext(),800)}"><span id="ws-word" data-word=""></span><div id="ws-msg" style="font-family:JetBrains Mono,monospace;font-size:0.7rem;color:var(--dim)"></div><button onclick="window._wsNext&&window._wsNext()" style="background:none;border:1.5px solid var(--border);border-radius:7px;padding:4px 12px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem;color:var(--dim)">SKIP</button></div>`, "w2");
    window._wsNext = () => { const w = words[Math.floor(Math.random() * words.length)]; document.getElementById("ws-word").dataset.word = w; document.getElementById("ws-display").textContent = [...w].sort(() => Math.random() - 0.5).join(" "); document.getElementById("ws-input").value = ""; document.getElementById("ws-msg").textContent = "" };
    window._wsNext();
})();

// ── 82 Neon Toggle Grid
(() => {
    const t = tile(82, "Neon Grid · Click cells", "<div id='ntg' style='display:grid;grid-template-columns:repeat(6,1fr);gap:4px'></div>", "w2", "background:#0a0a0a");
    const g = document.getElementById("ntg");
    const hues = [0, 30, 60, 120, 180, 240, 270, 300];
    for (let i = 0; i < 36; i++) { const d = document.createElement("div"); const h = hues[i % hues.length]; d.style.cssText = `height:28px;border-radius:4px;background:#1a1a1a;cursor:pointer;transition:all 0.2s;border:1px solid #222`; d.addEventListener("click", () => { const on = !d._on; d._on = on; d.style.background = on ? `hsl(${h},100%,55%)` : "#1a1a1a"; d.style.boxShadow = on ? `0 0 10px hsl(${h},100%,55%),inset 0 0 8px hsla(${h},100%,55%,0.3)` : "none"; d.style.borderColor = on ? `hsl(${h},100%,40%)` : "#222"; tone(200 + h * 3, "sine", 0.08, 0.05) }); g.appendChild(d) }
})();

// ── 83 Rainfall Meter
(() => {
    let level = 0;
    tile(83, "Rain Gauge", `<div style="display:flex;align-items:center;gap:12px"><div style="width:30px;height:120px;border:2px solid #aaa;border-radius:4px;background:#e8f4ff;position:relative;overflow:hidden"><div id="rg-fill" style="position:absolute;bottom:0;width:100%;background:linear-gradient(to top,#3a86ff,#4cc9f0);transition:height 0.5s;height:0"></div></div><div style="display:flex;flex-direction:column;gap:8px"><div id="rg-val" style="font-family:JetBrains Mono,monospace;font-size:1.1rem;font-weight:700;color:#3a86ff">0mm</div><button onclick="const v=Math.min(100,(window._rgLevel||0)+Math.random()*15+5);window._rgLevel=v;document.getElementById('rg-fill').style.height=v+'%';document.getElementById('rg-val').textContent=Math.round(v/10*2.5)+'mm';nz(0.05,0.12,200,800)" style="background:#3a86ff;color:#fff;border:none;border-radius:7px;padding:5px 10px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem">RAIN ☔</button><button onclick="window._rgLevel=0;document.getElementById('rg-fill').style.height='0';document.getElementById('rg-val').textContent='0mm'" style="background:none;border:1.5px solid var(--border);border-radius:7px;padding:5px 8px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem;color:var(--dim)">RESET</button></div></div>`); window._rgLevel = 0;
})();

// ── 84 String Art
(() => {
    const t = tile(84, "String Art · Click", "<canvas id='sa-c' width='180' height='180' style='border-radius:8px;cursor:pointer;background:#111'></canvas>");
    const c = document.getElementById("sa-c"), ctx = c.getContext("2d"); const N = 36; let pts = Array.from({ length: N }, (_, i) => { const a = i / N * Math.PI * 2; return { x: 90 + 85 * Math.cos(a), y: 90 + 85 * Math.sin(a) } }); let step = 0, hue = 0;
    function drawString() { ctx.fillStyle = "#111"; ctx.fillRect(0, 0, 180, 180); ctx.strokeStyle = `hsla(${hue},80%,60%,0.3)`; ctx.lineWidth = 0.5; for (let i = 0; i < N; i++)for (let j = i + 1; j < N; j++) { if ((i * j) % 13 === step % 13) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke() } } ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i < N; i++) { const p = pts[i]; i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y) } ctx.closePath(); ctx.stroke() }
    c.addEventListener("click", () => { step = (step + 1) % 13; hue = (hue + 30) % 360; drawString(); tone(220 + step * 40, "sine", 0.1, 0.08) }); drawString();
})();

// ── 85 Bubble Sort Visualizer
(() => {
    let arr = Array.from({ length: 16 }, (_, i) => i + 1).sort(() => Math.random() - 0.5), sorting = false;
    const t = tile(85, "Bubble Sort", "<canvas id='bsv-c' width='220' height='100' style='border-radius:8px;background:#f8f8f8'></canvas><button id='bsv-btn' onclick='window._bsvStart()' style='margin-top:6px;background:#1a1a1a;color:#fff;border:none;border-radius:7px;padding:5px 14px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem'>SORT</button>", "w2");
    function drawArr(hi = -1, hj = -1) { const c = document.getElementById("bsv-c"), ctx = c.getContext("2d"); ctx.fillStyle = "#f8f8f8"; ctx.fillRect(0, 0, 220, 100); const w = 220 / arr.length; arr.forEach((v, i) => { ctx.fillStyle = i === hi ? "#e63946" : i === hj ? "#3a86ff" : `hsl(${v * 20},70%,55%)`; ctx.fillRect(i * w + 1, 100 - v * 6, w - 2, v * 6) }) }
    window._bsvStart = async () => { if (sorting) return; sorting = true; const btn = document.getElementById("bsv-btn"); btn.textContent = "SORTING..."; for (let i = 0; i < arr.length; i++) { for (let j = 0; j < arr.length - i - 1; j++) { drawArr(j, j + 1); await new Promise(r => setTimeout(r, 40)); if (arr[j] > arr[j + 1]) { [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; nz(0.02, 0.06, 300 + j * 20, 600 + j * 20) } } } drawArr(); sorting = false; btn.textContent = "SHUFFLE & SORT"; arr = arr.sort(() => Math.random() - 0.5); bell(880) }; drawArr();
})();

// ── 86 Morse Code
(() => {
    const morse = { "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.", "G": "--.", "H": "....", "I": "..", "J": ".---", "K": "-.-", "L": ".-..", "M": "--", "N": "-.", "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.", "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-", "Y": "-.--", "Z": "--.." };
    tile(86, "Morse Code", `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:100%"><input id="mc-in" type="text" maxlength="8" style="width:100%;background:#0a0a0a;color:#0f0;border:1px solid #0a3;border-radius:6px;padding:6px;font-family:JetBrains Mono,monospace;font-size:0.9rem;text-align:center;text-transform:uppercase" placeholder="TYPE A WORD" oninput="const v=this.value.toUpperCase();document.getElementById('mc-out').textContent=[...v].map(c=>window._morse[c]||' ').join('  ')"><div id="mc-out" style="font-family:JetBrains Mono,monospace;font-size:0.9rem;color:#0f0;min-height:2em;word-break:break-all;text-align:center"></div><button onclick="window._mcPlay&&window._mcPlay()" style="background:#0a3;color:#0f0;border:none;border-radius:6px;padding:5px 14px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem">TRANSMIT</button></div>`, "w2", "background:#0a0a0a");
    window._morse = morse;
    window._mcPlay = async () => { const txt = document.getElementById("mc-in").value.toUpperCase(); let t = 0; for (const ch of txt) { const code = morse[ch] || ""; for (const sym of code) { await new Promise(r => setTimeout(r, t)); tone(600, "square", sym === "." ? 0.1 : 0.3, 0.15); t += sym === "." ? 200 : 400 } t += 200 } };
})();

// ── 87 Pixel Stamp
(() => {
    const t = tile(87, "Pixel Art", `<canvas id="px-c" width="160" height="160" style="border-radius:4px;cursor:crosshair;image-rendering:pixelated;border:1px solid #ddd"></canvas><div style="display:flex;gap:5px;margin-top:6px;flex-wrap:wrap;justify-content:center">${["#e63946", "#f9c74f", "#22c55e", "#3a86ff", "#8b5cf6", "#000", "#fff"].map(c => `<div style="width:20px;height:20px;border-radius:4px;background:${c};cursor:pointer;border:2px solid rgba(0,0,0,0.15)" onclick="window._pxCol='${c}'"></div>`).join("")}<button onclick="const c=document.getElementById('px-c');c.getContext('2d').fillStyle='#fff';c.getContext('2d').fillRect(0,0,160,160)" style="background:none;border:1px solid var(--border);border-radius:4px;padding:2px 6px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.55rem;color:var(--dim)">CLR</button></div>`, "w2");
    const c = document.getElementById("px-c"), ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 160, 160);
    const S = 10; window._pxCol = "#000"; let pxDrawing = false;
    c.addEventListener("mousedown", () => pxDrawing = true); c.addEventListener("mouseup", () => pxDrawing = false); c.addEventListener("mouseleave", () => pxDrawing = false);
    c.addEventListener("mousemove", e => { if (!pxDrawing) return; const r = c.getBoundingClientRect(); const x = Math.floor((e.clientX - r.left) / r.width * 16) * S, y = Math.floor((e.clientY - r.top) / r.height * 16) * S; ctx.fillStyle = window._pxCol; ctx.fillRect(x, y, S, S) });
    c.addEventListener("click", e => { const r = c.getBoundingClientRect(); const x = Math.floor((e.clientX - r.left) / r.width * 16) * S, y = Math.floor((e.clientY - r.top) / r.height * 16) * S; ctx.fillStyle = window._pxCol; ctx.fillRect(x, y, S, S); tone(300 + x * 5, "sine", 0.03, 0.03) });
})();

// ── 88 Confetti Burst
(() => {
    const t = tile(88, "Confetti! · Click", "<canvas id='cf-c' width='220' height='180' style='border-radius:10px;cursor:pointer'></canvas>", "w2");
    const c = document.getElementById("cf-c"), ctx = c.getContext("2d"); const parts2 = [];
    c.addEventListener("click", e => { const r = c.getBoundingClientRect(); const cx2 = e.clientX - r.left, cy2 = e.clientY - r.top; for (let i = 0; i < 80; i++)parts2.push({ x: cx2, y: cy2, vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.5) * 12 - 5, rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.3, w: 4 + Math.random() * 8, h: 4 + Math.random() * 4, hue: Math.random() * 360, life: 80 + Math.random() * 40 }); nz(0.1, 0.2, 200, 3000) });
    (function loop() { ctx.fillStyle = "rgba(240,236,228,0.3)"; ctx.fillRect(0, 0, 220, 180); for (let i = parts2.length - 1; i >= 0; i--) { const p = parts2[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.rot += p.rotV; p.life--; if (p.life <= 0) { parts2.splice(i, 1); continue } ctx.save(); ctx.globalAlpha = p.life / 120; ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = `hsl(${p.hue},90%,55%)`; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore() } requestAnimationFrame(loop) })();
})();

// ── 89 Sound Spectrum
(() => {
    const t = tile(89, "Sound Spectrum · Click", "<canvas id='spec-c' width='220' height='140' style='border-radius:8px;background:#0a0a0a;cursor:pointer'></canvas>", "w2", "background:#0a0a0a");
    const c = document.getElementById("spec-c"), ctx = c.getContext("2d"); let analyser = null, dataArr = null;
    c.addEventListener("click", async () => { if (analyser) return; try { const ac = getAC(), dest = ac.createMediaStreamDestination(); analyser = ac.createAnalyser(); analyser.fftSize = 128; dataArr = new Uint8Array(analyser.frequencyBinCount); const osc = ac.createOscillator(); osc.type = "sine"; osc.frequency.value = 440; osc.connect(analyser); analyser.connect(ac.destination); osc.start(); setTimeout(() => osc.stop(), 2000) } catch (e) { } });
    (function loop() { ctx.fillStyle = "rgba(10,10,10,0.3)"; ctx.fillRect(0, 0, 220, 140); if (analyser && dataArr) { analyser.getByteFrequencyData(dataArr); const bw = 220 / dataArr.length; dataArr.forEach((v, i) => { const h = v / 255 * 120; ctx.fillStyle = `hsl(${i * 4},90%,55%)`; ctx.fillRect(i * bw, 140 - h, bw - 1, h) }) } else { ctx.font = "11px JetBrains Mono"; ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.textAlign = "center"; ctx.fillText("Click for spectrum", 110, 75) } requestAnimationFrame(loop) })();
})();

// ── 90 Gravity Bounce
(() => {
    const t = tile(90, "Gravity · Drag", "<canvas id='gb-c' width='220' height='200' style='border-radius:10px;background:#f0ece4;cursor:ns-resize'></canvas>", "w2 tall");
    const c = document.getElementById("gb-c"), ctx = c.getContext("2d"); let gy = 0.5, ball2 = { x: 110, y: 50, vx: 3, vy: 0, r: 18 };
    c.addEventListener("mousemove", e => { const r = c.getBoundingClientRect(); gy = 0.1 + ((e.clientY - r.top) / 200) * 1.5 });
    (function loop() {
        ball2.vy += gy; ball2.x += ball2.vx; ball2.y += ball2.vy; if (ball2.x < ball2.r) { ball2.x = ball2.r; ball2.vx = Math.abs(ball2.vx) * 0.85 } if (ball2.x > 220 - ball2.r) { ball2.x = 220 - ball2.r; ball2.vx = -Math.abs(ball2.vx) * 0.85 } if (ball2.y > 200 - ball2.r) { ball2.y = 200 - ball2.r; ball2.vy = -Math.abs(ball2.vy) * 0.75; if (Math.abs(ball2.vy) > 2) nz(0.02, 0.06, 200, 500) } if (ball2.y < ball2.r) { ball2.y = ball2.r; ball2.vy = Math.abs(ball2.vy) }
        ctx.fillStyle = "#f0ece4"; ctx.fillRect(0, 0, 220, 200); const shade = ctx.createRadialGradient(ball2.x - 5, ball2.y - 5, 3, ball2.x, ball2.y, ball2.r); shade.addColorStop(0, "#ff9f1c"); shade.addColorStop(1, "#e85d04"); ctx.beginPath(); ctx.arc(ball2.x, ball2.y, ball2.r, 0, Math.PI * 2); ctx.fillStyle = shade; ctx.fill(); ctx.font = "10px JetBrains Mono"; ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.textAlign = "center"; ctx.fillText(`g=${gy.toFixed(1)}`, 110, 16); requestAnimationFrame(loop)
    })();
})();

// ── 91 ASCII Art Generator
(() => {
    const chars = " .:-=+*#@";
    tile(91, "ASCII Camera", "<div style='text-align:center'><canvas id='asc-cv' width='48' height='40' style='display:none'></canvas><pre id='asc-out' style='font-family:JetBrains Mono,monospace;font-size:6px;line-height:1.1;color:#333;background:#f8f8f8;border-radius:6px;padding:4px;max-width:100%;overflow:auto;margin:0'>(Click to enable camera)</pre><button onclick='window._ascStart&&window._ascStart()' style='margin-top:6px;background:#1a1a1a;color:#fff;border:none;border-radius:6px;padding:4px 12px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem'>📷 START</button></div>`);
  window._ascStart = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 48, height: 40 } }); const vid = document.createElement("video"); vid.srcObject = stream; vid.play(); const cv = document.getElementById("asc-cv"), ctx = cv.getContext("2d"); const out = document.getElementById("asc-out"); (function fr() { ctx.drawImage(vid, 0, 0, 48, 40); const d = ctx.getImageData(0, 0, 48, 40).data; let txt = ""; for (let y = 0; y < 40; y++) { for (let x = 0; x < 48; x++) { const i = (y * 48 + x) * 4; const v = Math.floor((d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255 * (chars.length - 1)); txt += chars[chars.length - 1 - v] } txt += "\n" } out.textContent = txt; requestAnimationFrame(fr) })() } catch (e) { document.getElementById("asc-out").textContent = "Camera not available" } };
})();

// ── 92 Ripple Text
(() => {
    tile(92, "Ripple Text", `<div id="rt-wrap" style="font-family:Syne,sans-serif;font-size:1.8rem;font-weight:800;display:flex;gap:1px;justify-content:center;flex-wrap:wrap;cursor:default" onmousemove="window._rtWave&&window._rtWave(event,this)">RIPPLE!</div>`);
    const letters = [...'RIPPLE!'];
    const wrap = document.getElementById("rt-wrap"); wrap.innerHTML = '';
    letters.forEach((l, i) => { const s = document.createElement("span"); s.textContent = l === ' ' ? '\u00a0' : l; s.style.cssText = "display:inline-block;transition:transform 0.2s,color 0.2s;color:#1a1a1a"; wrap.appendChild(s) });
    window._rtWave = (e, el) => { const spans = [...el.querySelectorAll("span")]; const rx = e.offsetX; spans.forEach((s, i) => { const sx = s.offsetLeft + s.offsetWidth / 2; const d = Math.abs(rx - sx); const amp = Math.max(0, 1 - d / 60); s.style.transform = `translateY(${-amp * 20}px)`; s.style.color = `hsl(${(i * 40 + rx) % 360},80%,50%)` }); setTimeout(() => spans.forEach(s => { s.style.transform = ''; s.style.color = '#1a1a1a' }), 300) };
})();

// ── 93 Click Heatmap
(() => {
    const t = tile(93, "Click Heatmap", "<canvas id='hm-c' width='220' height='160' style='border-radius:8px;cursor:crosshair;background:#111'></canvas><button onclick='document.getElementById(\"hm-c\").getContext(\"2d\").fillStyle=\"#111\";document.getElementById(\"hm-c\").getContext(\"2d\").fillRect(0,0,220,160)' style='margin-top:6px;background:none;border:1.5px solid var(--border);border-radius:7px;padding:4px 10px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem;color:var(--dim)'>CLEAR</button>", "w2");
    const c = document.getElementById("hm-c"), ctx = c.getContext("2d");
    c.addEventListener("click", e => { const r = c.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top; const g = ctx.createRadialGradient(x, y, 0, x, y, 30); g.addColorStop(0, "rgba(255,30,0,0.6)"); g.addColorStop(0.4, "rgba(255,200,0,0.3)"); g.addColorStop(1, "transparent"); ctx.fillStyle = g; ctx.fillRect(x - 30, y - 30, 60, 60); nz(0.02, 0.06, 400, 800) });
})();

// ── 94 Spinning Galaxy
(() => {
    const t = tile(94, "Galaxy", "<canvas id='gx-c' width='220' height='200' style='border-radius:50%;background:#000;cursor:pointer'></canvas>", "w2", "background:#000");
    const c = document.getElementById("gx-c"), ctx = c.getContext("2d"); const stars2 = Array.from({ length: 200 }, (_, i) => { const a = i / 200 * Math.PI * 4 + Math.random() * 0.3; const r = 15 + i * 0.5 + Math.random() * 10; return { a, r, spd: 0.003 + i * 0.00002, sz: Math.random() * 2 + 0.5, hue: 200 + i * 0.5 } });
    c.addEventListener("click", () => { stars2.forEach(s => s.spd *= 2); setTimeout(() => stars2.forEach(s => s.spd /= 2), 1000); whoosh() });
    (function loop() { ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fillRect(0, 0, 220, 200); const cx = 110, cy = 100; stars2.forEach(s => { s.a += s.spd; const x = cx + Math.cos(s.a) * s.r * Math.cos(s.a * 0.1) * 0.7, y = cy + Math.sin(s.a) * s.r * 0.35; ctx.beginPath(); ctx.arc(x, y, s.sz, 0, Math.PI * 2); ctx.fillStyle = `hsl(${s.hue},80%,70%)`; ctx.fill() }); requestAnimationFrame(loop) })();
})();

// ── 95 Mirror Draw
(() => {
    const t = tile(95, "Mirror Draw", "<canvas id='mir-c' width='220' height='180' style='border-radius:8px;background:#fff;cursor:crosshair'></canvas><div style='display:flex;gap:5px;margin-top:6px;justify-content:center'>${['#e63946','#3a86ff','#22c55e','#f9c74f','#000'].map(c=>`<div style=\"width:20px;height:20px;border-radius:50%;background:${c};cursor:pointer\" onclick=\"window._mirCol='${c}'\"></div>`).join('')}<button onclick=\"const c=document.getElementById('mir-c'),x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,220,180)\" style=\"background:none;border:1px solid var(--border);border-radius:5px;padding:2px 6px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.55rem;color:var(--dim)\">CLR</button></div>", "w2");
    const c = document.getElementById("mir-c"), ctx = c.getContext("2d"); window._mirCol = "#e63946"; let mirDrawing = false;
    c.addEventListener("mousedown", () => mirDrawing = true); c.addEventListener("mouseup", () => mirDrawing = false); c.addEventListener("mouseleave", () => mirDrawing = false);
    c.addEventListener("mousemove", e => { if (!mirDrawing) return; const r = c.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top; ctx.fillStyle = window._mirCol;[[x, y], [220 - x, y], [x, 180 - y], [220 - x, 180 - y]].forEach(([px, py]) => { ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill() }) });
})();

// ── 96 Tug of War
(() => {
    let pos = 50;
    tile(96, "Tug of War", `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:100%"><div style="font-family:JetBrains Mono,monospace;font-size:0.65rem;color:var(--dim)">🔵 <span id="tow-l">0</span> · <span id="tow-r">0</span> 🔴</div><div style="width:100%;height:18px;background:linear-gradient(to right,#3a86ff,#f0f0f0,#e63946);border-radius:9px;position:relative;border:2px solid #ddd"><div id="tow-k" style="position:absolute;top:-5px;width:28px;height:28px;border-radius:50%;background:#fff;border:3px solid #555;box-shadow:0 2px 8px rgba(0,0,0,0.2);transition:left 0.1s;left:calc(50% - 14px)"></div></div><div style="display:flex;gap:10px"><button onclick="window._towPush(-1)" style="background:#3a86ff;color:#fff;border:none;border-radius:10px;padding:8px 18px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.7rem;font-weight:700">◀ PULL</button><button onclick="window._towPush(1)" style="background:#e63946;color:#fff;border:none;border-radius:10px;padding:8px 18px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.7rem;font-weight:700">PULL ▶</button></div><div id="tow-win" style="font-family:JetBrains Mono,monospace;font-size:0.8rem;font-weight:700;min-height:1.2em"></div></div>`, "", 'background:#f8f8ff');
    let ls = 0, rs = 0; window._towPush = dir => { pos = Math.max(5, Math.min(95, pos + dir * 8 + Math.random() * 4 - 2)); document.getElementById("tow-k").style.left = `calc(${pos}% - 14px)`; thud(); if (pos <= 10) { ls++; document.getElementById("tow-l").textContent = ls; document.getElementById("tow-win").textContent = "🔵 Blue wins!"; pos = 50; setTimeout(() => document.getElementById("tow-win").textContent = "", 1500) } else if (pos >= 90) { rs++; document.getElementById("tow-r").textContent = rs; document.getElementById("tow-win").textContent = "🔴 Red wins!"; pos = 50; setTimeout(() => document.getElementById("tow-win").textContent = "", 1500) } };
})();

// ── 97 Particle Trail
(() => {
    const t = tile(97, "Particle Trail · Move", "<canvas id='pt-c' width='220' height='180' style='border-radius:10px;background:#0a0a1a;cursor:none'></canvas>", "w2", "background:#0a0a1a");
    const c = document.getElementById("pt-c"), ctx = c.getContext("2d"); const trail2 = []; let ptHue = 0;
    c.addEventListener("mousemove", e => { const r = c.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top; ptHue = (ptHue + 3) % 360; for (let i = 0; i < 3; i++)trail2.push({ x, y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4 - 1, life: 60 + Math.random() * 40, hue: ptHue, sz: 2 + Math.random() * 4 }) });
    (function loop() { ctx.fillStyle = "rgba(10,10,26,0.2)"; ctx.fillRect(0, 0, 220, 180); for (let i = trail2.length - 1; i >= 0; i--) { const p = trail2[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--; if (p.life <= 0) { trail2.splice(i, 1); continue } ctx.globalAlpha = p.life / 100; ctx.beginPath(); ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2); ctx.fillStyle = `hsl(${p.hue},90%,60%)`; ctx.fill() } ctx.globalAlpha = 1; requestAnimationFrame(loop) })();
})();

// ── 98 Sticker Board
(() => {
    const stickers = ["⭐", "🔥", "💎", "🎯", "🌈", "🦋", "🎪", "🚀", "🌸", "🍕", "🎸", "💫", "🌊", "🎨", "🦄"];
    const t = tile(98, "Sticker Board", "<div id='sb-board' style='width:220px;height:180px;background:#fffff0;border-radius:8px;border:1px solid #eee;position:relative;overflow:hidden;cursor:pointer'></div><div style='display:flex;gap:4px;margin-top:6px;flex-wrap:wrap;justify-content:center'></div>", "w2 tall");
    const board = document.getElementById("sb-board"); let curSticker = stickers[0];
    const toolbar = t.querySelector("div:last-child"); stickers.forEach(s => { const b = document.createElement("span"); b.textContent = s; b.style.cssText = "font-size:1.3rem;cursor:pointer;padding:2px;border-radius:4px;transition:transform 0.1s"; b.addEventListener("click", () => { curSticker = s; tone(440, "sine", 0.05, 0.05) }); toolbar.appendChild(b) });
    board.addEventListener("click", e => { const r = board.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top; const d = document.createElement("div"); d.textContent = curSticker; d.style.cssText = `position:absolute;left:${x - 12}px;top:${y - 12}px;font-size:1.5rem;cursor:move;user-select:none;transform:rotate(${(Math.random() - 0.5) * 30}deg);transition:transform 0.2s`; d.addEventListener("mouseenter", () => d.style.transform = `scale(1.3)`); d.addEventListener("mouseleave", () => d.style.transform = `rotate(${(Math.random() - 0.5) * 30}deg)`); board.appendChild(d); tone(300 + Math.random() * 400, "sine", 0.1, 0.08) });
})();

// ── 99 Speed Clicker
(() => {
    let cnt = 0, timer = null, best = 0;
    tile(99, "Speed Clicker", `<div style="display:flex;flex-direction:column;align-items:center;gap:10px"><div style="display:flex;gap:16px;font-family:JetBrains Mono,monospace;font-size:0.65rem;color:var(--dim)"><span>CLICKS: <span id="sc-cnt">0</span></span><span>TIME: <span id="sc-time">5.0</span>s</span><span>BEST: <span id="sc-best">0</span></span></div><button id="sc-btn" style="width:100px;height:100px;border-radius:50%;background:radial-gradient(at 35% 30%,#7209b7,#560bad);border:none;cursor:pointer;box-shadow:0 8px 0 #3a0078,0 10px 20px rgba(114,9,183,0.4);font-size:0.75rem;font-family:JetBrains Mono,monospace;color:#fff;letter-spacing:0.05em;transition:transform 0.05s" onmousedown="window._scClick()" onmouseup="this.style.transform='';this.style.boxShadow=''">CLICK!</button><div id="sc-bar" style="width:100%;height:6px;background:#f0f0f0;border-radius:3px;overflow:hidden"><div id="sc-prog" style="height:100%;background:linear-gradient(to right,#7209b7,#f72585);width:100%;transition:width 0.1s;border-radius:3px"></div></div></div>`);
    let timeLeft = 5, running = false;
    window._scClick = () => { const btn = document.getElementById("sc-btn"); btn.style.transform = "translateY(6px)"; btn.style.boxShadow = "0 2px 0 #3a0078"; nz(0.02, 0.1, 600, 2000); if (!running) { running = true; cnt = 0; timeLeft = 5; clearInterval(timer); timer = setInterval(() => { timeLeft = Math.max(0, timeLeft - 0.1); document.getElementById("sc-time").textContent = timeLeft.toFixed(1); document.getElementById("sc-prog").style.width = (timeLeft / 5 * 100) + "%"; if (timeLeft <= 0) { clearInterval(timer); running = false; if (cnt > best) { best = cnt; document.getElementById("sc-best").textContent = best; bell(880) } btn.textContent = "DONE " + cnt } }, 100) } cnt++; document.getElementById("sc-cnt").textContent = cnt };
})();

// ── 100 Grand Finale
(() => {
    const t = tile(100, "🎉 Grand Finale", "<canvas id='gf-c' width='220' height='200' style='border-radius:10px;cursor:pointer;background:#050510'></canvas><div style='font-family:JetBrains Mono,monospace;font-size:0.6rem;color:var(--dim);margin-top:4px;text-align:center'>Click for the big finish!</div>", "w2 tall", "background:#050510");
    const c = document.getElementById("gf-c"), ctx = c.getContext("2d"); const allParts = []; let gfActive = false;
    c.addEventListener("click", e => { gfActive = true; const r = c.getBoundingClientRect(); for (let b = 0; b < 5; b++) { setTimeout(() => { const bx = 30 + Math.random() * 160, by = 180; for (let i = 0; i < 60; i++) { const ang = Math.random() * Math.PI * 2, spd = 3 + Math.random() * 8; allParts.push({ x: bx, y: by, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 12, life: 80 + Math.random() * 60, hue: Math.random() * 360, sz: 2 + Math.random() * 4, gravity: 0.15 }); tone(220 + b * 100, "sine", 0.3, 0.12) }; nz(0.15, 0.2, 200, 4000) }, b * 300) } });
    (function loop() { ctx.fillStyle = "rgba(5,5,16,0.2)"; ctx.fillRect(0, 0, 220, 200); for (let i = allParts.length - 1; i >= 0; i--) { const p = allParts[i]; p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.vx *= 0.99; p.life--; if (p.life <= 0) { allParts.splice(i, 1); continue } ctx.globalAlpha = p.life / 140; ctx.beginPath(); ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2); ctx.fillStyle = `hsl(${p.hue},95%,65%)`; ctx.fill() } ctx.globalAlpha = 1; if (!gfActive) { ctx.font = "bold 14px JetBrains Mono"; ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.textAlign = "center"; ctx.fillText("🎉 Click Me! 🎉", 110, 100) } requestAnimationFrame(loop) })();
})();
