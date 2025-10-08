import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Task, TaskWithProjectAndClient } from '@/types';

// Query Keys Factory
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: Record<string, string | undefined>) =>
    [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

// ============================================
// Fetch Tasks
// ============================================
interface UseTasksOptions {
  projectId?: string;
  status?: string;
  priority?: string;
}

async function fetchTasks(options: UseTasksOptions = {}) {
  const params = new URLSearchParams();
  
  if (options.projectId) params.append('projectId', options.projectId);
  if (options.status) params.append('status', options.status);
  if (options.priority) params.append('priority', options.priority);

  const response = await fetch(`/api/tasks?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Fehler beim Laden der Aufgaben');
  }
  
  const result = await response.json();
  return result.data as TaskWithProjectAndClient[];
}

export function useTasks(options: UseTasksOptions = {}) {
  return useQuery({
    queryKey: taskKeys.list(options),
    queryFn: () => fetchTasks(options),
  });
}

// ============================================
// Fetch Single Task
// ============================================
async function fetchTask(id: string) {
  const response = await fetch(`/api/tasks/${id}`);
  if (!response.ok) {
    throw new Error('Fehler beim Laden der Aufgabe');
  }
  
  const result = await response.json();
  return result.data as TaskWithProjectAndClient;
}

export function useTask(id: string, enabled = true) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => fetchTask(id),
    enabled: enabled && !!id,
  });
}

// ============================================
// Create Task
// ============================================
interface CreateTaskData {
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  projectId: string;
}

async function createTask(data: CreateTaskData) {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Fehler beim Erstellen der Aufgabe');
  }

  const result = await response.json();
  return result.data as TaskWithProjectAndClient;
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success('Aufgabe erfolgreich erstellt');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================
// Update Task
// ============================================
interface UpdateTaskData {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
}

async function updateTask({ id, ...data }: UpdateTaskData) {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Fehler beim Aktualisieren der Aufgabe');
  }

  const result = await response.json();
  return result.data as TaskWithProjectAndClient;
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(data.id) });
      toast.success('Aufgabe erfolgreich aktualisiert');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================
// Delete Task
// ============================================
async function deleteTask(id: string) {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Fehler beim Löschen der Aufgabe');
  }

  return { id };
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success('Aufgabe erfolgreich gelöscht');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
