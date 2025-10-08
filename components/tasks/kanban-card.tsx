'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Edit, 
  GripVertical, 
  ExternalLink,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { formatDate, isDueSoon } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { Task } from '@/types';

interface KanbanCardProps {
  task: Task & { project?: { id: string; name: string; client: { name: string } } };
  onEdit: (task: Task) => void;
}

export function KanbanCard({ task, onEdit }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'HIGH':
        return 'border-l-red-500 bg-red-50/50';
      case 'MEDIUM':
        return 'border-l-orange-500 bg-orange-50/50';
      case 'LOW':
        return 'border-l-blue-500 bg-blue-50/50';
      default:
        return 'border-l-slate-500 bg-slate-50/50';
    }
  };

  const getPriorityBadge = () => {
    switch (task.priority) {
      case 'HIGH':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white shadow-sm">Hoch</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm">Mittel</Badge>;
      case 'LOW':
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm">Niedrig</Badge>;
      default:
        return null;
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const isDueSoonTask = task.dueDate && isDueSoon(task.dueDate) && task.status !== 'DONE';

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className={cn(
          'group cursor-move hover:shadow-xl transition-all duration-300 border-l-4',
          getPriorityColor(),
          isDragging && 'opacity-50 rotate-3 scale-105',
          !isDragging && 'hover:-translate-y-1'
        )}
      >
        <CardContent className="p-4 space-y-3">
          {/* Drag Handle & Title */}
          <div className="flex items-start gap-2">
            <div
              {...listeners}
              className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            >
              <GripVertical className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm leading-tight group-hover:text-blue-600 transition-colors">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Project Info */}
          {task.project && (
            <div className="flex items-center gap-1.5 text-xs">
              <Link
                href={`/projects/${task.project.id}`}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
                {task.project.name}
              </Link>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{task.project.client.name}</span>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md',
                isOverdue && 'bg-red-100 text-red-700 animate-pulse',
                isDueSoonTask && !isOverdue && 'bg-orange-100 text-orange-700',
                !isOverdue && !isDueSoonTask && 'bg-slate-100 text-slate-600'
              )}
            >
              {isOverdue ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              <span>{formatDate(task.dueDate)}</span>
              {isOverdue && <span className="ml-1">(Überfällig!)</span>}
              {isDueSoonTask && !isOverdue && <span className="ml-1">(Bald fällig)</span>}
            </div>
          )}

          {/* Footer: Priority & Edit */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              {getPriorityBadge()}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(task)}
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 hover:text-blue-600"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
