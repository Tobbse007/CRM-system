'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTasks } from '@/hooks/use-tasks';
import { TaskFormDialog } from '@/components/tasks/task-form-dialog';
import { TaskStats } from '@/components/tasks/task-stats';
import { TaskKanbanView } from '@/components/tasks/task-kanban-view';
import { TaskListView } from '@/components/tasks/task-list-view';
import { TaskViewToggle } from '@/components/tasks/task-view-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Filter, X } from 'lucide-react';
import type { Task } from '@/types';

type TaskViewMode = 'list' | 'kanban';

const statusOptions = [
  { value: 'all', label: 'Alle Status' },
  { value: 'TODO', label: 'Offen' },
  { value: 'IN_PROGRESS', label: 'In Arbeit' },
  { value: 'DONE', label: 'Erledigt' },
];

const priorityOptions = [
  { value: 'all', label: 'Alle Prioritäten' },
  { value: 'LOW', label: 'Niedrig' },
  { value: 'MEDIUM', label: 'Mittel' },
  { value: 'HIGH', label: 'Hoch' },
];

export default function TasksPage() {
  const searchParams = useSearchParams();
  const clientIdFromUrl = searchParams.get('client');
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState<string | null>(clientIdFromUrl);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [viewMode, setViewMode] = useState<TaskViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);

  const { data: tasks = [], isLoading } = useTasks();

  // Update client filter when URL changes
  useEffect(() => {
    if (clientIdFromUrl) {
      setClientFilter(clientIdFromUrl);
    }
  }, [clientIdFromUrl]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      search === '' ||
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    // Filter by client if set
    const matchesClient = !clientFilter || (task.project?.client?.id === clientFilter);

    return matchesSearch && matchesStatus && matchesPriority && matchesClient;
  });

  const activeFiltersCount = 
    (search ? 1 : 0) + 
    (statusFilter !== 'all' ? 1 : 0) + 
    (priorityFilter !== 'all' ? 1 : 0) +
    (clientFilter ? 1 : 0);

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedTask(undefined);
  };

  const handleAddNew = () => {
    setSelectedTask(undefined);
    setDialogOpen(true);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setClientFilter(null);
  };
  
  // Get client name for filter badge
  const clientName = clientFilter && tasks.length > 0 
    ? tasks.find(t => t.project?.client?.id === clientFilter)?.project?.client?.name 
    : null;

  return (
    <div className="space-y-6">
      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        task={selectedTask}
      />

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Aufgaben
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Verwalten Sie alle Aufgaben über Projekte hinweg
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={activeFiltersCount > 0 ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' : ''}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {activeFiltersCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            <Button onClick={handleAddNew} size="sm" className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              Aufgabe hinzufügen
            </Button>
          </div>
        </div>
      </div>

      <TaskStats tasks={filteredTasks} isLoading={isLoading} />

      {/* Client Filter Badge */}
      {clientName && (
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium">
            <span>Gefiltert nach Kunde:</span>
            <span className="font-semibold">{clientName}</span>
            <button
              onClick={() => setClientFilter(null)}
              className="ml-1 hover:bg-blue-100 rounded p-0.5 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {showFilters && (
        <div className="card-modern p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Aufgaben durchsuchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Priorität filtern" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeFiltersCount > 0 && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredTasks.length} von {tasks.length} Aufgaben werden angezeigt
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8"
              >
                Zurücksetzen
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'Aufgabe' : 'Aufgaben'}
          {activeFiltersCount > 0 && ' (gefiltert)'}
        </div>
        <TaskViewToggle view={viewMode} onViewChange={setViewMode} />
      </div>

      {viewMode === 'list' ? (
        <TaskListView
          tasks={filteredTasks}
          isLoading={isLoading}
          onEdit={handleEdit}
        />
      ) : (
        <TaskKanbanView
          tasks={filteredTasks}
          isLoading={isLoading}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
