'use client';

import { useState, useMemo } from 'react';
import { TaskListHeader, SortField, SortDirection } from './task-list-header';
import { TaskListRow } from './task-list-row';
import { CheckCircle2 } from 'lucide-react';
import { TaskStatus } from '@prisma/client';
import type { Task } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface TaskListViewProps {
  tasks: Task[];
  isLoading?: boolean;
  onEdit: (task: Task) => void;
}

type TaskWithProject = Task & {
  project?: {
    id: string;
    name: string;
    client: {
      id: string;
      name: string;
    };
  };
};

export function TaskListView({ tasks, isLoading, onEdit }: TaskListViewProps) {
  const { toast } = useToast();
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = useMemo(() => {
    if (!sortField || !sortDirection) return tasks;

    const sorted = [...tasks].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          const statusOrder = { TODO: 1, IN_PROGRESS: 2, DONE: 3 };
          aValue = statusOrder[a.status as keyof typeof statusOrder];
          bValue = statusOrder[b.status as keyof typeof statusOrder];
          break;
        case 'priority':
          const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        case 'project':
          aValue = (a as TaskWithProject).project?.name?.toLowerCase() || '';
          bValue = (b as TaskWithProject).project?.name?.toLowerCase() || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [tasks, sortField, sortDirection]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update task');

      toast({
        title: 'Status aktualisiert',
        description: 'Der Aufgabenstatus wurde erfolgreich geändert.',
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Status konnte nicht aktualisiert werden.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {/* Header Skeleton */}
        <div className="card-modern p-4 animate-pulse bg-gray-50">
          <div className="h-6 bg-gray-200 rounded w-full"></div>
        </div>
        {/* Row Skeletons */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card-modern p-4 animate-pulse">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-1 h-8 bg-gray-200 rounded"></div>
              <div className="col-span-4 h-8 bg-gray-200 rounded"></div>
              <div className="col-span-2 h-8 bg-gray-200 rounded"></div>
              <div className="col-span-2 h-8 bg-gray-200 rounded"></div>
              <div className="col-span-2 h-8 bg-gray-200 rounded"></div>
              <div className="col-span-1 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="card-modern p-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Keine Aufgaben gefunden</h3>
        <p className="text-sm text-gray-500">
          Erstellen Sie eine neue Aufgabe, um loszulegen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Sortable Header */}
      <TaskListHeader
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Task Rows */}
      <div className="space-y-2">
        {sortedTasks.map((task) => (
          <TaskListRow
            key={task.id}
            task={task as TaskWithProject}
            onEdit={onEdit}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
}
