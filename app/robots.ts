import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/r/', '/api/'] },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://blackboxcheck.vercel.app'}/sitemap.xml`,
  };
}
