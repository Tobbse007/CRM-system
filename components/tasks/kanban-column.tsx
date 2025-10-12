'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  title: string;
  count: number;
  percentage: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  isDraggingOver: boolean;
  children: React.ReactNode;
}

export function KanbanColumn({
  title,
  count,
  percentage,
  icon: Icon,
  color,
  bgColor,
  isDraggingOver,
  children,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Column Header - Clean and Simple */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded', bgColor)}>
              <Icon className={cn('h-4 w-4', color)} />
            </div>
            <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{percentage}%</span>
            <span className={cn('font-bold text-lg', color)}>{count}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-500', color.replace('text-', 'bg-'))}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className={cn(
          'flex-1 rounded-lg border-2 p-3 transition-all duration-200',
          isDraggingOver
            ? 'border-blue-400 bg-blue-50/50 border-solid'
            : 'border-dashed border-gray-200 bg-gray-50/30'
        )}
      >
        {children}
      </div>
    </div>
  );
}
