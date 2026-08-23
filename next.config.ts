import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-de660365e7d4486b8394ca700296d152.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
    formats: ["image/webp"],
  },
};

export default nextConfig;
