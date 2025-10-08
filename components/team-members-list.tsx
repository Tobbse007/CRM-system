'use client';

import React from 'react';
import { useProjectMembers, useRemoveMember } from '@/hooks/use-project-members';
import { UserAvatar } from './user-avatar';
import { TeamMemberSelector } from './team-member-selector';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Users, Trash2, Crown, Shield, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TeamMembersListProps {
  projectId: string;
}

const roleIcons = {
  OWNER: Crown,
  MEMBER: Shield,
  VIEWER: Eye,
};

const roleLabels = {
  OWNER: 'Owner',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};

const roleColors = {
  OWNER: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  MEMBER: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  VIEWER: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export function TeamMembersList({ projectId }: TeamMembersListProps) {
  const { data: members, isLoading } = useProjectMembers(projectId);
  const removeMember = useRemoveMember(projectId);

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!confirm(`Möchten Sie ${userName} wirklich aus dem Projekt entfernen?`)) {
      return;
    }

    try {
      await removeMember.mutateAsync(userId);
      toast.success('Mitglied erfolgreich entfernt');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Entfernen des Mitglieds');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <CardTitle>Team-Mitglieder</CardTitle>
            {members && (
              <Badge variant="secondary">{members.length}</Badge>
            )}
          </div>
          <TeamMemberSelector projectId={projectId} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !members || members.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Noch keine Team-Mitglieder. Fügen Sie das erste Mitglied hinzu.
          </p>
        ) : (
          <div className="space-y-2">
            {members.map((member) => {
              const RoleIcon = roleIcons[member.role];
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={member.user.name}
                      avatar={member.user.avatar}
                      size="md"
                    />
                    <div>
                      <div className="font-medium">{member.user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.user.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={roleColors[member.role]}
                    >
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {roleLabels[member.role]}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.userId, member.user.name)}
                      disabled={removeMember.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
