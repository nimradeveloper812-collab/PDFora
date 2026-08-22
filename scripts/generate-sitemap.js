import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemap() {
  const { TOOLS } = await import('../src/data/toolsData.js');
  
  const today = new Date().toISOString().split('T')[0];
  const baseUrl = 'https://pdfora.nimradev.site';

  const staticPages = [
    {
      loc: `${baseUrl}/`,
      lastmod: today,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      loc: `${baseUrl}/tools`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.9'
    },
    {
      loc: `${baseUrl}/about`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      loc: `${baseUrl}/contact`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      loc: `${baseUrl}/privacy-policy`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.5'
    },
    {
      loc: `${baseUrl}/terms-of-service`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.5'
    }
  ];

  const toolPages = TOOLS.map(tool => ({
    loc: `${baseUrl}${tool.path}`,
    lastmod: today,
    changefreq: 'weekly',
    priority: tool.popular ? '0.9' : '0.85'
  }));

  const allPages = [...staticPages, ...toolPages];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allPages.map(page => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  const publicPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(publicPath, xmlContent, 'utf-8');
  console.log(`Generated public/sitemap.xml with ${allPages.length} canonical URLs.`);

  const distPath = path.join(__dirname, '../dist/sitemap.xml');
  if (fs.existsSync(path.join(__dirname, '../dist'))) {
    fs.writeFileSync(distPath, xmlContent, 'utf-8');
    console.log(`Also copied sitemap.xml to dist/ folder.`);
  }
}

generateSitemap().catch(err => {
  console.error('Error generating sitemap:', err);
  process.exit(1);
});
