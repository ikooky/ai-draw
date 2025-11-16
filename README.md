# AI Draw

<div align="center">

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://github.com/ikooky/ai-draw/pkgs/container/ai-draw)
[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)

English | [简体中文](README_zh-CN.md)

AI-powered Draw.io diagram editor that creates and edits professional diagrams through natural language

[Live Demo](https://ai--draw--glkbw88jptpb.code.run/) · [Report Bug](https://github.com/ikooky/ai-draw/issues) · [Request Feature](https://github.com/ikooky/ai-draw/issues)

</div>

---

## ✨ Features

### 🤖 AI-Powered Editing
- **Natural Language Interaction**: Create and modify diagrams through conversational chat
- **Smart Diagram Generation**: AI understands your requirements and generates professional diagrams automatically
- **Precise Editing**: Supports targeted modifications without regenerating the entire diagram

### 📊 Powerful Diagram Capabilities
- **Draw.io Integration**: Full Draw.io editor functionality
- **Image Recognition**: Upload existing diagrams or screenshots, AI automatically replicates and optimizes them
- **Version History**: Complete modification history, revert to previous versions anytime

### 🎨 Excellent User Experience
- **Responsive Design**: Perfect support for desktop, tablet, and mobile devices
- **Real-time Preview**: Instantly view AI-generated diagram effects
- **Keyboard Shortcuts**: Improve editing efficiency (`Ctrl+B` to toggle chat panel)

### 🔌 Flexible AI Configuration
Support for any OpenAI-compatible API service:
- OpenAI (GPT-4.5, GPT-5.1)
- Anthropic Claude (Claude Sonnet 4.5, Claude Opus 4)
- Google Gemini (Gemini 2.5 Pro)
- And other OpenAI-compatible services

> **Tip**: Claude Sonnet 4.5 has been trained on AWS architecture diagrams, making it ideal for creating cloud architecture diagrams.

---

## 🚀 Quick Start

### Option 1: Vercel Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fikooky%2Fai-draw)

1. Click the button above for one-click deployment with Vercel
2. Configure environment variables in Vercel project settings
3. Access after deployment is complete

### Option 2: Cloudflare Pages Deployment

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://dash.cloudflare.com/sign-up/pages)

**Quick Deployment via GitHub:**

1. Fork this repository
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. Go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
4. Select your forked repository
5. Configure build settings:
   - Build command: `npx @cloudflare/next-on-pages`
   - Build output directory: `.vercel/output/static`
   - Environment variables: `CUSTOM_BASE_URL`, `CUSTOM_API_KEY`
   - Node.js version: `18` or higher
6. Deploy and access via `https://your-project.pages.dev`

**Or deploy via Wrangler CLI:**

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build and deploy
npx @cloudflare/next-on-pages
wrangler pages deploy .vercel/output/static --project-name=ai-draw
```

### Option 3: Docker Deployment

#### Using Docker Compose

1. **Create configuration file**

```bash
cat > .env <<EOF
AI_MODEL=claude-sonnet-4.5-20250514
CUSTOM_BASE_URL=https://api.anthropic.com/v1
CUSTOM_API_KEY=your-api-key-here
EOF
```

2. **Start service**

```bash
docker-compose up -d
```

3. **Access application**

Open your browser and navigate to: http://localhost:52996

#### Using Docker Command

```bash
docker run -d \
  --name ai-draw \
  -p 52996:52996 \
  -e AI_MODEL=claude-sonnet-4.5-20250514 \
  -e CUSTOM_BASE_URL=https://api.anthropic.com/v1 \
  -e CUSTOM_API_KEY=your-api-key \
  ghcr.io/ikooky/ai-draw:latest
```

#### Environment Variables

| Variable | Required | Description | Example Value |
|----------|----------|-------------|---------------|
| `AI_MODEL` | ✅ | AI model name | `gpt-5.1`, `claude-sonnet-4.5-20250514`, `gemini-2.5-pro` |
| `CUSTOM_BASE_URL` | ✅ | API base URL | `https://api.openai.com/v1` |
| `CUSTOM_API_KEY` | ✅ | API key | `sk-...` |
| `PORT` | ❌ | Service port (default: 52996) | `52996` |

### Option 4: Local Development

#### Prerequisites

- Node.js 20+
- npm or yarn

#### Installation Steps

1. **Clone repository**

```bash
git clone https://github.com/ikooky/ai-draw.git
cd ai-draw
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Configure environment variables**

```bash
cp env.example .env.local
```

Edit the `.env.local` file and configure your AI service:

```bash
AI_MODEL=claude-sonnet-4.5-20250514
CUSTOM_BASE_URL=https://api.anthropic.com/v1
CUSTOM_API_KEY=your-api-key
```

4. **Start development server**

```bash
npm run dev
```

5. **Access application**

Open your browser and navigate to: http://localhost:6002

---

## 📖 Usage Guide

### AI Service Configuration Example

```bash
AI_MODEL=gpt-5.1
CUSTOM_BASE_URL=https://api.openai.com/v1
CUSTOM_API_KEY=sk-...
```

### Keyboard Shortcuts

- `Ctrl + B` (macOS: `Cmd + B`) - Toggle chat panel

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) - React server-side rendering framework
- **UI Library**: [React 19](https://react.dev/) - User interface library
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **AI SDK**: [@ai-sdk/react](https://sdk.vercel.ai/) - Vercel AI SDK
- **Diagram Editor**: [react-drawio](https://www.npmjs.com/package/react-drawio) - Draw.io React component
- **UI Components**: [Radix UI](https://www.radix-ui.com/) - Unstyled UI components
- **Icons**: [Lucide React](https://lucide.dev/) - Modern icon library
- **Type Checking**: [TypeScript 5](https://www.typescriptlang.org/) - JavaScript superset

---

## 📁 Project Structure

```
ai-draw/
├── app/                      # Next.js App Router
│   ├── api/
│   │   └── chat/
│   │       └── route.ts     # AI chat API route
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # Base UI components
│   ├── chat-panel.tsx       # Chat panel
│   ├── chat-input.tsx       # Chat input
│   ├── chat-message-display.tsx  # Message display
│   ├── history-dialog.tsx   # History dialog
│   └── ...
├── contexts/                # React Context
│   └── diagram-context.tsx  # Diagram state management
├── lib/                     # Utility functions
│   ├── utils.ts            # General utilities
│   └── ai-providers.ts     # AI service configuration
├── public/                  # Static assets
├── .github/                 # GitHub configuration
│   └── workflows/          # CI/CD workflows
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile              # Docker image build
├── env.example             # Environment variables example
└── package.json            # Project dependencies
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
