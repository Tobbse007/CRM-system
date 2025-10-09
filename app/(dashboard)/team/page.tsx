'use client';

import React, { useState } from 'react';
import { useUsers, useCreateUser, useDeleteUser } from '@/hooks/use-users';
import { UserAvatar } from '@/components/user-avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Trash2, Loader2, Briefcase, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

const roleLabels = {
  ADMIN: 'Admin',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};

const roleColors = {
  ADMIN: 'bg-red-500/10 text-red-500 border-red-500/20',
  MEMBER: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  VIEWER: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function TeamPage() {
  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');

  const handleCreateUser = async () => {
    if (!name || !email) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    try {
      await createUser.mutateAsync({
        name,
        email,
        role,
        avatar: null,
      });
      toast.success('Benutzer erfolgreich erstellt');
      setDialogOpen(false);
      setName('');
      setEmail('');
      setRole('MEMBER');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Erstellen des Benutzers');
    }
  };

  const handleDeleteUser = async (id: string, userName: string) => {
    if (!confirm(`Möchten Sie ${userName} wirklich löschen?`)) {
      return;
    }

    try {
      await deleteUser.mutateAsync(id);
      toast.success('Benutzer erfolgreich gelöscht');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Löschen des Benutzers');
    }
  };

  return (
    <div className="space-y-3 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 min-h-[72px] w-full">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8" />
            Team-Mitglieder
          </h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie Ihr Team und deren Berechtigungen
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-gray-900 hover:text-blue-600 hover:bg-blue-50 transition-colors font-semibold"
              >
                <Plus className="mr-2 h-4 w-4" />
                Benutzer hinzufügen
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Max Mustermann"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">E-Mail *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="max@beispiel.de"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rolle</label>
                <Select value={role} onValueChange={(v) => setRole(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">
                      <div>
                        <div className="font-medium">Admin</div>
                        <div className="text-xs text-muted-foreground">Volle Berechtigungen</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="MEMBER">
                      <div>
                        <div className="font-medium">Member</div>
                        <div className="text-xs text-muted-foreground">Standard-Benutzer</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="VIEWER">
                      <div>
                        <div className="font-medium">Viewer</div>
                        <div className="text-xs text-muted-foreground">Nur Lesezugriff</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreateUser} disabled={createUser.isPending}>
                {createUser.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Erstellen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Team Member Count */}
      <div className="flex items-center justify-between pl-2 my-2.5">
        <div className="text-sm text-gray-600 font-medium">
          {users.length} {users.length === 1 ? 'Mitglied' : 'Mitglieder'}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Team-Mitglieder</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => (u as any).role === 'ADMIN').length}
            </div>
            <p className="text-xs text-muted-foreground">Administratoren</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => (u as any).role === 'MEMBER').length}
            </div>
            <p className="text-xs text-muted-foreground">Standard-Benutzer</p>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Benutzer</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Noch keine Benutzer. Erstellen Sie den ersten Benutzer.
            </p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={(user as any).id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      name={(user as any).name}
                      avatar={(user as any).avatar}
                      size="lg"
                    />
                    <div>
                      <div className="font-medium text-lg">{(user as any).name}</div>
                      <div className="text-sm text-muted-foreground">{(user as any).email}</div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{(user as any)._count?.projects || 0} Projekte</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckSquare className="w-4 h-4" />
                          <span>{(user as any)._count?.assignedTasks || 0} Aufgaben</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={roleColors[(user as any).role as keyof typeof roleColors]}
                    >
                      {roleLabels[(user as any).role as keyof typeof roleLabels]}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser((user as any).id, (user as any).name)}
                      disabled={deleteUser.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
