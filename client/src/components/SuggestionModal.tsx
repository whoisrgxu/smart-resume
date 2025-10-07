import React from 'react';
import { X, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Suggestion } from '../App';

interface SuggestionModalProps {
  isOpen: boolean;
  suggestion: Suggestion | null;
  onAccept: () => void;
  onReject: () => void;
}

export const SuggestionModal: React.FC<SuggestionModalProps> = ({
  isOpen,
  suggestion,
  onAccept,
  onReject,
}) => {
  if (!suggestion) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onReject}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            AI Suggestion
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reasoning */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm text-blue-900 mb-2">Why this improvement?</h3>
            <p className="text-blue-800">{suggestion.reasoning}</p>
          </div>

          {/* Before and After Comparison */}
          <div className="grid gap-4">
            {/* Before */}
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm text-gray-600">
                <XCircle className="w-4 h-4 text-red-500" />
                Current Version
              </h3>
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <p className="text-gray-900 whitespace-pre-line">
                  {suggestion.originalValue}
                </p>
              </div>
            </div>

            {/* After */}
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Suggested Improvement
              </h3>
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <p className="text-gray-900 whitespace-pre-line">
                  {suggestion.suggestedValue}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onAccept}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept Suggestion
            </Button>
            <Button 
              onClick={onReject}
              variant="outline"
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Keep Original
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
            Your resume will be updated immediately if you accept this suggestion
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};