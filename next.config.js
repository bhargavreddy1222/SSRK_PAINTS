/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Hostnames (not URLs) allowed to load the dev server, e.g. a phone on the LAN
  allowedDevOrigins: ['192.168.0.5'],
}

module.exports = nextConfig
