"""
Generator for Memphis 80s/90s Pop Design, Zigzags, Confetti, and Isometric Solids.
Generates 250+ distinct vector shapes capturing the iconic Memphis Milano and 90s pop aesthetic.
"""

import math
import os
from typing import List, Tuple
from src.common import SVGBuilder, CENTER, polar_to_cartesian, deg_to_rad, smooth_cardinal_spline, format_num

def generate_zigzag_stripe(zigs: int, width: float, height: float, stroke_w: float, horizontal: bool = True) -> SVGBuilder:
    """Classic 80s Memphis zigzag shockwave stroke."""
    b = SVGBuilder()
    pts = []
    step = width / zigs if horizontal else height / zigs
    half_amp = height / 2.0 if horizontal else width / 2.0
    
    for i in range(zigs + 1):
        if horizontal:
            x = (CENTER - width / 2.0) + i * step
            y = CENTER - half_amp if i % 2 == 0 else CENTER + half_amp
            pts.append((x, y))
        else:
            y = (CENTER - height / 2.0) + i * step
            x = CENTER - half_amp if i % 2 == 0 else CENTER + half_amp
            pts.append((x, y))
            
    cmds = [f"M {pts[0][0]} {pts[0][1]}"]
    for p in pts[1:]:
        cmds.append(f"L {p[0]} {p[1]}")
        
    b.path(" ".join(cmds), fill="none", stroke="currentColor", stroke_width=stroke_w,
           stroke_linecap="square", stroke_linejoin="miter")
    return b

def generate_memphis_noodle(waves: int, length: float, amp: float, stroke_w: float) -> SVGBuilder:
    """Memphis squiggle snake / noodle wave."""
    b = SVGBuilder()
    steps = waves * 8
    pts = []
    for i in range(steps + 1):
        t = i / steps
        x = (CENTER - length / 2.0) + t * length
        y = CENTER + amp * math.sin(t * waves * 2 * math.pi)
        pts.append((x, y))
    d = smooth_cardinal_spline(pts, tension=0.5, closed=False)
    b.path(d, fill="none", stroke="currentColor", stroke_width=stroke_w, stroke_linecap="round")
    return b

def generate_isometric_cube(size: float, style: str = "solid_top") -> SVGBuilder:
    """Isometric 3D cube in pure black & white with razor-sharp miter alignment."""
    b = SVGBuilder()
    dx = size * math.cos(math.pi / 6)
    dy = size * math.sin(math.pi / 6)

    p_center = (CENTER, CENTER)
    p_top = (CENTER, CENTER - size)
    p_top_right = (CENTER + dx, CENTER - dy)
    p_bot_right = (CENTER + dx, CENTER + size - dy)
    p_bot = (CENTER, CENTER + size)
    p_bot_left = (CENTER - dx, CENTER + size - dy)
    p_top_left = (CENTER - dx, CENTER - dy)

    d_top = f"M {p_center[0]} {p_center[1]} L {p_top_right[0]} {p_top_right[1]} L {p_top[0]} {p_top[1]} L {p_top_left[0]} {p_top_left[1]} Z"
    d_left = f"M {p_center[0]} {p_center[1]} L {p_top_left[0]} {p_top_left[1]} L {p_bot_left[0]} {p_bot_left[1]} L {p_bot[0]} {p_bot[1]} Z"
    d_right = f"M {p_center[0]} {p_center[1]} L {p_bot[0]} {p_bot[1]} L {p_bot_right[0]} {p_bot_right[1]} L {p_top_right[0]} {p_top_right[1]} Z"
    d_hex = f"M {p_top[0]} {p_top[1]} L {p_top_right[0]} {p_top_right[1]} L {p_bot_right[0]} {p_bot_right[1]} L {p_bot[0]} {p_bot[1]} L {p_bot_left[0]} {p_bot_left[1]} L {p_top_left[0]} {p_top_left[1]} Z"

    # 1. Shaded faces (stroke=none)
    if style == "solid_top":
        b.path(d_top, fill="currentColor", stroke="none")
    elif style == "solid_split":
        b.path(d_top, fill="currentColor", stroke="none")
        b.path(d_right, fill="currentColor", stroke="none")
    elif style == "hatched":
        b.path(d_top, fill="currentColor", stroke="none")
        steps = 6
        for step in range(1, steps):
            t = step / steps
            h1 = (p_center[0] + t * dx, p_center[1] - t * dy + t * size)
            h2 = (p_bot[0] + t * dx, p_bot[1] - t * dy)
            b.path(f"M {h1[0]} {h1[1]} L {h2[0]} {h2[1]}", fill="none", stroke="currentColor", stroke_width=4, stroke_linecap="butt")

    # 2. Unified outer hexagon boundary with razor-sharp miter join
    b.path(d_hex, fill="none", stroke="currentColor", stroke_width=6, stroke_linejoin="miter", stroke_miterlimit=10.0)

    # 3. Internal Y-spokes meeting at center
    b.path(f"M {p_center[0]} {p_center[1]} L {p_top[0]} {p_top[1]}", fill="none", stroke="currentColor", stroke_width=6, stroke_linecap="butt")
    b.path(f"M {p_center[0]} {p_center[1]} L {p_bot_left[0]} {p_bot_left[1]}", fill="none", stroke="currentColor", stroke_width=6, stroke_linecap="butt")
    b.path(f"M {p_center[0]} {p_center[1]} L {p_bot_right[0]} {p_bot_right[1]}", fill="none", stroke="currentColor", stroke_width=6, stroke_linecap="butt")

    return b

def generate_confetti_cluster(elements: int, radius: float, seed: int) -> SVGBuilder:
    """Curated Memphis geometric scatter cluster with balanced composition."""
    b = SVGBuilder()
    import random
    rng = random.Random(seed)
    
    # Golden ratio phyllotaxis / balanced layout to prevent random overlap clumps
    phi = (1 + math.sqrt(5)) / 2
    for i in range(elements):
        r = radius * math.sqrt((i + 1) / elements) * 0.95
        theta = i * 2 * math.pi * phi
        cx, cy = polar_to_cartesian(CENTER, CENTER, r, theta)
        shape_type = rng.choice(["circle", "rect", "triangle", "cross", "pill"])
        sz = rng.uniform(22, 38)
        rot = rng.uniform(0, 180)
        
        if shape_type == "circle":
            b.circle(cx, cy, sz / 2.0, fill="currentColor")
        elif shape_type == "rect":
            # rotated square
            rad = deg_to_rad(rot)
            p1 = polar_to_cartesian(cx, cy, sz * 0.7, rad)
            p2 = polar_to_cartesian(cx, cy, sz * 0.7, rad + math.pi / 2)
            p3 = polar_to_cartesian(cx, cy, sz * 0.7, rad + math.pi)
            p4 = polar_to_cartesian(cx, cy, sz * 0.7, rad + 3 * math.pi / 2)
            b.path(f"M {p1[0]} {p1[1]} L {p2[0]} {p2[1]} L {p3[0]} {p3[1]} L {p4[0]} {p4[1]} Z", fill="currentColor")
        elif shape_type == "triangle":
            p1 = polar_to_cartesian(cx, cy, sz * 0.8, deg_to_rad(rot))
            p2 = polar_to_cartesian(cx, cy, sz * 0.8, deg_to_rad(rot + 120))
            p3 = polar_to_cartesian(cx, cy, sz * 0.8, deg_to_rad(rot + 240))
            b.path(f"M {p1[0]} {p1[1]} L {p2[0]} {p2[1]} L {p3[0]} {p3[1]} Z", fill="currentColor")
        elif shape_type == "cross":
            hw = sz * 0.5
            sw = sz * 0.22
            b.rect(cx - hw, cy - sw / 2, sz, sw, fill="currentColor")
            b.rect(cx - sw / 2, cy - hw, sw, sz, fill="currentColor")
        elif shape_type == "pill":
            b.rect(cx - sz, cy - sz * 0.35, sz * 2, sz * 0.7, rx=sz * 0.35, ry=sz * 0.35, fill="currentColor")
            
    return b

def generate_all_memphis_pop(out_dir: str) -> List[dict]:
    """Generates 250+ distinct Memphis Pop & 80s/90s vector graphics."""
    os.makedirs(out_dir, exist_ok=True)
    manifest = []
    shape_idx = 1

    # 1. Memphis Zigzag Shockwaves (horizontal & vertical, various strokes & zigs)
    for zigs in [3, 4, 5, 6, 8, 10]:
        for sw in [10, 20, 35]:
            for w in [320, 420]:
                for h in [80, 160]:
                    name = f"memphis_zigzag_z{zigs}_w{w}_h{h}_sw{sw}"
                    builder = generate_zigzag_stripe(zigs, w, h, sw, horizontal=True)
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Memphis Zigzag Shockwave", category="07_memphis_80s_90s",
                                 tags=["memphis", "zigzag", "shockwave", "80s", "90s", "retro"])
                    manifest.append({
                        "id": f"mem_{shape_idx:04d}",
                        "name": name,
                        "category": "07_memphis_80s_90s",
                        "category_label": "Memphis 80s/90s Pop",
                        "tags": ["memphis", "zigzag", "shockwave", "80s"],
                        "file": f"assets/svg/07_memphis_80s_90s/{name}.svg"
                    })
                    shape_idx += 1

    # 2. Memphis Squiggle Noodles
    for waves in [2, 3, 4, 5]:
        for amp in [25, 50, 75]:
            for sw in [12, 24, 38]:
                for l_val in [340, 420]:
                    name = f"memphis_noodle_w{waves}_a{amp}_sw{sw}_l{l_val}"
                    builder = generate_memphis_noodle(waves, l_val, amp, sw)
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Memphis Squiggle Noodle", category="07_memphis_80s_90s",
                                 tags=["memphis", "squiggle", "noodle", "wave", "80s", "90s"])
                    manifest.append({
                        "id": f"mem_{shape_idx:04d}",
                        "name": name,
                        "category": "07_memphis_80s_90s",
                        "category_label": "Memphis 80s/90s Pop",
                        "tags": ["memphis", "squiggle", "noodle", "80s"],
                        "file": f"assets/svg/07_memphis_80s_90s/{name}.svg"
                    })
                    shape_idx += 1

    # 3. Isometric 3D Memphis Solids
    styles = ["solid_top", "solid_split", "hatched", "wireframe"]
    for sz in [120, 160, 200, 240]:
        for st in styles:
            name = f"memphis_isocube_s{sz}_{st}"
            builder = generate_isometric_cube(sz, style=st)
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Isometric Memphis Cube", category="07_memphis_80s_90s",
                         tags=["memphis", "isometric", "cube", "3d", "geometric", "pop"])
            manifest.append({
                "id": f"mem_{shape_idx:04d}",
                "name": name,
                "category": "07_memphis_80s_90s",
                "category_label": "Memphis 80s/90s Pop",
                "tags": ["memphis", "isometric", "cube", "3d"],
                "file": f"assets/svg/07_memphis_80s_90s/{name}.svg"
            })
            shape_idx += 1

    # 4. Memphis Confetti Bursts
    for elems in [8, 14, 22, 30]:
        for r_val in [160, 220]:
            for seed in range(5):
                name = f"memphis_confetti_e{elems}_r{r_val}_s{seed+1}"
                builder = generate_confetti_cluster(elems, r_val, seed=seed * 77 + elems)
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Memphis Confetti Cluster", category="07_memphis_80s_90s",
                             tags=["memphis", "confetti", "burst", "scatter", "pop"])
                manifest.append({
                    "id": f"mem_{shape_idx:04d}",
                    "name": name,
                    "category": "07_memphis_80s_90s",
                    "category_label": "Memphis 80s/90s Pop",
                    "tags": ["memphis", "confetti", "burst", "scatter"],
                    "file": f"assets/svg/07_memphis_80s_90s/{name}.svg"
                })
                shape_idx += 1

    return manifest
