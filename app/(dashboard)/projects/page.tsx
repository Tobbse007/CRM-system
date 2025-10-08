'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProjects } from '@/hooks/use-projects';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
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
import { Plus, Search, ExternalLink } from 'lucide-react';
import { ProjectStatus } from '@prisma/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { ProjectWithClient } from '@/types';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithClient | null>(null);

  const { data: projects, isLoading, error } = useProjects({ search, status: statusFilter });

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
        <Button onClick={() => {
          setSelectedProject(null);
          setDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Neues Projekt
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen nach Name oder Beschreibung..."
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
            <SelectItem value="PLANNING">Planung</SelectItem>
            <SelectItem value="IN_PROGRESS">In Arbeit</SelectItem>
            <SelectItem value="REVIEW">Review</SelectItem>
            <SelectItem value="COMPLETED">Abgeschlossen</SelectItem>
            <SelectItem value="ON_HOLD">Pausiert</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
              projects.map((project) => (
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
