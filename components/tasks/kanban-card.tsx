'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Edit,
  GripVertical,
  ExternalLink,
  AlertCircle,
  Clock,
  Eye,
  ChevronRight,
  GripVertical as GripIcon,
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
  onPriorityChange: (taskId: string, newPriority: TaskPriority) => void;
  onViewDetails: (task: Task) => void;
}

export function KanbanCard({ task, index, onEdit, onPriorityChange, onViewDetails }: KanbanCardProps) {
  const getPriorityConfig = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH':
        return {
          color: 'bg-red-500',
          label: 'Schwer',
        };
      case 'MEDIUM':
        return {
          color: 'bg-orange-500',
          label: 'Mittel',
        };
      case 'LOW':
        return {
          color: 'bg-blue-500',
          label: 'Einfach',
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
              className={cn('p-4 cursor-grab active:cursor-grabbing relative', snapshot.isDragging && 'pointer-events-none select-none')}
            >
              {/* Grip Icon oben rechts */}
              <div className="absolute top-3 right-3 text-gray-300 group-hover:text-gray-400 transition-colors">
                <GripVertical className="h-5 w-5" />
              </div>

              {/* Titel & Beschreibung */}
              <div className="mb-3 pr-8">
                <h3 className="font-semibold text-base text-gray-900 mb-1.5 line-clamp-2">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Projekt & Kunde - kompakt */}
              {task.project && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
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

              {/* Due Date & Priorität nebeneinander */}
              <div className="flex items-center gap-2 mb-3">
                {/* Due Date */}
                {task.dueDate && (
                  <div
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium flex-1',
                      isOverdue && 'bg-red-50 text-red-700',
                      isDueSoonTask && !isOverdue && 'bg-orange-50 text-orange-700',
                      !isOverdue && !isDueSoonTask && 'bg-gray-50 text-gray-600'
                    )}
                  >
                    {isOverdue ? (
                      <AlertCircle className="h-3.5 w-3.5" />
                    ) : isDueSoonTask ? (
                      <Clock className="h-3.5 w-3.5" />
                    ) : (
                      <Calendar className="h-3.5 w-3.5" />
                    )}
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                )}
                
                {/* Priorität Dropdown */}
                <Select
                  value={task.priority}
                  onValueChange={(value) => {
                    onPriorityChange(task.id, value as TaskPriority);
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      'h-auto px-2.5 py-1.5 text-xs font-medium text-white border-0 pointer-events-auto',
                      'hover:opacity-90 transition-opacity w-[100px]',
                      priorityConfig.color
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white pointer-events-auto">
                    <SelectItem 
                      value="HIGH" 
                      className="cursor-pointer hover:bg-red-50 focus:bg-red-50"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        Schwer
                      </span>
                    </SelectItem>
                    <SelectItem 
                      value="MEDIUM" 
                      className="cursor-pointer hover:bg-orange-50 focus:bg-orange-50"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                        Mittel
                      </span>
                    </SelectItem>
                    <SelectItem 
                      value="LOW" 
                      className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        Einfach
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons - kompakt */}
              <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(task);
                  }}
                  className="h-7 px-2.5 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors pointer-events-auto flex-1"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Details
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                  className="h-7 px-2.5 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors pointer-events-auto flex-1"
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
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
