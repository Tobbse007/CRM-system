'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FolderKanban, 
  CheckSquare, 
  TrendingUp,
  Clock,
  ExternalLink,
  BarChart3,
} from 'lucide-react';
import { formatCurrency, formatDate, isDueSoon } from '@/lib/utils';
import type { ProjectWithClient, Task } from '@/types';
import { 
  ProjectStatusChart, 
  TaskProgressChart, 
  BudgetOverviewChart,
  ActivityTrendChart,
  ClientActivityChart,
  TeamPerformanceTable,
} from '@/components/charts';

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
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-destructive">Fehler beim Laden der Statistiken</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Willkommen zurück! Hier ist eine Übersicht Ihrer Projekte.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
            <CardTitle className="text-sm font-semibold text-slate-600 group-hover:text-blue-600 transition-colors">
              Kunden
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-500 transition-all duration-300 group-hover:scale-110">
              <Users className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {stats.clients.total}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              <span className="font-semibold text-green-600">{stats.clients.active}</span> aktiv, {' '}
              <span className="font-semibold text-slate-500">{stats.clients.inactive}</span> inaktiv
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
            <CardTitle className="text-sm font-semibold text-slate-600 group-hover:text-purple-600 transition-colors">
              Projekte
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-500 transition-all duration-300 group-hover:scale-110">
              <FolderKanban className="h-5 w-5 text-purple-600 group-hover:text-white transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              {stats.projects.total}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              <span className="font-semibold text-blue-600">{stats.projects.inProgress}</span> in Arbeit, {' '}
              <span className="font-semibold text-green-600">{stats.projects.completed}</span> fertig
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
            <CardTitle className="text-sm font-semibold text-slate-600 group-hover:text-green-600 transition-colors">
              Aufgaben
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-100 group-hover:bg-green-500 transition-all duration-300 group-hover:scale-110">
              <CheckSquare className="h-5 w-5 text-green-600 group-hover:text-white transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-slate-900 group-hover:text-green-600 transition-colors">
              {stats.tasks.total}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              <span className="font-semibold text-orange-600">{stats.tasks.todo}</span> offen, {' '}
              <span className="font-semibold text-green-600">{stats.tasks.done}</span> erledigt
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
            <CardTitle className="text-sm font-semibold text-slate-600 group-hover:text-orange-600 transition-colors">
              Gesamt-Budget
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-100 group-hover:bg-orange-500 transition-all duration-300 group-hover:scale-110">
              <TrendingUp className="h-5 w-5 text-orange-600 group-hover:text-white transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
              {formatCurrency(stats.budget.total)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Alle aktiven Projekte
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      {!analyticsLoading && analytics && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Analytics & Insights
              </h2>
              <p className="text-sm text-muted-foreground">
                Detaillierte Auswertungen und Visualisierungen
              </p>
            </div>
          </div>

          {/* Charts Grid Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProjectStatusChart
              planning={stats.projects.planning}
              inProgress={stats.projects.inProgress}
              review={stats.projects.review}
              completed={stats.projects.completed}
              onHold={stats.projects.onHold}
            />
            <TaskProgressChart
              todo={stats.tasks.todo}
              inProgress={stats.tasks.inProgress}
              done={stats.tasks.done}
            />
          </div>

          {/* Charts Grid Row 2 */}
          <div className="grid grid-cols-1 gap-6">
            <BudgetOverviewChart projectBudgets={analytics.projectBudgets} />
          </div>

          {/* Charts Grid Row 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityTrendChart activities={analytics.activityTrend} />
            <ClientActivityChart clients={analytics.clientStats} />
          </div>

          {/* Team Performance */}
          <div className="grid grid-cols-1 gap-6">
            <TeamPerformanceTable team={analytics.teamStats} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">Letzte Projekte</CardTitle>
              <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Link href="/projects">
                  Alle ansehen
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {stats.recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Noch keine Projekte vorhanden
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="group flex items-center justify-between p-4 rounded-xl border-2 border-transparent hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300 hover:shadow-md hover:-translate-x-1"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-sm group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {project.client.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {project.budget && (
                        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                          {formatCurrency(project.budget)}
                        </span>
                      )}
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-medium transition-all duration-300 ${
                          project.status === 'IN_PROGRESS' ? 'border-blue-300 bg-blue-50 text-blue-700 group-hover:border-blue-500' : 
                          project.status === 'PLANNING' ? 'border-purple-300 bg-purple-50 text-purple-700 group-hover:border-purple-500' :
                          project.status === 'REVIEW' ? 'border-orange-300 bg-orange-50 text-orange-700 group-hover:border-orange-500' :
                          project.status === 'COMPLETED' ? 'border-green-300 bg-green-50 text-green-700 group-hover:border-green-500' : 
                          'border-gray-300 bg-gray-50 text-gray-700 group-hover:border-gray-500'
                        }`}
                      >
                        {project.status === 'IN_PROGRESS' ? 'In Arbeit' : 
                         project.status === 'PLANNING' ? 'Planung' :
                         project.status === 'REVIEW' ? 'Review' :
                         project.status === 'COMPLETED' ? 'Fertig' : 'Pausiert'}
                      </Badge>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Due Tasks */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-transparent">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">Fällige Aufgaben</CardTitle>
              <div className="p-2 rounded-lg bg-orange-100">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {stats.dueTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Keine fälligen Aufgaben in den nächsten 7 Tagen
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.dueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-start justify-between p-4 rounded-xl border-2 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-sm group-hover:text-orange-600 transition-colors">
                        {task.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                        <FolderKanban className="h-3 w-3" />
                        {task.project.name} • {task.project.client.name}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {task.dueDate && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          isDueSoon(task.dueDate) 
                            ? 'bg-red-100 text-red-700 animate-pulse' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                      <Badge 
                        variant={
                          task.priority === 'HIGH' ? 'destructive' : 
                          task.priority === 'MEDIUM' ? 'default' : 
                          'secondary'
                        }
                        className={`text-xs font-medium transition-transform duration-300 group-hover:scale-110 ${
                          task.priority === 'HIGH' ? 'bg-red-500 hover:bg-red-600' :
                          task.priority === 'MEDIUM' ? 'bg-orange-500 hover:bg-orange-600' :
                          'bg-blue-500 hover:bg-blue-600'
                        }`}
                      >
                        {task.priority === 'HIGH' ? 'Hoch' :
                         task.priority === 'MEDIUM' ? 'Mittel' : 'Niedrig'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

