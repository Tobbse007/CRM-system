'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalSearchTrigger } from '@/components/filters';

export function Header() {
  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-96">
          <GlobalSearchTrigger />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        
        <div className="ml-3 flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">Admin User</p>
            <p className="text-xs text-slate-500">admin@example.com</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
