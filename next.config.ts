/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // Comment out the basePath temporarily
  // basePath: process.env.NODE_ENV === 'production' ? '/angel-visualizer' : '',
}
module.exports = nextConfig