import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Note, NoteWithProject } from '@/types';

// Query Keys Factory
export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (filters: UseNotesOptions) =>
    [...noteKeys.lists(), filters] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
};

// ============================================
// Fetch Notes
// ============================================
interface UseNotesOptions {
  projectId?: string;
}

async function fetchNotes(options: UseNotesOptions = {}) {
  const params = new URLSearchParams();
  
  if (options.projectId) params.append('projectId', options.projectId);

  const response = await fetch(`/api/notes?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Fehler beim Laden der Notizen');
  }
  
  const result = await response.json();
  return result.data as NoteWithProject[];
}

export function useNotes(options: UseNotesOptions = {}) {
  return useQuery({
    queryKey: noteKeys.list(options),
    queryFn: () => fetchNotes(options),
  });
}

// ============================================
// Fetch Single Note
// ============================================
async function fetchNote(id: string) {
  const response = await fetch(`/api/notes/${id}`);
  if (!response.ok) {
    throw new Error('Fehler beim Laden der Notiz');
  }
  
  const result = await response.json();
  return result.data as NoteWithProject;
}

export function useNote(id: string, enabled = true) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => fetchNote(id),
    enabled: enabled && !!id,
  });
}

// ============================================
// Create Note
// ============================================
interface CreateNoteData {
  title: string;
  content: string;
  projectId: string;
}

async function createNote(data: CreateNoteData) {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Fehler beim Erstellen der Notiz');
  }

  const result = await response.json();
  return result.data as NoteWithProject;
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      toast.success('Notiz erfolgreich erstellt');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================
// Update Note
// ============================================
interface UpdateNoteData {
  id: string;
  title?: string;
  content?: string;
}

async function updateNote({ id, ...data }: UpdateNoteData) {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Fehler beim Aktualisieren der Notiz');
  }

  const result = await response.json();
  return result.data as NoteWithProject;
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(data.id) });
      toast.success('Notiz erfolgreich aktualisiert');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================
// Delete Note
// ============================================
async function deleteNote(id: string) {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Fehler beim Löschen der Notiz');
  }

  return { id };
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      toast.success('Notiz erfolgreich gelöscht');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
