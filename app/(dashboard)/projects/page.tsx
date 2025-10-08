'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProjects } from '@/hooks/use-projects';
import { useClients } from '@/hooks/use-clients';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { Button } from '@/components/ui/button';
import {
  FilterPanel,
  SearchBar,
  MultiSelect,
  DateRangePicker,
  SavedFilters,
} from '@/components/filters';
import type { FilterConfig } from '@/components/filters';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, ExternalLink } from 'lucide-react';
import { ProjectStatus } from '@prisma/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { ProjectWithClient } from '@/types';

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const getStatusBadgeVariant = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return 'outline';
      case ProjectStatus.IN_PROGRESS:
        return 'default';
      case ProjectStatus.REVIEW:
        return 'secondary';
      case ProjectStatus.COMPLETED:
        return 'default';
      case ProjectStatus.ON_HOLD:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return 'Planung';
      case ProjectStatus.IN_PROGRESS:
        return 'In Arbeit';
      case ProjectStatus.REVIEW:
        return 'Review';
      case ProjectStatus.COMPLETED:
        return 'Abgeschlossen';
      case ProjectStatus.ON_HOLD:
        return 'Pausiert';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={selectedProject}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projekte</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Projekte und deren Fortschritt
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SavedFilters
            currentConfig={currentFilterConfig}
            onLoad={handleLoadFilter}
            storageKey="crm-project-filters"
          />
          <Button onClick={() => {
            setSelectedProject(null);
            setDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Neues Projekt
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <FilterPanel
        filters={filterConfigs}
        activeFiltersCount={activeFiltersCount}
        onReset={handleResetFilters}
        onApply={updateURL}
      />

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projekt</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Zeitraum</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Laden...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-destructive">
                  Fehler beim Laden der Projekte
                </TableCell>
              </TableRow>
            ) : !projects || projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Keine Projekte gefunden
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.name}</div>
                      {project.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {project.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link 
                      href={`/clients/${project.client.id}`}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {project.client.name}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {project.budget ? (
                      <span className="font-medium">{formatCurrency(project.budget)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {project.startDate ? formatDate(project.startDate) : '-'}
                      {project.endDate && (
                        <>
                          <br />
                          <span className="text-muted-foreground">bis {formatDate(project.endDate)}</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link href={`/projects/${project.id}`}>
                          Details
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setDialogOpen(true);
                        }}
                      >
                        Bearbeiten
                      </Button>
                    </div>
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
