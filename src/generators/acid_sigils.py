"""
Generator for Acid Graphics, Cyber Sigils, Neo-Tribal Crests, and Liquid Chrome Spikes.
Generates 250+ distinct mathematical vector shapes for modern rave, acid, and cyber-sigilism design.
"""

import math
import os
from typing import List, Tuple
from src.common import SVGBuilder, CENTER, polar_to_cartesian, deg_to_rad, format_num

def generate_bilateral_sigil(points_half: List[Tuple[float, float]], closed: bool = True) -> str:
    """Reflects a curve or shape across the vertical Y-axis (x = CENTER) with bilateral symmetry."""
    left_pts = [(CENTER - (p[0] - CENTER), p[1]) for p in reversed(points_half)]
    full_pts = points_half + left_pts
    cmds = [f"M {format_num(full_pts[0][0])} {format_num(full_pts[0][1])}"]
    for p in full_pts[1:]:
        cmds.append(f"L {format_num(p[0])} {format_num(p[1])}")
    if closed:
        cmds.append("Z")
    return " ".join(cmds)

def generate_cyber_sigil_crest(wings: int, spike_reach: float, curve_bend: float, inner_pinch: float) -> str:
    """Bilateral cyber-sigilism barbed emblem with curved gothic thorn wings."""
    half_pts = []
    # Center top spine
    half_pts.append((CENTER, CENTER - 210))
    
    # Outer wing spikes
    step_y = 380.0 / (wings + 1)
    for i in range(wings):
        y_base = (CENTER - 180) + (i * step_y)
        # Spike tip flaring outward and upward
        x_tip = CENTER + spike_reach * (1.0 - (i * 0.08))
        upward_lift = max(15.0, abs(curve_bend) * 0.7)
        y_tip = y_base - upward_lift
        
        # Inner valley securely below tip
        x_valley = CENTER + max(25.0, inner_pinch * 0.6)
        y_valley = y_base + (step_y * 0.5)
        
        half_pts.append((x_tip, y_tip))
        half_pts.append((x_valley, y_valley))

    # Bottom tail spike
    half_pts.append((CENTER, CENTER + 210))

    # Construct smooth symmetrical gothic sigil
    return generate_bilateral_sigil(half_pts, closed=True)

def generate_liquid_chrome_spike(spikes: int, r_core: float, r_reach: float, twist_deg: float) -> str:
    """Organic molten liquid spikes with spiral twist."""
    angle_step = 2 * math.pi / spikes
    twist = deg_to_rad(twist_deg)
    cmds = []
    
    for i in range(spikes):
        a_base = i * angle_step
        a_tip = a_base + twist
        a_next = (i + 1) * angle_step

        p_base = polar_to_cartesian(CENTER, CENTER, r_core, a_base)
        p_tip = polar_to_cartesian(CENTER, CENTER, r_reach, a_tip)
        p_next = polar_to_cartesian(CENTER, CENTER, r_core, a_next)

        # Bezier control points for organic liquid chrome feel
        cp1 = polar_to_cartesian(CENTER, CENTER, (r_core + r_reach) * 0.45, a_base + twist * 0.3)
        cp2 = polar_to_cartesian(CENTER, CENTER, r_reach * 0.85, a_tip - twist * 0.2)
        cp3 = polar_to_cartesian(CENTER, CENTER, r_reach * 0.75, a_tip + (a_next - a_tip) * 0.4)
        cp4 = polar_to_cartesian(CENTER, CENTER, (r_core + r_reach) * 0.4, a_next - (a_next - a_tip) * 0.3)

        if i == 0:
            cmds.append(f"M {format_num(p_base[0])} {format_num(p_base[1])}")
        cmds.append(f"C {format_num(cp1[0])} {format_num(cp1[1])} {format_num(cp2[0])} {format_num(cp2[1])} {format_num(p_tip[0])} {format_num(p_tip[1])}")
        cmds.append(f"C {format_num(cp3[0])} {format_num(cp3[1])} {format_num(cp4[0])} {format_num(cp4[1])} {format_num(p_next[0])} {format_num(p_next[1])}")

    cmds.append("Z")
    return " ".join(cmds)

def generate_hyperspace_vortex(arms: int, turns: float, stroke_w: float = 8.0) -> str:
    """Hyperspace spiral vortex / black hole twirl with dynamic core eye and silky power curves."""
    cmds = []
    angle_step = 2 * math.pi / arms
    pts_per_arm = 72
    r_max = max(60.0, 216.0 - stroke_w / 2.0)
    r_min = max(14.0, (arms * stroke_w) / (2.0 * math.pi * 1.35))
    
    for arm in range(arms):
        base_angle = arm * angle_step
        arm_pts = []
        for step in range(pts_per_arm):
            t = step / (pts_per_arm - 1)
            r = r_min + (r_max - r_min) * (t ** 0.75)
            theta = base_angle + t * turns * 2.0 * math.pi
            arm_pts.append(polar_to_cartesian(CENTER, CENTER, r, theta))
        
        # Connect arm path
        cmds.append(f"M {format_num(arm_pts[0][0])} {format_num(arm_pts[0][1])}")
        for pt in arm_pts[1:]:
            cmds.append(f"L {format_num(pt[0])} {format_num(pt[1])}")
            
    return " ".join(cmds)

def generate_neo_tribal_barb(length: float, width: float, barb_count: int) -> SVGBuilder:
    """Neo-tribal razor barb blade with 4-fold or 8-fold rotational symmetry."""
    b = SVGBuilder()
    
    for rot_i in range(4):
        rot = rot_i * (math.pi / 2)
        # Generate single blade
        pts = []
        pts.append(polar_to_cartesian(CENTER, CENTER, 20, rot))
        for j in range(barb_count):
            t = (j + 1) / (barb_count + 1)
            r_main = 20 + t * length
            r_barb = r_main + 25
            pts.append(polar_to_cartesian(CENTER, CENTER, r_main, rot + 0.08))
            pts.append(polar_to_cartesian(CENTER, CENTER, r_barb, rot + 0.25))
            pts.append(polar_to_cartesian(CENTER, CENTER, r_main, rot + 0.02))
        pts.append(polar_to_cartesian(CENTER, CENTER, length + 20, rot))
        
        # Mirror blade back
        for j in reversed(range(barb_count)):
            t = (j + 1) / (barb_count + 1)
            r_main = 20 + t * length
            r_barb = r_main + 25
            pts.append(polar_to_cartesian(CENTER, CENTER, r_main, rot - 0.02))
            pts.append(polar_to_cartesian(CENTER, CENTER, r_barb, rot - 0.25))
            pts.append(polar_to_cartesian(CENTER, CENTER, r_main, rot - 0.08))
            
        d = [f"M {pts[0][0]} {pts[0][1]}"]
        for p in pts[1:]:
            d.append(f"L {p[0]} {p[1]}")
        d.append("Z")
        b.path(" ".join(d), fill="currentColor")
        
    return b

def generate_all_acid_sigils(out_dir: str) -> List[dict]:
    """Generates 250+ distinct Acid Graphics & Cyber Sigil vectors."""
    os.makedirs(out_dir, exist_ok=True)
    manifest = []
    shape_idx = 1

    # 1. Bilateral Cyber-Sigil Crests (Gothic / Cyber-tribal emblems)
    for wings in [3, 4, 5, 6, 7]:
        for reach in [140, 180, 220]:
            for bend in [-40, -15, 20, 50]:
                for pinch in [20, 50, 80]:
                    name = f"acid_sigil_crest_w{wings}_r{reach}_b{bend}_p{pinch}"
                    d = generate_cyber_sigil_crest(wings, reach, bend, pinch)
                    builder = SVGBuilder()
                    builder.path(d, fill="currentColor")
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Cyber Sigil Crest", category="03_acid_cyber_sigils",
                                 tags=["acid", "cyber", "sigil", "crest", "tribal", "gothic"])
                    manifest.append({
                        "id": f"acid_{shape_idx:04d}",
                        "name": name,
                        "category": "03_acid_cyber_sigils",
                        "category_label": "Acid & Cyber Sigils",
                        "tags": ["acid", "cyber", "sigil", "crest", "tribal"],
                        "file": f"assets/svg/03_acid_cyber_sigils/{name}.svg"
                    })
                    shape_idx += 1

    # 2. Liquid Chrome Spikes & Molten Talons
    for spikes in [3, 4, 5, 6, 8, 10]:
        for r_core in [40, 80]:
            for twist in [-60, -25, 30, 75]:
                name = f"acid_liquid_chrome_spk{spikes}_c{r_core}_tw{twist}"
                d = generate_liquid_chrome_spike(spikes, r_core, 230, twist)
                builder = SVGBuilder()
                builder.path(d, fill="currentColor")
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Liquid Chrome Spike", category="03_acid_cyber_sigils",
                             tags=["acid", "chrome", "liquid", "spikes", "molten"])
                manifest.append({
                    "id": f"acid_{shape_idx:04d}",
                    "name": name,
                    "category": "03_acid_cyber_sigils",
                    "category_label": "Acid & Cyber Sigils",
                    "tags": ["acid", "chrome", "liquid", "spikes"],
                    "file": f"assets/svg/03_acid_cyber_sigils/{name}.svg"
                })
                shape_idx += 1

    # 3. Hyperspace Vortexes & Black Hole Twirls
    for arms in [4, 6, 8, 12, 16]:
        for turns in [0.4, 0.8, 1.2, 1.8]:
            for sw in [4, 8]:
                name = f"acid_vortex_arm{arms}_t{int(turns*10)}_w{sw}"
                d = generate_hyperspace_vortex(arms, turns, sw)
                builder = SVGBuilder()
                builder.path(d, fill="none", stroke="currentColor", stroke_width=sw, stroke_linecap="round", stroke_linejoin="round")
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Hyperspace Spiral Vortex", category="03_acid_cyber_sigils",
                             tags=["acid", "vortex", "spiral", "warp", "hyperspace"])
                manifest.append({
                    "id": f"acid_{shape_idx:04d}",
                    "name": name,
                    "category": "03_acid_cyber_sigils",
                    "category_label": "Acid & Cyber Sigils",
                    "tags": ["acid", "vortex", "spiral", "warp"],
                    "file": f"assets/svg/03_acid_cyber_sigils/{name}.svg"
                })
                shape_idx += 1

    # 4. Neo-Tribal Razor Barbs & Blades
    for l_val in [140, 190, 220]:
        for barbs in [2, 3, 4]:
            name = f"acid_neo_tribal_barb_l{l_val}_b{barbs}"
            builder = generate_neo_tribal_barb(l_val, 30, barbs)
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Neo-Tribal Razor Barb", category="03_acid_cyber_sigils",
                         tags=["acid", "tribal", "barb", "blade", "cyber-tribal"])
            manifest.append({
                "id": f"acid_{shape_idx:04d}",
                "name": name,
                "category": "03_acid_cyber_sigils",
                "category_label": "Acid & Cyber Sigils",
                "tags": ["acid", "tribal", "barb", "blade"],
                "file": f"assets/svg/03_acid_cyber_sigils/{name}.svg"
            })
            shape_idx += 1

    return manifest
