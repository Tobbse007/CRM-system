'use client';

import { LayoutGrid, LayoutList } from 'lucide-react';
import { cn } from '@/lib/utils';

type TaskViewMode = 'list' | 'kanban';

interface TaskViewToggleProps {
  view: TaskViewMode;
  onViewChange: (view: TaskViewMode) => void;
}

export function TaskViewToggle({ view, onViewChange }: TaskViewToggleProps) {
  return (
    <div className="relative inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {/* Sliding Background */}
      <div
        className={cn(
          'absolute top-1 h-8 bg-white shadow-sm rounded-md transition-all duration-300 ease-in-out',
          view === 'kanban' ? 'left-1 w-[102px]' : 'left-[107px] w-[82px]'
        )}
      />
      
      {/* Kanban Button */}
      <button
        onClick={() => onViewChange('kanban')}
        className={cn(
          'relative z-10 h-8 px-3 gap-2 inline-flex items-center rounded-md transition-colors duration-300',
          view === 'kanban'
            ? 'text-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="text-sm font-medium">Kanban</span>
      </button>
      
      {/* List Button */}
      <button
        onClick={() => onViewChange('list')}
        className={cn(
          'relative z-10 h-8 px-3 gap-2 inline-flex items-center rounded-md transition-colors duration-300',
          view === 'list'
            ? 'text-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        )}
      >
        <LayoutList className="h-4 w-4" />
        <span className="text-sm font-medium">Liste</span>
      </button>
    </div>
  );
}
