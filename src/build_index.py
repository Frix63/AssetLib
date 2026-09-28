"""
Builds manifest.json and manifest.js with Master Shape Collections (Groups),
allowing users to browse high-level collections and drill down into dedicated
collection pages with all styles and variants.
"""

import os
import json
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SVG_DIR = os.path.join(BASE_DIR, "assets", "svg")
PNG_DIR = os.path.join(BASE_DIR, "assets", "png")

CATEGORY_NAMES = {
    "01_y2k_cyber_stars": "Y2K & Cyber Stars",
    "02_neo_brutalist_hud": "Neo-Brutalist HUD",
    "03_acid_cyber_sigils": "Acid & Cyber Sigils",
    "04_bauhaus_swiss": "Bauhaus & Swiss Style",
    "05_organic_botanical": "Organic & Botanical",
    "06_retro_groovy_70s": "Retro Groovy 70s",
    "07_memphis_80s_90s": "Memphis 80s/90s Pop",
    "08_badges_seals_labels": "Badges, Seals & Labels",
    "09_arrows_pointers_accents": "Arrows, Pointers & Accents",
    "10_sacred_guilloche_geo": "Sacred Geometry & Guilloche",
    "11_halftones_optical_grids": "Halftones & Matrix Grids",
    "12_abstract_distortions": "Abstract Distortions"
}

# 60 High-level master collections grouping all styles cleanly
COLLECTION_DEFINITIONS = [
    # Y2K & Cyber Stars
    ('cutout_stars', r'^y2k_cutout_star', 'Negative Space Cutout Stars', '01_y2k_cyber_stars',
     'Stars with circular and geometric negative space central cutouts.', ['star', 'cutout', 'donut', 'hole', 'y2k', 'cyber']),
    ('pinch_stars', r'^y2k_pinch_star', 'Y2K Cyber Pinch Stars', '01_y2k_cyber_stars',
     'Curved pinch astroid cyber stars with inward curving flare edges.', ['star', 'pinch', 'astroid', 'sparkle', 'flare', 'y2k']),
    ('sharp_stars', r'^y2k_sharp_star', 'Sharp Geometric Stars', '01_y2k_cyber_stars',
     'Crisp straight-edged star polygons with varying point counts and inner ratios.', ['star', 'sharp', 'polygon', 'geometric', 'point']),
    ('faceted_stars', r'^y2k_faceted_chrome_star', 'Faceted Chrome 3D Stars', '01_y2k_cyber_stars',
     '3D metallic chrome stars with alternating shaded facets meeting at center.', ['star', 'chrome', '3d', 'faceted', 'metallic']),
    ('compass_stars', r'^y2k_compass_star', 'Compass Cyber Stars', '01_y2k_cyber_stars',
     '8-point directional compass stars with primary and secondary arms.', ['star', 'compass', 'navigation', 'sparkle', '8-point']),
    ('lens_sparkles', r'^y2k_lens_sparkle', 'Anamorphic Lens Flare Sparkles', '01_y2k_cyber_stars',
     'Asymmetrical anamorphic flares and horizontal sparkle crosses.', ['sparkle', 'lens', 'flare', 'anamorphic', 'star']),
    ('outline_stars', r'^y2k_outline_star', 'Hollow Outline Cyber Stars', '01_y2k_cyber_stars',
     'Contoured stroke wireframe cyber stars.', ['star', 'outline', 'stroke', 'hollow', 'cyber']),
    ('nested_stars', r'^y2k_nested_star', 'Nested Concentric Stars', '01_y2k_cyber_stars',
     'Multi-tiered concentric outline cyber stars.', ['star', 'nested', 'concentric', 'rings', 'cyber']),

    # Neo-Brutalist HUD
    ('crosshairs', r'^hud_crosshair', 'HUD Targeting Reticles & Crosshairs', '02_neo_brutalist_hud',
     'Precision crosshairs, mil-dot sniper sights, and concentric targeting reticles.', ['crosshair', 'reticle', 'cross', 'target', 'aim', 'hud']),
    ('viewfinders', r'^hud_viewfinder', 'Viewfinder & Camera Corner Frames', '02_neo_brutalist_hud',
     'Focus brackets, camera viewfinders, and chamfered border frames.', ['viewfinder', 'frame', 'brackets', 'camera', 'hud', 'corners']),
    ('wireframe_globes', r'^hud_wireframe_globe', 'Wireframe 3D Projection Globes', '02_neo_brutalist_hud',
     '3D isometric latitude and longitude globe wireframes.', ['globe', 'sphere', 'wireframe', '3d', 'grid', 'world', 'earth']),
    ('swiss_pluses', r'^hud_swiss_plus', 'Brutalist Swiss Crosses & Pluses', '02_neo_brutalist_hud',
     'Heavy brutalist pluses, Swiss medical crosses, and plus clusters.', ['cross', 'plus', 'swiss', 'brutalist', 'medic', 'hud']),
    ('radar_dials', r'^hud_radar_dial', 'Segmented Radar Dials & Gauges', '02_neo_brutalist_hud',
     'Circular segmented arc gauges and sci-fi telemetry dials.', ['radar', 'dial', 'gauge', 'hud', 'circle', 'speedometer']),
    ('barcode_badges', r'^hud_barcode_badge', 'Tech Barcode & Data Badges', '02_neo_brutalist_hud',
     'Industrial barcode stripes and cyber data identifier frames.', ['barcode', 'badge', 'tech', 'data', 'label', 'hud']),

    # Acid & Cyber Sigils
    ('sigil_crests', r'^acid_sigil_crest', 'Gothic Cyber Sigils & Crests', '03_acid_cyber_sigils',
     'Bilateral symmetrical cyber-sigilism emblems and gothic thorn wings.', ['sigil', 'crest', 'gothic', 'tribal', 'acid', 'wings', 'thorn']),
    ('liquid_talons', r'^acid_liquid_chrome', 'Liquid Chrome Spikes & Molten Talons', '03_acid_cyber_sigils',
     'Molten chrome liquid droplets, twisted spikes, and fluid talons.', ['chrome', 'liquid', 'talon', 'claw', 'spike', 'molten', 'acid']),
    ('spiral_vortexes', r'^acid_vortex', 'Hyperspace Spiral Vortexes', '03_acid_cyber_sigils',
     'Multi-arm logarithmic spiral warps and black hole vortexes.', ['vortex', 'spiral', 'warp', 'hyperspace', 'blackhole', 'twirl']),
    ('neo_tribal_barbs', r'^acid_neo_tribal', 'Neo-Tribal Razor Barbs', '03_acid_cyber_sigils',
     'Barbed razor blades and neo-tribal cross emblems.', ['tribal', 'barb', 'blade', 'razor', 'acid', 'cyber']),

    # Bauhaus & Swiss Style
    ('cathedral_arches', r'^bauhaus_arch', 'Modernist Cathedral & Tunnel Arches', '04_bauhaus_swiss',
     'Solid and cutout portal arches with modernist proportions.', ['arch', 'cathedral', 'portal', 'tunnel', 'bauhaus', 'architecture']),
    ('stadium_pills', r'^bauhaus_pill', 'Modernist Stadium & Pill Capsules', '04_bauhaus_swiss',
     'Rounded stadium capsules in horizontal, vertical, and angled orientations.', ['pill', 'capsule', 'stadium', 'bauhaus', 'geometric']),
    ('stepped_pyramids', r'^bauhaus_stepped_pyr', 'Stepped Ziggurats & Pyramids', '04_bauhaus_swiss',
     'Multi-level geometric stepped pyramids and inverse ziggurats.', ['pyramid', 'ziggurat', 'stepped', 'stairs', 'bauhaus']),
    ('quadrant_grids', r'^bauhaus_quadrant_grid', 'Modular Bauhaus Quadrant Grids', '04_bauhaus_swiss',
     'Modular compositions combining quarter-circles, diagonal slices, and blocks.', ['grid', 'modular', 'quadrant', 'bauhaus', 'composition']),
    ('concentric_semicircles', r'^bauhaus_concentric_semi', 'Concentric Modernist Semicircles', '04_bauhaus_swiss',
     'Nested concentric semicircle arcs in 4 orientations.', ['semicircle', 'rainbow', 'concentric', 'arcs', 'bauhaus']),
    ('diagonal_stripes', r'^bauhaus_stripes', 'Bauhaus Diagonal Striped Blocks', '04_bauhaus_swiss',
     'Geometric diagonal hazard and composition stripe blocks.', ['stripes', 'bars', 'block', 'lines', 'hazard', 'bauhaus']),

    # Organic & Botanical
    ('organic_blobs', r'^organic_blob', 'Organic Fluid Blobs & River Pebbles', '05_organic_botanical',
     'Smooth Fourier harmonic amoebas and natural river stone silhouettes.', ['blob', 'amoeba', 'pebble', 'stone', 'fluid', 'organic', 'smooth']),
    ('botanical_leaves', r'^botanical_leaf', 'Matisse Botanical Leaf Cutouts', '05_organic_botanical',
     'Stylized multi-lobed foliage and Matisse-inspired organic leaves.', ['leaf', 'botanical', 'matisse', 'plant', 'foliage', 'flora', 'cutout']),
    ('ginkgo_leaves', r'^botanical_ginkgo', 'Ginkgo Biloba Fan Leaves', '05_organic_botanical',
     'Notched ginkgo biloba fan fronds with natural stem lines.', ['ginkgo', 'leaf', 'fan', 'botanical', 'plant', 'nature']),
    ('wavy_ribbons', r'^organic_ribbon', 'Fluid Organic Ribbons & Streamers', '05_organic_botanical',
     'Wavy sinusoidal fluid ribbons in horizontal and vertical flows.', ['ribbon', 'wave', 'streamer', 'fluid', 'organic', 'strip']),

    # Retro Groovy 70s
    ('groovy_daisies', r'^retro_daisy', 'Retro Groovy Daisy Flowers', '06_retro_groovy_70s',
     'Iconic 70s cartoon flower daisies with rounded petals and central discs.', ['flower', 'daisy', 'petal', 'retro', 'groovy', '70s', 'sunflower']),
    ('starburst_badges', r'^retro_starburst', 'Retro Starburst Sale Badges', '06_retro_groovy_70s',
     'Scalloped and pointed starburst explosion discount stickers (12 to 32 points).', ['starburst', 'badge', 'sale', 'sticker', 'discount', 'retro', 'burst']),
    ('motel_lozenges', r'^retro_motel', 'Roadside Motel Sign Lozenges', '06_retro_groovy_70s',
     'Vintage diamond lozenges and double-bordered retro roadside signs.', ['motel', 'lozenge', 'badge', 'diamond', 'retro', 'vintage']),
    ('melting_badges', r'^retro_melting', 'Melting Psychedelic Badges', '06_retro_groovy_70s',
     'Liquid melting circle badges with gravity sag distortion.', ['melting', 'psychedelic', 'liquid', 'wavy', 'badge', 'retro']),
    ('rainbow_arches', r'^retro_rainbow', 'Retro 70s Concentric Rainbow Arches', '06_retro_groovy_70s',
     'Multi-band groovy rainbow arches.', ['rainbow', 'arch', 'retro', '70s', 'groovy', 'stripes']),

    # Memphis 80s/90s Pop
    ('zigzag_shockwaves', r'^memphis_zigzag', 'Memphis Zigzag Shockwaves', '07_memphis_80s_90s',
     '80s pop geometric jagged shockwave stripes.', ['zigzag', 'shockwave', 'jagged', 'memphis', '80s', '90s']),
    ('squiggle_noodles', r'^memphis_noodle', 'Memphis Squiggle Noodles', '07_memphis_80s_90s',
     'Playful 90s squiggle snakes and wavy vector noodles.', ['squiggle', 'noodle', 'wave', 'snake', 'memphis', '80s']),
    ('isometric_cubes', r'^memphis_isocube', 'Isometric 3D Memphis Cubes', '07_memphis_80s_90s',
     'Isometric 3-facet shaded geometric pop cubes.', ['cube', 'isometric', '3d', 'memphis', 'box', 'geometric']),
    ('confetti_clusters', r'^memphis_confetti', 'Floating Geometric Confetti Clusters', '07_memphis_80s_90s',
     'Scatter bursts of geometric confetti shapes.', ['confetti', 'scatter', 'burst', 'pop', 'memphis', 'party']),

    # Badges, Seals & Labels
    ('scalloped_seals', r'^seal_scallop', 'Scalloped Certificate Seals', '08_badges_seals_labels',
     'Circular certificate flower seals with 8 to 48 flutes.', ['seal', 'scallop', 'certificate', 'stamp', 'badge', 'rosette']),
    ('postage_stamps', r'^postage_stamp', 'Perforated Postage Stamps', '08_badges_seals_labels',
     'Perforated postal stamps with edge teeth in various aspect ratios.', ['stamp', 'postage', 'perforated', 'mail', 'letter', 'vintage', 'badge']),
    ('rosette_ribbons', r'^rosette_ribbon', 'Award Rosette Ribbons', '08_badges_seals_labels',
     'Award rosettes with pleated heads and dual notched ribbon tails.', ['rosette', 'ribbon', 'award', 'medal', 'winner', 'badge']),
    ('ticket_stubs', r'^ticket_stub', 'Admission Ticket Stubs & Coupons', '08_badges_seals_labels',
     'Admit-one coupon tickets with circular cutout notches.', ['ticket', 'stub', 'coupon', 'admission', 'pass', 'voucher']),

    # Arrows, Pointers & Accents
    ('brutalist_arrows', r'^arrow_brutalist', 'Chunky Brutalist Arrows', '09_arrows_pointers_accents',
     'Heavy editorial navigation block arrows with sharp triangular heads.', ['arrow', 'pointer', 'direction', 'navigation', 'brutalist', 'cursor']),
    ('swoosh_arrows', r'^arrow_swoosh', 'Curved Flow & Swoosh Arrows', '09_arrows_pointers_accents',
     'Circular arc directional arrows, loops, and flow indicators.', ['arrow', 'swoosh', 'curve', 'loop', 'cycle', 'flow', 'pointer']),
    ('speech_bubbles', r'^callout_speech', 'Modern Speech & Dialog Bubbles', '09_arrows_pointers_accents',
     'Rounded speech balloons and message callout bubbles.', ['speech', 'bubble', 'callout', 'chat', 'message', 'dialog', 'quote']),
    ('compass_needles', r'^compass_needle', 'Faceted 3D Compass Needles', '09_arrows_pointers_accents',
     'Faceted 3D navigation pointers and compass needles.', ['compass', 'needle', 'pointer', 'navigation', 'faceted', 'north']),

    # Sacred Geometry & Guilloche
    ('rhodonea_roses', r'^rose_rhodonea', 'Mathematical Rhodonea Rose Curves', '10_sacred_guilloche_geo',
     'Harmonic rose curves generated by polar equations r = cos(k theta).', ['rose', 'curve', 'rhodonea', 'guilloche', 'math', 'flower']),
    ('spirographs', r'^spiro_hypotrochoid', 'Hypotrochoid Spirographs', '10_sacred_guilloche_geo',
     'Mathematical guilloche roulettes traced by rolling circles.', ['spirograph', 'guilloche', 'hypotrochoid', 'roulette', 'generative']),
    ('lissajous_curves', r'^lissajous', 'Lissajous Harmonic Curves', '10_sacred_guilloche_geo',
     'Complex harmonic frequency knots and oscilloscope waveforms.', ['lissajous', 'curve', 'knot', 'harmonic', 'math', 'wave']),
    ('sacred_flower', r'^sacred_flower', 'Sacred Flower & Seed of Life', '10_sacred_guilloche_geo',
     'Overlapping circular geometric mandalas and sacred lattices.', ['sacred', 'geometry', 'flower_of_life', 'seed_of_life', 'mandala']),
    ('metatron_cube', r'^sacred_metatron', 'Metatron\'s Cube Sacred Geometry', '10_sacred_guilloche_geo',
     '13-node Metatron\'s cube wireframe projections.', ['metatron', 'cube', 'sacred', 'geometry', 'mandala', 'wireframe']),

    # Halftones & Matrix Grids
    ('radial_halftones', r'^halftone_radial', 'Radial Dot Halftones', '11_halftones_optical_grids',
     'Concentric radial screens with distance-scaled dot gradients.', ['halftone', 'radial', 'dots', 'screen', 'gradient', 'circle']),
    ('linear_halftones', r'^halftone_linear', 'Linear Halftone Screens', '11_halftones_optical_grids',
     'Directional gradient halftone screens in horizontal, vertical, and diagonal.', ['halftone', 'linear', 'screen', 'dots', 'gradient', 'print']),
    ('diamond_halftones', r'^halftone_diamond', 'Diamond Halftone Matrices', '11_halftones_optical_grids',
     'Rhombus/diamond raster dot printing matrices.', ['halftone', 'diamond', 'screen', 'matrix', 'raster']),
    ('dither_waves', r'^halftone_dither', 'Wave-Modulated Dither Matrices', '11_halftones_optical_grids',
     'Pixelated square dither screens with harmonic wave modulation.', ['dither', 'wave', 'matrix', 'halftone', 'pixels', 'grid']),
    ('ring_halftones', r'^halftone_rings', 'Concentric Ring Halftones', '11_halftones_optical_grids',
     'Concentric target rings with gradient stroke thicknesses.', ['rings', 'concentric', 'halftone', 'target', 'radar']),

    # Abstract Distortions
    ('sliced_bars', r'^abstract_sliced', 'Sliced Wave Distortion Bars', '12_abstract_distortions',
     'Parallel slat bars modulated by sinusoidal phase shifts.', ['sliced', 'bars', 'wave', 'slats', 'distortion', 'optical']),
    ('twisted_polygons', r'^abstract_twisted', 'Twisted Polygon Vortex Tunnels', '12_abstract_distortions',
     'Nested 3D polygon vortex tunnels rotating into depth.', ['vortex', 'tunnel', 'polygon', 'twisted', '3d', 'spiral']),
    ('wave_discs', r'^abstract_wave_disc', 'Wave-Warped Ripple Discs', '12_abstract_distortions',
     'Circles deformed by high-frequency harmonic ripples.', ['disc', 'wave', 'ripple', 'distortion', 'circle', 'fluid']),
    ('moire_rings', r'^abstract_moire', 'Moire Interference Rings', '12_abstract_distortions',
     'Overlapping concentric ring sets creating optical moire patterns.', ['moire', 'interference', 'rings', 'optical', 'illusion']),
    ('string_art', r'^abstract_string', 'Parabolic String Art Hyperbolas', '12_abstract_distortions',
     'Geometric string art hyperbolic curve envelopes.', ['string_art', 'parabolic', 'lines', 'hyperbola', 'wireframe'])
]

def find_collection(name):
    for col_id, pat, title, cat, desc, extra_tags in COLLECTION_DEFINITIONS:
        if re.search(pat, name):
            return col_id, title, cat, desc, extra_tags
    # Fallback
    fallback_id = re.sub(r'_\d+.*$', '', name)
    return fallback_id, fallback_id.replace('_', ' ').title(), 'other', 'Shape collection', []

DATA_DIR = os.path.join(BASE_DIR, "assets", "data")
CATEGORIES_DATA_DIR = os.path.join(DATA_DIR, "categories")

def build_category_component(cat: str):
    """Builds a single category component data chunk."""
    os.makedirs(CATEGORIES_DATA_DIR, exist_ok=True)
    cat_path = os.path.join(SVG_DIR, cat)
    if not os.path.isdir(cat_path):
        return None

    files = sorted(os.listdir(cat_path))
    cat_title = CATEGORY_NAMES.get(cat, cat)
    assets = []
    
    # Track collections in this category
    local_collections = {}
    for col_id, pat, title, c_cat, desc, extra_tags in COLLECTION_DEFINITIONS:
        if c_cat == cat:
            local_collections[col_id] = {
                "id": col_id,
                "title": title,
                "category": cat,
                "category_label": cat_title,
                "description": desc,
                "tags": extra_tags,
                "primary_svg": "",
                "primary_file": "",
                "items": []
            }

    for idx, f in enumerate(files, 1):
        if not f.endswith(".svg"):
            continue
        name = f[:-4]
        svg_file_path = os.path.join(cat_path, f)
        with open(svg_file_path, "r", encoding="utf-8") as sf:
            svg_content = sf.read().strip()

        col_id, col_title, _, col_desc, col_tags = find_collection(name)
        parts = name.split("_")
        base_tags = [p for p in parts if not p.isdigit() and len(p) > 1]
        all_tags = list(dict.fromkeys(base_tags + col_tags + [cat_title.lower()]))

        asset_obj = {
            "id": f"{cat[:4]}_{idx:04d}",
            "name": name,
            "category": cat,
            "category_label": cat_title,
            "collection_id": col_id,
            "collection_title": col_title,
            "tags": all_tags,
            "file": f"assets/svg/{cat}/{f}",
            "png": f"assets/png/{cat}/{name}.png",
            "svg": svg_content
        }
        assets.append(asset_obj)

        if col_id in local_collections:
            local_collections[col_id]["items"].append(asset_obj)
            if not local_collections[col_id]["primary_svg"]:
                local_collections[col_id]["primary_svg"] = svg_content
                local_collections[col_id]["primary_file"] = asset_obj["file"]

    # Prune empty local collections
    valid_collections = []
    for col_id, col in local_collections.items():
        if col["items"]:
            col["count"] = len(col["items"])
            valid_collections.append(col)

    chunk_data = {
        "category": cat,
        "title": cat_title,
        "count": len(assets),
        "collections": valid_collections,
        "assets": assets
    }

    # Save component JSON
    comp_json_path = os.path.join(CATEGORIES_DATA_DIR, f"{cat}.json")
    with open(comp_json_path, "w", encoding="utf-8") as f:
        json.dump(chunk_data, f)

    # Save component JS (for offline file:/// access)
    comp_js_path = os.path.join(CATEGORIES_DATA_DIR, f"{cat}.js")
    with open(comp_js_path, "w", encoding="utf-8") as f:
        f.write("window.ASSET_CHUNKS = window.ASSET_CHUNKS || {};\n")
        f.write(f'window.ASSET_CHUNKS["{cat}"] = ')
        json.dump(chunk_data, f)
        f.write(";\n")

    return chunk_data

def build_manifest(target_category: str = None):
    """
    Componentized index builder:
    If target_category is given, re-indexes only that category and merges with cached components.
    Otherwise, builds all components and master indices.
    """
    os.makedirs(CATEGORIES_DATA_DIR, exist_ok=True)
    all_categories = sorted([d for d in os.listdir(SVG_DIR) if os.path.isdir(os.path.join(SVG_DIR, d))])
    
    category_chunks = {}

    for cat in all_categories:
        comp_json_path = os.path.join(CATEGORIES_DATA_DIR, f"{cat}.json")
        if target_category and cat != target_category and os.path.exists(comp_json_path):
            # Load cached component in milliseconds without touching SVG files
            try:
                with open(comp_json_path, "r", encoding="utf-8") as cf:
                    category_chunks[cat] = json.load(cf)
                continue
            except Exception:
                pass
        
        # Build component
        print(f"[*] Building component index: {cat}...")
        chunk = build_category_component(cat)
        if chunk:
            category_chunks[cat] = chunk

    # Assemble summary index (lightweight catalog: ~70 KB instead of 18 MB)
    category_summary = {}
    master_collections = []
    all_assets = []
    
    for col_id, pat, title, cat, desc, extra_tags in COLLECTION_DEFINITIONS:
        chunk = category_chunks.get(cat)
        if not chunk:
            continue
        # Find matching collection in chunk
        matched_col = next((c for c in chunk["collections"] if c["id"] == col_id), None)
        if matched_col and matched_col["items"]:
            # Summary contains collection metadata + primary SVG preview, omitting full item SVGs
            master_collections.append({
                "id": col_id,
                "title": title,
                "category": cat,
                "category_label": chunk["title"],
                "count": matched_col["count"],
                "description": desc,
                "tags": extra_tags,
                "primary_svg": matched_col["primary_svg"],
                "primary_file": matched_col["primary_file"]
            })

    for cat, chunk in category_chunks.items():
        category_summary[cat] = {
            "title": chunk["title"],
            "count": chunk["count"]
        }
        all_assets.extend(chunk["assets"])

    # 1. Save lightweight Master Summary Index (< 100 KB)
    summary_data = {
        "total_shapes": len(all_assets),
        "total_collections": len(master_collections),
        "categories": category_summary,
        "collections": master_collections
    }

    summary_json_path = os.path.join(DATA_DIR, "manifest_summary.json")
    with open(summary_json_path, "w", encoding="utf-8") as f:
        json.dump(summary_data, f)

    summary_js_path = os.path.join(DATA_DIR, "manifest_summary.js")
    with open(summary_js_path, "w", encoding="utf-8") as f:
        f.write("window.MANIFEST_SUMMARY = ")
        json.dump(summary_data, f)
        f.write(";\n")

    # 2. Maintain legacy monolithic manifest for full backward compatibility
    full_collections = []
    for cat, chunk in category_chunks.items():
        full_collections.extend(chunk["collections"])

    full_manifest_data = {
        "total_shapes": len(all_assets),
        "total_collections": len(full_collections),
        "categories": category_summary,
        "collections": full_collections,
        "assets": all_assets
    }

    manifest_path = os.path.join(BASE_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(full_manifest_data, f)

    manifest_js_path = os.path.join(BASE_DIR, "manifest.js")
    with open(manifest_js_path, "w", encoding="utf-8") as f:
        f.write("window.MANIFEST_DATA = ")
        json.dump(full_manifest_data, f)
        f.write(";\n")

    print(f"[+] Componentized index built: {len(all_assets)} shapes in {len(master_collections)} collections.")
    print(f"    - Lightweight Summary: {summary_js_path} ({os.path.getsize(summary_js_path) // 1024} KB)")
    print(f"    - Component Chunks:    {CATEGORIES_DATA_DIR}/ (12 category chunks)")
    print(f"    - Monolithic Manifest: {manifest_js_path}")

if __name__ == "__main__":
    import sys
    target = None
    if len(sys.argv) > 1:
        if sys.argv[1] == "--category" and len(sys.argv) > 2:
            target = sys.argv[2]
        elif not sys.argv[1].startswith("--"):
            target = sys.argv[1]
    build_manifest(target_category=target)
