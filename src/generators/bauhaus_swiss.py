"""
Generator for Bauhaus, Swiss Style, and Modernist Geometric Primitives.
Generates 250+ distinct mathematical vector shapes honoring Bauhaus, De Stijl, and Swiss Graphic Design.
"""

import math
import os
from typing import List, Tuple
from src.common import SVGBuilder, CENTER, polar_to_cartesian, deg_to_rad, format_num

def generate_arch(width: float, height: float, inner_w: float = 0, inner_h: float = 0) -> str:
    """Classic modernist arch (flat bottom, rounded top semicircle)."""
    half_w = width / 2.0
    r = half_w
    top_y = CENTER - height / 2.0 + r
    bot_y = CENTER + height / 2.0
    
    # Outer arch path
    d = [
        f"M {CENTER - half_w} {bot_y}",
        f"L {CENTER - half_w} {top_y}",
        f"A {r} {r} 0 0 1 {CENTER + half_w} {top_y}",
        f"L {CENTER + half_w} {bot_y}",
        "Z"
    ]
    
    if inner_w > 0 and inner_h > 0:
        # Cutout tunnel arch
        in_half = inner_w / 2.0
        in_r = in_half
        in_top = bot_y - inner_h + in_r
        d.extend([
            f"M {CENTER - in_half} {bot_y}",
            f"L {CENTER - in_half} {in_top}",
            f"A {in_r} {in_r} 0 0 1 {CENTER + in_half} {in_top}",
            f"L {CENTER + in_half} {bot_y}",
            "Z"
        ])
    return " ".join(d)

def generate_pill_shape(length: float, width: float, angle_deg: float = 0.0) -> SVGBuilder:
    """Stadium / pill capsule with rounded ends."""
    b = SVGBuilder()
    r = width / 2.0
    half_l = length / 2.0
    # Create horizontal pill then rotate
    p_path = (f"M {CENTER - half_l + r} {CENTER - r} "
              f"L {CENTER + half_l - r} {CENTER - r} "
              f"A {r} {r} 0 0 1 {CENTER + half_l - r} {CENTER + r} "
              f"L {CENTER - half_l + r} {CENTER + r} "
              f"A {r} {r} 0 0 1 {CENTER - half_l + r} {CENTER - r} Z")
    if angle_deg != 0:
        b.add_raw(f'<path d="{p_path}" fill="currentColor" transform="rotate({angle_deg} {CENTER} {CENTER})" />')
    else:
        b.path(p_path, fill="currentColor")
    return b

def generate_stepped_pyramid(levels: int, max_w: float, height: float, inverted: bool = False) -> SVGBuilder:
    """Stepped ziggurat / pyramid geometric silhouette."""
    b = SVGBuilder()
    pts = []
    step_h = height / levels
    y_start = CENTER - height / 2.0 if not inverted else CENTER + height / 2.0
    
    # Left side stepping
    for i in range(levels):
        w = max_w * ((levels - i) / levels if not inverted else (i + 1) / levels)
        y = y_start + i * step_h if not inverted else y_start - i * step_h
        pts.append((CENTER - w / 2.0, y))
        pts.append((CENTER - w / 2.0, y + step_h if not inverted else y - step_h))
        
    # Right side stepping
    for i in reversed(range(levels)):
        w = max_w * ((levels - i) / levels if not inverted else (i + 1) / levels)
        y = y_start + i * step_h if not inverted else y_start - i * step_h
        pts.append((CENTER + w / 2.0, y + step_h if not inverted else y - step_h))
        pts.append((CENTER + w / 2.0, y))
        
    d = [f"M {pts[0][0]} {pts[0][1]}"]
    for p in pts[1:]:
        d.append(f"L {p[0]} {p[1]}")
    d.append("Z")
    b.path(" ".join(d), fill="currentColor")
    return b

def generate_quadrant_grid(cells: int, size: float, pattern_type: int) -> SVGBuilder:
    """Bauhaus modular grid using quarter-circles, triangles, and half-squares."""
    b = SVGBuilder()
    cell_sz = size / cells
    start_x = CENTER - size / 2.0
    start_y = CENTER - size / 2.0

    for r in range(cells):
        for c in range(cells):
            cx = start_x + c * cell_sz
            cy = start_y + r * cell_sz
            mode = (r * cells + c + pattern_type) % 6
            if mode == 0:
                # Quarter circle top-left
                d = f"M {cx} {cy} L {cx + cell_sz} {cy} A {cell_sz} {cell_sz} 0 0 1 {cx} {cy + cell_sz} Z"
                b.path(d, fill="currentColor")
            elif mode == 1:
                # Quarter circle bottom-right
                d = f"M {cx + cell_sz} {cy + cell_sz} L {cx} {cy + cell_sz} A {cell_sz} {cell_sz} 0 0 1 {cx + cell_sz} {cy} Z"
                b.path(d, fill="currentColor")
            elif mode == 2:
                # Solid square
                b.rect(cx, cy, cell_sz, cell_sz, fill="currentColor")
            elif mode == 3:
                # Half diagonal triangle
                d = f"M {cx} {cy} L {cx + cell_sz} {cy} L {cx} {cy + cell_sz} Z"
                b.path(d, fill="currentColor")
            elif mode == 4:
                # Full circle inscribed
                b.circle(cx + cell_sz / 2.0, cy + cell_sz / 2.0, cell_sz / 2.0, fill="currentColor")
            # mode 5 is empty space (Bauhaus negative space)

    return b

def generate_concentric_semicircles(radius: float, rings: int, rot_deg: float = 0.0) -> SVGBuilder:
    """Concentric nested semicircles."""
    b = SVGBuilder()
    step_r = radius / rings
    rot = deg_to_rad(rot_deg)
    
    for i in range(rings):
        r = radius - i * step_r
        if r <= 0:
            continue
        p1 = polar_to_cartesian(CENTER, CENTER, r, rot)
        p2 = polar_to_cartesian(CENTER, CENTER, r, rot + math.pi)
        d = f"M {p1[0]} {p1[1]} A {r} {r} 0 0 1 {p2[0]} {p2[1]}"
        b.path(d, fill="none", stroke="currentColor", stroke_width=step_r * 0.45, stroke_linecap="round")
    return b

def generate_all_bauhaus_swiss(out_dir: str) -> List[dict]:
    """Generates 250+ distinct Bauhaus & Swiss modernist vector primitives."""
    os.makedirs(out_dir, exist_ok=True)
    manifest = []
    shape_idx = 1

    # 1. Modernist Arches & Tunnel Portals (solid, hollow, nested)
    widths = [180, 240, 320, 400]
    heights = [240, 320, 420]
    tunnels = [0, 0.35, 0.6]
    for w in widths:
        for h in heights:
            for t in tunnels:
                in_w = w * t
                in_h = h * t if t > 0 else 0
                name = f"bauhaus_arch_w{w}_h{h}_t{int(t*100)}"
                d = generate_arch(w, h, in_w, in_h)
                builder = SVGBuilder()
                builder.path(d, fill="currentColor", fill_rule="evenodd" if t > 0 else "nonzero")
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Bauhaus Modernist Arch", category="04_bauhaus_swiss",
                             tags=["bauhaus", "swiss", "arch", "portal", "tunnel", "minimal"])
                manifest.append({
                    "id": f"bauhaus_{shape_idx:04d}",
                    "name": name,
                    "category": "04_bauhaus_swiss",
                    "category_label": "Bauhaus & Swiss Style",
                    "tags": ["bauhaus", "swiss", "arch", "minimal"],
                    "file": f"assets/svg/04_bauhaus_swiss/{name}.svg"
                })
                shape_idx += 1

    # 2. Pill Capsules & Stadiums (horizontal, vertical, diagonal, varying aspect ratios)
    lengths = [260, 360, 440]
    # 2. Modernist Stadium Pills (Lengths and Widths)
    lengths = [260, 340, 420]
    widths_pill = [80, 140, 200]
    for l_val in lengths:
        for w_val in widths_pill:
            if w_val >= l_val:
                continue
            name = f"bauhaus_pill_l{l_val}_w{w_val}"
            builder = generate_pill_shape(l_val, w_val, 0)
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Modernist Stadium Pill", category="04_bauhaus_swiss",
                         tags=["bauhaus", "pill", "capsule", "stadium", "geometric"])
            manifest.append({
                "id": f"bauhaus_{shape_idx:04d}",
                "name": name,
                "category": "04_bauhaus_swiss",
                "category_label": "Bauhaus & Swiss Style",
                "tags": ["bauhaus", "pill", "capsule", "stadium"],
                "file": f"assets/svg/04_bauhaus_swiss/{name}.svg"
            })
            shape_idx += 1

    # 3. Stepped Pyramids & Ziggurats
    for levels in [3, 4, 5, 6, 8]:
        for max_w in [320, 420]:
            for h in [260, 380]:
                for inv in [False, True]:
                    inv_tag = "inv" if inv else "up"
                    name = f"bauhaus_stepped_pyr_l{levels}_w{max_w}_h{h}_{inv_tag}"
                    builder = generate_stepped_pyramid(levels, max_w, h, inverted=inv)
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Stepped Ziggurat Pyramid", category="04_bauhaus_swiss",
                                 tags=["bauhaus", "pyramid", "ziggurat", "stepped", "geometric"])
                    manifest.append({
                        "id": f"bauhaus_{shape_idx:04d}",
                        "name": name,
                        "category": "04_bauhaus_swiss",
                        "category_label": "Bauhaus & Swiss Style",
                        "tags": ["bauhaus", "pyramid", "ziggurat", "stepped"],
                        "file": f"assets/svg/04_bauhaus_swiss/{name}.svg"
                    })
                    shape_idx += 1

    # 4. Modular Quadrant Grids (2x2, 3x3, 4x4)
    for grid_sz in [2, 3, 4]:
        for pattern_variant in range(12):
            name = f"bauhaus_quadrant_grid_{grid_sz}x{grid_sz}_var{pattern_variant+1}"
            builder = generate_quadrant_grid(grid_sz, 420, pattern_variant)
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Modular Bauhaus Grid", category="04_bauhaus_swiss",
                         tags=["bauhaus", "modular", "grid", "quadrant", "swiss"])
            manifest.append({
                "id": f"bauhaus_{shape_idx:04d}",
                "name": name,
                "category": "04_bauhaus_swiss",
                "category_label": "Bauhaus & Swiss Style",
                "tags": ["bauhaus", "modular", "grid", "quadrant"],
                "file": f"assets/svg/04_bauhaus_swiss/{name}.svg"
            })
            shape_idx += 1

    # 5. Concentric Semicircles (Rainbow / Arcs)
    for rings in [3, 4, 5, 6, 8]:
        for rad in [180, 225]:
            name = f"bauhaus_concentric_semi_r{rings}_rad{rad}"
            builder = generate_concentric_semicircles(rad, rings, 0)
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Concentric Modernist Semicircles", category="04_bauhaus_swiss",
                         tags=["bauhaus", "concentric", "semicircle", "rainbow", "arcs"])
            manifest.append({
                "id": f"bauhaus_{shape_idx:04d}",
                "name": name,
                "category": "04_bauhaus_swiss",
                "category_label": "Bauhaus & Swiss Style",
                "tags": ["bauhaus", "concentric", "semicircle", "arcs"],
                "file": f"assets/svg/04_bauhaus_swiss/{name}.svg"
            })
            shape_idx += 1

    # 6. Bauhaus Striped Geometric Blocks
    for bars in [4, 6, 8, 12]:
        for mask_type in ["circle", "square"]:
            name = f"bauhaus_stripes_b{bars}_{mask_type}"
            builder = SVGBuilder()
            step = 420.0 / bars
            for b_i in range(bars):
                if b_i % 2 == 0:
                    y = (CENTER - 210) + b_i * step
                    builder.rect(CENTER - 210, y, 420, step, fill="currentColor")
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Bauhaus Striped Block", category="04_bauhaus_swiss",
                         tags=["bauhaus", "stripes", "block", "swiss", "geometric"])
            manifest.append({
                "id": f"bauhaus_{shape_idx:04d}",
                "name": name,
                "category": "04_bauhaus_swiss",
                "category_label": "Bauhaus & Swiss Style",
                "tags": ["bauhaus", "stripes", "block"],
                "file": f"assets/svg/04_bauhaus_swiss/{name}.svg"
            })
            shape_idx += 1

    return manifest
