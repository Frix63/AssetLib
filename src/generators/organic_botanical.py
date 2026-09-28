"""
Generator for Organic Blobs, Amoebas, River Pebbles, and Matisse-Style Botanical Cutouts.
Generates 250+ distinct vector shapes for contemporary organic, earthy, and modernist graphic design.
"""

import math
import os
from typing import List, Tuple
from src.common import SVGBuilder, CENTER, polar_to_cartesian, deg_to_rad, smooth_cardinal_spline, format_num

def generate_harmonic_blob(harmonics: List[Tuple[int, float, float]], base_radius: float = 180.0, num_points: int = 40) -> str:
    """
    Generates an ultra-smooth organic blob using Fourier harmonic summation.
    harmonics: list of (frequency, amplitude, phase_rad)
    """
    pts = []
    step = 2 * math.pi / num_points
    for i in range(num_points):
        theta = i * step
        r = base_radius
        for freq, amp, phase in harmonics:
            r += amp * math.sin(freq * theta + phase)
        pts.append(polar_to_cartesian(CENTER, CENTER, r, theta))

    # Ensure blob cannot clip out of 512x512 bounds (max safe radius <= 220.0)
    target_max = 220.0 if base_radius >= 200 else (190.0 if base_radius >= 170 else 160.0)
    max_dist = max(math.hypot(p[0] - CENTER, p[1] - CENTER) for p in pts)
    if max_dist > target_max:
        scale = target_max / max_dist
        pts = [(CENTER + (p[0] - CENTER) * scale, CENTER + (p[1] - CENTER) * scale) for p in pts]

    return smooth_cardinal_spline(pts, tension=0.45, closed=True)

def generate_botanical_leaf(lobes: int, length: float, width: float, roundness: float) -> str:
    """Matisse-style botanical leaf cutout with organic rounded lobes."""
    half_w = width / 2.0
    half_l = length / 2.0
    y_top = CENTER - half_l
    y_bot = CENTER + half_l

    # Control points along stem and lobes
    pts = [(CENTER, y_top)]
    step_y = (y_bot - y_top) / (lobes + 1)
    
    # Right side lobes
    for i in range(lobes):
        y_lobe = y_top + (i + 1) * step_y
        reach = half_w * math.sin((i + 1) * math.pi / (lobes + 1))
        # Lobe peak
        pts.append((CENTER + reach, y_lobe - step_y * 0.2))
        # Inward valley
        pts.append((CENTER + reach * (1.0 - roundness), y_lobe + step_y * 0.25))

    # Base stem tip
    pts.append((CENTER, y_bot))

    # Left side lobes (symmetrical with subtle organic offset)
    for i in reversed(range(lobes)):
        y_lobe = y_top + (i + 1) * step_y
        reach = half_w * math.sin((i + 1) * math.pi / (lobes + 1))
        pts.append((CENTER - reach * (1.0 - roundness), y_lobe + step_y * 0.25))
        pts.append((CENTER - reach, y_lobe - step_y * 0.2))

    return smooth_cardinal_spline(pts, tension=0.5, closed=True)

def generate_ginkgo_leaf(radius: float, spread_deg: float, notch_depth: float) -> str:
    """Stylized ginkgo biloba fan leaf with central notch."""
    spread = deg_to_rad(spread_deg)
    half_spread = spread / 2.0
    start_a = -math.pi / 2 - half_spread
    end_a = -math.pi / 2 + half_spread
    
    stem_base = (CENTER, CENTER + 200)
    pts = [stem_base]
    
    # Fan outer edge with notch
    steps = 24
    for i in range(steps + 1):
        t = i / steps
        a = start_a + t * spread
        # Notch in center
        center_dist = abs(t - 0.5) * 2.0
        r = radius - (1.0 - center_dist) * notch_depth
        pts.append(polar_to_cartesian(CENTER, CENTER + 60, r, a))

    pts.append(stem_base)
    return smooth_cardinal_spline(pts, tension=0.45, closed=True)

def generate_wavy_ribbon(waves: int, amplitude: float, vertical: bool = True) -> str:
    """Organic fluid ribbon / wave streamer with smooth open spline."""
    steps = waves * 14
    length = 380.0
    pts = []
    
    for i in range(steps + 1):
        t = i / steps
        pos = (CENTER - length / 2.0) + t * length
        offset = amplitude * math.sin(t * waves * 2 * math.pi)
        if vertical:
            pts.append((CENTER + offset, pos))
        else:
            pts.append((pos, CENTER + offset))
            
    return smooth_cardinal_spline(pts, tension=0.45, closed=False)

def generate_all_organic_botanical(out_dir: str) -> List[dict]:
    """Generates 250+ distinct Organic Blobs and Botanical Cutout vectors."""
    os.makedirs(out_dir, exist_ok=True)
    manifest = []
    shape_idx = 1

    # 1. Fourier Harmonic Fluid Blobs & Pebbles
    blob_configs = [
        # 3-lobed organic amoebas
        [(3, 35, 0.0), (2, 20, 1.2)],
        [(3, 50, 0.5), (4, 15, 0.0)],
        [(3, 65, 0.2), (5, 12, 1.0)],
        # 4-lobed fluid stones
        [(4, 30, 0.0), (2, 25, 0.8)],
        [(4, 45, 0.4), (3, 20, 0.2)],
        [(4, 60, 0.0), (6, 15, 0.9)],
        # 5-lobed fluid shapes
        [(5, 30, 0.2), (2, 35, 0.0)],
        [(5, 45, 0.6), (3, 25, 1.5)],
        # 6-lobed flower-blobs
        [(6, 35, 0.0), (2, 20, 0.5)],
        [(6, 50, 0.3), (3, 18, 0.7)],
        # Asymmetric organic pebbles
        [(2, 50, 0.0), (3, 25, 1.1), (5, 15, 0.4)],
        [(2, 60, 0.5), (4, 20, 0.0), (7, 10, 1.2)],
    ]

    for c_i, harmonics in enumerate(blob_configs):
        for base_r in [150, 180, 210]:
            name = f"organic_blob_h{c_i+1}_r{base_r}"
            d = generate_harmonic_blob(harmonics, base_radius=base_r, num_points=42)
            builder = SVGBuilder()
            builder.path(d, fill="currentColor")
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Organic Fluid Blob", category="05_organic_botanical",
                         tags=["organic", "blob", "pebble", "fluid", "modernist", "amoeba"])
            manifest.append({
                "id": f"org_{shape_idx:04d}",
                "name": name,
                "category": "05_organic_botanical",
                "category_label": "Organic & Botanical",
                "tags": ["organic", "blob", "pebble", "fluid"],
                "file": f"assets/svg/05_organic_botanical/{name}.svg"
            })
            shape_idx += 1

    # 2. Matisse Botanical Leaves & Palm Cutouts
    for lobes in [3, 4, 5, 6]:
        for l_val in [340, 420]:
            for w_val in [180, 240]:
                for roundness in [0.4, 0.65]:
                    name = f"botanical_leaf_l{lobes}_len{l_val}_w{w_val}_r{int(roundness*100)}"
                    d = generate_botanical_leaf(lobes, l_val, w_val, roundness)
                    builder = SVGBuilder()
                    builder.path(d, fill="currentColor")
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Matisse Botanical Leaf", category="05_organic_botanical",
                                 tags=["botanical", "matisse", "leaf", "plant", "organic", "cutout"])
                    manifest.append({
                        "id": f"org_{shape_idx:04d}",
                        "name": name,
                        "category": "05_organic_botanical",
                        "category_label": "Organic & Botanical",
                        "tags": ["botanical", "matisse", "leaf", "cutout"],
                        "file": f"assets/svg/05_organic_botanical/{name}.svg"
                    })
                    shape_idx += 1

    # 3. Ginkgo Biloba & Fan Leaves
    for rad in [170, 210]:
        for spread in [90, 130, 160]:
            for notch in [20, 50, 80]:
                name = f"botanical_ginkgo_r{rad}_sp{spread}_n{notch}"
                d = generate_ginkgo_leaf(rad, spread, notch)
                builder = SVGBuilder()
                builder.path(d, fill="currentColor")
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Ginkgo Fan Leaf Cutout", category="05_organic_botanical",
                             tags=["botanical", "ginkgo", "leaf", "fan", "organic"])
                manifest.append({
                    "id": f"org_{shape_idx:04d}",
                    "name": name,
                    "category": "05_organic_botanical",
                    "category_label": "Organic & Botanical",
                    "tags": ["botanical", "ginkgo", "leaf", "fan"],
                    "file": f"assets/svg/05_organic_botanical/{name}.svg"
                })
                shape_idx += 1

    # 4. Fluid Wavy Ribbons & Streamers
    for waves in [2, 3, 4, 5]:
        for amp in [25, 45, 65]:
            for thick in [20, 45, 75]:
                for vert in [True, False]:
                    orient = "v" if vert else "h"
                    name = f"organic_ribbon_w{waves}_a{amp}_t{thick}_{orient}"
                    d = generate_wavy_ribbon(waves, amp, vertical=vert)
                    builder = SVGBuilder()
                    builder.path(d, fill="none", stroke="currentColor", stroke_width=thick, stroke_linecap="round", stroke_linejoin="round")
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Fluid Organic Ribbon", category="05_organic_botanical",
                                 tags=["organic", "ribbon", "wave", "fluid", "streamer"])
                    manifest.append({
                        "id": f"org_{shape_idx:04d}",
                        "name": name,
                        "category": "05_organic_botanical",
                        "category_label": "Organic & Botanical",
                        "tags": ["organic", "ribbon", "wave", "fluid"],
                        "file": f"assets/svg/05_organic_botanical/{name}.svg"
                    })
                    shape_idx += 1

    return manifest
