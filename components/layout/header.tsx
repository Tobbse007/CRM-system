'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalSearchTrigger } from '@/components/filters';

export function Header() {
  return (
    <header className="h-14 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-96">
          <GlobalSearchTrigger />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </Button>
        
        <div className="ml-3 flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">admin@example.com</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
