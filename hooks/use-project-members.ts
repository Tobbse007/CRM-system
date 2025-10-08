import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'OWNER' | 'MEMBER' | 'VIEWER';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
  };
}

export interface AddMemberData {
  userId: string;
  role: 'OWNER' | 'MEMBER' | 'VIEWER';
}

// Fetch project members
export function useProjectMembers(projectId: string | null) {
  return useQuery<ProjectMember[]>({
    queryKey: ['projects', projectId, 'members'],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      
      const response = await fetch(`/api/projects/${projectId}/members`);
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Team-Mitglieder');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!projectId,
  });
}

// Add member to project
export function useAddMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddMemberData) => {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Hinzufügen des Mitglieds');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

// Remove member from project
export function useRemoveMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Entfernen des Mitglieds');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
