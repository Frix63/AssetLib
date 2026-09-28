const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const templatePath = path.join(distDir, 'index.html');
const summaryPath = path.join(rootDir, 'assets/data/manifest_summary.json');
const manifestPath = path.join(rootDir, 'manifest.json');

if (!fs.existsSync(templatePath)) {
  console.error('dist/index.html not found! Run vite build first.');
  process.exit(1);
}

const baseTemplate = fs.readFileSync(templatePath, 'utf8');
const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const domain = process.env.SITE_URL || 'https://www.chris-creative.com/assetlib';

function renderPage({
  relPath,
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  jsonLd,
  crawlerHtml
}) {
  const targetDir = path.join(distDir, relPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let html = baseTemplate;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

  // Build Head Metas & JSON-LD
  const headTags = [
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta name="keywords" content="${escapeHtml(keywords)}">`,
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<meta property="og:site_name" content="AssetLib">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:image" content="${ogImage || `${domain}/assets/og-image.png`}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<meta name="twitter:image" content="${ogImage || `${domain}/assets/og-image.png`}">`
  ];

  if (jsonLd) {
    headTags.push(`<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`);
  }

  html = html.replace('</head>', `${headTags.join('\n  ')}\n</head>`);

  // Inject semantic crawler HTML inside <div id="root">
  if (crawlerHtml) {
    html = html.replace('<div id="root"></div>', `<div id="root">${crawlerHtml}</div>`);
  }

  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

let generatedCount = 0;

// 1. Root Homepage (dist/index.html update)
renderPage({
  relPath: '',
  title: 'AssetLib — 2,000+ Free Design Assets & Vector Shapes (SVG & PNG)',
  description: 'Download 2,069+ curated free design assets, vector shapes, and graphic design elements in clean SVG & transparent PNG. Ready for Figma, Illustrator, and Photoshop. 100% free for commercial & personal projects.',
  keywords: 'free design assets, free design vectors, free vector pack, free svg shapes, graphic design assets, y2k vector shapes, brutalist design elements, acid graphics, figma vector assets, illustrator vector pack, free commercial vectors, streetwear graphics, poster design assets, assetlib',
  canonicalUrl: `${domain}/`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AssetLib — Free Design Assets',
    url: domain,
    description: 'Curated library of 2,000+ free design assets, vector shapes, and design elements in clean SVG & transparent PNG.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${domain}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  },
  crawlerHtml: `
    <header style="padding:24px;">
      <h1>Free Design Assets &amp; Vector Shapes for Graphic Designers</h1>
      <p>Curated collection of 2,069+ authentic vector shapes and design assets across 12 aesthetic movements: Y2K Cyber Stars, Brutalist HUD, Acid Graphics, Bauhaus Modernism, Retro 70s Pop, Memphis 80s, Badges &amp; Seals, Sacred Geometry, and Halftones.</p>
      <ul>
        <li><strong>Format</strong>: Clean Scalable SVG &amp; High-Resolution Transparent PNG</li>
        <li><strong>Compatibility</strong>: Figma, Adobe Illustrator, Photoshop, Canva, After Effects &amp; Web Code</li>
        <li><strong>License</strong>: 100% Free for Commercial &amp; Personal Projects (CC0 Public Domain)</li>
      </ul>
    </header>
  `
});
generatedCount++;

// 2. All Shapes page (/all)
renderPage({
  relPath: 'all',
  title: 'All 2,069 Free Design Assets & Vector Shapes | AssetLib',
  description: 'Browse the complete collection of 2,069 free vector assets and design shapes. Instant copy SVG, transparent PNG download, and live customization for Figma, Illustrator, and web projects.',
  keywords: 'all design assets, free vectors, free design elements, svg shapes catalog, graphic design vectors, figma assets, illustrator vectors, assetlib catalog',
  canonicalUrl: `${domain}/all`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Free Design Assets & Vector Shapes',
    url: `${domain}/all`,
    description: 'Complete catalog of 2,069 free vector assets and design elements.'
  },
  crawlerHtml: `
    <main style="padding:24px;">
      <h1>All 2,069 Free Vector Shapes &amp; Design Assets</h1>
      <p>Browse individual shapes across all 12 aesthetic movements. Instant SVG copy and PNG download.</p>
    </main>
  `
});
generatedCount++;

// 2b. Commercial License Page (/license)
renderPage({
  relPath: 'license',
  title: 'Commercial License & Usage Rights — Free Design Assets | AssetLib',
  description: '100% free commercial license for all 2,069+ AssetLib vector shapes and design assets. CC0 Public Domain dedication for client work, streetwear, logos, merchandise, and web projects.',
  keywords: 'free vector commercial license, free design assets commercial use, cc0 vectors, vector pack client work, assetlib license, copyright free vectors',
  canonicalUrl: `${domain}/license`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Commercial License & Usage Rights',
    url: `${domain}/license`,
    description: 'Commercial license details for AssetLib vector assets and design shapes under CC0 1.0 Universal.',
    license: 'https://creativecommons.org/publicdomain/zero/1.0/'
  },
  crawlerHtml: `
    <main style="padding:24px;">
      <h1>Commercial License &amp; Usage Rights — 100% Free</h1>
      <p>All 2,069+ vector shapes on AssetLib are dedicated to the public domain under Creative Commons Zero (CC0 1.0 Universal).</p>
      <section>
        <h2>What You Can Do:</h2>
        <ul>
          <li>Use in paying client projects, logos, and brand identity systems without royalties.</li>
          <li>Print on physical merchandise, streetwear apparel, album covers, posters, and packaging.</li>
          <li>Integrate into digital websites, Figma design files, mobile apps, and templates.</li>
          <li>No attribution, backlinks, or licensing fees required.</li>
        </ul>
      </section>
      <section>
        <h2>Restrictions:</h2>
        <p>You may not re-upload the entire raw unmodified asset archive to sell as a standalone stock vector pack on commercial marketplaces.</p>
      </section>
    </main>
  `
});
generatedCount++;

// 2c. Designer FAQ Page (/faq)
renderPage({
  relPath: 'faq',
  title: 'Designer FAQ & Tool Guide — Free Vector Shapes | AssetLib',
  description: 'Frequently asked questions for graphic designers: how shapes are constructed with clean vector code, Figma & Illustrator integration, file formats, and commercial rights.',
  keywords: 'free vector figma, illustrator svg import, how to use vector pack, clean bezier svg, commercial design vectors, assetlib faq',
  canonicalUrl: `${domain}/faq`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How are the shapes constructed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Every asset is generated through exact geometric code and procedural vector algorithms—never autotraced from pixelated bitmaps. This ensures pure, lightweight SVG geometry with clean bezier curves, zero artifact points, and perfect scalability across print and screen.'
        }
      },
      {
        '@type': 'Question',
        name: 'How do I copy shapes directly into Figma or Adobe Illustrator?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Click on any shape to open the inspection modal, then click "COPY SVG". In Figma or Illustrator, press Ctrl+V (or Cmd+V) on your canvas. The shape will paste instantly as native vector paths with fully editable anchor points and fills.'
        }
      },
      {
        '@type': 'Question',
        name: 'What file formats are included?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All shapes are provided in clean SVG vector code, 300 DPI high-resolution transparent PNG (from 512px up to 2048px), and a complete master ZIP download containing all 2,069 assets in categorized folders.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I use these shapes for commercial client projects?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, 100%. All assets are released under Creative Commons Zero (CC0 Public Domain). You can use them freely in commercial client projects, apparel, album covers, and digital products with no royalties or fees.'
        }
      }
    ]
  },
  crawlerHtml: `
    <main style="padding:24px;">
      <h1>Designer FAQ &amp; Vector Tool Guide</h1>
      <dl>
        <dt><strong>How are the shapes constructed?</strong></dt>
        <dd>Every asset is generated through exact geometric code and procedural vector algorithms—never autotraced from pixelated bitmaps. This ensures pure, lightweight SVG geometry with clean bezier curves, zero artifact points, and perfect scalability.</dd>
        <dt><strong>How do I copy shapes directly into Figma or Adobe Illustrator?</strong></dt>
        <dd>Click any shape, select "COPY SVG", and paste directly onto your Figma or Illustrator canvas with Ctrl+V / Cmd+V.</dd>
        <dt><strong>What file formats are provided?</strong></dt>
        <dd>Clean, scalable SVG and 300 DPI transparent PNG.</dd>
        <dt><strong>Can I use these for commercial client projects?</strong></dt>
        <dd>Yes, 100% free under CC0 Public Domain.</dd>
      </dl>
    </main>
  `
});
generatedCount++;

// 3. Category pages (/category/:id)
Object.entries(summary.categories || {}).forEach(([catId, catInfo]) => {
  const catTitle = catInfo.title;
  const count = catInfo.count;
  const catUrl = `${domain}/category/${catId}`;

  renderPage({
    relPath: `category/${catId}`,
    title: `${catTitle} — Free Vector Shapes & Graphic Design Assets | AssetLib`,
    description: `Download ${count} curated ${catTitle} vector shapes and design assets in clean SVG & transparent PNG. Free for commercial branding, posters, streetwear, and UI/UX design.`,
    keywords: `free ${catTitle.toLowerCase()} assets, ${catTitle.toLowerCase()} vectors, ${catTitle.toLowerCase()} svg shapes, graphic design ${catTitle.toLowerCase()}, figma ${catTitle.toLowerCase()}, vector pack`,
    canonicalUrl: catUrl,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${catTitle} Vector Assets`,
      url: catUrl,
      description: `Collection of ${count} free ${catTitle} vector shapes and design assets.`,
      license: 'https://creativecommons.org/publicdomain/zero/1.0/'
    },
    crawlerHtml: `
      <main style="padding:24px;">
        <nav><a href="/">AssetLib</a> / <span>Categories</span></nav>
        <h1>${escapeHtml(catTitle)} — Free Vector Assets</h1>
        <p>Curated collection of ${count} authentic design shapes in clean SVG and transparent PNG. 100% free for commercial use in Figma, Illustrator, and client work.</p>
      </main>
    `
  });
  generatedCount++;
});

// 4. Group / Collection pages (/group/:id)
(summary.collections || []).forEach(col => {
  const groupUrl = `${domain}/group/${col.id}`;
  const groupTitle = col.title;
  const catLabel = col.category_label || col.category;
  const count = col.count || col.items?.length || 40;
  const desc = col.description || `Collection of ${count} ${groupTitle} vector assets in SVG and PNG.`;
  const tags = col.tags || [];

  // Find sample items in manifest for crawler preview list
  const sampleItems = manifest.assets
    .filter(a => a.collection_id === col.id || (a.file && a.file.includes(col.id)))
    .slice(0, 16);

  const previewListHtml = sampleItems.length > 0
    ? `<ul>${sampleItems.map(s => `<li><strong>${escapeHtml(s.title || s.name)}</strong>: ${escapeHtml(s.name)} (SVG & PNG)</li>`).join('\n')}\n</ul>`
    : '';

  renderPage({
    relPath: `group/${col.id}`,
    title: `${groupTitle} — Free Vector Shapes & Design Assets (SVG & PNG) | AssetLib`,
    description: `Download ${count} free ${groupTitle} vector shapes and design assets in clean SVG and transparent PNG. Compatible with Figma, Adobe Illustrator, and web code. 100% free commercial license.`,
    keywords: `${tags.join(', ')}, ${groupTitle.toLowerCase()}, free design assets, free vector shapes, graphic design vectors, figma assets, svg download`,
    canonicalUrl: groupUrl,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ImageGallery',
      name: `${groupTitle} Vectors`,
      description: desc,
      url: groupUrl,
      license: 'https://creativecommons.org/publicdomain/zero/1.0/',
      creator: {
        '@type': 'Organization',
        name: 'AssetLib by Chris Creative'
      }
    },
    crawlerHtml: `
      <main style="padding:24px;">
        <nav><a href="/">AssetLib</a> / <a href="/category/${col.category}">${escapeHtml(catLabel)}</a> / <span>${escapeHtml(groupTitle)}</span></nav>
        <h1>${escapeHtml(groupTitle)} — Free Vector Shapes</h1>
        <p>${escapeHtml(desc)}</p>
        <p>Includes ${count} styles in raw SVG and transparent PNG. Ready for Figma, Illustrator, and commercial projects.</p>
        <section>
          <h2>Included Shape Variants</h2>
          ${previewListHtml}
        </section>
      </main>
    `
  });
  generatedCount++;
});

console.log(`Prerender complete: Generated ${generatedCount} static SEO pages in dist/.`);
