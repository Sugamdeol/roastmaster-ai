
import React from 'react';
import UploadSelfie from '@/components/UploadSelfie';
import RoastIntensity from '@/components/RoastIntensity';
import PersonaSelector from '@/components/PersonaSelector';
import RoastControls from '@/components/RoastControls';

interface SelfieTabProps {
  imageUrl: string | null;
  onImageSelected: (base64Image: string) => void;
  roastIntensity: 'light' | 'medium' | 'dark';
  setRoastIntensity: (intensity: 'light' | 'medium' | 'dark') => void;
  aiPersona: string;
  setAiPersona: (persona: string) => void;
  isGenerating: boolean;
  handleRoastSelfie: () => void;
}

const SelfieTab: React.FC<SelfieTabProps> = ({
  imageUrl,
  onImageSelected,
  roastIntensity,
  setRoastIntensity,
  aiPersona,
  setAiPersona,
  isGenerating,
  handleRoastSelfie
}) => {
  return (
    <div className="space-y-6">
      <UploadSelfie onImageSelected={onImageSelected} />
      
      {imageUrl && (
        <>
          <RoastIntensity 
            value={roastIntensity} 
            onChange={setRoastIntensity} 
          />
          
          <PersonaSelector 
            value={aiPersona} 
            onChange={setAiPersona} 
          />
          
          <RoastControls
            activeTab="selfie"
            isGenerating={isGenerating}
            imageUrl={imageUrl}
            textInput=""
            onRoastSelfie={handleRoastSelfie}
            onRoastText={() => {}}
          />
        </>
      )}
    </div>
  );
};

export default SelfieTab;
