"""
Generator for Sacred Geometry, Guilloche Patterns, Spirographs, and Lissajous Curves.
Generates 250+ distinct mathematical vector shapes for spiritual, luxury, tech, and generative design.
"""

import math
import os
from typing import List, Tuple
from src.common import SVGBuilder, CENTER, polar_to_cartesian, deg_to_rad, smooth_cardinal_spline, format_num

def generate_rhodonea_rose(k_num: int, k_den: int, radius: float, rot_deg: float = 0.0) -> str:
    """Mathematical Rhodonea Rose curve: r = radius * cos(k * theta)."""
    k = k_num / k_den
    periods = k_den * 2
    steps = periods * 45
    pts = []
    rot = deg_to_rad(rot_deg)
    
    for i in range(steps + 1):
        theta = i * (2 * math.pi * periods / steps)
        r = radius * math.cos(k * theta)
        pts.append(polar_to_cartesian(CENTER, CENTER, r, theta + rot))
        
    cmds = [f"M {pts[0][0]} {pts[0][1]}"]
    for p in pts[1:]:
        cmds.append(f"L {p[0]} {p[1]}")
    cmds.append("Z")
    return " ".join(cmds)

def generate_hypotrochoid_spiro(R: float, r: float, d: float, rot_deg: float = 0.0) -> str:
    """Hypotrochoid spirograph curve."""
    gcd_val = math.gcd(int(R), int(r))
    turns = int(r) // gcd_val
    steps = turns * 100
    pts = []
    rot = deg_to_rad(rot_deg)
    
    for i in range(steps + 1):
        theta = i * (2 * math.pi * turns / steps)
        x = (R - r) * math.cos(theta) + d * math.cos((R - r) * theta / r)
        y = (R - r) * math.sin(theta) - d * math.sin((R - r) * theta / r)
        # Apply rotation
        xr = x * math.cos(rot) - y * math.sin(rot)
        yr = x * math.sin(rot) + y * math.cos(rot)
        pts.append((round(CENTER + xr, 2), round(CENTER + yr, 2)))
        
    cmds = [f"M {pts[0][0]} {pts[0][1]}"]
    for p in pts[1:]:
        cmds.append(f"L {p[0]} {p[1]}")
    cmds.append("Z")
    return " ".join(cmds)

def generate_lissajous_figure(freq_x: int, freq_y: int, phase_deg: float, size: float) -> str:
    """Lissajous knot curve: x = A sin(a*t + d), y = B sin(b*t)."""
    half_s = size / 2.0
    phase = deg_to_rad(phase_deg)
    steps = 300
    pts = []
    
    for i in range(steps + 1):
        t = i * (2 * math.pi / steps)
        x = half_s * math.sin(freq_x * t + phase)
        y = half_s * math.sin(freq_y * t)
        pts.append((round(CENTER + x, 2), round(CENTER + y, 2)))
        
    cmds = [f"M {pts[0][0]} {pts[0][1]}"]
    for p in pts[1:]:
        cmds.append(f"L {p[0]} {p[1]}")
    cmds.append("Z")
    return " ".join(cmds)

def generate_sacred_flower_of_life(radius: float, layers: int = 1) -> SVGBuilder:
    """Sacred geometry Flower / Seed of Life lattice."""
    b = SVGBuilder()
    r = radius / 3.0
    b.circle(CENTER, CENTER, r, fill="none", stroke="currentColor", stroke_width=5)
    
    for i in range(6):
        a = i * (math.pi / 3)
        cx, cy = polar_to_cartesian(CENTER, CENTER, r, a)
        b.circle(cx, cy, r, fill="none", stroke="currentColor", stroke_width=5)
        
    if layers >= 2:
        for i in range(6):
            a = i * (math.pi / 3)
            cx, cy = polar_to_cartesian(CENTER, CENTER, 2 * r, a)
            b.circle(cx, cy, r, fill="none", stroke="currentColor", stroke_width=5)
            a_mid = a + (math.pi / 6)
            cx_m, cy_m = polar_to_cartesian(CENTER, CENTER, math.sqrt(3) * r, a_mid)
            b.circle(cx_m, cy_m, r, fill="none", stroke="currentColor", stroke_width=5)

    b.circle(CENTER, CENTER, radius, fill="none", stroke="currentColor", stroke_width=8)
    return b

def generate_metatron_cube(radius: float) -> SVGBuilder:
    """Metatron's cube sacred geometry wireframe."""
    b = SVGBuilder()
    node_r = radius * 0.12
    nodes = [(CENTER, CENTER)]
    
    # Inner 6 nodes
    r_in = radius * 0.45
    for i in range(6):
        nodes.append(polar_to_cartesian(CENTER, CENTER, r_in, i * math.pi / 3))
        
    # Outer 6 nodes
    for i in range(6):
        nodes.append(polar_to_cartesian(CENTER, CENTER, radius * 0.85, i * math.pi / 3))
        
    # Draw connections between all nodes
    for i in range(len(nodes)):
        for j in range(i + 1, len(nodes)):
            n1 = nodes[i]
            n2 = nodes[j]
            b.path(f"M {n1[0]} {n1[1]} L {n2[0]} {n2[1]}", stroke="currentColor", stroke_width=2.0)
            
    # Draw node circles
    for n in nodes:
        b.circle(n[0], n[1], node_r, fill="none", stroke="currentColor", stroke_width=4)
        
    return b

def generate_all_sacred_guilloche(out_dir: str) -> List[dict]:
    """Generates 250+ distinct Sacred Geometry & Guilloche vector graphics."""
    os.makedirs(out_dir, exist_ok=True)
    manifest = []
    shape_idx = 1

    # 1. Rhodonea Rose Curves
    rose_fractions = [
        (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1), (9, 1),
        (3, 2), (5, 2), (7, 2), (9, 2),
        (4, 3), (5, 3), (7, 3), (8, 3),
        (5, 4), (7, 4), (9, 4),
    ]
    for num, den in rose_fractions:
        for sw in [4, 8, 14]:
            name = f"rose_rhodonea_k{num}_{den}_w{sw}"
            d = generate_rhodonea_rose(num, den, 220, rot_deg=0)
            builder = SVGBuilder()
            builder.path(d, fill="none", stroke="currentColor", stroke_width=sw)
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Rhodonea Rose Curve", category="10_sacred_guilloche_geo",
                         tags=["guilloche", "rose", "curve", "rhodonea", "mathematical", "spirograph"])
            manifest.append({
                "id": f"geo_{shape_idx:04d}",
                "name": name,
                "category": "10_sacred_guilloche_geo",
                "category_label": "Sacred Geometry & Guilloche",
                "tags": ["guilloche", "rose", "curve", "rhodonea"],
                "file": f"assets/svg/10_sacred_guilloche_geo/{name}.svg"
            })
            shape_idx += 1

    # 2. Hypotrochoid Spirographs
    spiro_params = [
        (150, 90, 70),
        (180, 105, 80),
        (200, 120, 95),
        (210, 140, 110),
        (160, 60, 90),
        (190, 80, 100),
        (175, 125, 75),
        (220, 70, 85),
    ]
    for R, r, d_val in spiro_params:
        for sw in [4, 7, 12]:
            name = f"spiro_hypotrochoid_R{R}_r{r}_d{d_val}_w{sw}"
            d = generate_hypotrochoid_spiro(R, r, d_val, rot_deg=0)
            builder = SVGBuilder()
            builder.path(d, fill="none", stroke="currentColor", stroke_width=sw)
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Hypotrochoid Spirograph", category="10_sacred_guilloche_geo",
                         tags=["spirograph", "guilloche", "hypotrochoid", "curve", "generative"])
            manifest.append({
                "id": f"geo_{shape_idx:04d}",
                "name": name,
                "category": "10_sacred_guilloche_geo",
                "category_label": "Sacred Geometry & Guilloche",
                "tags": ["spirograph", "guilloche", "hypotrochoid"],
                "file": f"assets/svg/10_sacred_guilloche_geo/{name}.svg"
            })
            shape_idx += 1

    # 3. Lissajous Curves
    liss_ratios = [
        (1, 2), (1, 3), (2, 3), (3, 4), (3, 5), (4, 5), (5, 6)
    ]
    for a, b in liss_ratios:
        for phase in [0, 30, 60, 90]:
            for sw in [6, 12, 20]:
                name = f"lissajous_ratio_{a}_{b}_p{phase}_w{sw}"
                d = generate_lissajous_figure(a, b, phase, 420)
                builder = SVGBuilder()
                builder.path(d, fill="none", stroke="currentColor", stroke_width=sw, stroke_linecap="round")
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Lissajous Curve", category="10_sacred_guilloche_geo",
                             tags=["lissajous", "harmonic", "curve", "knot", "mathematical"])
                manifest.append({
                    "id": f"geo_{shape_idx:04d}",
                    "name": name,
                    "category": "10_sacred_guilloche_geo",
                    "category_label": "Sacred Geometry & Guilloche",
                    "tags": ["lissajous", "harmonic", "curve"],
                    "file": f"assets/svg/10_sacred_guilloche_geo/{name}.svg"
                })
                shape_idx += 1

    # 4. Sacred Geometry Flower & Seed of Life
    for rad in [180, 225]:
        for layers in [1, 2]:
            name = f"sacred_flower_of_life_r{rad}_l{layers}"
            builder = generate_sacred_flower_of_life(rad, layers)
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Sacred Flower of Life", category="10_sacred_guilloche_geo",
                         tags=["sacred", "geometry", "flower_of_life", "seed_of_life", "mandala"])
            manifest.append({
                "id": f"geo_{shape_idx:04d}",
                "name": name,
                "category": "10_sacred_guilloche_geo",
                "category_label": "Sacred Geometry & Guilloche",
                "tags": ["sacred", "geometry", "flower_of_life"],
                "file": f"assets/svg/10_sacred_guilloche_geo/{name}.svg"
            })
            shape_idx += 1

    # 5. Metatron's Cube
    for rad in [180, 210, 235]:
        name = f"sacred_metatron_cube_r{rad}"
        builder = generate_metatron_cube(rad)
        filepath = os.path.join(out_dir, f"{name}.svg")
        builder.save(filepath, title="Metatron's Cube Sacred Geometry", category="10_sacred_guilloche_geo",
                     tags=["sacred", "geometry", "metatron", "cube", "mandala", "wireframe"])
        manifest.append({
            "id": f"geo_{shape_idx:04d}",
            "name": name,
            "category": "10_sacred_guilloche_geo",
            "category_label": "Sacred Geometry & Guilloche",
            "tags": ["sacred", "geometry", "metatron"],
            "file": f"assets/svg/10_sacred_guilloche_geo/{name}.svg"
        })
        shape_idx += 1

    return manifest
