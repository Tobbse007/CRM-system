'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FolderKanban, CheckSquare, Activity, Settings, ChevronLeft, ChevronRight, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Kunden', href: '/clients', icon: Users },
  { name: 'Projekte', href: '/projects', icon: FolderKanban },
  { name: 'Aufgaben', href: '/tasks', icon: CheckSquare },
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
        'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white min-h-screen transition-all duration-300 ease-in-out relative flex flex-col shadow-2xl',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Main Content Container */}
      <div className={cn('flex-1', isCollapsed ? 'p-4' : 'p-6')}>
        {/* Logo/Title */}
        <div className={cn('mb-8 flex items-center', isCollapsed ? 'justify-center' : 'justify-between')}>
          <div className="transition-all duration-300">
            <h1
              className={cn(
                'font-bold text-white transition-all duration-300 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent',
                isCollapsed ? 'text-xl text-center' : 'text-2xl'
              )}
            >
              {isCollapsed ? 'C' : 'CRM'}
            </h1>
            {!isCollapsed && (
              <p className="text-sm text-slate-400 mt-1 animate-in fade-in duration-500">Webdesign Agentur</p>
            )}
          </div>
          
          {/* Toggle Button - Integrated */}
          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 group hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50"
              title="Sidebar einklappen"
            >
              <ChevronLeft className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
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
                  'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg shadow-blue-600/50 scale-105'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white hover:shadow-md hover:scale-102 hover:-translate-x-1',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                {/* Active Indicator */}
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full animate-in slide-in-from-left duration-300" />
                )}
                
                <Icon 
                  className={cn(
                    'flex-shrink-0 transition-all duration-300',
                    isCollapsed ? 'w-6 h-6' : 'w-5 h-5',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 group-hover:scale-110'
                  )} 
                />
                {!isCollapsed && (
                  <span className="transition-all duration-300">
                    {item.name}
                  </span>
                )}
                
                {/* Hover Glow Effect */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Expand Button - Shows only when collapsed */}
      {isCollapsed && (
        <div className="p-4 border-t border-slate-800/50">
          <button
            onClick={toggleSidebar}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 flex items-center justify-center transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105"
            title="Sidebar ausklappen"
          >
            <ChevronRight className="h-5 w-5 text-white group-hover:scale-125 transition-transform duration-300" />
          </button>
        </div>
      )}

      {/* Footer */}
      <div className={cn('p-4 border-t border-slate-800/50 backdrop-blur-sm', isCollapsed && 'text-center')}>
        <p className={cn('text-xs text-slate-500 transition-all duration-300', isCollapsed && 'hidden')}>
          © 2024 CRM System
        </p>
      </div>
    </aside>
  );
}
