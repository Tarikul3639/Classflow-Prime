import type { NextConfig } from 'next';

/**
 * CRITICAL: If you remove this rewrite, all API requests will go directly to the backend.
 * The browser will treat it as cross-site and block it — cookies won't be set, and authentication will not work.
 */
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/v3/:path*',
          destination: `${BACKEND_URL}/api/v3/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;