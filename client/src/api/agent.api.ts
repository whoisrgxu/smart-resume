import { AgentState, AgentResponse } from '../lib/types';

export class AgentApiService {
  private static baseUrl = 'http://localhost:8080/agent';

  // 🔧 toggle this to test mock data instead of real API
  private static USE_MOCK = true;

  static async sendMessage(
    message: string,
    state: AgentState,
    provider?: 'openai' | 'gemini' | 'claude',
    model?: string
  ): Promise<AgentResponse> {
    // ✅ MOCK MODE
    if (this.USE_MOCK) {
      console.log('🧪 Using mock AI response for UI testing');

      // Example 1: Replace suggestion
      const mockReplace: AgentResponse = {
        message: JSON.stringify({
          message_to_user:
            "Let's refine your summary statement to highlight leadership and ownership.",
          next_action: 'wait',
          suggestions: [
            {
              type: 'replace_text',
              target: {
                section: 'summary',
                anchor: 'Professional Summary',
              },
              original:
                'Developed backend features on AWS using Lambda, API Gateway, and DynamoDB; containerized services with Docker to improve latency and deployment reliability.',
              replacement:
                'Backend engineer with 5+ years leading microservice architecture and mentoring junior developers.',
            },
          ],
        }),
        decision: {
          action: 'suggest',
          reasoning: 'Presenting improvement suggestions',
          nextStep: 'Wait for user feedback',
        },
        suggestions: [
          {
            id: 'mock-001',
            type: 'replace_text',
            field: 'summary',
            originalValue:
              'Developed backend features on AWS using Lambda, API Gateway, and DynamoDB; containerized services with Docker to improve latency and deployment reliability.',
            suggestedValue:
              'Backend engineer with 5+ years leading microservice architecture and mentoring junior developers.',
            anchor: 'Professional Summary',
            reasoning:
              'Model suggests refining summary to emphasize leadership and ownership.',
            status: 'pending',
          },
        ],
        state: {
          resumeData: {
            html: '<h2>Professional Summary</h2><p>Experienced software developer with 5 years in backend development.</p>',
            text: 'Professional Summary: Experienced software developer with 5 years in backend development.',
          },
          jobDescription:
            'Looking for a backend developer with experience leading architecture, mentoring team members, and driving code quality initiatives.',
          messages: [
            {
              role: 'user',
              content: 'Please analyze my resume.',
              timestamp: new Date().toISOString(),
            },
          ],
          appliedChanges: [],
          currentAnalysis: {
            step: 'suggesting',
            focus: 'summary',
            suggestions: [],
          },
          memory: {
            userPreferences: {},
            previousAnalyses: [],
          },
        },
      };

      // Example 2: Add bullet suggestion
      const mockAddBullet: AgentResponse = {
        message: JSON.stringify({
          message_to_user:
            "You're missing explicit cloud deployment experience. Let's add one bullet under your HOOP role.",
          next_action: 'wait',
          suggestions: [
            {
              type: 'add_bullet',
              target: {
                section: 'experience',
                anchor: 'Healthcare of Ontario Pension Plan',
              },
              original: null,
              replacement:
                'Deployed and monitored microservices using AWS ECS and CloudWatch to improve service reliability and performance.',
            },
          ],
        }),
        decision: {
          action: 'suggest',
          reasoning: 'Presenting improvement suggestions',
          nextStep: 'Wait for user feedback',
        },
        suggestions: [
          {
            id: 'mock-002',
            type: 'add_bullet',
            field: 'experience',
            originalValue: '',
            suggestedValue:
              'Deployed and monitored microservices using AWS ECS and CloudWatch to improve service reliability and performance.',
            anchor: 'Healthcare of Ontario Pension Plan',
            reasoning:
              'Model identified missing cloud deployment experience based on job description.',
            status: 'pending',
          },
        ],
        state: {
          resumeData: {
            html: '<h3>Healthcare of Ontario Pension Plan — Software Engineer</h3><ul><li>Developed backend APIs for pension data integration.</li></ul>',
            text: 'Healthcare of Ontario Pension Plan — Software Engineer | Systems Developer (Sep 2024 – Apr 2025)\n- Developed backend APIs for pension data integration.',
          },
          jobDescription:
            'Looking for a backend developer with experience deploying applications in cloud environments (AWS, Docker).',
          messages: [
            {
              role: 'user',
              content: 'Please check if my resume mentions cloud deployment.',
              timestamp: new Date().toISOString(),
            },
          ],
          appliedChanges: [],
          currentAnalysis: {
            step: 'suggesting',
            focus: 'experience',
            suggestions: [],
          },
          memory: {
            userPreferences: {},
            previousAnalyses: [],
          },
        },
      };

      // choose which mock to test
      const USE_REPLACE = true;
      return USE_REPLACE ? mockReplace : mockAddBullet;
    }

    // ✅ REAL API CALL
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, state, provider, model }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error sending message to agent:', error);
      throw error;
    }
  }

  // ✅ keep other endpoints unchanged
  static async getProviders(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/providers`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting providers:', error);
      throw error;
    }
  }

  static async getModels(provider: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models?provider=${provider}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting models:', error);
      throw error;
    }
  }

  static async getHealth(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await response.json();
    } catch (error) {
      console.error('Error checking agent health:', error);
      throw error;
    }
  }
}
