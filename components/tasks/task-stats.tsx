'use client';

import { CheckSquare, Circle, Clock, CheckCircle2 } from 'lucide-react';
import type { Task } from '@/types';
import { useCounterAnimation } from '@/hooks/use-counter-animation';
import { useEffect, useState } from 'react';

interface TaskStatsProps {
  tasks: Task[];
  isLoading?: boolean;
}

export function TaskStats({ tasks, isLoading }: TaskStatsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate statistics
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneTasks = tasks.filter((t) => t.status === 'DONE').length;
  
  // Completion rate
  const completionRate = totalTasks > 0 
    ? Math.round((doneTasks / totalTasks) * 100) 
    : 0;

  // Counter animations
  const animatedTotal = useCounterAnimation(mounted ? totalTasks : 0, 1200);
  const animatedTodo = useCounterAnimation(mounted ? todoTasks : 0, 1400);
  const animatedInProgress = useCounterAnimation(mounted ? inProgressTasks : 0, 1600);
  const animatedDone = useCounterAnimation(mounted ? doneTasks : 0, 1800);

  const stats = [
    {
      id: 'total',
      label: 'Gesamt Aufgaben',
      value: animatedTotal,
      suffix: '',
      icon: CheckSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'todo',
      label: 'Offen',
      value: animatedTodo,
      suffix: '',
      icon: Circle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      id: 'in_progress',
      label: 'In Arbeit',
      value: animatedInProgress,
      suffix: '',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      id: 'done',
      label: 'Erledigt',
      value: animatedDone,
      suffix: '',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      subtitle: `${completionRate}% abgeschlossen`,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="stat-card animate-pulse min-w-0"
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="stat-card hover-lift opacity-0 animate-fade-in-up min-w-0"
            style={{ 
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <div className="flex items-center justify-between w-full">
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 whitespace-nowrap">
                  {stat.label}
                </p>
                <p className="text-3xl font-semibold tracking-tight text-gray-900 whitespace-nowrap">
                  {stat.value}{stat.suffix}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.subtitle}
                  </p>
                )}
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl flex-shrink-0 w-[52px] h-[52px] flex items-center justify-center`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
