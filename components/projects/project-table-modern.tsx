'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ExternalLink, Calendar, DollarSign, Eye, Edit } from 'lucide-react';
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [budgetValue, setBudgetValue] = useState<string>('');
  const [dateValue, setDateValue] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });

  // Mutation für Status-Update mit Optimistic Update
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
    onMutate: async ({ projectId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      
      // Snapshot previous value
      const previousProjects = queryClient.getQueryData(['projects']);
      
      // Optimistically update
      queryClient.setQueryData(['projects'], (old: any) => {
        if (!old) return old;
        return old.map((project: any) => 
          project.id === projectId ? { ...project, status } : project
        );
      });
      
      return { previousProjects };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Mutation für Budget-Update mit Optimistic Update
  const updateBudgetMutation = useMutation({
    mutationFn: async ({ projectId, budget }: { projectId: string; budget: number | null }) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget }),
      });
      if (!response.ok) throw new Error('Failed to update budget');
      return response.json();
    },
    onMutate: async ({ projectId, budget }) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      const previousProjects = queryClient.getQueryData(['projects']);
      
      queryClient.setQueryData(['projects'], (old: any) => {
        if (!old) return old;
        return old.map((project: any) => 
          project.id === projectId ? { ...project, budget } : project
        );
      });
      
      return { previousProjects };
    },
    onError: (err, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
    },
    onSuccess: () => {
      setEditingBudget(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Mutation für Datum-Update mit Optimistic Update
  const updateDateMutation = useMutation({
    mutationFn: async ({ projectId, startDate, endDate }: { projectId: string; startDate?: string; endDate?: string }) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate }),
      });
      if (!response.ok) throw new Error('Failed to update dates');
      return response.json();
    },
    onMutate: async ({ projectId, startDate, endDate }) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      const previousProjects = queryClient.getQueryData(['projects']);
      
      queryClient.setQueryData(['projects'], (old: any) => {
        if (!old) return old;
        return old.map((project: any) => 
          project.id === projectId ? { ...project, startDate, endDate } : project
        );
      });
      
      return { previousProjects };
    },
    onError: (err, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
    },
    onSuccess: () => {
      setEditingDate(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleBudgetEdit = (project: ProjectWithClient) => {
    setEditingBudget(project.id);
    setBudgetValue(project.budget?.toString() || '');
  };

  const handleBudgetSave = (projectId: string) => {
    const budget = budgetValue ? parseFloat(budgetValue) : null;
    updateBudgetMutation.mutate({ projectId, budget });
  };

  const handleDateEdit = (project: ProjectWithClient) => {
    setEditingDate(project.id);
    const startDateStr = project.startDate 
      ? new Date(project.startDate).toISOString().split('T')[0]
      : '';
    const endDateStr = project.endDate 
      ? new Date(project.endDate).toISOString().split('T')[0]
      : '';
    setDateValue({ startDate: startDateStr, endDate: endDateStr });
  };

  const handleDateSave = (projectId: string) => {
    updateDateMutation.mutate({ 
      projectId, 
      startDate: dateValue.startDate || undefined, 
      endDate: dateValue.endDate || undefined 
    });
  };

  const handleRowClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleClientClick = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/clients?filter=${clientId}`);
  };

  const getStatusConfig = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ON_HOLD:
        return { label: 'Pausiert', variant: 'secondary' as const, color: 'text-red-700 bg-red-50 border-red-300' };
      case ProjectStatus.PLANNING:
        return { label: 'Planung', variant: 'outline' as const, color: 'text-yellow-700 bg-yellow-50 border-yellow-300' };
      case ProjectStatus.IN_PROGRESS:
        return { label: 'In Arbeit', variant: 'default' as const, color: 'text-orange-700 bg-orange-100 border-orange-300' };
      case ProjectStatus.REVIEW:
        return { label: 'Review', variant: 'secondary' as const, color: 'text-blue-700 bg-blue-100 border-blue-300' };
      case ProjectStatus.COMPLETED:
        return { label: 'Abgeschlossen', variant: 'default' as const, color: 'text-green-700 bg-green-100 border-green-300' };
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
              <TableHead className="font-semibold text-gray-900">Umsatz</TableHead>
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
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 border-b border-gray-200">
            <TableHead className="font-bold text-gray-900 text-sm w-[280px] h-11 py-3 pl-6">Projekt</TableHead>
            <TableHead className="font-bold text-gray-900 text-sm w-[160px] h-11 py-3 pl-4">Kunde</TableHead>
            <TableHead className="font-bold text-gray-900 text-sm w-[130px] h-11 py-3 pl-4">Status</TableHead>
            <TableHead className="font-bold text-gray-900 text-sm w-[130px] h-11 py-3 pl-4">Umsatz</TableHead>
            <TableHead className="font-bold text-gray-900 text-sm w-[160px] h-11 py-3 pl-4">Zeitraum</TableHead>
            <TableHead className="font-bold text-gray-900 text-sm w-[220px] h-11 py-3 pr-6 text-center">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const statusConfig = getStatusConfig(project.status);
              
              return (
                <TableRow 
                  key={project.id}
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer group border-b border-gray-100 last:border-0"
                  onClick={() => handleRowClick(project.id)}
                >
                  <TableCell className="py-4 pl-6 max-w-[280px]" onClick={(e) => e.stopPropagation()}>
                    <div className="min-w-0">
                      <div
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors block truncate cursor-pointer"
                        onClick={() => handleRowClick(project.id)}
                      >
                        {project.name}
                      </div>
                      {project.description && (
                        <p className="text-sm text-gray-500 truncate mt-0.5">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 pl-8 max-w-[160px]" onClick={(e) => e.stopPropagation()}>
                    <div 
                      onClick={(e) => handleClientClick(project.client.id, e)}
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors truncate cursor-pointer"
                    >
                      <span className="truncate">{project.client.name}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </div>
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
                            updateStatusMutation.mutate({ projectId: project.id, status: ProjectStatus.ON_HOLD });
                          }}
                          className="cursor-pointer hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 py-2"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Pausiert
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatusMutation.mutate({ projectId: project.id, status: ProjectStatus.PLANNING });
                          }}
                          className="cursor-pointer hover:bg-yellow-50 hover:text-yellow-700 focus:bg-yellow-50 focus:text-yellow-700 py-2"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            Planung
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatusMutation.mutate({ projectId: project.id, status: ProjectStatus.IN_PROGRESS });
                          }}
                          className="cursor-pointer hover:bg-orange-50 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700 py-2"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            In Arbeit
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatusMutation.mutate({ projectId: project.id, status: ProjectStatus.REVIEW });
                          }}
                          className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 py-2"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell 
                    className="py-4 group/budget cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (editingBudget !== project.id) {
                        handleBudgetEdit(project);
                      }
                    }}
                  >
                    {editingBudget === project.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <Input
                          type="number"
                          value={budgetValue}
                          onChange={(e) => setBudgetValue(e.target.value)}
                          onBlur={() => handleBudgetSave(project.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleBudgetSave(project.id);
                            if (e.key === 'Escape') setEditingBudget(null);
                          }}
                          className="h-8 w-28 text-sm bg-white"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-400 group-hover/budget:text-green-600 flex-shrink-0 transition-colors" />
                        <span className="font-semibold text-gray-900 group-hover/budget:text-green-600 transition-colors">
                          {project.budget ? formatCurrency(project.budget) : '-'}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell 
                    className="py-4 group/date cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (editingDate !== project.id) {
                        handleDateEdit(project);
                      }
                    }}
                  >
                    {editingDate === project.id ? (
                      <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                        <Input
                          type="date"
                          value={dateValue.startDate}
                          onChange={(e) => setDateValue({ ...dateValue, startDate: e.target.value })}
                          className="h-8 text-xs bg-white"
                          placeholder="Start"
                        />
                        <Input
                          type="date"
                          value={dateValue.endDate}
                          onChange={(e) => setDateValue({ ...dateValue, endDate: e.target.value })}
                          onBlur={() => handleDateSave(project.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleDateSave(project.id);
                            if (e.key === 'Escape') setEditingDate(null);
                          }}
                          className="h-8 text-xs bg-white"
                          placeholder="Ende"
                        />
                      </div>
                    ) : (
                      <div className="flex items-start gap-1.5 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 group-hover/date:text-purple-600 flex-shrink-0 mt-0.5 transition-colors" />
                        <div className="min-w-0">
                          <div className="text-gray-900 group-hover/date:text-purple-600 transition-colors">
                            {project.startDate ? formatDate(project.startDate) : '-'}
                          </div>
                          {project.endDate && (
                            <div className="text-gray-500 group-hover/date:text-purple-600 text-xs mt-0.5 transition-colors">
                              bis {formatDate(project.endDate)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
                          <Eye className="h-4 w-4 mr-1.5" />
                          Details
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(project)}
                        className="h-8 text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300 border-gray-200 transition-all duration-200"
                      >
                        <Edit className="h-4 w-4 mr-1.5" />
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
  );
}
