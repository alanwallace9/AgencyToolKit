import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  async redirects() {
    return [
      // Redirect old /tours routes to new /g routes (Guidely)
      {
        source: '/tours/checklists/:id',
        destination: '/g/checklists/:id',
        permanent: true,
      },
      {
        source: '/tours/themes/:id',
        destination: '/g/themes/:id',
        permanent: true,
      },
      {
        source: '/tours/banners/:id',
        destination: '/g/banners/:id',
        permanent: true,
      },
      {
        source: '/tours/:id',
        destination: '/g/tours/:id',
        permanent: true,
      },
      {
        source: '/tours',
        destination: '/g/tours',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/embed/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors *" },
        ],
      },
      {
        source: '/dashboard/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors *" },
        ],
      },
      // CORS headers for tour analytics API (called from embed script on GHL domains)
      {
        source: '/api/tours/analytics',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};

export default nextConfig;
