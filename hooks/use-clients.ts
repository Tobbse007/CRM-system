import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Client, ClientWithProjects, CreateClientDTO, UpdateClientDTO } from '@/types';

// API Response Types
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  issues?: Array<{ path: string[]; message: string }>;
};

// Query Keys
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: { search?: string; status?: string }) =>
    [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

// Fetch all clients with optional filters
async function fetchClients(filters: { search?: string; status?: string } = {}): Promise<Client[]> {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);

  const response = await fetch(`/api/clients?${params.toString()}`);
  const result: ApiResponse<Client[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Kunden konnten nicht geladen werden');
  }

  return result.data;
}

// Fetch single client by ID
async function fetchClient(id: string): Promise<ClientWithProjects> {
  const response = await fetch(`/api/clients/${id}`);
  const result: ApiResponse<ClientWithProjects> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Kunde konnte nicht geladen werden');
  }

  return result.data;
}

// Create new client
async function createClient(data: CreateClientDTO): Promise<Client> {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<Client> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Kunde konnte nicht erstellt werden');
  }

  return result.data;
}

// Update existing client
async function updateClient({ id, data }: { id: string; data: UpdateClientDTO }): Promise<Client> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<Client> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Kunde konnte nicht aktualisiert werden');
  }

  return result.data;
}

// Delete client
async function deleteClient(id: string): Promise<void> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'DELETE',
  });

  const result: ApiResponse<void> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Kunde konnte nicht gelöscht werden');
  }
}

// Hook: Get all clients
export function useClients(filters: { search?: string; status?: string } = {}) {
  return useQuery({
    queryKey: clientKeys.list(filters),
    queryFn: () => fetchClients(filters),
  });
}

// Hook: Get single client
export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => fetchClient(id),
    enabled: !!id,
  });
}

// Hook: Create client
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClient,
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      toast.success('Kunde erfolgreich erstellt', {
        description: `${newClient.name} wurde hinzugefügt`,
      });
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Erstellen', {
        description: error.message,
      });
    },
  });
}

// Hook: Update client
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClient,
    onSuccess: (updatedClient) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(updatedClient.id) });
      toast.success('Kunde erfolgreich aktualisiert', {
        description: `${updatedClient.name} wurde gespeichert`,
      });
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Aktualisieren', {
        description: error.message,
      });
    },
  });
}

// Hook: Delete client
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      toast.success('Kunde erfolgreich gelöscht');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Löschen', {
        description: error.message,
      });
    },
  });
}
