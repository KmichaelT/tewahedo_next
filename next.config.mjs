// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@neondatabase/serverless"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['lh3.googleusercontent.com'],
  },
}

export default nextConfig