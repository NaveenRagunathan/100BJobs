import { Mistral } from '@mistralai/mistralai';

class MistralClient {
  private client: any;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor() {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY environment variable is not set');
    }
    this.client = new Mistral({ apiKey });
  }

  async chat(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    maxTokens?: number;
  }): Promise<any> {
    let lastError;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.client.chat.complete({
          model: params.model,
          messages: params.messages as any,
          temperature: params.temperature || 0.7,
          max_tokens: params.maxTokens || 2000,
        });

        return response;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.status && error.status >= 400 && error.status < 500) {
          throw error;
        }

        // Wait before retrying
        if (attempt < this.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
        }
      }
    }

    throw new Error(`Failed after ${this.maxRetries} retries: ${lastError?.message || 'Unknown error'}`);
  }

  async chatStream(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    maxTokens?: number;
  }): Promise<AsyncIterable<any>> {
    const response = await this.client.chat.complete({
      model: params.model,
      messages: params.messages as any,
      temperature: params.temperature || 0.7,
      max_tokens: params.maxTokens || 2000,
      stream: true
    });

    return response;
  }
}

export const mistralClient = new MistralClient();
