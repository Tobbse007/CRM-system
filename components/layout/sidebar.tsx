'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FolderKanban, CheckSquare, Activity, Settings, ChevronLeft, ChevronRight, UserCog, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/notification-bell';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Kunden', href: '/clients', icon: Users },
  { name: 'Projekte', href: '/projects', icon: FolderKanban },
  { name: 'Aufgaben', href: '/tasks', icon: CheckSquare },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Team', href: '/team', icon: UserCog },
  { name: 'Aktivitäten', href: '/activities', icon: Activity },
  { name: 'Einstellungen', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 min-h-screen transition-all duration-200 ease-out relative flex flex-col',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Main Content Container */}
      <div className={cn('flex-1', isCollapsed ? 'p-4' : 'p-6')}>
        {/* Logo/Title - Clean & Minimal */}
        <div className={cn('mb-8 flex items-center', isCollapsed ? 'justify-center' : 'justify-between')}>
          <div className="transition-all duration-200">
            <h1
              className={cn(
                'font-semibold text-gray-900 tracking-tight transition-all duration-200',
                isCollapsed ? 'text-xl text-center' : 'text-2xl'
              )}
            >
              {isCollapsed ? '◆' : 'Nexus'}
            </h1>
            {!isCollapsed && (
              <p className="text-xs text-gray-500 mt-0.5">CRM System</p>
            )}
          </div>
          
          {/* Toggle Button - Minimal */}
          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-fast"
              title="Sidebar einklappen"
            >
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Notification Bell */}
        {!isCollapsed && (
          <div className="mb-6">
            <NotificationBell />
          </div>
        )}

        {/* Navigation - Clean & Modern */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2 rounded-lg transition-fast relative',
                  isActive
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                {/* Active Indicator - Subtle */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                )}
                
                <Icon 
                  className={cn(
                    'flex-shrink-0 transition-fast',
                    isCollapsed ? 'w-5 h-5' : 'w-4 h-4',
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'
                  )} 
                />
                {!isCollapsed && (
                  <span className="text-sm transition-fast">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Expand Button - Minimal */}
      {isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={toggleSidebar}
            className="w-full h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-fast"
            title="Sidebar ausklappen"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      )}

      {/* Footer - Minimal */}
      <div className={cn('p-4 border-t border-gray-200', isCollapsed && 'text-center')}>
        <p className={cn('text-xs text-gray-400 transition-fast', isCollapsed && 'hidden')}>
          © 2024 Nexus CRM
        </p>
      </div>
    </aside>
  );
}
