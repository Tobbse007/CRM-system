'use client';

import React from 'react';
import { useUsers } from '@/hooks/use-users';
import { UserAvatar } from './user-avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, UserX } from 'lucide-react';

interface AssigneeSelectorProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  projectId?: string;
}

export function AssigneeSelector({ value, onChange, projectId }: AssigneeSelectorProps) {
  const { data: users, isLoading } = useUsers();

  // TODO: In future, filter by project members when projectId is provided
  const availableUsers = users || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-10 border rounded-md bg-background">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Select value={value || 'unassigned'} onValueChange={(v) => onChange(v === 'unassigned' ? null : v)}>
      <SelectTrigger>
        <SelectValue placeholder="Niemand zugewiesen" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <UserX className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-muted-foreground">Niemand zugewiesen</span>
          </div>
        </SelectItem>
        {availableUsers.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            <div className="flex items-center gap-2">
              <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
