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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, FolderKanban, ChevronDown, ChevronUp, Search } from 'lucide-react';
import type { ProjectWithClient } from '@/types';

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
  // Get current filter config
  const currentFilterConfig = {
    search,
    statuses: selectedStatuses,
    clients: selectedClients,
    dateRange,
  };

  const handleEdit = (project: ProjectWithClient) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-3 w-full">
      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={selectedProject}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2 min-h-[72px] w-full">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FolderKanban className="h-8 w-8" />
            Projekte
          </h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie Ihre Projekte und deren Fortschritt
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ProjectViewToggle view={viewMode} onViewChange={setViewMode} />
          <Button
            onClick={() => {
              setSelectedProject(null);
              setDialogOpen(true);
            }}
            variant="ghost"
            size="sm"
            className="h-9 text-gray-900 hover:text-blue-600 hover:bg-blue-50 transition-colors font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Neues Projekt
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="w-full">
        <ProjectStats 
          projects={filteredProjects} 
          isLoading={isLoading}
        />
      </div>

      {/* Project Count & Filter Toggle */}
      <div className="flex items-center justify-between pl-2 my-2.5">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 font-medium">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'Projekt' : 'Projekte'}
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
              onClick={handleResetFilters}
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
                placeholder="Nach Name oder Beschreibung suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
              />
            </div>
            
            {/* Status Filter */}
            <Select
              value={selectedStatuses.length > 0 ? selectedStatuses[0] : 'all'}
              onValueChange={(value) => {
                setSelectedStatuses(value === 'all' ? [] : [value]);
                updateURL();
              }}
            >
              <SelectTrigger className="w-[160px] h-10 border-gray-200 bg-white">
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
                  value="PLANNING"
                  className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Planung
                  </span>
                </SelectItem>
                <SelectItem 
                  value="IN_PROGRESS"
                  className="cursor-pointer hover:bg-cyan-50 hover:text-cyan-700 focus:bg-cyan-50 focus:text-cyan-700"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    In Arbeit
                  </span>
                </SelectItem>
                <SelectItem 
                  value="REVIEW"
                  className="cursor-pointer hover:bg-purple-50 hover:text-purple-700 focus:bg-purple-50 focus:text-purple-700"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Review
                  </span>
                </SelectItem>
                <SelectItem 
                  value="COMPLETED"
                  className="cursor-pointer hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Abgeschlossen
                  </span>
                </SelectItem>
                <SelectItem 
                  value="ON_HOLD"
                  className="cursor-pointer hover:bg-gray-50 hover:text-gray-700 focus:bg-gray-50 focus:text-gray-700"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                    Pausiert
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Kunden Filter */}
            <Select
              value={selectedClients.length > 0 ? selectedClients[0] : 'all'}
              onValueChange={(value) => {
                setSelectedClients(value === 'all' ? [] : [value]);
                updateURL();
              }}
            >
              <SelectTrigger className="w-[180px] h-10 border-gray-200 bg-white">
                <SelectValue placeholder="Alle Kunden" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem 
                  value="all"
                  className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                >
                  Alle Kunden
                </SelectItem>
                {allClients?.map((client) => (
                  <SelectItem 
                    key={client.id}
                    value={client.id}
                    className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                  >
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="card-modern p-6 text-center bg-white shadow-sm border-0">
          <p className="text-sm text-red-600">
            Fehler beim Laden der Projekte. Bitte versuchen Sie es erneut.
          </p>
        </div>
      )}

      {/* Content with transition */}
      {!error && (
        <div 
          key={viewMode} 
          className="animate-view-transition w-full"
        >
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
        </div>
      )}
    </div>
  );
}
