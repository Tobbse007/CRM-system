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
    <div className="space-y-8 animate-in fade-in duration-500">
      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={selectedClient}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Kunden
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Verwalten Sie Ihre Kunden und deren Projekte
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedClient(null);
            setDialogOpen(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
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
            className="pl-9 border-2 focus:border-blue-300 transition-colors duration-300 shadow-sm"
          />
        </div>
        <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
          <SelectTrigger className="w-[200px] border-2 shadow-sm">
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
      <div className="border-2 rounded-xl overflow-hidden shadow-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 to-transparent border-b-2 hover:bg-slate-50">
              <TableHead className="font-bold text-slate-700">Name</TableHead>
              <TableHead className="font-bold text-slate-700">Firma</TableHead>
              <TableHead className="font-bold text-slate-700">Kontakt</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="text-right font-bold text-slate-700">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                    <span className="text-muted-foreground">Laden...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-2xl">⚠️</div>
                    <span className="text-destructive font-medium">Fehler beim Laden der Kunden</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !clients || clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="h-12 w-12 text-slate-300" />
                    <span className="text-muted-foreground">Keine Kunden gefunden</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow 
                  key={client.id}
                  className="group hover:bg-blue-50/50 transition-all duration-300 hover:shadow-sm border-b border-slate-100"
                >
                  <TableCell className="font-semibold group-hover:text-blue-600 transition-colors">
                    {client.name}
                  </TableCell>
                  <TableCell>
                    {client.company ? (
                      <div className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                        <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-blue-100 transition-colors">
                          <Building2 className="h-4 w-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <span className="font-medium">{client.company}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                        <span className="font-medium">{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusBadgeVariant(client.status)}
                      className={`font-medium transition-all duration-300 group-hover:scale-105 ${
                        client.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-300' :
                        client.status === 'LEAD' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                        'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
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
                      className="hover:bg-blue-100 hover:text-blue-600 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:shadow-md"
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
