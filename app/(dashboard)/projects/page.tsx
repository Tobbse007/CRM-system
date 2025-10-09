'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProjects } from '@/hooks/use-projects';
import { useClients } from '@/hooks/use-clients';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { ProjectStats } from '@/components/projects/project-stats';
import { ProjectTableModern } from '@/components/projects/project-table-modern';
import { ProjectCardGrid } from '@/components/projects/project-card';
import { ProjectViewToggle } from '@/components/projects/project-view-toggle';
import { Button } from '@/components/ui/button';
import {
  FilterPanel,
  SearchBar,
  MultiSelect,
  DateRangePicker,
  SavedFilters,
} from '@/components/filters';
import type { FilterConfig } from '@/components/filters';
import { Plus, Filter } from 'lucide-react';
import type { ProjectWithClient } from '@/types';
import { ExportButton, type ExportFormat } from '@/components/reports/export-button';
import { exportProjectsToPDF } from '@/lib/export-pdf';
import { exportProjectsToExcel, exportProjectsToCSV } from '@/lib/export-excel';
import { X } from 'lucide-react';

type ViewMode = 'table' | 'grid';

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(false);

  // Read filters from URL
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    searchParams.get('status')?.split(',').filter(Boolean) || []
  );
  const [selectedClients, setSelectedClients] = useState<string[]>(
    searchParams.get('client')?.split(',').filter(Boolean) || []
  );
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
    to: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithClient | null>(null);

  // Fetch clients for filter
  const { data: allClients } = useClients();

  // Build filter query
  const statusFilter = selectedStatuses.length > 0 ? selectedStatuses[0] : ''; // API supports single status
  const clientFilter = selectedClients.length > 0 ? selectedClients[0] : ''; // API supports single client

  const { data: projects, isLoading, error } = useProjects({ 
    search, 
    status: statusFilter,
    clientId: clientFilter 
  });

  // Filter client-side (for date range and multiple selections)
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    return projects.filter((project) => {
      // Date range filter
      if (dateRange.from && project.startDate) {
        const projectStart = new Date(project.startDate);
        if (projectStart < dateRange.from) return false;
      }
      if (dateRange.to && project.endDate) {
        const projectEnd = new Date(project.endDate);
        if (projectEnd > dateRange.to) return false;
      }

      return true;
    });
  }, [projects, dateRange]);

  // Count active filters
  const activeFiltersCount =
    (search ? 1 : 0) +
    selectedStatuses.length +
    selectedClients.length +
    (dateRange.from || dateRange.to ? 1 : 0);

  // Update URL with filters
  const updateURL = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedStatuses.length > 0) params.set('status', selectedStatuses.join(','));
    if (selectedClients.length > 0) params.set('client', selectedClients.join(','));
    if (dateRange.from) params.set('dateFrom', dateRange.from.toISOString());
    if (dateRange.to) params.set('dateTo', dateRange.to.toISOString());

    router.push(`/projects?${params.toString()}`, { scroll: false });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setSelectedStatuses([]);
    setSelectedClients([]);
    setDateRange({});
    router.push('/projects', { scroll: false });
  };

  // Load saved filter config
  const handleLoadFilter = (config: Record<string, any>) => {
    setSearch(config.search || '');
    setSelectedStatuses(config.statuses || []);
    setSelectedClients(config.clients || []);
    setDateRange(config.dateRange || {});
  };

  // Get current filter config
  const currentFilterConfig = {
    search,
    statuses: selectedStatuses,
    clients: selectedClients,
    dateRange,
  };

  // Build filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      id: 'search',
      label: 'Suche',
      value: search,
      type: 'text',
      component: (
        <SearchBar
          placeholder="Nach Name oder Beschreibung suchen..."
          value={search}
          onChange={setSearch}
          onSearch={updateURL}
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      value: selectedStatuses,
      type: 'multi-select',
      component: (
        <MultiSelect
          label="Status"
          placeholder="Status auswählen..."
          options={[
            { value: 'PLANNING', label: 'Planung', color: 'blue' },
            { value: 'IN_PROGRESS', label: 'In Arbeit', color: 'yellow' },
            { value: 'REVIEW', label: 'Review', color: 'purple' },
            { value: 'COMPLETED', label: 'Abgeschlossen', color: 'green' },
            { value: 'ON_HOLD', label: 'Pausiert', color: 'gray' },
          ]}
          value={selectedStatuses}
          onChange={(values) => {
            setSelectedStatuses(values);
            updateURL();
          }}
        />
      ),
    },
    {
      id: 'client',
      label: 'Kunde',
      value: selectedClients,
      type: 'multi-select',
      component: (
        <MultiSelect
          label="Kunde"
          placeholder="Kunden auswählen..."
          options={
            allClients?.map((client) => ({
              value: client.id,
              label: client.name,
            })) || []
          }
          value={selectedClients}
          onChange={(values) => {
            setSelectedClients(values);
            updateURL();
          }}
        />
      ),
    },
    {
      id: 'dateRange',
      label: 'Zeitraum',
      value: dateRange,
      type: 'date-range',
      component: (
        <DateRangePicker
          label="Zeitraum"
          placeholder="Zeitraum auswählen..."
          value={dateRange}
          onChange={(range) => {
            setDateRange(range || {});
            updateURL();
          }}
        />
      ),
    },
  ];

  const handleExport = async (format: ExportFormat) => {
    if (!filteredProjects || filteredProjects.length === 0) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (format === 'pdf') {
      await exportProjectsToPDF(filteredProjects);
    } else if (format === 'excel') {
      await exportProjectsToExcel(filteredProjects);
    } else if (format === 'csv') {
      await exportProjectsToCSV(filteredProjects);
    }
  };

  const handleEdit = (project: ProjectWithClient) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={selectedProject}
      />

      {/* Modern Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Projekte
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Verwalten Sie Ihre Projekte und deren Fortschritt
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
            <ExportButton
              onExport={handleExport}
              variant="outline"
              size="sm"
              disabled={!filteredProjects || filteredProjects.length === 0}
              className="h-9"
            />
            <SavedFilters
              currentConfig={currentFilterConfig}
              onLoad={handleLoadFilter}
              storageKey="crm-project-filters"
            />
            <Button 
              onClick={() => {
                setSelectedProject(null);
                setDialogOpen(true);
              }}
              size="sm"
              className="h-9"
            >
              <Plus className="mr-2 h-4 w-4" />
              Neues Projekt
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <ProjectStats 
        projects={filteredProjects} 
        isLoading={isLoading}
      />

      {/* Client Filter Badge */}
      {selectedClients.length > 0 && allClients && (
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium">
            <span>Gefiltert nach Kunde:</span>
            <span className="font-semibold">
              {allClients.find(c => c.id === selectedClients[0])?.name || 'Unbekannt'}
            </span>
            <button
              onClick={() => {
                setSelectedClients([]);
                updateURL();
              }}
              className="ml-1 hover:bg-blue-100 rounded p-0.5 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <FilterPanel
          filters={filterConfigs}
          activeFiltersCount={activeFiltersCount}
          onReset={handleResetFilters}
          onApply={updateURL}
        />
      )}

      {/* View Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'Projekt' : 'Projekte'}
          {activeFiltersCount > 0 && ' (gefiltert)'}
        </div>
        <ProjectViewToggle 
          view={viewMode} 
          onViewChange={setViewMode}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="card-modern p-6 text-center">
          <p className="text-sm text-red-600">
            Fehler beim Laden der Projekte. Bitte versuchen Sie es erneut.
          </p>
        </div>
      )}

      {/* Content - Table or Grid View */}
      {!error && (
        <>
          {viewMode === 'table' ? (
            <ProjectTableModern
              projects={filteredProjects}
              isLoading={isLoading}
              onEdit={handleEdit}
            />
          ) : (
            <ProjectCardGrid
              projects={filteredProjects}
              isLoading={isLoading}
              onEdit={handleEdit}
            />
          )}
        </>
      )}
    </div>
  );
}
