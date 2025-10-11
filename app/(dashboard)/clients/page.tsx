'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClients } from '@/hooks/use-clients';
import { ClientFormDialog } from '@/components/clients/client-form-dialog';
import { ClientStats } from '@/components/clients/client-stats';
import { ClientCardGrid } from '@/components/clients/client-card';
import { ClientTableView } from '@/components/clients/client-table-view';
import { ViewToggle } from '@/components/clients/view-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Users, ChevronDown, ChevronUp, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import type { Client } from '@/types';

type ViewType = 'grid' | 'table';

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<ViewType>('grid');

  // Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('clients-view') as ViewType;
    if (savedView) {
      setView(savedView);
    }
  }, []);

  // Save view preference to localStorage
  const handleViewChange = (newView: ViewType) => {
    setView(newView);
    localStorage.setItem('clients-view', newView);
  };

  const { data: clientsRaw, isLoading, error } = useClients({ search, status: statusFilter });

  // Sort and filter clients client-side
  const clients = useMemo(() => {
    if (!clientsRaw) return [];
    
    let filtered = clientsRaw;
    
    // Apply filter parameter if present
    if (filterParam) {
      filtered = clientsRaw.filter(client => client.id === filterParam);
    }
    
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'company':
          comparison = (a.company || '').localeCompare(b.company || '');
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'recent':
          comparison = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [clientsRaw, sortBy, sortOrder, filterParam]);

  // Count active filters
  const activeFiltersCount = (search ? 1 : 0) + (statusFilter ? 1 : 0) + (sortBy !== 'name' || sortOrder !== 'asc' ? 1 : 0) + (filterParam ? 1 : 0);

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-3 w-full">
      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={selectedClient}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2 min-h-[72px] w-full">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8" />
            Kunden
          </h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie Ihre Kunden und deren Projekte
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ViewToggle view={view} onViewChange={handleViewChange} />
          
          <Button
            onClick={() => {
              setSelectedClient(null);
              setDialogOpen(true);
            }}
            variant="ghost"
            size="sm"
            className="h-9 text-gray-900 hover:text-blue-600 hover:bg-blue-50 transition-colors font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Neuer Kunde
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="w-full">
        <ClientStats clients={clients || []} isLoading={isLoading} />
      </div>

      {/* Client Count & Filter Toggle - Links, vertikal mittig */}
      <div className="flex items-center justify-between pl-2 my-2.5">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 font-medium">
            {clients?.length || 0} {clients?.length === 1 ? 'Kunde' : 'Kunden'}
            {activeFiltersCount > 0 && ' (gefiltert)'}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-gray-600 font-medium hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            {showFilters ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Filter ausblenden
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Filter einblenden
              </>
            )}
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          {/* Zurücksetzen Button */}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setSortBy('name');
                setSortOrder('asc');
              }}
              className="text-sm text-gray-600 font-medium hover:text-blue-600 transition-colors"
            >
              Zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div 
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${showFilters ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-gray-200 bg-white overflow-hidden rounded-2xl p-5">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Such-Feld */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Suchen nach Name, E-Mail oder Firma..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            {/* Status Filter */}
            <Select
              value={statusFilter || 'all'}
              onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-[160px] h-10 border-gray-200">
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem 
                  value="all"
                  className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                >
                  Alle Status
                </SelectItem>
                <SelectItem 
                  value="LEAD"
                  className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Lead
                  </span>
                </SelectItem>
                <SelectItem 
                  value="ACTIVE"
                  className="cursor-pointer hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Aktiv
                  </span>
                </SelectItem>
                <SelectItem 
                  value="INACTIVE"
                  className="cursor-pointer hover:bg-gray-50 hover:text-gray-700 focus:bg-gray-50 focus:text-gray-700"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                    Inaktiv
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Sortierung */}
            <div className="flex items-center gap-2">
              <Select
                value={sortBy}
                onValueChange={setSortBy}
              >
                <SelectTrigger className="w-[160px] h-10 border-gray-200">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sortieren" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem 
                    value="name"
                    className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                  >
                    Name
                  </SelectItem>
                  <SelectItem 
                    value="company"
                    className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                  >
                    Firma
                  </SelectItem>
                  <SelectItem 
                    value="status"
                    className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                  >
                    Status
                  </SelectItem>
                  <SelectItem 
                    value="recent"
                    className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                  >
                    Zuletzt erstellt
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {/* Sort Order Toggle Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                title={sortOrder === 'asc' ? 'Aufsteigend (A-Z)' : 'Absteigend (Z-A)'}
              >
                <ArrowUpDown className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="card-modern p-6 text-center bg-white shadow-sm border-0">
          <p className="text-sm text-red-600">
            Fehler beim Laden der Kunden. Bitte versuchen Sie es erneut.
          </p>
        </div>
      )}

      {/* Client Views with transition */}
      {!error && (
        <div 
          key={view} 
          className="animate-view-transition w-full"
        >
          {view === 'grid' ? (
            <ClientCardGrid
              clients={clients || []}
              isLoading={isLoading}
              onEdit={handleEdit}
            />
          ) : (
            <ClientTableView
              clients={clients || []}
              isLoading={isLoading}
              onEdit={handleEdit}
            />
          )}
        </div>
      )}
    </div>
  );
}
