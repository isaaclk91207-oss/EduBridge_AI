import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API requests to the backend - this keeps /api routes on the same domain
  async rewrites() {
    return [
      {
        // Match all /api/auth/* requests
        source: "/api/auth/:path*",
        // Forward to your Render backend
        destination: "https://edubridge-ai-ui2j.onrender.com/api/auth/:path*",
      },
      {
        // Match all /api/users/* requests
        source: "/api/users/:path*",
        destination: "https://edubridge-ai-ui2j.onrender.com/api/users/:path*",
      },
      {
        // Match all /api/lectures/* requests
        source: "/api/lectures/:path*",
        destination: "https://edubridge-ai-ui2j.onrender.com/api/lectures/:path*",
      },
      {
        // Match all /api/candidates/* requests
        source: "/api/candidates/:path*",
        destination: "https://edubridge-ai-ui2j.onrender.com/api/candidates/:path*",
      },
      {
        // Match all other /api/* requests
        source: "/api/:path*",
        destination: "https://edubridge-ai-ui2j.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
