import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMService, LLMProvider } from '../llm/llm.service';

export interface ResumeData {
  html: string;
  text: string;
}

export interface Suggestion {
  id: string;
  type: 'personal' | 'experience' | 'education' | 'skills';
  field: string;
  originalValue: string;
  suggestedValue: string;
  reasoning: string;
}

export interface ChatResponse {
  message: string;
  suggestion?: Suggestion;
  step?: string;
  nextAction?: string;
}

@Injectable()
export class AiService {
  constructor(
    private configService: ConfigService,
    private llmService: LLMService,
  ) {}

  async generateSuggestion(
    userMessage: string,
    resumeData: ResumeData,
    provider: LLMProvider = 'openai',
    model?: string,
  ): Promise<ChatResponse> {
    try {
      const prompt = this.buildPrompt(userMessage, resumeData);

      const messages = [
        {
          role: 'system',
          content: `You are an expert resume consultant and career coach. You have access to the user's uploaded resume and will analyze it against their target job description to provide targeted, step-by-step improvements.

            Your process:
            1. ANALYZE the uploaded resume content against the job description
            2. IDENTIFY specific content gaps, missing keywords, or areas for improvement
            3. GUIDE the user through ONE specific content improvement at a time
            4. WAIT for user feedback (apply/reject) before moving to the next area
            5. ITERATE until that area is optimized, then move to the next

            IMPORTANT: Focus on CONTENT improvements, not formatting issues. Ignore dates, formatting, or structural issues.

            RESPONSE FORMAT: Respond with natural, conversational language. Be helpful and specific. When you have a suggestion, be explicit about it by saying "Here's my suggestion:" or "I recommend modifying your [section]:" and provide specific before/after examples.

            Focus areas to work through systematically:
            - Analyze resume content against job description
            - Optimize professional summary content for the role
            - Improve job descriptions with relevant keywords and achievements
            - Align skills section with job requirements
            - Identify missing quantifiable achievements
            - Final content optimization and review

            Be conversational, specific, and focus on ONE content improvement at a time. Reference specific parts of their resume content and the job description.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      const response = await this.llmService.generateResponse(
        messages,
        provider,
        model,
      );

      // Extract suggestion from natural language response
      const suggestion = this.extractSuggestionFromResponse(response.content);

      return {
        message: response.content,
        step: 'analyze_job_fit',
        nextAction: 'Please provide feedback on the analysis',
        suggestion: suggestion,
      };
    } catch (error) {
      console.error('Error generating AI suggestion:', error);

      // Return a simple error response
      return {
        message:
          "I apologize, but I'm having trouble processing your request right now. Please try again or check your connection.",
        step: 'error',
        nextAction: 'Please try your request again',
      };
    }
  }

  private buildPrompt(userMessage: string, resumeData: ResumeData): string {
    return `
User's request: "${userMessage}"

Current resume data (HTML content):
${resumeData.html}

Resume text content:
${resumeData.text}

Please analyze the uploaded resume against the job description and provide targeted, step-by-step guidance to help the user improve their resume alignment with the target role.
    `.trim();
  }

  private extractSuggestionFromResponse(
    response: string,
  ): Suggestion | undefined {
    console.log('Extracting suggestion from response:', response);

    // Look for patterns that indicate a suggestion is being made
    const hasSuggestion =
      response.toLowerCase().includes('suggestion') ||
      response.toLowerCase().includes("here's my suggestion") ||
      response.toLowerCase().includes('modify your') ||
      response.toLowerCase().includes('change your') ||
      response.toLowerCase().includes('update your') ||
      response.toLowerCase().includes("here's my suggestion") ||
      response.toLowerCase().includes('i recommend') ||
      response.toLowerCase().includes('you could change') ||
      response.toLowerCase().includes('for example');

    console.log('Has suggestion:', hasSuggestion);

    if (!hasSuggestion) {
      return undefined;
    }

    // Extract original and suggested text from the response
    const originalMatch =
      response.match(/\*\*Current Summary:\*\*\s*>\s*([^<]+)/i) ||
      response.match(/current summary[^"]*"([^"]+)"/i) ||
      response.match(/your current summary[^"]*"([^"]+)"/i) ||
      response.match(/your summary[^"]*"([^"]+)"/i);

    const suggestedMatch =
      response.match(/\*\*Proposed Summary:\*\*\s*>\s*([^<]+)/i) ||
      response.match(/proposed summary[^"]*"([^"]+)"/i) ||
      response.match(/suggested summary[^"]*"([^"]+)"/i) ||
      response.match(/here's my suggestion[^"]*"([^"]+)"/i) ||
      response.match(/change your summary to[^"]*"([^"]+)"/i) ||
      response.match(/modify your summary[^"]*"([^"]+)"/i) ||
      response.match(/you could change[^"]*"([^"]+)"/i);

    console.log('Original match:', originalMatch);
    console.log('Suggested match:', suggestedMatch);

    if (originalMatch && suggestedMatch) {
      const suggestion = {
        id: Date.now().toString(),
        type: 'personal' as const,
        field: 'summary',
        originalValue: originalMatch[1].trim(),
        suggestedValue: suggestedMatch[1].trim(),
        reasoning:
          'This improvement better aligns with the job requirements by highlighting leadership and collaboration skills.',
      };
      console.log('Created suggestion:', suggestion);
      return suggestion;
    }


    // Try to extract from example format: "For example, you could change your summary to something like this:"
    const exampleMatch = response.match(/for example[^"]*"([^"]+)"/i);
    if (exampleMatch) {
      return {
        id: Date.now().toString(),
        type: 'personal' as const,
        field: 'summary',
        originalValue: 'Current summary from your resume',
        suggestedValue: exampleMatch[1],
        reasoning:
          'This improvement better aligns with the job requirements by highlighting leadership and collaboration skills.',
      };
    }

    // Fallback: create a generic suggestion based on common patterns
    if (response.toLowerCase().includes('summary')) {
      const fallbackSuggestion = {
        id: Date.now().toString(),
        type: 'personal' as const,
        field: 'summary',
        originalValue: 'Current summary from your resume',
        suggestedValue:
          'Enhanced summary with leadership and collaboration focus',
        reasoning:
          'The job description emphasizes leadership and collaboration skills that should be highlighted in your summary.',
      };
      console.log('Created fallback suggestion:', fallbackSuggestion);
      return fallbackSuggestion;
    }

    return undefined;
  }
}
