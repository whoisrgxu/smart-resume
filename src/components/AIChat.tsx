import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ResumeData, Suggestion } from '../App';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  resumeData: ResumeData;
  onSuggestion: (suggestion: Suggestion) => void;
}

export const AIChat: React.FC<AIChatProps> = ({ resumeData, onSuggestion }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I've analyzed your resume. I can help you improve various sections. Try asking me to:\n\n• Enhance your summary\n• Improve job descriptions\n• Suggest better skills\n• Optimize formatting\n\nWhat would you like to work on?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): { response: string; suggestion?: Suggestion } => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('summary') || lowerMessage.includes('about')) {
      return {
        response: "I can help improve your summary to be more impactful and specific. Here's a suggestion:",
        suggestion: {
          id: Date.now().toString(),
          type: 'personal',
          field: 'summary',
          originalValue: resumeData.personalInfo.summary,
          suggestedValue: "Results-driven software engineer with 5+ years of experience architecting scalable web applications and leading cross-functional teams. Proven track record of reducing deployment times by 60% and optimizing systems for 1M+ users. Passionate about mentoring developers and implementing cutting-edge technologies.",
          reasoning: "The new summary is more specific with quantifiable achievements, uses stronger action verbs, and better highlights leadership experience."
        }
      };
    }
    
    if (lowerMessage.includes('experience') || lowerMessage.includes('job')) {
      return {
        response: "Let me suggest an improvement for one of your job descriptions to make it more impactful:",
        suggestion: {
          id: Date.now().toString(),
          type: 'experience',
          field: 'description',
          originalValue: "Led development of microservices architecture serving 1M+ users",
          suggestedValue: "Architected and led development of cloud-native microservices platform serving 1M+ users, resulting in 99.9% uptime and 50% improved response times",
          reasoning: "Added specific technical details (cloud-native), measurable outcomes (99.9% uptime, 50% improvement), and used stronger action verbs."
        }
      };
    }
    
    if (lowerMessage.includes('skills') || lowerMessage.includes('technical')) {
      return {
        response: "I notice you could enhance your skills section. Here's a suggestion:",
        suggestion: {
          id: Date.now().toString(),
          type: 'skills',
          field: 'skills',
          originalValue: "JavaScript",
          suggestedValue: "JavaScript (ES6+)",
          reasoning: "Being more specific about JavaScript proficiency (ES6+) shows you're up-to-date with modern language features."
        }
      };
    }
    
    return {
      response: "I can help you improve various aspects of your resume:\n\n• **Summary**: Make it more impactful with specific achievements\n• **Experience**: Add quantifiable results and stronger action verbs\n• **Skills**: Update with current technologies and certifications\n• **Education**: Add relevant coursework or honors\n\nWhat specific area would you like me to focus on?"
    };
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

    // Simulate AI processing delay
    setTimeout(() => {
      const { response, suggestion } = generateAIResponse(inputValue);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);

      // If there's a suggestion, show it in the modal
      if (suggestion) {
        setTimeout(() => {
          onSuggestion(suggestion);
        }, 500);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
            <h2 className="text-lg text-gray-900">AI Resume Assistant</h2>
            <p className="text-sm text-gray-600">Get personalized suggestions to improve your resume</p>
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
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask for resume improvements..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};