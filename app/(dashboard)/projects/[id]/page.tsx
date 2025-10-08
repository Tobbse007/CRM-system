'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/hooks/use-projects';
import { useTasks, useDeleteTask } from '@/hooks/use-tasks';
import { useNotes, useDeleteNote } from '@/hooks/use-notes';
import { TaskFormDialog } from '@/components/tasks/task-form-dialog';
import { NoteFormDialog } from '@/components/notes/note-form-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  ExternalLink,
  Calendar,
  TrendingUp,
  CheckSquare,
  FileText,
  Edit,
  Trash2,
  Activity,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { Task, Note } from '@/types';
import { ActivityTimeline } from '@/components/activities/activity-timeline';
import { FileUpload } from '@/components/attachments/file-upload';

const statusConfig = {
  PLANNING: { label: 'Planung', color: 'bg-blue-100 text-blue-800' },
  IN_PROGRESS: { label: 'In Arbeit', color: 'bg-yellow-100 text-yellow-800' },
  REVIEW: { label: 'Review', color: 'bg-purple-100 text-purple-800' },
  COMPLETED: { label: 'Abgeschlossen', color: 'bg-green-100 text-green-800' },
  ON_HOLD: { label: 'Pausiert', color: 'bg-gray-100 text-gray-800' },
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks({ projectId });
  const { data: notes = [], isLoading: notesLoading } = useNotes({ projectId });

  const deleteTask = useDeleteTask();
  const deleteNote = useDeleteNote();

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Möchten Sie diese Aufgabe wirklich löschen?')) {
      await deleteTask.mutateAsync(taskId);
    }
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setNoteDialogOpen(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Möchten Sie diese Notiz wirklich löschen?')) {
      await deleteNote.mutateAsync(noteId);
    }
  };

  const handleTaskDialogClose = (open: boolean) => {
    setTaskDialogOpen(open);
    if (!open) {
      setSelectedTask(undefined);
    }
  };

  const handleNoteDialogClose = (open: boolean) => {
    setNoteDialogOpen(open);
    if (!open) {
      setSelectedNote(undefined);
    }
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Lade Projektdaten...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="text-lg text-muted-foreground">Projekt nicht gefunden</div>
        <Button onClick={() => router.push('/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Button>
      </div>
    );
  }

  const status = statusConfig[project.status as keyof typeof statusConfig];

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  };

  const completionPercentage = taskStats.total > 0 
    ? Math.round((taskStats.done / taskStats.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/projects')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Übersicht
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Badge className={status.color}>{status.label}</Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>
        <Button onClick={() => router.push(`/projects`)}>
          Bearbeiten
        </Button>
      </div>

      {/* Project Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Client Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kunde</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <Link 
                href={`/clients`}
                className="text-xl font-bold hover:underline flex items-center gap-1"
              >
                {project.client.name}
                <ExternalLink className="h-3 w-3" />
              </Link>
              {project.client.company && (
                <p className="text-sm text-muted-foreground">{project.client.company}</p>
              )}
              {project.client.email && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {project.client.email}
                </p>
              )}
              {project.client.phone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {project.client.phone}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(project.budget)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Gesamtbudget
            </p>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zeitraum</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">Start:</span>{' '}
                {formatDate(project.startDate)}
              </div>
              <div className="text-sm">
                <span className="font-medium">Ende:</span>{' '}
                {formatDate(project.endDate)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fortschritt</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionPercentage}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {taskStats.done} von {taskStats.total} Aufgaben erledigt
            </p>
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              <CardTitle>Aufgaben</CardTitle>
              <Badge variant="secondary">{taskStats.total}</Badge>
            </div>
            <Button size="sm" onClick={() => setTaskDialogOpen(true)}>
              Aufgabe hinzufügen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Lade Aufgaben...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Aufgaben vorhanden
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-muted-foreground">{task.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {task.dueDate && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                    <Badge variant={task.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                      {task.priority === 'HIGH' && 'Hoch'}
                      {task.priority === 'MEDIUM' && 'Mittel'}
                      {task.priority === 'LOW' && 'Niedrig'}
                    </Badge>
                    <Badge>
                      {task.status === 'TODO' && 'Offen'}
                      {task.status === 'IN_PROGRESS' && 'In Arbeit'}
                      {task.status === 'DONE' && 'Erledigt'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditTask(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Notizen</CardTitle>
              <Badge variant="secondary">{notes.length}</Badge>
            </div>
            <Button size="sm" onClick={() => setNoteDialogOpen(true)}>
              Notiz hinzufügen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {notesLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Lade Notizen...
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Notizen vorhanden
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium">{note.title}</div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditNote(note)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {note.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Upload Section */}
      <FileUpload projectId={projectId} />

      {/* Activity Timeline Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <CardTitle>Aktivitäts-Verlauf</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ActivityTimeline entityType="project" entityId={projectId} limit={30} />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TaskFormDialog
        open={taskDialogOpen}
        onOpenChange={handleTaskDialogClose}
        task={selectedTask}
        projectId={projectId}
      />
      <NoteFormDialog
        open={noteDialogOpen}
        onOpenChange={handleNoteDialogClose}
        note={selectedNote}
        projectId={projectId}
      />
    </div>
  );
}
