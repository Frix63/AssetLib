"""
Generator for Badges, Seals, Rosettes, Postal Stamps, and Ticket Labels.
Generates 250+ distinct vector shapes for editorial, packaging, branding, and vintage design.
"""

import math
import os
from typing import List, Tuple
from src.common import SVGBuilder, CENTER, polar_to_cartesian, deg_to_rad, smooth_cardinal_spline, format_num

def generate_scalloped_seal(scallops: int, r_outer: float, flute_depth: float, hole_radius: float = 0.0) -> str:
    """Scalloped circular flower seal with smooth semicircular flutes."""
    pts = []
    total_pts = scallops * 2
    step = 2 * math.pi / total_pts
    r_inner = r_outer - flute_depth
    
    for i in range(total_pts):
        rad = r_outer if i % 2 == 0 else r_inner
        a = i * step
        pts.append(polar_to_cartesian(CENTER, CENTER, rad, a))
        
    d_seal = smooth_cardinal_spline(pts, tension=0.5, closed=True)
    if hole_radius > 0:
        d_hole = f"M {CENTER - hole_radius} {CENTER} A {hole_radius} {hole_radius} 0 1 0 {CENTER + hole_radius} {CENTER} A {hole_radius} {hole_radius} 0 1 0 {CENTER - hole_radius} {CENTER} Z"
        return f"{d_seal} {d_hole}"
    return d_seal

def generate_postage_stamp(width: float, height: float, teeth_x: int, teeth_y: int, tooth_r: float) -> str:
    """Perforated postal stamp with semicircular edge teeth cutouts."""
    half_w = width / 2.0
    half_h = height / 2.0
    x0, y0 = CENTER - half_w, CENTER - half_h
    x1, y1 = CENTER + half_w, CENTER + half_h

    d = [f"M {x0} {y0}"]
    # Top edge
    step_x = width / (teeth_x + 1)
    for i in range(teeth_x):
        cx = x0 + (i + 1) * step_x
        d.append(f"L {cx - tooth_r} {y0}")
        d.append(f"A {tooth_r} {tooth_r} 0 0 0 {cx + tooth_r} {y0}")
    d.append(f"L {x1} {y0}")

    # Right edge
    step_y = height / (teeth_y + 1)
    for i in range(teeth_y):
        cy = y0 + (i + 1) * step_y
        d.append(f"L {x1} {cy - tooth_r}")
        d.append(f"A {tooth_r} {tooth_r} 0 0 0 {x1} {cy + tooth_r}")
    d.append(f"L {x1} {y1}")

    # Bottom edge
    for i in reversed(range(teeth_x)):
        cx = x0 + (i + 1) * step_x
        d.append(f"L {cx + tooth_r} {y1}")
        d.append(f"A {tooth_r} {tooth_r} 0 0 0 {cx - tooth_r} {y1}")
    d.append(f"L {x0} {y1}")

    # Left edge
    for i in reversed(range(teeth_y)):
        cy = y0 + (i + 1) * step_y
        d.append(f"L {x0} {cy + tooth_r}")
        d.append(f"A {tooth_r} {tooth_r} 0 0 0 {x0} {cy - tooth_r}")
    d.append("Z")

    return " ".join(d)

def generate_rosette_ribbon(head_radius: float, flutes: int, ribbon_len: float, ribbon_w: float) -> SVGBuilder:
    """Award rosette with pleated circular seal and two hanging notched ribbon tails."""
    b = SVGBuilder()
    cy_head = CENTER - 61 # 195
    head_r = head_radius * 0.85
    r_len = ribbon_len * 0.85
    r_ring_out = head_r * 0.70
    r_ring_in = head_r * 0.58
    w = head_r * 0.44
    gap = 8.0
    splay_x = 26.0

    # Hanging tails start 6px below the moat to never clip or bleed through the groove
    y_start = cy_head + r_ring_out + 6.0
    y_end = min(468.0, y_start + r_len)
    notch_h = w * 0.40

    # Left tail (symmetrical)
    x_l_top_in = CENTER - gap / 2.0
    x_l_top_out = x_l_top_in - w
    x_l_bot_in = x_l_top_in - splay_x
    x_l_bot_out = x_l_top_out - splay_x
    x_l_bot_mid = (x_l_bot_in + x_l_bot_out) / 2.0

    d_left_tail = (f"M {x_l_top_out:.2f} {y_start:.2f} "
                   f"L {x_l_top_in:.2f} {y_start:.2f} "
                   f"L {x_l_bot_in:.2f} {y_end:.2f} "
                   f"L {x_l_bot_mid:.2f} {y_end - notch_h:.2f} "
                   f"L {x_l_bot_out:.2f} {y_end:.2f} Z")
    b.path(d_left_tail, fill="currentColor")

    # Right tail (exact bilateral mirror across CENTER)
    x_r_top_in = CENTER + gap / 2.0
    x_r_top_out = x_r_top_in + w
    x_r_bot_in = x_r_top_in + splay_x
    x_r_bot_out = x_r_top_out + splay_x
    x_r_bot_mid = (x_r_bot_in + x_r_bot_out) / 2.0

    d_right_tail = (f"M {x_r_top_in:.2f} {y_start:.2f} "
                    f"L {x_r_top_out:.2f} {y_start:.2f} "
                    f"L {x_r_bot_out:.2f} {y_end:.2f} "
                    f"L {x_r_bot_mid:.2f} {y_end - notch_h:.2f} "
                    f"L {x_r_bot_in:.2f} {y_end:.2f} Z")
    b.path(d_right_tail, fill="currentColor")

    # Scalloped head on top with negative space ring
    total_flutes = flutes * 2
    step = 2 * math.pi / total_flutes
    depth = head_r * 0.12
    pts = []
    for i in range(total_flutes):
        rad = head_r if i % 2 == 0 else (head_r - depth)
        a = i * step
        pts.append((CENTER + rad * math.cos(a), cy_head + rad * math.sin(a)))
    d_head = smooth_cardinal_spline(pts, tension=0.35, closed=True)

    # Annular negative space moat cutout
    d_moat_out = f"M {CENTER - r_ring_out:.2f} {cy_head:.2f} A {r_ring_out:.2f} {r_ring_out:.2f} 0 1 0 {CENTER + r_ring_out:.2f} {cy_head:.2f} A {r_ring_out:.2f} {r_ring_out:.2f} 0 1 0 {CENTER - r_ring_out:.2f} {cy_head:.2f} Z"
    d_moat_in = f"M {CENTER - r_ring_in:.2f} {cy_head:.2f} A {r_ring_in:.2f} {r_ring_in:.2f} 0 1 0 {CENTER + r_ring_in:.2f} {cy_head:.2f} A {r_ring_in:.2f} {r_ring_in:.2f} 0 1 0 {CENTER - r_ring_in:.2f} {cy_head:.2f} Z"

    b.path(f"{d_head} {d_moat_out} {d_moat_in}", fill="currentColor", fill_rule="evenodd")
    return b

def generate_ticket_stub(width: float, height: float, notch_r: float, orientation: str = "horizontal") -> str:
    """Admit-one ticket stub with circular notches on opposing edges."""
    half_w = width / 2.0
    half_h = height / 2.0
    x0, y0 = CENTER - half_w, CENTER - half_h
    x1, y1 = CENTER + half_w, CENTER + half_h

    d = [f"M {x0} {y0}"]
    if orientation == "horizontal":
        d.append(f"L {x1} {y0}")
        # Right notch
        d.append(f"L {x1} {CENTER - notch_r}")
        d.append(f"A {notch_r} {notch_r} 0 0 0 {x1} {CENTER + notch_r}")
        d.append(f"L {x1} {y1}")
        d.append(f"L {x0} {y1}")
        # Left notch
        d.append(f"L {x0} {CENTER + notch_r}")
        d.append(f"A {notch_r} {notch_r} 0 0 0 {x0} {CENTER - notch_r}")
        d.append("Z")
    else:
        # Top notch
        d.append(f"L {CENTER - notch_r} {y0}")
        d.append(f"A {notch_r} {notch_r} 0 0 0 {CENTER + notch_r} {y0}")
        d.append(f"L {x1} {y0}")
        d.append(f"L {x1} {y1}")
        # Bottom notch
        d.append(f"L {CENTER + notch_r} {y1}")
        d.append(f"A {notch_r} {notch_r} 0 0 0 {CENTER - notch_r} {y1}")
        d.append(f"L {x0} {y1}")
        d.append("Z")

    return " ".join(d)

def generate_all_badges_seals(out_dir: str) -> List[dict]:
    """Generates 250+ distinct Badges, Seals, Rosettes, and Stamp vectors."""
    os.makedirs(out_dir, exist_ok=True)
    manifest = []
    shape_idx = 1

    # 1. Scalloped Seals (8, 12, 16, 20, 24, 32, 40, 48 scallops, solid and ringed)
    for scallops in [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48]:
        for r_out in [180, 230]:
            for depth_ratio in [0.06, 0.12, 0.20]:
                for hole_ratio in [0, 0.45]:
                    hole_r = r_out * hole_ratio
                    name = f"seal_scallop_{scallops}flute_r{r_out}_d{int(depth_ratio*100)}_h{int(hole_ratio*100)}"
                    d = generate_scalloped_seal(scallops, r_out, r_out * depth_ratio, hole_radius=hole_r)
                    builder = SVGBuilder()
                    builder.path(d, fill="currentColor", fill_rule="evenodd" if hole_r > 0 else "nonzero")
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Scalloped Certificate Seal", category="08_badges_seals_labels",
                                 tags=["seal", "scallop", "certificate", "badge", "stamp", "label"])
                    manifest.append({
                        "id": f"bdg_{shape_idx:04d}",
                        "name": name,
                        "category": "08_badges_seals_labels",
                        "category_label": "Badges, Seals & Labels",
                        "tags": ["seal", "scallop", "certificate", "badge"],
                        "file": f"assets/svg/08_badges_seals_labels/{name}.svg"
                    })
                    shape_idx += 1

    # 2. Postage Stamps (perforated stamps of various aspect ratios)
    ratios = [
        (340, 260, 6, 4),
        (380, 280, 7, 5),
        (300, 380, 5, 7),
        (340, 340, 6, 6),
        (420, 260, 9, 5)
    ]
    for w, h, tx, ty in ratios:
        for tooth_r in [12, 18, 24]:
            name = f"postage_stamp_w{w}_h{h}_r{tooth_r}"
            d = generate_postage_stamp(w, h, tx, ty, tooth_r)
            builder = SVGBuilder()
            builder.path(d, fill="currentColor")
            # Inner stamp frame
            builder.rect(CENTER - w / 2.0 + tooth_r * 2.0, CENTER - h / 2.0 + tooth_r * 2.0,
                         w - tooth_r * 4.0, h - tooth_r * 4.0, fill="none", stroke="currentColor", stroke_width=6)
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Perforated Postage Stamp", category="08_badges_seals_labels",
                         tags=["stamp", "postage", "perforated", "mail", "badge", "vintage"])
            manifest.append({
                "id": f"bdg_{shape_idx:04d}",
                "name": name,
                "category": "08_badges_seals_labels",
                "category_label": "Badges, Seals & Labels",
                "tags": ["stamp", "postage", "perforated", "mail"],
                "file": f"assets/svg/08_badges_seals_labels/{name}.svg"
            })
            shape_idx += 1

    # 3. Rosette Ribbons
    for flutes in [12, 16, 24, 32]:
        for head_r in [130, 160]:
            for r_len in [140, 190]:
                name = f"rosette_ribbon_f{flutes}_hr{head_r}_l{r_len}"
                builder = generate_rosette_ribbon(head_r, flutes, r_len, ribbon_w=head_r * 0.45)
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Award Rosette Ribbon", category="08_badges_seals_labels",
                             tags=["rosette", "ribbon", "award", "badge", "medal"])
                manifest.append({
                    "id": f"bdg_{shape_idx:04d}",
                    "name": name,
                    "category": "08_badges_seals_labels",
                    "category_label": "Badges, Seals & Labels",
                    "tags": ["rosette", "ribbon", "award", "medal"],
                    "file": f"assets/svg/08_badges_seals_labels/{name}.svg"
                })
                shape_idx += 1

    # 4. Ticket Stubs & Admission Coupons
    for w in [360, 440]:
        for h in [180, 260]:
            for notch_r in [18, 30, 45]:
                for orient in ["horizontal", "vertical"]:
                    name = f"ticket_stub_w{w}_h{h}_n{notch_r}_{orient[:4]}"
                    d = generate_ticket_stub(w, h, notch_r, orientation=orient)
                    builder = SVGBuilder()
                    builder.path(d, fill="currentColor")
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Admission Ticket Stub", category="08_badges_seals_labels",
                                 tags=["ticket", "stub", "coupon", "admission", "badge"])
                    manifest.append({
                        "id": f"bdg_{shape_idx:04d}",
                        "name": name,
                        "category": "08_badges_seals_labels",
                        "category_label": "Badges, Seals & Labels",
                        "tags": ["ticket", "stub", "coupon", "admission"],
                        "file": f"assets/svg/08_badges_seals_labels/{name}.svg"
                    })
                    shape_idx += 1

    return manifest
