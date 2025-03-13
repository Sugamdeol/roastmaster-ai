
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Flame } from "lucide-react";

interface RoastIntensityProps {
  value: 'light' | 'medium' | 'dark';
  onChange: (value: 'light' | 'medium' | 'dark') => void;
}

const RoastIntensity: React.FC<RoastIntensityProps> = ({ value, onChange }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Roast Intensity</h3>
        <p className="text-white/60 text-sm">Choose how intense you want the roast to be</p>
      </div>
      
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as 'light' | 'medium' | 'dark')}
        className="grid grid-cols-3 gap-3"
      >
        <div>
          <RadioGroupItem
            value="light"
            id="light"
            className="peer sr-only"
          />
          <Label
            htmlFor="light"
            className="flex flex-col items-center justify-between roast-card p-3 hover:bg-secondary cursor-pointer 
                      border-2 peer-data-[state=checked]:border-roast-light peer-data-[state=checked]:bg-secondary/80 transition-all"
          >
            <Flame className="h-6 w-6 mb-2 text-roast-light" />
            <span className="text-sm font-medium">Light</span>
            <span className="text-xs text-white/60">Funny</span>
          </Label>
        </div>
        
        <div>
          <RadioGroupItem
            value="medium"
            id="medium"
            className="peer sr-only"
          />
          <Label
            htmlFor="medium"
            className="flex flex-col items-center justify-between roast-card p-3 hover:bg-secondary cursor-pointer
                      border-2 peer-data-[state=checked]:border-roast-medium peer-data-[state=checked]:bg-secondary/80 transition-all"
          >
            <div className="flex">
              <Flame className="h-6 w-6 mb-2 text-roast-medium" />
              <Flame className="h-6 w-6 mb-2 text-roast-medium -ml-2" />
            </div>
            <span className="text-sm font-medium">Medium</span>
            <span className="text-xs text-white/60">Sassy</span>
          </Label>
        </div>
        
        <div>
          <RadioGroupItem
            value="dark"
            id="dark"
            className="peer sr-only"
          />
          <Label
            htmlFor="dark"
            className="flex flex-col items-center justify-between roast-card p-3 hover:bg-secondary cursor-pointer
                      border-2 peer-data-[state=checked]:border-roast-dark peer-data-[state=checked]:bg-secondary/80 transition-all"
          >
            <div className="flex">
              <Flame className="h-6 w-6 mb-2 text-roast-dark" />
              <Flame className="h-6 w-6 mb-2 text-roast-dark -ml-2" />
              <Flame className="h-6 w-6 mb-2 text-roast-dark -ml-2" />
            </div>
            <span className="text-sm font-medium">Dark</span>
            <span className="text-xs text-white/60">Brutal</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default RoastIntensity;
