import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { delayRender, continueRender, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * ThreeEggScene (Cinematic Apex Edition)
 * True procedural 3D CGI Egg simulation for Remotion:
 * - Geometrically accurate parametric 3D Egg with metallic obsidian sheen
 * - Dynamic kintsugi glowing crack lattice that illuminates with increasing tension
 * - 72 procedural polygonal fracture shards with 3D physical shatter dynamics
 * - Inner Radiant Core (Solar/Plasma yolk) with pulsing corona and orbiting quantum rings
 * - Volumetric light rays emanating from the core
 * - Dynamic 3D cinematic camera choreography with focal depth and lighting sweeps
 */
export const ThreeEggScene: React.FC<{
  dropFrame?: number;
  bpm?: number;
}> = ({ dropFrame = 109, bpm = 132 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [handle] = useState(() => delayRender("Init Three.js WebGL"));

  const sceneContextRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    shards: {
      mesh: THREE.Mesh;
      basePos: THREE.Vector3;
      baseRot: THREE.Euler;
      velocity: THREE.Vector3;
      rotSpeed: THREE.Vector3;
    }[];
    solidEgg: THREE.Mesh;
    crackLattice: THREE.Mesh;
    coreMesh: THREE.Mesh;
    coreGlowMesh: THREE.Mesh;
    rings: THREE.Mesh[];
    lightBeams: THREE.Mesh[];
    particles: THREE.Points;
    particlePositions: Float32Array;
    innerLight: THREE.PointLight;
    keyLight: THREE.DirectionalLight;
    rimLight: THREE.DirectionalLight;
  } | null>(null);

  // Initialize Three.js scene once
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    // 1. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0a0e1a, 2.2);
    scene.add(ambientLight);

    // Warm golden key light
    const keyLight = new THREE.DirectionalLight(0xffb84d, 4.0);
    keyLight.position.set(6, 7, 7);
    scene.add(keyLight);

    // Cold electric cyan rim light
    const rimLight = new THREE.DirectionalLight(0x00f2fe, 5.0);
    rimLight.position.set(-7, -5, -6);
    scene.add(rimLight);

    // Interior core point light (radiates outward through cracks)
    const innerLight = new THREE.PointLight(0xff9900, 0, 30);
    innerLight.position.set(0, 0, 0);
    scene.add(innerLight);

    // 2. Parametric Egg Geometry Generator
    const createEggGeometry = (radius: number, segments: number) => {
      const geom = new THREE.SphereGeometry(radius, segments, segments);
      const pos = geom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);

        const normY = y / radius; // -1 to +1
        const taper = 1.0 - 0.25 * normY + 0.05 * (normY * normY);
        y *= 1.30; // Vertical elongation
        x *= taper;
        z *= taper;

        pos.setXYZ(i, x, y, z);
      }
      geom.computeVertexNormals();
      return geom;
    };

    // Solid intact egg mesh
    const solidEggGeom = createEggGeometry(1.65, 64);
    const eggMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x12131a, // Dark titanium/obsidian
      roughness: 0.15,
      metalness: 0.35,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95,
    });
    const solidEgg = new THREE.Mesh(solidEggGeom, eggMaterial);
    scene.add(solidEgg);

    // Glowing Kintsugi Crack Lattice (Overlay wireframe that illuminates before drop)
    const crackGeom = createEggGeometry(1.658, 36);
    const crackMat = new THREE.MeshBasicMaterial({
      color: 0xffbb00,
      wireframe: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const crackLattice = new THREE.Mesh(crackGeom, crackMat);
    scene.add(crackLattice);

    // 3. Procedural 3D Fracture Shards (72 pieces)
    const shards: {
      mesh: THREE.Mesh;
      basePos: THREE.Vector3;
      baseRot: THREE.Euler;
      velocity: THREE.Vector3;
      rotSpeed: THREE.Vector3;
    }[] = [];

    const shardCount = 72;
    for (let i = 0; i < shardCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / shardCount);
      const theta = Math.sqrt(shardCount * Math.PI) * phi;

      const normY = Math.cos(phi);
      const taper = 1.0 - 0.25 * normY + 0.05 * (normY * normY);
      const r = 1.65;

      const x = r * Math.sin(phi) * Math.cos(theta) * taper;
      const y = r * normY * 1.30;
      const z = r * Math.sin(phi) * Math.sin(theta) * taper;

      const center = new THREE.Vector3(x, y, z);
      const normal = center.clone().normalize();

      // Shard geometry with beveled thickness
      const shardRadius = 0.34 + Math.random() * 0.16;
      const shardGeom = new THREE.CylinderGeometry(shardRadius, shardRadius * 0.5, 0.15, 6);
      shardGeom.rotateX(Math.PI / 2);
      shardGeom.computeVertexNormals();

      const shardMat = new THREE.MeshPhysicalMaterial({
        color: 0x161824,
        roughness: 0.2,
        metalness: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      });

      const shardMesh = new THREE.Mesh(shardGeom, shardMat);
      shardMesh.position.copy(center);
      shardMesh.lookAt(center.clone().add(normal));

      const speed = 2.5 + Math.random() * 4.2;
      const spread = 1.2;
      const velocity = normal
        .clone()
        .multiplyScalar(speed)
        .add(new THREE.Vector3((Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread));

      const rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 7,
        (Math.random() - 0.5) * 7,
        (Math.random() - 0.5) * 7
      );

      shardMesh.visible = false;
      scene.add(shardMesh);

      shards.push({
        mesh: shardMesh,
        basePos: center.clone(),
        baseRot: shardMesh.rotation.clone(),
        velocity,
        rotSpeed,
      });
    }

    // 4. Inner Radiant Core (Molten Gold Solar Core)
    const coreGeom = new THREE.SphereGeometry(0.9, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMaterial);
    coreMesh.scale.set(0.001, 0.001, 0.001);
    scene.add(coreMesh);

    // Core outer plasma corona
    const glowGeom = new THREE.SphereGeometry(1.15, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      transparent: true,
      opacity: 0.5,
      wireframe: true,
      blending: THREE.AdditiveBlending,
    });
    const coreGlowMesh = new THREE.Mesh(glowGeom, glowMaterial);
    coreGlowMesh.scale.set(0.001, 0.001, 0.001);
    scene.add(coreGlowMesh);

    // 5. Orbiting Quantum Energy Rings
    const rings: THREE.Mesh[] = [];
    const ringColors = [0xffd700, 0x00f2fe, 0xff0055];
    for (let rIdx = 0; rIdx < 3; rIdx++) {
      const ringGeom = new THREE.TorusGeometry(1.5 + rIdx * 0.4, 0.024, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColors[rIdx],
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.visible = false;
      scene.add(ring);
      rings.push(ring);
    }

    // 6. Volumetric Light Beams emanating through shards
    const lightBeams: THREE.Mesh[] = [];
    for (let b = 0; b < 10; b++) {
      const beamGeom = new THREE.ConeGeometry(0.8, 12, 16, 1, true);
      beamGeom.translate(0, 6, 0);
      beamGeom.rotateX(Math.PI / 2);
      const beamMat = new THREE.MeshBasicMaterial({
        color: b % 2 === 0 ? 0xffb700 : 0x00f2fe,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const beam = new THREE.Mesh(beamGeom, beamMat);
      beam.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
      beam.visible = false;
      scene.add(beam);
      lightBeams.push(beam);
    }

    // 7. 3D Floating Particle Embers
    const particleCount = 350;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount; p++) {
      particlePositions[p * 3] = (Math.random() - 0.5) * 10;
      particlePositions[p * 3 + 1] = (Math.random() - 0.5) * 10;
      particlePositions[p * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffb84d,
      size: 0.065,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    sceneContextRef.current = {
      renderer,
      scene,
      camera,
      shards,
      solidEgg,
      crackLattice,
      coreMesh,
      coreGlowMesh,
      rings,
      lightBeams,
      particles,
      particlePositions,
      innerLight,
      keyLight,
      rimLight,
    };

    continueRender(handle);

    return () => {
      renderer.dispose();
    };
  }, [width, height, handle]);

  // Frame update logic
  useEffect(() => {
    const ctx = sceneContextRef.current;
    if (!ctx) return;

    const {
      renderer,
      scene,
      camera,
      shards,
      solidEgg,
      crackLattice,
      coreMesh,
      coreGlowMesh,
      rings,
      lightBeams,
      particles,
      particlePositions,
      innerLight,
      keyLight,
      rimLight,
    } = ctx;

    const t = frame / fps;
    const isDropped = frame >= dropFrame;
    const framesPerBeat = (60 / bpm) * fps;

    // 1. Camera Dynamic 3D Choreography
    if (frame < 55) {
      // Act 1: Majestic Slow 3D Push-in
      const progress = frame / 55;
      const camDist = 8.5 - progress * 2.2;
      const camAngle = progress * 0.45;
      camera.position.set(Math.sin(camAngle) * camDist, 0.4 - progress * 0.2, Math.cos(camAngle) * camDist);
      camera.lookAt(0, 0, 0);
      camera.fov = 40;
    } else if (frame < dropFrame) {
      // Act 2: Extreme Tension Macro Close-up & Stress Vibration
      const stressProg = (frame - 55) / (dropFrame - 55);
      const camDist = 6.3 - stressProg * 2.5;
      const angle = 0.45 + stressProg * 0.9;
      const jitter = stressProg > 0.5 ? Math.sin(frame * 16) * 0.04 * stressProg : 0;
      camera.position.set(Math.sin(angle) * camDist + jitter, -0.2 + stressProg * 0.5, Math.cos(angle) * camDist);
      camera.lookAt(0, 0.1, 0);
      camera.fov = 40 + stressProg * 7;
    } else {
      // Act 3: Exploding Bullet-Time 3D Orbit
      const dropTime = (frame - dropFrame) / fps;
      const orbitSpeed = 1.35;
      const orbitDist = 5.0 + Math.sin(dropTime * 1.6) * 0.7;
      const camX = Math.sin(dropTime * orbitSpeed + 1.2) * orbitDist;
      const camZ = Math.cos(dropTime * orbitSpeed + 1.2) * orbitDist;
      const camY = Math.sin(dropTime * 2.2) * 0.5 + 0.1;

      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, 0, 0);

      // Bass Kick FOV Punch
      const kickDist = (frame - dropFrame) % framesPerBeat;
      const kickPunch = Math.max(0, 1 - kickDist / 8);
      camera.fov = 44 + kickPunch * 8;
    }
    camera.updateProjectionMatrix();

    // 2. Light Orbit
    keyLight.position.x = 6 * Math.cos(t * 0.7);
    keyLight.position.z = 7 * Math.sin(t * 0.7);

    // 3. Egg Metamorphosis: Solid vs Shards
    if (!isDropped) {
      solidEgg.visible = true;
      crackLattice.visible = true;
      shards.forEach((s) => (s.mesh.visible = false));
      rings.forEach((r) => (r.visible = false));
      lightBeams.forEach((b) => (b.visible = false));
      coreMesh.scale.set(0.001, 0.001, 0.001);
      coreGlowMesh.scale.set(0.001, 0.001, 0.001);

      // Smooth rotation
      solidEgg.rotation.y = t * 0.5;
      solidEgg.rotation.x = Math.sin(t * 0.7) * 0.12;
      crackLattice.rotation.copy(solidEgg.rotation);

      // Cracking tension glow (frames 60 to dropFrame)
      if (frame >= 60) {
        const crackProgress = (frame - 60) / (dropFrame - 60);
        innerLight.intensity = Math.pow(crackProgress, 2) * 35;
        (crackLattice.material as THREE.MeshBasicMaterial).opacity = Math.pow(crackProgress, 1.5) * 0.85;

        // Severe stress vibration
        const vib = Math.sin(frame * 30) * 0.035 * crackProgress;
        solidEgg.position.set(vib, vib * 0.5, vib);
        crackLattice.position.copy(solidEgg.position);
      } else {
        innerLight.intensity = 0;
        (crackLattice.material as THREE.MeshBasicMaterial).opacity = 0;
        solidEgg.position.set(0, 0, 0);
        crackLattice.position.set(0, 0, 0);
      }
    } else {
      // SHATTERED EXPLODING 3D SHARDS MODE
      solidEgg.visible = false;
      crackLattice.visible = false;
      const elapsedDrop = (frame - dropFrame) / fps;

      innerLight.intensity = 55 + Math.sin(frame * 12) * 15;

      // Expand inner radiant core
      const coreScale = Math.min(1.0, elapsedDrop * 4.0);
      const corePulse = 1.0 + Math.sin(frame * 0.35) * 0.08;
      coreMesh.scale.set(coreScale * corePulse, coreScale * corePulse, coreScale * corePulse);
      coreGlowMesh.scale.set(coreScale * corePulse * 1.3, coreScale * corePulse * 1.3, coreScale * corePulse * 1.3);
      coreGlowMesh.rotation.y = t * 2.0;
      coreGlowMesh.rotation.x = t * 1.5;

      // Shard Physics Simulation (Bullet-time outward dispersion + drag)
      const dragFactor = 1 - Math.exp(-elapsedDrop * 1.6);
      shards.forEach((shard) => {
        shard.mesh.visible = true;

        const offset = shard.velocity.clone().multiplyScalar(dragFactor * 1.5);
        shard.mesh.position.copy(shard.basePos).add(offset);

        shard.mesh.rotation.x = shard.baseRot.x + shard.rotSpeed.x * elapsedDrop;
        shard.mesh.rotation.y = shard.baseRot.y + shard.rotSpeed.y * elapsedDrop;
        shard.mesh.rotation.z = shard.baseRot.z + shard.rotSpeed.z * elapsedDrop;
      });

      // Quantum Rings Orbiting the Core
      rings.forEach((ring, rIdx) => {
        ring.visible = true;
        const ringScale = Math.min(1.0, elapsedDrop * 3.2);
        ring.scale.set(ringScale, ringScale, ringScale);
        ring.rotation.x = t * (1.4 + rIdx * 0.6);
        ring.rotation.y = t * (0.9 + rIdx * 0.7);
        ring.rotation.z = t * (0.6 + rIdx * 0.5);
      });

      // Volumetric Light Beams
      lightBeams.forEach((beam, bIdx) => {
        beam.visible = true;
        beam.rotation.x += 0.005 * (bIdx % 2 === 0 ? 1 : -1);
        beam.rotation.y += 0.008;
      });
    }

    // 4. 3D Particle Embers Dynamics
    const pPos = particles.geometry.attributes.position as THREE.BufferAttribute;
    const count = particlePositions.length / 3;
    for (let p = 0; p < count; p++) {
      const pIdx = p * 3;
      let px = particlePositions[pIdx];
      let py = particlePositions[pIdx + 1];
      let pz = particlePositions[pIdx + 2];

      const angle = isDropped ? 0.03 : 0.009;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const newX = px * cosA - pz * sinA;
      const newZ = px * sinA + pz * cosA;

      py += 0.02;
      if (py > 5) py = -5;

      particlePositions[pIdx] = newX;
      particlePositions[pIdx + 1] = py;
      particlePositions[pIdx + 2] = newZ;
    }
    pPos.needsUpdate = true;

    // Render 3D Frame
    renderer.render(scene, camera);
  }, [frame, fps, dropFrame, bpm]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
};
