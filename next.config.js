/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Fix for Firebase undici issue
    if (isServer) {
      config.externals = [...(config.externals || []), 'firebase', '@firebase/auth', '@firebase/app', '@firebase/firestore'];
    }
    
    return config;
  },
}

module.exports = nextConfig 