import type { NextConfig } from "next";

const backendApiUrl = process.env.BACKEND_API_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${backendApiUrl}/api/v1/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/auth/sso/callback",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
};

export default nextConfig;
