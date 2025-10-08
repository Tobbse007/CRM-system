'use client';

import React, { useState } from 'react';
import { useUsers } from '@/hooks/use-users';
import { useProjectMembers, useAddMember } from '@/hooks/use-project-members';
import { UserAvatar } from './user-avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TeamMemberSelectorProps {
  projectId: string;
}

export function TeamMemberSelector({ projectId }: TeamMemberSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'OWNER' | 'MEMBER' | 'VIEWER'>('MEMBER');

  const { data: allUsers, isLoading: usersLoading } = useUsers();
  const { data: members } = useProjectMembers(projectId);
  const addMember = useAddMember(projectId);

  // Filter out users who are already members
  const availableUsers = allUsers?.filter(
    (user) => !members?.some((member) => member.userId === user.id)
  ) || [];

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast.error('Bitte wählen Sie einen Benutzer aus');
      return;
    }

    try {
      await addMember.mutateAsync({
        userId: selectedUserId,
        role: selectedRole,
      });
      toast.success('Mitglied erfolgreich hinzugefügt');
      setOpen(false);
      setSelectedUserId('');
      setSelectedRole('MEMBER');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Hinzufügen des Mitglieds');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Mitglied hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Team-Mitglied hinzufügen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Benutzer</label>
            {usersLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : availableUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Alle Benutzer sind bereits Mitglieder dieses Projekts
              </p>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Benutzer auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rolle</label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OWNER">
                  <div>
                    <div className="font-medium">Owner</div>
                    <div className="text-xs text-muted-foreground">
                      Volle Berechtigungen für das Projekt
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="MEMBER">
                  <div>
                    <div className="font-medium">Member</div>
                    <div className="text-xs text-muted-foreground">
                      Kann Aufgaben erstellen und bearbeiten
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="VIEWER">
                  <div>
                    <div className="font-medium">Viewer</div>
                    <div className="text-xs text-muted-foreground">
                      Nur Lesezugriff auf das Projekt
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleAddMember}
            disabled={!selectedUserId || addMember.isPending}
          >
            {addMember.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Hinzufügen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
