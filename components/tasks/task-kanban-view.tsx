'use client';

import { TaskCardCompact } from './task-card-compact';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';
import { TaskStatus } from '@prisma/client';
import type { Task } from '@/types';

interface TaskKanbanViewProps {
  tasks: Task[];
  isLoading?: boolean;
  onEdit: (task: Task) => void;
}

export function TaskKanbanView({ tasks, isLoading, onEdit }: TaskKanbanViewProps) {
  const columns = [
    {
      id: 'TODO' as TaskStatus,
      title: 'Offen',
      icon: Circle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      tasks: tasks.filter((t) => t.status === 'TODO'),
    },
    {
      id: 'IN_PROGRESS' as TaskStatus,
      title: 'In Arbeit',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      tasks: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    },
    {
      id: 'DONE' as TaskStatus,
      title: 'Erledigt',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      tasks: tasks.filter((t) => t.status === 'DONE'),
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="card-modern p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-32 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map((column) => {
        const Icon = column.icon;
        return (
          <div key={column.id} className="space-y-3">
            {/* Column Header */}
            <div className={`card-modern p-4 ${column.bgColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${column.color}`} />
                  <h3 className={`font-semibold ${column.color}`}>
                    {column.title}
                  </h3>
                </div>
                <span className={`text-sm font-medium ${column.color}`}>
                  {column.tasks.length}
                </span>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {column.tasks.length === 0 ? (
                <div className="card-modern p-6 text-center">
                  <p className="text-sm text-gray-400">
                    Keine Aufgaben
                  </p>
                </div>
              ) : (
                column.tasks.map((task) => (
                  <TaskCardCompact
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
