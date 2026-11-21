export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/checkout',
          '/my-account',
          '/order-success',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/checkout',
          '/my-account',
          '/order-success',
        ],
      },
    ],
    sitemap: 'https://smartagrosource.com/sitemap.xml',
    host: 'https://smartagrosource.com',
  };
}
