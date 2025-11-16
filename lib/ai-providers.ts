import { createOpenAI } from '@ai-sdk/openai';

export type ProviderName = 'custom';

interface ModelConfig {
  model: any;
  providerOptions?: any;
}

export interface AIModelOption {
  id: string;
  name: string;
  baseURL: string;
  apiKey: string;
}

/**
 * Parse AI models from environment variables
 * Supports both single model (legacy) and multiple models configuration
 *
 * Single model format (legacy):
 * AI_MODEL=gpt-4
 * CUSTOM_BASE_URL=https://api.openai.com/v1
 * CUSTOM_API_KEY=sk-xxx
 *
 * Multiple models format (JSON):
 * AI_MODELS=[
 *   {"id":"gpt-4","name":"GPT-4","baseURL":"https://api.openai.com/v1","apiKey":"sk-xxx"},
 *   {"id":"claude-3","name":"Claude 3","baseURL":"https://api.anthropic.com/v1","apiKey":"sk-xxx"}
 * ]
 */
export function getAvailableModels(): AIModelOption[] {
  const modelsJson = process.env.AI_MODELS;

  // Check if multiple models are configured
  if (modelsJson) {
    try {
      const models = JSON.parse(modelsJson);
      if (Array.isArray(models) && models.length > 0) {
        // Validate each model has required fields
        const validModels = models.filter(m =>
          m.id && m.name && m.baseURL && m.apiKey
        );

        if (validModels.length > 0) {
          console.log(`[AI Provider] Found ${validModels.length} configured models`);
          return validModels;
        }
      }
    } catch (error) {
      console.error('[AI Provider] Failed to parse AI_MODELS:', error);
    }
  }

  // Fall back to legacy single model configuration
  const modelId = process.env.AI_MODEL;
  const baseURL = process.env.CUSTOM_BASE_URL;
  const apiKey = process.env.CUSTOM_API_KEY;

  if (modelId && baseURL && apiKey) {
    console.log(`[AI Provider] Using legacy single model configuration: ${modelId}`);
    return [{
      id: modelId,
      name: modelId,
      baseURL,
      apiKey
    }];
  }

  throw new Error(
    `No AI models configured. Please set either:\n` +
    `1. AI_MODELS (JSON array) for multiple models, or\n` +
    `2. AI_MODEL + CUSTOM_BASE_URL + CUSTOM_API_KEY for single model`
  );
}

/**
 * Get the AI model based on model ID
 * If no modelId is provided, returns the first available model
 */
export function getAIModel(modelId?: string): ModelConfig {
  const availableModels = getAvailableModels();

  // Find the requested model or use the first one
  const selectedModel = modelId
    ? availableModels.find(m => m.id === modelId)
    : availableModels[0];

  if (!selectedModel) {
    throw new Error(
      `Model "${modelId}" not found. Available models: ${availableModels.map(m => m.id).join(', ')}`
    );
  }

  // Log initialization for debugging
  console.log(`[AI Provider] Initializing model: ${selectedModel.name} (${selectedModel.id})`);
  console.log(`[AI Provider] Using API at ${selectedModel.baseURL}`);

  const customOpenAI = createOpenAI({
    baseURL: selectedModel.baseURL,
    apiKey: selectedModel.apiKey,
  });

  const model = customOpenAI(selectedModel.id);

  return { model, providerOptions: undefined };
}
