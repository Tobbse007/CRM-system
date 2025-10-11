'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClientAvatar } from './client-avatar';
import { ClientQuickActions } from './client-quick-actions';
import { Mail, Phone, Globe, Building2, Edit, User, FolderKanban, CheckSquare } from 'lucide-react';
import { ClientStatus } from '@prisma/client';
import type { Client } from '@/types';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
}

export function ClientCard({ client, onEdit }: ClientCardProps) {
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
      await queryClient.cancelQueries({ queryKey: ['clients'] });
      const previousClients = queryClient.getQueryData(['clients']);
      
      queryClient.setQueryData(['clients'], (old: any) => {
        if (!old) return old;
        return old.map((client: any) => 
          client.id === clientId ? { ...client, status } : client
        );
      });
      
      return { previousClients };
    },
    onError: (err, variables, context) => {
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

  const statusConfig = getStatusConfig(client.status);

  return (
    <TooltipProvider delayDuration={800}>
      <div className="group card-modern hover-lift transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        {/* Header with Avatar */}
        <div className="p-5 pb-4">
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <ClientAvatar name={client.name} size="lg" />

            {/* Name & Stats Badges */}
            <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                  {client.name}
                </h3>
              </div>
              
              {/* Stats Badges rechts neben Namen */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {(client as any)._count?.projects > 0 && (
                  <Tooltip delayDuration={800}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/projects?client=${client.id}`);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer"
                      >
                        <FolderKanban className="h-3.5 w-3.5" />
                        {(client as any)._count.projects}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white text-[11px] px-2 py-1" sideOffset={5} side="top">
                      <p>Projekte ansehen</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {(client as any)._count?.tasks > 0 && (
                  <Tooltip delayDuration={800}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/tasks?client=${client.id}`);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-colors cursor-pointer"
                      >
                        <CheckSquare className="h-3.5 w-3.5" />
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

        {/* Company & Status */}
        {client.company && (
          <div className="flex items-center justify-between gap-2 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="font-medium truncate">{client.company}</span>
            </div>
            
            {/* Klickbarer Status rechts */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md">
                  <Badge
                    variant="outline"
                    className={`${statusConfig.color} border font-medium cursor-pointer hover:opacity-80 transition-opacity text-xs px-2.5 py-1`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} mr-1.5`}></span>
                    {statusConfig.label}
                  </Badge>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-white">
                <DropdownMenuItem 
                  onClick={() => updateStatusMutation.mutate({ clientId: client.id, status: ClientStatus.INACTIVE })}
                  className="cursor-pointer hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 py-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                  Inaktiv
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => updateStatusMutation.mutate({ clientId: client.id, status: ClientStatus.LEAD })}
                  className="cursor-pointer hover:bg-yellow-50 hover:text-yellow-700 focus:bg-yellow-50 focus:text-yellow-700 py-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-2"></span>
                  Lead
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => updateStatusMutation.mutate({ clientId: client.id, status: ClientStatus.ACTIVE })}
                  className="cursor-pointer hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700 py-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  Aktiv
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {!client.company && (
          <div className="flex justify-end mb-3">
            {/* Klickbarer Status rechts wenn keine Firma */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md">
                  <Badge
                    variant="outline"
                    className={`${statusConfig.color} border font-medium cursor-pointer hover:opacity-80 transition-opacity text-xs px-2.5 py-1`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} mr-1.5`}></span>
                    {statusConfig.label}
                  </Badge>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-white">
                <DropdownMenuItem 
                  onClick={() => updateStatusMutation.mutate({ clientId: client.id, status: ClientStatus.INACTIVE })}
                  className="cursor-pointer hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 py-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                  Inaktiv
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => updateStatusMutation.mutate({ clientId: client.id, status: ClientStatus.LEAD })}
                  className="cursor-pointer hover:bg-yellow-50 hover:text-yellow-700 focus:bg-yellow-50 focus:text-yellow-700 py-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-2"></span>
                  Lead
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => updateStatusMutation.mutate({ clientId: client.id, status: ClientStatus.ACTIVE })}
                  className="cursor-pointer hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700 py-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  Aktiv
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100"></div>

      {/* Contact Info */}
      <div className="p-5 pt-4 space-y-2.5">
        {/* Email */}
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-gray-400 flex-shrink-0 transition-colors group-hover:text-blue-500" />
          <a
            href={`mailto:${client.email}`}
            className="text-gray-700 hover:text-blue-600 transition-all duration-200 truncate flex-1 hover:underline"
          >
            {client.email}
          </a>
        </div>

        {/* Phone */}
        {client.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0 transition-colors group-hover:text-green-500" />
            <a
              href={`tel:${client.phone}`}
              className="text-gray-700 hover:text-green-600 transition-all duration-200 hover:underline"
            >
              {client.phone}
            </a>
          </div>
        )}

        {/* Website */}
        {client.website && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-gray-400 flex-shrink-0 transition-colors group-hover:text-purple-500" />
            <a
              href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-purple-600 transition-all duration-200 truncate flex-1 hover:underline"
            >
              {client.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}

        {/* If no contact info besides email */}
        {!client.phone && !client.website && (
          <div className="text-sm text-gray-400 italic">
            Keine weiteren Kontaktdaten
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100"></div>

      {/* Actions */}
      <div className="p-4 flex items-center justify-between gap-2">
        {/* Quick Actions */}
        <ClientQuickActions client={client} />

        {/* Edit Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(client)}
          className="h-8 text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300 border-gray-200 ml-auto transition-all duration-200"
        >
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          Bearbeiten
        </Button>
      </div>
    </div>
    </TooltipProvider>
  );
}

interface ClientCardGridProps {
  clients: Client[];
  isLoading?: boolean;
  onEdit: (client: Client) => void;
}

export function ClientCardGrid({ clients, isLoading, onEdit }: ClientCardGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i} 
            className="card-modern animate-pulse opacity-0 animate-fade-in-up"
            style={{ 
              animationDelay: `${i * 50}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <div className="p-5 pb-4">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-16"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            </div>
            <div className="h-px bg-gray-100"></div>
            <div className="p-5 pt-4 space-y-2.5">
              <div className="h-4 bg-gray-100 rounded"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            </div>
            <div className="h-px bg-gray-100"></div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="card-modern p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Keine Kunden gefunden
        </h3>
        <p className="text-sm text-gray-500">
          Erstellen Sie Ihren ersten Kunden, um loszulegen.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {clients.map((client, index) => (
        <div
          key={client.id}
          className="opacity-0 animate-fade-in-up"
          style={{ 
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'forwards'
          }}
        >
          <ClientCard client={client} onEdit={onEdit} />
        </div>
      ))}
    </div>
  );
}
