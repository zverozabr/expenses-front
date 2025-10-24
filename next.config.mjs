import { execSync } from 'child_process';

// Get git commit hash at build time
// Updated: 2025-10-24 - Force rebuild to clear Vercel cache
function getGitCommitHash() {
  // On Vercel, VERCEL_GIT_COMMIT_SHA is automatically available
  // We need to check multiple possible env vars
  const vercelHash = process.env.VERCEL_GIT_COMMIT_SHA ||
                     process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;

  if (vercelHash) {
    console.log('Using Vercel git hash:', vercelHash);
    return vercelHash;
  }

  // Locally, try to get from git
  try {
    const hash = execSync('git rev-parse HEAD').toString().trim();
    console.log('Using local git hash:', hash);
    return hash;
  } catch (error) {
    console.warn('Failed to get git commit hash, using "dev":', error?.message || error);
    return 'dev';
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Use VERCEL_GIT_COMMIT_SHA if available, otherwise get from git or use 'dev'
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
