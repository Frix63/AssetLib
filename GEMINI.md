# AssetCreator Project Guidelines & Rules

## 1. Copywriting & AI Framing
- **No AI Hype / Buzzwords**: Never use gimmicky AI marketing terminology (e.g. "AI-powered magic", "next-gen AI vectors").
- **Honest Construction**: AI assisted in authoring procedural generation code and scripts. Do NOT claim assets are "100% hand-drawn" or "zero AI used".
- **Focus on Technical Vector Quality**: Emphasize what graphic designers care about:
  - Procedural / mathematical vector generation (exact geometric formulas).
  - Clean bezier curves and anchor points (never autotraced pixel bitmaps or artifact-heavy scans).
  - Infinite scalability, lightweight SVG file sizes, and 1-click clipboard pasting into Figma and Adobe Illustrator.
- **Licensing**: CC0 1.0 Universal dedication (100% free for commercial and personal projects, logos, client work, apparel, no attribution required).

## 2. Architecture & Subpath Routing (/assetlib)
- **Dual Path Support**: AssetLib runs both standalone (`assetlib-frix63.vercel.app`) and as a proxied subpath under the main portfolio (`chris-creative.com/assetlib`).
- Always use `getBasePath()` and `getAssetUrl()` in `src/core/router.ts` when handling navigation or asset paths.
- **Static Prerendering**: Whenever adding new subpages or routes, update:
  1. `src/core/router.ts` (routing logic & navigation helpers)
  2. `scripts/generate_sitemap.cjs` (XML sitemap registration)
  3. `scripts/prerender.cjs` (static HTML generation + Schema.org JSON-LD structured data)
  4. `tests/test_router.ts` (route parsing tests)

## 3. UI & Design System
- **Brutalist Minimalist Aesthetic**: High-contrast black/white palette, stark solid borders, crisp drop-shadows, Rubik Doodle Shadow headers, and utilitarian typography.
- Keep the interface clean and distraction-free: minimal auxiliary links in the sidebar footer, fast modal dialogs for details/license/FAQ with ESC key support.

## 4. Environment & Shell Invariants
- Operating System: Windows. Shell: PowerShell.
- **Command Chaining**: Never use `&&` to chain commands in PowerShell; use `;` or execute commands sequentially.

## 5. Scalable Asset Creation & Quality Protocol
Whenever adding assets to an existing collection or creating a new collection, follow this exact workflow and adhere strictly to graphic design quality invariants.

### 5.1 Quality Invariants (Non-Negotiable)
Every vector asset must be immediately production-ready for professional graphic design (Figma, Illustrator, After Effects, and Web):
1. **Monochrome & Color-Agnostic**:
   - Use `fill="currentColor"` or `stroke="currentColor"`.
   - Transparent canvas background (no hardcoded background boxes or white backings).
   - Clean single-color assets so designers can re-color with 1 click in Figma or CSS.
2. **Safe Bounding Box & No Edge Clipping**:
   - Canvas size: `512x512` (`viewBox="0 0 512 512"`).
   - Strict visual bounds within $[32, 480]$ (minimum $32\text{px}$ margin from canvas edge).
   - Miters, outer stroke thicknesses, and pointed vertices must never be clipped at canvas boundaries.
3. **Singularity & Center Blob Prevention**:
   - For converging radial, spiral, or starburst designs, enforce a minimum inner core radius $r_{\min} \ge \frac{N \cdot \text{strokeWidth}}{2\pi}$ or a central cutout.
   - Never allow overlapping lines to fuse into an unreadable solid black blob at the center.
4. **Clean Bezier Geometry & Lightweight Footprint**:
   - Use true cubic/quadratic beziers (`C`, `Q`, `A`) or smooth cardinal splines rather than dense polylines.
   - Keep SVG file size $< 15\text{KB}$ with minimal anchor points for easy editing in Illustrator.
   - No collinear duplicate points, zero-length lines, or `NaN`/`undefined` coordinates.
5. **Predictable Fill Rules**:
   - Use `fill-rule="evenodd"` for negative-space cutouts and hollow shapes.
   - Use explicit `stroke-linecap="round"` (or `"square"`) and `stroke-linejoin="round"` (or `"miter"` with `stroke-miterlimit="10"`).
6. **Curated Parameters**:
   - Filter out degenerate parameter combinations (e.g. flat lines, invisible strokes, or muddy high-density moire).
7. **No Trivial Rotations**:
   - Never generate duplicate assets that only differ by rotation angle (e.g. generating identical shapes rotated at 45°, 90°, 135°, 180°, 270°). Designers can trivially rotate shapes in Figma or Illustrator with 1 keystroke.
   - Variations must provide genuine morphological, geometric, or structural diversity: e.g. sharp-edge vs rounded corner treatments, distinct aspect ratios, varying negative-space cutout proportions, step counts, harmonic frequencies, or chamfers.

---

### 5.2 Category & File Map Quick Reference
| Category Key | Category Folder / Title | Python Generator | TypeScript Core Generator |
| :--- | :--- | :--- | :--- |
| `01_y2k_cyber_stars` | `assets/svg/01_y2k_cyber_stars/` | `src/generators/y2k_stars.py` | `src/core/generators/stars.ts` |
| `02_neo_brutalist_hud` | `assets/svg/02_neo_brutalist_hud/` | `src/generators/brutalist_hud.py` | `src/core/generators/hud.ts` |
| `03_acid_cyber_sigils` | `assets/svg/03_acid_cyber_sigils/` | `src/generators/acid_sigils.py` | `src/core/generators/curves.ts` |
| `04_bauhaus_swiss` | `assets/svg/04_bauhaus_swiss/` | `src/generators/bauhaus_swiss.py` | `src/core/generators/bauhaus.ts` |
| `05_organic_botanical` | `assets/svg/05_organic_botanical/` | `src/generators/organic_botanical.py` | `src/core/generators/badges.ts` |
| `06_retro_groovy_70s` | `assets/svg/06_retro_groovy_70s/` | `src/generators/retro_groovy.py` | `src/core/generators/badges.ts` |
| `07_memphis_80s_90s` | `assets/svg/07_memphis_80s_90s/` | `src/generators/memphis_pop.py` | `src/core/generators/badges.ts` |
| `08_badges_seals_labels` | `assets/svg/08_badges_seals_labels/` | `src/generators/badges_seals.py` | `src/core/generators/badges.ts` |
| `09_arrows_pointers_accents`| `assets/svg/09_arrows_pointers_accents/` | `src/generators/arrows_accents.py` | `src/core/generators/badges.ts` |
| `10_sacred_guilloche_geo` | `assets/svg/10_sacred_guilloche_geo/` | `src/generators/sacred_guilloche.py` | `src/core/generators/curves.ts` |
| `11_halftones_optical_grids`| `assets/svg/11_halftones_optical_grids/` | `src/generators/halftones.py` | `src/core/generators/halftones.ts` |
| `12_abstract_distortions` | `assets/svg/12_abstract_distortions/` | `src/generators/abstract_distortions.py` | `src/core/generators/curves.ts` |

---

### 5.3 Step-by-Step Addition & Build Execution Pipeline

When prompted to add assets or collections, execute these steps in order:

1. **Procedural Vector Generation**:
   - Write or update mathematical generators in Python (`src/generators/`) or Node.js.
   - Generate cleanly formatted SVGs into `assets/svg/<category>/` using unique parameter-encoded filenames (e.g. `arrow_chevron_s4_w24.svg`).
2. **Interactive Studio Parity (Dual Engine)**:
   - Implement matching generator in `src/core/generators/<file>.ts`.
   - Register the parametric descriptor and parameter sliders in `src/core/registry.ts`.
   - Add label to `OPTIMIZED_STUDIO_LABELS` in `src/core/registry.ts`.
3. **Register Collections & Rebuild Index**:
   - If adding a new collection: add entry to `COLLECTION_DEFINITIONS` in `src/build_index.py`.
   - Run `python src/build_index.py` to regenerate:
     - `manifest.json` and `manifest.js`
     - Category chunk files in `assets/data/categories/`
4. **Parallel PNG Rasterization**:
   - Run `node src/rasterizer.js` to render crisp $1024\times 1024$ PNG previews into `assets/png/<category>/`.
5. **Sync Public Assets & Master Download Bundles**:
   - Run `node scripts/copy_assets.cjs` (syncs assets to `public/assets/`).
   - Run `node scripts/build_bundle.cjs` (repackages `AssetLib-Master-Bundle.zip` and `AssetLib-Vectors.zip`).
   - Run `node scripts/generate_sitemap.cjs` (updates XML sitemap).
   - Run `node scripts/prerender.cjs` (updates static HTML & SEO structured data).
6. **Testing & Parity Audit**:
   - Update expected asset counts in `tests/test_migrated_core.ts`.
   - Run `npm test` (verifies core procedural engine, modal navigation, router paths).
   - Run `python tests/verify_assets.py` (verifies XML syntax, PNG headers, and manifest-to-disk parity).

