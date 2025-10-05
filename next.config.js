/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Server Actions are enabled by default in Next.js 14
    // serverActions: true, // Remove this line
  },
  // API body parser configuration is not needed for App Router
  // Remove the api config as it's not valid for App Router
  output: 'export', // Enable static export for Netlify
  trailingSlash: true, // Better for static hosting
  images: {
    unoptimized: true // Required for static export
  }
}

module.exports = nextConfig
