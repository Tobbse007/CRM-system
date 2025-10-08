import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, UserRole } from '@prisma/client';

// Types
export interface CreateUserData {
  name: string;
  email: string;
  avatar?: string | null;
  role: UserRole;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  avatar?: string | null;
  role?: UserRole;
}

export interface UserWithCounts extends User {
  _count: {
    projects: number;
    assignedTasks: number;
  };
}

export interface UserWithDetails extends User {
  projects: Array<{
    id: string;
    projectId: string;
    userId: string;
    role: string;
    project: {
      id: string;
      name: string;
      status: string;
    };
  }>;
  assignedTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
  }>;
  _count: {
    projects: number;
    assignedTasks: number;
  };
}

// Fetch all users
export function useUsers(role?: UserRole) {
  return useQuery<UserWithCounts[]>({
    queryKey: ['users', role],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (role) params.set('role', role);
      
      const response = await fetch(`/api/users?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Benutzer');
      }
      const data = await response.json();
      return data.data;
    },
  });
}

// Fetch single user
export function useUser(id: string | null) {
  return useQuery<UserWithDetails>({
    queryKey: ['users', id],
    queryFn: async () => {
      if (!id) throw new Error('User ID is required');
      
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error('Fehler beim Laden des Benutzers');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!id,
  });
}

// Create user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Erstellen des Benutzers');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Update user
export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserData) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Aktualisieren des Benutzers');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Löschen des Benutzers');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
