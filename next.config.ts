import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from auto-writing AGENTS.md / CLAUDE.md on `next dev`
  agentRules: false,
};

export default nextConfig;
