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
  title: 'AssetLib — Free Procedural Vector & SVG Asset Library',
  description: 'Curated library of 2,000+ procedural vector assets in SVG & transparent PNG across 12 aesthetics: Y2K Cyber Stars, HUD Reticles, Bauhaus, Cyber Sigils, Halftones, and more. 100% free for commercial use.',
  keywords: 'svg library, vector assets, y2k stars, cyber sigils, hud crosshairs, bauhaus vectors, procedural svg, free svg download, graphic design assets',
  canonicalUrl: `${domain}/`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AssetLib',
    url: domain,
    description: 'Curated library of 2,000+ procedural vector assets in raw SVG and transparent PNG.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${domain}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  },
  crawlerHtml: `
    <header style="padding:16px;"><h1>AssetLib — Free Procedural Vector & SVG Asset Library</h1><p>Curated collection of 2,069+ vector shapes and procedural studio.</p></header>
  `
});
generatedCount++;

// 2. All Shapes page (/all)
renderPage({
  relPath: 'all',
  title: 'All Vector Assets & Shapes — AssetLib',
  description: 'Browse all 2,069 individual procedural vector graphics. Search and export raw SVG or transparent PNG with customizable math parameters.',
  keywords: 'all vectors, vector catalog, svg icons, procedural design, assetlib catalog',
  canonicalUrl: `${domain}/all`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Vector Assets',
    url: `${domain}/all`,
    description: 'Complete catalog of 2,069 procedural vector graphics.'
  },
  crawlerHtml: `
    <main style="padding:16px;"><h1>All 2,069 Vector Shapes</h1><p>Browse individual shapes across all 12 aesthetic movements.</p></main>
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
    title: `${catTitle} Vectors — Free SVG Asset Library | AssetLib`,
    description: `Explore ${count} curated ${catTitle} vector assets in raw SVG and PNG. Editable procedural math controls, zero cost, unrestricted commercial use.`,
    keywords: `${catTitle.toLowerCase()}, ${catTitle.toLowerCase()} vectors, ${catTitle.toLowerCase()} svg, assetlib ${catId}`,
    canonicalUrl: catUrl,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${catTitle} Vector Collection`,
      url: catUrl,
      description: `Collection of ${count} ${catTitle} vector assets.`,
      license: 'https://creativecommons.org/publicdomain/zero/1.0/'
    },
    crawlerHtml: `
      <main style="padding:16px;">
        <nav><a href="/">AssetLib</a> / <span>Categories</span></nav>
        <h1>${escapeHtml(catTitle)} Vectors</h1>
        <p>Curated collection of ${count} procedural vector assets.</p>
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
    title: `${groupTitle} — Free SVG Vectors & PNG Assets | AssetLib`,
    description: `Download ${count} customizable ${groupTitle} vector shapes in raw SVG and transparent PNG. Live procedural parametric editor, zero-cost commercial license.`,
    keywords: `${tags.join(', ')}, ${groupTitle.toLowerCase()}, free svg vectors, procedural graphics, assetlib`,
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
        name: 'AssetLib'
      }
    },
    crawlerHtml: `
      <main style="padding:16px;">
        <nav><a href="/">AssetLib</a> / <a href="/category/${col.category}">${escapeHtml(catLabel)}</a> / <span>${escapeHtml(groupTitle)}</span></nav>
        <h1>${escapeHtml(groupTitle)} Vector Assets</h1>
        <p>${escapeHtml(desc)}</p>
        <p>Contains ${count} styles in raw SVG and transparent PNG. 100% free for commercial use.</p>
        <section>
          <h2>Sample Variants</h2>
          ${previewListHtml}
        </section>
      </main>
    `
  });
  generatedCount++;
});

console.log(`Prerender complete: Generated ${generatedCount} static SEO pages in dist/.`);
