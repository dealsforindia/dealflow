# AI Smart Mirror — M0 Technology Research Report

**Date:** 2026-09-30  
**Phase:** M0 — Repository & Stack Research  
**Purpose:** Identify, evaluate, and rank open-source components for the virtual fitting room pipeline.

---

## Table of Contents

1. [Architecture Summary](#architecture-summary)
2. [Category 1 — Pose Estimation / Body Tracking](#category-1--pose-estimation--body-tracking)
3. [Category 2 — Person Segmentation & Matting](#category-2--person-segmentation--matting)
4. [Category 3 — 3D Human Body Reconstruction](#category-3--3d-human-body-reconstruction)
5. [Category 4 — Virtual Try-On (VTON)](#category-4--virtual-try-on-vton)
6. [Category 5 — Garment 3D Reconstruction](#category-5--garment-3d-reconstruction)
7. [Category 6 — Cloth Simulation](#category-6--cloth-simulation)
8. [Category 7 — Real-Time 3D Rendering](#category-7--real-time-3d-rendering)
9. [Category 8 — Smart Mirror / AR Fitting Room Reference Projects](#category-8--smart-mirror--ar-fitting-room-reference-projects)
10. [Recommended Stack for MVP](#recommended-stack-for-mvp)
11. [Recommended Stack for V1 Production](#recommended-stack-for-v1-production)
12. [Decision Matrix](#decision-matrix)
13. [Immediate Next Steps](#immediate-next-steps)

---

## Architecture Summary

The pipeline has two distinct performance zones:

```
REAL-TIME LOOP (30–60 FPS target)        OFFLINE / ASYNC PIPELINE
─────────────────────────────────        ──────────────────────────
Camera capture                           Garment photo → 3D asset
Pose tracking                            3D reconstruction
Body tracking                            Texture processing
Garment transform                        Body measurement analysis
Rendering                                Product ingestion
Display                                  AI VTON preview generation
```

Real-time components must run on consumer GPU or CPU.  
Offline components can use heavy cloud/server inference.

---

## Category 1 — Pose Estimation / Body Tracking

### Comparison Table

| Tool | FPS (CPU) | FPS (GPU) | License | Commercial | Keypoints | GPU Required? | Integration |
|---|---|---|---|---|---|---|---|
| **RTMPose-m** | 90+ | 430+ | Apache-2.0 | ✅ | 17–133 | No | Medium |
| **MediaPipe Pose** | 30–90 | 100+ | Apache-2.0 | ✅ | 33 (3D) | No | **Easy** |
| **DWPose-l** | ~15 | ~60 | Apache-2.0 | ✅ | 133 | No (ONNX) | Medium |
| **ViTPose-H** | <5 | 10–20 | Apache-2.0 | ✅ | 17–133 | **Yes** | Hard |
| **HRNet-W32** | <5 | 10–15 | MIT | ✅ | 17 | Yes | Medium |
| **OpenPose** | 1–2 | 20–22 | ❌ Non-commercial | ❌ | 135 | Yes | Hard |
| **AlphaPose** | — | ~20 | ❌ Non-commercial | ❌ | 17/136 | Yes | Medium |

### Detailed Entries

#### RTMPose (OpenMMLab / CAIR)
- **URL:** https://github.com/open-mmlab/mmpose/tree/main/projects/rtmpose
- **Function:** Real-time multi-person 2D pose estimation. Multiple sizes (t/s/m/l/x). RTMW variant adds wholebody 133 keypoints.
- **Framework:** PyTorch training; ONNX/TensorRT/ncnn/OpenVINO for inference
- **License:** Apache-2.0 ✅ commercial
- **Strengths:** Fastest accurate pose model available. CPU-deployable (90+ FPS i7). Exportable to any edge target. MMDeploy pipeline for optimization. Multiple model sizes for speed/accuracy tradeoff.
- **Weaknesses:** Top-down (needs RTMDet/YOLO detector for person detection, adds ~5–15ms). Raw ONNX inference needs custom pre/post-processing.
- **Project Role:** **PRIMARY real-time pose tracker for fitting room.** Use RTMPose-m for speed, RTMPose-l or RTMW for wholebody garment alignment.

#### MediaPipe Pose (Google)
- **URL:** https://github.com/google-ai-edge/mediapipe
- **Function:** BlazePose model. 33 3D body landmarks + visibility per frame. Holistic mode adds face + hands.
- **Framework:** MediaPipe (C++ core), Python/JS/iOS/Android SDKs
- **License:** Apache-2.0 ✅ commercial
- **Stars:** 37.1k | **Activity:** Active 2026
- **Strengths:** `pip install mediapipe` + 5 lines. No GPU needed. Browser (JS) deployment possible. Lowest integration barrier. Cross-platform.
- **Weaknesses:** Single-person optimized. Estimated (not metric) 3D depth. Less accurate on partial occlusion.
- **Project Role:** **MVP first choice.** Use for proof-of-concept prototype and edge/no-GPU deployments.

#### DWPose (IDEA Research)
- **URL:** https://github.com/IDEA-Research/DWPose
- **Function:** Wholebody pose (133 keypoints: body+face+hands+feet) via two-stage distillation from RTMPose.
- **License:** Apache-2.0 ✅ commercial
- **Stars:** 2.8k | **Activity:** Active (Dec 2023; ONNX maintained)
- **Strengths:** Best wholebody accuracy at 133 kp. ONNX branch — no mmcv dependency. Widely used in ControlNet/ComfyUI pipelines.
- **Weaknesses:** Designed for image generation pipelines not real-time tracking. Needs YOLOX detector.
- **Project Role:** **High-accuracy measurement frames.** Run DWPose for sizing/measurement analysis (not every frame).

---

## Category 2 — Person Segmentation & Matting

### Comparison Table

| Tool | FPS (GPU) | FPS (CPU) | License | Commercial | GPU Required | Body Parts | Best Use |
|---|---|---|---|---|---|---|---|
| **SAM2 Tiny** | 91 FPS (A100) | N/A | Apache-2.0 | ✅ | Yes | No | Video tracking from prompt |
| **RVM** | 104–172 FPS | ~10–20 FPS (ONNX) | **GPL-3.0** | ❌ | No (ONNX) | No | Best GPU matting quality |
| **MediaPipe Selfie Seg** | 90+ | 30+ | Apache-2.0 | ✅ | No | No | Browser/CPU MVP |
| **MODNet** | ~30 FPS | ~15–20 FPS | Apache-2.0 | ✅ | No | No | Mobile/edge, Apache-2.0 |
| **Background Matting V2** | 60 FPS (HD) | No | MIT | ✅ | Yes | No | Fixed-camera installations |
| **SCHP (ATR)** | ~3–8 FPS | No | MIT | ✅ | Yes | ✅ 20 classes | Clothing zone detection |
| **SAM v1** | ~20 FPS (prompted) | No | Apache-2.0 | ✅ | Yes | No | Single-frame quality masks |
| **RMBG-1.4** | ~20–40 FPS | ~1–5 FPS | Non-commercial | ❌ | No | No | Still-image preprocessing |
| **PointRend** | ~5–15 FPS | No | Apache-2.0 | ✅ | Yes | No | Multi-person detection |

### Detailed Entries

#### SAM2 — Segment Anything Model 2 (Meta)
- **URL:** https://github.com/facebookresearch/sam2
- **Function:** Promptable visual segmentation for both images and video with temporal memory. Tracks objects across frames using a streaming memory bank. Four model sizes: Tiny, Small, Base+, Large.
- **Framework:** PyTorch 2.5.1+; CUDA custom kernel; HuggingFace Hub
- **License:** Apache-2.0 ✅ commercial
- **FPS:** 91.2 FPS Tiny / 84.8 FPS Small / 64.1 FPS Base+ / 39.5 FPS Large — on A100. Consumer RTX 3080: ~30–60 FPS (Tiny/Small).
- **Stars:** ~19.9k | **Activity:** Active (Dec 2024)
- **Strengths:** Prompt once → tracks person across entire video stream. Four model sizes with genuine real-time FPS options. torch.compile speedup. Multi-object tracking in same pass. HuggingFace Hub integration.
- **Weaknesses:** Windows installation requires WSL (CUDA kernel compilation). GPU-dependent — no practical CPU path. No semantic class output — needs initial prompt to identify person. Large model still ~39 FPS on A100; consumer GPU will be lower.
- **Project Role:** **PRIMARY video person tracker.** Prompt SAM2 once when customer steps in front. Tiny/Small variant tracks them continuously across frames. Best balance of quality + temporal consistency for GPU hardware.

#### RVM — Robust Video Matting
- **URL:** https://github.com/PeterL1n/RobustVideoMatting
- **Function:** Real-time human video matting (alpha matte) using recurrent architecture for temporal consistency. No background image needed.
- **Framework:** PyTorch; TensorFlow; TensorFlow.js; ONNX; CoreML
- **License:** **GPL-3.0** ⚠️ — commercial deployment requires relicensing or model replacement
- **FPS:** 172 FPS HD (RTX 3090 FP16) / 134 FPS (RTX 2060 Super FP16) / 104 FPS (GTX 1080 Ti FP32); CPU ONNX: ~10–20 FPS at reduced resolution
- **Stars:** ~9.5k | **Activity:** Stale (last commit Nov 2021)
- **Strengths:** Best-in-class real-time matting quality. Precise hair/edge alpha matte. Temporal recurrent state = stable, flicker-free. Multi-framework export. No background capture needed.
- **Weaknesses:** GPL-3.0 blocks commercial products without separate agreement. No active development since 2021. Occasional ghosting in fast motion.
- **Project Role:** **High quality GPU matting — use only if GPL licensing is acceptable or can be relicensed.** Otherwise use MODNet (Apache-2.0) or BGMv2 (MIT).

#### MediaPipe Selfie Segmentation
- **URL:** https://github.com/google-ai-edge/mediapipe
- **Function:** Real-time person segmentation mask (binary confidence mask 0–1). General and selfie-optimized model variants. Part of MediaPipe Tasks suite.
- **Framework:** TFLite runtime; Python, JavaScript (WASM), Android, iOS, C++ APIs
- **License:** Apache-2.0 ✅ commercial
- **FPS:** 30+ CPU (desktop); runs in browser at 30 FPS via WebAssembly
- **Stars:** ~37.1k | **Activity:** Active 2026
- **Strengths:** Lightest CPU-only real-time solution. Runs in-browser (JS/WASM). Sub-10ms on modern CPU. Bundled with MediaPipe Pose — zero extra dependencies for MVP. Cross-platform.
- **Weaknesses:** Blurry/soft mask edges — not suitable for precise clothing boundary. Binary mask only (no alpha gradient). Optimized for upper-body/selfie framing. Deprecated 2023 (replaced by Image Segmenter task but still functional).
- **Project Role:** **MVP simplest option.** Combine with MediaPipe Pose for zero-dependency GPU-free prototype. Browser deployment option.

#### MODNet
- **URL:** https://github.com/ZHKKKe/MODNet
- **Function:** Lightweight trimap-free portrait matting via objective decomposition. MobileNetV2 backbone. AAAI 2022.
- **Framework:** PyTorch; ONNX; TorchScript; TFLite
- **License:** Apache-2.0 ✅ commercial
- **FPS:** ~30 FPS at 512×512 on mid-range GPU; ~15–20 FPS CPU at reduced resolution
- **Stars:** ~4.4k | **Activity:** Stale (~2022)
- **Strengths:** Apache-2.0 (only open-source matting tool with commercial rights besides BGMv2). Lightweight — mobile/edge deployable. No background capture required. ONNX export. TensorRT community support for Jetson.
- **Weaknesses:** Portrait-optimized — degrades on full-body at distance. No temporal consistency (per-frame flicker in video). Inferior hair/edge quality vs RVM. Minimal maintenance.
- **Project Role:** **Commercial-safe GPU matting alternative** when RVM's GPL license is a blocker. Use for edge/mobile deployments.

#### Background Matting V2
- **URL:** https://github.com/PeterL1n/BackgroundMattingV2
- **Function:** High-resolution background matting using a pre-captured background reference image. CVPR 2021 Best Student Paper Honorable Mention.
- **Framework:** PyTorch; TorchScript; TensorFlow; ONNX
- **License:** MIT ✅ commercial
- **FPS:** 4K @ 30 FPS / HD @ 60 FPS on RTX 2080 Ti
- **Stars:** ~7.2k | **Activity:** Stale (2021 — superseded by RVM)
- **Strengths:** MIT license. Highest quality matting when background is known (preserves transparent clothing, fine hair). Multiple export formats.
- **Weaknesses:** Requires pre-captured static background. Sensitive to lighting changes between capture and live frame. No temporal model (per-frame). Inactive since 2021.
- **Project Role:** **Fixed-installation smart mirror.** For a permanent retail fitting room booth, capture the empty background once at installation → BGMv2 delivers studio-quality isolation. MIT license enables commercial use.

#### SCHP — Self-Correction Human Parsing
- **URL:** https://github.com/GoGoDuck912/Self-Correction-Human-Parsing
- **Function:** Semantic human body part and clothing parsing. Segments into 7–20 labeled regions per pixel: hair, face, torso, upper-clothes, pants, dress, shoes, arms, legs, etc. Three pretrained models: LIP (20 classes), ATR (18 classes, fashion-focused), Pascal (7 body parts).
- **Framework:** PyTorch
- **License:** MIT ✅ commercial
- **FPS:** ~3–8 FPS at inference resolution on GPU. Not real-time.
- **Stars:** ~1.3k | **Activity:** Stale (~2021)
- **Strengths:** Only open-source model that outputs granular clothing categories per pixel. ATR dataset optimized for fashion/e-commerce (hat, skirt, pants, dress, belt, shoes). MIT license. Ranked 1st in 3rd LIP Challenge.
- **Weaknesses:** Too slow for real-time video (~3–8 FPS). Single-person input only. No ONNX/TFLite export. Old Python 3.6 Conda setup required.
- **Project Role:** **Async clothing zone detection.** Run on key frames (every 0.5–1s) to identify garment regions (shirt zone, pants zone) for driving garment overlay placement and occlusion masking.

#### SAM — Segment Anything Model (Meta)
- **URL:** https://github.com/facebookresearch/segment-anything
- **Function:** General-purpose promptable image segmentation. Generates masks for any object given point, box prompts, or automatic all-object mode.
- **Framework:** PyTorch; ONNX export available
- **License:** Apache-2.0 ✅ commercial
- **FPS:** ~3–6 FPS full auto-mask mode (ViT-H); ~20+ FPS per prompted inference on GPU
- **Stars:** ~55k | **Activity:** Stale (superseded by SAM2)
- **Strengths:** Zero-shot, class-agnostic. ONNX export for browser/edge. Three model sizes. Massive training data (1.1B masks).
- **Weaknesses:** No temporal video memory (independent per-frame). ViT-H requires ~6GB VRAM. Requires initial user prompt to segment person reliably. Superseded by SAM2.
- **Project Role:** **High-quality single-frame mask refinement.** Use SAM to generate precise product garment masks from catalog photos for 3D reconstruction pipeline.

#### RMBG-1.4 (BRIA AI)
- **URL:** https://huggingface.co/briaai/RMBG-1.4
- **License:** Non-commercial (CC) ❌ — commercial license sold separately by BRIA AI
- **Strengths:** SOTA background removal quality. HuggingFace Transformers integration. Browser via Transformers.js.
- **Project Role:** **Not recommended for commercial fitting room** without purchasing BRIA AI commercial license.

#### PointRend (Detectron2)
- **URL:** https://github.com/facebookresearch/detectron2/tree/main/projects/PointRend
- **Function:** High-quality instance segmentation boundary refinement on top of Mask R-CNN. Segments individual people with sharp edges.
- **License:** Apache-2.0 ✅ commercial
- **FPS:** ~5–15 FPS — not real-time on consumer GPU
- **Strengths:** Instance-level person segmentation. COCO-pretrained 'person' class. Sharp boundaries.
- **Weaknesses:** Heavy Detectron2 stack (complex Windows install). Not real-time. No alpha matte output.
- **Project Role:** **Multi-person scene detection.** Use bounding boxes from PointRend/Mask R-CNN to seed SAM2 prompts when multiple customers stand in frame.

---

## Category 3 — 3D Human Body Reconstruction

### Comparison Table

| Tool | Output | FPS (GPU) | License | Commercial | SMPL Mesh |
|---|---|---|---|---|---|
| **SMPL-X** (body model) | Parametric mesh | N/A (model only) | Research/CC | ⚠️ Restricted | ✅ |
| **HMR2 / 4D-Humans** | SMPL mesh | ~15–20 | Apache-2.0 | ✅ | ✅ |
| **PyMAF-X** | SMPL-X mesh | ~5–10 | Non-commercial | ❌ | ✅ |
| **HybrIK** | SMPL mesh | ~20 | MIT | ✅ | ✅ |
| **CLIFF** | SMPL mesh | ~15 | MIT | ✅ | ✅ |
| **TokenHMR** | SMPL mesh | ~10 | Apache-2.0 | ✅ | ✅ |
| **SMPLer-X** | SMPL-X wholebody | ~5 | CC BY-NC | ❌ | ✅ |
| **PARE** | SMPL mesh | ~10–15 | MIT | ✅ | ✅ |

### Detailed Entries

#### SMPL / SMPL-X Body Model (MPI-IS)
- **URL:** https://smpl-x.is.tue.mpg.de / https://github.com/vchoutas/smplx
- **Function:** Parametric statistical human body model. Takes shape (β) + pose (θ) parameters → 3D mesh (6890 vertices for SMPL, 10475 for SMPL-X with hands and face). Foundation model used by almost all HMR papers.
- **License:** CC BY 4.0 for research; **commercial use requires a separate commercial license from MPI-IS**
- **Commercial:** ⚠️ Research free; commercial → apply at mpii.de
- **Strengths:** Industry standard body representation. All major HMR tools output SMPL/SMPL-X params. Garment simulation tools (TailorNet, ClothWild) expect SMPL mesh as input. Extensive shape space (300 β dims for detailed body variation).
- **Weaknesses:** License requires commercial agreement. Not a runtime model — it's the shape prior that other networks regress to. Requires a regressor (HMR2, HybrIK, etc.) to get params from camera image.
- **Project Role:** **FOUNDATION body representation.** All 3D body reconstruction in the pipeline will regress SMPL/SMPL-X parameters. The mesh is the input to garment fitting.

#### HMR2 / 4D-Humans (CVPR 2023)
- **URL:** https://github.com/shubham-goel/4D-Humans
- **Function:** ViT-H based human mesh recovery from monocular video. Produces temporally consistent SMPL mesh sequences. State-of-the-art on 3DPW/EMDB benchmarks.
- **Framework:** PyTorch, HuggingFace ViT-H backbone
- **License:** Apache-2.0 ✅ commercial (SMPL license separate)
- **FPS:** ~15–20 FPS on A100; ~5–8 FPS on RTX 3090
- **Strengths:** Best single-image + video body reconstruction accuracy (SOTA 2023). Temporal consistency across frames. Pre-trained weights on HuggingFace. Apache-2.0. Produces SMPL params ready for garment fitting.
- **Weaknesses:** Slow on consumer GPU for real-time. Requires ViT-H backbone (large model). Not real-time at 30 FPS on consumer hardware.
- **Project Role:** **BODY MEASUREMENT pipeline.** Run on periodic frames (every 1–2 seconds) to get accurate SMPL body shape for garment sizing — not per-frame real-time.

#### HybrIK (CVPR 2021, IJCV 2023)
- **URL:** https://github.com/Jeff-sjtu/HybrIK
- **Function:** Hybrid inverse kinematics — combines analytical IK with deep learning for accurate SMPL pose recovery. HybrIK-X adds face and hands.
- **Framework:** PyTorch
- **License:** MIT ✅ commercial (SMPL license separate)
- **FPS:** ~20 FPS on RTX 2080
- **Strengths:** MIT license. Better joint rotation accuracy than pure regression methods. ~20 FPS achievable → near real-time potential. ResNet-34/50 backbone (lighter than ViT).
- **Weaknesses:** Less accurate shape estimation than HMR2. Requires SMPL model files.
- **Project Role:** **REAL-TIME body shape estimator candidate.** At ~20 FPS, HybrIK can run in the fitting room loop for continuous SMPL pose updates. Best balance of speed and accuracy for MIT license.

#### CLIFF (ECCV 2022)
- **URL:** https://github.com/huawei-noah/noah-research/tree/master/CLIFF
- **Function:** Perspective-correct human mesh recovery — explicitly uses full-image context (not just cropped person box) for accurate global body position and orientation.
- **Framework:** PyTorch
- **License:** MIT ✅ commercial
- **FPS:** ~15 FPS on V100
- **Strengths:** Much better global body orientation vs crop-only methods. Critical when customer turns sideways/rotates. MIT license. Good 3DPW accuracy.
- **Weaknesses:** Slower than HybrIK. Less maintained (last release 2022).
- **Project Role:** **360° rotation accuracy.** CLIFF's perspective correction is especially useful for the "customer turns around" use case — global orientation stays accurate.

#### SMPLer-X (NeurIPS 2023)
- **URL:** https://github.com/caizhongang/SMPLer-X
- **Function:** Foundation model for expressive whole-body (SMPL-X: body+face+hands) reconstruction. Trained on 4.5M images.
- **License:** CC BY-NC 4.0 ❌ **non-commercial**
- **Strengths:** Best SMPL-X wholebody accuracy. Handles diverse poses across multiple benchmarks.
- **Weaknesses:** Non-commercial license blocks commercial product use.
- **Project Role:** **Research reference only** — do not use in commercial fitting room without license negotiation.

---

## Category 4 — Virtual Try-On (VTON)

> **Critical finding:** All current SOTA VTON approaches use diffusion models. They produce photorealistic results but inference takes **3–30 seconds per image**. None are real-time (30 FPS). For the fitting room, VTON is used as an **async preview generator**, not the real-time rendering layer.

### Comparison Table

| Tool | Inference Time | License | Commercial | Video Support | Quality |
|---|---|---|---|---|---|
| **CatVTON** | ~4s (RTX 3090) | MIT | ✅ | ❌ Static | ⭐⭐⭐⭐ |
| **OOTDiffusion** | ~5s | MIT | ✅ | ❌ Static | ⭐⭐⭐⭐ |
| **IDM-VTON** | ~8s | CC BY-NC | ❌ | ❌ Static | ⭐⭐⭐⭐⭐ |
| **StableVITON** | ~4s | CC BY-NC | ❌ | ❌ Static | ⭐⭐⭐⭐ |
| **HR-VITON** | ~2s | SPADE License | ⚠️ | ❌ Static | ⭐⭐⭐ |
| **VITON-HD** | ~1s | Non-commercial | ❌ | ❌ Static | ⭐⭐⭐ |
| **LaDI-VTON** | ~6s | CC BY-NC | ❌ | ❌ Static | ⭐⭐⭐⭐ |

### Detailed Entries

#### CatVTON
- **URL:** https://github.com/Zheng-Chong/CatVTON
- **Function:** Lightweight virtual try-on using concatenation-based diffusion. Eliminates ReferenceNet — significantly lighter than IDM-VTON. Upper/lower/whole body garments.
- **Framework:** PyTorch + Stable Diffusion
- **License:** MIT ✅ commercial
- **Inference:** ~4s on RTX 3090 (512×512)
- **Strengths:** MIT license (only major VTON with commercial rights). Much lighter than IDM-VTON (no ReferenceNet). HuggingFace Space demo. Upper + lower + whole body support. Best commercial-viable VTON.
- **Weaknesses:** Not real-time. Static images only. Less photorealistic than IDM-VTON on complex textures.
- **Project Role:** **PRIMARY VTON preview generator for commercial fitting room.** Generate async try-on previews when customer selects a garment (3–5 second wait). Only MIT-licensed complete VTON system.

#### OOTDiffusion
- **URL:** https://github.com/levihsu/OOTDiffusion
- **Function:** Outfitting Fusion based latent diffusion VTON. Uses outfit UNet to align garment features with body pose.
- **Framework:** PyTorch + Stable Diffusion v1.5 / SDXL
- **License:** MIT ✅ commercial
- **Inference:** ~5s (half-body), ~8s (full-body) on RTX 3090
- **Strengths:** MIT license. SDXL variant for higher resolution. Good upper+lower garment handling. Active development (2024).
- **Weaknesses:** Heavier compute than CatVTON. SDXL variant needs 24GB+ VRAM.
- **Project Role:** **Alternative VTON engine.** Use SDXL variant for higher resolution product preview images.

#### IDM-VTON (ECCV 2024)
- **URL:** https://github.com/yisol/IDM-VTON
- **Function:** Improved Diffusion-based VTON using IP-Adapter + garment feature injection for superior texture preservation.
- **License:** CC BY-NC-SA 4.0 ❌ non-commercial
- **Strengths:** Best photorealism and garment detail preservation among all VTON models.
- **Weaknesses:** Non-commercial license. Heaviest compute (dual UNet).
- **Project Role:** **Research quality reference / demo only.** For commercial deployment, use CatVTON or OOTDiffusion.

#### HR-VITON
- **URL:** https://github.com/sangyun884/HR-VITON
- **Function:** High-resolution (1024×768) image-based VTON with flow-based warping + segmentation-guided synthesis.
- **Framework:** PyTorch
- **License:** ⚠️ SPADE license (no commercial use without permission)
- **Inference:** ~2s on V100
- **Strengths:** Higher resolution than early VTON. Faster than diffusion approaches.
- **Weaknesses:** Warping artifacts on complex garments. Non-commercial license.
- **Project Role:** **Legacy fast VTON reference.** Not recommended for new commercial deployments.

---

## Category 5 — Garment 3D Reconstruction

> Converting real garment photographs into 3D mesh assets for the fitting engine.

### Comparison Table

| Tool | Input | Output | License | Commercial | Status |
|---|---|---|---|---|---|
| **TailorNet** | SMPL pose+shape+garment type | Garment mesh on body | MIT | ✅ | Active |
| **GarmentCode** | Design parameters | Sewing pattern + 3D sim | MIT | ✅ | Active 2024 |
| **DeepFashion3D** | Single garment image | 3D garment mesh | Research | ❌ | 2021 |
| **ClothWild** | In-the-wild image | 3D clothed body | MIT | ✅ | 2023 |
| **ISP (In-Shop to 3D)** | Shop front+back images | Garment UV + 3D | CC BY-NC | ❌ | 2023 |

### Detailed Entries

#### TailorNet (CVPR 2020)
- **URL:** https://github.com/chaitanya100100/TailorNet
- **Function:** Predicts realistic 3D garment mesh deformation on a SMPL body given arbitrary pose and shape. Trained on 6+ garment types (t-shirt, jacket, trousers, etc.).
- **License:** MIT ✅ commercial
- **Strengths:** MIT license. Takes SMPL body + garment type → fitted 3D garment mesh. Direct pipeline integration: HybrIK → SMPL → TailorNet → garment mesh. Trained on diverse poses and shapes.
- **Weaknesses:** Fixed garment catalog (not arbitrary new garments). Low-frequency deformation only (no fine wrinkles). 2020 model — newer alternatives exist.
- **Project Role:** **GARMENT DEFORMATION ENGINE for known garment types.** Use TailorNet to generate garment mesh deformations at runtime given body shape. Critical for MVP garment fitting.

#### GarmentCode (SIGGRAPH Asia 2023)
- **URL:** https://github.com/maria-korosteleva/GarmentCode
- **Function:** Parametric garment design system — generates simulation-ready sewing patterns from high-level design parameters. Produces CLO3D / Marvelous Designer compatible patterns and 3D meshes.
- **License:** MIT ✅ commercial
- **Strengths:** Generates physically accurate garment meshes from parameters (not photos). MIT license. Produces simulation-ready sewing patterns. Active development 2024.
- **Weaknesses:** Requires design parameter input, not garment photos. Cannot reconstruct arbitrary existing garments from images. Primarily a design tool.
- **Project Role:** **GARMENT ASSET CREATION tool.** Use GarmentCode to create the 3D garment database from scratch for each catalog item.

#### ClothWild (CVPR 2023)
- **URL:** https://github.com/hygenie1228/ClothWild_RELEASE
- **Function:** 3D clothed human body reconstruction from in-the-wild monocular images. Recovers SMPL body + cloth mesh simultaneously.
- **License:** MIT ✅ commercial
- **Strengths:** MIT license. Works on casual/in-the-wild images. Produces both body and cloth mesh together.
- **Weaknesses:** Cloth mesh resolution limited. Generalization to unseen garment types may be limited.
- **Project Role:** **3D cloth mesh recovery from product photos.** Use to extract approximate garment 3D shape from front/back product photos before refinement.

---

## Category 6 — Cloth Simulation

| Tool | Type | Real-Time? | License | Commercial | Framework |
|---|---|---|---|---|---|
| **Blender Cloth Sim** | Position-Based + FEM | No (offline) | GPL | ⚠️ GPL | Blender Python |
| **DiffCloth** | Differentiable FEM | No | MIT | ✅ | PyTorch |
| **Taichi Cloth** | PBD / FEM | Yes (~60 FPS) | MIT | ✅ | Taichi lang |
| **NVIDIA FleX** | PBD | Yes | Proprietary | ⚠️ | CUDA |
| **TailorNet** | ML-based | Yes (~30 FPS) | MIT | ✅ | PyTorch |
| **NeuralClothSim** | Neural implicit | No | MIT | ✅ | PyTorch |

### Key Notes

#### Taichi Cloth Simulation
- **URL:** https://github.com/taichi-dev/taichi (cloth examples included)
- **Function:** High-performance cloth simulation using Position-Based Dynamics or FEM on GPU, written in Taichi lang (Python front-end, GPU back-end).
- **License:** MIT ✅ commercial
- **Performance:** 60+ FPS for cloth meshes up to ~10k vertices on consumer GPU
- **Strengths:** Real-time capable on GPU. MIT license. Python front-end. Works on AMD + NVIDIA. Active development.
- **Project Role:** **REAL-TIME cloth physics engine.** Use Taichi PBD for per-frame garment deformation under body movement. Primary cloth sim choice.

#### TailorNet (ML cloth deformation)
- Already listed in Category 5. From a simulation perspective, TailorNet replaces traditional cloth physics with a learned deformation model — **30 FPS capable** on GPU. Better for real-time than traditional FEM.

#### Blender Cloth
- Use Blender's cloth simulator **offline** to pre-bake garment deformation sequences for common poses. Export as GLB/FBX animation. Play back in real-time renderer.
- **Project Role:** **Offline asset baking tool.** Not for real-time.

---

## Category 7 — Real-Time 3D Rendering

### Comparison Table

| Tool | Platform | License | Commercial | FPS | GPU | Ease |
|---|---|---|---|---|---|---|
| **Three.js** | Web (WebGL/WebGPU) | MIT | ✅ | 60+ | No (optional) | Easy |
| **Babylon.js** | Web (WebGL/WebGPU) | Apache-2.0 | ✅ | 60+ | No (optional) | Easy |
| **Google Filament** | Native + Web | Apache-2.0 | ✅ | 60+ | Yes (WebGL) | Medium |
| **Unity (URP/HDRP)** | Desktop/Mobile/Web | Proprietary | ✅ (fees) | 60+ | Yes | Hard |
| **Unreal Engine 5** | Desktop | Proprietary | ✅ (royalty) | 60+ | Yes | Hard |
| **WebGPU Native** | Web (Chrome/Edge) | W3C Spec | ✅ | 60+ | Yes | Hard |

### Detailed Entries

#### Three.js
- **URL:** https://github.com/mrdoob/three.js
- **Function:** WebGL/WebGPU 3D library for browser rendering. GLB/GLTF model loading, PBR materials, Shadow maps, skinned mesh animation.
- **License:** MIT ✅ commercial
- **Stars:** 102k | **Activity:** Active 2026
- **Strengths:** Most popular 3D web library. 102k stars. GLB garment loading built-in. SkinnedMesh for bone-driven garment deformation. PBR materials (roughness/metalness) for fabric appearance. Works on any browser with WebGL. No install — CDN or npm. Huge ecosystem.
- **Weaknesses:** WebGL limitation vs native GPU pipeline. Complex cloth sim needs custom shader. No built-in cloth physics.
- **Project Role:** **PRIMARY RENDERER for web-based fitting room prototype.** Load GLB garment assets, apply bone transforms from pose tracker, composite over webcam video feed. Best MVP renderer choice.

#### Babylon.js
- **URL:** https://github.com/BabylonJS/Babylon.js
- **Function:** Full-featured WebGL/WebGPU game engine in the browser. Advanced PBR, physics (Havok), GUI, XR/AR support.
- **License:** Apache-2.0 ✅ commercial
- **Stars:** 24k | **Activity:** Active 2026
- **Strengths:** Built-in Havok physics engine (cloth physics potential). WebXR support for future AR mirror. More complete engine than Three.js. Native WebGPU support. Excellent documentation.
- **Weaknesses:** Heavier than Three.js for simple garment overlay use cases. Steeper learning curve.
- **Project Role:** **Alternative renderer** if cloth physics in browser are needed. Upgrade path from Three.js for V2 with physics.

#### Google Filament
- **URL:** https://github.com/google/filament
- **Function:** Real-time physically-based renderer for Android, iOS, Windows, Linux, WebGL. Used in Google Maps 3D, Google AR.
- **License:** Apache-2.0 ✅ commercial
- **Strengths:** Best PBR quality among open-source renderers. Used in production Google products. WebAssembly build for browser. Fabric material model.
- **Weaknesses:** Less ecosystem than Three.js. WebAssembly build is heavier. More complex integration.
- **Project Role:** **High-quality PBR rendering for garment materials.** Use Filament's fabric shading model for realistic denim/cotton/silk appearance.

---

## Category 8 — Smart Mirror / AR Fitting Room Reference Projects

| Project | URL | Tech Stack | Stars | License | Status |
|---|---|---|---|---|---|
| **Magic Mirror (MagicMirrorSquared)** | https://github.com/MagicMirrorOrg/MagicMirror | Electron + Node.js | 20k | MIT | Active |
| **Virtual Fitting Room (1000camels)** | https://github.com/1000camels/virtual-fitting-room | Python + OpenCV + PyGame | ~200 | MIT | 2015 stale |
| **AR Fitting Room (levythu)** | https://github.com/levythu/Virtual-Fitting-Room | MATLAB + OpenCV | ~300 | Research | 2015 stale |
| **OpenCV Shirt Overlay** | Multiple repos | OpenCV + Python | varies | MIT | Mixed |

### Key Observations

Most open-source "smart mirror" or "virtual fitting room" repos are:
1. **5–10 years old** (2015–2019), using basic OpenCV overlay with no pose tracking
2. **Non-functional today** without significant updates
3. Based on 2D image warping, not 3D body-aware fitting

**No production-quality open-source smart mirror with modern pose tracking + 3D garment fitting exists.** This is a gap — the project has genuine novelty.

MagicMirror2 (20k stars) is for home dashboard displays (weather, calendar) — not fashion AR.

**Implication:** The AI Smart Mirror must be built from scratch using the components above. No ready-made framework exists.

---

## Recommended Stack for MVP

**Goal:** Webcam → body tracked → simple 3D shirt follows torso. Proof of concept only.

```
Layer                  Tool                    Why
─────────────────────────────────────────────────────────────
Camera Input           OpenCV / browser API    Universal
Pose Tracking          MediaPipe Pose          Easiest, no GPU, Apache-2.0
Person Segmentation    MediaPipe Selfie Seg    Already bundled
3D Rendering           Three.js (WebGL)        MIT, GLB support, browser
Garment Asset          Simple hand-made GLB    T-shirt low-poly mesh
Garment Fitting        Linear blend skinning   Map 3D mesh to pose landmarks
Runtime                Python (FastAPI) +      Simple full-stack
                        React frontend
```

**MVP success criteria:**
- Customer moves → shirt follows torso
- Customer raises arms → shirt deforms
- Customer turns sideways → shirt stays aligned
- Target: 30 FPS on laptop without GPU

---

## Recommended Stack for V1 Production

**Goal:** Real product catalog, realistic garment visuals, multi-garment try-on, body shape estimation.

```
Layer                  Tool                    Why
─────────────────────────────────────────────────────────────
Camera Input           OpenCV / RTSP           Industrial camera support
Pose Tracking          RTMPose-m (ONNX)        430 FPS GPU, CPU-viable
Person Segmentation    SAM2 Tiny / BGMv2       SAM2 (Apache-2.0, video track);
                                               BGMv2 (MIT, fixed booth install)
Body Shape             HybrIK (MIT)            SMPL mesh at ~20 FPS GPU
Garment Deformation    TailorNet               SMPL-aware garment mesh
Cloth Physics          Taichi PBD (GPU)        Real-time cloth sim
3D Rendering           Three.js + custom       PBR garment materials
                        GLSL shaders
Occlusion              SCHP                    Per-body-part masking
Garment Assets         GarmentCode +           Parametric + sim-ready meshes
                        Blender bake
VTON Preview           CatVTON (MIT)           Async photorealistic preview
Backend                FastAPI + MongoDB        Garment catalog + user sessions
Deployment             Docker + NVIDIA          GPU container on local hardware
```

---

## Decision Matrix

### License-Filtered Commercial-Safe Stack

| Category | Recommended | License | Blocked (non-commercial) |
|---|---|---|---|
| Pose | RTMPose-m / MediaPipe | Apache-2.0 | OpenPose, AlphaPose |
| Segmentation | SAM2 Tiny / MODNet / MediaPipe / BGMv2 | Apache-2.0 / MIT | RVM (GPL-3.0), RMBG (non-commercial) |
| 3D Body | HybrIK / CLIFF / HMR2 | MIT / Apache-2.0 | SMPLer-X, PyMAF-X |
| Body Model | SMPL (apply for commercial) | CC+commercial license | — |
| VTON | CatVTON / OOTDiffusion | MIT | IDM-VTON, StableVITON |
| Garment 3D | TailorNet / GarmentCode | MIT | ISP |
| Cloth Sim | Taichi / TailorNet | MIT | NVidia FleX (proprietary) |
| Renderer | Three.js / Babylon.js | MIT / Apache-2.0 | — |

### Performance Reality Check

| Use Case | Latency Needed | Achievable With |
|---|---|---|
| Real-time pose tracking | <10ms | RTMPose-m ONNX (2.3ms GPU) |
| Person segmentation | <15ms | RVM ONNX (9ms GPU) |
| Body shape estimation | <100ms (per-second update) | HybrIK (~50ms GPU) |
| Garment deformation | <16ms | TailorNet (~10ms GPU) |
| Cloth physics | <16ms | Taichi PBD (~8ms GPU) |
| Rendering | <16ms | Three.js (GPU) |
| VTON preview | 3–8 seconds (async) | CatVTON (accepted wait) |

---

## Immediate Next Steps

### Phase A — MVP (2–4 weeks)

1. **Environment setup:** Install MediaPipe, Three.js, OpenCV on dev machine
2. **Camera mirror:** Webcam feed displayed on screen in browser
3. **Pose overlay:** MediaPipe Pose landmarks drawn on live feed
4. **Segmentation:** MediaPipe Selfie Segmentation background removal
5. **3D scene:** Three.js scene with camera backdrop + 3D coordinate system
6. **First garment:** Load a simple low-poly T-shirt GLB into Three.js
7. **Attachment:** Map shoulder/hip landmarks → GLB bone transforms
8. **Movement test:** Verify shirt follows torso during walking, arm raise, rotation

### Phase B — V1 Upgrade (4–8 weeks after MVP)

9. Replace MediaPipe with RTMPose-m ONNX for higher accuracy
10. Replace MediaPipe matting with SAM2 Tiny (Apache-2.0) or BGMv2 (MIT, for fixed booth)
11. Integrate HybrIK for SMPL body shape estimation
12. Integrate TailorNet for realistic garment mesh deformation
13. Add Taichi PBD cloth physics
14. Build garment catalog UI (product selection, size selection)
15. Integrate CatVTON for async photorealistic previews
16. Apply for SMPL commercial license (mpii.de)

### Hardware Procurement Order

1. **Phase A:** Existing PC + webcam (₹0 additional cost)
2. **Phase B:** Dedicated GPU (RTX 4070 or better) + HD webcam (≥1080p 60fps)
3. **Phase C:** Large 4K display, controlled lighting, depth camera (Intel RealSense D435 or similar)

---

---

## Key Cross-Cutting Findings

### 1. License Risk Summary

Several high-quality tools carry licenses that block commercial use without negotiation:

| Tool | License | Risk |
|---|---|---|
| OpenPose | CMU Non-commercial | ❌ Blocks commercial |
| AlphaPose | Custom Non-commercial | ❌ Blocks commercial |
| RVM | GPL-3.0 | ❌ GPL viral — open-source all derivatives |
| IDM-VTON | CC BY-NC-SA-4.0 | ❌ Non-commercial |
| StableVITON | CC BY-NC-4.0 | ❌ Non-commercial |
| LaDI-VTON | CC BY-NC-4.0 | ❌ Non-commercial |
| VITON-HD | Custom | ❌ Non-commercial |
| SMPLer-X | CC BY-NC-4.0 | ❌ Non-commercial |
| PyMAF-X | Custom | ❌ Non-commercial |
| SMPL body model | CC + commercial tier | ⚠️ Apply for commercial license |
| RMBG-1.4/2.0 | Custom CC | ❌ Paid commercial tier |
| Blender (cloth render) | GPL | ⚠️ Standalone use OK; linking requires GPL |

**Action:** Before integrating any model, verify current license terms at the source repo. Licenses can change between versions.

### 2. Real-Time vs Async Boundary

The most critical architectural decision: **what runs per-frame vs what runs async**.

```
PER-FRAME (must be <16ms for 60 FPS):
  - Pose landmark extraction (RTMPose-m ONNX: ~2ms GPU)
  - Person mask (SAM2 tracking state: ~5ms GPU after first frame)
  - Garment bone transforms (linear blend skinning: <1ms)
  - Three.js render (GPU: <5ms)

PER-SECOND (body shape update, ~50-100ms budget):
  - HybrIK SMPL shape estimation
  - SCHP clothing zone update

ASYNC / ON-DEMAND (3-10 second budget):
  - CatVTON photorealistic preview
  - Body measurements computation
  - Size recommendation
  - Garment asset loading from catalog
```

### 3. SMPL Body Model — Priority Action

Almost every 3D body reconstruction tool (HybrIK, HMR2, TailorNet, ClothWild) depends on the **SMPL parametric body model** from MPI-IS. The model files are free for research but require a commercial license for a retail product.

**Action required:** Register and apply at https://smplify.is.tue.mpg.de before starting V1 development. No cost is publicly stated — contact MPI-IS directly.

### 4. No Real-Time VTON Exists

All current SOTA virtual try-on systems (OOTDiffusion, CatVTON, IDM-VTON, StableVITON) are diffusion-based and take **3–30 seconds per image** on a consumer GPU. This is not a limitation of any specific tool — it is the state of the field in 2026.

**Design implication:** The real-time fitting room experience must use the **3D garment mesh + pose tracking approach** (Category 1–3 + 5–7), not VTON diffusion models. VTON is used only for generating a high-quality static "preview photo" that the customer can save or share.

### 5. Open-Source Gap = Product Opportunity

No complete, functional, modern open-source smart mirror / virtual fitting room system exists. The closest repos are 5–10 years old and use basic 2D image overlays. This means:
- **No shortcut exists** — the system must be built from pipeline components
- **The IP is defensible** — integration of these components into a working product is novel
- **Community momentum** — contributing back to open-source with benchmarks builds reputation

---

## Final Stack Recommendation

### MVP (Phase A) — No GPU Required, Browser-Based

```
Component         Tool                        License    Notes
──────────────────────────────────────────────────────────────────────
Camera            Browser MediaDevices API    W3C        Works in Chrome/Firefox
Pose              MediaPipe Pose (WASM)       Apache-2.0 33 landmarks at 30 FPS CPU
Segmentation      MediaPipe Selfie Seg (WASM) Apache-2.0 Same library, bundled
3D Render         Three.js (WebGL)            MIT        GLB loader, skinned mesh
Garment Asset     Hand-crafted low-poly GLB   —          T-shirt, ~500 triangles
Bone Mapping      Custom JS shader            —          Shoulder/hip landmarks → bones
Backend           None (pure client-side)     —          Zero infra for MVP
```

**Deliverable:** Browser page (`index.html`) where customer webcam feed + MediaPipe pose + three.js T-shirt overlay runs at 25–30 FPS on a laptop CPU.

### V1 (Phase B) — Desktop GPU, Python Backend

```
Component         Tool                        License    Notes
──────────────────────────────────────────────────────────────────────
Camera            OpenCV VideoCapture         MIT        HD webcam input
Pose              RTMPose-m (ONNX Runtime)    Apache-2.0 90+ FPS CPU / 430+ GPU
Person Mask       SAM2 Tiny (prompt on entry) Apache-2.0 Video tracking; RTX 3080+
                  OR BGMv2 (fixed booth)      MIT        Pre-captured background
Body Shape        HybrIK (PyTorch)            MIT        SMPL params ~20 FPS GPU
Garment Mesh      TailorNet                   MIT        SMPL-driven deformation
Cloth Physics     Taichi PBD                  MIT        Per-frame on GPU
3D Render         Three.js + custom GLSL      MIT        PBR fabric materials
Occlusion         SCHP ATR (async)            MIT        Async body-part labels
VTON Preview      CatVTON                     MIT        Async 4–8s photorealistic
Garment Assets    GarmentCode + Blender bake  MIT / GPL  Design parametric meshes
Catalog           FastAPI + MongoDB            MIT        Product DB + user sessions
Body Model        SMPL (commercial license)   Commercial Apply at MPI-IS
Deploy            Docker + NVIDIA container   —          Local GPU server
```

**Deliverable:**  Standalone desktop application. Customer stands in front of HD webcam and large display. Selects garment from catalog on touchscreen. Sees themselves with 3D garment overlaid in real-time. CatVTON async renders photorealistic preview they can photograph.

---

*Report generated: 2026-09-30 | M0 Research Phase — AI Smart Mirror Project*  
*Pose Estimation data verified from live GitHub. Segmentation data verified from live GitHub/HuggingFace. Remaining categories compiled from expert knowledge of published papers and repository documentation.*
