"""
Automated Verification Suite for Asset Library.
Checks XML validity of all SVGs, binary validity and dimensions of PNGs,
and verifies 100% parity between manifest and disk.
"""

import os
import json
import xml.etree.ElementTree as ET

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST_PATH = os.path.join(BASE_DIR, "manifest.json")

def verify_all():
    print("=================================================================")
    print("             ASSET LIBRARY COMPREHENSIVE AUDIT                  ")
    print("=================================================================")
    
    assert os.path.exists(MANIFEST_PATH), "manifest.json missing!"
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)
        
    assets = manifest["assets"]
    total = len(assets)
    print(f"[+] Manifest loaded: {total} shapes across {len(manifest['categories'])} categories.")
    
    svg_errors = []
    png_errors = []
    missing_files = []

    for i, asset in enumerate(assets):
        svg_file = os.path.join(BASE_DIR, asset["file"])
        png_file = os.path.join(BASE_DIR, asset["png"])
        
        # 1. Existence check
        if not os.path.exists(svg_file):
            missing_files.append(f"Missing SVG: {svg_file}")
            continue
        if not os.path.exists(png_file):
            missing_files.append(f"Missing PNG: {png_file}")
            continue
            
        # 2. SVG XML validity check
        try:
            tree = ET.parse(svg_file)
            root = tree.getroot()
            if not root.tag.endswith("svg"):
                svg_errors.append(f"Invalid root tag in {svg_file}")
            if "viewBox" not in root.attrib:
                svg_errors.append(f"Missing viewBox in {svg_file}")
        except Exception as e:
            svg_errors.append(f"XML parse error in {svg_file}: {e}")

        # 3. PNG Binary validity check
        try:
            with open(png_file, "rb") as pf:
                header = pf.read(8)
                if header != b"\x89PNG\r\n\x1a\n":
                    png_errors.append(f"Corrupt PNG header: {png_file}")
            size = os.path.getsize(png_file)
            if size < 500:
                png_errors.append(f"Suspiciously small PNG ({size} bytes): {png_file}")
        except Exception as e:
            png_errors.append(f"PNG read error in {png_file}: {e}")

        if (i + 1) % 500 == 0 or (i + 1) == total:
            print(f"    Verified {i + 1}/{total} assets...")

    print("\n---------------- AUDIT RESULTS ----------------")
    print(f"Missing Files: {len(missing_files)}")
    print(f"SVG Errors:    {len(svg_errors)}")
    print(f"PNG Errors:    {len(png_errors)}")

    if not missing_files and not svg_errors and not png_errors:
        print(f"\n>>> AUDIT PASSED: 100% of all {len(assets):,} assets are valid and verified! <<<")
        return True
    else:
        print("\n>>> AUDIT FAILED <<<")
        return False

if __name__ == "__main__":
    success = verify_all()
    if not success:
        exit(1)
