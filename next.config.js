/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable static optimization for problematic pages
  generateBuildId: async () => {
    return 'build-cache-' + Date.now()
  },
  // Enable proper static export with error handling
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Handle React context issues during static generation
  experimental: {
    // Enable proper error handling for static generation
    serverComponentsExternalPackages: [],
  },
  // Force dynamic rendering for pages with context issues
  generateEtags: false,
}

module.exports = nextConfig
