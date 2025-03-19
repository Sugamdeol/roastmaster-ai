
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'ko': 'Korean',
  'nl': 'Dutch',
  'pl': 'Polish',
  'sv': 'Swedish',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'vi': 'Vietnamese',
  'th': 'Thai',
  'id': 'Indonesian'
};

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

interface LanguageSelectorProps {
  value: SupportedLanguage;
  onChange: (value: SupportedLanguage) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Roast Language</h3>
        <p className="text-white/60 text-sm">Choose which language to roast in</p>
      </div>
      
      <Select 
        value={value} 
        onValueChange={(val) => onChange(val as SupportedLanguage)}
      >
        <SelectTrigger className="w-full bg-secondary border-white/10">
          <SelectValue placeholder="Select a language" />
        </SelectTrigger>
        <SelectContent className="bg-secondary border-white/10 max-h-[300px]">
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
            <SelectItem
              key={code}
              value={code}
              className="focus:bg-white/10 cursor-pointer"
            >
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
