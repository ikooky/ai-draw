# 多渠道 AI 模型支持配置指南

本项目现在支持通过原生 SDK 调用多种 AI 服务提供商的模型，包括 OpenAI、Claude (Anthropic) 和 Gemini (Google)。

## 支持的渠道

### 1. OpenAI 及兼容 API
- **Provider**: `@ai-sdk/openai`
- **支持的模型**: GPT-3.5, GPT-4, GPT-4o, DeepSeek, 以及其他 OpenAI 兼容的 API
- **工具调用**: ✅ 完全支持

### 2. Anthropic (Claude)
- **Provider**: `@ai-sdk/anthropic`
- **支持的模型**: Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku, Claude 3.5 等
- **工具调用**: ✅ 完全支持
- **自动检测**: 模型名称包含 `claude` 时自动使用

### 3. Google Generative AI (Gemini)
- **Provider**: `@ai-sdk/google`
- **支持的模型**: Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0 等
- **工具调用**: ✅ 完全支持
- **自动检测**: 模型名称包含 `gemini` 时自动使用

## 环境变量配置

在 `.env.local` 文件中配置以下变量：

```bash
# API 基础 URL（如果使用 New API 或其他中转服务）
CUSTOM_BASE_URL=https://api.your-service.com/v1

# API 密钥
CUSTOM_API_KEY=sk-your-api-key

# 默认模型（可选）
AI_MODEL=gpt-4
```

## 使用示例

### 配置 1: 使用 New API 中转服务

New API 支持将多种 AI 服务统一成兼容格式：

```bash
CUSTOM_BASE_URL=http://your-newapi-domain.com/v1
CUSTOM_API_KEY=sk-your-newapi-token
```

**可用模型示例**:
- `gpt-4` - 通过 OpenAI provider
- `claude-3-opus-20240229` - 自动使用 Anthropic provider
- `gemini-1.5-pro` - 自动使用 Google provider
- `deepseek-chat` - 通过 OpenAI 兼容 provider

### 配置 2: 直接使用 Anthropic API

```bash
CUSTOM_BASE_URL=https://api.anthropic.com/v1
CUSTOM_API_KEY=sk-ant-your-anthropic-key
AI_MODEL=claude-3-5-sonnet-20241022
```

### 配置 3: 直接使用 Google Gemini API

```bash
CUSTOM_BASE_URL=https://generativelanguage.googleapis.com/v1beta
CUSTOM_API_KEY=your-google-api-key
AI_MODEL=gemini-2.0-flash-exp
```

## Provider 自动检测逻辑

系统会根据模型名称自动选择正确的 provider：

```typescript
// 模型名称包含 "claude" → 使用 Anthropic provider
claude-3-opus, claude-3-5-sonnet → @ai-sdk/anthropic

// 模型名称包含 "gemini" → 使用 Google provider
gemini-1.5-pro, gemini-2.0-flash → @ai-sdk/google

// 其他模型 → 使用 OpenAI provider
gpt-4, gpt-3.5-turbo, deepseek-chat → @ai-sdk/openai
```

## 工具调用支持

所有三个 provider 都完全支持工具调用（Tool Calling / Function Calling）:

- ✅ **display_diagram**: 生成新图表
- ✅ **edit_diagram**: 编辑现有图表
- ✅ 流式输出工具参数
- ✅ 实时图表更新

## 特性对比

| 特性 | OpenAI | Anthropic (Claude) | Google (Gemini) |
|------|--------|-------------------|-----------------|
| 流式输出 | ✅ | ✅ | ✅ |
| 工具调用 | ✅ | ✅ | ✅ |
| 图片输入 | ✅ | ✅ | ✅ |
| 自定义 baseURL | ✅ | ✅ | ✅ |
| 思考动画 | ✅ | ✅ | ✅ |

## 故障排查

### 问题 1: 模型调用失败

**检查项**:
1. 确认 `CUSTOM_BASE_URL` 格式正确（以 `/v1` 结尾）
2. 确认 `CUSTOM_API_KEY` 有效
3. 查看控制台日志确认检测到的 provider

**日志示例**:
```
[AI Provider] Initializing model: claude-3-opus-20240229
[AI Provider] Detected provider: anthropic
[AI Provider] Using API at https://api.anthropic.com/v1
```

### 问题 2: 工具调用不生效

**原因**:
- 旧版本的检测逻辑可能误判某些模型不支持工具调用

**解决方案**:
- 更新到最新版本，新版本所有 provider 都支持工具调用

### 问题 3: Gemini 模型返回格式错误

**原因**:
- 可能使用了错误的 baseURL 格式

**解决方案**:
- Gemini 官方 API: `https://generativelanguage.googleapis.com/v1beta`
- 通过 New API: 使用配置的统一端点

## 高级配置

### 自定义 Headers

如需添加自定义请求头，修改 `lib/ai-providers.ts`:

```typescript
const anthropic = createAnthropic({
  baseURL,
  apiKey,
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

### 自定义 Fetch

用于代理或日志记录：

```typescript
const google = createGoogleGenerativeAI({
  baseURL,
  apiKey,
  fetch: async (url, options) => {
    console.log('Request:', url, options);
    return fetch(url, options);
  },
});
```

## 相关链接

- [Vercel AI SDK - Anthropic Provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic)
- [Vercel AI SDK - Google Generative AI Provider](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai)
- [New API 文档](https://docs.newapi.pro)
- [Anthropic API 文档](https://docs.anthropic.com)
- [Google Gemini API 文档](https://ai.google.dev/gemini-api/docs)
