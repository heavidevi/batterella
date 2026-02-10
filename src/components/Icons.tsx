// SVG Icons for Batterella - Waffle & Food themed
import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

export const WaffleIcon: React.FC<IconProps> = ({ size = 24, className = "", color = "#CBA35C" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" fill={color} opacity="0.2"/>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" fill="none"/>
    
    {/* Grid pattern */}
    <line x1="8" y1="3" x2="8" y2="21" stroke={color} strokeWidth="1"/>
    <line x1="12" y1="3" x2="12" y2="21" stroke={color} strokeWidth="1"/>
    <line x1="16" y1="3" x2="16" y2="21" stroke={color} strokeWidth="1"/>
    
    <line x1="3" y1="8" x2="21" y2="8" stroke={color} strokeWidth="1"/>
    <line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="1"/>
    <line x1="3" y1="16" x2="21" y2="16" stroke={color} strokeWidth="1"/>
    
    {/* Small dots in grid squares */}
    <circle cx="5.5" cy="5.5" r="0.5" fill={color}/>
    <circle cx="10" cy="10" r="0.5" fill={color}/>
    <circle cx="14" cy="6" r="0.5" fill={color}/>
    <circle cx="18.5" cy="14" r="0.5" fill={color}/>
    <circle cx="6" cy="18.5" r="0.5" fill={color}/>
  </svg>
);

export const DeliveryTruckIcon: React.FC<IconProps> = ({ size = 24, className = "", color = "#B6CBBD" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M1 3h15v13H1V3z" 
      stroke={color} 
      strokeWidth="1.5" 
      fill={color} 
      fillOpacity="0.1"
    />
    <path 
      d="M16 8h4l2 3v5h-2m-4-8v8" 
      stroke={color} 
      strokeWidth="1.5" 
      fill="none"
    />
    <circle cx="7" cy="19" r="2" stroke={color} strokeWidth="1.5" fill="none"/>
    <circle cx="18" cy="19" r="2" stroke={color} strokeWidth="1.5" fill="none"/>
    
    {/* Waffle pattern on truck */}
    <rect x="4" y="6" width="8" height="6" fill={color} fillOpacity="0.1"/>
    <line x1="6" y1="6" x2="6" y2="12" stroke={color} strokeWidth="0.5" opacity="0.6"/>
    <line x1="8" y1="6" x2="8" y2="12" stroke={color} strokeWidth="0.5" opacity="0.6"/>
    <line x1="10" y1="6" x2="10" y2="12" stroke={color} strokeWidth="0.5" opacity="0.6"/>
    <line x1="4" y1="8" x2="12" y2="8" stroke={color} strokeWidth="0.5" opacity="0.6"/>
    <line x1="4" y1="10" x2="12" y2="10" stroke={color} strokeWidth="0.5" opacity="0.6"/>
  </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ size = 24, className = "", color = "#B6CBBD" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1"/>
    <path d="m9 12 2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ size = 24, className = "", color = "#CBA35C" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1"/>
    <polyline points="12,6 12,12 16,14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ size = 24, className = "", color = "#754E1A" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" 
      stroke={color} 
      strokeWidth="1.5" 
      fill={color} 
      fillOpacity="0.1"
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const MapPinIcon: React.FC<IconProps> = ({ size = 24, className = "", color = "#B6CBBD" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" 
      stroke={color} 
      strokeWidth="1.5" 
      fill={color} 
      fillOpacity="0.1"
    />
    <circle cx="12" cy="10" r="3" stroke={color} strokeWidth="1.5" fill="none"/>
  </svg>
);

export const ShoppingBagIcon: React.FC<IconProps> = ({ size = 24, className = "", color = "#CBA35C" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" 
      stroke={color} 
      strokeWidth="1.5" 
      fill={color} 
      fillOpacity="0.1"
    />
    <line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="1.5"/>
    <path d="M16 10a4 4 0 0 1-8 0" stroke={color} strokeWidth="1.5" fill="none"/>
    
    {/* Small waffle pattern */}
    <rect x="9" y="8" width="6" height="4" fill={color} fillOpacity="0.1"/>
    <line x1="10.5" y1="8" x2="10.5" y2="12" stroke={color} strokeWidth="0.5" opacity="0.4"/>
    <line x1="12" y1="8" x2="12" y2="12" stroke={color} strokeWidth="0.5" opacity="0.4"/>
    <line x1="13.5" y1="8" x2="13.5" y2="12" stroke={color} strokeWidth="0.5" opacity="0.4"/>
    <line x1="9" y1="9.5" x2="15" y2="9.5" stroke={color} strokeWidth="0.5" opacity="0.4"/>
    <line x1="9" y1="11" x2="15" y2="11" stroke={color} strokeWidth="0.5" opacity="0.4"/>
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ size = 24, className = "", color = "#CBA35C" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <polygon 
      points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" 
      stroke={color} 
      strokeWidth="1.5" 
      fill={color} 
      fillOpacity="0.8"
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const HeartIcon: React.FC<IconProps> = ({ size = 24, className = "", color = "#B6CBBD" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
      stroke={color} 
      strokeWidth="1.5" 
      fill={color} 
      fillOpacity="0.3"
    />
  </svg>
);

export const GingerbreadIcon: React.FC<IconProps> = ({ size = 24, className = "", color = "#754E1A" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Gingerbread person shape */}
    <path 
      d="M12 3c1.5 0 2.5 1 2.5 2.5S13.5 8 12 8s-2.5-1-2.5-2.5S10.5 3 12 3z" 
      fill={color} 
      fillOpacity="0.8"
    />
    <path 
      d="M12 8c-2 0-3 1-3 2v4c0 1-1 2-2 2s-2-1-2-2 1-2 2-2v-1c0-2 2-4 5-4s5 2 5 4v1c1 0 2 1 2 2s-1 2-2 2-2-1-2-2v-4c0-1-1-2-3-2z" 
      fill={color} 
      fillOpacity="0.6"
    />
    <path 
      d="M10 16v3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2h2zm4 0v3c0 1 1 2 2 2s2-1 2-2-1-2-2-2h-2z" 
      fill={color} 
      fillOpacity="0.6"
    />
    
    {/* Face details */}
    <circle cx="10.5" cy="5" r="0.5" fill="#F8E1B7"/>
    <circle cx="13.5" cy="5" r="0.5" fill="#F8E1B7"/>
    <path d="M10.5 6.5c0.5 0.5 1.5 0.5 2 0" stroke="#F8E1B7" strokeWidth="0.5" strokeLinecap="round"/>
    
    {/* Buttons */}
    <circle cx="12" cy="10" r="0.5" fill="#F8E1B7"/>
    <circle cx="12" cy="12" r="0.5" fill="#F8E1B7"/>
    <circle cx="12" cy="14" r="0.5" fill="#F8E1B7"/>
  </svg>
);
