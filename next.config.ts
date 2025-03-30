import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { execSync } from "child_process";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    APP_VERSION: execSync("git describe --tags --always").toString().trim(),
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
