import React, { useState } from 'react';
import { ResumePreview } from './components/ResumePreview';
import { AIChat } from './components/AIChat';
import { FileUpload } from './components/FileUpload';
import { SuggestionModal } from './components/SuggestionModal';

export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    title: string;
    company: string;
    duration: string;
    description: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    year: string;
  }>;
  skills: string[];
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileUpload = (file: File) => {
    // Simulate PDF parsing with mock data
    const mockResumeData: ResumeData = {
      personalInfo: {
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        summary: "Experienced software engineer with 5+ years of experience in full-stack development. Passionate about creating scalable web applications and leading development teams."
      },
      experience: [
        {
          id: "exp1",
          title: "Senior Software Engineer",
          company: "Tech Corp",
          duration: "2021 - Present",
          description: [
            "Led development of microservices architecture serving 1M+ users",
            "Implemented CI/CD pipelines reducing deployment time by 60%",
            "Mentored junior developers and conducted code reviews"
          ]
        },
        {
          id: "exp2",
          title: "Software Engineer",
          company: "StartupXYZ",
          duration: "2019 - 2021",
          description: [
            "Built responsive web applications using React and Node.js",
            "Collaborated with design team to implement user-friendly interfaces",
            "Optimized database queries improving application performance by 40%"
          ]
        }
      ],
      education: [
        {
          id: "edu1",
          degree: "Bachelor of Science in Computer Science",
          school: "University of California, Berkeley",
          year: "2019"
        }
      ],
      skills: [
        "JavaScript", "TypeScript", "React", "Node.js", "Python", "PostgreSQL", "AWS", "Docker"
      ]
    };

    setResumeData(mockResumeData);
  };

  const handleSuggestion = (suggestion: Suggestion) => {
    setCurrentSuggestion(suggestion);
    setIsModalOpen(true);
  };

  const handleAcceptSuggestion = () => {
    if (!currentSuggestion || !resumeData) return;

    const updatedResumeData = { ...resumeData };

    switch (currentSuggestion.type) {
      case 'personal':
        // @ts-ignore - Dynamic key access
        updatedResumeData.personalInfo[currentSuggestion.field] = currentSuggestion.suggestedValue;
        break;
      case 'experience':
        const expIndex = updatedResumeData.experience.findIndex(exp => 
          exp.description.some(desc => desc.includes(currentSuggestion.originalValue))
        );
        if (expIndex !== -1) {
          updatedResumeData.experience[expIndex].description = 
            updatedResumeData.experience[expIndex].description.map(desc =>
              desc.includes(currentSuggestion.originalValue) ? currentSuggestion.suggestedValue : desc
            );
        }
        break;
      case 'skills':
        const skillIndex = updatedResumeData.skills.indexOf(currentSuggestion.originalValue);
        if (skillIndex !== -1) {
          updatedResumeData.skills[skillIndex] = currentSuggestion.suggestedValue;
        }
        break;
    }

    setResumeData(updatedResumeData);
    setIsModalOpen(false);
    setCurrentSuggestion(null);
  };

  const handleRejectSuggestion = () => {
    setIsModalOpen(false);
    setCurrentSuggestion(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!resumeData ? (
        <div className="flex items-center justify-center min-h-screen">
          <FileUpload onFileUpload={handleFileUpload} />
        </div>
      ) : (
        <div className="flex h-screen">
          {/* Left Half - Resume Preview */}
          <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
            <ResumePreview resumeData={resumeData} />
          </div>

          {/* Right Half - AI Chat */}
          <div className="w-1/2 bg-gray-50 overflow-y-auto">
            <AIChat 
              resumeData={resumeData} 
              onSuggestion={handleSuggestion}
            />
          </div>
        </div>
      )}

      {/* Suggestion Modal */}
      <SuggestionModal
        isOpen={isModalOpen}
        suggestion={currentSuggestion}
        onAccept={handleAcceptSuggestion}
        onReject={handleRejectSuggestion}
      />
    </div>
  );
}