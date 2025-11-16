#!/bin/bash
# Cloudflare Pages 部署脚本

echo "🚀 开始部署到 Cloudflare Pages..."

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null
then
    echo "📦 安装 Wrangler CLI..."
    npm install -g wrangler
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

# 清理缓存文件（Cloudflare Pages 限制单个文件最大 25MB）
echo "🧹 清理构建缓存..."
rm -rf .next/cache

# 部署到 Cloudflare Pages
echo "☁️ 部署到 Cloudflare Pages..."
wrangler pages deploy .next --project-name=ai-draw

echo "✅ 部署完成！"
