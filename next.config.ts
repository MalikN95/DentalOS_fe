import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone',
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
