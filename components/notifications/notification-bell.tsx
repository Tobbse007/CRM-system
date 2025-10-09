'use client';

import { Bell, Check, FolderKanban, CheckSquare, Users, UserPlus, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NOTIFICATION_ICONS: Record<string, React.ElementType> = {
  PROJECT: FolderKanban,
  TASK: CheckSquare,
  CLIENT: Users,
  TEAM: UserPlus,
  DEADLINE: Clock,
  SYSTEM: Bell,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  PROJECT: 'bg-blue-50 border-blue-200 text-blue-600',
  TASK: 'bg-blue-50 border-blue-200 text-blue-600',
  CLIENT: 'bg-blue-50 border-blue-200 text-blue-600',
  TEAM: 'bg-blue-50 border-blue-200 text-blue-600',
  DEADLINE: 'bg-blue-50 border-blue-200 text-blue-600',
  SYSTEM: 'bg-blue-50 border-blue-200 text-blue-600',
};

export function NotificationBell() {
  const router = useRouter();
  const { data, isLoading } = useNotifications({ limit: 10 });
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = data?.unreadCount || 0;
  const notifications = data?.notifications || [];

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }

    // Navigate to link
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markAllAsRead.mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-blue-50/50 transition-all duration-200"
        >
          <Bell className="h-5 w-5 text-gray-700" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg shadow-blue-500/30 animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-[420px] p-0 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-blue-50/50 to-white">
          <DropdownMenuLabel className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight">Benachrichtigungen</span>
                {unreadCount > 0 && (
                  <p className="text-xs text-gray-600 font-medium mt-0.5">
                    {unreadCount} neue {unreadCount === 1 ? 'Nachricht' : 'Nachrichten'}
                  </p>
                )}
              </div>
            </div>
          </DropdownMenuLabel>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Alle gelesen
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[420px]">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
                <Bell className="h-6 w-6 text-blue-600 animate-pulse" />
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Lade Benachrichtigungen...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                <Bell className="h-8 w-8 text-blue-600/30" />
              </div>
              <p className="text-sm text-gray-900 font-bold mb-1 tracking-tight">
                Keine Benachrichtigungen
              </p>
              <p className="text-xs text-gray-600">
                Du bist auf dem neuesten Stand!
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const IconComponent = NOTIFICATION_ICONS[notification.type] || Bell;
                
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'w-full text-left p-4 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer border-l-4',
                      !notification.read 
                        ? 'bg-blue-50/30 border-blue-600' 
                        : 'border-transparent'
                    )}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div
                        className={cn(
                          'flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border shadow-sm',
                          NOTIFICATION_COLORS[notification.type]
                        )}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p
                          className={cn(
                            'text-sm line-clamp-1 tracking-tight',
                            !notification.read && 'font-bold text-gray-900'
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        )}
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: de,
                          })}
                        </span>

                        {notification.priority === 'HIGH' && (
                          <Badge variant="outline" className="text-xs h-5 border-blue-200 text-blue-600">
                            Wichtig
                          </Badge>
                        )}
                        {notification.priority === 'URGENT' && (
                          <Badge className="text-xs h-5 bg-red-500 hover:bg-red-600 animate-pulse">
                            Dringend
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <DropdownMenuSeparator className="m-0" />
        <div className="p-3 bg-gray-50/50">
          <Link href="/notifications">
            <Button 
              variant="ghost" 
              className="w-full justify-center text-sm font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              Alle Benachrichtigungen anzeigen
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
