'use client';

import { useState } from 'react';
import { useClients } from '@/hooks/use-clients';
import { ClientFormDialog } from '@/components/clients/client-form-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Mail, Phone, Building2 } from 'lucide-react';
import { ClientStatus } from '@prisma/client';
import type { Client } from '@/types';

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { data: clients, isLoading, error } = useClients({ search, status: statusFilter });

  const getStatusBadgeVariant = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.ACTIVE:
        return 'default';
      case ClientStatus.INACTIVE:
        return 'secondary';
      case ClientStatus.LEAD:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.ACTIVE:
        return 'Aktiv';
      case ClientStatus.INACTIVE:
        return 'Inaktiv';
      case ClientStatus.LEAD:
        return 'Lead';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={selectedClient}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kunden</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Kunden und deren Projekte
          </p>
        </div>
        <Button onClick={() => {
          setSelectedClient(null);
          setDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Kunde
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen nach Name, E-Mail oder Firma..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Alle Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="LEAD">Lead</SelectItem>
            <SelectItem value="ACTIVE">Aktiv</SelectItem>
            <SelectItem value="INACTIVE">Inaktiv</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Firma</TableHead>
              <TableHead>Kontakt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Laden...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-destructive">
                  Fehler beim Laden der Kunden
                </TableCell>
              </TableRow>
            ) : !clients || clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Keine Kunden gefunden
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    {client.company ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{client.company}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(client.status)}>
                      {getStatusLabel(client.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedClient(client);
                        setDialogOpen(true);
                      }}
                    >
                      Bearbeiten
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
