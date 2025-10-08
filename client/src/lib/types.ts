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
  status?: 'pending' | 'accepted' | 'rejected';
}

export interface ChatResponse {
  message: string;
  suggestion?: Suggestion;
  step?: string;
  nextAction?: string;
}

export interface ChatRequest {
  message: string;
  resumeData: ResumeData;
  provider?: string;
  model?: string;
}

// Agent types
export interface AgentState {
  resumeData: {
    html: string;
    text: string;
  };
  jobDescription: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
  appliedChanges: Array<{
    id: string;
    type: 'summary' | 'experience' | 'skills' | 'education';
    field: string;
    originalValue: string;
    appliedValue: string;
    timestamp: Date;
  }>;
  currentAnalysis: {
    step: 'initial' | 'analyzing' | 'suggesting' | 'waiting_feedback' | 'applying' | 'reanalyzing' | 'complete';
    focus: string;
    suggestions: Suggestion[];
  };
  memory: {
    userPreferences: Record<string, any>;
    previousAnalyses: Array<{
      timestamp: Date;
      focus: string;
      suggestions: any[];
      outcomes: any[];
    }>;
  };
}

export interface AgentDecision {
  action: 'analyze' | 'suggest' | 'apply' | 'reanalyze' | 'wait' | 'complete';
  focus?: string;
  reasoning: string;
  nextStep?: string;
}

export interface AgentResponse {
  message: string;
  decision: AgentDecision;
  suggestions?: Suggestion[];
  state: AgentState;
}
