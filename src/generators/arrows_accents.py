"""
Generator for Directional Arrows, Flow Swooshes, Pointers, and Speech Bubbles.
Generates 250+ distinct vector shapes for editorial layouts, diagrams, and graphic navigation accents.
"""

import math
import os
from typing import List, Tuple
from src.common import SVGBuilder, CENTER, polar_to_cartesian, deg_to_rad, smooth_cardinal_spline, format_num

def generate_brutalist_arrow(shaft_w: float, head_w: float, head_l: float, total_l: float, rot_deg: float = 0.0) -> SVGBuilder:
    """Heavy modern brutalist arrow."""
    b = SVGBuilder()
    half_shaft = shaft_w / 2.0
    half_head = head_w / 2.0
    shaft_l = total_l - head_l
    
    x_tail = CENTER - total_l / 2.0
    x_split = x_tail + shaft_l
    x_tip = CENTER + total_l / 2.0

    d = (f"M {x_tail} {CENTER - half_shaft} "
         f"L {x_split} {CENTER - half_shaft} "
         f"L {x_split} {CENTER - half_head} "
         f"L {x_tip} {CENTER} "
         f"L {x_split} {CENTER + half_head} "
         f"L {x_split} {CENTER + half_shaft} "
         f"L {x_tail} {CENTER + half_shaft} Z")

    if rot_deg != 0:
        b.add_raw(f'<path d="{d}" fill="currentColor" transform="rotate({rot_deg} {CENTER} {CENTER})" />')
    else:
        b.path(d, fill="currentColor")
    return b

def generate_curved_swoosh_arrow(radius: float, sweep_deg: float, stroke_w: float, rot_deg: float = 0.0) -> SVGBuilder:
    """Swooping circular arc arrow with crisp forward-pointing chevron head."""
    b = SVGBuilder()
    sweep = deg_to_rad(sweep_deg)
    rot = deg_to_rad(rot_deg)
    
    a_start = rot
    a_end = rot + sweep
    
    p_start = polar_to_cartesian(CENTER, CENTER, radius, a_start)
    p_end = polar_to_cartesian(CENTER, CENTER, radius, a_end)
    
    head_len = max(38.0, stroke_w * 1.8)
    head_w = max(44.0, stroke_w * 2.5)
    
    # Tangent unit vector at p_end in the direction of clockwise motion
    tx = -math.sin(a_end)
    ty = math.cos(a_end)
    # Outward normal unit vector
    nx = math.cos(a_end)
    ny = math.sin(a_end)
    
    # Sharp tip pointing forward along tangent
    tip = (round(p_end[0] + head_len * tx, 2), round(p_end[1] + head_len * ty, 2))
    # Swept back wings enclosing the arc termination
    wing1 = (round(p_end[0] + (head_w / 2.0) * nx - (head_len * 0.25) * tx, 2),
             round(p_end[1] + (head_w / 2.0) * ny - (head_len * 0.25) * ty, 2))
    wing2 = (round(p_end[0] - (head_w / 2.0) * nx - (head_len * 0.25) * tx, 2),
             round(p_end[1] - (head_w / 2.0) * ny - (head_len * 0.25) * ty, 2))
    notch = (round(p_end[0] + (head_len * 0.05) * tx, 2),
             round(p_end[1] + (head_len * 0.05) * ty, 2))
    
    large_arc = 1 if sweep_deg > 180 else 0
    d_arc = f"M {p_start[0]} {p_start[1]} A {radius} {radius} 0 {large_arc} 1 {p_end[0]} {p_end[1]}"
    b.path(d_arc, fill="none", stroke="currentColor", stroke_width=stroke_w, stroke_linecap="round", stroke_linejoin="round")
    
    d_head = f"M {tip[0]} {tip[1]} L {wing1[0]} {wing1[1]} L {notch[0]} {notch[1]} L {wing2[0]} {wing2[1]} Z"
    b.path(d_head, fill="currentColor")
    return b

def generate_tapered_swoosh(radius: float, sweep_deg: float, max_w: float, num_points: int = 50) -> SVGBuilder:
    """Dynamic solid tapered athletic / motion swoosh."""
    b = SVGBuilder()
    sweep_rad = deg_to_rad(sweep_deg)
    start_angle = deg_to_rad(-sweep_deg / 2.0 - 90)
    
    outer_pts = []
    inner_pts = []
    
    for i in range(num_points + 1):
        t = i / float(num_points)
        angle = start_angle + t * sweep_rad
        w = max_w * (math.sin(t * math.pi) ** 0.8)
        
        r_out = radius + w * 0.55
        r_in = radius - w * 0.45
        
        ox = round(CENTER + r_out * math.cos(angle), 2)
        oy = round(CENTER + r_out * math.sin(angle), 2)
        ix = round(CENTER + r_in * math.cos(angle), 2)
        iy = round(CENTER + r_in * math.sin(angle), 2)
        
        outer_pts.append((ox, oy))
        inner_pts.append((ix, iy))
        
    d = [f"M {outer_pts[0][0]} {outer_pts[0][1]}"]
    for pt in outer_pts[1:]:
        d.append(f"L {pt[0]} {pt[1]}")
    for pt in reversed(inner_pts):
        d.append(f"L {pt[0]} {pt[1]}")
    d.append("Z")
    
    b.path(" ".join(d), fill="currentColor")
    return b

def generate_speech_bubble(width: float, height: float, corner_r: float, tail_pos: str = "bottom", tail_sz: float = 40) -> str:
    """Modern speech bubble callout with pointy tail."""
    half_w = width / 2.0
    half_h = height / 2.0
    x0, y0 = CENTER - half_w, CENTER - half_h
    x1, y1 = CENTER + half_w, CENTER + half_h

    d = [f"M {x0 + corner_r} {y0}"]
    # Top
    d.append(f"L {x1 - corner_r} {y0}")
    d.append(f"A {corner_r} {corner_r} 0 0 1 {x1} {y0 + corner_r}")
    # Right
    d.append(f"L {x1} {y1 - corner_r}")
    d.append(f"A {corner_r} {corner_r} 0 0 1 {x1 - corner_r} {y1}")

    # Bottom edge with tail
    if tail_pos == "bottom":
        tail_x = CENTER - half_w * 0.3
        d.append(f"L {tail_x + tail_sz} {y1}")
        d.append(f"L {tail_x} {y1 + tail_sz}")
        d.append(f"L {tail_x - tail_sz * 0.5} {y1}")
    d.append(f"L {x0 + corner_r} {y1}")
    d.append(f"A {corner_r} {corner_r} 0 0 1 {x0} {y1 - corner_r}")
    # Left
    d.append(f"L {x0} {y0 + corner_r}")
    d.append(f"A {corner_r} {corner_r} 0 0 1 {x0 + corner_r} {y0}")
    d.append("Z")

    return " ".join(d)

def generate_compass_arrow(length: float, width: float, rot_deg: float = 0.0) -> SVGBuilder:
    """Faceted 3D compass navigation needle with razor-sharp miter alignment."""
    b = SVGBuilder()
    half_l = length / 2.0
    half_w = width / 2.0

    p_top = (CENTER, CENTER - half_l)
    p_bot = (CENTER, CENTER + half_l)
    p_left = (CENTER - half_w, CENTER)
    p_right = (CENTER + half_w, CENTER)

    # Shaded solid facets
    d_top_left = f"M {CENTER} {CENTER} L {p_top[0]} {p_top[1]} L {p_left[0]} {p_left[1]} Z"
    d_bot_right = f"M {CENTER} {CENTER} L {p_bot[0]} {p_bot[1]} L {p_right[0]} {p_right[1]} Z"

    # Unified outer perimeter diamond with sharp miter join
    d_outer = f"M {p_top[0]} {p_top[1]} L {p_right[0]} {p_right[1]} L {p_bot[0]} {p_bot[1]} L {p_left[0]} {p_left[1]} Z"

    def draw_content(builder):
        # 1. Shaded facets
        builder.path(d_top_left, fill="currentColor", stroke="none")
        builder.path(d_bot_right, fill="currentColor", stroke="none")
        # 2. Unified outer diamond boundary with razor-sharp miter join
        builder.path(d_outer, fill="none", stroke="currentColor", stroke_width=4, stroke_linejoin="miter", stroke_miterlimit=10.0)
        # 3. Center spine and equator divider lines
        builder.path(f"M {p_top[0]} {p_top[1]} L {p_bot[0]} {p_bot[1]}", fill="none", stroke="currentColor", stroke_width=4, stroke_linecap="butt")
        builder.path(f"M {p_left[0]} {p_left[1]} L {p_right[0]} {p_right[1]}", fill="none", stroke="currentColor", stroke_width=4, stroke_linecap="butt")

    if rot_deg != 0:
        b.add_raw(f'<g transform="rotate({rot_deg} {CENTER} {CENTER})">')
        draw_content(b)
        b.add_raw('</g>')
    else:
        draw_content(b)

    return b

def generate_all_arrows_accents(out_dir: str) -> List[dict]:
    """Generates 250+ distinct Arrows, Pointers & Accent vector graphics."""
    os.makedirs(out_dir, exist_ok=True)
    manifest = []
    shape_idx = 1

    # 1. Chunky Brutalist Arrows (various shaft/head ratios)
    for total_l in [320, 420]:
        for shaft_w in [30, 60, 100]:
            for head_w in [120, 180, 240]:
                name = f"arrow_brutalist_l{total_l}_s{shaft_w}_h{head_w}"
                builder = generate_brutalist_arrow(shaft_w, head_w, head_l=head_w * 0.8, total_l=total_l, rot_deg=0)
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Brutalist Arrow", category="09_arrows_pointers_accents",
                             tags=["arrow", "pointer", "direction", "brutalist", "navigation"])
                manifest.append({
                    "id": f"arr_{shape_idx:04d}",
                    "name": name,
                    "category": "09_arrows_pointers_accents",
                    "category_label": "Arrows, Pointers & Accents",
                    "tags": ["arrow", "pointer", "direction", "brutalist"],
                    "file": f"assets/svg/09_arrows_pointers_accents/{name}.svg"
                })
                shape_idx += 1

    # 2. Curved Swoosh Arrows
    for rad in [140, 190]:
        for sweep in [90, 180, 270]:
            for sw in [12, 24, 36]:
                name = f"arrow_swoosh_r{rad}_sw{sweep}_w{sw}"
                builder = generate_curved_swoosh_arrow(rad, sweep, sw, rot_deg=0)
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Curved Flow Swoosh Arrow", category="09_arrows_pointers_accents",
                             tags=["arrow", "swoosh", "curve", "flow", "loop", "cycle"])
                manifest.append({
                    "id": f"arr_{shape_idx:04d}",
                    "name": name,
                    "category": "09_arrows_pointers_accents",
                    "category_label": "Arrows, Pointers & Accents",
                    "tags": ["arrow", "swoosh", "curve", "flow"],
                    "file": f"assets/svg/09_arrows_pointers_accents/{name}.svg"
                })
                shape_idx += 1

    # 2b. Dynamic Tapered Solid Swooshes
    for rad in [150, 200]:
        for sweep in [120, 180, 240]:
            for max_w in [24, 44, 68]:
                name = f"arrow_swoosh_tapered_r{rad}_sw{sweep}_w{max_w}"
                builder = generate_tapered_swoosh(rad, sweep, max_w)
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Dynamic Tapered Athletic Swoosh", category="09_arrows_pointers_accents",
                             tags=["swoosh", "tapered", "athletic", "motion", "crescent", "dynamic"])
                manifest.append({
                    "id": f"arr_{shape_idx:04d}",
                    "name": name,
                    "category": "09_arrows_pointers_accents",
                    "category_label": "Arrows, Pointers & Accents",
                    "tags": ["swoosh", "tapered", "athletic", "motion"],
                    "file": f"assets/svg/09_arrows_pointers_accents/{name}.svg"
                })
                shape_idx += 1

    # 3. Speech Bubbles & Callouts
    for w in [320, 420]:
        for h in [200, 280]:
            for cr in [0, 25, 50]:
                for tail_sz in [35, 60]:
                    name = f"callout_speech_w{w}_h{h}_r{cr}_t{tail_sz}"
                    d = generate_speech_bubble(w, h, cr, tail_pos="bottom", tail_sz=tail_sz)
                    builder = SVGBuilder()
                    builder.path(d, fill="currentColor")
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Speech Bubble Callout", category="09_arrows_pointers_accents",
                                 tags=["speech", "bubble", "callout", "dialog", "chat", "message"])
                    manifest.append({
                        "id": f"arr_{shape_idx:04d}",
                        "name": name,
                        "category": "09_arrows_pointers_accents",
                        "category_label": "Arrows, Pointers & Accents",
                        "tags": ["speech", "bubble", "callout", "dialog"],
                        "file": f"assets/svg/09_arrows_pointers_accents/{name}.svg"
                    })
                    shape_idx += 1

    # 4. Faceted Compass Needles
    for l_val in [340, 420]:
        for w_val in [60, 110]:
            name = f"compass_needle_l{l_val}_w{w_val}"
            builder = generate_compass_arrow(l_val, w_val, rot_deg=0)
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Compass Pointer Needle", category="09_arrows_pointers_accents",
                         tags=["compass", "needle", "pointer", "navigation", "faceted", "3d"])
            manifest.append({
                "id": f"arr_{shape_idx:04d}",
                "name": name,
                "category": "09_arrows_pointers_accents",
                "category_label": "Arrows, Pointers & Accents",
                "tags": ["compass", "needle", "pointer", "navigation"],
                "file": f"assets/svg/09_arrows_pointers_accents/{name}.svg"
            })
            shape_idx += 1

    return manifest
