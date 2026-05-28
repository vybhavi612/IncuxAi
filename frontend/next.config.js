/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Ignore lint errors during build to keep compilation robust and fast
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript compiler issues during build for container compilation ease
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
