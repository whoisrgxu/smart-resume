import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AgentOrchestrator } from './agent.orchestrator';
import { LLMService } from '../llm/llm.service';
import { AgentState, AgentResponse } from './agent.types';

export interface AgentRequest {
  message: string;
  state: AgentState;
  provider?: 'openai' | 'gemini' | 'claude';
  model?: string;
}

@Controller('agent')
export class AgentController {
  constructor(
    private readonly agentOrchestrator: AgentOrchestrator,
    private readonly llmService: LLMService,
  ) {}

  @Post('chat')
  async chat(@Body() request: AgentRequest): Promise<AgentResponse> {
    return this.agentOrchestrator.processMessage(
      request.message, 
      request.state,
      request.provider || 'openai',
      request.model
    );
  }

  @Get('providers')
  getProviders(): string[] {
    return this.llmService.getAvailableProviders();
  }

  @Get('models')
  getModels(@Query('provider') provider: 'openai' | 'gemini' | 'claude'): string[] {
    return this.llmService.getAvailableModels(provider);
  }

  @Get('health')
  getHealth() {
    return { status: 'Agent orchestrator is running' };
  }
}
