import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output creates a self-contained build for Docker.
  // The .next/standalone directory includes everything needed to run
  // the server without node_modules being present in the image.
  output: "standalone",

  allowedDevOrigins: ["192.168.0.242"],

  images: {
    remotePatterns: [
      // Google profile pictures
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // MinIO (dev / self-hosted) — http allowed for local
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "minio",
      },
      // Cloudflare R2 / any https host — tighten to your specific domain in production
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
