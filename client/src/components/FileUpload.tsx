import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from './ui/button';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        onFileUpload(file);
      } else {
        alert('Please upload a DOCX file');
      }
    }
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        onFileUpload(file);
      } else {
        alert('Please upload a DOCX file');
      }
    }
  }, [onFileUpload]);

  return (
    <div className="max-w-md mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl mb-2 text-gray-900">Smart Resume App</h1>
        <p className="text-gray-600">Upload your resume to get started with AI-powered improvements</p>
      </div>
      
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-blue-50 rounded-full">
            <Upload className="w-8 h-8 text-blue-500" />
          </div>
          
          <div>
            <h3 className="text-lg mb-2 text-gray-900">Upload Your Resume</h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your DOCX resume here, or click to browse
            </p>
          </div>

          <input
            type="file"
            accept=".docx"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          
          <Button 
            onClick={() => document.getElementById('file-upload')?.click()}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Choose DOCX File
          </Button>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>Supported format: DOCX</p>
        <p>Maximum file size: 10MB</p>
      </div>
    </div>
  );
};