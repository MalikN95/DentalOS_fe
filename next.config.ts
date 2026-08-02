import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone',
  allowedDevOrigins: ['192.168.0.19'],
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
