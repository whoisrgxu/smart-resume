import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AiService, ResumeData, ChatResponse } from './ai.service';
import { LLMService } from '../llm/llm.service';
import type { LLMProvider } from '../llm/llm.service';

export class ChatRequest {
  message: string;
  resumeData: ResumeData;
  provider?: LLMProvider;
  model?: string;
}

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly llmService: LLMService,
  ) {}

  @Post('chat')
  async chat(@Body() chatRequest: ChatRequest): Promise<ChatResponse> {
    return this.aiService.generateSuggestion(
      chatRequest.message,
      chatRequest.resumeData,
      chatRequest.provider,
      chatRequest.model,
    );
  }

  @Get('providers')
  getProviders(): LLMProvider[] {
    return this.llmService.getAvailableProviders();
  }

  @Get('models')
  getModels(@Query('provider') provider: LLMProvider): string[] {
    return this.llmService.getAvailableModels(provider);
  }
}
