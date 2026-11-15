"""
Procedural 3D Drone Model Generator
Uses pure Python + numpy + trimesh (with pure math fallback if trimesh is pending)
to produce a complete watertight 3D Model with GLTF / OBJ export.
"""

import sys
import os
import math
import numpy as np

def create_cylinder(radius=1.0, height=2.0, segments=32):
    """Generates vertices and faces for a closed cylinder."""
    vertices = []
    faces = []
    
    # Top and bottom center points
    top_center = [0.0, height / 2.0, 0.0]
    bottom_center = [0.0, -height / 2.0, 0.0]
    vertices.append(top_center)    # index 0
    vertices.append(bottom_center) # index 1
    
    top_indices = []
    bot_indices = []
    
    for i in range(segments):
        theta = 2.0 * math.pi * i / segments
        x = radius * math.cos(theta)
        z = radius * math.sin(theta)
        
        top_idx = len(vertices)
        vertices.append([x, height / 2.0, z])
        top_indices.append(top_idx)
        
        bot_idx = len(vertices)
        vertices.append([x, -height / 2.0, z])
        bot_indices.append(bot_idx)
        
    for i in range(segments):
        next_i = (i + 1) % segments
        t1, t2 = top_indices[i], top_indices[next_i]
        b1, b2 = bot_indices[i], bot_indices[next_i]
        
        # Side quad -> 2 triangles
        faces.append([t1, b1, b2])
        faces.append([t1, b2, t2])
        
        # Top cap
        faces.append([0, t1, t2])
        # Bottom cap
        faces.append([1, b2, b1])
        
    return np.array(vertices, dtype=np.float32), np.array(faces, dtype=np.int32)

def create_box(extents=(1.0, 1.0, 1.0)):
    """Generates a box mesh centered at origin."""
    dx, dy, dz = extents[0] / 2.0, extents[1] / 2.0, extents[2] / 2.0
    vertices = np.array([
        [-dx, -dy, -dz], [dx, -dy, -dz], [dx, dy, -dz], [-dx, dy, -dz],
        [-dx, -dy, dz],  [dx, -dy, dz],  [dx, dy, dz],  [-dx, dy, dz]
    ], dtype=np.float32)
    
    faces = np.array([
        [0, 2, 1], [0, 3, 2], # -Z
        [4, 5, 6], [4, 6, 7], # +Z
        [0, 1, 5], [0, 5, 4], # -Y
        [3, 6, 2], [3, 7, 6], # +Y
        [0, 4, 7], [0, 7, 3], # -X
        [1, 2, 6], [1, 6, 5]  # +X
    ], dtype=np.int32)
    return vertices, faces

def transform_mesh(vertices, translation=(0, 0, 0), rotation=(0, 0, 0), scale=(1, 1, 1)):
    """Applies Scale -> Rotation (Euler XYZ) -> Translation."""
    v = vertices * np.array(scale, dtype=np.float32)
    
    rx, ry, rz = rotation
    # Rotation matrices
    Rx = np.array([[1, 0, 0], [0, math.cos(rx), -math.sin(rx)], [0, math.sin(rx), math.cos(rx)]])
    Ry = np.array([[math.cos(ry), 0, math.sin(ry)], [0, 1, 0], [-math.sin(ry), 0, math.cos(ry)]])
    Rz = np.array([[math.cos(rz), -math.sin(rz), 0], [math.sin(rz), math.cos(rz), 0], [0, 0, 1]])
    R = Rz @ Ry @ Rx
    
    v = (R @ v.T).T
    v += np.array(translation, dtype=np.float32)
    return v

def combine_meshes(mesh_list):
    """Combines a list of (vertices, faces) tuples into a unified mesh."""
    all_v = []
    all_f = []
    v_offset = 0
    for v, f in mesh_list:
        all_v.append(v)
        all_f.append(f + v_offset)
        v_offset += len(v)
    return np.vstack(all_v), np.vstack(all_f)

def build_cyber_drone():
    """Builds a complete multi-part sci-fi drone."""
    parts = []
    
    # 1. Main Aerodynamic Fuselage (Central Body)
    body_v, body_f = create_box(extents=(1.8, 0.45, 2.6))
    parts.append((body_v, body_f))
    
    # 2. Cockpit / Sensor Dome on top
    cockpit_v, cockpit_f = create_cylinder(radius=0.55, height=0.35, segments=24)
    cockpit_v = transform_mesh(cockpit_v, translation=(0, 0.35, 0.4))
    parts.append((cockpit_v, cockpit_f))
    
    # 3. Main Camera Gimbal on nose
    gimbal_v, gimbal_f = create_cylinder(radius=0.28, height=0.4, segments=16)
    gimbal_v = transform_mesh(gimbal_v, translation=(0, -0.15, 1.4), rotation=(math.pi/2, 0, 0))
    parts.append((gimbal_v, gimbal_f))
    
    # 4. Quad Rotor Booms (4 structural carbon-fiber arms)
    boom_angles = [math.pi/4, 3*math.pi/4, 5*math.pi/4, 7*math.pi/4]
    arm_length = 2.4
    
    for idx, angle in enumerate(boom_angles):
        bx = arm_length * math.cos(angle)
        bz = arm_length * math.sin(angle)
        
        # Arm strut
        arm_v, arm_f = create_cylinder(radius=0.08, height=arm_length, segments=12)
        # Point towards rotor hub
        arm_v = transform_mesh(arm_v, 
                               translation=(bx / 2.0, 0.05, bz / 2.0),
                               rotation=(math.pi/2, 0, -angle + math.pi/2))
        parts.append((arm_v, arm_f))
        
        # Motor Pod
        motor_v, motor_f = create_cylinder(radius=0.32, height=0.4, segments=20)
        motor_v = transform_mesh(motor_v, translation=(bx, 0.15, bz))
        parts.append((motor_v, motor_f))
        
        # Rotor Blades (Double blade per motor)
        blade_v, blade_f = create_box(extents=(1.2, 0.02, 0.14))
        blade_v = transform_mesh(blade_v, translation=(bx, 0.38, bz), rotation=(0, angle + 0.3, 0))
        parts.append((blade_v, blade_f))
        
    # 5. Dual Landing Skids
    for side in [-0.85, 0.85]:
        # Horizontal rail
        skid_v, skid_f = create_cylinder(radius=0.06, height=2.8, segments=12)
        skid_v = transform_mesh(skid_v, translation=(side, -0.65, 0), rotation=(math.pi/2, 0, 0))
        parts.append((skid_v, skid_f))
        
        # Vertical struts
        for z_pos in [-0.7, 0.7]:
            strut_v, strut_f = create_cylinder(radius=0.05, height=0.55, segments=10)
            strut_v = transform_mesh(strut_v, translation=(side, -0.38, z_pos))
            parts.append((strut_v, strut_f))
            
    # Combine everything
    drone_v, drone_f = combine_meshes(parts)
    return drone_v, drone_f

def export_obj(vertices, faces, filepath):
    """Exports geometry to clean standard Wavefront OBJ."""
    with open(filepath, 'w') as f:
        f.write("# Procedural 3D Drone Model generated via Code-as-Geometry paradigm\n")
        f.write(f"# Vertices: {len(vertices)}, Faces: {len(faces)}\n")
        for v in vertices:
            f.write(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
        for face in faces:
            # OBJ indices are 1-based
            f.write(f"f {face[0]+1} {face[1]+1} {face[2]+1}\n")
    print(f"Exported OBJ: {filepath} ({len(vertices)} vertices, {len(faces)} faces)")

if __name__ == "__main__":
    out_dir = r"e:\Rudranildocs0066543\html-yt"
    obj_path = os.path.join(out_dir, "drone_model.obj")
    
    verts, faces = build_cyber_drone()
    export_obj(verts, faces, obj_path)
    
    # Try trimesh export for GLB/GLTF if available
    try:
        import trimesh
        mesh = trimesh.Trimesh(vertices=verts, faces=faces)
        glb_path = os.path.join(out_dir, "drone_model.glb")
        mesh.export(glb_path)
        print(f"Exported GLB: {glb_path} (Is watertight: {mesh.is_watertight})")
    except Exception as e:
        print(f"GLB export note: {e}")

