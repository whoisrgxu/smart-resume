export interface AgentState {
  // Resume data
  resumeData: {
    html: string;
    text: string;
  };

  // Job description
  jobDescription: string;

  // Conversation history
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;

  // Applied changes tracking
  appliedChanges: Array<{
    id: string;
    type: 'summary' | 'experience' | 'skills' | 'education';
    field: string;
    originalValue: string;
    appliedValue: string;
    timestamp: Date;
  }>;

  // Current analysis state
  currentAnalysis: {
    step:
      | 'initial'
      | 'analyzing'
      | 'suggesting'
      | 'waiting_feedback'
      | 'applying'
      | 'reanalyzing'
      | 'complete';
    focus: string; // What we're currently working on
    suggestions: Array<{
      id: string;
      type: 'summary' | 'experience' | 'skills' | 'education';
      field: string;
      originalValue: string;
      suggestedValue: string;
      reasoning: string;
      status: 'pending' | 'accepted' | 'rejected';
    }>;
  };

  // Agent memory
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
  suggestions?: Array<{
    id: string;
    type: 'summary' | 'experience' | 'skills' | 'education';
    field: string;
    originalValue: string;
    suggestedValue: string;
    reasoning: string;
  }>;
  state: AgentState;
}
