'use client';

import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewType = 'grid' | 'table';

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="relative inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {/* Sliding Background */}
      <div
        className={cn(
          'absolute top-1 h-8 bg-white shadow-sm rounded-md transition-all duration-300 ease-in-out',
          view === 'grid' ? 'left-1 w-[82px]' : 'left-[87px] w-[102px]'
        )}
      />
      
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
        <span className="text-sm font-medium">Grid</span>
      </button>
      
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
        <List className="h-4 w-4" />
        <span className="text-sm font-medium">Tabelle</span>
      </button>
    </div>
  );
}
