'use client';

import { LayoutGrid, LayoutList } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'table' | 'grid';

interface ProjectViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ProjectViewToggle({ view, onViewChange }: ProjectViewToggleProps) {
  return (
    <div className="relative inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {/* Sliding Background */}
      <div
        className={cn(
          'absolute top-1 h-8 bg-white shadow-sm rounded-md transition-all duration-300 ease-in-out',
          view === 'table' ? 'left-1 w-[102px]' : 'left-[107px] w-[92px]'
        )}
      />
      
      {/* Table Button */}
      <button
        onClick={() => onViewChange('table')}
        className={cn(
          'relative z-10 h-8 px-3 gap-2 inline-flex items-center rounded-md transition-colors duration-300',
          view === 'table'
            ? 'text-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        )}
      >
        <LayoutList className="h-4 w-4" />
        <span className="text-sm font-medium">Tabelle</span>
      </button>
      
      {/* Grid Button */}
      <button
        onClick={() => onViewChange('grid')}
        className={cn(
          'relative z-10 h-8 px-3 gap-2 inline-flex items-center rounded-md transition-colors duration-300',
          view === 'grid'
            ? 'text-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="text-sm font-medium">Karten</span>
      </button>
    </div>
  );
}
