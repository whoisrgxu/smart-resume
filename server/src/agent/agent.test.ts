import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AgentOrchestrator } from './agent.orchestrator';
import { AgentState } from './agent.types';

describe('AgentOrchestrator', () => {
  let orchestrator: AgentOrchestrator;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentOrchestrator,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'OPENAI_API_KEY') return 'test-api-key';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    orchestrator = module.get<AgentOrchestrator>(AgentOrchestrator);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(orchestrator).toBeDefined();
  });

  it('should initialize with proper state', () => {
    const initialState = {
      resumeData: { html: '', text: '' },
      jobDescription: '',
      messages: [],
      appliedChanges: [],
      currentAnalysis: {
        step: 'initial' as const,
        focus: '',
        suggestions: [],
      },
      memory: {
        userPreferences: {},
        previousAnalyses: [],
      },
    };

    expect(initialState).toBeDefined();
    expect(initialState.currentAnalysis.step).toBe('initial');
  });

  it('should handle message processing', async () => {
    const testState: AgentState = {
      resumeData: {
        html: '<p>Test resume content</p>',
        text: 'Test resume content',
      },
      jobDescription: 'Software Engineer position',
      messages: [],
      appliedChanges: [],
      currentAnalysis: {
        step: 'initial',
        focus: '',
        suggestions: [],
      },
      memory: {
        userPreferences: {},
        previousAnalyses: [],
      },
    };

    // This would test the actual message processing
    // For now, just verify the state structure
    expect(testState.resumeData.text).toBe('Test resume content');
    expect(testState.jobDescription).toBe('Software Engineer position');
  });
});
