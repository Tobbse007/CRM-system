'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, AlertCircle, ArrowUp, Minus, ArrowDown, FolderOpen, Edit } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { TaskPriority } from '@prisma/client';
import Link from 'next/link';
import type { Task } from '@/types';

interface TaskCardCompactProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskCardCompact({ task, onEdit }: TaskCardCompactProps) {
  const getPriorityConfig = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return {
          label: 'Hoch',
          icon: ArrowUp,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case TaskPriority.MEDIUM:
        return {
          label: 'Mittel',
          icon: Minus,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
        };
      case TaskPriority.LOW:
        return {
          label: 'Niedrig',
          icon: ArrowDown,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      default:
        return {
          label: priority,
          icon: Minus,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const PriorityIcon = priorityConfig.icon;

  // Check if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div 
      className={`
        group card-modern hover-lift transition-all duration-200 cursor-pointer
        ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}
      `}
      onClick={() => onEdit(task)}
    >
      <div className="p-4">
        {/* Priority Badge */}
        <div className="flex items-center justify-between mb-2">
          <Badge
            variant="outline"
            className={`${priorityConfig.color} ${priorityConfig.bgColor} border ${priorityConfig.borderColor} font-medium text-xs`}
          >
            <PriorityIcon className="h-3 w-3 mr-1" />
            {priorityConfig.label}
          </Badge>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Überfällig
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className={`flex items-center gap-1.5 text-xs mb-3 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-gray-100 my-3"></div>

        {/* Footer with Project & Edit */}
        <div className="flex items-center justify-between gap-2">
          {task.projectId ? (
            <Link
              href={`/projects/${task.projectId}`}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 transition-colors flex-1 min-w-0"
              onClick={(e) => e.stopPropagation()}
            >
              <FolderOpen className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">Projekt</span>
            </Link>
          ) : (
            <span className="text-xs text-gray-400 italic flex-1">Kein Projekt</span>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
