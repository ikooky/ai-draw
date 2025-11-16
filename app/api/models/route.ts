import { getAvailableModels } from '@/lib/ai-providers';

/**
 * GET /api/models
 * Returns the list of available AI models
 */
export async function GET() {
  try {
    const models = getAvailableModels();

    // Return models without exposing API keys
    const safeModels = models.map(({ id, name, baseURL }) => ({
      id,
      name,
      baseURL
    }));

    return Response.json({ models: safeModels });
  } catch (error) {
    console.error('Error fetching models:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
