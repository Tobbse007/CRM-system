'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Edit, ExternalLink, ArrowUp, Minus, ArrowDown, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { TaskStatus, TaskPriority } from '@prisma/client';
import Link from 'next/link';
import type { Task } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TaskListRowProps {
  task: Task & {
    project?: {
      id: string;
      name: string;
      client: {
        id: string;
        name: string;
      };
    };
  };
  onEdit: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => Promise<void>;
}

export function TaskListRow({ task, onEdit, onStatusChange }: TaskListRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return { label: 'Offen', color: 'bg-gray-100 text-gray-700 border-gray-300' };
      case TaskStatus.IN_PROGRESS:
        return { label: 'In Arbeit', color: 'bg-blue-100 text-blue-700 border-blue-300' };
      case TaskStatus.DONE:
        return { label: 'Erledigt', color: 'bg-green-100 text-green-700 border-green-300' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700 border-gray-300' };
    }
  };

  const getPriorityConfig = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return {
          icon: ArrowUp,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          label: 'Hoch',
        };
      case TaskPriority.MEDIUM:
        return {
          icon: Minus,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          label: 'Mittel',
        };
      case TaskPriority.LOW:
        return {
          icon: ArrowDown,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          label: 'Niedrig',
        };
      default:
        return {
          icon: Minus,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          label: 'Normal',
        };
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = getPriorityConfig(task.priority);
  const PriorityIcon = priorityConfig.icon;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  const handleStatusChange = async (newStatus: string) => {
    if (onStatusChange && newStatus !== task.status) {
      setIsUpdating(true);
      try {
        await onStatusChange(task.id, newStatus as TaskStatus);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div
      className={cn(
        'card-modern p-4 hover-lift transition-all cursor-pointer group',
        isOverdue && 'border-red-300 bg-red-50/30 ring-1 ring-red-200'
      )}
      onClick={() => onEdit(task)}
    >
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Priority Icon */}
        <div className="col-span-1 flex items-center justify-center">
          <div className={cn('p-2 rounded-lg', priorityConfig.bgColor)}>
            <PriorityIcon className={cn('h-4 w-4', priorityConfig.color)} />
          </div>
        </div>

        {/* Title & Description */}
        <div className="col-span-4 min-w-0">
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{task.description}</p>
          )}
        </div>

        {/* Status */}
        <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
          <Select value={task.status} onValueChange={handleStatusChange} disabled={isUpdating}>
            <SelectTrigger className={cn('h-9 border font-medium', statusConfig.color)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem
                value="TODO"
                className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
              >
                Offen
              </SelectItem>
              <SelectItem
                value="IN_PROGRESS"
                className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
              >
                In Arbeit
              </SelectItem>
              <SelectItem
                value="DONE"
                className="cursor-pointer hover:bg-green-50 focus:bg-green-50"
              >
                Erledigt
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Project */}
        <div className="col-span-2 min-w-0">
          {task.project ? (
            <Link
              href={`/projects/${task.project.id}`}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors truncate w-fit max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{task.project.name}</span>
            </Link>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>

        {/* Due Date */}
        <div className="col-span-2">
          {task.dueDate ? (
            <div
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium',
                isOverdue ? 'text-red-600' : 'text-gray-700'
              )}
            >
              {isOverdue ? (
                <AlertCircle className="h-4 w-4 animate-pulse" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              <span>{formatDate(task.dueDate)}</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>

        {/* Actions */}
        <div className="col-span-1 flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
