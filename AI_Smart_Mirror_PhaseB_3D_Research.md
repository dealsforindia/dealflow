# AI Smart Mirror — Phase B Cutting-Edge 3D Technology Research

**Date:** 2026-09-30  
**Phase:** Phase B — 3D Reconstruction, Neural Cloth & 3DGS Research  
**Purpose:** Evaluate 2024–2026 open-source 3D tools for automated 2D-to-3D garment asset creation, photorealistic 3D human rendering, and neural cloth physics.

---

## 1. Image-to-3D Garment Generation (2D Photo → 3D GLB Asset)

| Tool | Processing Time | License | VRAM Needed | Commercial Use | Ideal Mirror Role |
|---|---|---|---|---|---|
| **TripoSR** | **0.5–1.5s** | **MIT** | 8GB | ✅ Yes | Instant live upload of custom clothing photo → 3D mesh |
| **InstantMesh** | ~10s | **Apache-2.0** | 16GB | ✅ Yes | Automated bulk conversion of store catalog photos → GLB assets |
| **CRM** | ~10s | **MIT** | 16GB | ✅ Yes | High-precision geometry & texture extraction for complex garments |
| **LGM** | ~5s | **MIT** | 16GB | ✅ Yes | Gaussian splat asset preview generation |
| **CharacterGen** | ~20–30s | **Apache-2.0** | 24GB | ✅ Yes | Structured canonical body + garment mesh generation with rigging |

### Key Takeaway for Garment Pipeline:
- **TripoSR** (MIT, <1.5s per asset) is the clear winner for real-time customer photo ingestion.
- **InstantMesh** (Apache-2.0) is the best choice for back-office e-commerce product ingestion.

---

## 2. 3D Gaussian Splatting (3DGS) for Animatable Humans

| Tool | Rendering FPS | License | Training/Avatar Time | Key Strengths |
|---|---|---|---|---|
| **3DGS-Avatar** | **100+ FPS** | **MIT** | ~15–30 min | Ultra-low latency real-time neural avatar rendering |
| **Human101** | **60+ FPS** | **Apache-2.0** | **~100s** | Avatar creation from a single selfie in ~1.5 minutes |
| **AnimatableGaussians** | 60+ FPS | Research | ~15–30 min | Photorealistic SMPL-X surface deformation |
| **SuGaR** | 60–100 FPS | Non-Commercial | ~10–15 min | Binds Gaussians directly to explicit mesh surfaces |
| **HumanGaussian** | 60+ FPS | **Apache-2.0** | ~5–10 min | Structure-aware text/image-to-avatar generation |

### Key Takeaway for Human Avatar Pipeline:
- **Human101** (Apache-2.0, 100s reconstruction time) allows kiosk customers to create an animatable 3D avatar from one photo.
- **3DGS-Avatar** (100+ FPS) delivers zero-lag rendering when users turn, walk, or pose.

---

## 3. Neural Cloth Physics & Real-Time Garment Deformation

| Tool | Inference Speed | License | Mechanism | Commercial Use |
|---|---|---|---|---|
| **SNug** | **>100 FPS** (<10ms) | Research | Self-supervised dynamic body fitting | ⚠️ Non-commercial |
| **DrapeNet** | **50–100 FPS** (10–20ms) | **MIT** | Direct feedforward body-to-garment mapping | ✅ Yes |
| **HOOD** | 30–60 FPS | **MIT** | Graph Neural Network multi-layer drape | ✅ Yes |
| **MeshGraphNets** | 20–50 FPS | **Apache-2.0** | DeepMind GNN mesh physics backbone | ✅ Yes |
| **GarmentCode** | 1–3s per pattern | **MIT** | Algorithmic 2D pattern to 3D stitched garment | ✅ Yes |

### Key Takeaway for Neural Cloth Pipeline:
- **DrapeNet** (MIT, 50–100 FPS) is the fastest commercially viable neural fitting predictor.
- **GarmentCode** (MIT) enables algorithmic pattern customization (length, sleeve width, tightness) before try-on.

---

## 4. Complete End-to-End System Vision

```
      [ CUSTOMER / KIOSK ]
               │
      Single Selfie / Webcam
               │
               ▼
        ┌──────────────┐
        │   Human101   │ ──► 3D Animatable Avatar (100s)
        └──────────────┘
               │
               ▼
        ┌──────────────┐      ┌──────────────┐
        │  GarmentCode │ ──►  │   TripoSR    │ ──► 3D GLB Garment Asset (<1.5s)
        │ (Custom Size)│      │(Store Photo) │
        └──────┬───────┘      └──────┬───────┘
               │                     │
               └──────────┬──────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │   DrapeNet   │ ──► Real-Time Cloth Fit & Tension Heatmap (10ms)
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ 3DGS-Avatar  │ ──► Live 100+ FPS Photorealistic Mirror Display
                  └──────────────┘
```

---

*Report generated: 2026-09-30 | Phase B 3D Research for AI Smart Mirror Project*
