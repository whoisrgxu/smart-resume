import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

export type LLMProvider = 'openai' | 'gemini' | 'claude';

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

@Injectable()
export class LLMService {
  private openai: OpenAI;
  private gemini: GoogleGenerativeAI;
  private claude: Anthropic;

  constructor(private configService: ConfigService) {
    // Initialize OpenAI
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY') || 'your-openai-key-here',
    });

    // Initialize Gemini
    this.gemini = new GoogleGenerativeAI(
      this.configService.get<string>('GEMINI_API_KEY') || 'your-gemini-key-here'
    );

    // Initialize Claude
    this.claude = new Anthropic({
      apiKey: this.configService.get<string>('CLAUDE_API_KEY') || 'your-claude-key-here',
    });
  }

  async generateResponse(
    messages: Array<{ role: string; content: string }>,
    provider: LLMProvider = 'openai',
    model?: string
  ): Promise<LLMResponse> {
    switch (provider) {
      case 'openai':
        return this.generateOpenAIResponse(messages, model);
      case 'gemini':
        return this.generateGeminiResponse(messages, model);
      case 'claude':
        return this.generateClaudeResponse(messages, model);
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  private async generateOpenAIResponse(
    messages: Array<{ role: string; content: string }>,
    model: string = 'gpt-4o'
  ): Promise<LLMResponse> {
    try {
      const isNewApiModel = /(gpt-4o|gpt-5)/i.test(model);
  
      console.log(`🟢 Calling OpenAI model: ${model} (${isNewApiModel ? 'Responses API' : 'Chat API'})`);
  
      // --- New Responses API path (GPT-5, GPT-5-mini, GPT-4o, etc.) ---
      if (isNewApiModel) {
        // Convert messages into a simple prompt string or keep chat history
        const system = messages.find((m) => m.role === 'system')?.content || '';
        const user = messages.filter((m) => m.role === 'user').map((m) => m.content).join('\n');
  
        const result = await this.openai.responses.create({
          model,
          input: system ? `${system}\n\n${user}` : user,
        });
  
        const content = result.output_text?.trim() || '';
  
        if (!content) throw new Error('No content returned from Responses API');
  
        return {
          content,
          usage: result.usage
            ? {
                promptTokens: result.usage.input_tokens ?? 0,
                completionTokens: result.usage.output_tokens ?? 0,
                totalTokens:
                  (result.usage.input_tokens ?? 0) +
                  (result.usage.output_tokens ?? 0),
              }
            : undefined,
        };
      }
  
      // --- Legacy Chat Completions path (GPT-3.5 / GPT-4 / GPT-4-Turbo) ---
      const completion = await this.openai.chat.completions.create({
        model,
        messages: messages as any, // ✅ fix TS type error
        temperature: 0.7,
        max_tokens: 1000,
      });      
  
      const response = completion.choices[0]?.message?.content ?? '';
      if (!response) throw new Error('No content returned from Chat API');
  
      return {
        content: response,
        usage: completion.usage
          ? {
              promptTokens: completion.usage.prompt_tokens,
              completionTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error: any) {
      console.error('🟥 OpenAI API error:', error.response?.data || error.message);
      throw new Error('Failed to generate response with OpenAI');
    }
  }
  
  

  private async generateGeminiResponse(
    messages: Array<{ role: string; content: string }>,
    model: string = 'gemini-2.5-flash'
  ): Promise<LLMResponse> {
    try {
      const genAI = this.gemini.getGenerativeModel({ model });
      
      // Convert messages to Gemini format
      const systemMessage = messages.find(m => m.role === 'system')?.content || '';
      const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
      const lastUserMessage = userMessages[userMessages.length - 1] || '';
      
      const prompt = systemMessage ? `${systemMessage}\n\n${lastUserMessage}` : lastUserMessage;
      
      const result = await genAI.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      return {
        content,
        usage: {
          promptTokens: 0, // Gemini doesn't provide detailed usage in free tier
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate response with Gemini');
    }
  }

  private async generateClaudeResponse(
    messages: Array<{ role: string; content: string }>,
    model: string = 'claude-3-sonnet-20240229'
  ): Promise<LLMResponse> {
    try {
      // Convert messages to Claude format
      const systemMessage = messages.find(m => m.role === 'system')?.content || '';
      const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
      const lastUserMessage = userMessages[userMessages.length - 1] || '';
      
      const message = await this.claude.messages.create({
        model,
        max_tokens: 1000,
        system: systemMessage,
        messages: [
          {
            role: 'user',
            content: lastUserMessage,
          },
        ],
      });

      const content = message.content[0]?.type === 'text' ? message.content[0].text : '';

      return {
        content,
        usage: {
          promptTokens: message.usage.input_tokens,
          completionTokens: message.usage.output_tokens,
          totalTokens: message.usage.input_tokens + message.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error('Failed to generate response with Claude');
    }
  }

  getAvailableModels(provider: LLMProvider): string[] {
    switch (provider) {
      case 'openai':
        return [
          'gpt-5-mini',
          'gpt-5',
          'gpt-4o',
          'gpt-4o-mini',
          'gpt-4-turbo',
          'gpt-4',
          'gpt-3.5-turbo',
          'gpt-3.5-turbo-16k'
        ];
      case 'gemini':
        return [
          'gemini-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro',
          'gemini-pro-vision',
        ];
      case 'claude':
        return [
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307',
        ];
      default:
        return [];
    }
  }

  getAvailableProviders(): LLMProvider[] {
    return ['openai', 'gemini', 'claude'];
  }
}
