import base64
import os

with open(r'e:\Rudranildocs0066543\html-yt\scratch\glb_b64.txt', 'r') as f:
    b64_glb = f.read().strip()

html_template = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Architecture v2: Constraint Drone (Self-Contained)</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      overflow: hidden;
      background: radial-gradient(circle at 50% 40%, #0f172a 0%, #020617 100%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      color: #f8fafc;
      width: 100vw;
      height: 100vh;
    }
    #canvas-container {
      width: 100%;
      height: 100%;
      position: absolute;
      inset: 0;
    }
    #hud {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-radius: 12px;
      padding: 16px 20px;
      box-shadow: 0 16px 30px rgba(0, 0, 0, 0.7);
      pointer-events: none;
      z-index: 10;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      background: rgba(56, 189, 248, 0.2);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.4);
      margin-bottom: 6px;
    }
    h1 {
      margin: 0 0 6px 0;
      font-size: 15px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #38bdf8;
    }
    .metric {
      font-size: 12px;
      color: #94a3b8;
      margin: 3px 0;
    }
    .metric span {
      color: #34d399;
      font-weight: 600;
    }
    #controls {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(14px);
      padding: 8px 16px;
      border-radius: 30px;
      border: 1px solid rgba(148, 163, 184, 0.25);
      z-index: 10;
    }
    button {
      background: #1e293b;
      color: #f1f5f9;
      border: 1px solid #334155;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    button:hover {
      background: #0284c7;
      color: white;
      border-color: #38bdf8;
    }
    #loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 14px;
      color: #38bdf8;
      font-family: monospace;
      letter-spacing: 0.1em;
      pointer-events: none;
      z-index: 5;
    }
  </style>
</head>
<body>
  <div id="canvas-container"></div>
  <div id="loading">INITIALIZING 3D CANVAS & GEOMETRY...</div>

  <div id="hud">
    <div class="badge">Architecture v2 Verifier Stack</div>
    <h1>Relational Constraint Drone</h1>
    <div class="metric">Status: <span id="status-text">Embedding Binary GLB...</span></div>
    <div class="metric">Watertight Topology: <span>TRUE (Euler 42)</span></div>
    <div class="metric">Constraint Solver: <span>Anchored Coincident (0 Drift)</span></div>
    <div class="metric">Bounding Extents: <span>458mm × 282mm × 498mm</span></div>
    <div class="metric">Triangles: <span>1,148</span> | Vertices: <span>616</span></div>
  </div>

  <div id="controls">
    <button onclick="toggleWireframe()">Toggle Wireframe</button>
    <button onclick="toggleAutoRotate()">Auto-Rotate</button>
    <button onclick="setCamera('front')">Front View</button>
    <button onclick="setCamera('top')">Top View</button>
    <button onclick="setCamera('iso')">Isometric</button>
    <button onclick="resetView()">Reset View</button>
  </div>

  <script>
    const container = document.getElementById('canvas-container');
    const loadingElem = document.getElementById('loading');
    const statusText = document.getElementById('status-text');

    const scene = new THREE.Scene();

    // Perspective Camera matching drone scale (drone is ~500mm wide)
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 5000);
    camera.position.set(400, 320, 500);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.target.set(0, -30, 0);

    // Studio Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    keyLight.position.set(500, 800, 400);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc084fc, 1.6);
    fillLight.position.set(-500, 200, -400);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x34d399, 1.2);
    rimLight.position.set(0, -500, 300);
    scene.add(rimLight);

    // Grid Floor
    const grid = new THREE.GridHelper(1000, 25, 0x0284c7, 0x1e293b);
    grid.position.y = -197.5; // Exactly at bottom of landing skids
    scene.add(grid);

    // Base64 Embedded Binary GLB (Completely eliminates fetch/CORS errors)
    const b64GLB = "data:application/octet-stream;base64," + "%%B64_PLACEHOLDER%%";

    let droneMesh = null;
    const droneMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.25,
      wireframe: false
    });

    const loader = new THREE.GLTFLoader();
    loader.load(b64GLB, (gltf) => {
      droneMesh = gltf.scene;
      
      const box = new THREE.Box3().setFromObject(droneMesh);
      const size = box.getSize(new THREE.Vector3());
      
      droneMesh.traverse((child) => {
        if (child.isMesh) {
          child.material = droneMaterial;
          child.geometry.computeVertexNormals();
        }
      });
      
      scene.add(droneMesh);
      loadingElem.style.display = 'none';
      statusText.innerText = 'Rendered OK (' + size.x.toFixed(0) + 'x' + size.y.toFixed(0) + 'x' + size.z.toFixed(0) + 'mm)';
      statusText.style.color = '#38bdf8';
    }, undefined, (err) => {
      console.error('GLTF Load Error:', err);
      loadingElem.innerText = 'LOAD ERROR: ' + err.message;
      loadingElem.style.color = '#ef4444';
      statusText.innerText = 'Failed: ' + err.message;
    });

    function toggleWireframe() {
      droneMaterial.wireframe = !droneMaterial.wireframe;
    }

    function toggleAutoRotate() {
      controls.autoRotate = !controls.autoRotate;
    }

    function resetView() {
      camera.position.set(400, 320, 500);
      controls.target.set(0, -30, 0);
    }

    function setCamera(mode) {
      controls.autoRotate = false;
      if (mode === 'front') {
        camera.position.set(0, 0, 750);
      } else if (mode === 'top') {
        camera.position.set(0, 800, 1);
      } else if (mode === 'iso') {
        camera.position.set(400, 320, 500);
      }
      controls.target.set(0, -30, 0);
    }

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
  </script>
</body>
</html>
"""

final_html = html_template.replace("%%B64_PLACEHOLDER%%", b64_glb)

with open(r'e:\Rudranildocs0066543\html-yt\v2_drone_viewer.html', 'w', encoding='utf-8') as f:
    f.write(final_html)
print('Successfully embedded binary GLB into v2_drone_viewer.html!')

