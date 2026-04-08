import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output creates a self-contained build for Docker.
  // The .next/standalone directory includes everything needed to run
  // the server without node_modules being present in the image.
  output: "standalone",

  allowedDevOrigins: ["192.168.0.242"],

  async rewrites() {
    const endpoint = process.env.S3_ENDPOINT;
    const bucket = process.env.R2_BUCKET_NAME;
    if (!endpoint || !bucket) return [];
    return [
      {
        source: "/photos/:path*",
        destination: `${endpoint}/${bucket}/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      // Google profile pictures
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
