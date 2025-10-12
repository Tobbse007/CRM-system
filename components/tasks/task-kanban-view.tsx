'use client';

import { useState, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import ReactDOM from 'react-dom';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { Circle, Clock, CheckCircle2, GripVertical } from 'lucide-react';
import { TaskStatus } from '@prisma/client';
import type { Task } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { taskKeys } from '@/hooks/use-tasks';

interface TaskKanbanViewProps {
  tasks: Task[];
  isLoading?: boolean;
  onEdit: (task: Task) => void;
  onViewDetails: (task: Task) => void;
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

const COLUMNS = [
  {
    id: 'TODO' as TaskStatus,
    title: 'Offen',
    icon: Circle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
  {
    id: 'IN_PROGRESS' as TaskStatus,
    title: 'In Arbeit',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'DONE' as TaskStatus,
    title: 'Erledigt',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
];

export function TaskKanbanView({ tasks, isLoading, onEdit, onViewDetails }: TaskKanbanViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localTasks, setLocalTasks] = useState<TaskWithProject[]>(tasks as TaskWithProject[]);

  // Sync localTasks when tasks prop changes
  useEffect(() => {
    setLocalTasks(tasks as TaskWithProject[]);
  }, [tasks]);

  const handleStatusChange = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    const task = localTasks.find((t) => t.id === taskId);
    if (!task) return;

    // Optimistically update the UI
    setLocalTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      // Update via API
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update task');

      // Invalidate queries to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: taskKeys.lists() });

      toast({
        title: 'Status aktualisiert',
        description: `Status wurde zu "${COLUMNS.find((c) => c.id === newStatus)?.title}" geändert.`,
      });
    } catch (error) {
      // Revert optimistic update on error
      setLocalTasks(tasks as TaskWithProject[]);
      toast({
        title: 'Fehler',
        description: 'Status konnte nicht aktualisiert werden.',
        variant: 'destructive',
      });
    }
  }, [localTasks, tasks, toast, queryClient]);

  const onDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Find the task being dragged
    const task = localTasks.find((t) => t.id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId as TaskStatus;
    
    // No status change
    if (task.status === newStatus) {
      return;
    }

    // Optimistically update the UI
    setLocalTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      // Update via API
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update task');

      // Invalidate queries to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: taskKeys.lists() });

      toast({
        title: 'Aufgabe aktualisiert',
        description: `Status wurde zu "${COLUMNS.find((c) => c.id === newStatus)?.title}" geändert.`,
      });
    } catch (error) {
      // Revert optimistic update on error
      setLocalTasks(tasks as TaskWithProject[]);
      toast({
        title: 'Fehler',
        description: 'Status konnte nicht aktualisiert werden.',
        variant: 'destructive',
      });
    }
  }, [localTasks, tasks, toast, queryClient]);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className="bg-white rounded-xl border shadow-sm p-4 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-40 bg-gray-100 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Calculate column stats
  const getColumnTasks = (status: TaskStatus) => localTasks.filter((t) => t.status === status);
  const totalTasks = localTasks.length;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid gap-6 md:grid-cols-3">
        {COLUMNS.map((column) => {
          const Icon = column.icon;
          const columnTasks = getColumnTasks(column.id);
          const taskCount = columnTasks.length;
          const percentage = totalTasks > 0 ? Math.round((taskCount / totalTasks) * 100) : 0;

          return (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <KanbanColumn
                  title={column.title}
                  count={taskCount}
                  percentage={percentage}
                  icon={Icon}
                  color={column.color}
                  bgColor={column.bgColor}
                  isDraggingOver={snapshot.isDraggingOver}
                >
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-3 min-h-[400px]"
                  >
                    {columnTasks.length === 0 ? (
                      <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                        <p className="text-sm text-gray-400 font-medium">
                          Keine Aufgaben
                        </p>
                      </div>
                    ) : (
                      columnTasks.map((task, index) => (
                        <KanbanCard
                          key={task.id}
                          task={task}
                          index={index}
                          onEdit={onEdit}
                          onStatusChange={handleStatusChange}
                          onViewDetails={onViewDetails}
                        />
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                </KanbanColumn>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
