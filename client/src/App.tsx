import React, { useState } from 'react';
import { ResumePreview } from './components/ResumePreview';
import { AIChat } from './components/AIChat';
import { FileUpload } from './components/FileUpload';
import { AgentState } from './lib/types';

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

export default function App() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null);
  const [isSuggestionApplied, setIsSuggestionApplied] = useState(false);
  const [agentState, setAgentState] = useState<AgentState | null>(null);

  // 🧩 Handle PDF upload
  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8080/pdf/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to parse PDF');

      const resumeData = await response.json();
      setResumeData(resumeData);

      // Initialize agent state
      const initialAgentState: AgentState = {
        resumeData,
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

      setAgentState(initialAgentState);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      alert('Failed to parse PDF. Please try again or use a different file.');
    }
  };

  // 🧩 Handle new suggestion from AI
  const handleSuggestion = (suggestion: Suggestion) => {
    setCurrentSuggestion(suggestion);
    setIsSuggestionApplied(false);
  };

  const handleAcceptSuggestion = () => {
    if (!currentSuggestion || !resumeData) return;
  
    const { originalValue, suggestedValue } = currentSuggestion;
    let { html, text } = resumeData;
  
    console.log('🟢 Accepting suggestion:', { originalValue, suggestedValue });
  
    // 1️⃣ Remove all tags — pure text for comparison
    const plainHtml = html
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '') // remove all tags including <strong>, <em>, etc.
      .replace(/\s+/g, ' ')
      .trim();
  
    const normalizedOriginal = originalValue.replace(/\s+/g, ' ').trim();
    const matchIndex = plainHtml.indexOf(normalizedOriginal);
  
    // 2️⃣ If not found → just append the suggestion
    if (matchIndex === -1) {
      console.warn('⚠️ No match found in plain text, appending at bottom.');
      html += `<div style="margin-top:6px;padding:6px;border-left:3px solid #22c55e;background:rgba(34,197,94,0.1);">${suggestedValue}</div>`;
      text += `\n${suggestedValue}`;
    } else {
      // 3️⃣ Simple replace — treat everything as text
      const red = `<span style="background:rgba(239,68,68,0.2);text-decoration:line-through;opacity:0.6;">${originalValue}</span>`;
      const green = `<div style="margin-top:4px;padding:4px;border-left:3px solid #22c55e;background:rgba(34,197,94,0.1);">${suggestedValue}</div>`;
  
      // 4️⃣ Remove formatting before replace
      const htmlWithoutTags = html.replace(/<\/?(strong|em|b|i|u)>/gi, '');
  
      // 5️⃣ Do a basic replacement (case-insensitive)
      const escapedOriginal = originalValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const simpleRegex = new RegExp(escapedOriginal, 'i');
      if (simpleRegex.test(htmlWithoutTags)) {
        html = htmlWithoutTags.replace(simpleRegex, `${red}${green}`);
      } else {
        // fallback append
        html += green;
      }
  
      // 6️⃣ Update text version too
      text = text.replace(simpleRegex, suggestedValue);
    }
  
    // 7️⃣ Save the updated resume data
    const updatedResumeData = { ...resumeData, html, text };
    setResumeData(updatedResumeData);
    setIsSuggestionApplied(true);
    setCurrentSuggestion(null);
  };
  



  // 🧩 Reject suggestion
  const handleRejectSuggestion = () => {
    setCurrentSuggestion(null);
    setIsSuggestionApplied(false);
  };

  // 🧩 Render UI
  return (
    <div className="min-h-screen bg-gray-50">
      {!resumeData ? (
        <div className="flex items-center justify-center min-h-screen">
          <FileUpload onFileUpload={handleFileUpload} />
        </div>
      ) : (
        <div className="flex h-screen">
          {/* LEFT: Resume Preview */}
          <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
            <ResumePreview
              key={isSuggestionApplied ? 'updated' : 'original'} // 👈 force re-render on update
              resumeData={resumeData}
              suggestion={currentSuggestion || undefined}
              isApplied={isSuggestionApplied}
            />
          </div>

          {/* RIGHT: Chat interface */}
          <div className="w-1/2 bg-gray-50 overflow-y-auto">
            <AIChat
              resumeData={resumeData}
              onSuggestion={handleSuggestion}
              onAcceptSuggestion={handleAcceptSuggestion}
              onRejectSuggestion={handleRejectSuggestion}
              currentSuggestion={currentSuggestion}
              agentState={agentState || undefined}
              onAgentStateUpdate={setAgentState}
            />
          </div>
        </div>
      )}
    </div>
  );
}
