"""
Componentized Asset Generator Runner for VectorCraft.
Allows generating individual categories or incremental changes without rebuilding the entire library.

Usage:
  python generate.py                   # Incremental run (only runs modified generator components)
  python generate.py --category arrows # Rebuild only arrows and swooshes
  python generate.py --category y2k    # Rebuild only Y2K cyber stars
  python generate.py --all             # Force rebuild all 12 categories
  python generate.py --list            # List all categories and status
"""

import os
import sys
import json
import time
import hashlib
import importlib
import subprocess
import argparse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

CACHE_FILE = os.path.join(BASE_DIR, ".generator_cache.json")
SVG_DIR = os.path.join(BASE_DIR, "assets", "svg")
PNG_DIR = os.path.join(BASE_DIR, "assets", "png")

CATEGORIES = {
    "01_y2k_cyber_stars": {
        "title": "Y2K & Cyber Stars",
        "aliases": ["y2k", "stars", "star", "cyber"],
        "generator_file": "src/generators/y2k_stars.py",
        "func": "generate_all_y2k_stars",
        "module": "src.generators.y2k_stars"
    },
    "02_neo_brutalist_hud": {
        "title": "Neo-Brutalist HUD",
        "aliases": ["hud", "brutalist", "reticle", "crosshair"],
        "generator_file": "src/generators/brutalist_hud.py",
        "func": "generate_all_brutalist_hud",
        "module": "src.generators.brutalist_hud"
    },
    "03_acid_cyber_sigils": {
        "title": "Acid & Cyber Sigils",
        "aliases": ["acid", "sigil", "sigils", "tribal", "chrome"],
        "generator_file": "src/generators/acid_sigils.py",
        "func": "generate_all_acid_sigils",
        "module": "src.generators.acid_sigils"
    },
    "04_bauhaus_swiss": {
        "title": "Bauhaus & Swiss Style",
        "aliases": ["bauhaus", "swiss", "arch", "pill", "pyramid"],
        "generator_file": "src/generators/bauhaus_swiss.py",
        "func": "generate_all_bauhaus_swiss",
        "module": "src.generators.bauhaus_swiss"
    },
    "05_organic_botanical": {
        "title": "Organic & Botanical",
        "aliases": ["organic", "botanical", "blob", "leaf", "plant"],
        "generator_file": "src/generators/organic_botanical.py",
        "func": "generate_all_organic_botanical",
        "module": "src.generators.organic_botanical"
    },
    "06_retro_groovy_70s": {
        "title": "Retro Groovy 70s",
        "aliases": ["retro", "groovy", "70s", "daisy", "flower"],
        "generator_file": "src/generators/retro_groovy.py",
        "func": "generate_all_retro_groovy",
        "module": "src.generators.retro_groovy"
    },
    "07_memphis_80s_90s": {
        "title": "Memphis 80s/90s Pop",
        "aliases": ["memphis", "pop", "80s", "90s", "cube", "confetti"],
        "generator_file": "src/generators/memphis_pop.py",
        "func": "generate_all_memphis_pop",
        "module": "src.generators.memphis_pop"
    },
    "08_badges_seals_labels": {
        "title": "Badges, Seals & Labels",
        "aliases": ["badges", "badge", "seals", "seal", "stamp", "ticket"],
        "generator_file": "src/generators/badges_seals.py",
        "func": "generate_all_badges_seals",
        "module": "src.generators.badges_seals"
    },
    "09_arrows_pointers_accents": {
        "title": "Arrows, Pointers & Accents",
        "aliases": ["arrows", "arrow", "pointers", "pointer", "swoosh", "accent"],
        "generator_file": "src/generators/arrows_accents.py",
        "func": "generate_all_arrows_accents",
        "module": "src.generators.arrows_accents"
    },
    "10_sacred_guilloche_geo": {
        "title": "Sacred Geometry & Guilloche",
        "aliases": ["sacred", "guilloche", "spirograph", "rose", "mandala"],
        "generator_file": "src/generators/sacred_guilloche.py",
        "func": "generate_all_sacred_guilloche",
        "module": "src.generators.sacred_guilloche"
    },
    "11_halftones_optical_grids": {
        "title": "Halftones & Matrix Grids",
        "aliases": ["halftone", "halftones", "grid", "screen", "dither"],
        "generator_file": "src/generators/halftones.py",
        "func": "generate_all_halftones",
        "module": "src.generators.halftones"
    },
    "12_abstract_distortions": {
        "title": "Abstract Distortions",
        "aliases": ["abstract", "distortion", "distortions", "warp", "tunnel", "wave"],
        "generator_file": "src/generators/abstract_distortions.py",
        "func": "generate_all_abstract_distortions",
        "module": "src.generators.abstract_distortions"
    }
}

def compute_file_hash(rel_path: str) -> str:
    full_path = os.path.join(BASE_DIR, rel_path)
    if not os.path.exists(full_path):
        return ""
    hasher = hashlib.sha256()
    with open(full_path, "rb") as f:
        hasher.update(f.read())
    return hasher.hexdigest()

def load_cache() -> dict:
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_cache(cache: dict):
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2)

def resolve_category(query: str):
    q = query.lower().strip()
    if q in CATEGORIES:
        return q
    for cat_key, meta in CATEGORIES.items():
        if q == cat_key.lower():
            return cat_key
        if q in meta["aliases"]:
            return cat_key
        if any(q in alias for alias in meta["aliases"]):
            return cat_key
        if q in meta["title"].lower():
            return cat_key
    return None

def clean_category_output(cat_key: str):
    svg_sub = os.path.join(SVG_DIR, cat_key)
    png_sub = os.path.join(PNG_DIR, cat_key)
    if os.path.exists(svg_sub):
        for f in os.listdir(svg_sub):
            if f.endswith(".svg"):
                try: os.remove(os.path.join(svg_sub, f))
                except OSError: pass
    if os.path.exists(png_sub):
        for f in os.listdir(png_sub):
            if f.endswith(".png"):
                try: os.remove(os.path.join(png_sub, f))
                except OSError: pass

def run_category_generator(cat_key: str):
    meta = CATEGORIES[cat_key]
    out_dir = os.path.join(SVG_DIR, cat_key)
    os.makedirs(out_dir, exist_ok=True)
    
    clean_category_output(cat_key)
    
    mod = importlib.import_module(meta["module"])
    func = getattr(mod, meta["func"])
    
    t0 = time.time()
    items = func(out_dir)
    elapsed = time.time() - t0
    print(f"  [OK] {meta['title']} -> {len(items)} SVGs generated ({elapsed:.2f}s)")
    return len(items)

def rasterize_category(cat_key: str):
    cmd = ["node", "src/rasterizer.js", "--category", cat_key]
    subprocess.run(cmd, cwd=BASE_DIR, check=True)

def rebuild_index(cat_key: str = None):
    cmd = [sys.executable, "src/build_index.py"]
    if cat_key:
        cmd.extend(["--category", cat_key])
    subprocess.run(cmd, cwd=BASE_DIR, check=True)

def main():
    parser = argparse.ArgumentParser(description="Componentized VectorCraft Asset Generator")
    parser.add_argument("--category", "-c", type=str, help="Generate only a specific category (e.g. arrows, y2k, hud)")
    parser.add_argument("--all", "-a", action="store_true", help="Force rebuild all 12 categories")
    parser.add_argument("--list", "-l", action="store_true", help="List all categories and status")
    parser.add_argument("--no-rasterize", action="store_true", help="Skip PNG rasterization step")
    args = parser.parse_args()

    cache = load_cache()

    if args.list:
        print("\n=== VectorCraft Componentized Categories ===")
        for key, meta in CATEGORIES.items():
            curr_hash = compute_file_hash(meta["generator_file"])
            cached_hash = cache.get(key)
            status = "MODIFIED" if curr_hash != cached_hash else "UP TO DATE"
            svg_count = len(os.listdir(os.path.join(SVG_DIR, key))) if os.path.exists(os.path.join(SVG_DIR, key)) else 0
            print(f"[{status:^10}] {key:<30} ({svg_count:3d} SVGs) Aliases: {', '.join(meta['aliases'])}")
        print()
        return

    # Determine which categories to run
    cats_to_run = []
    
    if args.category:
        resolved = resolve_category(args.category)
        if not resolved:
            print(f"Error: Unknown category '{args.category}'. Use --list to see available categories.")
            sys.exit(1)
        cats_to_run.append(resolved)
        print(f"\n[+] Running single component: {CATEGORIES[resolved]['title']} ({resolved})")
    elif args.all:
        cats_to_run = list(CATEGORIES.keys())
        print(f"\n[+] Force rebuilding all {len(cats_to_run)} categories...")
    else:
        # Incremental mode: check file hashes
        for key, meta in CATEGORIES.items():
            curr_hash = compute_file_hash(meta["generator_file"])
            if curr_hash != cache.get(key):
                cats_to_run.append(key)
        
        if not cats_to_run:
            print("\n[+] All 12 generator components are UP TO DATE. (0 changes detected)")
            print("    Use 'python generate.py --category <name>' to force run a category, or '--all' to rebuild everything.\n")
            return
        print(f"\n[+] Detected changes in {len(cats_to_run)} component(s): {', '.join(cats_to_run)}")

    # Execute selected generators
    total_shapes = 0
    t_start = time.time()
    
    for cat in cats_to_run:
        print(f"\n[+] Generating {CATEGORIES[cat]['title']}...")
        count = run_category_generator(cat)
        total_shapes += count
        
        if not args.no_rasterize:
            print(f"  [+] Rasterizing PNGs for {cat}...")
            rasterize_category(cat)
            
        print(f"  [+] Updating component index for {cat}...")
        rebuild_index(cat)
        
        # Update cache
        cache[cat] = compute_file_hash(CATEGORIES[cat]["generator_file"])
        save_cache(cache)

    total_time = time.time() - t_start
    print(f"\n=================================================================")
    print(f" COMPONENT GENERATION COMPLETE: {total_shapes} shapes processed in {total_time:.2f}s")
    print(f"=================================================================\n")

if __name__ == "__main__":
    main()
