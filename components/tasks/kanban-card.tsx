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
  Eye,
  ChevronRight,
} from 'lucide-react';
import { formatDate, isDueSoon } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { Task, TaskPriority, TaskStatus } from '@/types';

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
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onViewDetails: (task: Task) => void;
}

export function KanbanCard({ task, index, onEdit, onStatusChange, onViewDetails }: KanbanCardProps) {
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

  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return { label: 'Offen', color: 'text-gray-700' };
      case 'IN_PROGRESS':
        return { label: 'In Arbeit', color: 'text-blue-600' };
      case 'DONE':
        return { label: 'Erledigt', color: 'text-green-600' };
      default:
        return { label: status, color: 'text-gray-700' };
    }
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const isDueSoonTask = task.dueDate && isDueSoon(task.dueDate) && task.status !== 'DONE';

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => {
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={provided.draggableProps.style}
            className={cn(
              'bg-white rounded-lg border border-gray-200 shadow-sm group',
              snapshot.isDragging 
                ? 'shadow-2xl ring-2 ring-blue-400 opacity-90 cursor-grabbing [&]:!left-auto [&]:!top-auto' 
                : 'hover:shadow-md hover:border-blue-200 transition-all duration-150',
              isOverdue && !snapshot.isDragging && 'ring-2 ring-red-400'
            )}
          >
            <div 
              {...provided.dragHandleProps}
              className={cn('p-3 cursor-grab active:cursor-grabbing', snapshot.isDragging && 'pointer-events-none select-none')}
            >
              {/* Titel & Beschreibung */}
              <div className="mb-2">
                <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Priorität & Status in einer Zeile */}
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-white', priorityConfig.color)}>
                  {priorityConfig.label}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
                    const currentIndex = statuses.indexOf(task.status);
                    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                    onStatusChange(task.id, nextStatus);
                  }}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors pointer-events-auto',
                    'hover:bg-gray-100 border border-gray-200',
                    statusConfig.color
                  )}
                >
                  {statusConfig.label}
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {/* Projekt & Kunde - kompakt */}
              {task.project && (
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-2">
                  <Link
                    href={`/projects/${task.project.id}`}
                    className="hover:text-blue-600 transition-colors truncate pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {task.project.name}
                  </Link>
                  <span>•</span>
                  <span className="truncate">{task.project.client.name}</span>
                </div>
              )}

              {/* Due Date - kompakter */}
              {task.dueDate && (
                <div
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium mb-2',
                    isOverdue && 'bg-red-50 text-red-700',
                    isDueSoonTask && !isOverdue && 'bg-orange-50 text-orange-700',
                    !isOverdue && !isDueSoonTask && 'bg-gray-50 text-gray-600'
                  )}
                >
                  {isOverdue ? (
                    <AlertCircle className="h-3 w-3" />
                  ) : isDueSoonTask ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <Calendar className="h-3 w-3" />
                  )}
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}

              {/* Action Buttons - kompakt */}
              <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(task);
                  }}
                  className="h-6 px-2 text-[11px] text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors pointer-events-auto flex-1"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                  className="h-6 px-2 text-[11px] text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors pointer-events-auto flex-1"
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
