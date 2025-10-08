import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationType } from '@prisma/client';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  priority: string;
  createdAt: string;
  project?: { id: string; name: string };
  task?: { id: string; title: string };
  client?: { id: string; name: string };
}

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

// Fetch alle Notifications
export function useNotifications(filters?: {
  read?: boolean;
  type?: NotificationType;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  
  if (filters?.read !== undefined) {
    queryParams.append('read', String(filters.read));
  }
  if (filters?.type) {
    queryParams.append('type', filters.type);
  }
  if (filters?.limit) {
    queryParams.append('limit', String(filters.limit));
  }

  return useQuery<NotificationsResponse>({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?${queryParams}`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    refetchInterval: 30000, // Alle 30 Sekunden
    refetchOnWindowFocus: true,
  });
}

// Unread Count (für Badge)
export function useUnreadCount() {
  const { data } = useNotifications({ limit: 1 });
  return data?.unreadCount || 0;
}

// Mark as Read
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Mark All as Read
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Failed to mark all as read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Delete Notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete notification');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Create Notification
export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      type: NotificationType;
      title: string;
      message: string;
      projectId?: string;
      taskId?: string;
      clientId?: string;
      link?: string;
      priority?: string;
    }) => {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create notification');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
