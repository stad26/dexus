import type { NextConfig } from "next";

const teamsFrameAncestors = [
  "'self'",
  "https://teams.microsoft.com",
  "https://*.teams.microsoft.com",
  "https://*.skype.com",
  "https://outlook.office.com",
  "https://outlook.office365.com",
  "https://*.office.com",
  "https://*.microsoft365.com",
  "https://*.cloud.microsoft",
  "https://*.microsoft.com",
].join(" ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${teamsFrameAncestors}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
