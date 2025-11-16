import { createOpenAI } from '@ai-sdk/openai';

export type ProviderName = 'custom';

interface ModelConfig {
  model: any;
  providerOptions?: any;
}

/**
 * 获取配置的 API 信息
 */
export function getAPIConfig() {
  const baseURL = process.env.CUSTOM_BASE_URL;
  const apiKey = process.env.CUSTOM_API_KEY;

  if (!baseURL) {
    throw new Error(
      `CUSTOM_BASE_URL environment variable is required. ` +
      `Please set it in your .env.local file.`
    );
  }

  if (!apiKey) {
    throw new Error(
      `CUSTOM_API_KEY environment variable is required. ` +
      `Please set it in your .env.local file.`
    );
  }

  return { baseURL, apiKey };
}

/**
 * 从 OpenAI 兼容 API 获取可用模型列表
 */
export async function fetchAvailableModels(): Promise<Array<{ id: string; name: string }>> {
  const { baseURL, apiKey } = getAPIConfig();

  try {
    // 调用 /models 端点获取模型列表
    const modelsEndpoint = `${baseURL}/models`;
    console.log(`[AI Provider] Fetching models from ${modelsEndpoint}`);

    const response = await fetch(modelsEndpoint, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // OpenAI API 格式: { "data": [{ "id": "model-id", ... }] }
    if (data.data && Array.isArray(data.data)) {
      const models = data.data.map((model: any) => ({
        id: model.id,
        name: model.id, // 使用 ID 作为显示名称
      }));

      console.log(`[AI Provider] Found ${models.length} models`);
      return models;
    }

    // 如果格式不符合预期，返回空数组
    console.warn('[AI Provider] Unexpected API response format:', data);
    return [];
  } catch (error) {
    console.error('[AI Provider] Error fetching models:', error);
    // 如果获取失败，返回默认模型（从环境变量）
    const defaultModel = process.env.AI_MODEL || 'gpt-3.5-turbo';
    console.log(`[AI Provider] Using fallback model: ${defaultModel}`);
    return [{ id: defaultModel, name: defaultModel }];
  }
}

/**
 * 根据模型 ID 获取 AI 模型实例
 * @param modelId 模型 ID，如果不提供则使用环境变量中的默认模型
 */
export function getAIModel(modelId?: string): ModelConfig {
  const { baseURL, apiKey } = getAPIConfig();

  // 如果没有指定模型 ID，使用环境变量中的默认模型
  const selectedModelId = modelId || process.env.AI_MODEL || 'gpt-3.5-turbo';

  console.log(`[AI Provider] Initializing model: ${selectedModelId}`);
  console.log(`[AI Provider] Using API at ${baseURL}`);

  const customOpenAI = createOpenAI({
    baseURL,
    apiKey,
  });

  const model = customOpenAI(selectedModelId);

  return { model, providerOptions: undefined };
}
