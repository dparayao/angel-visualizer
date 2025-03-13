/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enables static HTML export
  basePath: process.env.NODE_ENV === 'production' ? '/dj-mix-visualization' : '',
  images: {
    unoptimized: true,  // For static export
  },
}

module.exports = nextConfig