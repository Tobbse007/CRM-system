'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortField = 'title' | 'status' | 'priority' | 'dueDate' | 'project';
export type SortDirection = 'asc' | 'desc' | null;

interface TaskListHeaderProps {
  sortField: SortField | null;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export function TaskListHeader({ sortField, sortDirection, onSort }: TaskListHeaderProps) {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 text-blue-600" />;
    }
    return <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  const headerButtonClass = (field: SortField) =>
    cn(
      'flex items-center gap-2 font-semibold text-sm text-gray-700 hover:text-blue-600 transition-colors cursor-pointer',
      sortField === field && 'text-blue-600'
    );

  return (
    <div className="card-modern px-4 py-3 mb-3 bg-gray-50 border border-gray-200">
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Priority */}
        <div className="col-span-1">
          <button onClick={() => onSort('priority')} className={headerButtonClass('priority')}>
            Priorität
            {renderSortIcon('priority')}
          </button>
        </div>

        {/* Title */}
        <div className="col-span-4">
          <button onClick={() => onSort('title')} className={headerButtonClass('title')}>
            Titel
            {renderSortIcon('title')}
          </button>
        </div>

        {/* Status */}
        <div className="col-span-2">
          <button onClick={() => onSort('status')} className={headerButtonClass('status')}>
            Status
            {renderSortIcon('status')}
          </button>
        </div>

        {/* Project */}
        <div className="col-span-2">
          <button onClick={() => onSort('project')} className={headerButtonClass('project')}>
            Projekt
            {renderSortIcon('project')}
          </button>
        </div>

        {/* Due Date */}
        <div className="col-span-2">
          <button onClick={() => onSort('dueDate')} className={headerButtonClass('dueDate')}>
            Fälligkeitsdatum
            {renderSortIcon('dueDate')}
          </button>
        </div>

        {/* Actions */}
        <div className="col-span-1 text-right">
          <span className="font-semibold text-sm text-gray-700">Aktionen</span>
        </div>
      </div>
    </div>
  );
}
