import type { NextConfig } from "next";

const config: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  transpilePackages: ["@toms/admin-ui", "@toms/config"],
  poweredByHeader: false,
  output: "standalone"
};

export default config;
