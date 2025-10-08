'use client';

import { lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/stat-card';
import { 
  Users, 
  FolderKanban, 
  CheckSquare, 
  TrendingUp,
  Clock,
  ExternalLink,
  BarChart3,
  Eye,
  DollarSign,
} from 'lucide-react';
import { formatCurrency, formatDate, isDueSoon } from '@/lib/utils';
import type { ProjectWithClient, Task } from '@/types';

// Lazy load Charts for better performance
const ProjectStatusChart = lazy(() => 
  import('@/components/charts').then(mod => ({ default: mod.ProjectStatusChart }))
);
const TaskProgressChart = lazy(() => 
  import('@/components/charts').then(mod => ({ default: mod.TaskProgressChart }))
);
const TeamPerformanceTable = lazy(() => 
  import('@/components/charts').then(mod => ({ default: mod.TeamPerformanceTable }))
);

type DashboardStats = {
  clients: {
    total: number;
    active: number;
    inactive: number;
  };
  projects: {
    total: number;
    planning: number;
    inProgress: number;
    review: number;
    completed: number;
    onHold: number;
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  };
  budget: {
    total: number;
  };
  recentProjects: ProjectWithClient[];
  dueTasks: Array<Task & { project: ProjectWithClient }>;
};

type AnalyticsData = {
  projectBudgets: Array<{
    name: string;
    budget: number;
    timeSpent: number;
  }>;
  activityTrend: Array<{
    date: string;
    count: number;
  }>;
  clientStats: Array<{
    name: string;
    projects: number;
    tasks: number;
  }>;
  teamStats: Array<{
    name: string;
    email: string;
    totalTasks: number;
    doneTasks: number;
    completionRate: number;
    hoursLogged: number;
  }>;
};

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/stats');
  const result = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error('Statistiken konnten nicht geladen werden');
  }
  
  return result.data;
}

async function fetchAnalytics(): Promise<AnalyticsData> {
  const response = await fetch('/api/analytics');
  const result = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error('Analytics konnten nicht geladen werden');
  }
  
  return result.data;
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 30000, // 30 seconds
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-48 skeleton rounded mb-2" />
          <div className="h-5 w-96 skeleton rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card">
              <div className="h-4 w-24 skeleton rounded mb-3" />
              <div className="h-10 w-32 skeleton rounded mb-2" />
              <div className="h-4 w-20 skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-600">Fehler beim Laden der Statistiken</div>
      </div>
    );
  }

  const completionRate = stats.tasks.total > 0 
    ? ((stats.tasks.done / stats.tasks.total) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6 fade-in">
      {/* Header - Minimal & Clean */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Willkommen zurück! Hier ist eine Übersicht Ihrer Projekte.
        </p>
      </div>

      {/* Stats Grid - Like Nexus Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Page Views"
          value="12,450"
          trend={{ value: "18.8%", isPositive: true }}
          icon={Eye}
          iconColor="text-blue-500"
        />
        
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.budget.total)}
          trend={{ value: "34.0%", isPositive: false }}
          icon={DollarSign}
          iconColor="text-green-500"
        />
        
        <StatCard
          title="Kunden"
          value={stats.clients.total}
          trend={{ value: `${stats.clients.active} aktiv`, isPositive: true }}
          icon={Users}
          iconColor="text-purple-500"
        />
        
        <StatCard
          title="Projekte"
          value={stats.projects.total}
          trend={{ value: `${completionRate}% fertig`, isPositive: true }}
          icon={FolderKanban}
          iconColor="text-cyan-500"
        />
      </div>

      {/* Analytics Section */}
      {!analyticsLoading && analytics && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Sales Overview
            </h2>
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-sm">
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                <span className="inline-flex items-center gap-1">
                  📊 Filter
                </span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                <span className="inline-flex items-center gap-1">
                  ↕️ Sort
                </span>
              </Button>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card-modern p-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                Projekt Status
              </h3>
              <Suspense fallback={<div className="h-64 skeleton rounded" />}>
                <ProjectStatusChart
                  planning={stats.projects.planning}
                  inProgress={stats.projects.inProgress}
                  review={stats.projects.review}
                  completed={stats.projects.completed}
                  onHold={stats.projects.onHold}
                />
              </Suspense>
            </div>
            
            <div className="card-modern p-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                Aufgaben Fortschritt
              </h3>
              <Suspense fallback={<div className="h-64 skeleton rounded" />}>
                <TaskProgressChart
                  todo={stats.tasks.todo}
                  inProgress={stats.tasks.inProgress}
                  done={stats.tasks.done}
                />
              </Suspense>
            </div>
          </div>

          {/* Team Performance */}
          {analytics.teamStats && analytics.teamStats.length > 0 && (
            <div className="card-modern p-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                Team Performance
              </h3>
              <Suspense fallback={<div className="h-48 skeleton rounded" />}>
                <TeamPerformanceTable teamStats={analytics.teamStats} />
              </Suspense>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Projects */}
        {stats.recentProjects && stats.recentProjects.length > 0 && (
          <div className="card-modern p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Letzte Projekte</h3>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs hover-lift">
                <Link href="/projects" className="flex items-center gap-1">
                  Alle <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            
            <div className="space-y-2">
              {stats.recentProjects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-fast border border-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {project.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {project.client.name}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                    {project.status === 'IN_PROGRESS' ? 'In Arbeit' : 
                     project.status === 'PLANNING' ? 'Planung' :
                     project.status === 'REVIEW' ? 'Review' :
                     project.status === 'COMPLETED' ? 'Fertig' : 'Pausiert'}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Due Tasks */}
        {stats.dueTasks && stats.dueTasks.length > 0 ? (
          <div className="card-modern p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Fällige Aufgaben</h3>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            
            <div className="space-y-2">
              {stats.dueTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between p-3 rounded-lg hover:bg-orange-50/50 transition-fast border border-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {task.project.name}
                    </div>
                  </div>
                  {task.dueDate && (
                    <Badge 
                      variant={isDueSoon(task.dueDate) ? "destructive" : "outline"}
                      className="text-xs ml-2 flex-shrink-0"
                    >
                      {formatDate(task.dueDate)}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card-modern p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Fällige Aufgaben</h3>
              <Clock className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-center py-8">
              <CheckSquare className="h-10 w-10 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Keine fälligen Aufgaben
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
