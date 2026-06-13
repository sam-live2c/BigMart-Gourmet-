
import React from 'react';

interface BrandLogoProps {
  brand: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ brand, size = 'md', className = '' }) => {
  const brandLower = brand.toLowerCase();
  
  const sizeClasses = {
    sm: 'text-[10px]',
    md: 'text-sm sm:text-base',
    lg: 'text-lg sm:text-2xl'
  };

  const baseStyle = "flex items-center justify-center font-black select-none transition-all";

  // Brand-specific CSS mimics
  if (brandLower === 'apple') {
    return (
      <div className={`${baseStyle} ${sizeClasses[size]} text-black font-sans font-semibold tracking-tighter ${className}`}>
        <span className="opacity-80"></span> Apple
      </div>
    );
  }

  if (brandLower === 'samsung') {
    return (
      <div className={`${baseStyle} ${sizeClasses[size]} text-[#034EA2] font-sans font-black italic tracking-tighter uppercase scale-y-90 ${className}`}>
        Samsung
      </div>
    );
  }

  if (brandLower === 'sony') {
    return (
      <div className={`${baseStyle} ${sizeClasses[size]} text-black font-serif font-black tracking-[0.2em] uppercase scale-x-125 ${className}`}>
        Sony
      </div>
    );
  }

  if (brandLower === 'nike') {
    return (
      <div className={`${baseStyle} ${sizeClasses[size]} text-black font-sans font-black italic uppercase tracking-tighter skew-x-[-15deg] ${className}`}>
        Nike
      </div>
    );
  }

  if (brandLower === 'lg') {
    return (
      <div className={`${baseStyle} ${sizeClasses[size]} text-[#A50034] font-sans font-bold flex items-center gap-1 ${className}`}>
        <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border-2 border-[#A50034] flex items-center justify-center text-[10px] sm:text-xs">LG</div>
        <span className="hidden sm:inline">Life's Good</span>
      </div>
    );
  }

  if (brandLower === 'lego') {
    return (
      <div className={`${baseStyle} ${sizeClasses[size]} bg-[#E3000B] text-white px-1 sm:px-2 py-0.5 rounded-sm border-2 border-yellow-400 font-sans font-black italic uppercase shadow-[2px_2px_0px_#000] ${className}`}>
        Lego
      </div>
    );
  }

  if (brandLower === 'google') {
    return (
      <div className={`${baseStyle} ${sizeClasses[size]} font-sans font-bold flex gap-0.5 ${className}`}>
        <span className="text-blue-500">G</span>
        <span className="text-red-500">o</span>
        <span className="text-yellow-500">o</span>
        <span className="text-blue-500">g</span>
        <span className="text-green-500">l</span>
        <span className="text-red-500">e</span>
      </div>
    );
  }

  if (brandLower === 'oneplus') {
    return (
      <div className={`${baseStyle} ${sizeClasses[size]} text-red-600 font-sans font-black flex items-center gap-0.5 ${className}`}>
        <div className="bg-red-600 text-white px-1 py-0.5 text-[8px] sm:text-[10px] rounded-sm">+</div>
        ONEPLUS
      </div>
    );
  }

  if (brandLower === 'dell') {
    return (
      <div className={`${baseStyle} ${sizeClasses[size]} text-[#0076CE] border-2 border-[#0076CE] rounded-full w-8 h-8 sm:w-12 sm:h-12 font-black italic ${className}`}>
        DELL
      </div>
    );
  }

  if (brandLower === 'hp') {
    return (
      <div className={`${baseStyle} ${sizeClasses[size]} bg-[#0096D6] text-white rounded-full w-8 h-8 sm:w-12 sm:h-12 font-serif font-black italic shadow-inner ${className}`}>
        hp
      </div>
    );
  }

  if (brandLower === 'whirlpool') {
    return (
      <div className={`${baseStyle} ${sizeClasses[size]} text-[#F9A825] font-serif font-black italic ${className}`}>
        Whirlpool
      </div>
    );
  }

  return (
    <div className={`${baseStyle} ${sizeClasses[size]} text-gray-700 uppercase tracking-widest ${className}`}>
      {brand}
    </div>
  );
};

export default BrandLogo;
