import React from 'react';
import { ResumeData } from '../App';

interface Suggestion {
  id: string;
  type: 'personal' | 'experience' | 'education' | 'skills';
  field: string;
  originalValue: string;
  suggestedValue: string;
  reasoning: string;
}

interface ResumePreviewProps {
  resumeData: ResumeData;
  suggestion?: Suggestion;
  isApplied?: boolean;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ 
  resumeData, 
  suggestion, 
  isApplied = false 
}) => {
  const normalizeText = (text: string) => {
    return text
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/[^\w\s.,!?]/g, '')  // Remove special characters except basic punctuation
      .trim()
      .toLowerCase();
  };

  const highlightText = (
    html: string,
    original: string,
    suggested: string,
    isApplied: boolean
  ) => {
    if (!original?.trim()) return html;
  
    const normalize = (txt: string) =>
      txt
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s.,;:!?-]/g, '')
        .trim()
        .toLowerCase();
  
    const normalizedHtml = normalize(html);
    const normalizedOriginal = normalize(original);
  
    const startIdx = normalizedHtml.indexOf(normalizedOriginal);
    if (startIdx === -1) {
      console.warn('⚠️ No match found for normalized original text');
      return html;
    }
  
    // Remove inline formatting tags before comparing
    const htmlWithoutInlineTags = html.replace(/<\/?(strong|b|em|i|u)>/gi, '');
  
    const highlightStyle = isApplied
      ? 'background-color: rgba(239, 68, 68, 0.2); text-decoration: line-through; opacity: 0.6;'
      : 'background-color: rgba(239, 68, 68, 0.3); border: 1px solid #ef4444; padding: 2px 4px; border-radius: 3px;';
  
    const suggestionStyle =
      'margin-top: 6px; margin-bottom: 6px; ';
    const suggestionSpan =
      `<div style="${suggestionStyle}">` +
      `<span style="background-color: rgba(34,197,94,0.2); border: 1px solid #22c55e; padding: 2px 4px; border-radius: 3px;">` +
      suggested +
      `</span></div>`;
  
    // Escape regex special chars in original
    const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
    // Try literal match first
    let highlightedHtml = htmlWithoutInlineTags.replace(
      new RegExp(escapedOriginal, 'gi'),
      (match) => `<span style="${highlightStyle}">${match}</span>${suggestionSpan}`
    );
  
    // If literal match fails, try whitespace-flexible version
    if (highlightedHtml === htmlWithoutInlineTags) {
      const flexibleRegex = new RegExp(
        original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'),
        'gi'
      );
      highlightedHtml = htmlWithoutInlineTags.replace(
        flexibleRegex,
        (match) => `<span style="${highlightStyle}">${match}</span>${suggestionSpan}`
      );
    }
  
    // If still no match, just append suggestion at the end as fallback
    if (highlightedHtml === htmlWithoutInlineTags) {
      highlightedHtml += suggestionSpan;
    }
  
    return highlightedHtml;
  };
  

  

  const displayHtml = suggestion 
    ? highlightText(resumeData.html, suggestion.originalValue, suggestion.suggestedValue, isApplied)
    : resumeData.html;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      <div 
        className="resume-preview"
        dangerouslySetInnerHTML={{ __html: displayHtml }}
      />
      {suggestion && !isApplied && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>💡 Suggestion:</strong> {suggestion.reasoning}
          </div>
        </div>
      )}
    </div>
  );
};