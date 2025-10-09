'use client';

import { useState } from 'react';
import { useClients } from '@/hooks/use-clients';
import { ClientFormDialog } from '@/components/clients/client-form-dialog';
import { ClientStats } from '@/components/clients/client-stats';
import { ClientCardGrid } from '@/components/clients/client-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import type { Client } from '@/types';

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: clients, isLoading, error } = useClients({ search, status: statusFilter });

  // Count active filters
  const activeFiltersCount = (search ? 1 : 0) + (statusFilter ? 1 : 0);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={selectedClient}
      />

      {/* Modern Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Kunden
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Verwalten Sie Ihre Kunden und deren Projekte
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`
                h-9
                ${activeFiltersCount > 0 ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' : ''}
              `}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {activeFiltersCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            <Button
              onClick={() => {
                setSelectedClient(null);
                setDialogOpen(true);
              }}
              size="sm"
              className="h-9"
            >
              <Plus className="mr-2 h-4 w-4" />
              Neuer Kunde
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <ClientStats clients={clients || []} isLoading={isLoading} />

      {/* Filters */}
      {showFilters && (
        <div className="card-modern p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Suchen nach Name, E-Mail oder Firma..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select
              value={statusFilter || 'all'}
              onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="LEAD">Lead</SelectItem>
                <SelectItem value="ACTIVE">Aktiv</SelectItem>
                <SelectItem value="INACTIVE">Inaktiv</SelectItem>
              </SelectContent>
            </Select>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                }}
                className="h-9"
              >
                Zurücksetzen
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Client Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {clients?.length || 0} {clients?.length === 1 ? 'Kunde' : 'Kunden'}
          {activeFiltersCount > 0 && ' (gefiltert)'}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="card-modern p-6 text-center">
          <p className="text-sm text-red-600">
            Fehler beim Laden der Kunden. Bitte versuchen Sie es erneut.
          </p>
        </div>
      )}

      {/* Client Cards Grid */}
      {!error && (
        <ClientCardGrid
          clients={clients || []}
          isLoading={isLoading}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
