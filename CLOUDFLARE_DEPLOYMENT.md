# Cloudflare Pages 部署指南

本指南将帮助您将 AI Draw 应用部署到 Cloudflare Pages。

## 🚀 一键部署

### 方法 1: 通过 GitHub 自动部署（推荐）

1. **Fork 本仓库**
   - 点击 GitHub 仓库右上角的 "Fork" 按钮

2. **登录 Cloudflare**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 如果没有账号，请先注册

3. **创建 Pages 项目**
   - 进入 **Workers & Pages** → **Create application** → **Pages**
   - 选择 **Connect to Git**
   - 授权 Cloudflare 访问您的 GitHub 账号
   - 选择您 fork 的 `ai-draw` 仓库

4. **配置构建设置**
   ```
   项目名称: ai-draw (或您喜欢的名称)
   生产分支: main
   构建命令: npm run build
   构建输出目录: .next
   根目录: / (留空)
   ```

   **重要提示**：
   - Cloudflare Pages 会自动排除 `.next/cache` 目录
   - 项目包含 `.cfignore` 文件来过滤不必要的文件

5. **高级设置**
   - Node.js 版本: `20`
   - 环境变量（见下方）

6. **配置环境变量**

   在 **Settings** → **Environment variables** 中添加：

   ```bash
   # 必需配置
   CUSTOM_BASE_URL=https://your-api.com/v1
   CUSTOM_API_KEY=sk-your-api-key

   # 可选配置
   AI_MODEL=gpt-4
   ```

7. **开始部署**
   - 点击 **Save and Deploy**
   - 等待构建完成（约 2-5 分钟）

8. **访问您的应用**
   - 构建成功后，Cloudflare 会提供一个 URL，如：
   - `https://ai-draw.pages.dev`
   - 或绑定您的自定义域名

### 方法 2: 使用 Wrangler CLI 部署

#### 前置要求

- Node.js 18+
- npm 或 pnpm
- Cloudflare 账号

#### 步骤

1. **安装 Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **配置环境变量**

   创建 `.dev.vars` 文件（本地开发）：
   ```bash
   CUSTOM_BASE_URL=https://your-api.com/v1
   CUSTOM_API_KEY=sk-your-api-key
   ```

   设置生产环境变量：
   ```bash
   wrangler pages secret put CUSTOM_BASE_URL
   wrangler pages secret put CUSTOM_API_KEY
   ```

4. **构建项目**
   ```bash
   npm install
   npm run build

   # 清理缓存（Cloudflare Pages 限制单文件 25MB）
   rm -rf .next/cache
   ```

5. **部署**
   ```bash
   wrangler pages deploy .next --project-name=ai-draw
   ```

   或使用快捷脚本（自动清理缓存）：
   ```bash
   chmod +x .cloudflare/deploy.sh
   ./.cloudflare/deploy.sh
   ```

6. **查看部署状态**
   ```bash
   wrangler pages deployments list --project-name=ai-draw
   ```

## 🔧 配置说明

### Next.js 配置

确保 `next.config.mjs` 中包含以下配置：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages 支持
  output: 'export', // 或 'standalone' for Edge Runtime
  images: {
    unoptimized: true, // Cloudflare Pages 需要
  },
};

export default nextConfig;
```

### 环境变量

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `CUSTOM_BASE_URL` | ✅ | API 基础 URL | `https://api.openai.com/v1` |
| `CUSTOM_API_KEY` | ✅ | API 密钥 | `sk-xxx` |
| `AI_MODEL` | ❌ | 默认模型 | `gpt-4` |

### 支持的 AI 服务

- ✅ OpenAI (GPT-3.5, GPT-4, GPT-4o)
- ✅ Anthropic Claude (通过原生 SDK 或中转服务)
- ✅ Google Gemini (通过原生 SDK 或中转服务)
- ✅ DeepSeek, 通义千问等兼容 API
- ✅ New API 等中转服务

## 📱 自定义域名

1. 在 Cloudflare Pages 项目中：
   - 进入 **Custom domains**
   - 点击 **Set up a custom domain**

2. 添加您的域名：
   ```
   例如: ai-draw.yourdomain.com
   ```

3. 按照提示配置 DNS：
   - 如果域名已在 Cloudflare，会自动添加 CNAME 记录
   - 如果域名在其他服务商，需要手动添加 CNAME 记录

4. 等待 DNS 生效（通常 1-5 分钟）

## 🔍 故障排查

### 问题 1: 构建失败

**错误**: `Module not found` 或 `Cannot find package`

**解决方案**:
```bash
# 清除缓存
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 问题 2: API 调用失败

**错误**: `Failed to fetch` 或 `CORS error`

**解决方案**:
1. 检查环境变量是否正确配置
2. 确认 `CUSTOM_BASE_URL` 格式正确
3. 查看 Cloudflare Pages Functions 日志

### 问题 3: 静态资源 404

**错误**: 图片或 CSS 加载失败

**解决方案**:
在 `next.config.mjs` 中添加：
```javascript
images: {
  unoptimized: true,
}
```

### 问题 4: 字体加载失败

**错误**: Google Fonts 加载超时

**解决方案**:
1. 使用本地字体替代 Google Fonts
2. 或在构建时忽略字体错误（开发环境问题）

## 🎯 性能优化

### 1. 启用 Cloudflare 缓存

在项目根目录创建 `_headers` 文件：

```
/*
  Cache-Control: public, max-age=3600, s-maxage=3600
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/api/*
  Cache-Control: no-cache, no-store, must-revalidate
```

### 2. 使用 Edge Functions

对于 API 路由，可以使用 Cloudflare Workers：

```typescript
// app/api/chat/route.ts
export const runtime = 'edge'; // 启用 Edge Runtime
```

### 3. 图片优化

使用 Cloudflare Images：
```typescript
// next.config.mjs
images: {
  loader: 'custom',
  loaderFile: './cloudflare-image-loader.js',
}
```

## 📊 监控和日志

### 查看部署日志

```bash
wrangler pages deployments tail --project-name=ai-draw
```

### 查看实时日志

在 Cloudflare Dashboard：
- **Workers & Pages** → 您的项目 → **Logs**
- 实时查看请求日志和错误

### Analytics

Cloudflare Pages 自带：
- 访问量统计
- 带宽使用
- 错误率监控

## 🔄 自动部署

### GitHub Actions 工作流

推送代码时自动部署：

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    name: Deploy to Cloudflare Pages
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Publish to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: ai-draw
          directory: .next
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

## 🔗 相关链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [AI Draw 项目主页](https://github.com/ikooky/ai-draw)

## 📞 获取帮助

遇到问题？
- 查看 [Issues](https://github.com/ikooky/ai-draw/issues)
- 加入讨论 [Discussions](https://github.com/ikooky/ai-draw/discussions)