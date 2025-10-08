'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FolderKanban, CheckSquare, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Kunden', href: '/clients', icon: Users },
  { name: 'Projekte', href: '/projects', icon: FolderKanban },
  { name: 'Aufgaben', href: '/tasks', icon: CheckSquare },
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
        'bg-slate-900 text-white min-h-screen p-6 transition-all duration-300 ease-in-out relative',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 h-6 w-6 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 p-0 flex items-center justify-center"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-white" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-white" />
        )}
      </Button>

      {/* Logo/Title */}
      <div className="mb-8">
        <h1
          className={cn(
            'font-bold text-white transition-all duration-300',
            isCollapsed ? 'text-xl text-center' : 'text-2xl'
          )}
        >
          {isCollapsed ? 'C' : 'CRM'}
        </h1>
        {!isCollapsed && (
          <p className="text-sm text-slate-400 mt-1">Webdesign Agentur</p>
        )}
      </div>

      {/* Navigation */}
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
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                isCollapsed && 'justify-center px-2'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={cn('w-5 h-5', isCollapsed && 'w-6 h-6')} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="mt-auto pt-8 border-t border-slate-800">
          <div className="text-xs text-slate-500">
            <p>Version 1.0.0</p>
            <p className="mt-1">© 2025 CRM System</p>
          </div>
        </div>
      )}
    </aside>
  );
}
