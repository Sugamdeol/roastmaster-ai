
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import RoastIntensity from '@/components/RoastIntensity';
import PersonaSelector from '@/components/PersonaSelector';
import RoastControls from '@/components/RoastControls';
import LanguageSelector, { SupportedLanguage } from '@/components/LanguageSelector';

interface TextTabProps {
  textInput: string;
  setTextInput: (text: string) => void;
  roastIntensity: 'light' | 'medium' | 'dark';
  setRoastIntensity: (intensity: 'light' | 'medium' | 'dark') => void;
  aiPersona: string;
  setAiPersona: (persona: string) => void;
  isGenerating: boolean;
  handleRoastText: () => void;
  selectedLanguage: SupportedLanguage;
  setSelectedLanguage: (language: SupportedLanguage) => void;
}

const TextTab: React.FC<TextTabProps> = ({
  textInput,
  setTextInput,
  roastIntensity,
  setRoastIntensity,
  aiPersona,
  setAiPersona,
  isGenerating,
  handleRoastText,
  selectedLanguage,
  setSelectedLanguage
}) => {
  return (
    <div className="space-y-6">
      <div className="w-full">
        <Textarea
          placeholder="Enter a bio, tweet, or message to get roasted..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          className="min-h-[150px] bg-secondary border-white/10 focus:border-[#FF7A50] resize-none"
        />
      </div>
      
      <RoastIntensity 
        value={roastIntensity} 
        onChange={setRoastIntensity} 
      />
      
      <PersonaSelector 
        value={aiPersona} 
        onChange={setAiPersona} 
      />
      
      <LanguageSelector
        value={selectedLanguage}
        onChange={setSelectedLanguage}
      />
      
      <RoastControls
        activeTab="text"
        isGenerating={isGenerating}
        imageUrl={null}
        textInput={textInput}
        onRoastSelfie={() => {}}
        onRoastText={handleRoastText}
      />
    </div>
  );
};

export default TextTab;
