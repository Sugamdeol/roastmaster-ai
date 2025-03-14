
import React from 'react';
import { Camera, MessageSquare, Swords } from "lucide-react";

const FeaturesOverview: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto mt-12 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-gradient">The Ultimate AI Roast Master</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="roast-card p-6">
          <div className="mb-4 flex justify-center">
            <Camera className="h-8 w-8 text-[#FF7A50]" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-center">Selfie Roast</h3>
          <p className="text-white/70 text-center">
            Upload a selfie and get a savage AI-generated roast based on your appearance.
          </p>
        </div>
        
        <div className="roast-card p-6">
          <div className="mb-4 flex justify-center">
            <MessageSquare className="h-8 w-8 text-[#FF7A50]" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-center">Text Roast</h3>
          <p className="text-white/70 text-center">
            Enter your bio, tweet, or message and let our AI tear it apart with brutal honesty.
          </p>
        </div>
        
        <div className="roast-card p-6">
          <div className="mb-4 flex justify-center">
            <Swords className="h-8 w-8 text-[#FF7A50]" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-center">Roast Battle</h3>
          <p className="text-white/70 text-center">
            Go head-to-head with the AI in a never-ending roast battle until you decide to stop.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeaturesOverview;
