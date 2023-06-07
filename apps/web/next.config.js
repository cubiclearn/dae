/** @type {import('next').NextConfig} */
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin')

module.exports = {
  reactStrictMode: true,
  transpilePackages: ['@dae/ui'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()]
    }
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      encoding: false,
    }
    return config
  },
}
