import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/dictionary/strokes/*": ["./node_modules/hanzi-writer-data/*.json"],
  },
  outputFileTracingExcludes: {
    "/*": ["./data/dictionary/**/*", "./scripts/dictionary/**/*"],
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        // Preserve native CSS Module exports; `as: *.css` turns modules into global CSS.
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
