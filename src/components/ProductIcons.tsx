export const GingerbreadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Gingerbread man head - more rounded like Shrek's character */}
    <circle cx="24" cy="14" r="8" fill="url(#gingerbread-gradient)" stroke="#754E1A" strokeWidth="1.5"/>
    
    {/* Body - more rounded and friendly */}
    <ellipse cx="24" cy="28" rx="7" ry="9" fill="url(#gingerbread-gradient)" stroke="#754E1A" strokeWidth="1.5"/>
    
    {/* Arms - shorter and stubbier like Shrek's gingerbread man */}
    <ellipse cx="14" cy="25" rx="3.5" ry="5" fill="url(#gingerbread-gradient)" stroke="#754E1A" strokeWidth="1.5"/>
    <ellipse cx="34" cy="25" rx="3.5" ry="5" fill="url(#gingerbread-gradient)" stroke="#754E1A" strokeWidth="1.5"/>
    
    {/* Legs - shorter and rounder */}
    <ellipse cx="20" cy="40" rx="2.5" ry="4" fill="url(#gingerbread-gradient)" stroke="#754E1A" strokeWidth="1.5"/>
    <ellipse cx="28" cy="40" rx="2.5" ry="4" fill="url(#gingerbread-gradient)" stroke="#754E1A" strokeWidth="1.5"/>
    
    {/* Face - more expressive like Shrek's gingerbread man */}
    {/* Eyes - bigger and more round */}
    <circle cx="21" cy="12" r="1.5" fill="#754E1A"/>
    <circle cx="27" cy="12" r="1.5" fill="#754E1A"/>
    <circle cx="21.3" cy="11.7" r="0.5" fill="#FFFFFF" opacity="0.8"/>
    <circle cx="27.3" cy="11.7" r="0.5" fill="#FFFFFF" opacity="0.8"/>
    
    {/* Eyebrows - giving character */}
    <path d="M19 10.5c1 -0.5 2.5 -0.3 3 0" stroke="#754E1A" strokeWidth="1" fill="none" strokeLinecap="round"/>
    <path d="M25 10.5c1 -0.5 2.5 -0.3 3 0" stroke="#754E1A" strokeWidth="1" fill="none" strokeLinecap="round"/>
    
    {/* Mouth - more expressive smile */}
    <path d="M20 16c1 2 3 2 4 2s3 0 4 -2" stroke="#754E1A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    
    {/* Icing decorations - like the movie character */}
    {/* Chest buttons */}
    <circle cx="24" cy="24" r="1.2" fill="#F8E1B7" stroke="#CBA35C" strokeWidth="0.5"/>
    <circle cx="24" cy="28" r="1.2" fill="#F8E1B7" stroke="#CBA35C" strokeWidth="0.5"/>
    <circle cx="24" cy="32" r="1.2" fill="#F8E1B7" stroke="#CBA35C" strokeWidth="0.5"/>
    
    {/* Icing trim on arms and legs */}
    <ellipse cx="14" cy="22" rx="2" ry="1" fill="#F8E1B7" opacity="0.8"/>
    <ellipse cx="34" cy="22" rx="2" ry="1" fill="#F8E1B7" opacity="0.8"/>
    <ellipse cx="20" cy="37" rx="1.5" ry="1" fill="#F8E1B7" opacity="0.8"/>
    <ellipse cx="28" cy="37" rx="1.5" ry="1" fill="#F8E1B7" opacity="0.8"/>
    
    {/* Bow tie - classic gingerbread man accessory */}
    <path d="M21 18 L24 19 L27 18 L24 20 L21 18" fill="#B6CBBD" stroke="#754E1A" strokeWidth="0.5"/>
    <circle cx="24" cy="19" r="0.8" fill="#CBA35C" stroke="#754E1A" strokeWidth="0.5"/>
    
    <defs>
      <linearGradient id="gingerbread-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D4A574"/>
        <stop offset="30%" stopColor="#CBA35C"/>
        <stop offset="70%" stopColor="#B8956B"/>
        <stop offset="100%" stopColor="#A67C52"/>
      </linearGradient>
    </defs>
  </svg>
);

export const WaffleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Waffle base */}
    <rect x="8" y="8" width="32" height="32" rx="4" 
          fill="url(#waffle-gradient)" stroke="#754E1A" strokeWidth="1"/>
    
    {/* Waffle grid pattern */}
    <line x1="8" y1="16" x2="40" y2="16" stroke="#754E1A" strokeWidth="0.5" opacity="0.6"/>
    <line x1="8" y1="24" x2="40" y2="24" stroke="#754E1A" strokeWidth="0.5" opacity="0.6"/>
    <line x1="8" y1="32" x2="40" y2="32" stroke="#754E1A" strokeWidth="0.5" opacity="0.6"/>
    
    <line x1="16" y1="8" x2="16" y2="40" stroke="#754E1A" strokeWidth="0.5" opacity="0.6"/>
    <line x1="24" y1="8" x2="24" y2="40" stroke="#754E1A" strokeWidth="0.5" opacity="0.6"/>
    <line x1="32" y1="8" x2="32" y2="40" stroke="#754E1A" strokeWidth="0.5" opacity="0.6"/>
    
    {/* Waffle squares - indented look */}
    <rect x="12" y="12" width="4" height="4" fill="rgba(117, 78, 26, 0.1)"/>
    <rect x="20" y="12" width="4" height="4" fill="rgba(117, 78, 26, 0.1)"/>
    <rect x="28" y="12" width="4" height="4" fill="rgba(117, 78, 26, 0.1)"/>
    <rect x="36" y="12" width="4" height="4" fill="rgba(117, 78, 26, 0.1)"/>
    
    <rect x="12" y="20" width="4" height="4" fill="rgba(117, 78, 26, 0.1)"/>
    <rect x="20" y="20" width="4" height="4" fill="rgba(117, 78, 26, 0.1)"/>
    <rect x="28" y="20" width="4" height="4" fill="rgba(117, 78, 26, 0.1)"/>
    <rect x="36" y="20" width="4" height="4" fill="rgba(117, 78, 26, 0.1)"/>
    
    <rect x="12" y="28" width="4" height="4" fill="rgba(117, 78, 26, 0.1)"/>
    <rect x="20" y="28" width="4" height="4" fill="rgba(117, 78, 26, 0.1)"/>
    <rect x="28" y="28" width="4" height="4" fill="rgba(117, 78, 26, 0.1)"/>
    <rect x="36" y="28" width="4" height="4" fill="rgba(117, 78, 26, 0.1)"/>
    
    <rect x="12" y="36" width="4" height="4" fill="rgba(117, 78, 26, 0.1)"/>
    <rect x="20" y="36" width="4" height="4" fill="rgba(117, 78, 26, 0.1)"/>
    <rect x="28" y="36" width="4" height="4" fill="rgba(117, 78, 26, 0.1)"/>
    <rect x="36" y="36" width="4" height="4" fill="rgba(117, 78, 26, 0.1)"/>
    
    {/* Butter pat */}
    <ellipse cx="24" cy="24" rx="3" ry="2" fill="#F8E1B7" opacity="0.8"/>
    
    <defs>
      <linearGradient id="waffle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#CBA35C"/>
        <stop offset="50%" stopColor="#F8E1B7"/>
        <stop offset="100%" stopColor="#B6CBBD"/>
      </linearGradient>
    </defs>
  </svg>
);

export const SparkleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2l2.5 7.5L26 12l-7.5 2.5L16 22l-2.5-7.5L6 12l7.5-2.5L16 2z" 
          fill="url(#sparkle-gradient)" opacity="0.8"/>
    <path d="M24 6l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" 
          fill="url(#sparkle-gradient)" opacity="0.6"/>
    <path d="M8 20l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" 
          fill="url(#sparkle-gradient)" opacity="0.6"/>
    
    <defs>
      <linearGradient id="sparkle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#CBA35C"/>
        <stop offset="100%" stopColor="#B6CBBD"/>
      </linearGradient>
    </defs>
  </svg>
);
