import React from 'react';
import Image from 'next/image';

interface UserAvatarProps {
  name: string;
  avatar?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

// Generate a consistent color based on name
function getColorFromName(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

// Get initials from name
function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserAvatar({ name, avatar, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClass = sizeClasses[size];
  const colorClass = getColorFromName(name);
  const initials = getInitials(name);

  if (avatar) {
    return (
      <div className={`relative ${sizeClass} rounded-full overflow-hidden ${className}`}>
        <Image
          src={avatar}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center text-white font-medium ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
}
