import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface TimeEntry {
  id: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  projectId: string;
  taskId: string | null;
  userId: string | null;
  project: {
    id: string;
    name: string;
  };
  task: {
    id: string;
    title: string;
  } | null;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeEntryData {
  description?: string | null;
  startTime: string;
  endTime?: string | null;
  projectId: string;
  taskId?: string | null;
  userId?: string | null;
}

export interface UpdateTimeEntryData {
  description?: string | null;
  endTime?: string | null;
}

interface TimeEntryFilters {
  projectId?: string;
  taskId?: string;
  userId?: string;
  active?: boolean;
}

// Fetch time entries
export function useTimeEntries(filters?: TimeEntryFilters) {
  return useQuery<TimeEntry[]>({
    queryKey: ['time-entries', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.projectId) params.set('projectId', filters.projectId);
      if (filters?.taskId) params.set('taskId', filters.taskId);
      if (filters?.userId) params.set('userId', filters.userId);
      if (filters?.active !== undefined) params.set('active', String(filters.active));

      const response = await fetch(`/api/time-entries?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Zeiteinträge');
      }
      const data = await response.json();
      return data.data;
    },
  });
}

// Fetch single time entry
export function useTimeEntry(id: string | null) {
  return useQuery<TimeEntry>({
    queryKey: ['time-entries', id],
    queryFn: async () => {
      if (!id) throw new Error('Time entry ID is required');

      const response = await fetch(`/api/time-entries/${id}`);
      if (!response.ok) {
        throw new Error('Fehler beim Laden des Zeiteintrags');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!id,
  });
}

// Start timer (create time entry without endTime)
export function useStartTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTimeEntryData) => {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Starten des Timers');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    },
  });
}

// Stop timer (update time entry with endTime)
export function useStopTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, endTime }: { id: string; endTime: string }) => {
      const response = await fetch(`/api/time-entries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endTime }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Stoppen des Timers');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    },
  });
}

// Update time entry
export function useUpdateTimeEntry(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTimeEntryData) => {
      const response = await fetch(`/api/time-entries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Aktualisieren des Zeiteintrags');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', id] });
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    },
  });
}

// Delete time entry
export function useDeleteTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/time-entries/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Löschen des Zeiteintrags');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    },
  });
}
