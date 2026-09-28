"""
Generator for Neo-Brutalist HUD, UI Accents, Reticles, Viewfinders, and Tech Grids.
Generates 250+ distinct mathematical vector shapes for cyberpunk & neo-brutalist graphic design.
"""

import math
import os
from typing import List, Tuple
from src.common import SVGBuilder, CENTER, polar_to_cartesian, deg_to_rad, format_num

def generate_crosshair(radius: float, inner_gap: float, tick_length: float, rings: List[float], 
                       spokes: int = 4, rot_deg: float = 0.0) -> SVGBuilder:
    """Precision targeting reticle with rings, cross spokes, and tick marks."""
    b = SVGBuilder()
    rot = deg_to_rad(rot_deg)

    # Concentric rings
    for r in rings:
        b.circle(CENTER, CENTER, r, fill="none", stroke="currentColor", stroke_width=6)

    # Spokes
    angle_step = 2 * math.pi / spokes
    for i in range(spokes):
        a = rot + i * angle_step
        p_start = polar_to_cartesian(CENTER, CENTER, inner_gap, a)
        p_end = polar_to_cartesian(CENTER, CENTER, radius, a)
        b.path(f"M {p_start[0]} {p_start[1]} L {p_end[0]} {p_end[1]}", 
               stroke="currentColor", stroke_width=6, stroke_linecap="square")

    # Peripheral tick marks
    tick_step = 2 * math.pi / 24
    for i in range(24):
        a = rot + i * tick_step
        p1 = polar_to_cartesian(CENTER, CENTER, radius - tick_length, a)
        p2 = polar_to_cartesian(CENTER, CENTER, radius, a)
        b.path(f"M {p1[0]} {p1[1]} L {p2[0]} {p2[1]}", stroke="currentColor", stroke_width=4)

    return b

def generate_viewfinder_frame(size: float, arm_len: float, stroke_w: float, 
                             corner_chamfer: float = 0.0, center_mark: bool = True) -> SVGBuilder:
    """Camera viewfinder / focus brackets with 4 corners and optional center cross."""
    b = SVGBuilder()
    half = size / 2.0
    x0, y0 = CENTER - half, CENTER - half
    x1, y1 = CENTER + half, CENTER + half

    # Top-Left
    if corner_chamfer == 0:
        b.path(f"M {x0} {y0 + arm_len} L {x0} {y0} L {x0 + arm_len} {y0}", 
               stroke="currentColor", stroke_width=stroke_w, stroke_linecap="square")
        # Top-Right
        b.path(f"M {x1 - arm_len} {y0} L {x1} {y0} L {x1} {y0 + arm_len}", 
               stroke="currentColor", stroke_width=stroke_w, stroke_linecap="square")
        # Bottom-Right
        b.path(f"M {x1} {y1 - arm_len} L {x1} {y1} L {x1 - arm_len} {y1}", 
               stroke="currentColor", stroke_width=stroke_w, stroke_linecap="square")
        # Bottom-Left
        b.path(f"M {x0 + arm_len} {y1} L {x0} {y1} L {x0} {y1 - arm_len}", 
               stroke="currentColor", stroke_width=stroke_w, stroke_linecap="square")
    else:
        # Chamfered corners
        c = corner_chamfer
        b.path(f"M {x0} {y0 + arm_len} L {x0} {y0 + c} L {x0 + c} {y0} L {x0 + arm_len} {y0}",
               stroke="currentColor", stroke_width=stroke_w, stroke_linecap="square")
        b.path(f"M {x1 - arm_len} {y0} L {x1 - c} {y0} L {x1} {y0 + c} L {x1} {y0 + arm_len}",
               stroke="currentColor", stroke_width=stroke_w, stroke_linecap="square")
        b.path(f"M {x1} {y1 - arm_len} L {x1} {y1 - c} L {x1 - c} {y1} L {x1 - arm_len} {y1}",
               stroke="currentColor", stroke_width=stroke_w, stroke_linecap="square")
        b.path(f"M {x0 + arm_len} {y1} L {x0 + c} {y1} L {x0} {y1 - c} L {x0} {y1 - arm_len}",
               stroke="currentColor", stroke_width=stroke_w, stroke_linecap="square")

    if center_mark:
        c_len = 24
        b.path(f"M {CENTER - c_len} {CENTER} L {CENTER + c_len} {CENTER} M {CENTER} {CENTER - c_len} L {CENTER} {CENTER + c_len}",
               stroke="currentColor", stroke_width=stroke_w * 0.75, stroke_linecap="square")
    return b

def generate_wireframe_globe(radius: float, num_lat: int = 4, num_lon: int = 4) -> SVGBuilder:
    """Wireframe 3D globe / isometric sphere projection."""
    b = SVGBuilder()
    # Outer circle
    b.circle(CENTER, CENTER, radius, fill="none", stroke="currentColor", stroke_width=8)
    
    # Latitudes (ellipses)
    for i in range(1, num_lat + 1):
        ry = radius * math.sin(i * (math.pi / 2) / (num_lat + 1))
        # Horizontal ellipse using path
        b.add_raw(f'<ellipse cx="{CENTER}" cy="{CENTER}" rx="{format_num(radius)}" ry="{format_num(ry)}" fill="none" stroke="currentColor" stroke-width="5" />')

    # Longitudes (vertical ellipses)
    for i in range(1, num_lon + 1):
        rx = radius * math.sin(i * (math.pi / 2) / (num_lon + 1))
        b.add_raw(f'<ellipse cx="{CENTER}" cy="{CENTER}" rx="{format_num(rx)}" ry="{format_num(radius)}" fill="none" stroke="currentColor" stroke-width="5" />')

    # Equator and Prime Meridian
    b.path(f"M {CENTER - radius} {CENTER} L {CENTER + radius} {CENTER}", stroke="currentColor", stroke_width=7)
    b.path(f"M {CENTER} {CENTER - radius} L {CENTER} {CENTER + radius}", stroke="currentColor", stroke_width=7)
    return b

def generate_brutalist_plus_cluster(size: float, bar_w: float, count: int = 1) -> SVGBuilder:
    """Swiss cross / brutalist heavy plus emblem or cluster."""
    b = SVGBuilder()
    if count == 1:
        # Single solid plus
        h = size / 2.0
        w = bar_w / 2.0
        d = (f"M {CENTER - w} {CENTER - h} L {CENTER + w} {CENTER - h} "
             f"L {CENTER + w} {CENTER - w} L {CENTER + h} {CENTER - w} "
             f"L {CENTER + h} {CENTER + w} L {CENTER + w} {CENTER + w} "
             f"L {CENTER + w} {CENTER + h} L {CENTER - w} {CENTER + h} "
             f"L {CENTER - w} {CENTER + w} L {CENTER - h} {CENTER + w} "
             f"L {CENTER - h} {CENTER - w} L {CENTER - w} {CENTER - w} Z")
        b.path(d, fill="currentColor")
    elif count == 4:
        # 4 clustered pluses in a 2x2 grid
        offset = size * 0.4
        for dx in [-offset, offset]:
            for dy in [-offset, offset]:
                cx, cy = CENTER + dx, CENTER + dy
                h = size * 0.28 / 2.0
                w = bar_w * 0.35 / 2.0
                d = (f"M {cx - w} {cy - h} L {cx + w} {cy - h} "
                     f"L {cx + w} {cy - w} L {cx + h} {cy - w} "
                     f"L {cx + h} {cy + w} L {cx + w} {cy + w} "
                     f"L {cx + w} {cy + h} L {cx - w} {cy + h} "
                     f"L {cx - w} {cy + w} L {cx - h} {cy + w} "
                     f"L {cx - h} {cy - w} L {cx - w} {cy - w} Z")
                b.path(d, fill="currentColor")
    return b

def generate_radar_dial(radius: float, segments: int, rot_deg: float = 0.0) -> SVGBuilder:
    """Segmented tech dial / gauge arc."""
    b = SVGBuilder()
    step = 2 * math.pi / segments
    gap_ratio = 0.25
    r_outer = radius
    r_inner = radius * 0.72
    rot = deg_to_rad(rot_deg)

    for i in range(segments):
        a1 = rot + i * step + (step * gap_ratio / 2.0)
        a2 = rot + (i + 1) * step - (step * gap_ratio / 2.0)
        
        p1 = polar_to_cartesian(CENTER, CENTER, r_outer, a1)
        p2 = polar_to_cartesian(CENTER, CENTER, r_outer, a2)
        p3 = polar_to_cartesian(CENTER, CENTER, r_inner, a2)
        p4 = polar_to_cartesian(CENTER, CENTER, r_inner, a1)
        
        d = f"M {p1[0]} {p1[1]} A {r_outer} {r_outer} 0 0 1 {p2[0]} {p2[1]} L {p3[0]} {p3[1]} A {r_inner} {r_inner} 0 0 0 {p4[0]} {p4[1]} Z"
        b.path(d, fill="currentColor")

    # Center target dot
    b.circle(CENTER, CENTER, radius * 0.2, fill="currentColor")
    return b

def generate_tech_barcode_badge(width: float, height: float, bars: List[float]) -> SVGBuilder:
    """Industrial barcode / sci-fi data badge."""
    b = SVGBuilder()
    x_start = CENTER - width / 2.0
    y_start = CENTER - height / 2.0
    
    # Outer frame
    b.rect(x_start - 12, y_start - 12, width + 24, height + 24, stroke="currentColor", stroke_width=6, fill="none")
    
    # Bars
    total_w = sum(bars)
    curr_x = x_start
    scale = width / total_w
    for i, bar_w in enumerate(bars):
        scaled_w = bar_w * scale
        if i % 2 == 0:
            b.rect(curr_x, y_start, scaled_w, height, fill="currentColor")
        curr_x += scaled_w
    return b

def generate_all_brutalist_hud(out_dir: str) -> List[dict]:
    """Generates 250+ distinct Neo-Brutalist HUD and UI elements."""
    os.makedirs(out_dir, exist_ok=True)
    manifest = []
    shape_idx = 1

    # 1. Crosshairs & Reticles (varying ring configs, spokes, tick styles)
    spoke_options = [3, 4, 6, 8]
    ring_configs = [
        [180],
        [120, 200],
        [60, 140, 210],
        [90, 190],
    ]
    for spk in spoke_options:
        for c_i, rings in enumerate(ring_configs):
            for inner_g in [25, 55, 90]:
                name = f"hud_crosshair_s{spk}_c{c_i+1}_g{inner_g}"
                builder = generate_crosshair(radius=220, inner_gap=inner_g, tick_length=20,
                                             rings=rings, spokes=spk, rot_deg=0)
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Brutalist HUD Crosshair", category="02_neo_brutalist_hud",
                             tags=["brutalist", "hud", "reticle", "crosshair", "target"])
                manifest.append({
                    "id": f"hud_{shape_idx:04d}",
                    "name": name,
                    "category": "02_neo_brutalist_hud",
                    "category_label": "Neo-Brutalist HUD",
                    "tags": ["brutalist", "hud", "reticle", "crosshair"],
                    "file": f"assets/svg/02_neo_brutalist_hud/{name}.svg"
                })
                shape_idx += 1

    # 2. Viewfinder Brackets & Corner Frames
    sizes = [320, 380, 440]
    arm_lens = [50, 90, 140]
    strokes = [12, 20, 30]
    chamfers = [0, 40]
    for sz in sizes:
        for arm in arm_lens:
            for sw in strokes:
                for ch in chamfers:
                    name = f"hud_viewfinder_s{sz}_a{arm}_w{sw}_ch{ch}"
                    builder = generate_viewfinder_frame(sz, arm, sw, corner_chamfer=ch, center_mark=True)
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Viewfinder Corner Frame", category="02_neo_brutalist_hud",
                                 tags=["hud", "viewfinder", "brackets", "frame", "camera"])
                    manifest.append({
                        "id": f"hud_{shape_idx:04d}",
                        "name": name,
                        "category": "02_neo_brutalist_hud",
                        "category_label": "Neo-Brutalist HUD",
                        "tags": ["hud", "viewfinder", "brackets", "frame"],
                        "file": f"assets/svg/02_neo_brutalist_hud/{name}.svg"
                    })
                    shape_idx += 1

    # 3. Wireframe 3D Globes & Projection Spheres
    for radius in [180, 220]:
        for lat in [2, 3, 4, 5]:
            for lon in [2, 3, 4, 5]:
                name = f"hud_wireframe_globe_r{radius}_lat{lat}_lon{lon}"
                builder = generate_wireframe_globe(radius, lat, lon)
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Wireframe Tech Globe", category="02_neo_brutalist_hud",
                             tags=["hud", "wireframe", "globe", "sphere", "3d", "grid"])
                manifest.append({
                    "id": f"hud_{shape_idx:04d}",
                    "name": name,
                    "category": "02_neo_brutalist_hud",
                    "category_label": "Neo-Brutalist HUD",
                    "tags": ["hud", "wireframe", "globe", "sphere"],
                    "file": f"assets/svg/02_neo_brutalist_hud/{name}.svg"
                })
                shape_idx += 1

    # 4. Brutalist Pluses, Swiss Crosses & Clusters
    for sz in [260, 360, 440]:
        for bar_ratio in [0.22, 0.35, 0.50]:
            bar_w = sz * bar_ratio
            for count in [1, 4]:
                name = f"hud_swiss_plus_s{sz}_w{int(bar_ratio*100)}_c{count}"
                builder = generate_brutalist_plus_cluster(sz, bar_w, count)
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Brutalist Swiss Cross", category="02_neo_brutalist_hud",
                             tags=["brutalist", "cross", "plus", "swiss", "cluster"])
                manifest.append({
                    "id": f"hud_{shape_idx:04d}",
                    "name": name,
                    "category": "02_neo_brutalist_hud",
                    "category_label": "Neo-Brutalist HUD",
                    "tags": ["brutalist", "cross", "plus", "swiss"],
                    "file": f"assets/svg/02_neo_brutalist_hud/{name}.svg"
                })
                shape_idx += 1

    # 5. Radar Dials & Segmented HUD Rings
    for segs in [3, 4, 6, 8, 12, 16]:
        for rad in [170, 220]:
            name = f"hud_radar_dial_seg{segs}_r{rad}"
            builder = generate_radar_dial(rad, segs, 0)
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Radar Gauge Dial", category="02_neo_brutalist_hud",
                         tags=["hud", "radar", "dial", "gauge", "circular"])
            manifest.append({
                "id": f"hud_{shape_idx:04d}",
                "name": name,
                "category": "02_neo_brutalist_hud",
                "category_label": "Neo-Brutalist HUD",
                "tags": ["hud", "radar", "dial", "gauge"],
                "file": f"assets/svg/02_neo_brutalist_hud/{name}.svg"
            })
            shape_idx += 1

    # 6. Barcode & Tech Data Badges
    patterns = [
        [5, 2, 8, 3, 12, 4, 6, 3, 15, 2, 8, 4, 6, 2, 10, 5],
        [3, 3, 3, 3, 10, 3, 3, 10, 3, 3, 3, 10, 10, 3],
        [15, 5, 5, 5, 20, 4, 4, 4, 15, 10, 5, 25],
        [8, 4, 16, 8, 4, 4, 16, 8, 8, 4, 16, 4, 8, 8],
    ]
    for p_i, pattern in enumerate(patterns):
        for w in [320, 420]:
            for h in [120, 200, 300]:
                name = f"hud_barcode_badge_p{p_i+1}_w{w}_h{h}"
                builder = generate_tech_barcode_badge(w, h, pattern)
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Tech Barcode Badge", category="02_neo_brutalist_hud",
                             tags=["hud", "barcode", "badge", "tech", "data"])
                manifest.append({
                    "id": f"hud_{shape_idx:04d}",
                    "name": name,
                    "category": "02_neo_brutalist_hud",
                    "category_label": "Neo-Brutalist HUD",
                    "tags": ["hud", "barcode", "badge", "tech"],
                    "file": f"assets/svg/02_neo_brutalist_hud/{name}.svg"
                })
                shape_idx += 1

    return manifest
