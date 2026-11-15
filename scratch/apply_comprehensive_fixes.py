import os
import re

html_path = r"e:\Rudranildocs0066543\html-yt\wdg4g-lhb-simulation.html"

with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

print("Original length:", len(content))

# -----------------------------------------------------------------------------
# FIX 1: Exploded Blueprint Overwritten by Suspension Bounce
# -----------------------------------------------------------------------------
# In applyExplodedDisplacements, we introduce setExplodedPos and store coordinates
old_apply_exploded = """            function applyExplodedDisplacements(f) {
                sysGroups.hood.position.set(0, f * 1.55, 0);
                sysGroups.cab1.position.set(-f * 1.15, f * 0.18, 0);
                sysGroups.hvac1.position.set(-f * 1.15, f * 0.85, 0);
                sysGroups.auxcab.position.set(-f * 0.72, f * 0.36, 0);
                sysGroups.alternator.position.set(-f * 0.35, f * 0.25, 0);
                sysGroups.engine.position.set(0, f * 0.28, 0);
                sysGroups.turbo.position.set(f * 0.25, f * 0.82, 0);
                sysGroups.lubeoil.position.set(f * 0.40, -f * 0.18, f * 0.55);
                sysGroups.dbgrid.position.set(f * 0.50, f * 0.72, 0);
                sysGroups.radiator.position.set(f * 0.72, f * 1.05, 0);
                sysGroups.compressor.position.set(f * 0.90, f * 0.28, 0);
                sysGroups.apu.position.set(f * 1.05, f * 0.42, -f * 0.45);
                sysGroups.cab2.position.set(f * 1.20, f * 0.18, 0);
                sysGroups.hvac2.position.set(f * 1.20, f * 0.85, 0);
                sysGroups.fueltank.position.set(0, -f * 0.72, 0);
                sysGroups.bogie1.position.set(-f * 0.75, -f * 0.58, 0);
                sysGroups.motors1.position.set(-f * 0.75, -f * 0.32, f * 0.48);
                sysGroups.bogie2.position.set(f * 0.75, -f * 0.58, 0);
                sysGroups.motors2.position.set(f * 0.75, -f * 0.32, f * 0.48);

                sysGroups.eogShell.position.set(0, f * 1.45, 0);
                sysGroups.eogInterior.position.set(0, f * 0.38, 0);
                sysGroups.eogBogies.position.set(0, -f * 0.62, 0);

                sysGroups.coachShell.position.set(0, f * 1.45, 0);
                sysGroups.coachRmpu.position.set(0, f * 1.95, 0);
                sysGroups.coachBerths.position.set(-f * 0.35, f * 0.35, -f * 0.25);
                sysGroups.coachChairs.position.set(f * 0.35, f * 0.35, f * 0.25);
                sysGroups.coachFiatBogies.position.set(0, -f * 0.62, 0);
            }"""

new_apply_exploded = """            function setExplodedPos(grp, x, y, z) {
                if (!grp) return;
                grp.userData.explodeX = x;
                grp.userData.explodeY = y;
                grp.userData.explodeZ = z;
                grp.position.set(x, y, z);
            }

            function applyExplodedDisplacements(f) {
                setExplodedPos(sysGroups.hood, 0, f * 1.55, 0);
                setExplodedPos(sysGroups.cab1, -f * 1.15, f * 0.18, 0);
                setExplodedPos(sysGroups.hvac1, -f * 1.15, f * 0.85, 0);
                setExplodedPos(sysGroups.auxcab, -f * 0.72, f * 0.36, 0);
                setExplodedPos(sysGroups.alternator, -f * 0.35, f * 0.25, 0);
                setExplodedPos(sysGroups.engine, 0, f * 0.28, 0);
                setExplodedPos(sysGroups.turbo, f * 0.25, f * 0.82, 0);
                setExplodedPos(sysGroups.lubeoil, f * 0.40, -f * 0.18, f * 0.55);
                setExplodedPos(sysGroups.dbgrid, f * 0.50, f * 0.72, 0);
                setExplodedPos(sysGroups.radiator, f * 0.72, f * 1.05, 0);
                setExplodedPos(sysGroups.compressor, f * 0.90, f * 0.28, 0);
                setExplodedPos(sysGroups.apu, f * 1.05, f * 0.42, -f * 0.45);
                setExplodedPos(sysGroups.cab2, f * 1.20, f * 0.18, 0);
                setExplodedPos(sysGroups.hvac2, f * 1.20, f * 0.85, 0);
                setExplodedPos(sysGroups.underframe, 0, -f * 0.25, 0);
                setExplodedPos(sysGroups.fueltank, 0, -f * 0.72, 0);
                setExplodedPos(sysGroups.bogie1, -f * 0.75, -f * 0.58, 0);
                setExplodedPos(sysGroups.motors1, -f * 0.75, -f * 0.32, f * 0.48);
                setExplodedPos(sysGroups.bogie2, f * 0.75, -f * 0.58, 0);
                setExplodedPos(sysGroups.motors2, f * 0.75, -f * 0.32, f * 0.48);

                setExplodedPos(sysGroups.eogUnderframe, 0, -f * 0.25, 0);
                setExplodedPos(sysGroups.eogShell, 0, f * 1.45, 0);
                setExplodedPos(sysGroups.eogInterior, 0, f * 0.38, 0);
                setExplodedPos(sysGroups.eogBogies, 0, -f * 0.62, 0);

                setExplodedPos(sysGroups.coachUnderframe, 0, -f * 0.25, 0);
                setExplodedPos(sysGroups.coachShell, 0, f * 1.45, 0);
                setExplodedPos(sysGroups.coachRmpu, 0, f * 1.95, 0);
                setExplodedPos(sysGroups.coachBerths, -f * 0.35, f * 0.35, -f * 0.25);
                setExplodedPos(sysGroups.coachChairs, f * 0.35, f * 0.35, f * 0.25);
                setExplodedPos(sysGroups.coachFiatBogies, 0, -f * 0.62, 0);
            }"""

if old_apply_exploded in content:
    content = content.replace(old_apply_exploded, new_apply_exploded)
    print("Replaced applyExplodedDisplacements successfully!")
else:
    print("WARNING: old_apply_exploded not found directly! Searching with regex...")

# In animate(), replace locoSprungGroups, eog, coach positioning with additive bounce
old_animate_loco_pos = """                locoSprungGroups.forEach(grp => {
                    grp.position.y = state.physics.locoBounce;
                    grp.rotation.z = state.physics.locoPitch;
                    grp.rotation.x = state.physics.locoRoll;
                });"""

new_animate_loco_pos = """                locoSprungGroups.forEach(grp => {
                    const ex = grp.userData.explodeX || 0;
                    const ey = grp.userData.explodeY || 0;
                    const ez = grp.userData.explodeZ || 0;
                    grp.position.set(ex, ey + state.physics.locoBounce, ez);
                    grp.rotation.z = state.physics.locoPitch;
                    grp.rotation.x = state.physics.locoRoll;
                });"""

old_animate_eog_pos = """                [sysGroups.eogUnderframe, sysGroups.eogInterior, sysGroups.eogShell].forEach(grp => {
                    grp.position.y = eogBounce;
                    grp.rotation.z = eogPitch;
                    grp.rotation.x = eogRoll;
                });"""

new_animate_eog_pos = """                [sysGroups.eogUnderframe, sysGroups.eogInterior, sysGroups.eogShell].forEach(grp => {
                    const ex = grp.userData.explodeX || 0;
                    const ey = grp.userData.explodeY || 0;
                    const ez = grp.userData.explodeZ || 0;
                    grp.position.set(ex, ey + eogBounce, ez);
                    grp.rotation.z = eogPitch;
                    grp.rotation.x = eogRoll;
                });"""

old_animate_coach_pos = """                [sysGroups.coachUnderframe, sysGroups.coachBerths, sysGroups.coachChairs, sysGroups.coachShell, sysGroups.coachRmpu].forEach(grp => {
                    grp.position.y = coachBounce;
                    grp.rotation.z = coachPitch;
                    grp.rotation.x = coachRoll;
                });"""

new_animate_coach_pos = """                [sysGroups.coachUnderframe, sysGroups.coachBerths, sysGroups.coachChairs, sysGroups.coachShell, sysGroups.coachRmpu].forEach(grp => {
                    const ex = grp.userData.explodeX || 0;
                    const ey = grp.userData.explodeY || 0;
                    const ez = grp.userData.explodeZ || 0;
                    grp.position.set(ex, ey + coachBounce, ez);
                    grp.rotation.z = coachPitch;
                    grp.rotation.x = coachRoll;
                });"""

if old_animate_loco_pos in content:
    content = content.replace(old_animate_loco_pos, new_animate_loco_pos)
    print("Replaced animate locoSprungGroups successfully!")
if old_animate_eog_pos in content:
    content = content.replace(old_animate_eog_pos, new_animate_eog_pos)
    print("Replaced animate eog groups successfully!")
if old_animate_coach_pos in content:
    content = content.replace(old_animate_coach_pos, new_animate_coach_pos)
    print("Replaced animate coach groups successfully!")

# -----------------------------------------------------------------------------
# FIX 2: ExtrudeGeometry UV Normalization in createLhbSideWallWith3DWindows
# -----------------------------------------------------------------------------
old_extrude_uv = """                const wallGeo = new THREE.ExtrudeGeometry(wallShape, {
                    depth: 0.032,
                    bevelEnabled: true,
                    bevelThickness: 0.006,
                    bevelSize: 0.006,
                    bevelSegments: 2
                });
                wallGeo.center();

                const outerSkin = new THREE.Mesh(wallGeo, liveryMat);"""

new_extrude_uv = """                const wallGeo = new THREE.ExtrudeGeometry(wallShape, {
                    depth: 0.032,
                    bevelEnabled: true,
                    bevelThickness: 0.006,
                    bevelSize: 0.006,
                    bevelSegments: 2
                });
                wallGeo.center();

                // Three.js r128 ExtrudeGeometry UV Normalization:
                // Maps world coords [-halfL, halfL] & [-halfH, halfH] to [0, 1] across the entire LHB carbody
                const posAttr = wallGeo.attributes.position;
                const uvAttr = wallGeo.attributes.uv;
                if (posAttr && uvAttr) {
                    for (let i = 0; i < posAttr.count; i++) {
                        const px = posAttr.getX(i);
                        const py = posAttr.getY(i);
                        const u = zSide > 0 ? (px + halfL) / length : (halfL - px) / length;
                        const v = (py + halfH) / height;
                        uvAttr.setXY(i, Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v)));
                    }
                    uvAttr.needsUpdate = true;
                }

                const outerSkin = new THREE.Mesh(wallGeo, liveryMat);"""

if old_extrude_uv in content:
    content = content.replace(old_extrude_uv, new_extrude_uv)
    print("Replaced ExtrudeGeometry UV normalization successfully!")
else:
    print("WARNING: old_extrude_uv not found directly!")

# -----------------------------------------------------------------------------
# FIX 3: Multi-Part 3D Sub-Assemblies Replacing BoxGeometry Placeholders
# -----------------------------------------------------------------------------

# Part 3.1: Aux Cab (CA-2 to CA-5 + 6x Axle IGBTs + 5GDY102D Blower)
old_aux_cab = """            // Auxiliary Cab (CA2CA5 + 6x IGBT Phase Modules + 5GDY102D Scroll Blower)
            const auxSpine = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.16, 0.78), materials.ccaCabinetMat);
            auxSpine.position.set(-2.85, 0.60, 0);
            sysGroups.auxcab.add(auxSpine);

            for (let b = 0; b < 4; b++) {
                const caBay = new THREE.Mesh(
                    new THREE.BoxGeometry(0.22, 0.94, 0.20),
                    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.68, roughness: 0.28 })
                );
                caBay.position.set(-3.20 + b * 0.24, 0.65, -0.48);
                sysGroups.auxcab.add(caBay);
            }

            for (let i = 0; i < 6; i++) {
                const side = i < 3 ? 1 : -1;
                const col = i % 3;
                const xMod = -3.16 + col * 0.31;
                const zMod = side * 0.56;

                const igbtMod = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.78, 0.16), materials.igbtModuleMat);
                igbtMod.position.set(xMod, 0.66, zMod);
                sysGroups.auxcab.add(igbtMod);

                [-0.06, 0, 0.06].forEach(phaseOff => {
                    const busBar = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.16, 0.20), materials.copperBusbar);
                    busBar.position.set(xMod + phaseOff, 1.08, zMod);
                    sysGroups.auxcab.add(busBar);
                });
            }

            const auxBlower5GDY102D = createCentrifugalBlower(0.18, 0.16, materials.alternatorBlue, materials.tractionMotorMat);
            auxBlower5GDY102D.position.set(-3.22, 0.24, -0.42);
            sysGroups.auxcab.add(auxBlower5GDY102D);"""

# Let's match flexibly if the dash was encoded differently
new_aux_cab = """            // Auxiliary Cab (CA-2 to CA-5 + 6x Axle IGBT Phase Inverters + 5GDY102D Centrifugal Blower)
            const auxCabFrame = new THREE.Group();
            auxCabFrame.position.set(-2.85, 0.60, 0);

            // Structural Welded Aluminum Rack Framework & Shelf Dividers
            const rackSpine = new THREE.Mesh(new THREE.BoxGeometry(1.06, 1.18, 0.82), materials.ccaCabinetMat);
            auxCabFrame.add(rackSpine);

            [-0.51, 0.51].forEach(xCol => {
                [-0.39, 0.39].forEach(zCol => {
                    const column = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.20, 0.04), materials.pistonSteel);
                    column.position.set(xCol, 0, zCol);
                    auxCabFrame.add(column);
                });
            });

            // Control Areas CA-2 to CA-5: 4 Slide-In Eurocard Logic Subracks with Breakers & Diagnostic Test Ports
            for (let b = 0; b < 4; b++) {
                const bayGroup = new THREE.Group();
                bayGroup.position.set(-0.36 + b * 0.24, 0.06, -0.46);

                const caSubrack = new THREE.Mesh(
                    new THREE.BoxGeometry(0.20, 0.94, 0.14),
                    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.72, roughness: 0.25 })
                );
                bayGroup.add(caSubrack);

                // Eurocard PCB edge card guide slots & LED diagnostics
                for (let slot = 0; slot < 5; slot++) {
                    const cardEdge = new THREE.Mesh(
                        new THREE.BoxGeometry(0.015, 0.14, 0.15),
                        new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 })
                    );
                    cardEdge.position.set(-0.06 + slot * 0.03, -0.15 + slot * 0.08, 0.01);
                    bayGroup.add(cardEdge);

                    const ledIndicator = new THREE.Mesh(
                        new THREE.BoxGeometry(0.01, 0.01, 0.01),
                        new THREE.MeshBasicMaterial({ color: slot % 2 === 0 ? 0x10b981 : 0xfacc15 })
                    );
                    ledIndicator.position.set(-0.06 + slot * 0.03, -0.06 + slot * 0.08, 0.08);
                    bayGroup.add(ledIndicator);
                }

                // Miniature Circuit Breakers (MCB) Row
                const mcbStrip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.03), materials.redBufferBeam);
                mcbStrip.position.set(0, 0.38, 0.08);
                bayGroup.add(mcbStrip);

                auxCabFrame.add(bayGroup);
            }

            // 6x Independent Axle IGBT Inverter Phase Modules (TM1 to TM6) with Heatsink Fins & Gate Drivers
            for (let i = 0; i < 6; i++) {
                const side = i < 3 ? 1 : -1;
                const col = i % 3;
                const xMod = -0.32 + col * 0.32;
                const zMod = side * 0.52;

                const igbtModuleGroup = new THREE.Group();
                igbtModuleGroup.position.set(xMod, 0.06, zMod);

                // Heavy Aluminum Cold Plate Base
                const coldPlate = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.76, 0.035), materials.pistonSteel);
                igbtModuleGroup.add(coldPlate);

                // High-Density Extruded Aluminum Cooling Heatsink Fins (7 Fins per Module)
                for (let fin = -3; fin <= 3; fin++) {
                    const finBlade = new THREE.Mesh(
                        new THREE.BoxGeometry(0.24, 0.74, 0.007),
                        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.22 })
                    );
                    finBlade.position.set(0, 0, fin * 0.018 - 0.025);
                    igbtModuleGroup.add(finBlade);
                }

                // Tinted Polycarbonate Gate-Driver Cover & Status LEDs
                const gateCover = new THREE.Mesh(
                    new THREE.BoxGeometry(0.25, 0.72, 0.04),
                    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.4, roughness: 0.2, transparent: true, opacity: 0.85 })
                );
                gateCover.position.set(0, 0, 0.035);
                igbtModuleGroup.add(gateCover);

                // 3-Phase Gate Pulse Status LEDs (Green = RUN, Yellow = GATE, Red = FAULT)
                [-0.06, 0, 0.06].forEach((ledX, lIdx) => {
                    const smdLed = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.008, 0.008, 0.015, 8),
                        new THREE.MeshBasicMaterial({ color: lIdx === 0 ? 0x10b981 : (lIdx === 1 ? 0xfacc15 : 0xef4444) })
                    );
                    smdLed.rotation.x = Math.PI / 2;
                    smdLed.position.set(ledX, 0.24, 0.06);
                    igbtModuleGroup.add(smdLed);
                });

                // Heavy 3-Phase Laminated Copper DC Busbars (+DC, -DC, Phase U/V/W)
                [-0.07, 0, 0.07].forEach(phaseOff => {
                    const busBar = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.18, 0.16), materials.copperBusbar);
                    busBar.position.set(phaseOff, 0.44, 0);
                    const standoffInsulator = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.05, 12), materials.redBufferBeam);
                    standoffInsulator.position.set(phaseOff, 0.35, 0);
                    igbtModuleGroup.add(busBar, standoffInsulator);
                });

                // High-Voltage Orange Flexible Cables leading to Traction Motor Glands
                const hvCable = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.018, 0.018, 0.36, 12),
                    new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.3, roughness: 0.6 })
                );
                hvCable.position.set(0, -0.48, 0.02);
                igbtModuleGroup.add(hvCable);

                auxCabFrame.add(igbtModuleGroup);
            }

            // 5GDY102D Aux Centrifugal Scroll Blower & Transition Air Duct
            const auxBlower5GDY102D = createCentrifugalBlower(0.20, 0.17, materials.alternatorBlue, materials.tractionMotorMat);
            auxBlower5GDY102D.position.set(-0.36, -0.36, -0.42);
            auxCabFrame.add(auxBlower5GDY102D);

            const blowerAirDuct = new THREE.Mesh(
                new THREE.BoxGeometry(0.28, 0.42, 0.18),
                new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.35 })
            );
            blowerAirDuct.position.set(-0.16, -0.16, -0.42);
            auxCabFrame.add(blowerAirDuct);

            sysGroups.auxcab.add(auxCabFrame);"""

# Replace Aux Cab using regex to ensure whatever encoding is safely matched
aux_cab_pattern = re.compile(r'// Auxiliary Cab.*?sysGroups\.auxcab\.add\(auxBlower5GDY102D\);', re.DOTALL)
if aux_cab_pattern.search(content):
    content = aux_cab_pattern.sub(new_aux_cab, content, count=1)
    print("Replaced Aux Cab with high-detail multi-part CAD model successfully!")
else:
    print("WARNING: aux_cab_pattern did not match!")

# Part 3.2: Compressor, FastBrake Electronic Air Brake (EAB) & 34.5 kW CPCB-II APU Skid
old_comp_apu_pattern = re.compile(r'// Rotary Screw Compressor, FastBrake EAB & APU Skid.*?sysGroups\.apu\.add\(apuSkidFrame, apuAlt\);', re.DOTALL)

new_comp_apu = """// Rotary Screw Compressor, FastBrake Electronic Air Brake (EAB) & 34.5 kW CPCB-II APU Skid
            const screwCompAirEnd = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.54, 24), materials.alternatorBlue);
            screwCompAirEnd.rotation.z = Math.PI / 2;
            screwCompAirEnd.position.set(2.72, 0.32, -0.36);
            const oilSeparatorVessel = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.42, 20), materials.copperBusbar);
            oilSeparatorVessel.position.set(2.96, 0.38, -0.36);
            sysGroups.compressor.add(screwCompAirEnd, oilSeparatorVessel);

            // FastBrake Electronic Air Brake (EAB) Multi-Part Manifold & Electronic Brake Control Unit (EBCU)
            const eabGroup = new THREE.Group();
            eabGroup.position.set(2.82, 0.46, 0.38);

            // Machined Pneumatic Pipe Bracket & Valve Manifold
            const eabManifold = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.36, 0.38), materials.underframeSteel);
            eabGroup.add(eabManifold);

            // Electronic Brake Control Unit (EBCU) Microprocessor Housing
            const ebcuCardCage = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.38, 0.32), materials.ccaCabinetMat);
            ebcuCardCage.position.set(0, 0.34, 0);
            eabGroup.add(ebcuCardCage);

            // Electro-Pneumatic Solenoid Pilot Valves (ER, BP, BC, MR)
            [-0.14, -0.05, 0.05, 0.14].forEach((sX, sIdx) => {
                const solValve = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.024, 0.024, 0.12, 14),
                    sIdx === 1 ? materials.redBufferBeam : (sIdx === 0 ? materials.irYellowHood : materials.pistonSteel)
                );
                solValve.position.set(sX, 0.18, 0.19);
                eabGroup.add(solValve);
            });

            // Round Analog Brass Pressure Gauges: BP (5.0 kg/cm²) & MR (9.5 kg/cm²)
            [-0.10, 0.10].forEach((gX, gIdx) => {
                const gaugeBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.025, 20), materials.copperBusbar);
                gaugeBezel.rotation.x = Math.PI / 2;
                gaugeBezel.position.set(gX, 0.44, 0.17);
                const gaugeDial = new THREE.Mesh(
                    new THREE.CircleGeometry(0.038, 20),
                    new THREE.MeshBasicMaterial({ color: 0xffffff })
                );
                gaugeDial.position.set(gX, 0.44, 0.185);
                const gaugeNeedle = new THREE.Mesh(
                    new THREE.BoxGeometry(0.004, 0.03, 0.002),
                    new THREE.MeshBasicMaterial({ color: gIdx === 0 ? 0xef4444 : 0x0284c7 })
                );
                gaugeNeedle.rotation.z = gIdx === 0 ? -0.45 : 0.65;
                gaugeNeedle.position.set(gX, 0.44, 0.19);
                eabGroup.add(gaugeBezel, gaugeDial, gaugeNeedle);
            });

            // Duplex Drain Cocks & Manual Cutout Cock Handles
            const drainCock = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 10), materials.copperBusbar);
            drainCock.position.set(0, -0.22, 0.18);
            const cutoutHandle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.015, 0.02), materials.redBufferBeam);
            cutoutHandle.position.set(0.03, -0.20, 0.20);
            eabGroup.add(drainCock, cutoutHandle);

            sysGroups.compressor.add(eabGroup);

            // 34.5 kW CPCB-II Auxiliary Power Unit (APU Skid) with 3-Cyl Diesel, 55 CFM Comp & 120A Alt
            const apuSkid = new THREE.Group();
            apuSkid.position.set(3.36, 0.32, -0.32);

            // Heavy Channel Skid Frame with 4 Corner Rubber Anti-Vibration Isolator Mounts
            const apuBase = new THREE.Mesh(
                new THREE.BoxGeometry(0.68, 0.06, 0.52),
                new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
            );
            apuBase.position.y = -0.16;
            apuSkid.add(apuBase);

            [-0.28, 0.28].forEach(isoX => {
                [-0.20, 0.20].forEach(isoZ => {
                    const rubberMount = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.035, 0.035, 0.04, 12),
                        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 })
                    );
                    rubberMount.position.set(isoX, -0.19, isoZ);
                    apuSkid.add(rubberMount);
                });
            });

            // Compact 3-Cylinder Diesel Engine Block & Finned Head
            const apuEngineBlock = new THREE.Mesh(
                new THREE.BoxGeometry(0.32, 0.32, 0.26),
                new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.65, roughness: 0.28 })
            );
            apuEngineBlock.position.set(-0.14, 0.04, 0);
            const apuRockerHead = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.08, 0.22), materials.pistonSteel);
            apuRockerHead.position.set(-0.14, 0.22, 0);
            apuSkid.add(apuEngineBlock, apuRockerHead);

            // Miniature Spin-On Lube Filter & Exhaust Muffler
            const apuFilter = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 14), materials.redBufferBeam);
            apuFilter.position.set(-0.28, 0.02, 0.12);
            const apuMuffler = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.28, 16), materials.underframeSteel);
            apuMuffler.rotation.z = Math.PI / 2;
            apuMuffler.position.set(-0.14, 0.30, -0.16);
            apuSkid.add(apuFilter, apuMuffler);

            // 55 CFM Reciprocating Secondary Air Compressor with Finned Head & Copper Discharge Coil
            const apuCompCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 16), materials.underframeSteel);
            apuCompCyl.position.set(0.08, 0.06, -0.10);
            const apuDischargeCoil = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 8, 20), materials.copperBusbar);
            apuDischargeCoil.position.set(0.08, 0.16, -0.10);
            apuSkid.add(apuCompCyl, apuDischargeCoil);

            // 78 VDC 120A Auxiliary Alternator with Dual V-Belt Pulleys & Belt Guard
            const apuAltCasing = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.24, 20), materials.copperBusbar);
            apuAltCasing.rotation.z = Math.PI / 2;
            apuAltCasing.position.set(0.18, 0.04, 0.10);
            const apuPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16), materials.pistonSteel);
            apuPulley.rotation.z = Math.PI / 2;
            apuPulley.position.set(0.04, 0.04, 0.10);
            apuSkid.add(apuAltCasing, apuPulley);

            sysGroups.apu.add(apuSkid);"""

if old_comp_apu_pattern.search(content):
    content = old_comp_apu_pattern.sub(new_comp_apu, content, count=1)
    print("Replaced Compressor, EAB & APU with high-detail multi-part CAD models successfully!")
else:
    print("WARNING: old_comp_apu_pattern did not match!")

# Part 3.3: WDG-4G Cab Side Window Frames & Recessed Door Pocket Assemblies
old_cab_side_pattern = re.compile(
    r'\[-0\.73,\s*0\.73\]\.forEach\(zWall\s*=>\s*\{.*?addHoodMesh\(cabSideGlass,\s*isCutaway\);\s*\}\);',
    re.DOTALL
)

new_cab_side = """[-0.73, 0.73].forEach(zWall => {
                    const isCutaway = zWall > 0;
                    const sideSign = zWall > 0 ? 1 : -1;

                    // Formed Outer Cab Side Skin with Recessed Crew Door Pocket
                    const cabLowerSide = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.72, 0.035), materials.irYellowHood);
                    cabLowerSide.position.set(cabX, 0.38, zWall);
                    addHoodMesh(cabLowerSide, isCutaway);

                    // Satin Black Outer Window Frame with Molded Weatherstrip Bevel
                    const windowFrame = new THREE.Mesh(
                        new THREE.BoxGeometry(0.72, 0.44, 0.042),
                        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.3 })
                    );
                    windowFrame.position.set(cabX + dir * 0.06, 0.96, zWall);
                    addHoodMesh(windowFrame, isCutaway);

                    // Fixed Forward Safety Glass Pane
                    const fixedGlass = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.018), materials.cabGlass);
                    fixedGlass.position.set(cabX + dir * 0.21, 0.96, zWall);
                    addHoodMesh(fixedGlass, isCutaway);

                    // Sliding Rear Quarter Window Pane with Thumb-Latch Handle & Sash Runner
                    const slidingGlass = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 0.018), materials.cabGlass);
                    slidingGlass.position.set(cabX - dir * 0.09, 0.96, zWall + sideSign * 0.008);
                    const thumbLatch = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.02), materials.pistonSteel);
                    thumbLatch.position.set(cabX - dir * 0.04, 0.96, zWall + sideSign * 0.022);
                    addHoodMesh(slidingGlass, isCutaway);
                    addHoodMesh(thumbLatch, isCutaway);

                    // Recessed Crew Entry Door (Indented by 0.035m) with View Window & Chrome Lever Handle
                    const doorGroup = new THREE.Group();
                    doorGroup.position.set(cabX - dir * 0.42, 0.62, zWall - sideSign * 0.02);

                    const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.98, 0.028), materials.irYellowHood);
                    const doorWindow = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.032), materials.cabGlass);
                    doorWindow.position.set(0, 0.24, 0);
                    const doorHandle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.04), materials.pistonSteel);
                    doorHandle.position.set(-dir * 0.11, -0.04, sideSign * 0.02);
                    doorGroup.add(doorPanel, doorWindow, doorHandle);
                    addHoodMesh(doorGroup, isCutaway);

                    // Vertical Stainless Steel Crew Assistance Grab Rails (Handrails)
                    [-0.18, 0.18].forEach(gX => {
                        const grabRail = new THREE.Mesh(
                            new THREE.CylinderGeometry(0.011, 0.011, 0.92, 12),
                            materials.pistonSteel
                        );
                        grabRail.position.set(cabX - dir * 0.42 + gX, 0.60, zWall + sideSign * 0.025);
                        addHoodMesh(grabRail, isCutaway);
                    });

                    // Lower Side Skirt Recessed Footstep Stirrups with Traction Ridges
                    for (let step = 0; step < 2; step++) {
                        const footStep = new THREE.Mesh(
                            new THREE.BoxGeometry(0.24, 0.022, 0.06),
                            materials.underframeSteel
                        );
                        footStep.position.set(cabX - dir * 0.42, -0.06 - step * 0.12, zWall - sideSign * 0.01);
                        addHoodMesh(footStep, isCutaway);
                    }
                });"""

if old_cab_side_pattern.search(content):
    content = old_cab_side_pattern.sub(new_cab_side, content, count=1)
    print("Replaced WDG-4G cab side windows with high-detail 3D sashes & door recesses successfully!")
else:
    print("WARNING: old_cab_side_pattern did not match!")

# Part 3.4: LHB EOG Generator Car 2x 500 kVA Cummins V12 Diesel-Alternator Skids
old_eog_dg_pattern = re.compile(
    r'const dieselBlock = new THREE\.Mesh.*?const exhaustSilencer = new THREE\.Mesh\(new THREE\.CylinderGeometry\(0\.11,\s*0\.11,\s*0\.92,\s*16\),\s*materials\.pistonSteel\);',
    re.DOTALL
)

new_eog_dg = """// Heavy Cummins V12 Diesel Engine Block & Crankcase Sump
                const crankcaseSump = new THREE.Mesh(
                    new THREE.BoxGeometry(1.02, 0.18, 0.52),
                    new THREE.MeshStandardMaterial({ color: 0x166534, metalness: 0.72, roughness: 0.28 })
                );
                crankcaseSump.position.set(-0.24, -0.15, 0);
                dgSkid.add(crankcaseSump);

                const engineBlockV = new THREE.Mesh(
                    new THREE.BoxGeometry(0.96, 0.38, 0.46),
                    materials.dgGreenMat
                );
                engineBlockV.position.set(-0.24, 0.12, 0);
                dgSkid.add(engineBlockV);

                // 60-Degree V12 Left & Right Cylinder Banks with 12 Unitized Rocker Head Covers
                [-0.16, 0.16].forEach((zBank, bIdx) => {
                    const bankAngle = bIdx === 0 ? 0.32 : -0.32;
                    for (let cyl = 0; cyl < 6; cyl++) {
                        const rockerHead = new THREE.Mesh(
                            new THREE.BoxGeometry(0.12, 0.09, 0.16),
                            materials.pistonSteel
                        );
                        rockerHead.position.set(-0.58 + cyl * 0.14, 0.34, zBank);
                        rockerHead.rotation.x = bankAngle;
                        dgSkid.add(rockerHead);

                        // High-Pressure Fuel Injection Common Rail Pipe
                        const injPipe = new THREE.Mesh(
                            new THREE.CylinderGeometry(0.007, 0.007, 0.11, 8),
                            materials.copperBusbar
                        );
                        injPipe.position.set(-0.58 + cyl * 0.14, 0.42, zBank * 0.85);
                        dgSkid.add(injPipe);
                    }
                });

                // Dual High-Pressure Holset Turbochargers & Charge-Air Crossover Intercooler Ducts
                [-0.14, 0.14].forEach(zTurbo => {
                    const turboCharger = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.09, 0.09, 0.14, 16),
                        materials.underframeSteel
                    );
                    turboCharger.rotation.z = Math.PI / 2;
                    turboCharger.position.set(0.24, 0.34, zTurbo);
                    const chargePipe = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.035, 0.035, 0.42, 12),
                        new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 })
                    );
                    chargePipe.rotation.z = Math.PI / 2;
                    chargePipe.position.set(-0.05, 0.44, zTurbo);
                    dgSkid.add(turboCharger, chargePipe);
                });

                // Front Serpentine Belt Pulleys & Water Pump Housing
                const pulleyWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 18), materials.pistonSteel);
                pulleyWheel.rotation.z = Math.PI / 2;
                pulleyWheel.position.set(-0.76, 0.04, 0);
                const fanBelt = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.015, 8, 24), materials.underframeSteel);
                fanBelt.rotation.y = Math.PI / 2;
                fanBelt.position.set(-0.76, 0.12, 0);
                dgSkid.add(pulleyWheel, fanBelt);

                // 500 kVA Stamford / Kirloskar Brushless 750V 3-Phase Alternator with Terminal Conduit Box
                const alt750V = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.54, 28), materials.alternatorBlue);
                alt750V.rotation.z = Math.PI / 2;
                alt750V.position.x = 0.54;
                const altLouverScreen = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.26, 24), materials.pistonSteel);
                altLouverScreen.rotation.y = Math.PI / 2;
                altLouverScreen.position.x = 0.82;
                const terminalBox750V = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.26), materials.copperBusbar);
                terminalBox750V.position.set(0.54, 0.36, 0);
                dgSkid.add(alt750V, altLouverScreen, terminalBox750V);

                // Dual Overhead Industrial Exhaust Silencers Wrapped in Heat Insulation Lagging
                const exhaustSilencer = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.94, 20), materials.pistonSteel);"""

if old_eog_dg_pattern.search(content):
    content = old_eog_dg_pattern.sub(new_eog_dg, content, count=1)
    print("Replaced EOG Cummins V12 DG skids with high-detail multi-part CAD assemblies successfully!")
else:
    print("WARNING: old_eog_dg_pattern did not match!")

# Part 3.5: LHB Sanitation & Galley: DRDO Bio-Toilets & Mini-Pantry Galley
old_pantry_toilet_pattern = re.compile(
    r'const pantryUnit = new THREE\.Mesh\(new THREE\.BoxGeometry\(0\.58,\s*1\.08,\s*0\.56\),\s*materials\.pistonSteel\);.*?sysGroups\.coachChairs\.add\(toiletCubicle\);\s*\}\);',
    re.DOTALL
)

new_pantry_toilet = """// LHB Mini-Pantry Galley Assembly: Counter, Beverage Boiler, Hot Case & Deep Freeze
            const pantryGroup = new THREE.Group();
            pantryGroup.position.set(23.55, 0.54, -0.38);

            // Stainless Steel Galley Counter & Washing Sink with Chrome Gooseneck Faucet
            const pantryCounter = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.78, 0.58), materials.pistonSteel);
            pantryCounter.position.y = -0.15;
            const sinkBasin = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.26), materials.underframeSteel);
            sinkBasin.position.set(-0.16, 0.22, 0.05);
            const swanFaucet = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 10), materials.pistonSteel);
            swanFaucet.position.set(-0.16, 0.36, -0.12);
            pantryGroup.add(pantryCounter, sinkBasin, swanFaucet);

            // Cylindrical Electric Beverage Boiler / Geyser with Sight Gauge & Dispense Valve
            const waterBoiler = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.38, 20), materials.pistonSteel);
            waterBoiler.position.set(0.16, 0.44, -0.12);
            const waterGaugeGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.28, 8), materials.cabGlass);
            waterGaugeGlass.position.set(0.16, 0.44, 0.01);
            pantryGroup.add(waterBoiler, waterGaugeGlass);

            // Thermally Insulated Meal Heating Hot Case with Clear Glass Door & Wire Shelves
            const hotCaseCabinet = new THREE.Mesh(
                new THREE.BoxGeometry(0.36, 0.42, 0.32),
                new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.25 })
            );
            hotCaseCabinet.position.set(0.12, 0.04, 0.08);
            const hotCaseGlass = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.34, 0.28), materials.cabGlass);
            hotCaseGlass.position.set(-0.07, 0.04, 0.08);
            pantryGroup.add(hotCaseCabinet, hotCaseGlass);

            sysGroups.coachChairs.add(pantryGroup);

            // DRDO Anaerobic Bio-Toilet Cubicles with Stainless Pan, Corner Washbasin & Bio-Digester Module
            [-4.35, 4.35].forEach(endOff => {
                const toiletGroup = new THREE.Group();
                toiletGroup.position.set(coachCenterX + endOff, 0.58, -0.36);

                // Partition Cubicle Walls with Frosted Privacy Window
                const cubicleEnclosure = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.18, 0.64), materials.partitionCreamMat);
                const privacyWindow = new THREE.Mesh(
                    new THREE.BoxGeometry(0.03, 0.28, 0.32),
                    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7, transparent: true, opacity: 0.8 })
                );
                privacyWindow.position.set(0, 0.32, -0.33);
                toiletGroup.add(cubicleEnclosure, privacyWindow);

                // Stainless Steel Hybrid Toilet Pan (Indian Squat / Western Commode) with Foot Pedal
                const commodeBase = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.36), materials.pistonSteel);
                commodeBase.position.set(-0.12, -0.38, 0.08);
                const commodeRim = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.022, 10, 20), materials.pistonSteel);
                commodeRim.rotation.x = Math.PI / 2;
                commodeRim.position.set(-0.12, -0.21, 0.08);
                const flushPedal = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.08), materials.redBufferBeam);
                flushPedal.position.set(-0.12, -0.52, 0.28);
                toiletGroup.add(commodeBase, commodeRim, flushPedal);

                // Corner Stainless Washbasin with Lever Push-Tap & Vanity Mirror Halo
                const washBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.12, 16), materials.pistonSteel);
                washBasin.position.set(0.18, -0.06, -0.16);
                const basinTap = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.09, 8), materials.pistonSteel);
                basinTap.position.set(0.18, 0.04, -0.24);
                const vanityMirror = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.36, 0.24), materials.pistonSteel);
                vanityMirror.position.set(0.34, 0.24, -0.16);
                const mirrorHalo = new THREE.Mesh(
                    new THREE.BoxGeometry(0.01, 0.38, 0.26),
                    new THREE.MeshBasicMaterial({ color: 0xfef9c3 })
                );
                mirrorHalo.position.set(0.33, 0.24, -0.16);
                toiletGroup.add(washBasin, basinTap, vanityMirror, mirrorHalo);

                // DRDO Anaerobic Bio-Digester Module (Underslung Tank with Inspection Port)
                const bioTank = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.18, 0.18, 0.58, 20),
                    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.75, roughness: 0.25 })
                );
                bioTank.rotation.z = Math.PI / 2;
                bioTank.position.set(0, -0.85, 0);
                const inspectionFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 14), materials.copperBusbar);
                inspectionFlange.position.set(0, -0.66, 0);
                toiletGroup.add(bioTank, inspectionFlange);

                sysGroups.coachChairs.add(toiletGroup);
            });"""

if old_pantry_toilet_pattern.search(content):
    content = old_pantry_toilet_pattern.sub(new_pantry_toilet, content, count=1)
    print("Replaced Pantry & Bio-Toilets with high-detail multi-part CAD models successfully!")
else:
    print("WARNING: old_pantry_toilet_pattern did not match!")

# Write updated file
with open(html_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated file written successfully! New length:", len(content))
