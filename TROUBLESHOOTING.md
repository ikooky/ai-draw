# 故障排除指南

## 常见问题及解决方案

### 1. XML 解析错误："非绘图文件 (error on line X at column Y: xmlParseEntityRef: no name)"

#### 问题原因
这个错误通常由以下原因引起：
1. 环境变量中的 JSON 配置包含了特殊字符（如 `&`）但没有正确转义
2. 环境变量的 JSON 格式不正确
3. Draw.io 尝试加载初始图表时失败

#### 解决方案

**方案 1: 检查环境变量配置**

确保你的 `.env.local` 或 `.env` 文件格式正确：

```bash
# 正确的单一模型配置
AI_MODEL=gpt-4
CUSTOM_BASE_URL=http://localhost:1234/v1
CUSTOM_API_KEY=your-api-key

# 如果 API Key 或 URL 中包含特殊字符，不要使用引号
# 错误示例：
# CUSTOM_API_KEY="sk-xxx&yyy"  # ❌ 不要使用引号

# 正确示例：
# CUSTOM_API_KEY=sk-xxx-yyy    # ✅ 直接写值
```

**方案 2: 多模型配置的正确格式**

如果使用多模型配置，确保 JSON 格式正确：

```bash
# 注意：
# 1. 整个 JSON 字符串用单引号包裹
# 2. JSON 内部的字符串用双引号
# 3. 不能有换行（必须在一行内）
# 4. 避免在 URL 或 Key 中使用特殊字符 &, <, >, 等

# 正确格式：
AI_MODELS='[{"id":"gpt-4","name":"GPT-4","baseURL":"http://localhost:1234/v1","apiKey":"sk-xxx"}]'

# 如果 API Key 中包含 & 符号，需要使用 %26 替代：
# 错误：apiKey":"sk-xxx&yyy"
# 正确：apiKey":"sk-xxx%26yyy"
```

**方案 3: 清除浏览器缓存和本地存储**

有时候错误是由于浏览器缓存的旧数据导致的：

1. 打开浏览器开发者工具（F12）
2. 进入 Application 或 Storage 标签
3. 清除 Local Storage
4. 清除 Session Storage
5. 刷新页面（Ctrl+F5 或 Cmd+Shift+R）

**方案 4: 检查环境变量是否正确加载**

创建一个测试 API 端点来检查环境变量：

```bash
# 临时添加调试日志
# 在开发环境中运行：
npm run dev

# 然后访问浏览器控制台，查看启动日志
# 应该能看到：[AI Provider] Initializing model: ...
```

**方案 5: 使用最简单的配置测试**

如果问题持续，先使用最简单的配置测试：

1. 删除现有的 `.env.local` 文件
2. 创建新的 `.env.local` 文件，只包含：
   ```bash
   AI_MODEL=test-model
   CUSTOM_BASE_URL=http://localhost:1234/v1
   CUSTOM_API_KEY=test-key
   ```
3. 重启应用
4. 如果错误消失，逐步添加真实配置

**方案 6: 检查 Docker 环境变量**

如果使用 Docker，检查 `docker-compose.yml` 中的环境变量：

```yaml
services:
  ai-draw:
    environment:
      # 避免使用引号包裹值
      - AI_MODEL=gpt-4
      - CUSTOM_BASE_URL=http://localhost:1234/v1
      - CUSTOM_API_KEY=sk-xxx

      # 如果值中包含特殊字符，使用引号，但要注意转义
      # - CUSTOM_API_KEY="sk-xxx"  # 如果值中没有特殊字符
```

#### 调试步骤

1. **检查环境变量文件**
   ```bash
   cat .env.local
   # 确保没有多余的空格、换行或特殊字符
   ```

2. **验证 JSON 格式**（如果使用多模型配置）
   ```bash
   # 提取 AI_MODELS 的值并验证
   echo $AI_MODELS | python3 -m json.tool
   # 或使用在线 JSON 验证工具
   ```

3. **查看应用日志**
   ```bash
   # 开发环境
   npm run dev

   # Docker 环境
   docker-compose logs -f ai-draw
   ```

4. **检查浏览器控制台**
   - 打开浏览器开发者工具（F12）
   - 查看 Console 标签的错误信息
   - 查看 Network 标签的 API 请求响应

### 2. 模型列表为空或加载失败

#### 解决方案

1. 确保至少配置了一个模型
2. 检查环境变量文件的权限
3. 重启应用以重新加载环境变量
4. 检查 `/api/models` 端点的响应：
   ```bash
   curl http://localhost:3000/api/models
   # 或在浏览器中访问 http://localhost:3000/api/models
   ```

### 3. 模型切换后不生效

#### 解决方案

1. 检查网络请求是否成功（浏览器开发者工具 → Network）
2. 确认 `/api/chat` 请求中包含了 `modelId` 参数
3. 查看服务器日志确认使用了正确的模型

### 4. API 调用失败

#### 解决方案

1. 验证 API Key 是否正确
2. 检查 baseURL 格式（确保末尾有 `/v1`）
3. 确认模型 ID 与 API 提供商要求一致
4. 检查网络连接和防火墙设置
5. 查看 API 提供商的使用限制和配额

## 获取帮助

如果以上方案都无法解决问题，请：

1. 收集以下信息：
   - 完整的错误消息
   - 浏览器控制台日志
   - 服务器日志（如果可用）
   - 环境变量配置（隐藏 API Key）

2. 在 GitHub 提交 Issue：
   https://github.com/ikooky/ai-draw/issues

3. 包含以下内容：
   - 问题描述
   - 重现步骤
   - 预期行为
   - 实际行为
   - 环境信息（操作系统、浏览器、Node.js 版本等）
