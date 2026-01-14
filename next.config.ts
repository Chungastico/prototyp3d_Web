/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jsouxozrephmvytvuthy.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'prototyp3dsv.com',
          },
        ],
        destination: 'https://www.prototyp3dsv.com/:path*',
        permanent: true,
      },
    ];
  },
};
module.exports = nextConfig;
