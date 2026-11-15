# AURA Smart Mirror - Real-Time AI Virtual Fitting Platform

A complete, production-grade web application for an **AI-powered Virtual Fitting Room / Smart Mirror system**. Built with real-time computer vision, WebGL 3D rendering, and luxury dark glassmorphism UI.

---

## Complete Feature Matrix & Addons

### 1. Computer Vision & Segmentation Engine
- **MediaPipe Pose Tracking:** Extracts 33 3D body keypoints in real time (30–60 FPS) directly in the browser via WebAssembly (no GPU required).
- **Background Matting (Selfie Segmentation):** Isolates the subject from their physical background and composites them over a modern slate-gradient fitting room environment.

### 2. Body Metrics & Sizing Recommendation System
- **Real-Time Body Calibration:** Computes estimated height, shoulder width (cm), and chest circumference continuously from normalized landmark vectors.
- **AI Size Predictor:** Recommends the optimal garment size (S, M, L, XL) based on estimated body proportions.
- **Fit Analysis Bar:** Displays real-time fit feedback (`Tight/Snug`, `Regular/Tailored`, `Oversized/Loose`) by measuring delta between selected garment size vs user's shoulder width.

### 3. 3D Articulated Garment Pipeline & Heatmap Shader
- **Articulated Mesh Rigging:** Features dynamic torso (with collar geometry) and sleeve positioning that pivots naturally with left/right shoulder & elbow movements.
- **Tension/Stress Fit Heatmap Mode (Addon 2):** Toggle the Flame icon to activate visual stress heatmaps:
  - 🟦 **Blue:** Loose / Drape (> 4cm clearance)
  - 🟩 **Green:** Ideal Fit (0–3cm clearance)
  - 🟥 **Red:** High Tension / Tight fit (< -2cm clearance)
- **Programmatic PBR Fabric Generation:** Synthesizes realistic noise textures (Cotton, Denim, Silk) using HTML5 canvas.
- **Drag & Drop .GLB / .GLTF Support:** Drop any standard 3D `.glb` or `.gltf` garment file onto the screen to try it on live.

### 4. Hands-Free Voice Assistant Engine (Addon 3)
- Click the **Microphone Icon** to activate voice commands via Web Speech API. Standing 2 meters away from the kiosk, users can speak:
  - `"Take photo"` / `"Snapshot"` / `"Cheese"` — Triggers 3-second countdown snapshot
  - `"Next garment"` / `"Change garment"` / `"Previous"` — Cycles catalog
  - `"Size Large"` / `"Size Medium"` / `"Size Small"` / `"Size Extra Large"` — Changes sizing
  - `"Heatmap"` — Toggles stress fit heatmap mode
  - `"Background"` — Toggles background matting
  - `"Glasses"` / `"Accessories"` — Toggles 3D AR accessories

### 5. Virtual AR Accessories Overlay Layer (Addon 4)
- Click the **Glasses Icon** to toggle 3D AR accessories:
  - 3D Metallic Sunglasses tracking Nose (#0) & Eye (#2/#5) landmarks.
  - 3D Smartwatch tracking Left Wrist (#15) position.

### 6. Mobile Handoff & QR Code Generator (Addon 5)
- **3-Second Photo Countdown:** Takes virtual fitting snapshots with watermarking.
- **Dynamic QR Code:** Generates a real-time QR code on the modal so kiosk users can scan with their mobile camera to save the photo directly to their phone.

---

## How to Run

1. Open terminal and navigate to the directory:
```bash
cd ai-smart-mirror
```

2. Start any standard web server:
```bash
# Option A: Python 3
python -m http.server 8000

# Option B: Node.js
npx serve
```

3. Open `http://localhost:8000` in your web browser (Chrome, Edge, Safari) and allow camera permissions when prompted.
