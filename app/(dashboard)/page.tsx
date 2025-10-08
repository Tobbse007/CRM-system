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
} from 'lucide-react';
import { formatCurrency, formatDate, isDueSoon } from '@/lib/utils';
import type { ProjectWithClient, Task } from '@/types';

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

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/stats');
  const result = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error('Statistiken konnten nicht geladen werden');
  }
  
  return result.data;
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Willkommen zurück! Hier ist eine Übersicht Ihrer Projekte.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Kunden
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.clients.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.clients.active} aktiv, {stats.clients.inactive} inaktiv
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Projekte
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.projects.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.projects.inProgress} in Arbeit, {stats.projects.completed} abgeschlossen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Aufgaben
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.tasks.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.tasks.todo} offen, {stats.tasks.done} erledigt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Gesamt-Budget
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {formatCurrency(stats.budget.total)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Alle aktiven Projekte
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Letzte Projekte</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/projects">
                  Alle ansehen
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Noch keine Projekte vorhanden
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{project.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {project.client.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {project.budget && (
                        <span className="text-sm font-medium">
                          {formatCurrency(project.budget)}
                        </span>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {project.status === 'IN_PROGRESS' ? 'In Arbeit' : 
                         project.status === 'PLANNING' ? 'Planung' :
                         project.status === 'REVIEW' ? 'Review' :
                         project.status === 'COMPLETED' ? 'Fertig' : 'Pausiert'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Due Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Fällige Aufgaben</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {stats.dueTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Keine fälligen Aufgaben in den nächsten 7 Tagen
              </p>
            ) : (
              <div className="space-y-3">
                {stats.dueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{task.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {task.project.name} • {task.project.client.name}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {task.dueDate && (
                        <span className={`text-xs font-medium ${
                          isDueSoon(task.dueDate) ? 'text-orange-600' : 'text-muted-foreground'
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
                        className="text-xs"
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

