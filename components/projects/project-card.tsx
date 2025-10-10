'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  DollarSign, 
  ExternalLink,
  Edit,
  Eye,
  Folder
} from 'lucide-react';
import { ProjectStatus } from '@prisma/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { ProjectWithClient } from '@/types';

interface ProjectCardProps {
  project: ProjectWithClient;
  onEdit: (project: ProjectWithClient) => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const getStatusConfig = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return { 
          label: 'Planung', 
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          dotColor: 'bg-blue-500'
        };
      case ProjectStatus.IN_PROGRESS:
        return { 
          label: 'In Arbeit', 
          color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
          dotColor: 'bg-cyan-500'
        };
      case ProjectStatus.REVIEW:
        return { 
          label: 'Review', 
          color: 'text-purple-700 bg-purple-50 border-purple-200',
          dotColor: 'bg-purple-500'
        };
      case ProjectStatus.COMPLETED:
        return { 
          label: 'Abgeschlossen', 
          color: 'text-green-700 bg-green-50 border-green-200',
          dotColor: 'bg-green-500'
        };
      case ProjectStatus.ON_HOLD:
        return { 
          label: 'Pausiert', 
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          dotColor: 'bg-gray-500'
        };
      default:
        return { 
          label: status, 
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          dotColor: 'bg-gray-500'
        };
    }
  };

  const statusConfig = getStatusConfig(project.status);

  return (
    <div className="group card-modern hover-lift transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Folder className="h-5 w-5 text-white" />
          </div>
          
          {/* Status Badge */}
          <Badge 
            variant="outline"
            className={`${statusConfig.color} border font-medium flex-shrink-0`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} mr-1.5`}></span>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Project Name */}
        <Link 
          href={`/projects/${project.id}`}
          className="block mb-2 group/link"
        >
          <h3 className="text-lg font-semibold text-gray-900 group-hover/link:text-blue-600 transition-colors line-clamp-1">
            {project.name}
          </h3>
        </Link>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
            {project.description}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100"></div>

      {/* Info Section */}
      <div className="p-5 pt-4 space-y-3">
        {/* Client */}
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-600">
              {project.client.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <Link 
              href={`/clients/${project.client.id}`}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1 truncate"
            >
              {project.client.name}
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </Link>
          </div>
        </div>

        {/* Budget */}
        {project.budget && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0 transition-colors group-hover:text-green-500" />
            <span className="font-semibold text-gray-900">
              {formatCurrency(project.budget)}
            </span>
            <span className="text-gray-400">Budget</span>
          </div>
        )}

        {/* Dates */}
        {(project.startDate || project.endDate) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0 transition-colors group-hover:text-blue-500" />
            <div className="min-w-0 flex-1 truncate">
              {project.startDate && formatDate(project.startDate)}
              {project.startDate && project.endDate && ' - '}
              {project.endDate && formatDate(project.endDate)}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100"></div>

      {/* Actions - Only visible on hover */}
      <div className="p-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex-1 h-9 text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300 border-gray-200 transition-all duration-200"
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
          className="flex-1 h-9 text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300 border-gray-200 transition-all duration-200"
        >
          <Edit className="h-4 w-4 mr-1.5" />
          Bearbeiten
        </Button>
      </div>
    </div>
  );
}

interface ProjectCardGridProps {
  projects: ProjectWithClient[];
  isLoading?: boolean;
  onEdit: (project: ProjectWithClient) => void;
}

export function ProjectCardGrid({ 
  projects, 
  isLoading, 
  onEdit 
}: ProjectCardGridProps) {
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
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
                <div className="h-6 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            </div>
            <div className="h-px bg-gray-100"></div>
            <div className="p-5 pt-4 space-y-3">
              <div className="h-8 bg-gray-100 rounded"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            </div>
            <div className="h-px bg-gray-100"></div>
            <div className="p-4 flex items-center gap-2">
              <div className="h-9 bg-gray-200 rounded flex-1"></div>
              <div className="h-9 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="card-modern p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <Folder className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Keine Projekte gefunden
        </h3>
        <p className="text-sm text-gray-500">
          Erstellen Sie Ihr erstes Projekt, um loszulegen.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <div
          key={project.id}
          className="opacity-0 animate-fade-in-up"
          style={{ 
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'forwards'
          }}
        >
          <ProjectCard 
            project={project} 
            onEdit={onEdit}
          />
        </div>
      ))}
    </div>
  );
}
