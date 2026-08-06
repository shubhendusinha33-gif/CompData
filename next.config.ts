import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "1";

const nextConfig: NextConfig = {
  // Prevent Next.js from auto-writing AGENTS.md / CLAUDE.md on `next dev`
  agentRules: false,
  // Static site for GitHub Pages (no laptop install required)
  ...(isGithubPages
    ? {
        output: "export" as const,
        basePath: "/CompData",
        assetPrefix: "/CompData/",
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? "/CompData" : "",
  },
};

export default nextConfig;
