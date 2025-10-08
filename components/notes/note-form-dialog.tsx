'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { noteSchema } from '@/lib/validations/note';
import { useCreateNote, useUpdateNote } from '@/hooks/use-notes';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Note } from '@/types';

interface NoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: Note;
  projectId: string;
}

export function NoteFormDialog({
  open,
  onOpenChange,
  note,
  projectId,
}: NoteFormDialogProps) {
  const isEditing = !!note;
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  const form = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      content: '',
      projectId: projectId,
    },
  });

  // Reset form when dialog opens/closes or note changes
  useEffect(() => {
    if (open) {
      if (note) {
        form.reset({
          title: note.title,
          content: note.content,
          projectId: note.projectId,
        });
      } else {
        form.reset({
          title: '',
          content: '',
          projectId: projectId,
        });
      }
    }
  }, [open, note, projectId, form]);

  const onSubmit = async (data: any) => {
    try {
      if (isEditing && note) {
        await updateNote.mutateAsync({
          id: note.id,
          title: data.title,
          content: data.content,
        });
      } else {
        await createNote.mutateAsync(data);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Notiz bearbeiten' : 'Neue Notiz'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Bearbeiten Sie die Notizdetails.'
              : 'Erstellen Sie eine neue Notiz für dieses Projekt.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel *</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Meeting-Notizen" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inhalt *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ihre Notiz..."
                      className="resize-none min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={createNote.isPending || updateNote.isPending}
              >
                {isEditing ? 'Speichern' : 'Erstellen'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
