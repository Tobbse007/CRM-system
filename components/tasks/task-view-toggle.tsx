'use client';

import { LayoutList, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TaskViewMode = 'list' | 'kanban';

interface TaskViewToggleProps {
  view: TaskViewMode;
  onViewChange: (view: TaskViewMode) => void;
}

export function TaskViewToggle({ view, onViewChange }: TaskViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className={`
          h-8 px-3
          ${view === 'list' 
            ? 'bg-white shadow-sm hover:bg-white' 
            : 'hover:bg-gray-200/50'
          }
        `}
      >
        <LayoutList className="h-4 w-4 mr-2" />
        Liste
      </Button>
      <Button
        variant={view === 'kanban' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('kanban')}
        className={`
          h-8 px-3
          ${view === 'kanban' 
            ? 'bg-white shadow-sm hover:bg-white' 
            : 'hover:bg-gray-200/50'
          }
        `}
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        Kanban
      </Button>
    </div>
  );
}
