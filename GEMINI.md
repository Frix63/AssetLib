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
