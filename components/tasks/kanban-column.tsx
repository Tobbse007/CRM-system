'use client';

import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
}

export function KanbanColumn({ id, title, count, color, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Card 
      ref={setNodeRef}
      className={cn(
        'border-2 transition-all duration-300 min-h-[600px]',
        isOver ? 'ring-4 ring-blue-300 ring-opacity-50 scale-105 shadow-2xl' : 'shadow-lg hover:shadow-xl',
        color
      )}
    >
      <CardHeader className="pb-4 border-b-2 bg-gradient-to-r from-white/50 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            {title}
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={cn(
              'font-bold text-base px-3 py-1 shadow-sm',
              id === 'TODO' && 'bg-slate-200 text-slate-700',
              id === 'IN_PROGRESS' && 'bg-blue-200 text-blue-700',
              id === 'DONE' && 'bg-green-200 text-green-700'
            )}
          >
            {count}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {children}
      </CardContent>
    </Card>
  );
}
