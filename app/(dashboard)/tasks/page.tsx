'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTasks } from '@/hooks/use-tasks';
import { TaskFormDialog } from '@/components/tasks/task-form-dialog';
import { TaskDetailsDialog } from '@/components/tasks/task-details-dialog';
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
import { Plus, Search, Filter, X, CheckSquare, ChevronDown, ChevronUp, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

type TaskViewMode = 'list' | 'kanban';
type SortOrder = 'high-to-low' | 'low-to-high' | 'none';

const statusOptions = [
  { value: 'all', label: 'Alle Status' },
  { value: 'TODO', label: 'Offen' },
  { value: 'IN_PROGRESS', label: 'In Arbeit' },
  { value: 'DONE', label: 'Erledigt' },
];

const priorityOptions = [
  { value: 'all', label: 'Alle Prioritäten' },
  { value: 'LOW', label: 'Einfach' },
  { value: 'MEDIUM', label: 'Mittel' },
  { value: 'HIGH', label: 'Schwer' },
];

export default function TasksPage() {
  const searchParams = useSearchParams();
  const clientIdFromUrl = searchParams.get('client');
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState<string | null>(clientIdFromUrl);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [viewMode, setViewMode] = useState<TaskViewMode>('kanban');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');

  const { data: tasks = [], isLoading } = useTasks();

  // Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('tasks-view') as TaskViewMode;
    if (savedView) {
      setViewMode(savedView);
    }
  }, []);

  // Save view preference to localStorage
  const handleViewChange = (newView: TaskViewMode) => {
    setViewMode(newView);
    localStorage.setItem('tasks-view', newView);
  };

  // Update client filter when URL changes
  useEffect(() => {
    if (clientIdFromUrl) {
      setClientFilter(clientIdFromUrl);
    }
  }, [clientIdFromUrl]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
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

    // Sort by priority
    if (sortOrder !== 'none') {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      filtered = [...filtered].sort((a, b) => {
        const aVal = priorityOrder[a.priority] || 0;
        const bVal = priorityOrder[b.priority] || 0;
        return sortOrder === 'high-to-low' ? bVal - aVal : aVal - bVal;
      });
    }

    return filtered;
  }, [tasks, search, statusFilter, priorityFilter, clientFilter, sortOrder]);

  const activeFiltersCount = 
    (search ? 1 : 0) + 
    (statusFilter !== 'all' ? 1 : 0) + 
    (priorityFilter !== 'all' ? 1 : 0) +
    (clientFilter ? 1 : 0);

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task);
    setDetailsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedTask(undefined);
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
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
    setSortOrder('none');
  };
  
  // Get client name for filter badge
  const clientName = clientFilter && tasks.length > 0 
    ? tasks.find(t => t.project?.client?.id === clientFilter)?.project?.client?.name 
    : null;

  return (
    <div className="space-y-3 w-full">
      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        task={selectedTask}
      />

      {selectedTask && (
        <TaskDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={handleDetailsDialogClose}
          task={selectedTask}
          onEdit={handleEdit}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-2 min-h-[72px] w-full">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CheckSquare className="h-8 w-8" />
            Aufgaben
          </h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie alle Aufgaben über Projekte hinweg
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <TaskViewToggle view={viewMode} onViewChange={handleViewChange} />
          <Button
            onClick={handleAddNew}
            variant="ghost"
            size="sm"
            className="h-9 text-gray-900 hover:text-blue-600 hover:bg-blue-50 transition-colors font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Neue Aufgabe
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="w-full">
        <TaskStats tasks={filteredTasks} isLoading={isLoading} />
      </div>

      {/* Task Count & Filter Toggle */}
      <div className="flex items-center justify-between pl-2 my-2.5">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 font-medium">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'Aufgabe' : 'Aufgaben'}
            {activeFiltersCount > 0 && ' (gefiltert)'}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-gray-600 font-medium hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            {showFilters ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Filter ausblenden
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Filter einblenden
              </>
            )}
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          {/* Zurücksetzen Button */}
          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="text-sm text-gray-600 font-medium hover:text-blue-600 transition-colors"
            >
              Zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Client Filter Badge */}
      {clientName && (
        <div className="flex items-center gap-2 pl-2">
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

      {/* Filters */}
      <div 
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${showFilters ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-gray-200 bg-white overflow-hidden rounded-2xl p-5">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Such-Feld - kompakt mit Icon */}
            <div className="relative w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-10 border-gray-200">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {statusOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priorität Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[160px] h-10 border-gray-200">
                <SelectValue placeholder="Priorität filtern" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {priorityOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sortierung Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (sortOrder === 'none') setSortOrder('high-to-low');
                else if (sortOrder === 'high-to-low') setSortOrder('low-to-high');
                else setSortOrder('none');
              }}
              className={cn(
                'h-10 px-3 gap-2',
                sortOrder !== 'none' && 'border-blue-500 text-blue-600 bg-blue-50'
              )}
            >
              {sortOrder === 'high-to-low' ? (
                <ArrowDown className="h-4 w-4" />
              ) : sortOrder === 'low-to-high' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4" />
              )}
              <span className="text-sm">
                {sortOrder === 'high-to-low' 
                  ? 'Schwer → Einfach' 
                  : sortOrder === 'low-to-high' 
                    ? 'Einfach → Schwer' 
                    : 'Sortieren'}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content with transition */}
      <div 
        key={viewMode} 
        className="animate-view-transition w-full"
      >
        {viewMode === 'kanban' ? (
          <TaskKanbanView
            tasks={filteredTasks}
            isLoading={isLoading}
            onEdit={handleEdit}
            onViewDetails={handleViewDetails}
          />
        ) : (
          <TaskListView
            tasks={filteredTasks}
            isLoading={isLoading}
            onEdit={handleEdit}
          />
        )}
      </div>
    </div>
  );
}
