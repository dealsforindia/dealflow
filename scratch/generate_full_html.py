import os

builder_path = r"e:\Rudranildocs0066543\html-yt\scratch\generate_full_html.py"

# This script directly writes the complete, perfected HTML file
code = r'''import os

target = r"e:\Rudranildocs0066543\html-yt\wdg4g-lhb-simulation.html"

with open(target, "a", encoding="utf-8") as f:
    f.write("""
    <script>
        (function () {
            "use strict";

            // ============================================================================
            // 0. CAMTECH WDG4G NOTCH SCHEDULE, SIMULATION STATE & 16-SYSTEM INSPECTOR DATA
            // ============================================================================
            const CAMTECH_WDG4G_NOTCH_TABLE = [
                { idx: 0, label: 'APU / AESS', rpm: 330,  vdc: 280,  hp: 45,   teKn: 0,   speedKmh: 0   },
                { idx: 1, label: 'IDLE',       rpm: 440,  vdc: 420,  hp: 110,  teKn: 18,  speedKmh: 6   },
                { idx: 2, label: 'NOTCH 1',    rpm: 440,  vdc: 560,  hp: 420,  teKn: 95,  speedKmh: 18  },
                { idx: 3, label: 'NOTCH 2',    rpm: 585,  vdc: 720,  hp: 950,  teKn: 185, speedKmh: 30  },
                { idx: 4, label: 'NOTCH 3',    rpm: 705,  vdc: 890,  hp: 1520, teKn: 280, speedKmh: 42  },
                { idx: 5, label: 'NOTCH 4',    rpm: 765,  vdc: 1020, hp: 2150, teKn: 345, speedKmh: 56  },
                { idx: 6, label: 'NOTCH 5',    rpm: 870,  vdc: 1160, hp: 2840, teKn: 410, speedKmh: 72  },
                { idx: 7, label: 'NOTCH 6',    rpm: 935,  vdc: 1270, hp: 3480, teKn: 465, speedKmh: 88  },
                { idx: 8, label: 'NOTCH 7',    rpm: 998,  vdc: 1350, hp: 4050, teKn: 510, speedKmh: 104 },
                { idx: 9, label: 'NOTCH 8',    rpm: 1050, vdc: 1400, hp: 4500, teKn: 544, speedKmh: 120 }
            ];

            const state = {
                isPlayingTimeline: true,
                timelineTime: 0,
                duration: 45,
                activeStage: 0,
                housingMode: 'cutaway',
                focusTarget: 'rake',
                notchIndex: 4,
                rpm: 705,
                targetRpm: 705,
                dcLinkVolts: 890,
                targetVolts: 890,
                locoSpeedKmh: 42,
                targetSpeedKmh: 42,
                prevSpeedKmh: 42,
                longitudinalAccel: 0,
                couplerForceKn: 142,
                coolantTemp: 78.4,
                discBrakeTempC: 68.0,
                explodeFactor: 0,
                targetExplode: 0,
                crankAngle: 0,
                wheelAngle: 0,
                coachWheelAngle: 0,
                electricalAngle: 0,
                showPowerFlow: false,
                dynamicBrakeActive: false,
                nightMode: false,
                showLabels: true,
                showAllDeepSubLabels: false,
                selectedComponentId: null,
                userInteractingCamera: false,
                userInteractionCooldown: 0,
                soundEnabled: true,
                masterVolume: 0.75,
                hornActive: false,
                physics: {
                    joltImpulse: 0,
                    locoPitch: 0,
                    locoBounce: 0,
                    locoRoll: 0,
                    eogSlackX: 0,
                    coachSlackX: 0
                }
            };

            const INSPECTOR_ITEMS = [
                {
                    id: 'cab1',
                    name: '1. Cab-1 (4x CCA Displays, CA-1 & HVAC)',
                    detail: 'EN12663 Crashworthy Operator Cab #1 • 4 Consolidated Control Architecture (CCA) Displays • CA-1 Breaker Panel • 27,000 Btu/hr Roof HVAC',
                    maintBadge: 'SEC 2.1 & 4.13',
                    maintHtml: '• Displays: <span class="mono text-yellow-300">4x CCA Smart LCDs per Cab</span><br>• Roof HVAC: <span class="mono text-sky-300">27,000 Btu/hr (7.9 kW), R-134a, 74 VDC</span><br>• Bulkhead: <span class="mono text-emerald-300">Control Area CA-1 + EC1 Breakers</span>',
                    anchor: new THREE.Vector3(-4.15, 0.65, 0),
                    subCallouts: [
                        { id: 'c1_cca', title: '4x CCA Smart Displays', sub: 'Consolidated Control Architecture Operator Console', badge: 'CCA', pos: new THREE.Vector3(-4.10, 0.78, 0.15), offset: { x: -115, y: -85 } },
                        { id: 'c1_hvac', title: '27,000 Btu/hr Cab HVAC', sub: '7.9 kW Cooling / 3.0 kW Heating • R-134a • 320 kg', badge: 'HVAC', pos: new THREE.Vector3(-4.10, 1.35, 0), offset: { x: -85, y: -110 } },
                        { id: 'c1_ca1', title: 'Control Area CA-1 & EC1', sub: 'Rear Bulkhead Logic & Circuit Breaker Wall', badge: 'CA-1', pos: new THREE.Vector3(-3.60, 0.65, 0), offset: { x: 45, y: -95 } }
                    ]
                },
                {
                    id: 'auxcab',
                    name: '2. Aux Cab (CA2–CA5 & 6x Axle IGBTs)',
                    detail: 'Auxiliary Cabinet housing Control Areas CA-2 to CA-5, 6 Individual Axle IGBT Inverters with Heatsink Fins, Capacitors & 5GDY102D Blower',
                    maintBadge: 'SEC 2.2 & 3',
                    maintHtml: '• Traction Inverters: <span class="mono text-yellow-300">6x Finned IGBT Inverter Modules + DC Capacitors</span><br>• Control Areas: <span class="mono text-sky-300">CA-2, CA-3, CA-4, CA-5 Logic Racks</span><br>• Cooling: <span class="mono text-emerald-300">5GDY102D Aux Blower + Canister Filter</span>',
                    anchor: new THREE.Vector3(-2.85, 0.65, 0),
                    subCallouts: [
                        { id: 'ax_igbt', title: '6x Finned IGBT Inverters', sub: 'Independent 3-Phase VVVF Control + Capacitor Banks', badge: '6x IGBT', pos: new THREE.Vector3(-2.85, 0.72, 0.55), offset: { x: -80, y: -95 } },
                        { id: 'ax_ca', title: 'Control Areas CA-2 to CA-5', sub: 'Traction Control, Auxiliaries & Inverter Gate Drivers', badge: 'CA2-CA5', pos: new THREE.Vector3(-2.85, 0.68, -0.48), offset: { x: 65, y: -95 } }
                    ]
                },
                {
                    id: 'alternator',
                    name: '3. Blower Cab & 5GMG210B2 Alternator',
                    detail: 'GE 5GMG210B2 Main Alternator (3,070 kW, 1,400 VDC) + Coaxial Aux Alternator (326 kW) + 3 AC Blowers',
                    maintBadge: 'SEC 2.3 & 4.3',
                    maintHtml: '• Main Alternator: <span class="mono text-yellow-300">5GMG210B2 (10-Pole, 3,070 kW, 1,400 VDC)</span><br>• Aux Alternator: <span class="mono text-sky-300">12-Pole, 326 kW (402/201/67 VAC)</span><br>• AC Blowers: <span class="mono text-emerald-300">5GDY100C + 5GDY91H + 5GDY97D</span>',
                    anchor: new THREE.Vector3(-1.75, 0.52, 0),
                    subCallouts: [
                        { id: 'alt_main', title: '5GMG210B2 Main Alternator', sub: '3,070 kW • 10-Pole • 1,400 VDC / 3,655 A IDC', badge: '3070 kW', pos: new THREE.Vector3(-1.55, 0.55, 0), offset: { x: -65, y: -100 } },
                        { id: 'alt_aux', title: 'Coaxial Aux Alternator & Blowers', sub: '326 kW 12-Pole Aux + 5GDY100C & 5GDY91H Blowers', badge: '326 kW', pos: new THREE.Vector3(-2.05, 0.42, 0.42), offset: { x: -95, y: 75 } }
                    ]
                },
                {
                    id: 'engine',
                    name: '4. GEVO-12 (4500 HP) & 7S1712 Turbo',
                    detail: 'GE GEVO-12 Four-Stroke 45° V12 Diesel Engine (250×320 mm, 16.8:1 CR, EFI) + Articulated Con-Rods + 7S1712 Axial Turbocharger',
                    maintBadge: 'SEC 4.1',
                    maintHtml: '• Prime Mover: <span class="mono text-yellow-300">GEVO-12 (45° V12, 4,500 HP @ 1,050 RPM)</span><br>• Bore × Stroke: <span class="mono text-sky-300">250 × 320 mm (15.7 L/cyl • 16.8:1 CR)</span><br>• Induction: <span class="mono text-emerald-300">7S1712 Turbo + Baggie Air Filters</span>',
                    anchor: new THREE.Vector3(-0.15, 0.65, 0),
                    subCallouts: [
                        { id: 'eng_v12', title: 'GEVO-12 45° V12 Power Assemblies', sub: '12 Unitized Cylinders • Articulated Slider-Crank Links', badge: '4500 HP', pos: new THREE.Vector3(-0.22, 0.92, 0.30), offset: { x: -75, y: -100 } },
                        { id: 'eng_turbo', title: 'Model 7S1712 Turbocharger', sub: 'Axial-Centrifugal Turbo + Charge Air Crossover Pipes', badge: '7S1712', pos: new THREE.Vector3(0.95, 0.98, 0), offset: { x: 65, y: -105 } }
                    ]
                },
                {
                    id: 'lubeoil',
                    name: '5. 248-Plate Cooler & Moatti Filter',
                    detail: '248-Plate Copper-Brazed Stainless Steel Lube Oil Cooler & Moatti T 290-20 20-Element 25 µm Filter (575 GPM)',
                    maintBadge: 'SEC 4.7 & 4.8',
                    maintHtml: '• Lube Oil Cooler: <span class="mono text-yellow-300">248 Brazed SS316L Plates (39 kg)</span><br>• Lube Filter: <span class="mono text-sky-300">Moatti Style T 290-20 (20 Elements, 25 µm)</span><br>• Rated Flow: <span class="mono text-emerald-300">575 GPM @ 130 PSI max</span>',
                    anchor: new THREE.Vector3(1.24, 0.42, 0),
                    subCallouts: [
                        { id: 'lo_cooler', title: '248-Plate Brazed Lube Cooler', sub: 'Compact SS316L Heat Exchanger Stack', badge: '248 PLATES', pos: new THREE.Vector3(1.22, 0.38, 0.42), offset: { x: -65, y: 80 } },
                        { id: 'lo_moatti', title: 'Moatti T 290-20 Oil Filter', sub: '20-Element Full-Flow 25 µm Filter (575 GPM)', badge: 'MOATTI', pos: new THREE.Vector3(1.25, 0.55, -0.40), offset: { x: 75, y: -90 } }
                    ]
                },
                {
                    id: 'dbgrid',
                    name: '6. 3,230 HP Dynamic Brake Grid',
                    detail: '3,230 HP Dynamic Brake Resistor Grid Assembly (0.526 Ω Box Resistance, 1,126 V DC Link, 270 kN Peak Braking Effort)',
                    maintBadge: 'SEC 4.9',
                    maintHtml: '• Capacity: <span class="mono text-yellow-300">3,230 HP Dynamic Braking Grid</span><br>• Resistance: <span class="mono text-rose-300">0.526 Ω Box (0.285 Ω + 0.241 Ω Legs)</span><br>• Effort: <span class="mono text-sky-300">270 kN Peak Braking Effort @ 1,126 VDC</span>',
                    anchor: new THREE.Vector3(1.55, 1.04, 0),
                    subCallouts: [
                        { id: 'db_grid', title: '3,230 HP Dynamic Brake Grid', sub: 'Serpentine Nichrome Ribbons • 270 kN Braking Effort', badge: '0.526 Ω', pos: new THREE.Vector3(1.55, 1.06, 0.38), offset: { x: 0, y: -100 } }
                    ]
                },
                {
                    id: 'radiator',
                    name: '7. 10-Row Radiator & 72" 5GYA30C6 Fan',
                    detail: 'Gull-Wing Cold-Side 10-Row Brass/Copper Radiator Cores + 72-Inch 5GYA30C6 AC Fan (80,000 SCFM) + CA9/12/13',
                    maintBadge: 'SEC 4.10 & 4.11',
                    maintHtml: '• Radiator Core: <span class="mono text-yellow-300">10-Row Brass Tube / Copper Fin (Cold-Side)</span><br>• Main AC Fan: <span class="mono text-sky-300">72" GE 5GYA30C6 (80,000 SCFM, 110 HP)</span><br>• Control Racks: <span class="mono text-emerald-300">CA-9, CA-12 & CA-13 Cabinets</span>',
                    anchor: new THREE.Vector3(2.15, 1.15, 0),
                    subCallouts: [
                        { id: 'rad_fan', title: '72" 5GYA30C6 AC Radiator Fan', sub: '80,000 SCFM @ 1,035 RPM • 10 Pitched Airfoil Blades', badge: '110 HP', pos: new THREE.Vector3(2.15, 1.38, 0), offset: { x: -45, y: -105 } },
                        { id: 'rad_core', title: '10-Row Split-Cooling Cores', sub: 'Gull-Wing Roof Overhang Heat Exchangers', badge: '10-ROW', pos: new THREE.Vector3(2.15, 1.24, 0.42), offset: { x: 75, y: -75 } }
                    ]
                },
                {
                    id: 'compressor',
                    name: '8. 178 CFM Screw Comp, EAB & 34.5kW APU',
                    detail: 'Rotary Screw Compressor (178 CFM @ 145 PSI) + Wabtec FastBrake EAB Manifold Gauges + 34.5 kW 3-Cyl CPCB-II APU Skid',
                    maintBadge: 'SEC 4.4 & 4.12',
                    maintHtml: '• Compressor: <span class="mono text-yellow-300">Rotary Screw (178 CFM 8-Pole / 147 CFM 4-Pole)</span><br>• Air Brake: <span class="mono text-sky-300">Wabtec FastBrake EAB + 4 Pressure Gauges</span><br>• CPCB-II APU: <span class="mono text-emerald-300">3-Cyl Diesel + 55 CFM Comp + 120A Belt Alt</span>',
                    anchor: new THREE.Vector3(3.05, 0.38, 0),
                    subCallouts: [
                        { id: 'cmp_screw', title: '178 CFM Rotary Screw Compressor', sub: '145 PSI MR • Oil Separator Tank & Spin-on Filter', badge: '178 CFM', pos: new THREE.Vector3(2.80, 0.35, -0.36), offset: { x: -65, y: 80 } },
                        { id: 'cmp_apu', title: '34.5 kW CPCB-II APU Skid', sub: '3-Cyl Diesel + 55 CFM Comp + 78V Belt Alt', badge: 'APU', pos: new THREE.Vector3(3.40, 0.34, -0.32), offset: { x: 75, y: -85 } }
                    ]
                },
                {
                    id: 'cab2',
                    name: '9. Cab-2 Rear Operator Station & HVAC',
                    detail: 'Bi-Directional Rear EN12663 Crashworthy Operator Cab #2 with 4 CCA Displays, Air Suspension Seats & 27,000 Btu/hr HVAC',
                    maintBadge: 'SEC 2.1 & 5.1',
                    maintHtml: '• Bi-Directional: <span class="mono text-yellow-300">Full Rear Operator Console (#2 Cab)</span><br>• Displays: <span class="mono text-sky-300">4x CCA Smart LCD Displays</span><br>• Roof HVAC: <span class="mono text-emerald-300">27,000 Btu/hr (7.9 kW) R-134a Unit</span>',
                    anchor: new THREE.Vector3(4.15, 0.65, 0),
                    subCallouts: [
                        { id: 'c2_desk', title: 'Cab-2 CCA Operator Console', sub: '4x Smart LCDs + Master Reverser/Throttle/EAB Handles', badge: 'CAB-2', pos: new THREE.Vector3(4.15, 0.72, 0), offset: { x: 75, y: -95 } }
                    ]
                },
                {
                    id: 'underframe',
                    name: '10. 6000L Fuel Tank & 32-Cell SLA Battery',
                    detail: 'Heavy Underframe Platform, Slotted V-Plow Cowcatcher, Contoured 6,000 L Fuel Tank with Dual Glow Rods & 32-Cell SLA Batteries',
                    maintBadge: 'SEC 3 & 4.2',
                    maintHtml: '• Usable Fuel: <span class="mono text-yellow-300">6,000 L (6,300 L Gross) + Dual Glow Rods</span><br>• Batteries: <span class="mono text-sky-300">2×16-Cell SLA (64 V, 500 Ah Total)</span><br>• Cowcatcher: <span class="mono text-emerald-300">Slotted 5-Bar Steel V-Plow + AAR Type-H CBC</span>',
                    anchor: new THREE.Vector3(0.0, -0.45, 0),
                    subCallouts: [
                        { id: 'uf_fuel', title: '6,000 L Contoured Belly Fuel Tank', sub: 'Dual Optical Sight-Glass Glow Rods + Retention Straps', badge: '6000 L', pos: new THREE.Vector3(0.0, -0.50, 0.68), offset: { x: 0, y: 85 } },
                        { id: 'uf_batt', title: '32-Cell (2×16) SLA Battery Boxes', sub: '64 V, 500 Ah Sealed Lead-Acid Cranking & Control Bank', badge: '64V 500Ah', pos: new THREE.Vector3(-0.92, -0.22, 0.58), offset: { x: -95, y: 75 } }
                    ]
                },
                {
                    id: 'bogies',
                    name: '11. Co-Co Bogies & 6x 5GEB24 AC Motors',
                    detail: 'High-Adhesion Fabricated Co-Co Bogies • 6x GE 5GEB24 8-Pole AC Traction Motors (2,615 RPM, 85:18 Gear) • Arcuate Brake Shoes • 8 Sand Boxes',
                    maintBadge: 'SEC 4.5 & 4.6',
                    maintHtml: '• Traction Motors: <span class="mono text-yellow-300">6x GE 5GEB24 (8-Pole AC, 2,615 RPM Max)</span><br>• Gear Ratio: <span class="mono text-sky-300">85:18 Bull/Pinion • 1,092 mm Lathe Wheels</span><br>• Brakes & Sand: <span class="mono text-emerald-300">Arcuate Tread Shoes + 8×85 L Corner Sand Boxes</span>',
                    anchor: new THREE.Vector3(-2.70, -0.72, 0),
                    subCallouts: [
                        { id: 'bg_tm', title: '6x GE 5GEB24 AC Traction Motors', sub: '8-Pole 3-Phase Induction • 85:18 Helical Bull Gear', badge: '544 kN TE', pos: new THREE.Vector3(-2.70, -0.76, 0.45), offset: { x: -85, y: 85 } },
                        { id: 'bg_coil', title: '3D Helical Coil Springs & Sand Boxes', sub: 'Dynamic Compressible Springs • 12 Arcuate Tread Units', badge: 'Co-Co', pos: new THREE.Vector3(-1.45, -0.52, 0.68), offset: { x: 75, y: 80 } }
                    ]
                },
                {
                    id: 'lhb_eog',
                    name: '12. LHB EOG Power Car (2×500 kVA DG)',
                    detail: 'Coupled LHB LWLRRM End-On Generation Power Car • 2 × 500 kVA (750 V 3-Phase 50 Hz) Cummins V12 DG Skids • 3D Perforated Shell with Tumblehome Skirt',
                    maintBadge: 'LHB LWLRRM',
                    maintHtml: '• DG Sets: <span class="mono text-yellow-300">2 × 500 kVA (400 kW) Cummins V12 Turbo Skids</span><br>• Hotel Feeder: <span class="mono text-sky-300">750 VAC, 3-Phase, 4-Wire, 50 Hz Bus</span><br>• Shell: <span class="mono text-emerald-300">Punched 3D Window Apertures + Tumblehome Skirt</span>',
                    anchor: new THREE.Vector3(10.3, 0.45, 0),
                    subCallouts: [
                        { id: 'eog_dg', title: '2 × 500 kVA V12 EOG Diesel-Alternators', sub: '750 V 3-Phase 50 Hz Hotel Load Supply + Twin Turbos', badge: '1000 kVA', pos: new THREE.Vector3(9.5, 0.45, 0), offset: { x: -75, y: -95 } },
                        { id: 'eog_sw', title: '750V Auto-Sync Switchboard & Guard Van', sub: 'Dual Feeder Protection + Emergency Brake Valve', badge: '750 VAC', pos: new THREE.Vector3(12.2, 0.55, 0), offset: { x: 75, y: -95 } }
                    ]
                },
                {
                    id: 'lhb_berths',
                    name: '13. LHB AC 3-Tier Sleeper Bays (LWACCN)',
                    detail: 'LHB AC 3-Tier Passenger Interior • Suspension Chains, Transverse & Side Berths, Folding Bottle Holders, Reading Lights & SS Climbing Ladders',
                    maintBadge: 'LHB LWACCN',
                    maintHtml: '• Layout: <span class="mono text-yellow-300">8 Berths/Bay (6 Transverse + 2 Side Corridor)</span><br>• Details: <span class="mono text-sky-300">SS Suspension Chains + Snack Tables + Reading Lights</span><br>• Safety: <span class="mono text-emerald-300">Fire-Retardant Silicone Foam + SS Ladders</span>',
                    anchor: new THREE.Vector3(18.1, 0.52, 0),
                    subCallouts: [
                        { id: 'br_tier', title: '3-Tier Transverse & Side Berths', sub: 'Diagonal Suspension Chains + Foldable Snack Tables', badge: '72 BERTHS', pos: new THREE.Vector3(18.0, 0.62, -0.22), offset: { x: -70, y: -95 } }
                    ]
                },
                {
                    id: 'lhb_chair',
                    name: '14. LHB Executive Chair, Pantry & Bio-Toilets',
                    detail: 'Sculpted Ergonomic S-Curve 2×2 Reclining Chairs with Tray Tables, Overhead Luggage Bins, LED Cove Lighting, Mini-Pantry Galley & DRDO Bio-Toilets',
                    maintBadge: 'LHB LWFCZAC',
                    maintHtml: '• Seating: <span class="mono text-yellow-300">Sculpted S-Curve Reclining Chairs + Rear Snack Tables</span><br>• Amenities: <span class="mono text-sky-300">Mini-Pantry Hot Case & Urn + LED Cove Strips</span><br>• Sanitation: <span class="mono text-emerald-300">DRDO Anaerobic Digester & Commode Fixtures</span>',
                    anchor: new THREE.Vector3(21.8, 0.48, 0),
                    subCallouts: [
                        { id: 'ch_seat', title: 'Sculpted S-Curve Executive Chairs', sub: 'Ergonomic Bolster, Winged Headrest & Fold-down Tables', badge: 'EXEC CHAIR', pos: new THREE.Vector3(21.8, 0.45, 0.22), offset: { x: -55, y: -95 } },
                        { id: 'ch_bio', title: 'Mini-Pantry & DRDO Bio-Toilets', sub: 'Underslung Anaerobic Digester + Stainless Commode', badge: 'BIO-TOILET', pos: new THREE.Vector3(23.8, 0.15, -0.36), offset: { x: 75, y: 75 } }
                    ]
                },
                {
                    id: 'lhb_rmpu',
                    name: '15. LHB Dual 7.0 TR Roof AC Units (RMPU)',
                    detail: '2 × 7.0 TR (85,303 BTU/hr each) Microprocessor-Controlled Roof-Mounted AC Package Units (RMPUs) with R-407C Refrigerant',
                    maintBadge: 'RDSO RMPU',
                    maintHtml: '• Capacity: <span class="mono text-yellow-300">2 × 7.0 TR (14.0 TR / 170,606 BTU Total)</span><br>• Power Supply: <span class="mono text-sky-300">Fed via 60 kVA 750V/415V Underframe Transformer</span><br>• Control: <span class="mono text-emerald-300">Dual Scroll Compressors + Insulated Roof Duct</span>',
                    anchor: new THREE.Vector3(20.2, 1.34, 0),
                    subCallouts: [
                        { id: 'rm_unit', title: 'Dual 7.0 TR Roof AC Package Units', sub: '85,303 BTU/hr per RMPU • Twin Condenser Fans', badge: '2×7.0 TR', pos: new THREE.Vector3(16.75, 1.38, 0), offset: { x: -65, y: -100 } }
                    ]
                },
                {
                    id: 'fiat_bogie',
                    name: '16. Alstom-LHB FIAT Bogies & 640mm Discs',
                    detail: 'Alstom-LHB FIAT High-Speed Bogies (160–200 km/h) • 2,560 mm WB • Anti-Roll Bar • Dual 640×110 mm Ventilated Brake Discs/Axle',
                    maintBadge: 'FIAT BOGIE',
                    maintHtml: '• Frame & WB: <span class="mono text-yellow-300">Welded GS20Mn5V H-Frame • 2,560 mm WB</span><br>• Disc Brakes: <span class="mono text-rose-300">2 × 640×110 mm Ventilated Discs per Axle + WSP</span><br>• Suspension: <span class="mono text-sky-300">Control-Arm Helical + Air/Flexicoil + Anti-Roll Bar</span>',
                    anchor: new THREE.Vector3(17.05, -0.68, 0),
                    subCallouts: [
                        { id: 'ft_disc', title: 'Dual 640×110 mm Ventilated Brake Discs', sub: 'Axle-Mounted Discs + Pneumatic Calipers + 4-Axle WSP', badge: '640mm DISC', pos: new THREE.Vector3(17.05, -0.82, 0.28), offset: { x: -85, y: 85 } },
                        { id: 'ft_arb', title: 'FIAT Swan-Neck Frame & Anti-Roll Bar', sub: 'Torsion-Bar Roll Stabilizer (0.3 Tilt) + Yaw Dampers', badge: '160 KM/H', pos: new THREE.Vector3(17.05, -0.52, 0.65), offset: { x: 85, y: 75 } }
                    ]
                }
            ];

            const EXPLODED_LABELS = [
                { id: 'exp_hood', title: 'WDG4G Carbody & Gull-Wing Roof', sub: 'Evolution Yellow Shell + EN12663 Dual Cabs', pos: new THREE.Vector3(0, 2.65, 0), offset: { x: -90, y: -55 } },
                { id: 'exp_gevo', title: 'GEVO-12 (4500 HP) + 5GMG210B2', sub: '45° V12 Engine + Articulated Con-Rods + 7S1712 Turbo', pos: new THREE.Vector3(-0.3, 0.95, 0), offset: { x: -75, y: -60 } },
                { id: 'exp_coco', title: 'Co-Co Bogies & 6x 5GEB24 Motors', sub: '1092mm Lathe Wheels + 6000L Contoured Belly Tank', pos: new THREE.Vector3(-2.7, -1.35, 0), offset: { x: -85, y: 65 } },
                { id: 'exp_eog', title: 'LHB EOG Car (2×500 kVA DG Skids)', sub: '750V 3-Phase 50Hz Hotel Load Generator Van', pos: new THREE.Vector3(10.3, 1.95, 0), offset: { x: 0, y: -65 } },
                { id: 'exp_coach', title: 'LHB AC Coach & 2×7.0 TR RMPUs', sub: '3-Tier Sleeper + S-Curve Chair + FIAT Disc Bogies', pos: new THREE.Vector3(20.2, 2.25, 0), offset: { x: 85, y: -65 } }
            ];

            // ============================================================================
            // 1. WEB AUDIO API SYNTHESIZER
            // ============================================================================
            const soundEngine = (function () {
                let ctx = null, masterGain = null, chugOsc = null, chugGain = null;
                let turboOsc = null, turboGain = null, igbtOsc = null, igbtGain = null;
                let hornOsc1 = null, hornOsc2 = null, hornGain = null, lastClackTime = 0;

                function init() {
                    if (ctx) return;
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (!AudioCtx) return;
                    ctx = new AudioCtx();

                    masterGain = ctx.createGain();
                    masterGain.gain.value = state.soundEnabled ? state.masterVolume * 0.32 : 0;
                    masterGain.connect(ctx.destination);

                    chugOsc = ctx.createOscillator();
                    chugOsc.type = 'sawtooth';
                    chugOsc.frequency.value = 42;
                    const chugFilter = ctx.createBiquadFilter();
                    chugFilter.type = 'lowpass';
                    chugFilter.frequency.value = 165;
                    chugGain = ctx.createGain();
                    chugGain.gain.value = 0.25;
                    chugOsc.connect(chugFilter);
                    chugFilter.connect(chugGain);
                    chugGain.connect(masterGain);
                    chugOsc.start();

                    turboOsc = ctx.createOscillator();
                    turboOsc.type = 'sine';
                    turboOsc.frequency.value = 520;
                    turboGain = ctx.createGain();
                    turboGain.gain.value = 0.03;
                    turboOsc.connect(turboGain);
                    turboGain.connect(masterGain);
                    turboOsc.start();

                    igbtOsc = ctx.createOscillator();
                    igbtOsc.type = 'triangle';
                    igbtOsc.frequency.value = 180;
                    igbtGain = ctx.createGain();
                    igbtGain.gain.value = 0.04;
                    igbtOsc.connect(igbtGain);
                    igbtGain.connect(masterGain);
                    igbtOsc.start();

                    hornOsc1 = ctx.createOscillator();
                    hornOsc2 = ctx.createOscillator();
                    hornOsc1.type = 'sawtooth';
                    hornOsc2.type = 'sawtooth';
                    hornOsc1.frequency.value = 349.23;
                    hornOsc2.frequency.value = 440.0;
                    const hornFilter = ctx.createBiquadFilter();
                    hornFilter.type = 'lowpass';
                    hornFilter.frequency.value = 1400;
                    hornGain = ctx.createGain();
                    hornGain.gain.value = 0.0;
                    hornOsc1.connect(hornFilter);
                    hornOsc2.connect(hornFilter);
                    hornFilter.connect(hornGain);
                    hornGain.connect(masterGain);
                    hornOsc1.start();
                    hornOsc2.start();
                }

                function resumeIfNeeded() {
                    if (!ctx) init();
                    if (ctx && ctx.state === 'suspended') ctx.resume();
                }

                function playUiBeep(freq = 880, dur = 0.04, type = 'sine') {
                    if (!state.soundEnabled) return;
                    resumeIfNeeded();
                    if (!ctx) return;
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = type;
                    osc.frequency.value = freq;
                    g.gain.setValueAtTime(0.06, ctx.currentTime);
                    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
                    osc.connect(g);
                    g.connect(masterGain);
                    osc.start();
                    osc.stop(ctx.currentTime + dur);
                }

                function playTrackClack(intensity = 0.6) {
                    if (!state.soundEnabled) return;
                    resumeIfNeeded();
                    if (!ctx) return;
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(115, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(38, ctx.currentTime + 0.065);
                    g.gain.setValueAtTime(0.18 * intensity, ctx.currentTime);
                    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
                    osc.connect(g);
                    g.connect(masterGain);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.075);
                }

                function setHorn(active) {
                    state.hornActive = active;
                    resumeIfNeeded();
                    if (!ctx || !hornGain) return;
                    hornGain.gain.setTargetAtTime(active ? 0.35 : 0.0, ctx.currentTime, 0.04);
                }

                function setEnabled(flag) {
                    state.soundEnabled = flag;
                    resumeIfNeeded();
                    const iconEl = document.getElementById('sound-icon');
                    const labelEl = document.getElementById('sound-label');
                    if (iconEl) iconEl.textContent = flag ? '🔊' : '🔇';
                    if (labelEl) labelEl.textContent = flag ? 'Audio: ON' : 'Audio: MUTED';
                    if (ctx && masterGain) {
                        masterGain.gain.setTargetAtTime(flag ? state.masterVolume * 0.32 : 0, ctx.currentTime, 0.05);
                    }
                }

                function setVolume(v) {
                    state.masterVolume = v;
                    if (ctx && masterGain && state.soundEnabled) {
                        masterGain.gain.setTargetAtTime(v * 0.32, ctx.currentTime, 0.05);
                    }
                }

                function update() {
                    if (!ctx || ctx.state !== 'running' || !state.soundEnabled) return;
                    const now = ctx.currentTime;
                    const firingHz = (state.rpm / 60) * 6;
                    const pulseMod = 0.72 + 0.28 * Math.sin(now * firingHz * Math.PI * 2);
                    chugOsc.frequency.setTargetAtTime(firingHz * 0.85, now, 0.04);
                    chugGain.gain.setTargetAtTime((0.18 + (state.rpm / 1050) * 0.16) * pulseMod, now, 0.03);

                    const turboHz = 420 + ((state.rpm - 330) / (1050 - 330)) * 1450;
                    turboOsc.frequency.setTargetAtTime(turboHz, now, 0.06);
                    turboGain.gain.setTargetAtTime(0.015 + ((state.rpm - 330) / 720) * 0.055, now, 0.05);

                    const invHz = state.dynamicBrakeActive ? 680 : 120 + (state.locoSpeedKmh / 120) * 460;
                    igbtOsc.frequency.setTargetAtTime(invHz, now, 0.05);
                    igbtGain.gain.setTargetAtTime(state.dynamicBrakeActive ? 0.075 : 0.035, now, 0.05);

                    if (state.locoSpeedKmh > 8) {
                        const clackInterval = Math.max(0.22, 1.4 - (state.locoSpeedKmh / 120) * 1.1);
                        if (now - lastClackTime > clackInterval) {
                            lastClackTime = now;
                            playTrackClack(0.28 + (state.locoSpeedKmh / 120) * 0.25);
                        }
                    }
                }

                return { resumeIfNeeded, playUiBeep, playTrackClack, setHorn, setEnabled, setVolume, update };
            })();

            // ============================================================================
            // 2. THREE.JS SCENE, STUDIO PMREM HDRI & GLSL SHADERS
            // ============================================================================
            const container = document.getElementById('canvas-container');
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x050811);
            scene.fog = new THREE.FogExp2(0x050811, 0.014);

            const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 160);
            const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.12;
            container.appendChild(renderer.domElement);

            const pmremGenerator = new THREE.PMREMGenerator(renderer);
            pmremGenerator.compileEquirectangularShader();
            const envScene = new THREE.Scene();
            envScene.background = new THREE.Color(0x0f172a);

            const studioSky = new THREE.Mesh(
                new THREE.SphereGeometry(50, 32, 16),
                new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.BackSide })
            );
            const warmStrip = new THREE.Mesh(
                new THREE.PlaneGeometry(40, 12),
                new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide })
            );
            warmStrip.position.set(0, 22, 15);
            warmStrip.lookAt(0, 0, 0);
            envScene.add(studioSky, warmStrip);

            scene.environment = pmremGenerator.fromScene(envScene, 0.04).texture;

            const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.72);
            scene.add(ambientLight);

            const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.45);
            keyLight.position.set(12, 18, 14);
            keyLight.castShadow = true;
            keyLight.shadow.mapSize.width = 2048;
            keyLight.shadow.mapSize.height = 2048;
            keyLight.shadow.camera.near = 1;
            keyLight.shadow.camera.far = 60;
            keyLight.shadow.camera.left = -12;
            keyLight.shadow.camera.right = 32;
            keyLight.shadow.camera.top = 12;
            keyLight.shadow.camera.bottom = -12;
            keyLight.shadow.bias = -0.0004;
            keyLight.shadow.normalBias = 0.02;
            scene.add(keyLight);

            const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.55);
            fillLight.position.set(-14, 8, -12);
            scene.add(fillLight);

            const rimLight = new THREE.DirectionalLight(0xfacc15, 0.45);
            rimLight.position.set(8, 10, -16);
            scene.add(rimLight);

            const engineGlowLight = new THREE.PointLight(0xfacc15, 0.85, 9);
            engineGlowLight.position.set(-0.2, 0.65, 0);
            scene.add(engineGlowLight);

            const customShaderUniforms = {
                uTime: { value: 0.0 },
                uThermalLevel: { value: 0.5 },
                uBrakeHeat: { value: 0.1 },
                uScanPos: { value: 0.0 }
            };

            const blueprintShaderMaterial = new THREE.ShaderMaterial({
                uniforms: customShaderUniforms,
                extensions: { derivatives: true },
                transparent: true,
                side: THREE.DoubleSide,
                vertexShader: `
                    varying vec3 vWorldPos;
                    varying vec3 vNormal;
                    varying vec3 vViewPosition;
                    void main() {
                        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                        vWorldPos = worldPosition.xyz;
                        vNormal = normalize(normalMatrix * normal);
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        vViewPosition = -mvPosition.xyz;
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    uniform float uTime;
                    uniform float uScanPos;
                    varying vec3 vWorldPos;
                    varying vec3 vNormal;
                    varying vec3 vViewPosition;
                    void main() {
                        vec3 viewDir = normalize(vViewPosition);
                        float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 1.75);
                        vec3 cell = abs(fract(vWorldPos * 3.5) - 0.5);
                        float gridX = smoothstep(0.44, 0.49, cell.x);
                        float gridY = smoothstep(0.44, 0.49, cell.y);
                        float gridZ = smoothstep(0.44, 0.49, cell.z);
                        float gridPattern = max(max(gridX, gridY), gridZ);
                        float scanWave = exp(-pow((vWorldPos.x - uScanPos) * 1.6, 2.0));
                        vec3 baseCol = vec3(0.03, 0.14, 0.32);
                        vec3 edgeCol = vec3(0.22, 0.78, 1.0);
                        vec3 scanCol = vec3(0.98, 0.85, 0.25);
                        vec3 finalCol = mix(baseCol, edgeCol, clamp(fresnel + gridPattern * 0.48, 0.0, 1.0));
                        finalCol += scanCol * scanWave * 0.75;
                        float alpha = clamp(0.28 + fresnel * 0.65 + gridPattern * 0.35 + scanWave * 0.4, 0.22, 0.95);
                        gl_FragColor = vec4(finalCol, alpha);
                    }
                `
            });

            const thermalShaderMaterial = new THREE.ShaderMaterial({
                uniforms: customShaderUniforms,
                side: THREE.DoubleSide,
                vertexShader: `
                    varying vec3 vWorldPos;
                    varying vec3 vNormal;
                    varying vec3 vViewPosition;
                    void main() {
                        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                        vWorldPos = worldPosition.xyz;
                        vNormal = normalize(normalMatrix * normal);
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        vViewPosition = -mvPosition.xyz;
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    uniform float uTime;
                    uniform float uThermalLevel;
                    uniform float uBrakeHeat;
                    varying vec3 vWorldPos;
                    varying vec3 vNormal;
                    varying vec3 vViewPosition;

                    vec3 heatPalette(float t) {
                        vec3 c1 = vec3(0.05, 0.08, 0.35);
                        vec3 c2 = vec3(0.0, 0.65, 0.85);
                        vec3 c3 = vec3(0.95, 0.82, 0.12);
                        vec3 c4 = vec3(1.0, 0.18, 0.08);
                        vec3 c5 = vec3(1.0, 0.96, 0.88);
                        if (t < 0.25) return mix(c1, c2, t / 0.25);
                        if (t < 0.55) return mix(c2, c3, (t - 0.25) / 0.30);
                        if (t < 0.82) return mix(c3, c4, (t - 0.55) / 0.27);
                        return mix(c4, c5, clamp((t - 0.82) / 0.18, 0.0, 1.0));
                    }

                    void main() {
                        float coreZ = exp(-pow(vWorldPos.z * 2.1, 2.0));
                        float engHeat = exp(-pow((vWorldPos.x - 0.1) * 0.85, 2.0) - pow((vWorldPos.y - 0.72) * 1.8, 2.0)) * coreZ * (0.58 + uThermalLevel * 0.42);
                        float dbHeat = exp(-pow((vWorldPos.x - 1.55) * 1.6, 2.0) - pow((vWorldPos.y - 1.06) * 2.4, 2.0)) * (0.20 + uBrakeHeat * 0.85);
                        float eogHeat = exp(-pow((vWorldPos.x - 9.5) * 0.75, 2.0) - pow((vWorldPos.y - 0.42) * 1.9, 2.0)) * coreZ * 0.82;
                        float discHeat = smoothstep(-0.55, -0.82, vWorldPos.y) * exp(-pow((abs(vWorldPos.z) - 0.35) * 4.5, 2.0)) * (0.35 + uBrakeHeat * 0.65);

                        vec3 viewDir = normalize(vViewPosition);
                        float lambert = 0.78 + 0.22 * max(0.0, dot(vNormal, normalize(vec3(0.4, 0.9, 0.5))));
                        float rim = pow(1.0 - abs(dot(vNormal, viewDir)), 1.8) * 0.22;

                        float h = clamp(0.10 + max(max(engHeat, dbHeat), max(eogHeat, discHeat)) + rim, 0.0, 1.0);
                        gl_FragColor = vec4(heatPalette(h) * lambert, 1.0);
                    }
                `
            });

            // Canvas Textures
            function createWdg4gHoodTexture() {
                const canvas = document.createElement('canvas');
                canvas.width = 2048; canvas.height = 512;
                const ctx = canvas.getContext('2d');

                ctx.fillStyle = '#eab308';
                ctx.fillRect(0, 0, 2048, 512);

                ctx.fillStyle = '#0f172a';
                ctx.fillRect(0, 0, 2048, 128);
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(0, 128, 2048, 28);

                for (let x = 0; x < 2048; x += 64) {
                    ctx.fillStyle = (x / 64) % 2 === 0 ? '#dc2626' : '#f8fafc';
                    ctx.fillRect(x, 488, 64, 24);
                }

                ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
                ctx.lineWidth = 3;
                for (let d = 80; d < 1960; d += 110) {
                    ctx.strokeRect(d, 170, 96, 295);
                    ctx.fillStyle = '#334155';
                    ctx.fillRect(d + 78, 310, 10, 26);

                    if ((d > 260 && d < 720) || (d > 1150 && d < 1820)) {
                        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
                        for (let y = 190; y < 340; y += 11) {
                            ctx.fillRect(d + 12, y, 64, 5);
                        }
                    }
                }

                ctx.fillStyle = '#facc15';
                ctx.font = 'bold 42px Inter, sans-serif';
                ctx.fillText('भारतीय रेल   •   INDIAN RAILWAYS', 620, 78);

                ctx.fillStyle = '#0f172a';
                ctx.font = 'bold 54px JetBrains Mono, monospace';
                ctx.fillText('WDG-4G   49001', 740, 435);

                ctx.font = 'bold 28px Inter, sans-serif';
                ctx.fillStyle = '#b91c1c';
                ctx.fillText('4500 HP AC-AC • GEVO-12 • ROZA', 765, 472);

                const tex = new THREE.CanvasTexture(canvas);
                tex.anisotropy = 4;
                return tex;
            }

            function createLhbCoachTexture(isEog) {
                const canvas = document.createElement('canvas');
                canvas.width = 2048; canvas.height = 512;
                const ctx = canvas.getContext('2d');

                ctx.fillStyle = '#dc2626';
                ctx.fillRect(0, 0, 2048, 512);

                const grad = ctx.createLinearGradient(0, 110, 0, 310);
                grad.addColorStop(0, '#cbd5e1');
                grad.addColorStop(0.5, '#f8fafc');
                grad.addColorStop(1, '#94a3b8');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 115, 2048, 185);

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 103, 2048, 12);
                ctx.fillRect(0, 300, 2048, 14);
                ctx.fillRect(0, 468, 2048, 10);

                if (isEog) {
                    ctx.fillStyle = '#1e293b';
                    for (let g = 240; g < 1360; g += 260) {
                        ctx.fillRect(g, 138, 210, 140);
                        ctx.fillStyle = '#475569';
                        for (let y = 148; y < 270; y += 12) {
                            ctx.fillRect(g + 10, y, 190, 6);
                        }
                        ctx.fillStyle = '#1e293b';
                    }
                    ctx.fillStyle = '#0f172a';
                    ctx.fillRect(1520, 145, 130, 125);
                    ctx.fillRect(1720, 145, 130, 125);
                }

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 36px Inter, sans-serif';
                ctx.fillText(
                    isEog
                        ? 'भारतीय रेल  •  LHB EOG POWER CAR (2×500 kVA 750V)  •  LWLRRM'
                        : 'भारतीय रेल  •  RAJDHANI EXPRESS (AC 3-TIER / EXEC CHAIR)  •  LWACCN',
                    370, 68
                );

                ctx.fillStyle = '#fef08a';
                ctx.font = 'bold 34px JetBrains Mono, monospace';
                ctx.fillText(
                    isEog ? 'POWER & GUARD VAN • 160 KM/H FIAT BOGIE' : 'NEW DELHI ⇄ HOWRAH RAJDHANI • B1 / E1',
                    560, 415
                );

                const tex = new THREE.CanvasTexture(canvas);
                tex.anisotropy = 4;
                return tex;
            }

            const wdg4gHoodTex = createWdg4gHoodTexture();
            const lhbEogTex = createLhbCoachTexture(true);
            const lhbCoachTex = createLhbCoachTexture(false);

            const materials = {
                irYellowHood: new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.34, roughness: 0.26, transparent: true, opacity: 1.0, side: THREE.DoubleSide }),
                irYellowTexturedHood: new THREE.MeshStandardMaterial({ map: wdg4gHoodTex, metalness: 0.32, roughness: 0.28, transparent: true, opacity: 1.0, side: THREE.DoubleSide }),
                irDarkBlueTrim: new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.48, roughness: 0.32, transparent: true, opacity: 1.0, side: THREE.DoubleSide }),
                lhbScarletRed: new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.38, roughness: 0.25, transparent: true, opacity: 1.0, side: THREE.DoubleSide }),
                lhbEogSideMat: new THREE.MeshStandardMaterial({ map: lhbEogTex, metalness: 0.35, roughness: 0.26, transparent: true, opacity: 1.0, side: THREE.DoubleSide }),
                lhbCoachSideMat: new THREE.MeshStandardMaterial({ map: lhbCoachTex, metalness: 0.35, roughness: 0.26, transparent: true, opacity: 1.0, side: THREE.DoubleSide }),
                lhbRoofSilver: new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.72, roughness: 0.28, transparent: true, opacity: 1.0, side: THREE.DoubleSide }),
                lhbWhiteStripe: new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.2, roughness: 0.3, transparent: true, opacity: 1.0 }),
                cabGlass: new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, metalness: 0.15, roughness: 0.06, transparent: true, opacity: 0.48 }),
                lhbTintedGlass: new THREE.MeshPhysicalMaterial({ color: 0x0f172a, metalness: 0.25, roughness: 0.08, transparent: true, opacity: 0.42, side: THREE.DoubleSide }),
                underframeSteel: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.72, roughness: 0.38 }),
                redBufferBeam: new THREE.MeshStandardMaterial({ color: 0xb91c1c, metalness: 0.45, roughness: 0.35 }),
                gevoEngineBlock: new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.76, roughness: 0.28 }),
                pistonSteel: new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.92, roughness: 0.14, emissive: 0x0ea5e9, emissiveIntensity: 0.12 }),
                alternatorBlue: new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.68, roughness: 0.25 }),
                copperBusbar: new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.88, roughness: 0.18, emissive: 0x7c2d12, emissiveIntensity: 0.18 }),
                ccaCabinetMat: new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.58, roughness: 0.32 }),
                igbtModuleMat: new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.72, roughness: 0.20, emissive: 0x0284c7, emissiveIntensity: 0.32 }),
                bogieCastSteel: new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.68, roughness: 0.38 }),
                wheelSteel: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.15 }),
                brakeDiscMat: new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.88, roughness: 0.20, emissive: 0xef4444, emissiveIntensity: 0.02 }),
                tractionMotorMat: new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.70, roughness: 0.28, emissive: 0x0d9488, emissiveIntensity: 0.14 }),
                fuelTankMat: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.58, roughness: 0.42 }),
                dynamicBrakeGridMat: new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.72, roughness: 0.28, emissive: 0xef4444, emissiveIntensity: 0.05 }),
                berthBlueMat: new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.15, roughness: 0.62 }),
                execChairMat: new THREE.MeshStandardMaterial({ color: 0x991b1b, metalness: 0.22, roughness: 0.52 }),
                coachFloorMat: new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.2, roughness: 0.72 }),
                partitionCreamMat: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.15, roughness: 0.48 }),
                dgGreenMat: new THREE.MeshStandardMaterial({ color: 0x059669, metalness: 0.58, roughness: 0.32 })
            };
""")
print("Script Part A appended.")
'''

with open(builder_path, "w", encoding="utf-8") as f:
    f.write(code)
print("generate_full_html.py ready.")
