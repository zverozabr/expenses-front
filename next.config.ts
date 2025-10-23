import type { NextConfig } from "next";
import { execSync } from 'child_process';

// Get git commit hash at build time
function getGitCommitHash(): string {
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch (error) {
    console.warn('Failed to get git commit hash:', error);
    return 'unknown';
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GIT_COMMIT_SHA: getGitCommitHash(),
  },
  async headers() {
    return [
      {
        // Apply no-cache headers to /edit pages for Telegram WebApp
        source: '/edit/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
