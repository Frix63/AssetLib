"""
Generator for Halftones, Dot Matrices, and Optical Screen Grids.
Generates 250+ distinct mathematical vector shapes for screen-printing, newspaper, and optical art.
"""

import math
import os
from typing import List, Tuple
from src.common import SVGBuilder, CENTER, polar_to_cartesian, deg_to_rad, format_num

def generate_radial_halftone(rings: int, dots_per_ring: int, max_dot_r: float, invert: bool = False) -> SVGBuilder:
    """Concentric radial halftone with 4-fold rotational symmetry and middle clearance."""
    b = SVGBuilder()
    r_step = 210.0 / rings
    center_r = 1.5 if invert else max_dot_r
    b.circle(CENTER, CENTER, center_r, fill="currentColor")

    for ring_i in range(1, rings + 1):
        dist = ring_i * r_step
        t = ring_i / rings
        if invert:
            dot_r = max(1.0, max_dot_r * (0.12 + t * 0.88))
        else:
            dot_r = max(1.0, max_dot_r * (1.0 - t * 0.82))
            if dist < center_r + dot_r + 2.0:
                continue

        # Strict 4-fold symmetry: count is always a multiple of 4
        raw_count = round(dots_per_ring * t / 4) * 4
        count = max(4, raw_count)

        angle_step = (2 * math.pi) / count
        # Alternating offset prevents rigid radial spokes while maintaining 4-fold symmetry
        offset = (ring_i % 2) * (angle_step / 2.0)

        for d_i in range(count):
            a = d_i * angle_step + offset
            cx, cy = polar_to_cartesian(CENTER, CENTER, dist, a)
            b.circle(cx, cy, dot_r, fill="currentColor")

    return b

def generate_linear_halftone(rows: int, cols: int, size: float, max_dot_r: float, angle_deg: float = 0.0) -> SVGBuilder:
    """Linear gradient dot screen."""
    b = SVGBuilder()
    step_x = size / cols
    step_y = size / rows
    start_x = CENTER - size / 2.0
    start_y = CENTER - size / 2.0

    rot = deg_to_rad(angle_deg)
    cos_a, sin_a = math.cos(rot), math.sin(rot)

    for r in range(rows):
        for c in range(cols):
            x = start_x + (c + 0.5) * step_x
            y = start_y + (r + 0.5) * step_y
            
            dx = (x - CENTER) / (size / 2.0)
            dy = (y - CENTER) / (size / 2.0)
            proj = dx * cos_a + dy * sin_a
            t = (proj + 1.0) / 2.0
            
            dot_r = max_dot_r * t
            if dot_r > 1.2:
                b.circle(x, y, dot_r, fill="currentColor")

    return b

def generate_diamond_halftone(grid_sz: int, size: float, max_diag: float, angle_deg: float = 45.0) -> SVGBuilder:
    """Diamond-shaped halftone raster screen."""
    b = SVGBuilder()
    step = size / grid_sz
    start = CENTER - size / 2.0
    rot = deg_to_rad(angle_deg)
    
    for r in range(grid_sz):
        for c in range(grid_sz):
            cx = start + (c + 0.5) * step
            cy = start + (r + 0.5) * step
            dist = math.hypot(cx - CENTER, cy - CENTER) / (size / 2.0)
            t = max(0.05, 1.0 - dist)
            diag = max_diag * t
            if diag > 2:
                p1 = (cx, cy - diag / 2.0)
                p2 = (cx + diag / 2.0, cy)
                p3 = (cx, cy + diag / 2.0)
                p4 = (cx - diag / 2.0, cy)
                b.path(f"M {p1[0]} {p1[1]} L {p2[0]} {p2[1]} L {p3[0]} {p3[1]} L {p4[0]} {p4[1]} Z", fill="currentColor")

    return b

def generate_dither_wave(grid_size: int, size: float, waves: int, max_sz: float) -> SVGBuilder:
    """Wave-modulated square dither matrix."""
    b = SVGBuilder()
    step = size / grid_size
    start = CENTER - size / 2.0
    
    for r in range(grid_size):
        for c in range(grid_size):
            x = start + c * step
            y = start + r * step
            t = 0.5 + 0.5 * math.sin(c * waves * math.pi / grid_size) * math.cos(r * waves * math.pi / grid_size)
            sz = max_sz * t
            if sz > 1.5:
                b.rect(x + (step - sz) / 2.0, y + (step - sz) / 2.0, sz, sz, fill="currentColor")

    return b

def generate_concentric_ring_halftone(rings: int, max_w: float) -> SVGBuilder:
    """Concentric rings with gradient stroke width."""
    b = SVGBuilder()
    step_r = 210.0 / rings
    for i in range(1, rings + 1):
        r = i * step_r
        sw = max_w * (1.0 - (i / rings) * 0.75)
        b.circle(CENTER, CENTER, r, fill="none", stroke="currentColor", stroke_width=sw)
    return b

def generate_all_halftones(out_dir: str) -> List[dict]:
    """Generates 250+ distinct Halftone & Optical Matrix vector graphics."""
    os.makedirs(out_dir, exist_ok=True)
    manifest = []
    shape_idx = 1

    # 1. Radial Halftones
    for rings in [6, 8, 10, 12, 16]:
        for dots in [16, 24, 32]:
            for max_r in [10, 14, 18]:
                for inv in [False, True]:
                    inv_tag = "inv" if inv else "norm"
                    name = f"halftone_radial_r{rings}_d{dots}_m{max_r}_{inv_tag}"
                    builder = generate_radial_halftone(rings, dots, max_r, invert=inv)
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Radial Halftone", category="11_halftones_optical_grids",
                                 tags=["halftone", "radial", "dots", "screen", "optical", "matrix"])
                    manifest.append({
                        "id": f"half_{shape_idx:04d}",
                        "name": name,
                        "category": "11_halftones_optical_grids",
                        "category_label": "Halftones & Matrix Grids",
                        "tags": ["halftone", "radial", "dots"],
                        "file": f"assets/svg/11_halftones_optical_grids/{name}.svg"
                    })
                    shape_idx += 1

    # 2. Linear Screen Halftones
    for grid in [8, 10, 12, 14, 16]:
        for max_r in [10, 16]:
            name = f"halftone_linear_g{grid}_m{max_r}"
            builder = generate_linear_halftone(grid, grid, 420, max_r, angle_deg=0)
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Linear Halftone Screen", category="11_halftones_optical_grids",
                         tags=["halftone", "linear", "screen", "dots", "gradient"])
            manifest.append({
                "id": f"half_{shape_idx:04d}",
                "name": name,
                "category": "11_halftones_optical_grids",
                "category_label": "Halftones & Matrix Grids",
                "tags": ["halftone", "linear", "dots"],
                "file": f"assets/svg/11_halftones_optical_grids/{name}.svg"
            })
            shape_idx += 1

    # 3. Diamond Halftone Screens
    for g_sz in [8, 10, 12, 14]:
        for max_d in [18, 26, 34]:
            name = f"halftone_diamond_g{g_sz}_d{max_d}"
            builder = generate_diamond_halftone(g_sz, 420, max_d)
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Diamond Halftone Screen", category="11_halftones_optical_grids",
                         tags=["halftone", "diamond", "screen", "optical", "matrix"])
            manifest.append({
                "id": f"half_{shape_idx:04d}",
                "name": name,
                "category": "11_halftones_optical_grids",
                "category_label": "Halftones & Matrix Grids",
                "tags": ["halftone", "diamond", "screen"],
                "file": f"assets/svg/11_halftones_optical_grids/{name}.svg"
            })
            shape_idx += 1

    # 4. Wave-Modulated Dither Matrices
    for g_sz in [10, 14, 18]:
        for waves in [1, 2, 3]:
            for max_s in [14, 22]:
                name = f"halftone_dither_wave_g{g_sz}_w{waves}_s{max_s}"
                builder = generate_dither_wave(g_sz, 420, waves, max_s)
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Dither Wave Matrix", category="11_halftones_optical_grids",
                             tags=["dither", "wave", "matrix", "halftone", "grid"])
                manifest.append({
                    "id": f"half_{shape_idx:04d}",
                    "name": name,
                    "category": "11_halftones_optical_grids",
                    "category_label": "Halftones & Matrix Grids",
                    "tags": ["dither", "wave", "matrix"],
                    "file": f"assets/svg/11_halftones_optical_grids/{name}.svg"
                })
                shape_idx += 1

    # 5. Concentric Ring Halftones
    for rings in [6, 10, 14, 18, 24]:
        for max_w in [10, 18, 26]:
            name = f"halftone_rings_r{rings}_w{max_w}"
            builder = generate_concentric_ring_halftone(rings, max_w)
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Concentric Ring Halftone", category="11_halftones_optical_grids",
                         tags=["halftone", "concentric", "rings", "optical", "target"])
            manifest.append({
                "id": f"half_{shape_idx:04d}",
                "name": name,
                "category": "11_halftones_optical_grids",
                "category_label": "Halftones & Matrix Grids",
                "tags": ["halftone", "concentric", "rings"],
                "file": f"assets/svg/11_halftones_optical_grids/{name}.svg"
            })
            shape_idx += 1

    return manifest
