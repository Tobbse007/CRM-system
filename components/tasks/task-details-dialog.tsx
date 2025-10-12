'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Edit,
  ExternalLink,
  AlertCircle,
  Clock,
  CheckSquare,
  FileText,
  Building2,
  User,
} from 'lucide-react';
import { formatDate, isDueSoon } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { Task, TaskPriority, TaskStatus } from '@/types';

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task & {
    project?: {
      id: string;
      name: string;
      client: {
        id: string;
        name: string;
      };
    };
  };
  onEdit: (task: Task) => void;
}

export function TaskDetailsDialog({
  open,
  onOpenChange,
  task,
  onEdit,
}: TaskDetailsDialogProps) {
  const getPriorityConfig = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH':
        return {
          color: 'bg-red-500',
          label: 'Schwer',
          icon: '🔴',
        };
      case 'MEDIUM':
        return {
          color: 'bg-orange-500',
          label: 'Mittel',
          icon: '🟠',
        };
      case 'LOW':
        return {
          color: 'bg-blue-500',
          label: 'Einfach',
          icon: '🔵',
        };
      default:
        return {
          color: 'bg-gray-500',
          label: 'Normal',
          icon: '⚪',
        };
    }
  };

  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return { label: 'Offen', color: 'bg-gray-100 text-gray-700', icon: '⏳' };
      case 'IN_PROGRESS':
        return { label: 'In Arbeit', color: 'bg-blue-100 text-blue-700', icon: '🚀' };
      case 'DONE':
        return { label: 'Erledigt', color: 'bg-green-100 text-green-700', icon: '✅' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: '❓' };
    }
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const isDueSoonTask = task.dueDate && isDueSoon(task.dueDate) && task.status !== 'DONE';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-blue-600" />
            Aufgaben-Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Titel */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {task.title}
            </h3>
            {isOverdue && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
                <AlertCircle className="h-4 w-4" />
                Diese Aufgabe ist überfällig
              </div>
            )}
          </div>

          {/* Status & Priorität */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                Status
              </label>
              <div className={cn('inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium', statusConfig.color)}>
                <span className="text-base">{statusConfig.icon}</span>
                {statusConfig.label}
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                Priorität
              </label>
              <div className={cn('inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white', priorityConfig.color)}>
                <span className="text-base">{priorityConfig.icon}</span>
                {priorityConfig.label}
              </div>
            </div>
          </div>

          {/* Beschreibung */}
          {task.description && (
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Beschreibung
              </label>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                {task.description}
              </div>
            </div>
          )}

          {/* Projekt & Kunde */}
          {task.project && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Projekt
                </label>
                <Link
                  href={`/projects/${task.project.id}`}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <span className="text-sm font-medium">{task.project.name}</span>
                  <ExternalLink className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                </Link>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Kunde
                </label>
                <div className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium">
                  {task.project.client.name}
                </div>
              </div>
            </div>
          )}

          {/* Fälligkeitsdatum */}
          {task.dueDate && (
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fälligkeitsdatum
              </label>
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                  isOverdue && 'bg-red-50 text-red-700 border border-red-200',
                  isDueSoonTask && !isOverdue && 'bg-orange-50 text-orange-700 border border-orange-200',
                  !isOverdue && !isDueSoonTask && 'bg-gray-50 text-gray-700'
                )}
              >
                {isOverdue ? (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span>{formatDate(task.dueDate)} (Überfällig)</span>
                  </>
                ) : isDueSoonTask ? (
                  <>
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(task.dueDate)} (Demnächst fällig)</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(task.dueDate)}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Erstellt/Aktualisiert */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Erstellt am
              </label>
              <div className="text-sm text-gray-700">
                {formatDate(task.createdAt)}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Aktualisiert am
              </label>
              <div className="text-sm text-gray-700">
                {formatDate(task.updatedAt)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={() => {
                onEdit(task);
                onOpenChange(false);
              }}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
