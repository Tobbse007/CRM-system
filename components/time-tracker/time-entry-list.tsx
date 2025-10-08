'use client';

import { useState } from 'react';
import { Pencil, Trash2, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTimeEntries, useUpdateTimeEntry, useDeleteTimeEntry, TimeEntry } from '@/hooks/use-time-entries';
import { formatDuration, formatRelativeTime, isTimerRunning } from '@/lib/time-utils';
import { useToast } from '@/hooks/use-toast';

interface TimeEntryListProps {
  projectId?: string;
  taskId?: string;
  userId?: string;
  showProject?: boolean;
  showTask?: boolean;
  showUser?: boolean;
}

export function TimeEntryList({
  projectId,
  taskId,
  userId,
  showProject = true,
  showTask = true,
  showUser = true,
}: TimeEntryListProps) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: timeEntries, isLoading } = useTimeEntries({ projectId, taskId, userId });
  const updateEntry = useUpdateTimeEntry(editingId || '');
  const deleteEntry = useDeleteTimeEntry();

  const handleEdit = (entry: TimeEntry) => {
    setEditingId(entry.id);
    setEditDescription(entry.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      await updateEntry.mutateAsync({ description: editDescription });
      setEditingId(null);
      setEditDescription('');
      toast({
        title: 'Gespeichert',
        description: 'Beschreibung wurde aktualisiert.',
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Aktualisierung fehlgeschlagen.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDescription('');
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteEntry.mutateAsync(deleteId);
      setDeleteId(null);
      toast({
        title: 'Gelöscht',
        description: 'Zeiteintrag wurde entfernt.',
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Löschen fehlgeschlagen.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">Lade Zeiteinträge...</div>
      </div>
    );
  }

  if (!timeEntries || timeEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Keine Zeiteinträge vorhanden</p>
        <p className="text-xs text-muted-foreground mt-1">
          Starte einen Timer, um Zeit zu erfassen
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Datum</TableHead>
              {showProject && <TableHead>Projekt</TableHead>}
              {showTask && <TableHead>Aufgabe</TableHead>}
              <TableHead>Beschreibung</TableHead>
              {showUser && <TableHead>Benutzer</TableHead>}
              <TableHead className="w-[100px] text-right">Dauer</TableHead>
              <TableHead className="w-[100px]">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatRelativeTime(entry.startTime)}
                  </div>
                </TableCell>
                {showProject && (
                  <TableCell className="font-medium text-sm">
                    {entry.project.name}
                  </TableCell>
                )}
                {showTask && (
                  <TableCell className="text-sm">
                    {entry.task ? entry.task.title : '-'}
                  </TableCell>
                )}
                <TableCell className="text-sm">
                  {editingId === entry.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="h-8"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleSaveEdit} disabled={updateEntry.isPending}>
                        Speichern
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        Abbrechen
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      {entry.description || 'Keine Beschreibung'}
                    </span>
                  )}
                </TableCell>
                {showUser && (
                  <TableCell className="text-sm">
                    {entry.user ? entry.user.name : '-'}
                  </TableCell>
                )}
                <TableCell className="text-right font-mono text-sm">
                  {isTimerRunning(entry) ? (
                    <span className="text-green-600 flex items-center justify-end gap-1">
                      <Clock className="h-3.5 w-3.5 animate-pulse" />
                      läuft...
                    </span>
                  ) : (
                    formatDuration(entry.duration)
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                      disabled={isTimerRunning(entry) || editingId !== null}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(entry.id)}
                      disabled={isTimerRunning(entry)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zeiteintrag löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du diesen Zeiteintrag wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
