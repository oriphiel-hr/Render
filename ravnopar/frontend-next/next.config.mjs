/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Avoid static prerender bailouts from client searchParams in chrome
  experimental: {}
};

export default nextConfig;
