'use client';

import { useState } from 'react';
import { useTasks, useUpdateTask } from '@/hooks/use-tasks';
import { TaskFormDialog } from '@/components/tasks/task-form-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn } from '@/components/tasks/kanban-column';
import { KanbanCard } from '@/components/tasks/kanban-card';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { Task } from '@/types';

const statusColumns = [
  { id: 'TODO', label: 'Zu erledigen', color: 'bg-slate-100 border-slate-300' },
  { id: 'IN_PROGRESS', label: 'In Arbeit', color: 'bg-blue-100 border-blue-300' },
  { id: 'DONE', label: 'Erledigt', color: 'bg-green-100 border-green-300' },
] as const;

const priorityOptions = [
  { value: 'all', label: 'Alle Prioritäten' },
  { value: 'HIGH', label: 'Hoch' },
  { value: 'MEDIUM', label: 'Mittel' },
  { value: 'LOW', label: 'Niedrig' },
];

export default function TasksBoardPage() {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading } = useTasks({ 
    search, 
    priority: priorityFilter 
  });

  const updateTask = useUpdateTask();

  // Setup drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group tasks by status
  const tasksByStatus = {
    TODO: tasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter(t => t.status === 'DONE'),
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as 'TODO' | 'IN_PROGRESS' | 'DONE';

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Only update if status changed
    if (task.status !== newStatus) {
      try {
        await updateTask.mutateAsync({
          id: taskId,
          status: newStatus,
        });
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        task={selectedTask || undefined}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Kanban Board
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Drag & Drop Aufgaben zwischen den Spalten
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/tasks">
            <Button variant="outline" className="gap-2">
              <List className="h-4 w-4" />
              Listen-Ansicht
            </Button>
          </Link>
          <Button 
            onClick={() => {
              setSelectedTask(null);
              setDialogOpen(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Neue Aufgabe
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-2 shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Aufgaben durchsuchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 border-2 focus:border-blue-300 transition-colors"
              />
            </div>
            <Select 
              value={priorityFilter || 'all'} 
              onValueChange={(value) => setPriorityFilter(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-[200px] border-2 shadow-sm">
                <SelectValue placeholder="Priorität" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Lade Aufgaben...</p>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statusColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.label}
                count={tasksByStatus[column.id].length}
                color={column.color}
              >
                <SortableContext
                  items={tasksByStatus[column.id].map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {tasksByStatus[column.id].map((task) => (
                      <KanbanCard
                        key={task.id}
                        task={task}
                        onEdit={handleEditTask}
                      />
                    ))}
                    {tasksByStatus[column.id].length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Keine Aufgaben
                      </div>
                    )}
                  </div>
                </SortableContext>
              </KanbanColumn>
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 opacity-90">
                <KanbanCard task={activeTask} onEdit={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Stats */}
      <Card className="border-2 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Statistiken
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg border-2">
              <div className="text-3xl font-bold text-slate-700">{tasks.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Gesamt</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg border-2">
              <div className="text-3xl font-bold text-slate-600">{tasksByStatus.TODO.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Zu erledigen</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="text-3xl font-bold text-blue-600">{tasksByStatus.IN_PROGRESS.length}</div>
              <div className="text-sm text-muted-foreground mt-1">In Arbeit</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="text-3xl font-bold text-green-600">{tasksByStatus.DONE.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Erledigt</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
