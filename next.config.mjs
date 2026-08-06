const STATIC_IMAGE_CACHE_HEADERS = [
  // Always revalidate with the server before using a cached copy, instead of
  // trusting a long-lived cache blindly. Next.js already serves public/
  // assets with an ETag + Last-Modified derived from file content/mtime, so
  // a revalidation request costs a cheap 304 when the file is unchanged —
  // and gets the new bytes immediately when a file was swapped in-place
  // under the same filename (e.g. replacing public/asstes/directorr.png).
  { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      { source: '/asstes/:path*', headers: STATIC_IMAGE_CACHE_HEADERS },
      { source: '/brand/:path*',  headers: STATIC_IMAGE_CACHE_HEADERS },
      { source: '/images/:path*', headers: STATIC_IMAGE_CACHE_HEADERS },
      { source: '/hero.png',      headers: STATIC_IMAGE_CACHE_HEADERS },
      { source: '/project1.png',  headers: STATIC_IMAGE_CACHE_HEADERS },
      { source: '/project2.png',  headers: STATIC_IMAGE_CACHE_HEADERS },
      { source: '/favicon-32.png',  headers: STATIC_IMAGE_CACHE_HEADERS },
      { source: '/favicon-180.png', headers: STATIC_IMAGE_CACHE_HEADERS },
      { source: '/favicon-512.png', headers: STATIC_IMAGE_CACHE_HEADERS },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'marwannazer.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
