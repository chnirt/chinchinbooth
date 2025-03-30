import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    APP_VERSION: process.env.APP_VERSION || "dev",
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
