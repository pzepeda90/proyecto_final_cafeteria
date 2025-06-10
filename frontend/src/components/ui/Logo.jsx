import React from 'react';

const Logo = ({ className = '' }) => {
  return (
    <div className={`logo-container flex flex-col items-center bg-black p-4 rounded-lg ${className}`}>
      <div className="logo-main flex items-center gap-4">
        <div className="mask-icon relative w-12 h-12">
          <div className="mask-shape w-full h-full bg-[#8B4513] rounded-[50%] rotate-[-10deg] relative animate-float">
            <div className="mask-eyes absolute top-[30%] left-1/2 transform -translate-x-1/2 flex gap-2">
              <div className="eye w-1.5 h-1.5 bg-black rounded-full"></div>
              <div className="eye w-1.5 h-1.5 bg-black rounded-full"></div>
            </div>
            <div className="mask-mouth absolute bottom-[25%] left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-black rounded"></div>
          </div>
          <div className="coffee-beans absolute w-1.5 h-1.5 bg-[#8B4513] rounded-full opacity-40 top-2 right-2"></div>
          <div className="coffee-beans absolute w-1.5 h-1.5 bg-[#8B4513] rounded-full opacity-40 top-4 right-4 rotate-45"></div>
          <div className="coffee-beans absolute w-1.5 h-1.5 bg-[#8B4513] rounded-full opacity-40 bottom-2 left-2"></div>
        </div>
        <div>
          <div className="logo-text text-2xl font-bold text-[#8B4513] tracking-tight">L'BANDITO</div>
          <div className="logo-subtitle text-xs uppercase tracking-wider text-white">Caffetteria</div>
        </div>
      </div>
    </div>
  );
};

export default Logo; 