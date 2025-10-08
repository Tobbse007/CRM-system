import { useQuery } from '@tanstack/react-query';

interface Activity {
  id: string;
  type: 'CREATED' | 'UPDATED' | 'DELETED' | 'STATUS_CHANGED' | 'ASSIGNED' | 'COMMENTED';
  entityType: string;
  entityId: string;
  entityName: string;
  description: string;
  metadata: string | null;
  userId: string | null;
  userName: string | null;
  createdAt: string;
}

interface UseActivitiesOptions {
  entityType?: string;
  entityId?: string;
  type?: string;
  limit?: number;
}

async function fetchActivities(options: UseActivitiesOptions = {}): Promise<Activity[]> {
  const params = new URLSearchParams();
  
  if (options.entityType) params.append('entityType', options.entityType);
  if (options.entityId) params.append('entityId', options.entityId);
  if (options.type) params.append('type', options.type);
  if (options.limit) params.append('limit', options.limit.toString());

  const response = await fetch(`/api/activities?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Fehler beim Laden der Aktivitäten');
  }

  const data = await response.json();
  return data.data;
}

export function useActivities(options: UseActivitiesOptions = {}) {
  return useQuery({
    queryKey: ['activities', options],
    queryFn: () => fetchActivities(options),
  });
}
