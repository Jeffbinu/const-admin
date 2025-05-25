import type { NextConfig } from "next";

const nextConfig = {
  // output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
