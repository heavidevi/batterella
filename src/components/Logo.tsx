import React from 'react';
import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export const BatterellaLogo: React.FC<LogoProps> = ({ 
  width = 120, 
  height = 60, 
  className = "" 
}) => {
  return (
    <div className={`logo-container ${className}`}>
      {/* This is a placeholder - replace with logo.png later */}
      <Image 
        src="/sample-logo.svg" 
        alt="Batterella - Fresh Waffles" 
        width={width} 
        height={height}
        className="logo-image"
        priority
      />
      
      {/* Alternative: Uncomment when you have logo.png */}
      {/* 
      <Image 
        src="/logo.png" 
        alt="Batterella - Fresh Waffles" 
        width={width} 
        height={height}
        className="logo-image"
        priority
      />
      */}
    </div>
  );
};

export default BatterellaLogo;
