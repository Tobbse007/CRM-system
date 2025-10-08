'use client';

import { LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewMode = 'table' | 'grid';

interface ProjectViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ProjectViewToggle({ view, onViewChange }: ProjectViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      <Button
        variant={view === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className={`
          h-8 px-3
          ${view === 'table' 
            ? 'bg-white shadow-sm hover:bg-white' 
            : 'hover:bg-gray-200/50'
          }
        `}
      >
        <LayoutList className="h-4 w-4 mr-2" />
        Tabelle
      </Button>
      <Button
        variant={view === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className={`
          h-8 px-3
          ${view === 'grid' 
            ? 'bg-white shadow-sm hover:bg-white' 
            : 'hover:bg-gray-200/50'
          }
        `}
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        Karten
      </Button>
    </div>
  );
}
