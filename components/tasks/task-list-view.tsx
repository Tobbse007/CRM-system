'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FolderOpen, Edit, ArrowUp, Minus, ArrowDown, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { TaskStatus, TaskPriority } from '@prisma/client';
import Link from 'next/link';
import type { Task } from '@/types';

interface TaskListViewProps {
  tasks: Task[];
  isLoading?: boolean;
  onEdit: (task: Task) => void;
}

export function TaskListView({ tasks, isLoading, onEdit }: TaskListViewProps) {
  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return { label: 'Offen', color: 'text-gray-700 bg-gray-50 border-gray-200' };
      case TaskStatus.IN_PROGRESS:
        return { label: 'In Arbeit', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
      case TaskStatus.DONE:
        return { label: 'Erledigt', color: 'text-green-700 bg-green-50 border-green-200' };
      default:
        return { label: status, color: 'text-gray-700 bg-gray-50 border-gray-200' };
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return <ArrowUp className="h-4 w-4 text-red-600" />;
      case TaskPriority.MEDIUM:
        return <Minus className="h-4 w-4 text-orange-600" />;
      case TaskPriority.LOW:
        return <ArrowDown className="h-4 w-4 text-blue-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card-modern p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-5 w-5 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="card-modern p-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Keine Aufgaben gefunden
        </h3>
        <p className="text-sm text-gray-500">
          Erstellen Sie eine neue Aufgabe, um loszulegen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const statusConfig = getStatusConfig(task.status);
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

        return (
          <div
            key={task.id}
            className={`
              card-modern p-4 hover-lift transition-all cursor-pointer
              ${isOverdue ? 'border-red-200 bg-red-50/20' : ''}
            `}
            onClick={() => onEdit(task)}
          >
            <div className="flex items-start gap-4">
              {/* Priority Icon */}
              <div className="flex-shrink-0 mt-1">
                {getPriorityIcon(task.priority)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {task.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`${statusConfig.color} border font-medium flex-shrink-0`}
                  >
                    {statusConfig.label}
                  </Badge>
                </div>

                {task.description && (
                  <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-600">
                  {/* Due Date */}
                  {task.dueDate && (
                    <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{formatDate(task.dueDate)}</span>
                      {isOverdue && <span className="text-red-600 font-semibold">(Überfällig)</span>}
                    </div>
                  )}

                  {/* Project */}
                  {task.project && (
                    <Link
                      href={`/projects/${task.project.id}`}
                      className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FolderOpen className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{task.project.name}</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
