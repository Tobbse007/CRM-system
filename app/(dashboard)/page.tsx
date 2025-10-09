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

// New 3D Charts
const RevenueChart3D = lazy(() =>
  import('@/components/charts').then(mod => ({ default: mod.RevenueChart3D }))
);
const ProjectDistribution3D = lazy(() =>
  import('@/components/charts').then(mod => ({ default: mod.ProjectDistribution3D }))
);
const TaskCompletion3D = lazy(() =>
  import('@/components/charts').then(mod => ({ default: mod.TaskCompletion3D }))
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

  // Mock data for 3D Charts (until API is extended)
  const revenueData = [
    { month: 'Jan', revenue: 45000, expenses: 28000, profit: 17000 },
    { month: 'Feb', revenue: 52000, expenses: 31000, profit: 21000 },
    { month: 'Mär', revenue: 48000, expenses: 29000, profit: 19000 },
    { month: 'Apr', revenue: 61000, expenses: 35000, profit: 26000 },
    { month: 'Mai', revenue: 55000, expenses: 32000, profit: 23000 },
    { month: 'Jun', revenue: 67000, expenses: 38000, profit: 29000 },
    { month: 'Jul', revenue: 72000, expenses: 41000, profit: 31000 },
    { month: 'Aug', revenue: 68000, expenses: 39000, profit: 29000 },
  ];

  const taskCompletionData = [
    { week: 'KW 38', completed: 12, created: 15, completionRate: 80 },
    { week: 'KW 39', completed: 18, created: 20, completionRate: 90 },
    { week: 'KW 40', completed: 15, created: 18, completionRate: 83 },
    { week: 'KW 41', completed: 22, created: 25, completionRate: 88 },
    { week: 'KW 42', completed: 20, created: 22, completionRate: 91 },
    { week: 'KW 43', completed: 25, created: 28, completionRate: 89 },
    { week: 'KW 44', completed: 19, created: 21, completionRate: 90 },
    { week: 'KW 45', completed: 24, created: 26, completionRate: 92 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 fade-in">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-9 w-56 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-modern p-6">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="h-10 w-32 bg-gray-300 rounded-lg animate-pulse mb-3" />
              <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="space-y-8 pt-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-200 to-purple-200 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-64 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
          
          <div className="h-[520px] card-modern animate-pulse" />
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="h-[550px] card-modern animate-pulse" />
            <div className="h-[550px] card-modern animate-pulse" />
          </div>
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
    <div className="space-y-8 fade-in">
      {/* Header - Apple Minimal */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Willkommen zurück! Hier ist eine Übersicht Ihrer Projekte.
        </p>
      </div>

      {/* Stats Grid - Apple Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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

      {/* 3D Analytics Charts - Premium Section */}
      <div className="space-y-8 pt-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
              Advanced Analytics
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Detaillierte Einblicke in Performance und Trends
            </p>
          </div>
        </div>

        {/* Revenue Chart - Full Width */}
        <Suspense fallback={<div className="h-[520px] card-modern animate-pulse" />}>
          <RevenueChart3D data={revenueData} isLoading={isLoading} />
        </Suspense>

        {/* Distribution & Completion - Side by Side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Suspense fallback={<div className="h-[550px] card-modern animate-pulse" />}>
            <ProjectDistribution3D 
              data={{
                planning: stats.projects.planning,
                inProgress: stats.projects.inProgress,
                review: stats.projects.review,
                completed: stats.projects.completed,
                onHold: stats.projects.onHold,
              }}
              isLoading={isLoading}
            />
          </Suspense>

          <Suspense fallback={<div className="h-[550px] card-modern animate-pulse" />}>
            <TaskCompletion3D data={taskCompletionData} isLoading={isLoading} />
          </Suspense>
        </div>
      </div>

      {/* Recent Activity - Apple Clean Layout */}
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg shadow-gray-500/25">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
              Recent Activity
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Ihre neuesten Projekte und fälligen Aufgaben
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          {stats.recentProjects && stats.recentProjects.length > 0 && (
            <div className="card-modern p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-gray-900 tracking-tight">
                  Letzte Projekte
                </h3>
                <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-medium hover-lift">
                  <Link href="/projects" className="flex items-center gap-1.5">
                    Alle anzeigen
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              
              <div className="space-y-3">
                {stats.recentProjects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate tracking-tight">
                        {project.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {project.client.name}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs ml-3 flex-shrink-0 font-medium">
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
            <div className="card-modern p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-gray-900 tracking-tight">
                  Fällige Aufgaben
                </h3>
                <div className="p-1.5 rounded-lg bg-orange-100">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
              </div>
              
              <div className="space-y-3">
                {stats.dueTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between p-3.5 rounded-xl hover:bg-orange-50/50 transition-all duration-200 border border-gray-100 hover:border-orange-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate tracking-tight">
                        {task.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {task.project.name}
                      </div>
                    </div>
                    {task.dueDate && (
                      <Badge 
                        variant={isDueSoon(task.dueDate) ? "destructive" : "outline"}
                        className="text-xs ml-3 flex-shrink-0 font-medium"
                      >
                        {formatDate(task.dueDate)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card-modern p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-gray-900 tracking-tight">
                  Fällige Aufgaben
                </h3>
                <div className="p-1.5 rounded-lg bg-green-100">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="text-center py-12">
                <div className="p-3 rounded-xl bg-green-100 inline-flex mb-3">
                  <CheckSquare className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Alles erledigt!
                </p>
                <p className="text-xs text-gray-500">
                  Keine fälligen Aufgaben vorhanden
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
