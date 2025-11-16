# 多模型支持功能指南

AI Draw 现在支持配置和切换多个 OpenAI 兼容的 AI 模型。您可以在页面上的模型选择器中轻松切换不同的模型。

## 功能特性

- ✅ 支持配置多个 OpenAI 兼容 API
- ✅ 在 UI 中动态切换模型
- ✅ 向后兼容单一模型配置
- ✅ 支持任何 OpenAI 兼容接口（OpenAI、Claude、DeepSeek、通义千问等）
- ✅ 模型信息安全存储（API Key 不会暴露到前端）

## 配置方式

### 方式 1: 单一模型配置（简单模式）

适用于只需要使用一个模型的场景。

```bash
# .env.local 或 .env
AI_MODEL=gpt-4
CUSTOM_BASE_URL=https://api.openai.com/v1
CUSTOM_API_KEY=sk-xxx
```

### 方式 2: 多模型配置（高级模式）

适用于需要在不同模型之间切换的场景。

```bash
# .env.local 或 .env
AI_MODELS='[
  {
    "id": "gpt-4",
    "name": "GPT-4",
    "baseURL": "https://api.openai.com/v1",
    "apiKey": "sk-xxx"
  },
  {
    "id": "claude-3-5-sonnet-20241022",
    "name": "Claude 3.5 Sonnet",
    "baseURL": "https://api.anthropic.com/v1",
    "apiKey": "sk-ant-xxx"
  },
  {
    "id": "deepseek-chat",
    "name": "DeepSeek Chat",
    "baseURL": "https://api.deepseek.com",
    "apiKey": "sk-xxx"
  }
]'
```

**注意:**
- 如果同时配置了 `AI_MODELS` 和单一模型配置，将优先使用 `AI_MODELS`
- JSON 必须是有效的格式，建议在一行内配置（如上所示）
- 每个模型必须包含 `id`, `name`, `baseURL`, `apiKey` 四个字段

## 支持的 AI 提供商示例

### OpenAI
```json
{
  "id": "gpt-4",
  "name": "GPT-4",
  "baseURL": "https://api.openai.com/v1",
  "apiKey": "sk-xxx"
}
```

### Anthropic Claude
```json
{
  "id": "claude-3-5-sonnet-20241022",
  "name": "Claude 3.5 Sonnet",
  "baseURL": "https://api.anthropic.com/v1",
  "apiKey": "sk-ant-xxx"
}
```

### DeepSeek
```json
{
  "id": "deepseek-chat",
  "name": "DeepSeek Chat",
  "baseURL": "https://api.deepseek.com",
  "apiKey": "sk-xxx"
}
```

### 通义千问（Qwen）
```json
{
  "id": "qwen-plus",
  "name": "通义千问 Plus",
  "baseURL": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "apiKey": "sk-xxx"
}
```

### 本地 LLM (Ollama, LM Studio 等)
```json
{
  "id": "llama2",
  "name": "Llama 2 (本地)",
  "baseURL": "http://localhost:1234/v1",
  "apiKey": "not-needed"
}
```

## 使用方法

1. **配置环境变量**
   - 创建或编辑 `.env.local` 文件（开发环境）
   - 或编辑 `.env` 文件（Docker 部署）
   - 按照上述格式配置单个或多个模型

2. **启动应用**
   ```bash
   # 开发环境
   npm run dev

   # 或使用 Docker
   docker-compose up -d
   ```

3. **选择模型**
   - 打开应用后，在聊天面板标题下方会看到模型选择器
   - 点击下拉菜单选择要使用的模型
   - 选择后，后续的对话将使用选中的模型

## 模型选择器 UI

- **单个模型**: 只显示模型名称，不显示下拉菜单
- **多个模型**: 显示下拉选择器，可以切换不同的模型
- **显示信息**: 每个模型显示名称和 API 地址（不包含 API Key）

## Docker 部署配置

在 `docker-compose.yml` 中配置：

```yaml
services:
  ai-draw:
    environment:
      # 单一模型配置
      - AI_MODEL=gpt-4
      - CUSTOM_BASE_URL=https://api.openai.com/v1
      - CUSTOM_API_KEY=sk-xxx

      # 或者多模型配置
      - AI_MODELS=[{"id":"gpt-4","name":"GPT-4","baseURL":"https://api.openai.com/v1","apiKey":"sk-xxx"},{"id":"claude-3-5-sonnet-20241022","name":"Claude 3.5 Sonnet","baseURL":"https://api.anthropic.com/v1","apiKey":"sk-ant-xxx"}]
```

## 安全性说明

- API Key 只在服务端使用，不会发送到前端
- 前端只能看到模型的 `id`, `name`, `baseURL` 信息
- 所有 API 调用都在服务端进行，保护您的密钥安全

## 故障排除

### 模型列表为空
- 检查环境变量是否正确配置
- 确保 JSON 格式正确（使用在线 JSON 验证工具）
- 查看服务器日志获取详细错误信息

### 模型切换不生效
- 确保重启了应用（开发环境需要重启 `npm run dev`）
- 检查浏览器控制台是否有错误
- 验证 API Key 和 baseURL 是否正确

### API 调用失败
- 验证 API Key 是否有效
- 检查 baseURL 是否正确（注意末尾的 `/v1`）
- 确认模型 ID 与提供商要求一致

## 技术实现

本功能包含以下主要组件：

1. **环境变量解析** (`lib/ai-providers.ts`)
   - 支持两种配置格式
   - 自动验证模型配置

2. **模型列表 API** (`app/api/models/route.ts`)
   - 返回可用模型列表（不包含 API Key）

3. **模型选择器组件** (`components/model-selector.tsx`)
   - 自动获取可用模型
   - 提供友好的选择界面

4. **Chat API 集成** (`app/api/chat/route.ts`)
   - 接收模型选择参数
   - 使用指定模型处理请求

## 反馈与支持

如有问题或建议，请在 GitHub 提交 issue：
https://github.com/ikooky/ai-draw/issues
