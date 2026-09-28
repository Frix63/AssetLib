# VectorCraft &bull; Massive Graphic Design Asset Library

A curated, automated collection of **2,737+ production-grade vector shapes** across 12 contemporary design aesthetics, ready for direct drag-and-drop into Figma, Adobe Illustrator, Photoshop, Canva, Affinity Designer, Blender, and web editors.

---

## 🎨 Asset Categories & Aesthetics

| # | Category | Count | Aesthetic Description & Key Elements |
|---|---|---|---|
| **01** | **Y2K & Cyber Stars** | 273 | 4/5/6/8/12/16-point pinch astroids, chrome facets, compass stars, anamorphic sparkles, lens flares, hollow/ringed cyber stars |
| **02** | **Neo-Brutalist HUD** | 260 | Precision targeting reticles, viewfinder brackets, chamfered corner frames, wireframe 3D globes, brutalist Swiss pluses, segmented radar dials, barcode badges |
| **03** | **Acid & Cyber Sigils** | 309 | Bilateral cyber-sigil crests, gothic thorn blades, liquid chrome spikes, molten talons, hyperspace spiral vortexes, neo-tribal razor barbs |
| **04** | **Bauhaus & Swiss Style** | 204 | Minimalist cathedral arches, tunnel portals, stadium pills, stepped ziggurats, modular quadrant grids, concentric semicircles, diagonal striped blocks |
| **05** | **Organic & Botanical** | 266 | Fourier harmonic amoebas, smooth river pebbles, Matisse-style botanical leaf cutouts, ginkgo fan fronds, fluid wavy ribbons |
| **06** | **Retro Groovy 70s** | 184 | 5/6/8/12-petal daisy flowers, 12-32 point sale starbursts, roadside motel lozenges, melting psychedelic badges, concentric rainbow arches |
| **07** | **Memphis 80s/90s Pop** | 200 | Zigzag shockwaves, squiggle noodles, 3D isometric shaded cubes, floating geometric confetti scatter clusters |
| **08** | **Badges, Seals & Labels** | 199 | 8-48 flute scalloped certificate seals, perforated postage stamps, award rosette ribbons, notched admission ticket stubs |
| **09** | **Arrows & Accents** | 256 | Heavy brutalist block arrows, curved swoosh flows, looped navigation pointers, faceted 3D compass needles, speech bubble callouts |
| **10** | **Sacred Geometry & Guilloche** | 257 | Rhodonea rose curves, hypotrochoid spirographs, Lissajous harmonic knots, Flower & Seed of Life lattices, Metatron's cube wireframes |
| **11** | **Halftones & Matrix Grids** | 175 | Concentric radial halftones, linear gradient screens, diamond halftone matrices, wave-modulated dither matrices, concentric ring halftones |
| **12** | **Abstract Distortions** | 154 | Sliced sinusoidal wave slats, twisted vortex polygon tunnels, wave-warped ripple discs, optical moire interference rings, parabolic string art |
| **Total** | **All Categories** | **2,737** | **100% Scalable Vector SVG + 1024x1024 Transparent PNG** |

---

## 📁 Directory Structure

```
d:/Code/AssetCreator/
├── index.html                      # Interactive Drag & Drop Visual Gallery & Asset Browser
├── manifest.json                   # Master JSON catalog with full metadata, tags, and paths
├── assets/
│   ├── svg/                        # Scalable Vector Graphics (viewBox="0 0 512 512")
│   │   ├── 01_y2k_cyber_stars/
│   │   ├── 02_neo_brutalist_hud/
│   │   ├── 03_acid_cyber_sigils/
│   │   ├── 04_bauhaus_swiss/
│   │   ├── 05_organic_botanical/
│   │   ├── 06_retro_groovy_70s/
│   │   ├── 07_memphis_80s_90s/
│   │   ├── 08_badges_seals_labels/
│   │   ├── 09_arrows_pointers_accents/
│   │   ├── 10_sacred_guilloche_geo/
│   │   ├── 11_halftones_optical_grids/
│   │   └── 12_abstract_distortions/
│   └── png/                        # High-resolution (1024x1024) Transparent PNGs
│       └── (mirrors the exact folder structure above)
├── src/
│   ├── common.py                   # SVGBuilder, geometry, polar transforms, spline curves
│   ├── rasterizer.js               # Multi-threaded @resvg/resvg-js parallel PNG rasterizer
│   └── generators/                 # Modular mathematical shape generation scripts
└── generate_all.py                 # Master orchestrator script
```

---

## 🚀 How to Use

### 1. Interactive Asset Gallery (`index.html`)
Open `index.html` in your web browser (Edge, Chrome, Safari, Firefox) directly or via `start_viewer.bat`:
- **Shape Family Grouping (Default)**: Organizes all 2,923 shapes into **195 distinct shape families** (e.g. 4-point cyber stars, daisies, crosses, reticles) with variant badges, inline `< Prev / Next >` steppers, and a "View All Variants" modal drawer.
- **View Mode Switcher**: Toggle seamlessly between `[ Grouped Families (195) ]` and `[ All 2,923 Shapes ]`.
- **Intelligent Semantic Search**: Multi-token search with a built-in synonym dictionary:
  - Searching `flower` automatically finds daisies, leaves, petals, and botanicals.
  - Searching `cross` finds targeting crosshairs, swiss pluses, and compass needles.
  - Searching `star` finds pinches, sparkles, flares, astroids, and bursts.
  - Searching `3d` finds isometric cubes, wireframe globes, and faceted stars.
- **Quick Tag Filter Pills**: Instant one-click pills for `#stars`, `#crosshairs`, `#arrows`, `#blobs`, `#botanical`, `#badges`, `#arches`, `#flowers`, `#spirographs`, `#halftones`, `#3d-cubes`, `#acid-sigils`, `#rainbows`.
- **1-Click Copy SVG**: Click any card or the "Copy SVG" button to copy optimized vector SVG code directly to your clipboard for instant `Ctrl+V` pasting into **Figma**, **Illustrator**, or code editors.
- **Live Color Customizer**: Select White, Black, Cyber Cyan, Neon Purple, Acid Green, Sunset Orange, or pick custom hex codes to recolor shapes in real-time.
- **Direct Drag & Drop**: Drag shape cards directly into Figma canvas or desktop folders.

### 2. File Explorer Direct Drag & Drop
- Open `assets/svg/` in Windows File Explorer and drag `.svg` files directly into:
  - **Figma**: Automatically imports as vector bezier paths.
  - **Adobe Illustrator**: Imports as editable vector layers and paths.
  - **Canva**: Drag & drop into the uploads or canvas panel.
  - **Photoshop**: Imports as vector Smart Objects.
- Open `assets/png/` for crisp 1024x1024 transparent raster graphics.

---

## 🛠️ Regeneration & Customization

To regenerate the library or add new variations:
```bash
# Generate all 2,737+ SVGs and update manifest.json
python generate_all.py

# Parallel rasterization of all SVGs to 1024x1024 PNGs
node src/rasterizer.js assets/svg assets/png 1024
```
