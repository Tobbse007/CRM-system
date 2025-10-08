import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(2, 'Titel muss mindestens 2 Zeichen lang sein').max(255),
  description: z.string().optional().or(z.literal('')),
  projectId: z.string().uuid('Ungültige Project-ID'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate: z.string().datetime().optional().nullable(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

export const taskUpdateSchema = taskSchema.partial().omit({ projectId: true });
