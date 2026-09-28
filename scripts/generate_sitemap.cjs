const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const summaryPath = path.join(rootDir, 'assets/data/manifest_summary.json');
const publicDir = path.join(rootDir, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const domain = process.env.SITE_URL || 'https://www.chris-creative.com/assetlib';
const lastMod = new Date().toISOString().split('T')[0];

// 1. Generate Sitemap XML
const urls = [
  { loc: `${domain}/`, priority: '1.0', changefreq: 'daily' },
  { loc: `${domain}/all`, priority: '0.8', changefreq: 'weekly' },
  { loc: `${domain}/license`, priority: '0.9', changefreq: 'monthly' },
  { loc: `${domain}/faq`, priority: '0.9', changefreq: 'monthly' }
];

// Categories
Object.keys(summary.categories || {}).forEach(catId => {
  urls.push({
    loc: `${domain}/category/${catId}`,
    priority: '0.8',
    changefreq: 'weekly'
  });
});

// Groups
(summary.collections || []).forEach(col => {
  urls.push({
    loc: `${domain}/group/${col.id}`,
    priority: '0.9',
    changefreq: 'weekly'
  });
});

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');
console.log(`Generated public/sitemap.xml with ${urls.length} URLs.`);

// 2. Generate LLMS-Full.txt
const lines = [
  '# AssetLib Full Group Index',
  '',
  `Generated on ${lastMod}. Total assets: ${summary.total_shapes || 2069} across ${summary.collections.length} archetype groups.`,
  '',
  '## Archetype Groups Directory',
  ''
];

summary.collections.forEach(col => {
  lines.push(`### ${col.title}`);
  lines.push(`- **URL**: ${domain}/group/${col.id}`);
  lines.push(`- **Category**: ${col.category_label || col.category}`);
  lines.push(`- **Styles**: ${col.count || col.items?.length || '40'}`);
  lines.push(`- **Description**: ${col.description || 'Procedural vector collection.'}`);
  lines.push(`- **Tags**: ${(col.tags || []).join(', ')}`);
  lines.push('');
});

fs.writeFileSync(path.join(publicDir, 'llms-full.txt'), lines.join('\n'), 'utf8');
console.log(`Generated public/llms-full.txt with ${summary.collections.length} groups.`);
