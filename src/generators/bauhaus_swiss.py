"""
Generator for Bauhaus, Swiss Style, and Modernist Geometric Primitives.
Generates 430+ distinct mathematical vector shapes honoring Bauhaus, De Stijl, and Swiss Graphic Design.
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

def generate_pill_shape(length: float, width: float, style: str = "round") -> SVGBuilder:
    """Modernist capsule / pill with round, sharp, semi-round, or chamfered edges."""
    b = SVGBuilder()
    r = width / 2.0
    half_l = length / 2.0
    x_l = CENTER - half_l
    x_r = CENTER + half_l
    y_t = CENTER - r
    y_b = CENTER + r

    if style == "sharp":
        p_path = f"M {x_l:.1f} {y_t:.1f} L {x_r:.1f} {y_t:.1f} L {x_r:.1f} {y_b:.1f} L {x_l:.1f} {y_b:.1f} Z"
    elif style == "semi":
        # Arch pill: sharp left, rounded right
        p_path = (f"M {x_l:.1f} {y_t:.1f} "
                  f"L {x_r - r:.1f} {y_t:.1f} "
                  f"A {r:.1f} {r:.1f} 0 0 1 {x_r - r:.1f} {y_b:.1f} "
                  f"L {x_l:.1f} {y_b:.1f} Z")
    elif style == "chamfer":
        c = min(24.0, r * 0.6)
        p_path = (f"M {x_l + c:.1f} {y_t:.1f} "
                  f"L {x_r - c:.1f} {y_t:.1f} "
                  f"L {x_r:.1f} {y_t + c:.1f} "
                  f"L {x_r:.1f} {y_b - c:.1f} "
                  f"L {x_r - c:.1f} {y_b:.1f} "
                  f"L {x_l + c:.1f} {y_b:.1f} "
                  f"L {x_l:.1f} {y_b - c:.1f} "
                  f"L {x_l:.1f} {y_t + c:.1f} Z")
    else:
        # Classic fully rounded
        p_path = (f"M {x_l + r:.1f} {y_t:.1f} "
                  f"L {x_r - r:.1f} {y_t:.1f} "
                  f"A {r:.1f} {r:.1f} 0 0 1 {x_r - r:.1f} {y_b:.1f} "
                  f"L {x_l + r:.1f} {y_b:.1f} "
                  f"A {r:.1f} {r:.1f} 0 0 1 {x_l + r:.1f} {y_t:.1f} Z")

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
                d = f"M {cx} {cy} L {cx + cell_sz} {cy} A {cell_sz} {cell_sz} 0 0 1 {cx} {cy + cell_sz} Z"
                b.path(d, fill="currentColor")
            elif mode == 1:
                d = f"M {cx + cell_sz} {cy + cell_sz} L {cx} {cy + cell_sz} A {cell_sz} {cell_sz} 0 0 1 {cx + cell_sz} {cy} Z"
                b.path(d, fill="currentColor")
            elif mode == 2:
                b.rect(cx, cy, cell_sz, cell_sz, fill="currentColor")
            elif mode == 3:
                d = f"M {cx} {cy} L {cx + cell_sz} {cy} L {cx} {cy + cell_sz} Z"
                b.path(d, fill="currentColor")
            elif mode == 4:
                b.circle(cx + cell_sz / 2.0, cy + cell_sz / 2.0, cell_sz / 2.0, fill="currentColor")

    return b

def generate_concentric_semicircles(radius: float, rings: int, rounded: bool = True) -> SVGBuilder:
    """Concentric nested semicircles with round or sharp (square) linecaps."""
    b = SVGBuilder()
    step_r = radius / rings
    cap = "round" if rounded else "square"
    
    for i in range(rings):
        r = radius - i * step_r
        if r <= 0:
            continue
        d = f"M {CENTER - r:.1f} {CENTER:.1f} A {r:.1f} {r:.1f} 0 0 1 {CENTER + r:.1f} {CENTER:.1f}"
        b.path(d, fill="none", stroke="currentColor", stroke_width=step_r * 0.45, stroke_linecap=cap)
    return b

def make_rounded_triangle_path(cx: float, cy: float, side: float, r_c: float) -> str:
    """Generate equilateral triangle path with smooth fillet arcs at vertices."""
    h = side * math.sqrt(3) / 2.0
    max_rc = (side / 2.0) / math.sqrt(3) * 0.8
    r_c = min(r_c, max_rc)
    t = r_c * math.sqrt(3)
    
    v1_x = cx + side / 2.0
    v1_y = cy + h / 2.0
    v2_x = cx - side / 2.0
    v2_y = cy + h / 2.0
    
    p0_exit = (cx + t * 0.5, cy - h / 2.0 + t * math.sqrt(3) * 0.5)
    p0_entry = (cx - t * 0.5, cy - h / 2.0 + t * math.sqrt(3) * 0.5)
    
    p1_entry = (v1_x - t * 0.5, v1_y - t * math.sqrt(3) * 0.5)
    p1_exit = (v1_x - t, v1_y)
    
    p2_entry = (v2_x + t, v2_y)
    p2_exit = (v2_x + t * 0.5, v2_y - t * math.sqrt(3) * 0.5)
    
    return (
        f"M {p0_exit[0]:.1f} {p0_exit[1]:.1f} "
        f"L {p1_entry[0]:.1f} {p1_entry[1]:.1f} "
        f"A {r_c:.1f} {r_c:.1f} 0 0 1 {p1_exit[0]:.1f} {p1_exit[1]:.1f} "
        f"L {p2_entry[0]:.1f} {p2_entry[1]:.1f} "
        f"A {r_c:.1f} {r_c:.1f} 0 0 1 {p2_exit[0]:.1f} {p2_exit[1]:.1f} "
        f"L {p0_entry[0]:.1f} {p0_entry[1]:.1f} "
        f"A {r_c:.1f} {r_c:.1f} 0 0 1 {p0_exit[0]:.1f} {p0_exit[1]:.1f} Z"
    )

def generate_bauhaus_triangle(levels: int, size: float, stroke_w: float, rounded: bool = False) -> SVGBuilder:
    """Concentric nested equilateral triangles with sharp or rounded vertices."""
    b = SVGBuilder()
    h = size * math.sqrt(3) / 2.0
    
    if stroke_w > 0:
        join = "round" if rounded else "miter"
        cap = "round" if rounded else "square"
        for i in range(levels):
            scale = 1.0 - (i / levels) * 0.75
            s = size * scale
            cur_h = s * math.sqrt(3) / 2.0
            y_top = CENTER - cur_h / 2.0
            y_base = CENTER + cur_h / 2.0
            x_left = CENTER - s / 2.0
            x_right = CENTER + s / 2.0
            
            if rounded:
                rc = min(20.0, s * 0.12)
                d = make_rounded_triangle_path(CENTER, CENTER, s, rc)
            else:
                d = f"M {CENTER:.1f} {y_top:.1f} L {x_right:.1f} {y_base:.1f} L {x_left:.1f} {y_base:.1f} Z"
            b.path(d, fill="none", stroke="currentColor", stroke_width=stroke_w, stroke_linecap=cap, stroke_linejoin=join, stroke_miterlimit=10.0)
    else:
        if rounded:
            rc_out = min(28.0, size * 0.12)
            d_out = make_rounded_triangle_path(CENTER, CENTER, size, rc_out)
            s_in = size * 0.55
            rc_in = min(16.0, s_in * 0.12)
            d_in = make_rounded_triangle_path(CENTER, CENTER, s_in, rc_in)
        else:
            y_top = CENTER - h / 2.0
            y_base = CENTER + h / 2.0
            d_out = f"M {CENTER:.1f} {y_top:.1f} L {CENTER + size/2.0:.1f} {y_base:.1f} L {CENTER - size/2.0:.1f} {y_base:.1f} Z"
            s_in = size * 0.55
            h_in = s_in * math.sqrt(3) / 2.0
            y_top_in = CENTER - h_in / 2.0
            y_base_in = CENTER + h_in / 2.0
            d_in = f"M {CENTER:.1f} {y_top_in:.1f} L {CENTER - s_in/2.0:.1f} {y_base_in:.1f} L {CENTER + s_in/2.0:.1f} {y_base_in:.1f} Z"
        b.path(f"{d_out} {d_in}", fill="currentColor", fill_rule="evenodd")
    return b

def generate_split_disc(radius: float, offset: float, is_ring: bool = False, rounded: bool = False) -> SVGBuilder:
    """Modernist split disc / semicircle offset with sharp or rounded corners."""
    b = SVGBuilder()
    d_half = offset / 2.0
    top_y = CENTER - d_half
    bot_y = CENTER + d_half
    
    if not is_ring:
        if not rounded:
            top_d = f"M {CENTER - radius:.1f} {top_y:.1f} A {radius:.1f} {radius:.1f} 0 0 1 {CENTER + radius:.1f} {top_y:.1f} Z"
            bot_d = f"M {CENTER + radius:.1f} {bot_y:.1f} A {radius:.1f} {radius:.1f} 0 0 1 {CENTER - radius:.1f} {bot_y:.1f} Z"
        else:
            cr = min(20.0, offset * 0.55, radius * 0.15)
            top_d = (
                f"M {CENTER - radius + cr:.1f} {top_y:.1f} "
                f"L {CENTER + radius - cr:.1f} {top_y:.1f} "
                f"A {cr:.1f} {cr:.1f} 0 0 0 {CENTER + radius:.1f} {top_y - cr:.1f} "
                f"A {radius:.1f} {radius:.1f} 0 0 0 {CENTER - radius:.1f} {top_y - cr:.1f} "
                f"A {cr:.1f} {cr:.1f} 0 0 0 {CENTER - radius + cr:.1f} {top_y:.1f} Z"
            )
            bot_d = (
                f"M {CENTER + radius - cr:.1f} {bot_y:.1f} "
                f"L {CENTER - radius + cr:.1f} {bot_y:.1f} "
                f"A {cr:.1f} {cr:.1f} 0 0 0 {CENTER - radius:.1f} {bot_y + cr:.1f} "
                f"A {radius:.1f} {radius:.1f} 0 0 0 {CENTER + radius:.1f} {bot_y + cr:.1f} "
                f"A {cr:.1f} {cr:.1f} 0 0 0 {CENTER + radius - cr:.1f} {bot_y:.1f} Z"
            )
        b.path(top_d, fill="currentColor")
        b.path(bot_d, fill="currentColor")
    else:
        in_r = radius * 0.55
        if not rounded:
            top_d = f"M {CENTER - radius:.1f} {top_y:.1f} A {radius:.1f} {radius:.1f} 0 0 1 {CENTER + radius:.1f} {top_y:.1f} L {CENTER + in_r:.1f} {top_y:.1f} A {in_r:.1f} {in_r:.1f} 0 0 0 {CENTER - in_r:.1f} {top_y:.1f} Z"
            bot_d = f"M {CENTER + radius:.1f} {bot_y:.1f} A {radius:.1f} {radius:.1f} 0 0 1 {CENTER - radius:.1f} {bot_y:.1f} L {CENTER - in_r:.1f} {bot_y:.1f} A {in_r:.1f} {in_r:.1f} 0 0 0 {CENTER + in_r:.1f} {bot_y:.1f} Z"
        else:
            cr = min(12.0, (radius - in_r) * 0.2, offset * 0.35)
            top_d = (
                f"M {CENTER - radius + cr:.1f} {top_y:.1f} "
                f"A {cr:.1f} {cr:.1f} 0 0 1 {CENTER - radius:.1f} {top_y - cr:.1f} "
                f"A {radius:.1f} {radius:.1f} 0 0 1 {CENTER + radius:.1f} {top_y - cr:.1f} "
                f"A {cr:.1f} {cr:.1f} 0 0 1 {CENTER + radius - cr:.1f} {top_y:.1f} "
                f"L {CENTER + in_r + cr:.1f} {top_y:.1f} "
                f"A {cr:.1f} {cr:.1f} 0 0 1 {CENTER + in_r:.1f} {top_y - cr:.1f} "
                f"A {in_r:.1f} {in_r:.1f} 0 0 0 {CENTER - in_r:.1f} {top_y - cr:.1f} "
                f"A {cr:.1f} {cr:.1f} 0 0 1 {CENTER - in_r - cr:.1f} {top_y:.1f} Z"
            )
            bot_d = (
                f"M {CENTER + radius - cr:.1f} {bot_y:.1f} "
                f"A {cr:.1f} {cr:.1f} 0 0 1 {CENTER + radius:.1f} {bot_y + cr:.1f} "
                f"A {radius:.1f} {radius:.1f} 0 0 1 {CENTER - radius:.1f} {bot_y + cr:.1f} "
                f"A {cr:.1f} {cr:.1f} 0 0 1 {CENTER - radius + cr:.1f} {bot_y:.1f} "
                f"L {CENTER - in_r - cr:.1f} {bot_y:.1f} "
                f"A {cr:.1f} {cr:.1f} 0 0 1 {CENTER - in_r:.1f} {bot_y + cr:.1f} "
                f"A {in_r:.1f} {in_r:.1f} 0 0 0 {CENTER + in_r:.1f} {bot_y + cr:.1f} "
                f"A {cr:.1f} {cr:.1f} 0 0 1 {CENTER + in_r + cr:.1f} {bot_y:.1f} Z"
            )
        b.path(top_d, fill="currentColor")
        b.path(bot_d, fill="currentColor")
    return b

def generate_corner_fan(rings: int, radius: float, rounded: bool = False) -> SVGBuilder:
    """Concentric quarter-circle arcs radiating from corner anchor with sharp or round caps."""
    b = SVGBuilder()
    sw = radius / (rings * 2.2)
    ox = CENTER - radius / 2.0
    oy = CENTER + radius / 2.0
    cap = "round" if rounded else "square"
    
    for i in range(rings):
        r = radius - i * (radius / rings)
        if r <= 0:
            continue
        start_x = ox + r
        start_y = oy
        end_x = ox
        end_y = oy - r
        d = f"M {start_x:.1f} {start_y:.1f} A {r:.1f} {r:.1f} 0 0 0 {end_x:.1f} {end_y:.1f}"
        b.path(d, fill="none", stroke="currentColor", stroke_width=sw, stroke_linecap=cap)
    return b

def generate_bauhaus_botanical(leaf_pairs: int = 3, leaf_style: str = "pointed", head_style: str = "circle", leaf_span: float = 160.0, stem_w: float = 14.0) -> SVGBuilder:
    """Bauhaus & Swiss geometric botanical stem with leaves and flower head."""
    b = SVGBuilder()
    bot_y = 448.0
    top_y = 130.0
    stem_h = bot_y - top_y
    
    # Central stem
    b.rect(CENTER - stem_w / 2.0, top_y, stem_w, stem_h, fill="currentColor")
    
    # Apical head
    if head_style == "circle":
        head_r = 38.0
        head_cy = top_y - head_r - 6.0
        b.circle(CENTER, head_cy, head_r, fill="currentColor")
    else:  # leaf
        head_h = 68.0
        head_w = 40.0
        tip_y = top_y - head_h
        base_y = top_y
        d_head = f"M {CENTER} {base_y} Q {CENTER - head_w} {base_y - head_h * 0.5} {CENTER} {tip_y} Q {CENTER + head_w} {base_y - head_h * 0.5} {CENTER} {base_y} Z"
        b.path(d_head, fill="currentColor")

    # Symmetric lateral leaves
    step_y = (bot_y - top_y - 60.0) / (leaf_pairs + 0.2)
    for i in range(leaf_pairs):
        ly = bot_y - 45.0 - i * step_y
        leaf_len = leaf_span * (1.0 - i * 0.08)
        tip_dy = 32.0
        
        bx_l = CENTER - stem_w / 2.0
        tx_l = bx_l - leaf_len
        ty_l = ly - tip_dy
        
        bx_r = CENTER + stem_w / 2.0
        tx_r = bx_r + leaf_len
        ty_r = ly - tip_dy

        if leaf_style == "pointed":
            d_l = f"M {bx_l:.1f} {ly:.1f} Q {bx_l - leaf_len * 0.3:.1f} {ly - 40:.1f} {tx_l:.1f} {ty_l:.1f} Q {bx_l - leaf_len * 0.7:.1f} {ly + 10:.1f} {bx_l:.1f} {ly:.1f} Z"
            d_r = f"M {bx_r:.1f} {ly:.1f} Q {bx_r + leaf_len * 0.3:.1f} {ly - 40:.1f} {tx_r:.1f} {ty_r:.1f} Q {bx_r + leaf_len * 0.7:.1f} {ly + 10:.1f} {bx_r:.1f} {ly:.1f} Z"
        elif leaf_style == "rounded":
            d_l = f"M {bx_l:.1f} {ly:.1f} C {bx_l - leaf_len * 0.3:.1f} {ly - 45:.1f} {tx_l - 10:.1f} {ty_l - 15:.1f} {tx_l:.1f} {ty_l:.1f} C {tx_l + 10:.1f} {ty_l + 25:.1f} {bx_l - leaf_len * 0.5:.1f} {ly + 18:.1f} {bx_l:.1f} {ly:.1f} Z"
            d_r = f"M {bx_r:.1f} {ly:.1f} C {bx_r + leaf_len * 0.3:.1f} {ly - 45:.1f} {tx_r + 10:.1f} {ty_r - 15:.1f} {tx_r:.1f} {ty_r:.1f} C {tx_r - 10:.1f} {ty_r + 25:.1f} {bx_r + leaf_len * 0.5:.1f} {ly + 18:.1f} {bx_r:.1f} {ly:.1f} Z"
        else:  # semicircle
            rad = leaf_len * 0.5
            d_l = f"M {bx_l:.1f} {ly:.1f} L {tx_l:.1f} {ty_l:.1f} A {rad:.1f} {rad:.1f} 0 0 0 {bx_l:.1f} {ly:.1f} Z"
            d_r = f"M {bx_r:.1f} {ly:.1f} L {tx_r:.1f} {ty_r:.1f} A {rad:.1f} {rad:.1f} 0 0 1 {bx_r:.1f} {ly:.1f} Z"

        b.path(d_l, fill="currentColor")
        b.path(d_r, fill="currentColor")

    return b

def generate_bauhaus_quad_flower(size: float = 380.0, style: str = "pointed", center_hole: float = 0.0, fullness: float = 1.0) -> SVGBuilder:
    """Bauhaus 4-petal geometric flower or astroid concave star."""
    b = SVGBuilder()
    r = size / 2.0
    
    if style == "pointed":
        d_petals = []
        for angle_deg in [0, 90, 180, 270]:
            rad = math.radians(angle_deg)
            cos_a = math.cos(rad)
            sin_a = math.sin(rad)
            tx = CENTER + r * cos_a
            ty = CENTER + r * sin_a
            tx_unit = -sin_a
            ty_unit = cos_a
            w = r * 0.42 * fullness
            c1x = CENTER + r * 0.5 * cos_a + w * tx_unit
            c1y = CENTER + r * 0.5 * sin_a + w * ty_unit
            c2x = CENTER + r * 0.5 * cos_a - w * tx_unit
            c2y = CENTER + r * 0.5 * sin_a - w * ty_unit
            d_petals.append(f"M {CENTER:.1f} {CENTER:.1f} Q {c1x:.1f} {c1y:.1f} {tx:.1f} {ty:.1f} Q {c2x:.1f} {c2y:.1f} {CENTER:.1f} {CENTER:.1f} Z")
        
        path_str = " ".join(d_petals)
        if center_hole > 0:
            hole_d = f"M {CENTER + center_hole:.1f} {CENTER:.1f} A {center_hole:.1f} {center_hole:.1f} 0 1 0 {CENTER - center_hole:.1f} {CENTER:.1f} A {center_hole:.1f} {center_hole:.1f} 0 1 0 {CENTER + center_hole:.1f} {CENTER:.1f} Z"
            b.path(f"{path_str} {hole_d}", fill="currentColor", fill_rule="evenodd")
        else:
            b.path(path_str, fill="currentColor")

    elif style == "rounded":
        d_lobes = []
        lobe_r = r * 0.52 * fullness
        for angle_deg in [0, 90, 180, 270]:
            rad = math.radians(angle_deg)
            cx = CENTER + (r - lobe_r) * math.cos(rad)
            cy = CENTER + (r - lobe_r) * math.sin(rad)
            d_lobes.append(f"M {cx + lobe_r * math.cos(rad):.1f} {cy + lobe_r * math.sin(rad):.1f} A {lobe_r:.1f} {lobe_r:.1f} 0 1 1 {cx - lobe_r * math.cos(rad):.1f} {cy - lobe_r * math.sin(rad):.1f} Z")
        path_str = " ".join(d_lobes)
        if center_hole > 0:
            hole_d = f"M {CENTER + center_hole:.1f} {CENTER:.1f} A {center_hole:.1f} {center_hole:.1f} 0 1 0 {CENTER - center_hole:.1f} {CENTER:.1f} A {center_hole:.1f} {center_hole:.1f} 0 1 0 {CENTER + center_hole:.1f} {CENTER:.1f} Z"
            b.path(f"{path_str} {hole_d}", fill="currentColor", fill_rule="evenodd")
        else:
            b.path(path_str, fill="currentColor")

    else:  # astroid
        d_astroid = (
            f"M {CENTER:.1f} {CENTER - r:.1f} "
            f"Q {CENTER:.1f} {CENTER:.1f} {CENTER + r:.1f} {CENTER:.1f} "
            f"Q {CENTER:.1f} {CENTER:.1f} {CENTER:.1f} {CENTER + r:.1f} "
            f"Q {CENTER:.1f} {CENTER:.1f} {CENTER - r:.1f} {CENTER:.1f} "
            f"Q {CENTER:.1f} {CENTER:.1f} {CENTER:.1f} {CENTER - r:.1f} Z"
        )
        if center_hole > 0:
            hole_d = f"M {CENTER + center_hole:.1f} {CENTER:.1f} A {center_hole:.1f} {center_hole:.1f} 0 1 0 {CENTER - center_hole:.1f} {CENTER:.1f} A {center_hole:.1f} {center_hole:.1f} 0 1 0 {CENTER + center_hole:.1f} {CENTER:.1f} Z"
            b.path(f"{d_astroid} {hole_d}", fill="currentColor", fill_rule="evenodd")
        else:
            b.path(d_astroid, fill="currentColor")

    return b

def generate_bauhaus_crest_bowl(radius: float = 160.0, bowl_style: str = "solid", crown_style: str = "dots", count: int = 5, rounded: bool = True) -> SVGBuilder:
    """Bauhaus modernist semicircle bowl with floating crown crest (dots or teeth)."""
    b = SVGBuilder()
    cy = CENTER + 30.0
    rim_y = cy
    
    if bowl_style == "solid":
        if not rounded:
            bowl_d = f"M {CENTER - radius:.1f} {rim_y:.1f} A {radius:.1f} {radius:.1f} 0 0 0 {CENTER + radius:.1f} {rim_y:.1f} Z"
        else:
            cr = min(20.0, radius * 0.15)
            bowl_d = (
                f"M {CENTER - radius + cr:.1f} {rim_y:.1f} "
                f"L {CENTER + radius - cr:.1f} {rim_y:.1f} "
                f"A {cr:.1f} {cr:.1f} 0 0 1 {CENTER + radius:.1f} {rim_y + cr:.1f} "
                f"A {radius:.1f} {radius:.1f} 0 0 1 {CENTER - radius:.1f} {rim_y + cr:.1f} "
                f"A {cr:.1f} {cr:.1f} 0 0 1 {CENTER - radius + cr:.1f} {rim_y:.1f} Z"
            )
        b.path(bowl_d, fill="currentColor")
    else:  # hollow
        thick = radius * 0.35
        in_r = radius - thick
        if not rounded:
            bowl_d = f"M {CENTER - radius:.1f} {rim_y:.1f} A {radius:.1f} {radius:.1f} 0 0 0 {CENTER + radius:.1f} {rim_y:.1f} L {CENTER + in_r:.1f} {rim_y:.1f} A {in_r:.1f} {in_r:.1f} 0 0 1 {CENTER - in_r:.1f} {rim_y:.1f} Z"
        else:
            er = thick / 2.0
            bowl_d = (
                f"M {CENTER - radius:.1f} {rim_y:.1f} "
                f"A {radius:.1f} {radius:.1f} 0 0 0 {CENTER + radius:.1f} {rim_y:.1f} "
                f"A {er:.1f} {er:.1f} 0 0 0 {CENTER + in_r:.1f} {rim_y:.1f} "
                f"A {in_r:.1f} {in_r:.1f} 0 0 1 {CENTER - in_r:.1f} {rim_y:.1f} "
                f"A {er:.1f} {er:.1f} 0 0 0 {CENTER - radius:.1f} {rim_y:.1f} Z"
            )
        b.path(bowl_d, fill="currentColor")

    # Crown crest above bowl rim
    crown_y = rim_y - 40.0
    span = radius * 1.55
    step_x = span / (count - 1) if count > 1 else 0
    start_x = CENTER - span / 2.0
    
    if crown_style == "dots":
        dot_r = min(22.0, (step_x * 0.38) if count > 1 else 22.0)
        for i in range(count):
            dx = start_x + i * step_x
            b.circle(dx, crown_y, dot_r, fill="currentColor")
    else:  # teeth
        bar_w = step_x * 0.45 if count > 1 else 24.0
        bar_h = 55.0
        bar_top = rim_y - bar_h - 10.0
        for i in range(count):
            dx = start_x + i * step_x - bar_w / 2.0
            if rounded:
                br = min(8.0, bar_w / 2.0)
                b.path(
                    f"M {dx + br:.1f} {bar_top:.1f} "
                    f"L {dx + bar_w - br:.1f} {bar_top:.1f} "
                    f"A {br:.1f} {br:.1f} 0 0 1 {dx + bar_w:.1f} {bar_top + br:.1f} "
                    f"L {dx + bar_w:.1f} {rim_y - 6:.1f} "
                    f"L {dx:.1f} {rim_y - 6:.1f} "
                    f"L {dx:.1f} {bar_top + br:.1f} "
                    f"A {br:.1f} {br:.1f} 0 0 1 {dx + br:.1f} {bar_top:.1f} Z",
                    fill="currentColor"
                )
            else:
                b.rect(dx, bar_top, bar_w, bar_h, fill="currentColor")

    return b

def generate_bauhaus_pipe_ribbon(tracks: int = 4, stroke_w: float = 14.0, topology: str = "elbow", rounded: bool = True) -> SVGBuilder:
    """Bauhaus multi-track parallel curved ribbon pipes with sharp or rounded geometry."""
    b = SVGBuilder()
    cap = "round" if rounded else "square"
    join = "round" if rounded else "miter"
    pitch = stroke_w * 2.1
    y_bot = 445.0
    
    if topology == "elbow":
        cx = 210.0
        cy = 210.0
        base_r = 55.0
        x_right = 445.0
        for i in range(tracks):
            r_i = base_r + i * pitch
            x_i = cx - r_i
            y_i = cy - r_i
            if rounded:
                d = f"M {x_i:.1f} {y_bot:.1f} L {x_i:.1f} {cy:.1f} A {r_i:.1f} {r_i:.1f} 0 0 1 {cx:.1f} {y_i:.1f} L {x_right:.1f} {y_i:.1f}"
            else:
                d = f"M {x_i:.1f} {y_bot:.1f} L {x_i:.1f} {y_i:.1f} L {x_right:.1f} {y_i:.1f}"
            b.path(d, fill="none", stroke="currentColor", stroke_width=stroke_w, stroke_linecap=cap, stroke_linejoin=join, stroke_miterlimit=10.0)

    elif topology == "loop_eye":
        cy = 240.0
        base_r = 60.0
        r_eye = base_r * 0.42
        for i in range(tracks):
            r_i = base_r + i * pitch
            xl = CENTER - r_i
            xr = CENTER + r_i
            yt = cy - r_i
            if rounded:
                d = f"M {xl:.1f} {y_bot:.1f} L {xl:.1f} {cy:.1f} A {r_i:.1f} {r_i:.1f} 0 0 1 {xr:.1f} {cy:.1f} L {xr:.1f} {y_bot:.1f}"
            else:
                d = f"M {xl:.1f} {y_bot:.1f} L {xl:.1f} {yt:.1f} L {xr:.1f} {yt:.1f} L {xr:.1f} {y_bot:.1f}"
            b.path(d, fill="none", stroke="currentColor", stroke_width=stroke_w, stroke_linecap=cap, stroke_linejoin=join, stroke_miterlimit=10.0)
        
        if rounded:
            b.circle(CENTER, cy, r_eye, fill="currentColor")
        else:
            b.rect(CENTER - r_eye, cy - r_eye, r_eye * 2, r_eye * 2, fill="currentColor")

    elif topology == "serpentine":
        y_top = 67.0
        step_x = 130.0
        for i in range(tracks):
            offset = (i - (tracks - 1) / 2.0) * pitch
            x1 = CENTER - step_x + offset
            x2 = CENTER + step_x + offset
            y_mid1 = CENTER + 50.0
            y_mid2 = CENTER - 50.0
            if rounded:
                d = f"M {x1:.1f} {y_bot:.1f} L {x1:.1f} {y_mid1:.1f} C {x1:.1f} {CENTER:.1f} {x2:.1f} {CENTER:.1f} {x2:.1f} {y_mid2:.1f} L {x2:.1f} {y_top:.1f}"
            else:
                d = f"M {x1:.1f} {y_bot:.1f} L {x1:.1f} {CENTER:.1f} L {x2:.1f} {CENTER:.1f} L {x2:.1f} {y_top:.1f}"
            b.path(d, fill="none", stroke="currentColor", stroke_width=stroke_w, stroke_linecap=cap, stroke_linejoin=join, stroke_miterlimit=10.0)

    return b

def generate_all_bauhaus_swiss(out_dir: str) -> List[dict]:
    """Generates distinct Bauhaus & Swiss modernist vector primitives with sharp and rounded variants."""
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

    # 2. Modernist Stadium Pills (Round, Sharp, Semi-round, Chamfer)
    lengths = [260, 340, 420]
    widths_pill = [80, 140, 200]
    for l_val in lengths:
        for w_val in widths_pill:
            if w_val >= l_val:
                continue
            for style in ["round", "sharp", "semi", "chamfer"]:
                suffix = "" if style == "round" else f"_{style}"
                name = f"bauhaus_pill_l{l_val}_w{w_val}{suffix}"
                builder = generate_pill_shape(l_val, w_val, style=style)
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Modernist Stadium Pill", category="04_bauhaus_swiss",
                             tags=["bauhaus", "pill", "capsule", "stadium", style, "geometric"])
                manifest.append({
                    "id": f"bauhaus_{shape_idx:04d}",
                    "name": name,
                    "category": "04_bauhaus_swiss",
                    "category_label": "Bauhaus & Swiss Style",
                    "tags": ["bauhaus", "pill", "capsule", "stadium", style],
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

    # 5. Concentric Semicircles (Round & Sharp Flat Linecaps)
    for rings in [3, 4, 5, 6, 8]:
        for rad in [180, 225]:
            # Round linecap (original name preserved)
            name = f"bauhaus_concentric_semi_r{rings}_rad{rad}"
            builder = generate_concentric_semicircles(rad, rings, rounded=True)
            filepath = os.path.join(out_dir, f"{name}.svg")
            builder.save(filepath, title="Concentric Modernist Semicircles", category="04_bauhaus_swiss",
                         tags=["bauhaus", "concentric", "semicircle", "rainbow", "arcs", "rounded"])
            manifest.append({
                "id": f"bauhaus_{shape_idx:04d}",
                "name": name,
                "category": "04_bauhaus_swiss",
                "category_label": "Bauhaus & Swiss Style",
                "tags": ["bauhaus", "concentric", "semicircle", "arcs", "rounded"],
                "file": f"assets/svg/04_bauhaus_swiss/{name}.svg"
            })
            shape_idx += 1

            # Sharp square linecap
            name_sharp = f"bauhaus_concentric_semi_r{rings}_rad{rad}_sharp"
            builder = generate_concentric_semicircles(rad, rings, rounded=False)
            filepath = os.path.join(out_dir, f"{name_sharp}.svg")
            builder.save(filepath, title="Concentric Modernist Semicircles", category="04_bauhaus_swiss",
                         tags=["bauhaus", "concentric", "semicircle", "rainbow", "arcs", "sharp"])
            manifest.append({
                "id": f"bauhaus_{shape_idx:04d}",
                "name": name_sharp,
                "category": "04_bauhaus_swiss",
                "category_label": "Bauhaus & Swiss Style",
                "tags": ["bauhaus", "concentric", "semicircle", "arcs", "sharp"],
                "file": f"assets/svg/04_bauhaus_swiss/{name_sharp}.svg"
            })
            shape_idx += 1

    # 6. Bauhaus Striped Geometric Blocks
    for bars in [3, 4, 5, 6, 8, 10, 12, 16]:
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

    # 7. Modernist Triangles & Delta Prisms (Sharp Pointed & Smooth Rounded Vertices)
    for levels in [2, 3, 4, 5, 6]:
        for sz in [320, 380]:
            for stroke_w in [8, 16, 24]:
                for is_round in [False, True]:
                    style_tag = "rounded" if is_round else "sharp"
                    name = f"bauhaus_triangle_l{levels}_sz{sz}_w{stroke_w}_{style_tag}"
                    builder = generate_bauhaus_triangle(levels, sz, stroke_w, rounded=is_round)
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Modernist Delta Triangle Prism", category="04_bauhaus_swiss",
                                 tags=["bauhaus", "triangle", "delta", "prism", "modernist", style_tag])
                    manifest.append({
                        "id": f"bauhaus_{shape_idx:04d}",
                        "name": name,
                        "category": "04_bauhaus_swiss",
                        "category_label": "Bauhaus & Swiss Style",
                        "tags": ["bauhaus", "triangle", "delta", "prism", style_tag],
                        "file": f"assets/svg/04_bauhaus_swiss/{name}.svg"
                    })
                    shape_idx += 1

    # 8. Modernist Split Discs & Semicircle Offsets (Sharp 90° vs Rounded Fillet Corners)
    for rad in [150, 175, 195]:
        for offset in [16, 30, 44, 58]:
            for style in ["solid", "ring"]:
                is_r = (style == "ring")
                for is_round in [False, True]:
                    corner_tag = "rounded" if is_round else "sharp"
                    name = f"bauhaus_split_disc_r{rad}_o{offset}_{style}_{corner_tag}"
                    builder = generate_split_disc(rad, offset, is_ring=is_r, rounded=is_round)
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Modernist Split Disc", category="04_bauhaus_swiss",
                                 tags=["bauhaus", "split", "disc", "semicircle", "offset", corner_tag, "minimal"])
                    manifest.append({
                        "id": f"bauhaus_{shape_idx:04d}",
                        "name": name,
                        "category": "04_bauhaus_swiss",
                        "category_label": "Bauhaus & Swiss Style",
                        "tags": ["bauhaus", "split", "disc", "semicircle", corner_tag],
                        "file": f"assets/svg/04_bauhaus_swiss/{name}.svg"
                    })
                    shape_idx += 1

    # 9. Bauhaus Quarter-Circle Corner Fans (Sharp Square vs Rounded Caps)
    for rings in [3, 4, 5, 6, 7, 8]:
        for rad in [280, 330, 380]:
            for is_round in [False, True]:
                style_tag = "rounded" if is_round else "sharp"
                name = f"bauhaus_corner_fan_r{rings}_rad{rad}_{style_tag}"
                builder = generate_corner_fan(rings, rad, rounded=is_round)
                filepath = os.path.join(out_dir, f"{name}.svg")
                builder.save(filepath, title="Bauhaus Quarter-Circle Corner Fan", category="04_bauhaus_swiss",
                             tags=["bauhaus", "fan", "corner", "arc", "quarter-circle", style_tag, "poster"])
                manifest.append({
                    "id": f"bauhaus_{shape_idx:04d}",
                    "name": name,
                    "category": "04_bauhaus_swiss",
                    "category_label": "Bauhaus & Swiss Style",
                    "tags": ["bauhaus", "fan", "corner", "arc", style_tag],
                    "file": f"assets/svg/04_bauhaus_swiss/{name}.svg"
                })
                shape_idx += 1

    # 10. Bauhaus Geometric Botanical Stems (24 shapes)
    for pairs in [2, 3]:
        for l_style in ["pointed", "rounded", "semicircle"]:
            for h_style in ["circle", "leaf"]:
                for span in [140, 175]:
                    name = f"bauhaus_botanical_p{pairs}_{l_style}_{h_style}_s{span}"
                    builder = generate_bauhaus_botanical(leaf_pairs=pairs, leaf_style=l_style, head_style=h_style, leaf_span=span)
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Bauhaus Geometric Botanical", category="04_bauhaus_swiss",
                                 tags=["bauhaus", "botanical", "stem", "leaves", l_style, h_style, "flora"])
                    manifest.append({
                        "id": f"bauhaus_{shape_idx:04d}",
                        "name": name,
                        "category": "04_bauhaus_swiss",
                        "category_label": "Bauhaus & Swiss Style",
                        "tags": ["bauhaus", "botanical", "stem", "leaves", l_style, h_style],
                        "file": f"assets/svg/04_bauhaus_swiss/{name}.svg"
                    })
                    shape_idx += 1

    # 11. Bauhaus Quad Star Flowers & Astroids (24 shapes)
    for f_style in ["pointed", "rounded", "astroid"]:
        for sz in [340, 420]:
            for hole in [0, 40]:
                for full in [0.75, 1.0]:
                    full_tag = "full" if full == 1.0 else "slim"
                    hole_tag = f"_h{hole}" if hole > 0 else ""
                    name = f"bauhaus_quad_flower_{f_style}_sz{sz}{hole_tag}_{full_tag}"
                    builder = generate_bauhaus_quad_flower(size=sz, style=f_style, center_hole=hole, fullness=full)
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Bauhaus Quad Star Flower", category="04_bauhaus_swiss",
                                 tags=["bauhaus", "flower", "quad", "astroid", f_style, full_tag, "star"])
                    manifest.append({
                        "id": f"bauhaus_{shape_idx:04d}",
                        "name": name,
                        "category": "04_bauhaus_swiss",
                        "category_label": "Bauhaus & Swiss Style",
                        "tags": ["bauhaus", "flower", "quad", "astroid", f_style],
                        "file": f"assets/svg/04_bauhaus_swiss/{name}.svg"
                    })
                    shape_idx += 1

    # 12. Bauhaus Semicircle Crest Bowls (24 shapes)
    for b_style in ["solid", "hollow"]:
        for c_style in ["dots", "teeth"]:
            for cnt in [3, 5, 7]:
                for is_round in [False, True]:
                    rnd_tag = "rounded" if is_round else "sharp"
                    name = f"bauhaus_crest_bowl_{b_style}_{c_style}_c{cnt}_{rnd_tag}"
                    builder = generate_bauhaus_crest_bowl(radius=160, bowl_style=b_style, crown_style=c_style, count=cnt, rounded=is_round)
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Bauhaus Semicircle Crest Bowl", category="04_bauhaus_swiss",
                                 tags=["bauhaus", "bowl", "semicircle", "crest", c_style, rnd_tag])
                    manifest.append({
                        "id": f"bauhaus_{shape_idx:04d}",
                        "name": name,
                        "category": "04_bauhaus_swiss",
                        "category_label": "Bauhaus & Swiss Style",
                        "tags": ["bauhaus", "bowl", "semicircle", "crest", c_style, rnd_tag],
                        "file": f"assets/svg/04_bauhaus_swiss/{name}.svg"
                    })
                    shape_idx += 1

    # 13. Bauhaus Multi-Track Parallel Pipe Ribbons (36 shapes)
    for topo in ["elbow", "loop_eye", "serpentine"]:
        for trk in [3, 4, 5]:
            for is_round in [False, True]:
                for sw in [12, 16]:
                    rnd_tag = "rounded" if is_round else "sharp"
                    name = f"bauhaus_pipe_ribbon_{topo}_t{trk}_w{sw}_{rnd_tag}"
                    builder = generate_bauhaus_pipe_ribbon(tracks=trk, stroke_w=sw, topology=topo, rounded=is_round)
                    filepath = os.path.join(out_dir, f"{name}.svg")
                    builder.save(filepath, title="Bauhaus Parallel Pipe Ribbon", category="04_bauhaus_swiss",
                                 tags=["bauhaus", "pipe", "ribbon", "tracks", topo, rnd_tag, "streamline"])
                    manifest.append({
                        "id": f"bauhaus_{shape_idx:04d}",
                        "name": name,
                        "category": "04_bauhaus_swiss",
                        "category_label": "Bauhaus & Swiss Style",
                        "tags": ["bauhaus", "pipe", "ribbon", topo, rnd_tag],
                        "file": f"assets/svg/04_bauhaus_swiss/{name}.svg"
                    })
                    shape_idx += 1

    return manifest
