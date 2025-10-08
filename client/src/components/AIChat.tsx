import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ResumeData, Suggestion } from '../App';
import { ApiService } from '../api/api';
import { AgentApiService } from '../api/agent.api';
import { AgentState, AgentResponse } from '../lib/types';
import { LLMSelector } from './LLMSelector';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  resumeData: ResumeData;
  onSuggestion: (suggestion: Suggestion) => void;
  onAcceptSuggestion: () => void;
  onRejectSuggestion: () => void;
  currentSuggestion: Suggestion | null;
  agentState?: AgentState;
  onAgentStateUpdate?: (state: AgentState) => void;
}

export const AIChat: React.FC<AIChatProps> = ({ 
  resumeData, 
  onSuggestion, 
  onAcceptSuggestion, 
  onRejectSuggestion, 
  currentSuggestion,
  agentState,
  onAgentStateUpdate
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "👋 Hi! I'm your AI resume coach. I can see you've uploaded your resume! To give you the best personalized advice, I need to understand your target role.\n\n**Could you please share the job description for the position you're applying to?** This will help me analyze your resume against the specific requirements and identify areas for improvement.\n\nYou can paste the full job posting, or just tell me the job title and key requirements you've seen.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-3.5-turbo');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<{ response: string; suggestion?: Suggestion; step?: string; nextAction?: string }> => {
    try {
      // Use agent system if available, otherwise fall back to old system
      if (agentState && onAgentStateUpdate) {
        const response = await AgentApiService.sendMessage(
          userMessage, 
          agentState,
          selectedProvider as 'openai' | 'gemini' | 'claude',
          selectedModel
        );
        onAgentStateUpdate(response.state);
        return {
          response: response.message,
          suggestion: response.suggestions?.[0],
          step: response.decision.action,
          nextAction: response.decision.nextStep,
        };
      } else {
        // Fallback to old system
        const response = await ApiService.sendChatMessage({
          message: userMessage,
          resumeData: resumeData,
          provider: selectedProvider as 'openai' | 'gemini' | 'claude',
          model: selectedModel
        });
        
        return {
          response: response.message,
          suggestion: response.suggestion,
          step: response.step,
          nextAction: response.nextAction
        };
      }
    } catch (error) {
      console.error('Error calling AI service:', error);
      
      // Return a simple error response
      return {
        response: "I apologize, but I'm having trouble processing your request right now. Please try again or check your connection.",
        step: 'error',
        nextAction: 'Please try your request again'
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { response, suggestion, step, nextAction } = await generateAIResponse(inputValue);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);

      // If there's a suggestion, trigger it immediately
      if (suggestion) {
        onSuggestion(suggestion);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      setIsLoading(false);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-full">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg text-gray-900">AI Resume Coach</h2>
            <p className="text-sm text-gray-600">Step-by-step guidance to perfect your resume</p>
          </div>
        </div>
        
        {/* LLM Selector and Step Progress */}
        <div className="mt-3 space-y-2">
          <LLMSelector 
            onProviderChange={(provider, model) => {
              setSelectedProvider(provider);
              setSelectedModel(model);
            }}
          />
          
          {/* Step Progress Indicator */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Job Description</span>
            </div>
            <div className="w-4 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span className="text-gray-400">Experience</span>
            </div>
            <div className="w-4 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span className="text-gray-400">Skills</span>
            </div>
            <div className="w-4 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span className="text-gray-400">Achievements</span>
            </div>
            <div className="w-4 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span className="text-gray-400">Suggestions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.type === 'ai' && (
                  <Bot className="w-4 h-4 mt-1 text-blue-500 flex-shrink-0" />
                )}
                {message.type === 'user' && (
                  <User className="w-4 h-4 mt-1 text-white flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="whitespace-pre-line">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white border border-gray-200">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-500" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {currentSuggestion && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  💡 Suggestion: {currentSuggestion.reasoning}
                </p>
                <div className="text-xs text-blue-600">
                  <strong>Original:</strong> {currentSuggestion.originalValue}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  <strong>Suggested:</strong> {currentSuggestion.suggestedValue}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  onClick={onAcceptSuggestion}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  ✓ Accept
                </Button>
                <Button
                  onClick={onRejectSuggestion}
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  ✗ Reject
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Paste your job description here or ask for resume improvements... (Ctrl/Cmd + Enter to send)"
              disabled={isLoading}
              className="min-h-[80px] max-h-[200px] resize-none"
              rows={3}
            />
            <div className="text-xs text-gray-500 mt-1">
              Tip: Use Ctrl/Cmd + Enter to send, or just Enter for new lines
            </div>
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="h-10 w-10 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};