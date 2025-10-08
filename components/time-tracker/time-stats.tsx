'use client';

import { Clock, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { useTimeEntries, TimeEntry } from '@/hooks/use-time-entries';
import { formatDuration, getTotalDuration, getDurationInHours } from '@/lib/time-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TimeStatsProps {
  projectId: string;
  budget?: number | null; // Budget in Stunden
  showBudgetComparison?: boolean;
}

export function TimeStats({ projectId, budget, showBudgetComparison = true }: TimeStatsProps) {
  const { data: timeEntries, isLoading } = useTimeEntries({ projectId });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lädt...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const entries = timeEntries || [];
  const totalSeconds = getTotalDuration(entries);
  const totalHours = getDurationInHours(totalSeconds);
  
  // Zeiteinträge nach Task gruppieren
  const taskTimes = new Map<string, number>();
  entries.forEach((entry) => {
    if (entry.taskId && entry.duration) {
      const current = taskTimes.get(entry.taskId) || 0;
      taskTimes.set(entry.taskId, current + entry.duration);
    }
  });

  // Zeiteinträge nach Benutzer gruppieren
  const userTimes = new Map<string, number>();
  entries.forEach((entry) => {
    if (entry.userId && entry.duration) {
      const current = userTimes.get(entry.userId) || 0;
      userTimes.set(entry.userId, current + entry.duration);
    }
  });

  const activeTimers = entries.filter((e) => e.endTime === null);
  const budgetUsedPercent = budget ? (totalHours / budget) * 100 : 0;
  const isOverBudget = budget ? totalHours > budget : false;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Gesamt-Zeit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt-Zeit</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalSeconds)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalHours.toFixed(2)} Stunden
            </p>
          </CardContent>
        </Card>

        {/* Anzahl Einträge */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Einträge</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeTimers.length > 0 && `${activeTimers.length} aktiv`}
            </p>
          </CardContent>
        </Card>

        {/* Aufgaben */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aufgaben</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskTimes.size}</div>
            <p className="text-xs text-muted-foreground mt-1">
              mit Zeiterfassung
            </p>
          </CardContent>
        </Card>

        {/* Teammitglieder */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teammitglieder</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userTimes.size || '-'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              haben Zeit erfasst
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget-Vergleich */}
      {showBudgetComparison && budget && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Budget-Vergleich
              {isOverBudget && (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {totalHours.toFixed(2)} / {budget} Stunden
              </span>
              <span className={isOverBudget ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                {budgetUsedPercent.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={Math.min(budgetUsedPercent, 100)} 
              className={isOverBudget ? 'bg-destructive/20' : ''}
            />
            {isOverBudget && (
              <p className="text-xs text-destructive mt-2">
                ⚠️ Budget um {(totalHours - budget).toFixed(2)} Stunden überschritten
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Top Aufgaben nach Zeit */}
      {taskTimes.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Aufgaben nach Zeit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from(taskTimes.entries())
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([taskId, seconds]) => {
                  const entry = entries.find((e) => e.taskId === taskId);
                  const taskTitle = entry?.task?.title || 'Unbekannte Aufgabe';
                  const percentage = (seconds / totalSeconds) * 100;

                  return (
                    <div key={taskId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate">{taskTitle}</span>
                        <span className="text-muted-foreground ml-2">
                          {formatDuration(seconds)}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-1.5" />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Teammitglieder nach Zeit */}
      {userTimes.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Teammitglieder nach Zeit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from(userTimes.entries())
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([userId, seconds]) => {
                  const entry = entries.find((e) => e.userId === userId);
                  const userName = entry?.user?.name || 'Unbekannter Benutzer';
                  const percentage = (seconds / totalSeconds) * 100;

                  return (
                    <div key={userId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate">{userName}</span>
                        <span className="text-muted-foreground ml-2">
                          {formatDuration(seconds)}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-1.5" />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
