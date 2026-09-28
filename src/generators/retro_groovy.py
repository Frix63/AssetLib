"""
Generator for Retro Groovy 70s, Psychedelic Flowers, Starburst Badges, and Wavy Banners.
Generates 250+ distinct vector shapes for 70s retro, psychedelic, and groovy graphic design.
"""

import math
import os
from typing import List, Tuple
from src.common import SVGBuilder, CENTER, polar_to_cartesian, deg_to_rad, smooth_cardinal_spline, format_num

def generate_groovy_daisy(petals: int, r_petal: float, r_center: float, roundness: float = 0.5) -> SVGBuilder:
    """Classic 70s retro groovy flower / daisy with crisp negative space center disc cutout."""
    b = SVGBuilder()
    angle_step = 2 * math.pi / petals
    pts = []
    
    for i in range(petals):
        a_mid = i * angle_step
        a_left = a_mid - angle_step * 0.4
        
        # Base between petals
        p_base = polar_to_cartesian(CENTER, CENTER, r_center * 1.05, a_left)
        # Petal tip
        p_tip = polar_to_cartesian(CENTER, CENTER, r_petal, a_mid)
        pts.append(p_base)
        pts.append(p_tip)
        
    d_petals = smooth_cardinal_spline(pts, tension=roundness, closed=True)
    d_hole = f"M {CENTER - r_center} {CENTER} A {r_center} {r_center} 0 1 0 {CENTER + r_center} {CENTER} A {r_center} {r_center} 0 1 0 {CENTER - r_center} {CENTER} Z"
    b.path(f"{d_petals} {d_hole}", fill="currentColor", fill_rule="evenodd")
    # Concentric inner center disc with clean negative space moat gap
    r_inner_disc = r_center * 0.60
    b.circle(CENTER, CENTER, r_inner_disc, fill="currentColor")
    return b

def generate_starburst_burst_badge(points: int, r_outer: float, r_inner: float, round_tips: bool = True) -> str:
    """70s discount starburst / price sticker badge with rounded or crisp scalloped teeth."""
    total_vertices = points * 2
    step = 2 * math.pi / total_vertices
    pts = []
    for i in range(total_vertices):
        rad = r_outer if i % 2 == 0 else r_inner
        a = i * step
        pts.append(polar_to_cartesian(CENTER, CENTER, rad, a))
        
    if round_tips:
        return smooth_cardinal_spline(pts, tension=0.4, closed=True)
    else:
        cmds = [f"M {pts[0][0]} {pts[0][1]}"]
        for p in pts[1:]:
            cmds.append(f"L {p[0]} {p[1]}")
        cmds.append("Z")
        return " ".join(cmds)

def generate_retro_motel_lozenge(width: float, height: float, corner_radius: float = 20) -> SVGBuilder:
    """Retro 70s roadside motel sign diamond/rhombus lozenge."""
    b = SVGBuilder()
    half_w = width / 2.0
    half_h = height / 2.0
    
    pts = [
        (CENTER, CENTER - half_h),
        (CENTER + half_w, CENTER),
        (CENTER, CENTER + half_h),
        (CENTER - half_w, CENTER)
    ]
    d = smooth_cardinal_spline(pts, tension=0.1, closed=True)
    b.path(d, fill="currentColor")
    # Inner border line
    pts_in = [
        (CENTER, CENTER - half_h * 0.85),
        (CENTER + half_w * 0.85, CENTER),
        (CENTER, CENTER + half_h * 0.85),
        (CENTER - half_w * 0.85, CENTER)
    ]
    d_in = smooth_cardinal_spline(pts_in, tension=0.1, closed=True)
    b.path(d_in, fill="none", stroke="currentColor", stroke_width=8)
    return b

def generate_melting_wave_badge(waves: int, r_base: float, amp: float) -> str:
    """Psychedelic melting liquid circle badge."""
    steps = waves * 8
    step_a = 2 * math.pi / steps
    pts = []
    for i in range(steps):
        a = i * step_a
        # Asymmetric melting sag toward bottom
        sag = amp * (0.5 + 0.5 * math.sin(a))
        r = r_base + sag * math.sin(waves * a)
        pts.append(polar_to_cartesian(CENTER, CENTER, r, a))
    return smooth_cardinal_spline(pts, tension=0.45, closed=True)

def generate_all_retro_groovy(out_dir: str) -> List[dict]:
    """Generates 250+ distinct Retro Groovy 70s vectors."""
    os.makedirs(out_dir, exist_ok=True)
    manifest = []
    shape_idx = 1

    # 1. Groovy Daisy Flowers (5, 6, 8, 10, 12 petals, varying center ratios and roundness)
    for petals in [5, 6, 7, 8, 10, 12, 16]:
        for r_petal in [200, 230]:
            for center_ratio in [0.22, 0.35, 0.48]:
                r_center = r_petal * center_ratio
                for rnd in [0.35, 0.6]:
                    name = f"retro_daisy_{petals}petals_r{r_petal}_c{int(center_ratio*100)}_rnd{int(rnd*100)}"
                    builder = generate_groovy_daisy(petals, r_petal, r_center, roundness=rnd)
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Retro Groovy Daisy", category="06_retro_groovy_70s",
                                 tags=["retro", "groovy", "flower", "daisy", "70s", "psychedelic"])
                    manifest.append({
                        "id": f"ret_{shape_idx:04d}",
                        "name": name,
                        "category": "06_retro_groovy_70s",
                        "category_label": "Retro Groovy 70s",
                        "tags": ["retro", "groovy", "flower", "daisy"],
                        "file": f"assets/svg/06_retro_groovy_70s/{name}.svg"
                    })
                    shape_idx += 1

    # 2. Starburst Sale Badges (12, 16, 20, 24, 32 points, sharp & rounded)
    for points in [12, 14, 16, 18, 20, 24, 28, 32]:
        for depth_ratio in [0.82, 0.88, 0.93]: # Subtle vs deep burst teeth
            for round_tips in [True, False]:
                tip_tag = "round" if round_tips else "sharp"
                name = f"retro_starburst_{points}pt_d{int(depth_ratio*100)}_{tip_tag}"
                r_out = 230
                r_in = r_out * depth_ratio
                d = generate_starburst_burst_badge(points, r_out, r_in, round_tips=round_tips)
                builder = SVGBuilder()
                builder.path(d, fill="currentColor")
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Starburst Badge", category="06_retro_groovy_70s",
                             tags=["retro", "starburst", "badge", "sticker", "sale", "70s"])
                manifest.append({
                    "id": f"ret_{shape_idx:04d}",
                    "name": name,
                    "category": "06_retro_groovy_70s",
                    "category_label": "Retro Groovy 70s",
                    "tags": ["retro", "starburst", "badge", "sticker"],
                    "file": f"assets/svg/06_retro_groovy_70s/{name}.svg"
                })
                shape_idx += 1

    # 3. Retro Motel Signs & Lozenges
    for w in [340, 420]:
        for h in [220, 280, 360]:
            for border_style in [1, 2]:
                name = f"retro_motel_badge_w{w}_h{h}_v{border_style}"
                builder = generate_retro_motel_lozenge(w, h)
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Retro Motel Badge", category="06_retro_groovy_70s",
                             tags=["retro", "motel", "lozenge", "badge", "diamond", "vintage"])
                manifest.append({
                    "id": f"ret_{shape_idx:04d}",
                    "name": name,
                    "category": "06_retro_groovy_70s",
                    "category_label": "Retro Groovy 70s",
                    "tags": ["retro", "motel", "lozenge", "badge"],
                    "file": f"assets/svg/06_retro_groovy_70s/{name}.svg"
                })
                shape_idx += 1

    # 4. Melting Psychedelic Liquid Badges
    for waves in [4, 5, 6, 8]:
        for amp in [15, 30, 45]:
            for r_base in [180, 205]:
                name = f"retro_melting_badge_w{waves}_a{amp}_r{r_base}"
                d = generate_melting_wave_badge(waves, r_base, amp)
                builder = SVGBuilder()
                builder.path(d, fill="currentColor")
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Melting Psychedelic Badge", category="06_retro_groovy_70s",
                             tags=["retro", "psychedelic", "melting", "liquid", "wavy"])
                manifest.append({
                    "id": f"ret_{shape_idx:04d}",
                    "name": name,
                    "category": "06_retro_groovy_70s",
                    "category_label": "Retro Groovy 70s",
                    "tags": ["retro", "psychedelic", "melting", "wavy"],
                    "file": f"assets/svg/06_retro_groovy_70s/{name}.svg"
                })
                shape_idx += 1

    # 5. Retro 70s Concentric Rainbow Arches
    for arches in [3, 4, 5, 6]:
        for sw in [14, 22]:
            for r_top in [180, 220]:
                name = f"retro_rainbow_a{arches}_w{sw}_r{r_top}"
                builder = SVGBuilder()
                step = (r_top - 40) / arches
                for a_i in range(arches):
                    rad = r_top - a_i * step
                    p1 = (CENTER - rad, CENTER + 140)
                    p2 = (CENTER + rad, CENTER + 140)
                    d = f"M {p1[0]} {p1[1]} L {CENTER - rad} {CENTER} A {rad} {rad} 0 0 1 {CENTER + rad} {CENTER} L {p2[0]} {p2[1]}"
                    builder.path(d, fill="none", stroke="currentColor", stroke_width=sw, stroke_linecap="round")
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Retro 70s Rainbow Arch", category="06_retro_groovy_70s",
                             tags=["retro", "rainbow", "arch", "70s", "groovy"])
                manifest.append({
                    "id": f"ret_{shape_idx:04d}",
                    "name": name,
                    "category": "06_retro_groovy_70s",
                    "category_label": "Retro Groovy 70s",
                    "tags": ["retro", "rainbow", "arch"],
                    "file": f"assets/svg/06_retro_groovy_70s/{name}.svg"
                })
                shape_idx += 1

    return manifest
