'use client';

interface LogoProps {
  variant?: 'full' | 'icon' | 'text';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  dark?: boolean;
}

export default function Logo({ variant = 'full', className = '', size = 'md', dark = false }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  if (variant === 'icon') {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer indigo curved shapes (three hands/petals) */}
          <path d="M32 8 C28 12, 24 16, 20 20 C16 24, 12 28, 8 32 C12 36, 16 40, 20 44 C24 48, 28 52, 32 56 C36 52, 40 48, 44 44 C48 40, 52 36, 56 32 C52 28, 48 24, 44 20 C40 16, 36 12, 32 8 Z" fill="#4F46E5" opacity="0.9"/>
          <path d="M32 12 C30 14, 28 16, 26 18 C24 20, 22 22, 20 24 C18 26, 16 28, 14 30 C16 32, 18 34, 20 36 C22 38, 24 40, 26 42 C28 44, 30 46, 32 48 C34 46, 36 44, 38 42 C40 40, 42 38, 44 36 C46 34, 48 32, 50 30 C48 28, 46 26, 44 24 C42 22, 40 20, 38 18 C36 16, 34 14, 32 12 Z" fill="#4F46E5" opacity="0.8"/>
          <path d="M32 16 C30.5 17.5, 29 19, 27.5 20.5 C26 22, 24.5 23.5, 23 25 C21.5 26.5, 20 28, 18.5 29.5 C20 31, 21.5 32.5, 23 34 C24.5 35.5, 26 37, 27.5 38.5 C29 40, 30.5 41.5, 32 43 C33.5 41.5, 35 40, 36.5 38.5 C38 37, 39.5 35.5, 41 34 C42.5 32.5, 44 31, 45.5 29.5 C44 28, 42.5 26.5, 41 25 C39.5 23.5, 38 22, 36.5 20.5 C35 19, 33.5 17.5, 32 16 Z" fill="#4F46E5" opacity="0.7"/>
          {/* Central red element (flame/leaf shape) */}
          <ellipse cx="32" cy="32" rx="6" ry="18" fill="#DC2626" transform="rotate(0 32 32)"/>
          <ellipse cx="32" cy="32" rx="4" ry="14" fill="#EF4444" transform="rotate(0 32 32)"/>
        </svg>
      </div>
    );
  }

  if (variant === 'text') {
    const textColor = dark ? 'text-white' : 'text-orange-600';
    const subTextColor = dark ? 'text-indigo-200' : 'text-orange-500';
    const dividerColor = dark ? 'bg-indigo-300' : 'bg-indigo-600';
    
    return (
      <div className={`flex flex-col ${className}`}>
        <h1 className={`${textSizes[size]} font-bold ${textColor}`}>KripAnidhi</h1>
        <p className={`text-sm ${subTextColor}`}>Marketing Service</p>
        <div className={`h-px ${dividerColor} my-1`}></div>
        <p className={`text-xs ${subTextColor}`}>हर घर की जरूरत</p>
      </div>
    );
  }

  // Full logo with icon and text
  const textColor = dark ? 'text-white' : 'text-orange-600';
  const subTextColor = dark ? 'text-indigo-200' : 'text-orange-500';
  const dividerColor = dark ? 'bg-indigo-300' : 'bg-indigo-600';
  
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer indigo curved shapes (three hands/petals) */}
          <path d="M32 8 C28 12, 24 16, 20 20 C16 24, 12 28, 8 32 C12 36, 16 40, 20 44 C24 48, 28 52, 32 56 C36 52, 40 48, 44 44 C48 40, 52 36, 56 32 C52 28, 48 24, 44 20 C40 16, 36 12, 32 8 Z" fill="#4F46E5" opacity="0.9"/>
          <path d="M32 12 C30 14, 28 16, 26 18 C24 20, 22 22, 20 24 C18 26, 16 28, 14 30 C16 32, 18 34, 20 36 C22 38, 24 40, 26 42 C28 44, 30 46, 32 48 C34 46, 36 44, 38 42 C40 40, 42 38, 44 36 C46 34, 48 32, 50 30 C48 28, 46 26, 44 24 C42 22, 40 20, 38 18 C36 16, 34 14, 32 12 Z" fill="#4F46E5" opacity="0.8"/>
          <path d="M32 16 C30.5 17.5, 29 19, 27.5 20.5 C26 22, 24.5 23.5, 23 25 C21.5 26.5, 20 28, 18.5 29.5 C20 31, 21.5 32.5, 23 34 C24.5 35.5, 26 37, 27.5 38.5 C29 40, 30.5 41.5, 32 43 C33.5 41.5, 35 40, 36.5 38.5 C38 37, 39.5 35.5, 41 34 C42.5 32.5, 44 31, 45.5 29.5 C44 28, 42.5 26.5, 41 25 C39.5 23.5, 38 22, 36.5 20.5 C35 19, 33.5 17.5, 32 16 Z" fill="#4F46E5" opacity="0.7"/>
          {/* Central red element (flame/leaf shape) */}
          <ellipse cx="32" cy="32" rx="6" ry="18" fill="#DC2626" transform="rotate(0 32 32)"/>
          <ellipse cx="32" cy="32" rx="4" ry="14" fill="#EF4444" transform="rotate(0 32 32)"/>
        </svg>
      </div>
      <div className="flex flex-col">
        <h1 className={`${textSizes[size]} font-bold ${textColor}`}>KripAnidhi</h1>
        <p className={`text-sm ${subTextColor}`}>Marketing Service</p>
        <div className={`h-px ${dividerColor} my-1`}></div>
        <p className={`text-xs ${subTextColor}`}>हर घर की जरूरत</p>
      </div>
    </div>
  );
}

