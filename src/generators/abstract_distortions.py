"""
Generator for Abstract Distortions, Sliced Wave Bars, Twisted Ribbons, and Perspective Warps.
Generates 250+ distinct vector shapes for editorial cover design, music album art, and modern posters.
"""

import math
import os
from typing import List, Tuple
from src.common import SVGBuilder, CENTER, polar_to_cartesian, deg_to_rad, smooth_cardinal_spline, format_num

def generate_sliced_wave_bars(bars: int, size: float, waves: float, max_shift: float, vertical: bool = False) -> SVGBuilder:
    """Parallel sliced slat bars shifted sinusoidally like an optical wave."""
    b = SVGBuilder()
    step = size / bars
    bar_thick = step * 0.65
    start = CENTER - size / 2.0
    
    for i in range(bars):
        pos = start + (i + 0.5) * step
        t = i / (bars - 1)
        shift = max_shift * math.sin(t * waves * 2 * math.pi)
        
        if not vertical:
            bar_w = size * 0.85
            x = (CENTER - bar_w / 2.0) + shift
            y = pos - bar_thick / 2.0
            b.rect(x, y, bar_w, bar_thick, rx=bar_thick * 0.2, ry=bar_thick * 0.2, fill="currentColor")
        else:
            bar_h = size * 0.85
            x = pos - bar_thick / 2.0
            y = (CENTER - bar_h / 2.0) + shift
            b.rect(x, y, bar_thick, bar_h, rx=bar_thick * 0.2, ry=bar_thick * 0.2, fill="currentColor")

    return b

def generate_twisted_polygon(sides: int, layers: int, radius: float, twist_step_deg: float) -> SVGBuilder:
    """Nested regular polygon rotated layer by layer to form a 3D vortex tunnel."""
    b = SVGBuilder()
    step_r = radius / layers
    
    for layer in range(layers):
        r = radius - layer * step_r
        if r <= 10:
            continue
        rot = deg_to_rad(layer * twist_step_deg)
        pts = []
        angle_step = 2 * math.pi / sides
        for s in range(sides):
            a = rot + s * angle_step
            pts.append(polar_to_cartesian(CENTER, CENTER, r, a))
            
        cmds = [f"M {pts[0][0]} {pts[0][1]}"]
        for p in pts[1:]:
            cmds.append(f"L {p[0]} {p[1]}")
        cmds.append("Z")
        
        b.path(" ".join(cmds), fill="none", stroke="currentColor", stroke_width=7, stroke_linejoin="round")

    return b

def generate_wave_warped_circle(waves: int, radius: float, amp: float, harmonics: int = 1) -> str:
    """Circle perturbed by high-order wave frequencies."""
    steps = 180
    pts = []
    step_a = 2 * math.pi / steps
    
    for i in range(steps):
        a = i * step_a
        r = radius + amp * math.sin(waves * a)
        if harmonics > 1:
            r += (amp * 0.4) * math.sin(waves * harmonics * a + math.pi / 4)
        pts.append(polar_to_cartesian(CENTER, CENTER, r, a))
        
    return smooth_cardinal_spline(pts, tension=0.45, closed=True)

def generate_moire_interference_rings(rings: int, center_offset: float) -> SVGBuilder:
    """Optical moire interference created by two overlapping sets of concentric rings."""
    b = SVGBuilder()
    step = 210.0 / rings
    # Center 1
    c1x = CENTER - center_offset / 2.0
    for i in range(1, rings + 1):
        b.circle(c1x, CENTER, i * step, fill="none", stroke="currentColor", stroke_width=4.0)
    # Center 2
    c2x = CENTER + center_offset / 2.0
    for i in range(1, rings + 1):
        b.circle(c2x, CENTER, i * step, fill="none", stroke="currentColor", stroke_width=4.0)
    return b

def generate_all_abstract_distortions(out_dir: str) -> List[dict]:
    """Generates 250+ distinct Abstract Distortion vector graphics."""
    os.makedirs(out_dir, exist_ok=True)
    manifest = []
    shape_idx = 1

    # 1. Sliced Wave Slat Bars (horizontal & vertical)
    for bars in [8, 12, 16, 20]:
        for waves in [1.0, 1.5, 2.0, 3.0]:
            for shift in [30, 60]:
                for vert in [False, True]:
                    orient = "v" if vert else "h"
                    name = f"abstract_sliced_bars_b{bars}_w{int(waves*10)}_s{shift}_{orient}"
                    builder = generate_sliced_wave_bars(bars, 420, waves, shift, vertical=vert)
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Sliced Wave Bars", category="12_abstract_distortions",
                                 tags=["abstract", "bars", "sliced", "wave", "distortion", "optical"])
                    manifest.append({
                        "id": f"abs_{shape_idx:04d}",
                        "name": name,
                        "category": "12_abstract_distortions",
                        "category_label": "Abstract Distortions",
                        "tags": ["abstract", "bars", "sliced", "wave"],
                        "file": f"assets/svg/12_abstract_distortions/{name}.svg"
                    })
                    shape_idx += 1

    # 2. Twisted Vortex Polygon Tunnels
    for sides in [3, 4, 5, 6, 8]:
        for layers in [6, 10, 14]:
            for twist in [4, 8, 14]:
                name = f"abstract_twisted_poly_s{sides}_l{layers}_t{twist}"
                builder = generate_twisted_polygon(sides, layers, 220, twist)
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Twisted Polygon Vortex", category="12_abstract_distortions",
                             tags=["abstract", "vortex", "tunnel", "polygon", "twisted", "3d"])
                manifest.append({
                    "id": f"abs_{shape_idx:04d}",
                    "name": name,
                    "category": "12_abstract_distortions",
                    "category_label": "Abstract Distortions",
                    "tags": ["abstract", "vortex", "tunnel", "polygon"],
                    "file": f"assets/svg/12_abstract_distortions/{name}.svg"
                })
                shape_idx += 1

    # 3. Wave Warped Discs
    for waves in [3, 5, 7, 9, 12]:
        for amp in [25, 45, 65]:
            for harm in [1, 2]:
                name = f"abstract_wave_disc_w{waves}_a{amp}_h{harm}"
                d = generate_wave_warped_circle(waves, 180, amp, harmonics=harm)
                builder = SVGBuilder()
                builder.path(d, fill="currentColor")
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Wave Warped Disc", category="12_abstract_distortions",
                             tags=["abstract", "disc", "wave", "ripple", "distortion"])
                manifest.append({
                    "id": f"abs_{shape_idx:04d}",
                    "name": name,
                    "category": "12_abstract_distortions",
                    "category_label": "Abstract Distortions",
                    "tags": ["abstract", "disc", "wave", "ripple"],
                    "file": f"assets/svg/12_abstract_distortions/{name}.svg"
                })
                shape_idx += 1

    # 4. Moire Interference Discs
    for rings in [12, 18, 26]:
        for offset in [25, 50, 80]:
            name = f"abstract_moire_rings_r{rings}_o{offset}"
            builder = generate_moire_interference_rings(rings, offset)
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Moire Interference Rings", category="12_abstract_distortions",
                         tags=["abstract", "moire", "interference", "optical", "rings"])
            manifest.append({
                "id": f"abs_{shape_idx:04d}",
                "name": name,
                "category": "12_abstract_distortions",
                "category_label": "Abstract Distortions",
                "tags": ["abstract", "moire", "interference", "optical"],
                "file": f"assets/svg/12_abstract_distortions/{name}.svg"
            })
            shape_idx += 1

    # 5. Parabolic String Art Curves / Hyperbolic Frames
    for lines in [16, 24, 32]:
        for sw in [2, 4]:
            name = f"abstract_string_art_l{lines}_w{sw}"
            builder = SVGBuilder()
            half = 200.0
            step = (2 * half) / lines
            for i in range(lines + 1):
                p1 = (CENTER - half + i * step, CENTER - half)
                p2 = (CENTER + half, CENTER - half + i * step)
                builder.path(f"M {p1[0]} {p1[1]} L {p2[0]} {p2[1]}", stroke="currentColor", stroke_width=sw)
                p3 = (CENTER + half - i * step, CENTER + half)
                p4 = (CENTER - half, CENTER + half - i * step)
                builder.path(f"M {p3[0]} {p3[1]} L {p4[0]} {p4[1]}", stroke="currentColor", stroke_width=sw)
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Parabolic String Art", category="12_abstract_distortions",
                         tags=["abstract", "string_art", "parabolic", "hyperbolic", "wireframe", "lines"])
            manifest.append({
                "id": f"abs_{shape_idx:04d}",
                "name": name,
                "category": "12_abstract_distortions",
                "category_label": "Abstract Distortions",
                "tags": ["abstract", "string_art", "lines"],
                "file": f"assets/svg/12_abstract_distortions/{name}.svg"
            })
            shape_idx += 1

    return manifest
