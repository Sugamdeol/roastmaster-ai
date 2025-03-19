import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import RatingMeter from './RatingMeter';
import ShareOptions from './ShareOptions';
import AudioRoastPlayer from './AudioRoastPlayer';
import { SupportedLanguage } from './LanguageSelector';

interface RoastResultProps {
  imageUrl?: string;
  roast: string;
  finalBurn: string;
  ratings: Record<string, number>;
  onRoastAgain: () => void;
  language?: SupportedLanguage;
}

const RoastResult: React.FC<RoastResultProps> = ({
  imageUrl,
  roast,
  finalBurn,
  ratings,
  onRoastAgain,
  language = 'en'
}) => {
  const totalRating = Object.values(ratings).reduce((sum, rating) => sum + rating, 0);
  const formatRating = (category: string) => {
    return `${category}: ${ratings[category]}%`;
  };

  return (
    <div className="space-y-8">
      <Button
        variant="ghost"
        className="mb-4 pl-0 hover:bg-transparent"
        onClick={onRoastAgain}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Roast Again
      </Button>
      
      <div className="flex flex-col gap-6 md:flex-row">
        {imageUrl && (
          <div className="md:w-1/3">
            <img 
              src={imageUrl} 
              alt="Roasted selfie" 
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
        )}
        
        <div className={`${imageUrl ? 'md:w-2/3' : 'w-full'}`}>
          <div className="bg-secondary p-6 rounded-lg shadow-lg mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {language.toUpperCase()} Roast
            </h3>
            <p className="text-white/80 mb-4">{roast}</p>
            <p className="text-sm italic text-white/60">Final Burn: {finalBurn}</p>
          </div>
          
          <AudioRoastPlayer 
            roastText={roast} 
            finalBurn={finalBurn}
            language={language}
          />
          
          <div className="bg-secondary p-6 rounded-lg shadow-lg mt-6">
            <h3 className="text-lg font-semibold mb-4">Ratings</h3>
            <div className="space-y-3">
              {Object.keys(ratings).map((category) => (
                <div key={category} className="flex items-center gap-4">
                  <span className="w-32 text-sm">{formatRating(category)}</span>
                  <RatingMeter value={ratings[category]} />
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm font-medium">
              Total Score: {totalRating}%
            </div>
          </div>
          
          <ShareOptions />
        </div>
      </div>
    </div>
  );
};

export default RoastResult;
