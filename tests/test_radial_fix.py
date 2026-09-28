import math
import os

def generate_radial_spoke_halftone(rings: int, dots_per_ring: int, max_dot_r: float, invert: bool = False, staggered: bool = False) -> str:
    r_step = 210.0 / rings
    circles = []
    center_r = 1.5 if invert else max_dot_r
    circles.append(f'  <circle cx="256" cy="256" r="{center_r:.2f}" fill="currentColor" />')
    angle_step = (2 * math.pi) / dots_per_ring

    for ring_i in range(1, rings + 1):
        dist = ring_i * r_step
        t = ring_i / rings
        if invert:
            dot_r = max_dot_r * (0.12 + t * 0.88)
        else:
            dot_r = max_dot_r * (1.0 - t * 0.82)
        dot_r = max(1.2, dot_r)
        
        offset = (ring_i % 2) * (angle_step / 2.0) if staggered else 0.0

        for d_i in range(dots_per_ring):
            a = d_i * angle_step + offset
            cx = 256 + dist * math.cos(a)
            cy = 256 + dist * math.sin(a)
            circles.append(f'  <circle cx="{cx:.2f}" cy="{cy:.2f}" r="{dot_r:.2f}" fill="currentColor" />')

    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none" '
        'data-title="Radial Dot Halftone" data-category="11_halftones_optical_grids" data-tags="halftone,radial,dots,screen,optical,matrix">\n'
        f'{chr(10).join(circles)}\n'
        '</svg>'
    )

os.makedirs('tests/preview_radial', exist_ok=True)
with open('tests/preview_radial/spoke_r10_d16_m10_norm.svg', 'w') as f:
    f.write(generate_radial_spoke_halftone(10, 16, 10.0, invert=False, staggered=False))

with open('tests/preview_radial/spoke_r10_d16_m10_inv.svg', 'w') as f:
    f.write(generate_radial_spoke_halftone(10, 16, 10.0, invert=True, staggered=False))

with open('tests/preview_radial/stagger_r10_d16_m10_norm.svg', 'w') as f:
    f.write(generate_radial_spoke_halftone(10, 16, 10.0, invert=False, staggered=True))

with open('tests/preview_radial/stagger_r10_d16_m10_inv.svg', 'w') as f:
    f.write(generate_radial_spoke_halftone(10, 16, 10.0, invert=True, staggered=True))

print("Previews created successfully.")
