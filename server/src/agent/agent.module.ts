import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LLMModule } from '../llm/llm.module';
import { AgentOrchestrator } from './agent.orchestrator';
import { AgentController } from './agent.controller';

@Module({
  imports: [ConfigModule, LLMModule],
  controllers: [AgentController],
  providers: [AgentOrchestrator],
  exports: [AgentOrchestrator],
})
export class AgentModule {}
