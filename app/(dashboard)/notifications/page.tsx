'use client';

import { useState } from 'react';
import { 
  Bell, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  UserPlus, 
  Clock, 
  Filter,
  Check,
  Trash2,
  Settings,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/hooks/use-notifications';
import { formatDistanceToNow, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  PROJECT: 'Projekt',
  TASK: 'Aufgabe',
  CLIENT: 'Kunde',
  TEAM: 'Team',
  DEADLINE: 'Frist',
  SYSTEM: 'System',
};

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const { data, isLoading } = useNotifications({ limit: 100 });
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread' && n.read) return false;
    if (typeFilter && n.type !== typeFilter) return false;
    return true;
  });

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification.mutate(id.toString());
  };

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups: any, notification) => {
    const date = format(new Date(notification.createdAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedNotifications).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Benachrichtigungen
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 font-medium mt-1">
                  {unreadCount} ungelesene {unreadCount === 1 ? 'Nachricht' : 'Nachrichten'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
            >
              <Check className="h-4 w-4" />
              Alle als gelesen markieren
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                <Settings className="h-4 w-4" />
                Einstellungen
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Benachrichtigungseinstellungen</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Sound-Benachrichtigungen
              </DropdownMenuItem>
              <DropdownMenuItem>
                E-Mail-Benachrichtigungen
              </DropdownMenuItem>
              <DropdownMenuItem>
                Desktop-Benachrichtigungen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow border-0 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Gesamt</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow border-0 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Ungelesen</p>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow border-0 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Heute</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter(n => 
                    format(new Date(n.createdAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  ).length}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow border-0 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Wichtig</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter(n => n.priority === 'HIGH' || n.priority === 'URGENT').length}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Type Filter */}
      <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-auto">
              <TabsList className="bg-gray-100">
                <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Alle ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Ungelesen ({unreadCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                  <Filter className="h-4 w-4" />
                  {typeFilter ? NOTIFICATION_TYPE_LABELS[typeFilter] : 'Alle Typen'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Nach Typ filtern</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTypeFilter(null)}>
                  Alle Typen
                </DropdownMenuItem>
                {Object.entries(NOTIFICATION_TYPE_LABELS).map(([type, label]) => (
                  <DropdownMenuItem key={type} onClick={() => setTypeFilter(type)}>
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-0 bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                <Bell className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
              <p className="text-base text-gray-600 font-medium">
                Lade Benachrichtigungen...
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-4">
                <Bell className="h-10 w-10 text-blue-600/30" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">
                Keine Benachrichtigungen
              </h3>
              <p className="text-sm text-gray-600">
                {filter === 'unread' 
                  ? 'Du hast alle Benachrichtigungen gelesen!' 
                  : 'Du bist auf dem neuesten Stand!'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {sortedDates.map((date) => {
                const dateNotifications = groupedNotifications[date];
                const isToday = date === format(new Date(), 'yyyy-MM-dd');
                const isYesterday = date === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
                
                let dateLabel = format(new Date(date), 'EEEE, dd. MMMM yyyy', { locale: de });
                if (isToday) dateLabel = 'Heute';
                if (isYesterday) dateLabel = 'Gestern';

                return (
                  <div key={date}>
                    <div className="px-6 py-3 bg-gray-50/50 border-b">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {dateLabel}
                      </p>
                    </div>
                    {dateNotifications.map((notification: any) => {
                      const IconComponent = NOTIFICATION_ICONS[notification.type] || Bell;

                      return (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={cn(
                            'w-full text-left p-6 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer border-l-4 group',
                            !notification.read 
                              ? 'bg-blue-50/30 border-blue-600' 
                              : 'border-transparent'
                          )}
                        >
                          <div className="flex gap-4">
                            {/* Icon */}
                            <div
                              className={cn(
                                'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm',
                                NOTIFICATION_COLORS[notification.type]
                              )}
                            >
                              <IconComponent className="h-6 w-6" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p
                                      className={cn(
                                        'text-base tracking-tight',
                                        !notification.read && 'font-bold text-gray-900'
                                      )}
                                    >
                                      {notification.title}
                                    </p>
                                    {!notification.read && (
                                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                    )}
                                  </div>
                                  <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                                    {NOTIFICATION_TYPE_LABELS[notification.type]}
                                  </Badge>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                  onClick={(e) => handleDelete(notification.id, e)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                                {notification.message}
                              </p>

                              <div className="flex items-center gap-3">
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
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
