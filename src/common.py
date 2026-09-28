"""
Common SVG and Vector Geometry Utilities for Asset Creation.
Provides clean SVG formatting, path creation, polar coordinate transforms,
and geometric algorithms.
"""

import math
import os
from typing import List, Tuple, Optional, Union

CANVAS_SIZE = 512
CENTER = 256.0

def polar_to_cartesian(cx: float, cy: float, radius: float, angle_rad: float) -> Tuple[float, float]:
    """Convert polar coordinates (angle in radians) to cartesian (x, y)."""
    x = cx + radius * math.cos(angle_rad)
    y = cy + radius * math.sin(angle_rad)
    return round(x, 2), round(y, 2)

def deg_to_rad(degrees: float) -> float:
    return degrees * math.pi / 180.0

def format_num(n: float) -> str:
    """Format floating point numbers cleanly for SVG."""
    if abs(n - round(n)) < 1e-4:
        return str(int(round(n)))
    return f"{n:.2f}".rstrip('0').rstrip('.')

class SVGBuilder:
    def __init__(self, width: int = CANVAS_SIZE, height: int = CANVAS_SIZE):
        self.width = width
        self.height = height
        self.paths: List[str] = []
        self.elements: List[str] = []

    def path(self, d: str, fill: str = "currentColor", stroke: str = "none", 
             stroke_width: float = 0, stroke_linecap: str = "round", 
             stroke_linejoin: str = "round", stroke_miterlimit: float = 10.0, fill_rule: str = "evenodd", opacity: float = 1.0) -> "SVGBuilder":
        attrs = [f'd="{d}"']
        if fill != "none":
            attrs.append(f'fill="{fill}"')
        else:
            attrs.append('fill="none"')
        if stroke != "none" and stroke_width > 0:
            attrs.append(f'stroke="{stroke}"')
            attrs.append(f'stroke-width="{format_num(stroke_width)}"')
            attrs.append(f'stroke-linecap="{stroke_linecap}"')
            attrs.append(f'stroke-linejoin="{stroke_linejoin}"')
            if stroke_linejoin == "miter":
                attrs.append(f'stroke-miterlimit="{format_num(stroke_miterlimit)}"')
        if fill_rule != "nonzero":
            attrs.append(f'fill-rule="{fill_rule}"')
        if opacity < 1.0:
            attrs.append(f'opacity="{format_num(opacity)}"')
        self.elements.append(f'  <path {" ".join(attrs)} />')
        return self

    def circle(self, cx: float, cy: float, r: float, fill: str = "currentColor", 
               stroke: str = "none", stroke_width: float = 0, opacity: float = 1.0) -> "SVGBuilder":
        attrs = [
            f'cx="{format_num(cx)}"',
            f'cy="{format_num(cy)}"',
            f'r="{format_num(r)}"',
            f'fill="{fill}"'
        ]
        if stroke != "none" and stroke_width > 0:
            attrs.append(f'stroke="{stroke}"')
            attrs.append(f'stroke-width="{format_num(stroke_width)}"')
        if opacity < 1.0:
            attrs.append(f'opacity="{format_num(opacity)}"')
        self.elements.append(f'  <circle {" ".join(attrs)} />')
        return self

    def rect(self, x: float, y: float, w: float, h: float, rx: float = 0, ry: float = 0,
             fill: str = "currentColor", stroke: str = "none", stroke_width: float = 0, opacity: float = 1.0) -> "SVGBuilder":
        attrs = [
            f'x="{format_num(x)}"',
            f'y="{format_num(y)}"',
            f'width="{format_num(w)}"',
            f'height="{format_num(h)}"',
            f'fill="{fill}"'
        ]
        if rx > 0:
            attrs.append(f'rx="{format_num(rx)}"')
        if ry > 0:
            attrs.append(f'ry="{format_num(ry)}"')
        if stroke != "none" and stroke_width > 0:
            attrs.append(f'stroke="{stroke}"')
            attrs.append(f'stroke-width="{format_num(stroke_width)}"')
        if opacity < 1.0:
            attrs.append(f'opacity="{format_num(opacity)}"')
        self.elements.append(f'  <rect {" ".join(attrs)} />')
        return self

    def add_raw(self, xml_element: str) -> "SVGBuilder":
        self.elements.append(f"  {xml_element}")
        return self

    def to_svg(self, title: str = "", category: str = "", tags: Optional[List[str]] = None) -> str:
        tags_str = ",".join(tags) if tags else ""
        lines = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.width} {self.height}" '
            f'width="{self.width}" height="{self.height}" fill="none" data-title="{title}" '
            f'data-category="{category}" data-tags="{tags_str}">'
        ]
        if title:
            lines.append(f'  <title>{title}</title>')
        lines.extend(self.elements)
        lines.append('</svg>')
        return "\n".join(lines)

    def save(self, filepath: str, title: str = "", category: str = "", tags: Optional[List[str]] = None):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        content = self.to_svg(title=title, category=category, tags=tags)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

def make_poly_path(points: List[Tuple[float, float]], close: bool = True) -> str:
    """Construct an SVG path string from a series of (x, y) coordinates."""
    if not points:
        return ""
    cmds = [f"M {format_num(points[0][0])} {format_num(points[0][1])}"]
    for p in points[1:]:
        cmds.append(f"L {format_num(p[0])} {format_num(p[1])}")
    if close:
        cmds.append("Z")
    return " ".join(cmds)

def smooth_cardinal_spline(points: List[Tuple[float, float]], tension: float = 0.5, closed: bool = True) -> str:
    """Generate a smooth cubic bezier SVG path through points using Catmull-Rom / Cardinal spline."""
    n = len(points)
    if n < 3:
        return make_poly_path(points, close=closed)

    pts = points[:]
    if closed:
        pts = [points[-1]] + pts + [points[0], points[1]]
    else:
        pts = [points[0]] + pts + [points[-1]]

    d = [f"M {format_num(points[0][0])} {format_num(points[0][1])}"]
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
        cp1x = p1[0] + (p2[0] - p0[0]) / 6 * (1 - tension) * 2
        cp1y = p1[1] + (p2[1] - p0[1]) / 6 * (1 - tension) * 2
        cp2x = p2[0] - (p3[0] - p1[0]) / 6 * (1 - tension) * 2
        cp2y = p2[1] - (p3[1] - p1[1]) / 6 * (1 - tension) * 2
        d.append(f"C {format_num(cp1x)} {format_num(cp1y)} {format_num(cp2x)} {format_num(cp2y)} {format_num(p2[0])} {format_num(p2[1])}")
    if closed:
        d.append("Z")
    return " ".join(d)
