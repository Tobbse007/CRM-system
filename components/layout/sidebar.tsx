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
        'bg-slate-900 text-white min-h-screen transition-all duration-300 ease-in-out relative flex flex-col',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Main Content Container */}
      <div className={cn('flex-1', isCollapsed ? 'p-4' : 'p-6')}>
        {/* Logo/Title */}
        <div className={cn('mb-8 flex items-center', isCollapsed ? 'justify-center' : 'justify-between')}>
          <div>
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
          
          {/* Toggle Button - Integrated */}
          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors group"
              title="Sidebar einklappen"
            >
              <ChevronLeft className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
            </button>
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
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-lg shadow-blue-600/50'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', isCollapsed && 'w-6 h-6')} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Expand Button - Shows only when collapsed */}
      {isCollapsed && (
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={toggleSidebar}
            className="w-full h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors group"
            title="Sidebar ausklappen"
          >
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>
      )}

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-6 border-t border-slate-800">
          <div className="text-xs text-slate-500">
            <p>Version 1.0.0</p>
            <p className="mt-1">© 2025 CRM System</p>
          </div>
        </div>
      )}
    </aside>
  );
}
