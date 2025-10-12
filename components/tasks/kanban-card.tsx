'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Edit,
  GripVertical,
  ExternalLink,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { formatDate, isDueSoon } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { Task, TaskPriority } from '@/types';

interface KanbanCardProps {
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
  index: number;
  onEdit: (task: Task) => void;
}

export function KanbanCard({ task, index, onEdit }: KanbanCardProps) {
  const getPriorityConfig = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH':
        return {
          color: 'bg-red-500',
          label: 'Hoch',
        };
      case 'MEDIUM':
        return {
          color: 'bg-orange-500',
          label: 'Mittel',
        };
      case 'LOW':
        return {
          color: 'bg-blue-500',
          label: 'Niedrig',
        };
      default:
        return {
          color: 'bg-gray-500',
          label: 'Normal',
        };
    }
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const isDueSoonTask = task.dueDate && isDueSoon(task.dueDate) && task.status !== 'DONE';

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => {
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={provided.draggableProps.style}
            className={cn(
              'bg-white rounded-lg border border-gray-200 shadow-sm',
              snapshot.isDragging 
                ? 'shadow-2xl ring-2 ring-blue-400 opacity-90 cursor-grabbing [&]:!left-auto [&]:!top-auto' 
                : 'hover:shadow-md cursor-grab transition-shadow duration-150',
              isOverdue && !snapshot.isDragging && 'ring-2 ring-red-400'
            )}
          >
            <div className={cn('p-4', snapshot.isDragging ? 'pointer-events-none select-none' : '')}>
              {/* Header with Priority Badge */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-2">
                  <h3
                    className="font-semibold text-sm text-gray-900 mb-1 pointer-events-auto cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(task);
                    }}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
                {/* Drag indicator */}
                <div className="text-gray-300 flex-shrink-0">
                  <GripVertical className="h-5 w-5" />
                </div>
              </div>

            {/* Priority Badge */}
            <div className="mb-3">
              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-white', priorityConfig.color)}>
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                {priorityConfig.label}
              </span>
            </div>

            {/* Project & Client */}
            {task.project && (
              <div className="mb-3 space-y-1">
                <Link
                  href={`/projects/${task.project.id}`}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors group pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">{task.project.name}</span>
                </Link>
                <div className="text-xs text-gray-500 ml-4 truncate">
                  {task.project.client.name}
                </div>
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div
                className={cn(
                  'flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium',
                  isOverdue && 'bg-red-50 text-red-700 border border-red-200',
                  isDueSoonTask && !isOverdue && 'bg-orange-50 text-orange-700 border border-orange-200',
                  !isOverdue && !isDueSoonTask && 'bg-gray-50 text-gray-700'
                )}
              >
                {isOverdue ? (
                  <>
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span className="flex-1">{formatDate(task.dueDate)}</span>
                  </>
                ) : isDueSoonTask ? (
                  <>
                    <Clock className="h-3.5 w-3.5" />
                    <span className="flex-1">{formatDate(task.dueDate)}</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(task.dueDate)}</span>
                  </>
                )}
              </div>
            )}

            {/* Edit Button */}
            <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="h-7 px-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors text-xs pointer-events-auto"
              >
                <Edit className="h-3 w-3 mr-1" />
                Bearbeiten
              </Button>
            </div>
          </div>
        </div>
        );
      }}
    </Draggable>
  );
}
