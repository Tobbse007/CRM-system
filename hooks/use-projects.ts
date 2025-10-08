import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { 
  Project, 
  ProjectWithClient, 
  ProjectWithRelations, 
  CreateProjectDTO, 
  UpdateProjectDTO 
} from '@/types';

// API Response Types
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  issues?: Array<{ path: string[]; message: string }>;
};

// Query Keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: { search?: string; status?: string; clientId?: string }) =>
    [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// Fetch all projects with optional filters
async function fetchProjects(
  filters: { search?: string; status?: string; clientId?: string } = {}
): Promise<ProjectWithClient[]> {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.clientId) params.append('clientId', filters.clientId);

  const response = await fetch(`/api/projects?${params.toString()}`);
  const result: ApiResponse<ProjectWithClient[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Projekte konnten nicht geladen werden');
  }

  return result.data;
}

// Fetch single project by ID
async function fetchProject(id: string): Promise<ProjectWithRelations> {
  const response = await fetch(`/api/projects/${id}`);
  const result: ApiResponse<ProjectWithRelations> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Projekt konnte nicht geladen werden');
  }

  return result.data;
}

// Create new project
async function createProject(data: CreateProjectDTO): Promise<ProjectWithClient> {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<ProjectWithClient> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Projekt konnte nicht erstellt werden');
  }

  return result.data;
}

// Update existing project
async function updateProject({ 
  id, 
  data 
}: { 
  id: string; 
  data: UpdateProjectDTO 
}): Promise<ProjectWithClient> {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<ProjectWithClient> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Projekt konnte nicht aktualisiert werden');
  }

  return result.data;
}

// Delete project
async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'DELETE',
  });

  const result: ApiResponse<void> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Projekt konnte nicht gelöscht werden');
  }
}

// Hook: Get all projects
export function useProjects(
  filters: { search?: string; status?: string; clientId?: string } = {}
) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => fetchProjects(filters),
  });
}

// Hook: Get single project
export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetchProject(id),
    enabled: !!id,
  });
}

// Hook: Create project
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success('Projekt erfolgreich erstellt', {
        description: `${newProject.name} wurde hinzugefügt`,
      });
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Erstellen', {
        description: error.message,
      });
    },
  });
}

// Hook: Update project
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProject,
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(updatedProject.id) });
      toast.success('Projekt erfolgreich aktualisiert', {
        description: `${updatedProject.name} wurde gespeichert`,
      });
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Aktualisieren', {
        description: error.message,
      });
    },
  });
}

// Hook: Delete project
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success('Projekt erfolgreich gelöscht');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Löschen', {
        description: error.message,
      });
    },
  });
}
