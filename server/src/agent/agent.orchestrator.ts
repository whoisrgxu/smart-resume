import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMService } from '../llm/llm.service';
import { AgentState, AgentDecision, AgentResponse } from './agent.types';

@Injectable()
export class AgentOrchestrator {
  constructor(
    private configService: ConfigService,
    private llmService: LLMService,
  ) {}

  // ✅ helper: find potentially weak bullet to guide replacements
  private findWeakResumeLine(resumeText: string, jd: string): string | null {
    if (!resumeText) return null;
    const lines = resumeText
      .split('\n')
      .filter((line) => line.trim().length > 20 && !line.startsWith('•'));

    // very simple heuristic: detect "responsible for", "helped", "worked"
    const weakLine = lines.find((line) =>
      /(responsible|helped|worked|involved|assisted)/i.test(line)
    );

    return weakLine || null;
  }

  private getInitialState(): AgentState {
    return {
      resumeData: { html: '', text: '' },
      jobDescription: '',
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
  }

  // ✅ main process
  async processMessage(
    userMessage: string,
    currentState: AgentState,
    provider: 'openai' | 'gemini' | 'claude' = 'openai',
    model?: string,
  ): Promise<AgentResponse> {
    try {
      // update conversation state
      const updatedState = {
        ...currentState,
        messages: [
          ...currentState.messages,
          {
            role: 'user' as const,
            content: userMessage,
            timestamp: new Date(),
          },
        ],
      };

      // inject focus hint to bias toward replacement when possible
      const focusSnippet = this.findWeakResumeLine(
        updatedState.resumeData.text,
        updatedState.jobDescription,
      );
      if (focusSnippet) {
        updatedState.currentAnalysis.focus = `Consider improving this existing line: "${focusSnippet}"`;
      } else if (!updatedState.currentAnalysis.focus) {
        updatedState.currentAnalysis.focus =
          'Focus on improving one weak or missing area of the resume.';
      }

      // build dynamic system prompt
      const systemPrompt = this.buildSystemPrompt(updatedState);
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ];

      // call LLM
      const response = await this.llmService.generateResponse(
        messages,
        provider,
        model,
      );

      // extract next decision
      const decision = this.extractDecisionFromState(updatedState);
      const suggestions = this.extractSuggestionsFromResponse(response.content);

      return {
        message: response.content,
        decision,
        suggestions,
        state: updatedState,
      };
    } catch (error) {
      console.error('Agent processing error:', error);
      throw new Error('Failed to process message with agent');
    }
  }

  // ✅ improved system prompt
  private buildSystemPrompt(state: AgentState): string {
    return `
You are a **smart iterative resume optimization agent**.
Your job is to help the user improve their resume step-by-step so that it aligns closely with a given job description.
Guide the user **one improvement at a time** — never list all issues at once.

---
### BEHAVIOR OVER MULTIPLE TURNS

- Step "analyze":
  - Examine the resume and job description.
  - Identify the **single highest-priority gap**.
  - Do NOT output multiple fixes; prepare to propose exactly one.
  - Set "next_action" = "suggest".

- Step "suggest":
  - Propose exactly ONE concrete, minimal-change fix for the current gap.
  - Then set "next_action" = "wait".

- Step "wait":
  - Do not propose new suggestions; wait for accept/reject/modify from the user.
  - If accepted → next_action = "apply".
  - If rejected → next_action = "reanalyze".

- Step "apply":
  - Apply the accepted change logically (this system will handle actual doc updates).
  - Then set "next_action" = "reanalyze".

- Step "reanalyze":
  - Re-evaluate the updated resume.
  - Pick the next highest-priority gap and continue the loop.
  - When no meaningful gaps remain → next_action = "complete".

- Step "complete":
  - Confirm optimization is done.

---
### DECISION HIERARCHY — CHOOSE THE BEST TYPE LOGICALLY

You must decide the suggestion "type" based on this ranked logic:

1. If the resume already **mentions** the required skill, experience, or topic but is weak, vague, or misaligned → use "replace_text".
   - Find that exact line or bullet and quote it under "original".
   - Provide the improved version under "replacement".

2. If the requirement is **not mentioned anywhere** → use "add_bullet".
   - Choose the most relevant "anchor" section to add it under (usually a role title or section heading).

3. If the job description requires a **whole section missing** → use "add_section".

Prefer improving existing content ("replace_text") whenever possible.
Only add new bullets when no suitable existing bullet covers the same concept.

---
### OUTPUT REQUIREMENTS

Return output **ONLY** as JSON (no prose, no headings), matching this shape:

{
  "message_to_user": "string",
  "next_action": "analyze" | "suggest" | "wait" | "apply" | "reanalyze" | "complete",
  "suggestions": [
    {
      "type": "replace_text" | "add_bullet" | "add_section",
      "target": {
        "section": "summary" | "experience" | "education" | "skills" | "projects",
        "anchor": "string"
      },
      "original": "string or null",
      "replacement": "string"
    }
  ]
}

Rules:
- Output strictly valid JSON.
- Only one suggestion per response.
- For "replace_text", "original" must be a **verbatim substring** of the resume.
- For "add_bullet" or "add_section", "original" = null.

---
### EXAMPLES

Example 1 — Replace weak existing line:
{
  "message_to_user": "Let's improve your summary statement to show leadership impact.",
  "next_action": "wait",
  "suggestions": [
    {
      "type": "replace_text",
      "target": { "section": "summary", "anchor": "Professional Summary" },
      "original": "Experienced software developer with 5 years in backend development.",
      "replacement": "Backend engineer with 5+ years leading microservice design and mentoring junior devs."
    }
  ]
}

Example 2 — Add missing bullet:
{
  "message_to_user": "You're missing explicit cloud deployment experience. Let's add one bullet under your HOOP role.",
  "next_action": "wait",
  "suggestions": [
    {
      "type": "add_bullet",
      "target": { "section": "experience", "anchor": "Healthcare of Ontario Pension Plan" },
      "original": null,
      "replacement": "Deployed and monitored microservices using AWS ECS and CloudWatch for performance tracking."
    }
  ]
}

Example 3 — Add missing section:
{
  "message_to_user": "Your resume doesn't list technical skills explicitly. Let's add a Skills section.",
  "next_action": "wait",
  "suggestions": [
    {
      "type": "add_section",
      "target": { "section": "skills", "anchor": "end_of_resume" },
      "original": null,
      "replacement": "Technical Skills: TypeScript, React, Node.js, AWS, Docker, Jest"
    }
  ]
}

---
### CONTEXT DATA

RESUME:
${state.resumeData.text || '(empty)'}

JOB DESCRIPTION:
${state.jobDescription || '(empty)'}

CONVERSATION HISTORY:
${state.messages.map((m) => `${m.role}: ${m.content}`).join('\n')}

APPLIED CHANGES:
${state.appliedChanges.map((c) => `${c.type}: ${c.originalValue} → ${c.appliedValue}`).join('\n')}

CURRENT STEP: ${state.currentAnalysis.step}
FOCUS: ${state.currentAnalysis.focus}
PENDING SUGGESTIONS: ${state.currentAnalysis.suggestions.filter((s) => s.status === 'pending').length}

Respond according to CURRENT STEP and the decision policy. Output JSON only.
`;
  }

  
  
  

  private extractStateFromResult(result: any): AgentState {
    // This would parse the LLM response to extract structured state
    // For now, return a basic state structure
    return {
      resumeData: { html: '', text: '' },
      jobDescription: '',
      messages: [],
      appliedChanges: [],
      currentAnalysis: {
        step: 'analyzing',
        focus: 'resume optimization',
        suggestions: [],
      },
      memory: {
        userPreferences: {},
        previousAnalyses: [],
      },
    };
  }

  private extractDecisionFromState(state: AgentState): AgentDecision {
    const analysis = state.currentAnalysis;
    
    switch (analysis.step) {
      case 'analyzing':
        return {
          action: 'analyze',
          reasoning: 'Analyzing resume against job description',
          nextStep: 'Generate targeted suggestions',
        };
      case 'suggesting':
        return {
          action: 'suggest',
          reasoning: 'Presenting improvement suggestions',
          nextStep: 'Wait for user feedback',
        };
      case 'waiting_feedback':
        return {
          action: 'wait',
          reasoning: 'Waiting for user decision on suggestions',
          nextStep: 'Process user feedback',
        };
      case 'applying':
        return {
          action: 'apply',
          reasoning: 'Applying accepted changes to resume',
          nextStep: 'Re-analyze updated resume',
        };
      case 'reanalyzing':
        return {
          action: 'reanalyze',
          reasoning: 'Re-analyzing resume after changes',
          nextStep: 'Identify next improvement opportunities',
        };
      case 'complete':
        return {
          action: 'complete',
          reasoning: 'Resume optimization complete',
          nextStep: 'Final review and recommendations',
        };
      default:
        return {
          action: 'analyze',
          reasoning: 'Starting resume analysis',
          nextStep: 'Begin optimization process',
        };
    }
  }

  private extractSuggestionsFromResponse(response: string): any[] {
    console.log('🟨 Raw LLM response:', response);
  
    // Try parsing as JSON (for structured responses)
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed?.suggestions)) {
        console.log('Parsed structured suggestions:', parsed.suggestions.length);
        return parsed.suggestions.map((s: any) => ({
          id: Date.now().toString(),
          type: s.type || 'experience',
          field: s.target?.section || 'experience',
          originalValue: s.original ?? '',
          suggestedValue: s.replacement ?? '',
          anchor: s.target?.anchor ?? '',
          reasoning: s.reasoning || 'Model-provided structured suggestion',
          status: 'pending',
        }));
      }
    } catch (_) {
      console.log('⚠️ Response not valid JSON, falling back to regex parsing.');
    }
  
    // --- Fallback to regex parsing ---
    const normalized = response
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .trim();
  
    const suggestions: any[] = [];
  
    // 1️⃣ Match “Add this bullet point: "…”” or “under the … role:”
    const bulletRegex =
      /add this bullet point(?:[^:]*):\s*"([^"]+)"/i;
    const bulletMatch = normalized.match(bulletRegex);
    if (bulletMatch) {
      const suggestedText = bulletMatch[1];
      const anchorMatch = normalized.match(/under the\s+(.+?)\s+role/i);
      suggestions.push({
        id: Date.now().toString(),
        type: 'experience',
        field: 'experience',
        originalValue: 'Add new bullet point',
        suggestedValue: suggestedText,
        anchor: anchorMatch?.[1] ?? '',
        reasoning: 'Bullet addition extracted from assistant message',
        status: 'pending',
      });
    }
  
    // 2️⃣ Match “Replace 'X' with 'Y'”
    const replaceRegex =
      /replace\s+["']([^"']+)["']\s+with\s+["']([^"']+)["']/i;
    const rep = normalized.match(replaceRegex);
    if (rep) {
      suggestions.push({
        id: (Date.now() + 1).toString(),
        type: 'personal',
        field: 'summary',
        originalValue: rep[1],
        suggestedValue: rep[2],
        reasoning: 'Replacement extracted from assistant message',
        status: 'pending',
      });
    }
  
    // 3️⃣ Heuristic fallback if no structured match but strong signals
    if (!suggestions.length && /leadership|mentor|code review/i.test(normalized)) {
      suggestions.push({
        id: (Date.now() + 2).toString(),
        type: 'experience',
        field: 'experience',
        originalValue: 'Current experience section',
        suggestedValue: 'Add leadership and mentoring examples to experience section',
        reasoning: 'Heuristic: JD emphasizes leadership/mentoring',
        status: 'pending',
      });
    }
  
    console.log('🟢 Extracted suggestions (fallback):', suggestions);
    return suggestions;
  }
  

  private formatResponse(state: AgentState, decision: AgentDecision): string {
    const analysis = state.currentAnalysis;
    
    switch (analysis.step) {
      case 'analyzing':
        return `I'm analyzing your resume against the job description to identify improvement opportunities...`;
      case 'suggesting':
        return `Based on my analysis, I have specific suggestions to improve your resume. Let me present them one at a time.`;
      case 'waiting_feedback':
        return `I'm waiting for your feedback on the suggestions I've provided.`;
      case 'applying':
        return `I'm applying the changes you've accepted to your resume...`;
      case 'reanalyzing':
        return `I'm re-analyzing your updated resume to identify any remaining improvement opportunities...`;
      case 'complete':
        return `Your resume optimization is complete! The resume is now well-aligned with the job requirements.`;
      default:
        return `I'm starting the resume optimization process. Let me analyze your resume and the job description...`;
    }
  }
}
