import { ResumeData, Suggestion } from '../App';

export interface ChatResponse {
  message: string;
  suggestion?: Suggestion;
  step?: string;
  nextAction?: string;
}

export interface ChatRequest {
  message: string;
  resumeData: ResumeData;
  provider?: 'openai' | 'gemini' | 'claude';
  model?: string;
}

const API_BASE_URL = 'http://localhost:8080';

export class ApiService {
  static async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  static async getProviders(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/providers`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting providers:', error);
      throw error;
    }
  }

  static async getModels(provider: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/models?provider=${provider}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting models:', error);
      throw error;
    }
  }
}
