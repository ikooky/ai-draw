import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Docker 部署需要 standalone 模式
  // Cloudflare Pages 构建时通过环境变量 CLOUDFLARE=true 禁用
  output: process.env.CLOUDFLARE ? undefined : 'standalone',
};

export default nextConfig;
