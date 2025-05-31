/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@neondatabase/serverless"],
  
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  reactStrictMode: true,
  
  // Ensure proper handling of ESM modules
  experimental: {
    serverComponentsExternalPackages: ["@neondatabase/serverless", "pg"],
  },
}

export default nextConfig