import { createOpenAI } from '@ai-sdk/openai';

export type ProviderName = 'custom';

interface ModelConfig {
  model: any;
  providerOptions?: any;
}

/**
 * Validate that required API keys are present
 */
function validateProviderCredentials(): void {
  if (!process.env.CUSTOM_API_KEY) {
    throw new Error(
      `CUSTOM_API_KEY environment variable is required. ` +
      `Please set it in your .env.local file.`
    );
  }

  if (!process.env.CUSTOM_BASE_URL) {
    throw new Error(
      `CUSTOM_BASE_URL environment variable is required. ` +
      `Please set it in your .env.local file.`
    );
  }
}

/**
 * Get the AI model based on environment variables
 *
 * Environment variables:
 * - CUSTOM_BASE_URL: Custom OpenAI-compatible API base URL
 * - CUSTOM_API_KEY: Custom API key
 * - AI_MODEL: The model ID/name (e.g., gpt-4, claude-3-sonnet, etc.)
 */
export function getAIModel(): ModelConfig {
  const modelId = process.env.AI_MODEL;

  if (!modelId) {
    throw new Error(
      `AI_MODEL environment variable is required. Example: AI_MODEL=gpt-4`
    );
  }

  // Validate provider credentials
  validateProviderCredentials();

  // Log initialization for debugging
  console.log(`[AI Provider] Initializing custom API with model: ${modelId}`);
  console.log(`[AI Provider] Using custom OpenAI-compatible API at ${process.env.CUSTOM_BASE_URL}`);

  const customOpenAI = createOpenAI({
    baseURL: process.env.CUSTOM_BASE_URL,
    apiKey: process.env.CUSTOM_API_KEY,
  });

  const model = customOpenAI(modelId);

  return { model, providerOptions: undefined };
}
