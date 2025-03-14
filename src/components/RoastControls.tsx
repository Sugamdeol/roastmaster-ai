
import React from 'react';
import { Flame, Camera, MessageSquare, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoastControlsProps {
  activeTab: string;
  isGenerating: boolean;
  imageUrl: string | null;
  textInput: string;
  onRoastSelfie: () => void;
  onRoastText: () => void;
}

const RoastControls: React.FC<RoastControlsProps> = ({
  activeTab,
  isGenerating,
  imageUrl,
  textInput,
  onRoastSelfie,
  onRoastText
}) => {
  if (activeTab === "selfie" && imageUrl) {
    return (
      <Button
        onClick={onRoastSelfie}
        disabled={isGenerating}
        className="button-gradient flex items-center gap-2 px-6 py-6 rounded-full text-lg font-medium w-full"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin mr-2" />
            Roasting...
          </>
        ) : (
          <>
            <Flame size={20} className="mr-2" />
            Roast My Selfie
          </>
        )}
      </Button>
    );
  }

  if (activeTab === "text") {
    return (
      <Button
        onClick={onRoastText}
        disabled={isGenerating || !textInput.trim()}
        className="button-gradient flex items-center gap-2 px-6 py-6 rounded-full text-lg font-medium w-full"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin mr-2" />
            Roasting...
          </>
        ) : (
          <>
            <Flame size={20} className="mr-2" />
            Roast My Text
          </>
        )}
      </Button>
    );
  }

  return null;
};

export default RoastControls;
