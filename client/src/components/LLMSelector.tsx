import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AgentApiService } from '../api/agent.api';

interface LLMSelectorProps {
  onProviderChange: (provider: string, model: string) => void;
}

export const LLMSelector: React.FC<LLMSelectorProps> = ({ onProviderChange }) => {
  const [providers, setProviders] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-3.5-turbo');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      loadModels(selectedProvider);
    }
  }, [selectedProvider]);

  useEffect(() => {
    if (selectedProvider && selectedModel) {
      onProviderChange(selectedProvider, selectedModel);
    }
  }, [selectedProvider, selectedModel, onProviderChange]);

  const loadProviders = async () => {
    try {
      const providersList = await AgentApiService.getProviders();
      setProviders(providersList);
    } catch (error) {
      console.error('Error loading providers:', error);
      // Fallback to default providers
      setProviders(['openai', 'gemini', 'claude']);
    }
  };

  const loadModels = async (provider: string) => {
    setLoading(true);
    try {
      const modelsList = await AgentApiService.getModels(provider);
      setModels(modelsList);
      if (modelsList.length > 0) {
        setSelectedModel(modelsList[0]);
      }
    } catch (error) {
      console.error('Error loading models:', error);
      // Fallback to default models based on provider
      const defaultModels = {
        openai: ['gpt-4', 'gpt-3.5-turbo'],
        gemini: ['gemini-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
        claude: ['claude-3-sonnet-20240229'],
      };
      const fallbackModels = defaultModels[provider as keyof typeof defaultModels] || [];
      setModels(fallbackModels);
      if (fallbackModels.length > 0) {
        setSelectedModel(fallbackModels[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">LLM:</label>
        <Select value={selectedProvider} onValueChange={handleProviderChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider} value={provider}>
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Model:</label>
        <Select value={selectedModel} onValueChange={handleModelChange} disabled={loading}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
