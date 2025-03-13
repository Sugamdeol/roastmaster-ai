
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Brain, Brush, Flame, Lightbulb, Shield } from "lucide-react";

interface RatingMeterProps {
  ratings: Record<string, number>;
}

const RatingMeter: React.FC<RatingMeterProps> = ({ ratings }) => {
  const getIconForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case 'creativity':
        return <Brush className="h-5 w-5 text-red-500" />;
      case 'confidence':
        return <Shield className="h-5 w-5 text-green-500" />;
      case 'style':
        return <Flame className="h-5 w-5 text-blue-500" />;
      case 'mystery':
        return <Lightbulb className="h-5 w-5 text-purple-500" />;
      case 'self-awareness':
        return <Brain className="h-5 w-5 text-yellow-500" />;
      default:
        return <Flame className="h-5 w-5 text-gray-500" />;
    }
  };

  const getColorForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case 'creativity':
        return 'from-red-600 to-red-400';
      case 'confidence':
        return 'from-green-600 to-green-400';
      case 'style':
        return 'from-blue-600 to-blue-400';
      case 'mystery':
        return 'from-purple-600 to-purple-400';
      case 'self-awareness':
        return 'from-yellow-600 to-yellow-400';
      default:
        return 'from-gray-600 to-gray-400';
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold mb-4 text-center">YOUR RATINGS</h3>
      
      <div className="space-y-4">
        {Object.entries(ratings).map(([category, value]) => (
          <div key={category} className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-1.5 rounded-full bg-secondary/80">
              {getIconForCategory(category)}
            </div>
            
            <div className="flex-grow">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{category}</span>
                <span className="text-sm font-medium">{value}%</span>
              </div>
              <Progress 
                value={value} 
                max={100}
                className="h-2.5 bg-secondary/80"
              >
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${getColorForCategory(category)}`}
                  style={{ width: `${value}%` }} 
                />
              </Progress>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingMeter;
