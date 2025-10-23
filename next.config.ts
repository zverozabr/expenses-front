import type { NextConfig } from "next";
import { execSync } from 'child_process';

// Get git commit hash at build time
function getGitCommitHash(): string {
  try {
    // On Vercel, use VERCEL_GIT_COMMIT_SHA environment variable
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
      console.log('Using VERCEL_GIT_COMMIT_SHA:', process.env.VERCEL_GIT_COMMIT_SHA);
      return process.env.VERCEL_GIT_COMMIT_SHA;
    }

    // Locally, try to get from git
    const hash = execSync('git rev-parse HEAD').toString().trim();
    console.log('Using git hash:', hash);
    return hash;
  } catch (error) {
    console.warn('Failed to get git commit hash, using "dev":', error instanceof Error ? error.message : error);
    return 'dev';
  }
}

// Get commit hash at module load time
const gitCommitHash = getGitCommitHash();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GIT_COMMIT_SHA: gitCommitHash,
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
