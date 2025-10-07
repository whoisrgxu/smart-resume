import React from 'react';
import { ResumeData } from '../App';
import { Mail, Phone, MapPin } from 'lucide-react';

interface ResumePreviewProps {
  resumeData: ResumeData;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData }) => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <h1 className="text-3xl mb-2">{resumeData.personalInfo.name}</h1>
        <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Mail className="w-4 h-4" />
            <span>{resumeData.personalInfo.email}</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="w-4 h-4" />
            <span>{resumeData.personalInfo.phone}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{resumeData.personalInfo.location}</span>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed">
          {resumeData.personalInfo.summary}
        </p>
      </div>

      {/* Experience */}
      <div className="mb-8">
        <h2 className="text-xl mb-4 text-gray-900">Professional Experience</h2>
        <div className="space-y-6">
          {resumeData.experience.map((exp) => (
            <div key={exp.id} className="border-l-2 border-blue-100 pl-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg text-gray-900">{exp.title}</h3>
                  <p className="text-gray-600">{exp.company}</p>
                </div>
                <span className="text-gray-500 text-sm">{exp.duration}</span>
              </div>
              <ul className="space-y-1 text-gray-700">
                {exp.description.map((desc, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-8">
        <h2 className="text-xl mb-4 text-gray-900">Education</h2>
        <div className="space-y-3">
          {resumeData.education.map((edu) => (
            <div key={edu.id} className="border-l-2 border-green-100 pl-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg text-gray-900">{edu.degree}</h3>
                  <p className="text-gray-600">{edu.school}</p>
                </div>
                <span className="text-gray-500 text-sm">{edu.year}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-xl mb-4 text-gray-900">Technical Skills</h2>
        <div className="flex flex-wrap gap-2">
          {resumeData.skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};