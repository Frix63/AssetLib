"""
Generator for Y2K, Cyber Stars, Sparkles, and Chrome Facet vectors.
Generates 250+ distinct mathematical variations of modern cyber star shapes.
"""

import math
import os
from typing import List, Tuple
from src.common import SVGBuilder, CENTER, polar_to_cartesian, deg_to_rad, format_num

def generate_pinched_star(n_points: int, r_outer: float, pinch: float, rot_deg: float = 0.0) -> str:
    """
    Generate an astroid/pinch star where edges curve inward toward the center.
    pinch: 0.1 (very flat/chubby) to 0.95 (needle thin spikes)
    """
    pts = []
    angle_step = 2 * math.pi / n_points
    rot = deg_to_rad(rot_deg)

    # We will construct path using cubic beziers
    cmds = []
    for i in range(n_points):
        a_tip = rot + i * angle_step
        a_next_tip = rot + (i + 1) * angle_step
        a_mid = (a_tip + a_next_tip) / 2.0

        p_tip = polar_to_cartesian(CENTER, CENTER, r_outer, a_tip)
        p_next = polar_to_cartesian(CENTER, CENTER, r_outer, a_next_tip)

        # Control points curve inward toward center
        r_inner = r_outer * (1.0 - pinch)
        cp_dist = r_inner * 1.2
        cp1 = polar_to_cartesian(CENTER, CENTER, cp_dist, a_tip + angle_step * 0.25)
        cp2 = polar_to_cartesian(CENTER, CENTER, cp_dist, a_next_tip - angle_step * 0.25)

        if i == 0:
            cmds.append(f"M {format_num(p_tip[0])} {format_num(p_tip[1])}")
        cmds.append(f"C {format_num(cp1[0])} {format_num(cp1[1])} {format_num(cp2[0])} {format_num(cp2[1])} {format_num(p_next[0])} {format_num(p_next[1])}")

    cmds.append("Z")
    return " ".join(cmds)

def generate_polygon_star(n_points: int, r_outer: float, r_inner: float, rot_deg: float = 0.0) -> str:
    """Classic straight-edged star polygon."""
    pts = []
    total_vertices = n_points * 2
    step = 2 * math.pi / total_vertices
    rot = deg_to_rad(rot_deg)
    for i in range(total_vertices):
        rad = r_outer if i % 2 == 0 else r_inner
        a = rot + i * step
        pts.append(polar_to_cartesian(CENTER, CENTER, rad, a))
    
    cmds = [f"M {format_num(pts[0][0])} {format_num(pts[0][1])}"]
    for p in pts[1:]:
        cmds.append(f"L {format_num(p[0])} {format_num(p[1])}")
    cmds.append("Z")
    return " ".join(cmds)

def generate_faceted_star(n_points: int, r_outer: float, r_inner: float, rot_deg: float = 0.0) -> List[Tuple[str, str]]:
    """
    Faceted 3D chrome star made of alternating light/dark faceted triangles meeting at center.
    Returns list of (path_d, fill_tone).
    """
    facets = []
    total_vertices = n_points * 2
    step = 2 * math.pi / total_vertices
    rot = deg_to_rad(rot_deg)
    
    verts = []
    for i in range(total_vertices):
        rad = r_outer if i % 2 == 0 else r_inner
        a = rot + i * step
        verts.append(polar_to_cartesian(CENTER, CENTER, rad, a))
        
    for i in range(total_vertices):
        p1 = verts[i]
        p2 = verts[(i + 1) % total_vertices]
        d = f"M {CENTER} {CENTER} L {p1[0]} {p1[1]} L {p2[0]} {p2[1]} Z"
        is_solid = (i % 2 == 0)
        facets.append((d, is_solid))
    return facets

def generate_compass_star(r_main: float, r_sub: float, r_inner: float, rot_deg: float = 0.0) -> str:
    """8-point compass star with 4 primary long arms and 4 secondary shorter arms."""
    pts = []
    step = 2 * math.pi / 16
    rot = deg_to_rad(rot_deg)
    for i in range(16):
        if i % 4 == 0:
            rad = r_main
        elif i % 2 == 0:
            rad = r_sub
        else:
            rad = r_inner
        a = rot + i * step
        pts.append(polar_to_cartesian(CENTER, CENTER, rad, a))
        
    cmds = [f"M {format_num(pts[0][0])} {format_num(pts[0][1])}"]
    for p in pts[1:]:
        cmds.append(f"L {format_num(p[0])} {format_num(p[1])}")
    cmds.append("Z")
    return " ".join(cmds)

def generate_lens_sparkle(r_vert: float, r_horiz: float, pinch: float, rot_deg: float = 0.0) -> str:
    """Anamorphic lens flare / asymmetric sparkle star."""
    rot = deg_to_rad(rot_deg)
    # 4 points with different horizontal / vertical radii
    radii = [r_vert, r_horiz, r_vert, r_horiz]
    cmds = []
    for i in range(4):
        a_tip = rot + i * (math.pi / 2)
        a_next = rot + (i + 1) * (math.pi / 2)
        r1 = radii[i]
        r2 = radii[(i + 1) % 4]
        
        p1 = polar_to_cartesian(CENTER, CENTER, r1, a_tip)
        p2 = polar_to_cartesian(CENTER, CENTER, r2, a_next)
        
        mid_r = min(r1, r2) * (1.0 - pinch)
        cp1 = polar_to_cartesian(CENTER, CENTER, mid_r, a_tip + math.pi / 8)
        cp2 = polar_to_cartesian(CENTER, CENTER, mid_r, a_next - math.pi / 8)
        
        if i == 0:
            cmds.append(f"M {format_num(p1[0])} {format_num(p1[1])}")
        cmds.append(f"C {format_num(cp1[0])} {format_num(cp1[1])} {format_num(cp2[0])} {format_num(cp2[1])} {format_num(p2[0])} {format_num(p2[1])}")
    cmds.append("Z")
    return " ".join(cmds)

def generate_all_y2k_stars(out_dir: str) -> List[dict]:
    """Generates 250+ distinct Y2K & Cyber Star SVGs."""
    os.makedirs(out_dir, exist_ok=True)
    manifest = []
    shape_idx = 1

    # 1. Classic Pinched Cyber Stars (4, 5, 6, 8, 12, 16 points) with multiple pinch factors
    for n in [4, 5, 6, 8, 12, 16]:
        for pinch_val in [0.45, 0.60, 0.72, 0.82, 0.90, 0.95]:
            for r_out in [210, 230]:
                star_name = f"y2k_pinch_star_{n}pt_p{int(pinch_val*100)}_r{r_out}"
                builder = SVGBuilder()
                d = generate_pinched_star(n, r_out, pinch_val, 0)
                builder.path(d, fill="currentColor")
                
                filepath = os.path.join(out_dir, f"{star_name}.svg")
                builder.save(filepath, title=f"{n}-Point Y2K Cyber Star", category="01_y2k_cyber_stars",
                             tags=["y2k", "cyber", "star", "sparkle", f"{n}-point", "pinch"])
                manifest.append({
                    "id": f"y2k_{shape_idx:04d}",
                    "name": star_name,
                    "category": "01_y2k_cyber_stars",
                    "category_label": "Y2K & Cyber Stars",
                    "tags": ["y2k", "cyber", "star", "sparkle", f"{n}-point"],
                    "file": f"assets/svg/01_y2k_cyber_stars/{star_name}.svg"
                })
                shape_idx += 1

    # 2. Polygon Stars (geometric / sharp)
    for n in [4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24]:
        for ratio in [0.15, 0.25, 0.35, 0.48]:
            r_out = 225
            r_in = r_out * ratio
            star_name = f"y2k_sharp_star_{n}pt_ratio{int(ratio*100)}"
            builder = SVGBuilder()
            d = generate_polygon_star(n, r_out, r_in, 0)
            builder.path(d, fill="currentColor")
            
            filepath = os.path.join(out_dir, f"{star_name}.svg")
            builder.save(filepath, title=f"{n}-Point Sharp Star", category="01_y2k_cyber_stars",
                         tags=["y2k", "sharp", "star", f"{n}-point", "geometric"])
            manifest.append({
                "id": f"y2k_{shape_idx:04d}",
                "name": star_name,
                "category": "01_y2k_cyber_stars",
                "category_label": "Y2K & Cyber Stars",
                "tags": ["y2k", "sharp", "star", f"{n}-point"],
                "file": f"assets/svg/01_y2k_cyber_stars/{star_name}.svg"
            })
            shape_idx += 1

    # 3. Faceted Chrome Stars (3D effect with razor-sharp miter alignment)
    for n in [4, 5, 6, 8, 12]:
        for ratio in [0.22, 0.35, 0.50]:
            r_out = 220
            r_in = r_out * ratio
            star_name = f"y2k_faceted_chrome_star_{n}pt_ratio{int(ratio*100)}"
            builder = SVGBuilder()
            total_vertices = n * 2
            step = 2 * math.pi / total_vertices
            verts = []
            for i in range(total_vertices):
                rad = r_out if i % 2 == 0 else r_in
                a = -math.pi / 2 + i * step
                verts.append(polar_to_cartesian(CENTER, CENTER, rad, a))

            # 1. Shaded solid facets (stroke=none)
            for i in range(total_vertices):
                if i % 2 == 0:
                    p1 = verts[i]
                    p2 = verts[(i + 1) % total_vertices]
                    d_facet = f"M {CENTER} {CENTER} L {p1[0]} {p1[1]} L {p2[0]} {p2[1]} Z"
                    builder.path(d_facet, fill="currentColor", stroke="none")

            # 2. Unified outer star perimeter with razor-sharp miter join
            d_outer = "M " + " L ".join(f"{p[0]} {p[1]}" for p in verts) + " Z"
            builder.path(d_outer, fill="none", stroke="currentColor", stroke_width=3, stroke_linejoin="miter", stroke_miterlimit=10.0)

            # 3. Internal radial spine lines to tips and valleys
            for p in verts:
                builder.path(f"M {CENTER} {CENTER} L {p[0]} {p[1]}", fill="none", stroke="currentColor", stroke_width=3, stroke_linecap="butt")

            filepath = os.path.join(out_dir, f"{star_name}.svg")
            builder.save(filepath, title=f"{n}-Point Faceted Chrome Star", category="01_y2k_cyber_stars",
                         tags=["y2k", "faceted", "chrome", "3d", "star", f"{n}-point"])
            manifest.append({
                "id": f"y2k_{shape_idx:04d}",
                "name": star_name,
                "category": "01_y2k_cyber_stars",
                "category_label": "Y2K & Cyber Stars",
                "tags": ["y2k", "faceted", "chrome", "3d", "star"],
                "file": f"assets/svg/01_y2k_cyber_stars/{star_name}.svg"
            })
            shape_idx += 1

    # 4. Compass Stars & Sparkle Clusters
    for r_sub_ratio in [0.4, 0.55, 0.7]:
        for r_in_ratio in [0.12, 0.22, 0.32]:
            star_name = f"y2k_compass_star_s{int(r_sub_ratio*100)}_in{int(r_in_ratio*100)}"
            builder = SVGBuilder()
            d = generate_compass_star(230, 230 * r_sub_ratio, 230 * r_in_ratio, 0)
            builder.path(d, fill="currentColor")
            
            filepath = os.path.join(out_dir, f"{star_name}.svg")
            builder.save(filepath, title="Compass Cyber Star", category="01_y2k_cyber_stars",
                         tags=["y2k", "compass", "star", "8-point"])
            manifest.append({
                "id": f"y2k_{shape_idx:04d}",
                "name": star_name,
                "category": "01_y2k_cyber_stars",
                "category_label": "Y2K & Cyber Stars",
                "tags": ["y2k", "compass", "star"],
                "file": f"assets/svg/01_y2k_cyber_stars/{star_name}.svg"
            })
            shape_idx += 1

    # 5. Anamorphic Lens Sparkles
    for flare_ratio in [1.5, 2.0, 2.8, 3.5, 4.5]:
        for pinch in [0.75, 0.85, 0.92]:
            star_name = f"y2k_lens_sparkle_ratio{int(flare_ratio*10)}_p{int(pinch*100)}"
            builder = SVGBuilder()
            d = generate_lens_sparkle(230 / flare_ratio, 230, pinch, 0)
            builder.path(d, fill="currentColor")
            
            filepath = os.path.join(out_dir, f"{star_name}.svg")
            builder.save(filepath, title="Lens Flare Sparkle", category="01_y2k_cyber_stars",
                         tags=["y2k", "lens", "sparkle", "flare", "stretched"])
            manifest.append({
                "id": f"y2k_{shape_idx:04d}",
                "name": star_name,
                "category": "01_y2k_cyber_stars",
                "category_label": "Y2K & Cyber Stars",
                "tags": ["y2k", "lens", "sparkle", "flare"],
                "file": f"assets/svg/01_y2k_cyber_stars/{star_name}.svg"
            })
            shape_idx += 1

    # 6. Hollow / Outline / Dual Ring Cyber Stars
    for n in [4, 6, 8]:
        for p in [0.65, 0.82]:
            for sw in [8, 16, 24]:
                star_name = f"y2k_outline_star_{n}pt_p{int(p*100)}_sw{sw}"
                builder = SVGBuilder()
                d = generate_pinched_star(n, 220, p, 0)
                builder.path(d, fill="none", stroke="currentColor", stroke_width=sw)
                
                filepath = os.path.join(out_dir, f"{star_name}.svg")
                builder.save(filepath, title=f"Hollow {n}-Point Cyber Star", category="01_y2k_cyber_stars",
                             tags=["y2k", "outline", "stroke", "star", f"{n}-point"])
                manifest.append({
                    "id": f"y2k_{shape_idx:04d}",
                    "name": star_name,
                    "category": "01_y2k_cyber_stars",
                    "category_label": "Y2K & Cyber Stars",
                    "tags": ["y2k", "outline", "stroke", "star"],
                    "file": f"assets/svg/01_y2k_cyber_stars/{star_name}.svg"
                })
                shape_idx += 1

    # 7. Nested & Concentric Cyber Stars
    for n in [4, 8]:
        for rings in [2, 3]:
            star_name = f"y2k_nested_star_{n}pt_{rings}rings"
            builder = SVGBuilder()
            for r_i in range(rings):
                scale = 1.0 - (r_i * 0.32)
                d = generate_pinched_star(n, 225 * scale, 0.75, (45/n)*r_i if rings > 2 else 0)
                builder.path(d, fill="none", stroke="currentColor", stroke_width=12)
                
            filepath = os.path.join(out_dir, f"{star_name}.svg")
            builder.save(filepath, title=f"Nested {n}-Point Star", category="01_y2k_cyber_stars",
                         tags=["y2k", "nested", "concentric", "star"])
            manifest.append({
                "id": f"y2k_{shape_idx:04d}",
                "name": star_name,
                "category": "01_y2k_cyber_stars",
                "category_label": "Y2K & Cyber Stars",
                "tags": ["y2k", "nested", "concentric", "star"],
                "file": f"assets/svg/01_y2k_cyber_stars/{star_name}.svg"
            })
            shape_idx += 1

    # 8. Star with Center Cutouts (Negative Space circles, diamonds)
    for n in [4, 6, 8]:
        for cutout_r in [35, 60, 85]:
            star_name = f"y2k_cutout_star_{n}pt_hole{cutout_r}"
            builder = SVGBuilder()
            d_outer = generate_pinched_star(n, 220, 0.75, 0)
            # Create compound path with evenodd fill rule
            d_hole = f"M {CENTER - cutout_r} {CENTER} A {cutout_r} {cutout_r} 0 1 0 {CENTER + cutout_r} {CENTER} A {cutout_r} {cutout_r} 0 1 0 {CENTER - cutout_r} {CENTER} Z"
            builder.path(f"{d_outer} {d_hole}", fill="currentColor", fill_rule="evenodd")
            
            filepath = os.path.join(out_dir, f"{star_name}.svg")
            builder.save(filepath, title=f"Cutout {n}-Point Star", category="01_y2k_cyber_stars",
                         tags=["y2k", "cutout", "donut", "star"])
            manifest.append({
                "id": f"y2k_{shape_idx:04d}",
                "name": star_name,
                "category": "01_y2k_cyber_stars",
                "category_label": "Y2K & Cyber Stars",
                "tags": ["y2k", "cutout", "star"],
                "file": f"assets/svg/01_y2k_cyber_stars/{star_name}.svg"
            })
            shape_idx += 1

    return manifest
