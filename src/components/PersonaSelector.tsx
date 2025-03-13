
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PersonaSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const PersonaSelector: React.FC<PersonaSelectorProps> = ({ value, onChange }) => {
  const personas = [
    { id: 'savage-comedian', name: 'Savage Comedian', description: 'Ruthless stand-up comic with no filter' },
    { id: 'sarcastic-professor', name: 'Sarcastic Professor', description: 'Intellectually superior and judgy' },
    { id: 'roast-bot-3000', name: 'Roast Bot 3000', description: 'AI with advanced roasting algorithms' },
    { id: 'celebrity-roaster', name: 'Celebrity Roaster', description: 'Famous comedian style roasts' },
    { id: 'internet-troll', name: 'Internet Troll', description: 'Meme-loving internet culture expert' }
  ];

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">AI Persona</h3>
        <p className="text-white/60 text-sm">Select who's going to roast you</p>
      </div>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-secondary border-white/10">
          <SelectValue placeholder="Select a persona" />
        </SelectTrigger>
        <SelectContent className="bg-secondary border-white/10">
          {personas.map((persona) => (
            <SelectItem
              key={persona.id}
              value={persona.name}
              className="focus:bg-white/10 cursor-pointer"
            >
              <div className="flex flex-col">
                <span>{persona.name}</span>
                <span className="text-xs text-white/60">{persona.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PersonaSelector;
