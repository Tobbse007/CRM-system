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
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      company: client?.company || '',
      website: client?.website || '',
      status: client?.status || 'LEAD',
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
      <DialogContent className="sm:max-w-[500px] bg-white border-0 shadow-[0_20px_60px_rgb(0,0,0,0.20)]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold tracking-tight text-gray-900">
            {isEdit ? 'Kunde bearbeiten' : 'Neuer Kunde'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {isEdit
              ? 'Ändern Sie die Kundendaten und speichern Sie die Änderungen.'
              : 'Geben Sie die Daten für den neuen Kunden ein.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900">Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Max Mustermann" 
                      {...field} 
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
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
                  <FormLabel className="text-sm font-semibold text-gray-900">E-Mail *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="max@beispiel.de" 
                      {...field} 
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
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
                  <FormLabel className="text-sm font-semibold text-gray-900">Telefon</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+49 123 456789" 
                      {...field} 
                      value={field.value || ''} 
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
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
                  <FormLabel className="text-sm font-semibold text-gray-900">Firma</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Beispiel GmbH" 
                      {...field} 
                      value={field.value || ''} 
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
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
                  <FormLabel className="text-sm font-semibold text-gray-900">Website</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://beispiel.de"
                      {...field}
                      value={field.value || ''}
                      className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
                  <FormLabel className="text-sm font-semibold text-gray-900">Status *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Status auswählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="LEAD">Lead</SelectItem>
                      <SelectItem value="ACTIVE">Aktiv</SelectItem>
                      <SelectItem value="INACTIVE">Inaktiv</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={createClient.isPending || updateClient.isPending}
                className="bg-white hover:bg-gray-50 border-gray-200"
              >
                Abbrechen
              </Button>
              <Button 
                type="submit" 
                disabled={createClient.isPending || updateClient.isPending}
                className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700"
              >
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
