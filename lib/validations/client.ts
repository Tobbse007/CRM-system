import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein').max(255),
  email: z.string().email('Ungültige E-Mail-Adresse').max(255),
  phone: z.string().max(50).optional().or(z.literal('')),
  company: z.string().max(255).optional().or(z.literal('')),
  website: z.string().url('Ungültige URL').optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'POTENTIAL']).default('ACTIVE'),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Für Updates (alle Felder optional außer geänderte)
export const clientUpdateSchema = clientSchema.partial();
