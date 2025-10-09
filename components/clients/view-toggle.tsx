'use client';

import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ViewType = 'grid' | 'table';

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('grid')}
        className={cn(
          'h-8 gap-2 transition-all',
          view === 'grid'
            ? 'bg-white text-blue-600 shadow-sm hover:bg-white hover:text-blue-600'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="text-sm font-medium">Grid</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('table')}
        className={cn(
          'h-8 gap-2 transition-all',
          view === 'table'
            ? 'bg-white text-blue-600 shadow-sm hover:bg-white hover:text-blue-600'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        )}
      >
        <List className="h-4 w-4" />
        <span className="text-sm font-medium">Tabelle</span>
      </Button>
    </div>
  );
}
