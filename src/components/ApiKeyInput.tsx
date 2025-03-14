
import React, { useState, useEffect } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Key } from "lucide-react";
import { toast } from 'sonner';

const API_KEY_STORAGE_KEY = 'roastgpt-openai-api-key';

interface ApiKeyInputProps {
  onApiKeyChange: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    // Try to get saved API key from localStorage
    try {
      const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (savedKey) {
        setApiKey(savedKey);
        setIsSaved(true);
        onApiKeyChange(savedKey);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, [onApiKeyChange]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an OpenAI API key');
      return;
    }

    try {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
      setIsSaved(true);
      onApiKeyChange(apiKey);
      toast.success('API key saved');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      toast.error('Failed to save API key');
    }
  };

  const handleClearApiKey = () => {
    try {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      setApiKey('');
      setIsSaved(false);
      onApiKeyChange('');
      toast.success('API key removed');
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      toast.error('Failed to remove API key');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Key className="w-4 h-4 mr-2 text-[#FF7A50]" />
        <h3 className="text-sm font-medium">OpenAI API Key (for audio)</h3>
      </div>
      
      <div className="flex gap-2">
        <Input
          type={isVisible ? "text" : "password"}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your OpenAI API key"
          className="flex-1 bg-secondary border-white/10"
        />
        
        <Button 
          size="sm"
          variant="outline" 
          onClick={() => setIsVisible(!isVisible)}
          className="text-xs"
        >
          {isVisible ? 'Hide' : 'Show'}
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={handleSaveApiKey}
          disabled={!apiKey.trim() || isSaved}
          className="text-xs flex-1"
          variant="secondary"
        >
          Save Key
        </Button>
        
        {isSaved && (
          <Button
            onClick={handleClearApiKey}
            className="text-xs flex-1"
            variant="outline"
          >
            Clear Key
          </Button>
        )}
      </div>
      
      <p className="text-xs text-white/60">
        Your API key is stored locally in your browser and never sent to our servers.
      </p>
    </div>
  );
};

export default ApiKeyInput;
