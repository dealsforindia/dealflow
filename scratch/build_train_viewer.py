import base64

with open(r'e:\Rudranildocs0066543\html-yt\train_locomotive.glb', 'rb') as f:
    b64_train = base64.b64encode(f.read()).decode('utf-8')

template = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Indian Railways WDG4G Locomotive - 3D Clean Inspector</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      overflow: hidden;
      background: radial-gradient(circle at 50% 30%, #1e293b 0%, #030712 100%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      color: #f8fafc;
      width: 100vw;
      height: 100vh;
    }
    #canvas-container { width: 100%; height: 100%; position: absolute; inset: 0; }
    #hud {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(250, 204, 21, 0.35);
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
      background: rgba(250, 204, 21, 0.2);
      color: #facc15;
      border: 1px solid rgba(250, 204, 21, 0.4);
      margin-bottom: 6px;
    }
    h1 {
      margin: 0 0 6px 0;
      font-size: 15px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #facc15;
    }
    .metric { font-size: 12px; color: #94a3b8; margin: 3px 0; }
    .metric span { color: #38bdf8; font-weight: 600; }
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
      background: #ca8a04;
      color: white;
      border-color: #facc15;
    }
  </style>
</head>
<body>
  <div id="canvas-container"></div>
  <div id="hud">
    <div class="badge">Heavy Haul Diesel Locomotive</div>
    <h1>Indian Railways WDG4G (3D)</h1>
    <div class="metric">Configuration: <span>Co-Co (6 Axles, Dual Bogies)</span></div>
    <div class="metric">Dimensions: <span>18.0m Length × 3.4m Width × 4.7m Height</span></div>
    <div class="metric">Mesh Structure: <span>Dual Cabs + Power Hood + Underbelly Fuel Tank</span></div>
    <div class="metric">Left-click: Rotate | Right-click: Pan | Scroll: Zoom</div>
  </div>

  <div id="controls">
    <button onclick="toggleWireframe()">Toggle Wireframe</button>
    <button onclick="toggleAutoRotate()">Auto-Rotate</button>
    <button onclick="setCamera('side')">Side Profile</button>
    <button onclick="setCamera('front')">Front Cab</button>
    <button onclick="setCamera('iso')">Isometric</button>
  </div>

  <script>
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(22, 12, 22);

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
    controls.target.set(0, 2, 0);

    // Studio Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const key = new THREE.DirectionalLight(0xfacc15, 2.0);
    key.position.set(20, 30, 20);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fill.position.set(-20, 10, -20);
    scene.add(fill);

    // Railway Track Floor
    const grid = new THREE.GridHelper(50, 50, 0xfacc15, 0x334155);
    scene.add(grid);

    // Rails
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 45), railMat);
    railL.position.set(1.4, 0.1, 0);
    scene.add(railL);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 45), railMat);
    railR.position.set(-1.4, 0.1, 0);
    scene.add(railR);

    // Base64 Embedded Train GLB
    const b64 = "data:application/octet-stream;base64,%%B64_TRAIN%%";
    let trainMesh = null;
    const trainMat = new THREE.MeshStandardMaterial({
      color: 0xca8a04, // Indian Railways WDG4G Yellow/Orange
      metalness: 0.7,
      roughness: 0.35,
      wireframe: false
    });

    const loader = new THREE.GLTFLoader();
    loader.load(b64, (gltf) => {
      trainMesh = gltf.scene;
      trainMesh.traverse((child) => {
        if (child.isMesh) child.material = trainMat;
      });
      scene.add(trainMesh);
    });

    function toggleWireframe() {
      trainMat.wireframe = !trainMat.wireframe;
    }
    function toggleAutoRotate() {
      controls.autoRotate = !controls.autoRotate;
    }
    function setCamera(mode) {
      controls.autoRotate = false;
      if (mode === 'side') {
        camera.position.set(26, 4, 0);
      } else if (mode === 'front') {
        camera.position.set(0, 5, 24);
      } else if (mode === 'iso') {
        camera.position.set(22, 12, 22);
      }
      controls.target.set(0, 2, 0);
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

final_html = template.replace("%%B64_TRAIN%%", b64_train)
with open(r'e:\Rudranildocs0066543\html-yt\train_viewer.html', 'w', encoding='utf-8') as f:
    f.write(final_html)
print('Successfully generated e:\\Rudranildocs0066543\\html-yt\\train_viewer.html!')

