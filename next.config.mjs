/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove experimental.instrumentationHook - it's no longer needed in Next.js 14+
  // If you need instrumentation, just create instrumentation.ts in the root
  
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