/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.prototyp3dsv.com',
  generateRobotsTxt: true,
  exclude: [
    '/admin',
    '/admin/*',
    '/auth',
    '/auth/*',
    '/dashboard',
    '/dashboard/*',
    '/perfil',
    '/perfil/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: [
          '/admin',
          '/admin/*',
          '/auth',
          '/auth/*',
          '/dashboard',
          '/dashboard/*',
          '/perfil',
          '/perfil/*',
        ],
      },
    ],
  },
}
