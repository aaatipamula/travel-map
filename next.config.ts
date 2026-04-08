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
    ],
  },
};

export default nextConfig;
