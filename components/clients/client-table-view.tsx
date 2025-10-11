'use client';

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
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Mail, Phone, Globe, Building2, Edit, MoreVertical, FolderKanban, CheckSquare } from 'lucide-react';
import { ClientStatus } from '@prisma/client';
import type { Client } from '@/types';
import { ClientAvatar } from './client-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ClientTableViewProps {
  clients: Client[];
  isLoading: boolean;
  onEdit: (client: Client) => void;
}

export function ClientTableView({ clients, isLoading, onEdit }: ClientTableViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Mutation für Status-Update mit Optimistic Update
  const updateStatusMutation = useMutation({
    mutationFn: async ({ clientId, status }: { clientId: string; status: ClientStatus }) => {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onMutate: async ({ clientId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['clients'] });
      
      // Snapshot previous value
      const previousClients = queryClient.getQueryData(['clients']);
      
      // Optimistically update
      queryClient.setQueryData(['clients'], (old: any) => {
        if (!old) return old;
        return old.map((client: any) => 
          client.id === clientId ? { ...client, status } : client
        );
      });
      
      return { previousClients };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousClients) {
        queryClient.setQueryData(['clients'], context.previousClients);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const getStatusConfig = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.INACTIVE:
        return {
          label: 'Inaktiv',
          color: 'text-red-700 bg-red-50 border-red-300',
          dotColor: 'bg-red-500',
        };
      case ClientStatus.LEAD:
        return {
          label: 'Lead',
          color: 'text-yellow-700 bg-yellow-50 border-yellow-300',
          dotColor: 'bg-yellow-500',
        };
      case ClientStatus.ACTIVE:
        return {
          label: 'Aktiv',
          color: 'text-green-700 bg-green-100 border-green-300',
          dotColor: 'bg-green-500',
        };
      default:
        return {
          label: status,
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          dotColor: 'bg-gray-500',
        };
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-0 bg-white overflow-hidden">
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
            <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-gray-600 font-medium">
            Lade Kunden...
          </p>
        </div>
      </Card>
    );
  }

  if (clients.length === 0) {
    return (
      <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-0 bg-white overflow-hidden">
        <div className="p-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <Building2 className="h-8 w-8 text-blue-600/30" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">
            Keine Kunden gefunden
          </h3>
          <p className="text-sm text-gray-600">
            Erstellen Sie Ihren ersten Kunden oder passen Sie Ihre Filter an.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-200 bg-white overflow-hidden rounded-2xl p-0">
      <div className="overflow-x-auto">
      <TooltipProvider delayDuration={800}>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 border-b border-gray-200">
              <TableHead className="font-bold text-gray-900 text-sm w-[200px] h-11 py-3 pl-6">Kunde</TableHead>
              <TableHead className="font-bold text-gray-900 text-sm w-[180px] h-11 py-3">Firma</TableHead>
              <TableHead className="font-bold text-gray-900 text-sm w-[220px] h-11 py-3">E-Mail</TableHead>
              <TableHead className="font-bold text-gray-900 text-sm w-[160px] h-11 py-3">Telefon</TableHead>
              <TableHead className="font-bold text-gray-900 text-sm w-[200px] h-11 py-3">Website</TableHead>
              <TableHead className="font-bold text-gray-900 text-sm w-[120px] h-11 py-3">Status</TableHead>
              <TableHead className="font-bold text-gray-900 text-sm w-[140px] h-11 py-3 pr-6 text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {clients.map((client) => {
            const statusConfig = getStatusConfig(client.status);
            
            return (
              <TableRow 
                key={client.id} 
                className="hover:bg-blue-50/30 transition-colors cursor-pointer group border-b border-gray-100 last:border-0"
                onClick={() => onEdit(client)}
              >
                {/* Kunde (Avatar + Name) */}
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <ClientAvatar name={client.name} size="sm" />
                    <div>
                      <p className="font-semibold text-gray-900 tracking-tight">
                        {client.name}
                      </p>
                      {/* Compact Stats Badges - Größer und Klickbar */}
                      <div className="flex items-center gap-1.5 mt-1">
                        {(client as any)._count?.projects > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/projects?client=${client.id}`);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer"
                              >
                                <FolderKanban className="h-3 w-3" />
                                {(client as any)._count.projects}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white text-[11px] px-2 py-1" sideOffset={5} side="top">
                              <p>Projekte ansehen</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {(client as any)._count?.tasks > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/tasks?client=${client.id}`);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-colors cursor-pointer"
                              >
                                <CheckSquare className="h-3 w-3" />
                                {(client as any)._count.tasks}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white text-[11px] px-2 py-1" sideOffset={5} side="top">
                              <p>Tasks ansehen</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Firma */}
                <TableCell>
                  {client.company ? (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{client.company}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">-</span>
                  )}
                </TableCell>

                {/* E-Mail */}
                <TableCell>
                  <a
                    href={`mailto:${client.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{client.email}</span>
                  </a>
                </TableCell>

                {/* Telefon */}
                <TableCell>
                  {client.phone ? (
                    <a
                      href={`tel:${client.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{client.phone}</span>
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400 italic">-</span>
                  )}
                </TableCell>

                {/* Website */}
                <TableCell>
                  {client.website ? (
                    <a
                      href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors max-w-[200px]"
                    >
                      <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{client.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400 italic">-</span>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md">
                        <Badge
                          variant="outline"
                          className={`${statusConfig.color} border font-medium cursor-pointer hover:opacity-80 transition-opacity`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} mr-1.5`}></span>
                          {statusConfig.label}
                        </Badge>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40 bg-white">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatusMutation.mutate({ clientId: client.id, status: ClientStatus.INACTIVE });
                        }}
                        className="cursor-pointer hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 py-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                        Inaktiv
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatusMutation.mutate({ clientId: client.id, status: ClientStatus.LEAD });
                        }}
                        className="cursor-pointer hover:bg-yellow-50 hover:text-yellow-700 focus:bg-yellow-50 focus:text-yellow-700 py-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                        Lead
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatusMutation.mutate({ clientId: client.id, status: ClientStatus.ACTIVE });
                        }}
                        className="cursor-pointer hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700 py-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        Aktiv
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>

                {/* Aktionen */}
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(client);
                      }}
                      className="h-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4 mr-1.5" />
                      Bearbeiten
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 hover:text-blue-600"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white p-1">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${client.email}`;
                          }}
                          className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 py-2 px-3 rounded-md"
                        >
                          <Mail className="h-4 w-4 mr-3" />
                          E-Mail senden
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (client.phone) window.location.href = `tel:${client.phone}`;
                          }}
                          className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 py-2 px-3 rounded-md"
                        >
                          <Phone className="h-4 w-4 mr-3" />
                          Anrufen
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (client.website) {
                              const url = client.website.startsWith('http') ? client.website : `https://${client.website}`;
                              window.open(url, '_blank');
                            }
                          }}
                          className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 py-2 px-3 rounded-md"
                        >
                          <Globe className="h-4 w-4 mr-3" />
                          Website öffnen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </TooltipProvider>
      </div>
    </Card>
  );
}
