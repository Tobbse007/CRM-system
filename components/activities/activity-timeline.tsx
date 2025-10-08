'use client';

import { useActivities } from '@/hooks/use-activities';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  UserPlus, 
  MessageCircle,
  Clock,
  Activity as ActivityIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface ActivityTimelineProps {
  entityType?: string;
  entityId?: string;
  type?: string;
  limit?: number;
}

const activityIcons = {
  CREATED: Plus,
  UPDATED: Edit3,
  DELETED: Trash2,
  STATUS_CHANGED: RefreshCw,
  ASSIGNED: UserPlus,
  COMMENTED: MessageCircle,
};

const activityColors = {
  CREATED: 'text-green-600 bg-green-100',
  UPDATED: 'text-blue-600 bg-blue-100',
  DELETED: 'text-red-600 bg-red-100',
  STATUS_CHANGED: 'text-purple-600 bg-purple-100',
  ASSIGNED: 'text-orange-600 bg-orange-100',
  COMMENTED: 'text-gray-600 bg-gray-100',
};

export function ActivityTimeline({ entityType, entityId, type, limit = 20 }: ActivityTimelineProps) {
  const { data: activities, isLoading } = useActivities({ 
    entityType, 
    entityId,
    type,
    limit 
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <ActivityIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">Noch keine Aktivitäten vorhanden</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {/* Timeline Line */}
      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200" />
      
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.type] || ActivityIcon;
        const colorClass = activityColors[activity.type] || 'text-gray-600 bg-gray-100';
        
        return (
          <div key={activity.id} className="relative flex gap-4 group">
            {/* Icon */}
            <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${colorClass} ring-4 ring-white transition-transform group-hover:scale-110`}>
              <Icon className="h-5 w-5" />
            </div>
            
            {/* Content */}
            <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all group-hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 break-words">
                    {activity.description}
                  </p>
                  
                  {activity.metadata && (
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                      <pre className="whitespace-pre-wrap break-words">
                        {JSON.stringify(JSON.parse(activity.metadata), null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                        locale: de,
                      })}
                    </span>
                    
                    {activity.userName && (
                      <span className="flex items-center gap-1">
                        <UserPlus className="h-3 w-3" />
                        {activity.userName}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Entity Badge */}
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
                  {activity.entityType === 'task' && '📋 Aufgabe'}
                  {activity.entityType === 'project' && '📁 Projekt'}
                  {activity.entityType === 'client' && '👤 Kunde'}
                  {activity.entityType === 'note' && '📝 Notiz'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
