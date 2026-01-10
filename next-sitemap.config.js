/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.prototyp3dsv.com',
  generateRobotsTxt: true,
  exclude: ['/admin', '/admin/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: ['/admin', '/admin/*'],
      },
    ],
  },
}
