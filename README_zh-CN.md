# AI Draw

<div align="center">

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://github.com/ikooky/ai-draw/pkgs/container/ai-draw)
[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)

[English](README.md) | 简体中文

AI 驱动的 Draw.io 图表编辑器，通过自然语言创建和编辑专业图表

[在线体验](https://ai--draw--glkbw88jptpb.code.run/) · [报告问题](https://github.com/ikooky/ai-draw/issues) · [功能建议](https://github.com/ikooky/ai-draw/issues)

</div>

---

## ✨ 特性

### 🤖 AI 智能编辑
- **自然语言交互**：通过聊天对话创建和修改图表
- **智能图表生成**：AI 理解您的需求，自动生成专业图表
- **精准编辑**：支持针对性修改，无需重新生成整个图表

### 📊 强大的图表功能
- **Draw.io 集成**：完整的 Draw.io 编辑器功能
- **图片识别**：上传现有图表或截图，AI 自动复制和优化
- **版本历史**：完整的修改历史记录，随时回溯到之前的版本

### 🎨 优秀的用户体验
- **响应式设计**：完美支持桌面、平板和移动设备
- **实时预览**：即时查看 AI 生成的图表效果
- **快捷键支持**：提高编辑效率（`Ctrl+B` 切换聊天面板）

### 🔌 灵活的 AI 配置
支持任何 OpenAI 兼容的 API 服务：
- OpenAI (GPT-4.5, GPT-5.1)
- Anthropic Claude (Claude Sonnet 4.5, Claude Opus 4)
- Google Gemini (Gemini 2.5 Pro)
- 以及其他 OpenAI 兼容服务

> **提示**：Claude Sonnet 4.5 经过 AWS 架构图训练，特别适合创建云架构图。

---

## 🚀 快速开始

### 方式一：Docker 部署（推荐）

#### 使用 Docker Compose

1. **创建配置文件**

```bash
cat > .env <<EOF
AI_MODEL=claude-sonnet-4.5-20250514
CUSTOM_BASE_URL=https://api.anthropic.com/v1
CUSTOM_API_KEY=your-api-key-here
EOF
```

2. **启动服务**

```bash
docker-compose up -d
```

3. **访问应用**

打开浏览器访问：http://localhost:52996

#### 使用 Docker 命令

```bash
docker run -d \
  --name ai-draw \
  -p 52996:52996 \
  -e AI_MODEL=claude-sonnet-4.5-20250514 \
  -e CUSTOM_BASE_URL=https://api.anthropic.com/v1 \
  -e CUSTOM_API_KEY=your-api-key \
  ghcr.io/ikooky/ai-draw:latest
```

#### 环境变量说明

| 变量名 | 必填 | 说明 | 示例值 |
|--------|------|------|--------|
| `AI_MODEL` | ✅ | AI 模型名称 | `gpt-5.1`, `claude-sonnet-4.5-20250514`, `gemini-2.5-pro` |
| `CUSTOM_BASE_URL` | ✅ | API 基础地址 | `https://api.openai.com/v1` |
| `CUSTOM_API_KEY` | ✅ | API 密钥 | `sk-...` |
| `PORT` | ❌ | 服务端口（默认：52996） | `52996` |

### 方式二：本地开发

#### 前置要求

- Node.js 20+
- npm 或 yarn

#### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/ikooky/ai-draw.git
cd ai-draw
```

2. **安装依赖**

```bash
npm install
# 或
yarn install
```

3. **配置环境变量**

```bash
cp env.example .env.local
```

编辑 `.env.local` 文件，配置您的 AI 服务：

```bash
AI_MODEL=claude-sonnet-4.5-20250514
CUSTOM_BASE_URL=https://api.anthropic.com/v1
CUSTOM_API_KEY=your-api-key
```

4. **启动开发服务器**

```bash
npm run dev
```

5. **访问应用**

打开浏览器访问：http://localhost:6002

### 方式三：Vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fikooky%2Fai-draw)

1. 点击上方按钮，使用 Vercel 一键部署
2. 在 Vercel 项目设置中配置环境变量
3. 部署完成后即可访问

---

## 📖 使用指南

### AI 服务配置示例

```bash
AI_MODEL=gpt-5.1
CUSTOM_BASE_URL=https://api.openai.com/v1
CUSTOM_API_KEY=sk-...
```

### 快捷键

- `Ctrl + B` (macOS: `Cmd + B`) - 切换聊天面板

---

## 🛠️ 技术栈

- **框架**：[Next.js 15](https://nextjs.org/) - React 服务端渲染框架
- **UI 库**：[React 19](https://react.dev/) - 用户界面库
- **样式**：[Tailwind CSS 4](https://tailwindcss.com/) - 实用优先的 CSS 框架
- **AI SDK**：[@ai-sdk/react](https://sdk.vercel.ai/) - Vercel AI SDK
- **图表编辑**：[react-drawio](https://www.npmjs.com/package/react-drawio) - Draw.io React 组件
- **UI 组件**：[Radix UI](https://www.radix-ui.com/) - 无样式 UI 组件
- **图标**：[Lucide React](https://lucide.dev/) - 现代图标库
- **类型检查**：[TypeScript 5](https://www.typescriptlang.org/) - JavaScript 超集

---

## 📁 项目结构

```
ai-draw/
├── app/                      # Next.js App Router
│   ├── api/
│   │   └── chat/
│   │       └── route.ts     # AI 聊天 API 路由
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页
│   └── globals.css          # 全局样式
├── components/              # React 组件
│   ├── ui/                  # 基础 UI 组件
│   ├── chat-panel.tsx       # 聊天面板
│   ├── chat-input.tsx       # 聊天输入框
│   ├── chat-message-display.tsx  # 消息显示
│   ├── history-dialog.tsx   # 历史记录对话框
│   └── ...
├── contexts/                # React Context
│   └── diagram-context.tsx  # 图表状态管理
├── lib/                     # 工具函数
│   ├── utils.ts            # 通用工具
│   └── ai-providers.ts     # AI 服务配置
├── public/                  # 静态资源
├── .github/                 # GitHub 配置
│   └── workflows/          # CI/CD 工作流
├── docker-compose.yml       # Docker Compose 配置
├── Dockerfile              # Docker 镜像构建
├── env.example             # 环境变量示例
└── package.json            # 项目依赖
```

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。
