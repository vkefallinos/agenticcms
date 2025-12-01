/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['remult'],
  },
  transpilePackages: ['@agenticcms/core'],
};

module.exports = nextConfig;
