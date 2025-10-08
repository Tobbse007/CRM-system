'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema } from '@/lib/validations/client';
import { useCreateClient, useUpdateClient } from '@/hooks/use-clients';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { CreateClientDTO, Client } from '@/types';

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

export function ClientFormDialog({ open, onOpenChange, client }: ClientFormDialogProps) {
  const isEdit = !!client;
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const form = useForm<CreateClientDTO>({
    resolver: zodResolver(clientSchema),
    defaultValues: client || {
      name: '',
      email: '',
      phone: '',
      company: '',
      website: '',
      status: 'LEAD',
    },
  });

  const onSubmit = async (data: CreateClientDTO) => {
    try {
      if (isEdit) {
        await updateClient.mutateAsync({ id: client.id, data });
      } else {
        await createClient.mutateAsync(data);
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Form submission error:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Kunde bearbeiten' : 'Neuer Kunde'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Ändern Sie die Kundendaten und speichern Sie die Änderungen.'
              : 'Geben Sie die Daten für den neuen Kunden ein.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Max Mustermann" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-Mail *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="max@beispiel.de" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input placeholder="+49 123 456789" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firma</FormLabel>
                  <FormControl>
                    <Input placeholder="Beispiel GmbH" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://beispiel.de"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Status auswählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LEAD">Lead</SelectItem>
                      <SelectItem value="ACTIVE">Aktiv</SelectItem>
                      <SelectItem value="INACTIVE">Inaktiv</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={createClient.isPending || updateClient.isPending}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={createClient.isPending || updateClient.isPending}>
                {createClient.isPending || updateClient.isPending
                  ? 'Speichern...'
                  : isEdit
                    ? 'Speichern'
                    : 'Erstellen'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
