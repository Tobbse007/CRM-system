'use client';

import { CheckSquare, Circle, Clock, CheckCircle2 } from 'lucide-react';
import type { Task } from '@/types';

interface TaskStatsProps {
  tasks: Task[];
  isLoading?: boolean;
}

export function TaskStats({ tasks, isLoading }: TaskStatsProps) {
  // Calculate statistics
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneTasks = tasks.filter((t) => t.status === 'DONE').length;
  
  // Completion rate
  const completionRate = totalTasks > 0 
    ? Math.round((doneTasks / totalTasks) * 100) 
    : 0;

  const stats = [
    {
      id: 'total',
      label: 'Gesamt Aufgaben',
      value: totalTasks,
      icon: CheckSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'todo',
      label: 'Offen',
      value: todoTasks,
      icon: Circle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      id: 'in_progress',
      label: 'In Arbeit',
      value: inProgressTasks,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      id: 'done',
      label: 'Erledigt',
      value: doneTasks,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      subtitle: `${completionRate}% abgeschlossen`,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="stat-card animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="stat-card hover-lift"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="text-3xl font-semibold tracking-tight text-gray-900">
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.subtitle}
                  </p>
                )}
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
