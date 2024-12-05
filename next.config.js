/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
await import("./src/env.js");

import { withLogtail } from "@logtail/next";

/**
 * @type {import("next").NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ["vod.api.video"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withLogtail(nextConfig);
