'use client';

import { Folder, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { ProjectWithClient } from '@/types';

interface ProjectStatsProps {
  projects: ProjectWithClient[];
  isLoading?: boolean;
}

export function ProjectStats({ projects, isLoading }: ProjectStatsProps) {
  // Calculate statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (p) => p.status === 'IN_PROGRESS' || p.status === 'PLANNING'
  ).length;
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  const stats = [
    {
      id: 'total',
      label: 'Gesamt Projekte',
      value: totalProjects,
      icon: Folder,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'active',
      label: 'Aktive Projekte',
      value: activeProjects,
      icon: Clock,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      id: 'completed',
      label: 'Abgeschlossen',
      value: completedProjects,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'budget',
      label: 'Gesamt Budget',
      value: formatCurrency(totalBudget),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
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
