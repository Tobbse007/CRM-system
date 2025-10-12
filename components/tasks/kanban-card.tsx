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

  // Berechne wie nah das Datum ist (für Farbverlauf)
  const getDueDateColorClass = () => {
    if (!task.dueDate || task.status === 'DONE') return 'bg-gray-50 text-gray-600';
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      // Überfällig - Rot
      return 'bg-red-50 text-red-700 border border-red-200';
    } else if (diffDays <= 2) {
      // 0-2 Tage - Rot
      return 'bg-red-50 text-red-700 border border-red-200';
    } else if (diffDays <= 5) {
      // 3-5 Tage - Orange
      return 'bg-orange-50 text-orange-700 border border-orange-200';
    } else if (diffDays <= 7) {
      // 6-7 Tage - Gelb
      return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    } else {
      // > 7 Tage - Grau
      return 'bg-gray-50 text-gray-600';
    }
  };

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
              className={cn('p-5 cursor-grab active:cursor-grabbing relative', snapshot.isDragging && 'pointer-events-none select-none')}
            >
              {/* Grip Icon oben rechts */}
              <div className="absolute top-4 right-4 text-gray-300 group-hover:text-gray-400 transition-colors">
                <GripVertical className="h-5 w-5" />
              </div>

              {/* Titel & Beschreibung */}
              <div className="mb-4 pr-8">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-base text-gray-500 line-clamp-1">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Projekt & Kunde - anklickbar */}
              {task.project && (
                <div className="flex items-center gap-2 text-sm mb-4">
                  <Link
                    href={`/projects?project=${task.project.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors truncate pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {task.project.name}
                  </Link>
                  <span className="text-gray-400">•</span>
                  <Link
                    href={`/clients/${task.project.client.id}`}
                    className="text-gray-600 hover:text-blue-600 transition-colors truncate pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {task.project.client.name}
                  </Link>
                </div>
              )}

              {/* Due Date & Priorität nebeneinander */}
              <div className="flex items-center gap-2 mb-4">
                {/* Due Date - mit dynamischer Farbe */}
                {task.dueDate && (
                  <div
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded text-sm font-medium flex-1',
                      getDueDateColorClass()
                    )}
                  >
                    {isOverdue ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : isDueSoonTask ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <Calendar className="h-4 w-4" />
                    )}
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                )}
                
                {/* Priorität Dropdown - gleiche Höhe wie Datum */}
                <Select
                  value={task.priority}
                  onValueChange={(value) => {
                    onPriorityChange(task.id, value as TaskPriority);
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      'h-[38px] px-3 py-2 text-sm font-medium text-white border-0 pointer-events-auto',
                      'hover:opacity-90 transition-opacity w-[110px]',
                      '[&>svg]:hidden', // Verstecke das Chevron-Icon
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

              {/* Action Buttons - weniger Abstand oben/unten */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(task);
                  }}
                  className="h-9 px-3 text-sm text-gray-600 hover:text-blue-600 hover:bg-transparent transition-colors pointer-events-auto flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Details
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                  className="h-9 px-3 text-sm text-gray-600 hover:text-blue-600 hover:bg-transparent transition-colors pointer-events-auto flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
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
