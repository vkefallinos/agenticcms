/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['remult'],
  },
  transpilePackages: ['@agenticcms/core'],
};

module.exports = nextConfig;
