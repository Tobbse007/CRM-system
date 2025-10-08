import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein').max(255),
  description: z.string().optional().or(z.literal('')),
  clientId: z.string().uuid('Ungültige Client-ID'),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'ON_HOLD']).default('PLANNING'),
  budget: z.number().positive('Budget muss positiv sein').optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

export const projectUpdateSchema = projectSchema.partial().omit({ clientId: true });
