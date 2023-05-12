/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
    transpilePackages: ["@dae/ui"],
    webpack: (config) => {
        config.resolve.fallback = { fs: false, net: false, tls: false, encoding: false };
        return config;
    },
};