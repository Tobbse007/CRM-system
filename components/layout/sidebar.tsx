'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FolderKanban, CheckSquare, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Kunden', href: '/clients', icon: Users },
  { name: 'Projekte', href: '/projects', icon: FolderKanban },
  { name: 'Aufgaben', href: '/tasks', icon: CheckSquare },
  { name: 'Einstellungen', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">CRM</h1>
        <p className="text-sm text-slate-400 mt-1">Webdesign Agentur</p>
      </div>
      
      <nav className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
                          (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-slate-800">
        <div className="text-xs text-slate-500">
          <p>Version 0.1.0</p>
          <p className="mt-1">© 2025 CRM System</p>
        </div>
      </div>
    </aside>
  );
}
