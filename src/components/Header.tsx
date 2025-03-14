
import React from 'react';
import { Flame } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 flex justify-center">
      <div className="flex items-center">
        <Flame className="h-8 w-8 mr-2 text-[#FF7A50] animate-pulse" />
        <h1 className="text-3xl font-bold text-gradient">RoastGPT</h1>
      </div>
    </header>
  );
};

export default Header;
