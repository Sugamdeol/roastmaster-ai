
import React, { useState, useEffect } from 'react';
import { Flame } from "lucide-react";
import { 
  getRoastCount, 
  getEgoCrushedCount,
  getAudioRoastCount 
} from '@/utils/counterUtils';

const CounterStats: React.FC = () => {
  const [roastCount, setRoastCount] = useState(0);
  const [egoCrushedCount, setEgoCrushedCount] = useState(0);
  const [audioRoastCount, setAudioRoastCount] = useState(0);

  useEffect(() => {
    setRoastCount(getRoastCount());
    setEgoCrushedCount(getEgoCrushedCount());
    setAudioRoastCount(getAudioRoastCount());
  }, []);

  return (
    <>
      <div className="mt-12 flex justify-center space-x-8">
        <div className="text-center">
          <p className="text-[#FF7A50] text-xl font-bold">{roastCount.toLocaleString()}</p>
          <p className="text-white/60 text-sm">Roasts Today</p>
        </div>
        
        <div className="text-center">
          <p className="text-[#FF7A50] text-xl font-bold">{egoCrushedCount.toLocaleString()}</p>
          <p className="text-white/60 text-sm">Egos Crushed</p>
        </div>
        
        <div className="text-center">
          <p className="text-[#FF7A50] text-xl font-bold">{audioRoastCount.toLocaleString()}</p>
          <p className="text-white/60 text-sm">Audio Roasts</p>
        </div>
      </div>
      
      <div className="mt-8 text-center text-white/60 text-xs px-4">
        <p className="mb-1 flex items-center justify-center">
          <Flame size={12} className="mr-1 text-[#FF7A50]" />
          Warning: Our AI has no filter and will absolutely destroy you
        </p>
        <p>By continuing, you agree to be absolutely decimated</p>
      </div>
      
      <div className="mt-6 text-center text-white/40 text-xs">
        Powered by Pollinations.AI
      </div>
    </>
  );
};

export default CounterStats;
