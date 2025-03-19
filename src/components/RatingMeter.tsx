
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Brain, Brush, Flame, Lightbulb, Shield } from "lucide-react";

interface RatingMeterProps {
  value: number;
}

const RatingMeter: React.FC<RatingMeterProps> = ({ value }) => {
  return (
    <div className="w-full">
      <Progress 
        value={value} 
        max={100}
        className="h-2 bg-secondary/80"
      >
        <div 
          className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400"
          style={{ width: `${value}%` }} 
        />
      </Progress>
    </div>
  );
};

export default RatingMeter;
