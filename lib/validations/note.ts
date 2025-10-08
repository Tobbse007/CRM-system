import { z } from 'zod';

export const noteSchema = z.object({
  title: z.string().min(2, 'Titel muss mindestens 2 Zeichen lang sein').max(255),
  content: z.string().min(1, 'Inhalt darf nicht leer sein'),
  projectId: z.string().uuid('Ungültige Project-ID'),
});

export type NoteFormData = z.infer<typeof noteSchema>;

export const noteUpdateSchema = noteSchema.partial().omit({ projectId: true });
