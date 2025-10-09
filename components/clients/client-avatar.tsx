'use client';

import { cn } from '@/lib/utils';

interface ClientAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Generate consistent color based on name
const getColorFromName = (name: string) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-orange-500',
  ];
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Get initials from name (max 2 characters)
const getInitials = (name: string): string => {
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export function ClientAvatar({ name, size = 'md', className }: ClientAvatarProps) {
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full text-white font-semibold flex-shrink-0',
        bgColor,
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  );
}
