import { fetchAvailableModels, getAPIConfig } from '@/lib/ai-providers';

/**
 * GET /api/models
 * 从配置的 OpenAI 兼容 API 获取可用模型列表
 */
export async function GET() {
  try {
    // 从 API 获取模型列表
    const models = await fetchAvailableModels();

    // 获取 base URL 用于显示
    const { baseURL } = getAPIConfig();

    // 返回模型列表（不包含 API Key）
    return Response.json({
      models: models.map(model => ({
        ...model,
        baseURL, // 添加 baseURL 用于 UI 显示
      }))
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
