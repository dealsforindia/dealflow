// ============================================================================
// AURA SMART MIRROR - ULTIMATE END-TO-END ENGINE WITH 5 HIGH-VALUE ADDONS
// ============================================================================

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const statusText = document.getElementById('status');
const dropZone = document.getElementById('drop-zone');

const w = 1280;
const h = 720;

// --- 1. THREE.JS SCENE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(0, w, 0, h, 0.1, 2000);
camera.position.z = 500;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(w, h);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('three-container').appendChild(renderer.domElement);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(300, -300, 400);
scene.add(dirLight);

const pointLight = new THREE.PointLight(0x38bdf8, 1.5, 800);
pointLight.position.set(w / 2, h / 2, 200);
scene.add(pointLight);

// --- 2. GARMENT CATALOG & ASSET DATA ---
const fabricCatalog = [
    { name: 'Blue Cotton', color: '#3b82f6', type: 'cotton', r: 0.9, m: 0.05 },
    { name: 'Black Denim', color: '#1e293b', type: 'denim', r: 1.0, m: 0.1 },
    { name: 'Crimson Silk', color: '#be123c', type: 'silk', r: 0.3, m: 0.2, clearcoat: 0.5 },
    { name: 'Emerald Fleece', color: '#10b981', type: 'cotton', r: 0.95, m: 0.0 }
];

const catalogData = [
    { id: 'tee-01', name: 'Oversized Heavyweight Tee', price: '$45', emoji: '👕', fabricIdx: 0, fitBaseCm: 44 },
    { id: 'jacket-01', name: 'Urban Tech Shell Jacket', price: '$120', emoji: '🧥', fabricIdx: 1, fitBaseCm: 48 },
    { id: 'silk-01', name: 'Crimson Silk Button-Up', price: '$85', emoji: '👔', fabricIdx: 2, fitBaseCm: 42 },
    { id: 'hoodie-01', name: 'Minimalist Fleece Hoodie', price: '$75', emoji: '🥼', fabricIdx: 3, fitBaseCm: 46 }
];

let activeCatalogIdx = 0;
let activeSize = 'M';
let activeSizeScale = 1.0;
let customGLBModel = null;

// Toggles & Modes
let drawSkeleton = true;
let enableMatting = true;
let enableHeatmap = false;
let enableAccessories = false;
let enableVoice = false;

// --- 3. FABRIC TEXTURE GENERATOR ---
function createFabricTexture(baseColor, type) {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);
    
    const imgData = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < imgData.data.length; i += 4) {
        const noise = (Math.random() - 0.5) * (type === 'denim' ? 50 : 20);
        imgData.data[i] = Math.max(0, Math.min(255, imgData.data[i] + noise));
        imgData.data[i+1] = Math.max(0, Math.min(255, imgData.data[i+1] + noise));
        imgData.data[i+2] = Math.max(0, Math.min(255, imgData.data[i+2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    ctx.fillStyle = (type === 'silk') ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)';
    for (let i = 0; i < size; i += (type === 'denim' ? 6 : 4)) ctx.fillRect(i, 0, 1, size);
    for (let j = 0; j < size; j += (type === 'denim' ? 6 : 4)) ctx.fillRect(0, j, size, 1);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
}

// PBR Material setup
const currentFabric = fabricCatalog[catalogData[0].fabricIdx];
const garmentMat = new THREE.MeshPhysicalMaterial({ 
    map: createFabricTexture(currentFabric.color, currentFabric.type),
    roughness: currentFabric.r,
    metalness: currentFabric.m,
    transparent: true, 
    opacity: 0.95 
});

// --- ADDON 1: PARAMETRIC 3D GARMENT HIERARCHY ---
const garmentGroup = new THREE.Group();
scene.add(garmentGroup);

// Torso mesh (Box + Collar Ring)
const torsoGeom = new THREE.BoxGeometry(1, 1, 30);
const torsoMesh = new THREE.Mesh(torsoGeom, garmentMat);
garmentGroup.add(torsoMesh);

// Collar Ring Accent
const collarGeom = new THREE.TorusGeometry(0.35, 0.08, 16, 32);
const collarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
const collarMesh = new THREE.Mesh(collarGeom, collarMat);
collarMesh.position.set(0, 0.5, 15);
torsoMesh.add(collarMesh);

// Articulated Sleeves
const sleeveGeom = new THREE.CylinderGeometry(0.5, 0.4, 1, 16);
sleeveGeom.translate(0, -0.5, 0);

const leftSleevePivot = new THREE.Group();
const leftSleeveMesh = new THREE.Mesh(sleeveGeom, garmentMat);
leftSleevePivot.add(leftSleeveMesh);
garmentGroup.add(leftSleevePivot);

const rightSleevePivot = new THREE.Group();
const rightSleeveMesh = new THREE.Mesh(sleeveGeom, garmentMat);
rightSleevePivot.add(rightSleeveMesh);
garmentGroup.add(rightSleevePivot);

garmentGroup.visible = false;

// --- ADDON 4: VIRTUAL AR ACCESSORIES LAYER ---
const accessoriesGroup = new THREE.Group();
scene.add(accessoriesGroup);

// 3D Sunglasses Mesh
const glassesGroup = new THREE.Group();
const frameMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.2, metalness: 0.8 });
const lensMat = new THREE.MeshPhysicalMaterial({ color: 0x111111, roughness: 0.1, transmission: 0.6, transparent: true, opacity: 0.8 });

const frameGeom = new THREE.BoxGeometry(60, 20, 5);
const frameMesh = new THREE.Mesh(frameGeom, frameMat);
const lensLeft = new THREE.Mesh(new THREE.BoxGeometry(25, 16, 2), lensMat);
const lensRight = new THREE.Mesh(new THREE.BoxGeometry(25, 16, 2), lensMat);
lensLeft.position.set(-14, 0, 2);
lensRight.position.set(14, 0, 2);
glassesGroup.add(frameMesh, lensLeft, lensRight);
accessoriesGroup.add(glassesGroup);

// 3D Smartwatch Mesh
const watchGroup = new THREE.Group();
const watchBody = new THREE.Mesh(new THREE.BoxGeometry(16, 20, 6), frameMat);
const watchStrap = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 8, 16), new THREE.MeshStandardMaterial({ color: 0x334155 }));
watchGroup.add(watchBody, watchStrap);
accessoriesGroup.add(watchGroup);

accessoriesGroup.visible = false;

// --- 5. PERFORMANCE DIAGNOSTICS & STATE ---
let frameCount = 0;
let lastTime = performance.now();

// --- 6. BODY MEASUREMENT & FIT HEATMAP ENGINE ---
function updateBodyMetrics(ls_pt, rs_pt, lh_pt, rh_pt, landmarks) {
    const shoulderPx = Math.sqrt(Math.pow(ls_pt.x - rs_pt.x, 2) + Math.pow(ls_pt.y - rs_pt.y, 2));
    const scaleCm = 42.0 / (shoulderPx || 1);
    
    const estShoulders = Math.round(shoulderPx * scaleCm);
    const torsoPx = Math.sqrt(Math.pow(((ls_pt.x+rs_pt.x)/2) - ((lh_pt.x+rh_pt.x)/2), 2) + 
                             Math.pow(((ls_pt.y+rs_pt.y)/2) - ((lh_pt.y+rh_pt.y)/2), 2));
    const estTorso = Math.round(torsoPx * scaleCm);
    const estChest = Math.round(estShoulders * 2.2);
    const estHeight = Math.round(estTorso * 2.8 + 85);

    document.getElementById('val-height').innerText = `${estHeight} cm`;
    document.getElementById('val-shoulders').innerText = `${estShoulders} cm`;
    document.getElementById('val-chest').innerText = `${estChest} cm`;

    let recSize = 'M';
    if (estShoulders < 38) recSize = 'S';
    else if (estShoulders > 45) recSize = 'XL';
    else if (estShoulders > 42) recSize = 'L';
    document.getElementById('val-rec-size').innerText = recSize;

    const activeItem = catalogData[activeCatalogIdx];
    const targetFitCm = activeItem.fitBaseCm * activeSizeScale;
    const fitDelta = targetFitCm - estShoulders;

    const fitBar = document.getElementById('fit-bar');
    const fitStatus = document.getElementById('fit-status-text');

    // --- ADDON 2: HEATMAP COLOR CALCULATION ---
    if (enableHeatmap) {
        if (fitDelta < -2) {
            garmentMat.color.setHex(0xef4444); // Red: High Tension
        } else if (fitDelta > 4) {
            garmentMat.color.setHex(0x3b82f6); // Blue: Loose / Drape
        } else {
            garmentMat.color.setHex(0x22c55e); // Green: Ideal Fit
        }
    } else {
        garmentMat.color.setStyle(fabricCatalog[activeItem.fabricIdx].color);
    }

    if (fitDelta < -2) {
        fitBar.style.width = '20%';
        fitStatus.innerText = enableHeatmap ? 'Heatmap: High Tension (Red)' : 'Tight / Snug';
        fitStatus.style.color = '#ef4444';
    } else if (fitDelta > 4) {
        fitBar.style.width = '85%';
        fitStatus.innerText = enableHeatmap ? 'Heatmap: Loose Drape (Blue)' : 'Oversized / Loose';
        fitStatus.style.color = '#38bdf8';
    } else {
        fitBar.style.width = '50%';
        fitStatus.innerText = enableHeatmap ? 'Heatmap: Perfect Fit (Green)' : 'Regular / Tailored';
        fitStatus.style.color = '#4ade80';
    }
}

// --- 7. MEDIAPIPE POSE CALLBACK LOOP ---
function onResults(results) {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
        document.getElementById('fps-counter').innerText = `${Math.round((frameCount * 1000) / (now - lastTime))} FPS`;
        frameCount = 0;
        lastTime = now;
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, w, h);
    
    // Background Matting
    if (results.segmentationMask && enableMatting) {
        canvasCtx.globalCompositeOperation = 'source-over';
        canvasCtx.drawImage(results.segmentationMask, 0, 0, w, h);
        
        canvasCtx.globalCompositeOperation = 'source-in';
        canvasCtx.drawImage(results.image, 0, 0, w, h);
        
        canvasCtx.globalCompositeOperation = 'destination-atop';
        const grad = canvasCtx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#020617');
        canvasCtx.fillStyle = grad;
        canvasCtx.fillRect(0, 0, w, h);
    } else {
        canvasCtx.globalCompositeOperation = 'source-over';
        canvasCtx.drawImage(results.image, 0, 0, w, h);
    }

    canvasCtx.globalCompositeOperation = 'source-over';

    if (results.poseLandmarks) {
        statusText.style.display = 'none';
        garmentGroup.visible = true;
        accessoriesGroup.visible = enableAccessories;

        if (drawSkeleton) {
            drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: 'rgba(255, 255, 255, 0.4)', lineWidth: 1.5});
            drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#38bdf8', lineWidth: 1, radius: 3});
        }

        const ls = results.poseLandmarks[11];
        const rs = results.poseLandmarks[12];
        const lh = results.poseLandmarks[23];
        const rh = results.poseLandmarks[24];
        const le = results.poseLandmarks[13] || ls;
        const re = results.poseLandmarks[14] || rs;
        const nose = results.poseLandmarks[0];
        const leftWrist = results.poseLandmarks[15];

        const avgVis = (ls.visibility + rs.visibility + lh.visibility + rh.visibility) / 4;
        
        if (avgVis > 0.4) {
            const ls_pt = { x: ls.x * w, y: ls.y * h };
            const rs_pt = { x: rs.x * w, y: rs.y * h };
            const lh_pt = { x: lh.x * w, y: lh.y * h };
            const rh_pt = { x: rh.x * w, y: rh.y * h };
            const le_pt = { x: le.x * w, y: le.y * h };
            const re_pt = { x: re.x * w, y: re.y * h };

            updateBodyMetrics(ls_pt, rs_pt, lh_pt, rh_pt, results.poseLandmarks);

            const centerX = (ls_pt.x + rs_pt.x + lh_pt.x + rh_pt.x) / 4;
            const centerY = (ls_pt.y + rs_pt.y + lh_pt.y + rh_pt.y) / 4;
            
            const shoulderWidth = Math.sqrt(Math.pow(ls_pt.x - rs_pt.x, 2) + Math.pow(ls_pt.y - rs_pt.y, 2));
            const torsoHeight = Math.sqrt(Math.pow(((ls_pt.x+rs_pt.x)/2) - ((lh_pt.x+rh_pt.x)/2), 2) + 
                                          Math.pow(((ls_pt.y+rs_pt.y)/2) - ((lh_pt.y+rh_pt.y)/2), 2));

            if (customGLBModel) {
                customGLBModel.position.set(centerX, centerY, 0);
                customGLBModel.scale.set(shoulderWidth * 0.05 * activeSizeScale, torsoHeight * 0.05 * activeSizeScale, 1);
                customGLBModel.rotation.z = Math.atan2(rs_pt.y - ls_pt.y, rs_pt.x - ls_pt.x);
            } else {
                torsoMesh.position.set(centerX, centerY, 0);
                torsoMesh.scale.set(shoulderWidth * 1.4 * activeSizeScale, torsoHeight * 1.2 * activeSizeScale, 1);
                torsoMesh.rotation.z = Math.atan2(rs_pt.y - ls_pt.y, rs_pt.x - ls_pt.x);

                leftSleevePivot.position.set(ls_pt.x, ls_pt.y, 0);
                const leftArmLength = Math.max(0.1, Math.sqrt(Math.pow(le_pt.x - ls_pt.x, 2) + Math.pow(le_pt.y - ls_pt.y, 2)));
                leftSleeveMesh.scale.set(shoulderWidth * 0.4 * activeSizeScale, leftArmLength, 1);
                leftSleevePivot.rotation.z = Math.atan2(le_pt.y - ls_pt.y, le_pt.x - ls_pt.x) - Math.PI / 2;

                rightSleevePivot.position.set(rs_pt.x, rs_pt.y, 0);
                const rightArmLength = Math.max(0.1, Math.sqrt(Math.pow(re_pt.x - rs_pt.x, 2) + Math.pow(re_pt.y - rs_pt.y, 2)));
                rightSleeveMesh.scale.set(shoulderWidth * 0.4 * activeSizeScale, rightArmLength, 1);
                rightSleevePivot.rotation.z = Math.atan2(re_pt.y - rs_pt.y, re_pt.x - rs_pt.x) - Math.PI / 2;
            }

            // POSITION AR ACCESSORIES
            if (enableAccessories) {
                if (nose) {
                    glassesGroup.position.set(nose.x * w, nose.y * h, 10);
                    glassesGroup.scale.set(shoulderWidth * 0.008, shoulderWidth * 0.008, 1);
                    glassesGroup.rotation.z = Math.atan2(rs_pt.y - ls_pt.y, rs_pt.x - ls_pt.x);
                }
                if (leftWrist) {
                    watchGroup.position.set(leftWrist.x * w, leftWrist.y * h, 5);
                    watchGroup.scale.set(shoulderWidth * 0.005, shoulderWidth * 0.005, 1);
                }
            }
        } else {
            garmentGroup.visible = false;
            accessoriesGroup.visible = false;
        }
    } else {
        statusText.style.display = 'block';
        statusText.innerText = "Searching for person in view...";
        garmentGroup.visible = false;
        accessoriesGroup.visible = false;
    }
    
    canvasCtx.restore();
    renderer.render(scene, camera);
}

// --- 8. MEDIAPIPE INITIALIZATION ---
const pose = new Pose({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`});
pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
pose.onResults(onResults);

const cameraFeed = new Camera(videoElement, {
  onFrame: async () => { await pose.send({image: videoElement}); },
  width: w,
  height: h
});

cameraFeed.start().catch(err => {
    statusText.innerText = "Error accessing camera. Please allow permissions.";
    console.error(err);
});

// --- 9. UI & CATALOG CONTROLLERS ---
function renderCatalogUI() {
    const container = document.getElementById('catalog-container');
    container.innerHTML = '';
    
    catalogData.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = `catalog-item ${idx === activeCatalogIdx ? 'active' : ''}`;
        div.innerHTML = `
            <div class="catalog-thumb">${item.emoji}</div>
            <div class="catalog-info">
                <span class="catalog-title">${item.name}</span>
                <span class="catalog-price">${item.price}</span>
            </div>
        `;
        div.addEventListener('click', () => selectCatalogItem(idx));
        container.appendChild(div);
    });

    renderFabricSwatches();
}

function selectCatalogItem(idx) {
    activeCatalogIdx = idx;
    const item = catalogData[idx];
    
    document.getElementById('active-garment-name').innerText = item.name;
    
    if (customGLBModel) {
        scene.remove(customGLBModel);
        customGLBModel = null;
        garmentGroup.visible = true;
    }

    const fabric = fabricCatalog[item.fabricIdx];
    garmentMat.map = createFabricTexture(fabric.color, fabric.type);
    garmentMat.roughness = fabric.r;
    garmentMat.metalness = fabric.m;
    garmentMat.clearcoat = fabric.clearcoat || 0.0;
    garmentMat.needsUpdate = true;

    renderCatalogUI();
}

function renderFabricSwatches() {
    const container = document.getElementById('fabric-swatch-container');
    container.innerHTML = '<span class="bar-label">Fabric:</span>';
    
    fabricCatalog.forEach((fab, idx) => {
        const btn = document.createElement('button');
        btn.className = `swatch-btn ${idx === catalogData[activeCatalogIdx].fabricIdx ? 'active' : ''}`;
        btn.style.backgroundColor = fab.color;
        btn.title = fab.name;
        btn.addEventListener('click', () => {
            catalogData[activeCatalogIdx].fabricIdx = idx;
            selectCatalogItem(activeCatalogIdx);
        });
        container.appendChild(btn);
    });
}

// Size Selection Handlers
document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeSize = e.target.dataset.size;
        
        if (activeSize === 'S') activeSizeScale = 0.88;
        else if (activeSize === 'M') activeSizeScale = 1.0;
        else if (activeSize === 'L') activeSizeScale = 1.12;
        else if (activeSize === 'XL') activeSizeScale = 1.25;
    });
});

// Navigation Bar Controls
document.getElementById('btn-toggle-landmarks').addEventListener('click', () => {
    drawSkeleton = !drawSkeleton;
});

document.getElementById('btn-toggle-env').addEventListener('click', () => {
    enableMatting = !enableMatting;
});

document.getElementById('btn-toggle-heatmap').addEventListener('click', (e) => {
    enableHeatmap = !enableHeatmap;
    e.currentTarget.classList.toggle('active', enableHeatmap);
});

document.getElementById('btn-toggle-accessories').addEventListener('click', (e) => {
    enableAccessories = !enableAccessories;
    e.currentTarget.classList.toggle('active', enableAccessories);
});

// --- ADDON 3: HANDS-FREE VOICE CONTROL ENGINE ---
const btnVoice = document.getElementById('btn-toggle-voice');
const voiceToast = document.getElementById('voice-toast');
const voiceText = document.getElementById('voice-text');

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        voiceText.innerText = `Heard: "${transcript}"`;
        
        if (transcript.includes('photo') || transcript.includes('snapshot') || transcript.includes('cheese')) {
            document.getElementById('btn-snapshot').click();
        } else if (transcript.includes('next') || transcript.includes('change garment')) {
            selectCatalogItem((activeCatalogIdx + 1) % catalogData.length);
        } else if (transcript.includes('previous')) {
            selectCatalogItem((activeCatalogIdx - 1 + catalogData.length) % catalogData.length);
        } else if (transcript.includes('small')) {
            document.querySelector('.size-btn[data-size="S"]').click();
        } else if (transcript.includes('medium')) {
            document.querySelector('.size-btn[data-size="M"]').click();
        } else if (transcript.includes('large') && !transcript.includes('extra')) {
            document.querySelector('.size-btn[data-size="L"]').click();
        } else if (transcript.includes('extra large') || transcript.includes('xl')) {
            document.querySelector('.size-btn[data-size="XL"]').click();
        } else if (transcript.includes('heatmap') || transcript.includes('stress')) {
            document.getElementById('btn-toggle-heatmap').click();
        } else if (transcript.includes('background') || transcript.includes('matting')) {
            document.getElementById('btn-toggle-env').click();
        } else if (transcript.includes('glasses') || transcript.includes('accessories')) {
            document.getElementById('btn-toggle-accessories').click();
        }
    };

    recognition.onerror = () => { enableVoice = false; btnVoice.classList.remove('mic-active'); voiceToast.classList.add('hidden'); };
    recognition.onend = () => { if (enableVoice) recognition.start(); };

    btnVoice.addEventListener('click', () => {
        enableVoice = !enableVoice;
        if (enableVoice) {
            recognition.start();
            btnVoice.classList.add('mic-active');
            voiceToast.classList.remove('hidden');
        } else {
            recognition.stop();
            btnVoice.classList.remove('mic-active');
            voiceToast.classList.add('hidden');
        }
    });
} else {
    btnVoice.style.display = 'none'; // Speech recognition not supported
}

// --- ADDON 5: SNAPSHOT & QR CODE MOBILE HANDOFF ---
document.getElementById('btn-snapshot').addEventListener('click', () => {
    const overlay = document.getElementById('countdown-overlay');
    const num = document.getElementById('countdown-number');
    overlay.classList.remove('hidden');
    
    let count = 3;
    num.innerText = count;
    
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            num.innerText = count;
        } else {
            clearInterval(interval);
            overlay.classList.add('hidden');
            captureSnapshot();
        }
    }, 1000);
});

function captureSnapshot() {
    const offscreen = document.createElement('canvas');
    offscreen.width = w;
    offscreen.height = h;
    const ctx = offscreen.getContext('2d');

    ctx.drawImage(canvasElement, 0, 0, w, h);
    ctx.drawImage(renderer.domElement, 0, 0, w, h);

    ctx.font = 'bold 24px -apple-system, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('AURA SMART MIRROR', 40, h - 40);

    const dataUrl = offscreen.toDataURL('image/png');
    document.getElementById('snapshot-img').src = dataUrl;
    document.getElementById('btn-download-img').href = dataUrl;

    // Generate Dynamic QR Code for Mobile Save
    const shareUrl = encodeURIComponent(window.location.href);
    document.getElementById('qr-code-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${shareUrl}`;

    document.getElementById('snapshot-modal').classList.remove('hidden');
}

document.getElementById('btn-close-modal').addEventListener('click', () => {
    document.getElementById('snapshot-modal').classList.add('hidden');
});

document.getElementById('btn-share-img').addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Mirror session link copied to clipboard!");
});

// --- GLB DRAG AND DROP LOADER ---
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            const contents = evt.target.result;
            const loader = new THREE.GLTFLoader();
            loader.parse(contents, '', (gltf) => {
                if (customGLBModel) scene.remove(customGLBModel);
                
                customGLBModel = gltf.scene;
                scene.add(customGLBModel);
                garmentGroup.visible = false;
                
                document.getElementById('active-garment-name').innerText = `Custom 3D: ${file.name}`;
            });
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert("Please drop a valid .GLB or .GLTF 3D model file.");
    }
});

// Initialize UI
renderCatalogUI();
