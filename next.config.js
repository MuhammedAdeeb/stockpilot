/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bundle better-sqlite3 only on the server
  serverExternalPackages: ['better-sqlite3'],

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'better-sqlite3'];
    }
    return config;
  },
};

module.exports = nextConfig;
