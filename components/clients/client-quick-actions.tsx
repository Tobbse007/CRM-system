'use client';

import { Button } from '@/components/ui/button';
import { Mail, Phone, Globe, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import type { Client } from '@/types';

interface ClientQuickActionsProps {
  client: Client;
}

export function ClientQuickActions({ client }: ClientQuickActionsProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Email */}
      {client.email && (
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-8 px-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          title={`Email an ${client.email}`}
        >
          <a href={`mailto:${client.email}`}>
            <Mail className="h-4 w-4" />
          </a>
        </Button>
      )}

      {/* Phone */}
      {client.phone && (
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-8 px-2 text-gray-600 hover:text-green-600 hover:bg-green-50"
          title={`Anrufen: ${client.phone}`}
        >
          <a href={`tel:${client.phone}`}>
            <Phone className="h-4 w-4" />
          </a>
        </Button>
      )}

      {/* Website */}
      {client.website && (
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-8 px-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
          title={`Website besuchen: ${client.website}`}
        >
          <a 
            href={client.website.startsWith('http') ? client.website : `https://${client.website}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Globe className="h-4 w-4" />
          </a>
        </Button>
      )}

      {/* View Projects - We'll link to projects filtered by this client */}
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="h-8 px-2 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50"
        title="Projekte anzeigen"
      >
        <Link href={`/projects?client=${client.id}`}>
          <FolderOpen className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
