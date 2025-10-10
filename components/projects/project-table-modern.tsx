'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExternalLink, Calendar, DollarSign } from 'lucide-react';
import { ProjectStatus } from '@prisma/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { ProjectWithClient } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ProjectTableModernProps {
  projects: ProjectWithClient[];
  isLoading?: boolean;
  onEdit: (project: ProjectWithClient) => void;
}

export function ProjectTableModern({ 
  projects, 
  isLoading, 
  onEdit 
}: ProjectTableModernProps) {
  const queryClient = useQueryClient();

  // Mutation für Status-Update
  const updateStatusMutation = useMutation({
    mutationFn: async ({ projectId, status }: { projectId: string; status: ProjectStatus }) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const getStatusConfig = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return { label: 'Planung', variant: 'outline' as const, color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case ProjectStatus.IN_PROGRESS:
        return { label: 'In Arbeit', variant: 'default' as const, color: 'text-cyan-700 bg-cyan-100 border-cyan-200' };
      case ProjectStatus.REVIEW:
        return { label: 'Review', variant: 'secondary' as const, color: 'text-purple-600 bg-purple-50 border-purple-200' };
      case ProjectStatus.COMPLETED:
        return { label: 'Abgeschlossen', variant: 'default' as const, color: 'text-green-700 bg-green-100 border-green-200' };
      case ProjectStatus.ON_HOLD:
        return { label: 'Pausiert', variant: 'secondary' as const, color: 'text-gray-600 bg-gray-100 border-gray-200' };
      default:
        return { label: status, variant: 'outline' as const, color: 'text-gray-600 bg-gray-50 border-gray-200' };
    }
  };

  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Projekt</TableHead>
              <TableHead className="font-semibold text-gray-900">Kunde</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Budget</TableHead>
              <TableHead className="font-semibold text-gray-900">Zeitraum</TableHead>
              <TableHead className="text-right font-semibold text-gray-900">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-48 animate-pulse"></div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Keine Projekte gefunden
          </h3>
          <p className="text-sm text-gray-500">
            Erstellen Sie Ihr erstes Projekt, um loszulegen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-200 bg-white overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 border-b border-gray-200">
              <TableHead className="font-bold text-gray-900 text-sm w-[280px] h-11 py-3 pl-6">Projekt</TableHead>
              <TableHead className="font-bold text-gray-900 text-sm w-[180px] h-11 py-3 pl-8">Kunde</TableHead>
              <TableHead className="font-bold text-gray-900 text-sm w-[140px] h-11 py-3">Status</TableHead>
              <TableHead className="font-bold text-gray-900 text-sm w-[140px] h-11 py-3">Budget</TableHead>
              <TableHead className="font-bold text-gray-900 text-sm w-[180px] h-11 py-3">Zeitraum</TableHead>
              <TableHead className="font-bold text-gray-900 text-sm w-[180px] h-11 py-3 pr-6 text-center">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const statusConfig = getStatusConfig(project.status);
              
              return (
                <TableRow 
                  key={project.id}
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer group border-b border-gray-100 last:border-0"
                  onClick={() => onEdit(project)}
                >
                  <TableCell className="py-4 pl-6">
                    <div className="min-w-0">
                      <Link 
                        href={`/projects/${project.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors block truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {project.name}
                      </Link>
                      {project.description && (
                        <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 pl-8">
                    <Link 
                      href={`/clients/${project.client.id}`}
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {project.client.name}
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </Link>
                  </TableCell>
                  <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md">
                          <Badge
                            variant={statusConfig.variant}
                            className={`${statusConfig.color} border font-medium cursor-pointer hover:opacity-80 transition-opacity`}
                          >
                            {statusConfig.label}
                          </Badge>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48 bg-white">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatusMutation.mutate({ projectId: project.id, status: ProjectStatus.PLANNING });
                          }}
                          className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 py-2"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Planung
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatusMutation.mutate({ projectId: project.id, status: ProjectStatus.IN_PROGRESS });
                          }}
                          className="cursor-pointer hover:bg-cyan-50 hover:text-cyan-700 focus:bg-cyan-50 focus:text-cyan-700 py-2"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                            In Arbeit
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatusMutation.mutate({ projectId: project.id, status: ProjectStatus.REVIEW });
                          }}
                          className="cursor-pointer hover:bg-purple-50 hover:text-purple-700 focus:bg-purple-50 focus:text-purple-700 py-2"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                            Review
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatusMutation.mutate({ projectId: project.id, status: ProjectStatus.COMPLETED });
                          }}
                          className="cursor-pointer hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700 py-2"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Abgeschlossen
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatusMutation.mutate({ projectId: project.id, status: ProjectStatus.ON_HOLD });
                          }}
                          className="cursor-pointer hover:bg-gray-50 hover:text-gray-700 focus:bg-gray-50 focus:text-gray-700 py-2"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                            Pausiert
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="py-4">
                    {project.budget ? (
                      <div className="flex items-center gap-1.5 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(project.budget)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-start gap-1.5 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-gray-900">
                          {project.startDate ? formatDate(project.startDate) : '-'}
                        </div>
                        {project.endDate && (
                          <div className="text-gray-500 text-xs mt-0.5">
                            bis {formatDate(project.endDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 pr-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300 border-gray-200 transition-all duration-200"
                      >
                        <Link href={`/projects/${project.id}`}>
                          Details
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(project)}
                        className="h-8 text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300 border-gray-200 transition-all duration-200"
                      >
                        Bearbeiten
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
