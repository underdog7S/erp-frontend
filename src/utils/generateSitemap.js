/**
 * Generate sitemap.xml for SEO
 * This can be called from a backend endpoint or generated statically
 */

const generateSitemap = () => {
  const baseUrl = 'https://zenitherp.online';
  const currentDate = new Date().toISOString().split('T')[0];

  // Public pages that should be indexed
  const publicPages = [
    { url: '', priority: '1.0', changefreq: 'weekly' }, // Homepage
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/pricing', priority: '0.9', changefreq: 'monthly' },
    { url: '/faq', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.5', changefreq: 'yearly' },
    { url: '/terms', priority: '0.5', changefreq: 'yearly' },
    { url: '/refund', priority: '0.5', changefreq: 'yearly' },
    { url: '/delivery', priority: '0.5', changefreq: 'yearly' },
  ];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  publicPages.forEach(page => {
    sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  });

  sitemap += `</urlset>`;

  return sitemap;
};

export default generateSitemap;

