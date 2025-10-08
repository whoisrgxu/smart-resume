import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './health/health.controller';
import { AppService } from './health/health.service';
import { CommonModule } from './common/openai.client';
import { AuthModule } from './auth/auth.module';
import { PdfModule } from './pdf/pdf.module';
import { AgentModule } from './agent/agent.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule, 
    AuthModule,
    PdfModule,
    AgentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
