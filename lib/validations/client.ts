import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein').max(255),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  website: z.string().url('Ungültige URL').optional().nullable().or(z.literal('')),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).default('LEAD'),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Für Updates (alle Felder optional außer geänderte)
export const clientUpdateSchema = clientSchema.partial();
