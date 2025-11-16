# 多模型支持功能指南

AI Draw 支持从配置的 OpenAI 兼容 API 自动获取并切换多个模型。

## 🎯 功能特性

- ✅ 配置一个 base_url，自动获取所有可用模型
- ✅ 在 UI 中动态切换模型
- ✅ 支持任何 OpenAI 兼容接口（OpenAI、Claude via proxy、DeepSeek、通义千问、本地 LLM 等）
- ✅ 模型列表自动刷新
- ✅ API Key 安全存储（不会暴露到前端）

## 📝 配置方式

只需配置三个环境变量：

```bash
# .env.local 或 .env

# API 基础地址 (必填)
CUSTOM_BASE_URL=http://localhost:1234/v1

# API 密钥 (必填)
CUSTOM_API_KEY=your-api-key-here

# 默认模型 ID (可选)
# 如果不设置，将使用 API 返回的第一个模型
AI_MODEL=gpt-4
```

应用会自动从 `{CUSTOM_BASE_URL}/models` 获取可用模型列表。

## 🔌 支持的 API 提供商

### OpenAI

```bash
CUSTOM_BASE_URL=https://api.openai.com/v1
CUSTOM_API_KEY=sk-xxx
AI_MODEL=gpt-4
```

### DeepSeek

```bash
CUSTOM_BASE_URL=https://api.deepseek.com
CUSTOM_API_KEY=sk-xxx
AI_MODEL=deepseek-chat
```

### 通义千问 (Qwen)

```bash
CUSTOM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
CUSTOM_API_KEY=sk-xxx
AI_MODEL=qwen-plus
```

### 本地 LLM (Ollama)

```bash
CUSTOM_BASE_URL=http://localhost:11434/v1
CUSTOM_API_KEY=ollama
AI_MODEL=llama2
```

### 本地 LLM (LM Studio)

```bash
CUSTOM_BASE_URL=http://localhost:1234/v1
CUSTOM_API_KEY=lm-studio
AI_MODEL=local-model
```

### 本地 LLM (vLLM)

```bash
CUSTOM_BASE_URL=http://localhost:8000/v1
CUSTOM_API_KEY=vllm
AI_MODEL=your-model-name
```

## 🚀 使用方法

1. **配置环境变量**
   - 创建或编辑 `.env.local` 文件（开发环境）
   - 或编辑 `.env` 文件（Docker 部署）
   - 设置 `CUSTOM_BASE_URL` 和 `CUSTOM_API_KEY`

2. **启动应用**
   ```bash
   # 开发环境
   npm run dev

   # 或使用 Docker
   docker-compose up -d
   ```

3. **选择模型**
   - 打开应用后，在聊天面板标题下方会看到模型选择器
   - 应用会自动从配置的 API 获取可用模型列表
   - 点击下拉菜单选择要使用的模型
   - 选择后，后续的对话将使用选中的模型

## 💡 工作原理

1. **应用启动时**
   - 从环境变量读取 `CUSTOM_BASE_URL` 和 `CUSTOM_API_KEY`
   - 调用 `{CUSTOM_BASE_URL}/models` 获取可用模型列表

2. **模型选择器显示**
   - 如果只有一个模型：显示模型名称（不显示下拉菜单）
   - 如果有多个模型：显示下拉选择器

3. **用户切换模型**
   - 用户在 UI 中选择模型
   - 后续的 AI 调用使用选中的模型 ID

## 🎨 UI 展示

- **单个模型**: 🤖 gpt-4
- **多个模型**: 🤖 [下拉选择器] ▼
  - gpt-4
  - gpt-3.5-turbo
  - deepseek-chat
  - ...

每个模型显示：
- 模型名称（主要信息）
- Base URL（次要信息，灰色小字）

## 🔒 安全性

- API Key 只在服务端使用
- 前端只能看到模型的 `id` 和 `name`
- Base URL 会显示但不包含敏感信息
- 所有 API 调用都在服务端进行

## 🐳 Docker 部署

在 `docker-compose.yml` 中配置：

```yaml
services:
  ai-draw:
    environment:
      - CUSTOM_BASE_URL=https://api.openai.com/v1
      - CUSTOM_API_KEY=sk-xxx
      - AI_MODEL=gpt-4
    ports:
      - "52996:52996"
```

## 🔧 故障排除

### 模型列表为空

**可能原因**:
1. API 端点不支持 `/models` 路径
2. API Key 无效
3. 网络连接问题

**解决方案**:
1. 确认你的 API 支持 OpenAI 兼容的 `/models` 端点
2. 检查 API Key 是否正确
3. 查看服务器日志：
   ```bash
   # 开发环境
   npm run dev

   # Docker 环境
   docker-compose logs -f ai-draw
   ```

### API 调用失败

**检查清单**:
- [ ] `CUSTOM_BASE_URL` 格式正确（通常以 `/v1` 结尾）
- [ ] `CUSTOM_API_KEY` 有效
- [ ] 选择的模型 ID 与 API 提供商要求一致
- [ ] 网络可以访问配置的 API 地址

### 默认模型设置不生效

如果设置了 `AI_MODEL` 但应用没有使用：
1. 确认环境变量文件已正确加载
2. 重启应用以重新加载环境变量
3. 检查模型 ID 是否在 API 返回的列表中

## 📚 API 要求

你的 OpenAI 兼容 API 需要支持：

1. **GET /models** - 返回可用模型列表
   ```json
   {
     "data": [
       { "id": "model-id-1", ... },
       { "id": "model-id-2", ... }
     ]
   }
   ```

2. **POST /chat/completions** - 聊天补全接口
   - 支持 `model` 参数
   - 支持流式响应
   - 支持工具调用（function calling）

## 🆘 获取帮助

如有问题或建议，请在 GitHub 提交 issue：
https://github.com/ikooky/ai-draw/issues

---

**简单配置，自动发现，灵活切换** ✨
