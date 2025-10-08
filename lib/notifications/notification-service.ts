import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  projectId?: string;
  taskId?: string;
  clientId?: string;
  link?: string;
  priority?: NotificationPriority;
}

export async function createNotification(data: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      type: data.type,
      title: data.title,
      message: data.message,
      projectId: data.projectId,
      taskId: data.taskId,
      clientId: data.clientId,
      link: data.link,
      priority: data.priority || 'NORMAL',
    },
    include: {
      project: true,
      task: true,
      client: true,
    },
  });
}

export async function getNotifications(filters?: {
  read?: boolean;
  type?: NotificationType;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};
  
  if (filters?.read !== undefined) {
    where.read = filters.read;
  }
  
  if (filters?.type) {
    where.type = filters.type;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
        client: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { read: false } }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
  };
}

export async function markAsRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { read: true },
  });
}

export async function markAllAsRead() {
  return prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  });
}

export async function deleteNotification(id: string) {
  return prisma.notification.delete({
    where: { id },
  });
}

export async function deleteAllRead() {
  return prisma.notification.deleteMany({
    where: { read: true },
  });
}

// ============================================
// NOTIFICATION TRIGGER FUNCTIONS
// ============================================

export async function notifyProjectCreated(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true },
  });

  if (!project) return null;

  return createNotification({
    type: 'PROJECT',
    title: 'Neues Projekt erstellt',
    message: `${project.name} für ${project.client.name}`,
    projectId: project.id,
    clientId: project.client.id,
    link: `/projects/${project.id}`,
    priority: 'NORMAL',
  });
}

export async function notifyProjectCompleted(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true },
  });

  if (!project) return null;

  return createNotification({
    type: 'PROJECT',
    title: 'Projekt abgeschlossen',
    message: `${project.name} wurde erfolgreich abgeschlossen! 🎉`,
    projectId: project.id,
    link: `/projects/${project.id}`,
    priority: 'HIGH',
  });
}

export async function notifyTaskCreated(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });

  if (!task) return null;

  return createNotification({
    type: 'TASK',
    title: 'Neue Aufgabe erstellt',
    message: `${task.title} in ${task.project.name}`,
    taskId: task.id,
    projectId: task.project.id,
    link: `/projects/${task.project.id}`,
    priority: task.priority === 'HIGH' ? 'HIGH' : 'NORMAL',
  });
}

export async function notifyTaskOverdue(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });

  if (!task || !task.dueDate) return null;

  const daysOverdue = Math.floor(
    (Date.now() - task.dueDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return createNotification({
    type: 'DEADLINE',
    title: 'Aufgabe überfällig',
    message: `${task.title} ist seit ${daysOverdue} Tag${daysOverdue > 1 ? 'en' : ''} überfällig`,
    taskId: task.id,
    projectId: task.project.id,
    link: `/projects/${task.project.id}`,
    priority: 'URGENT',
  });
}

export async function notifyTaskDueSoon(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });

  if (!task || !task.dueDate) return null;

  return createNotification({
    type: 'DEADLINE',
    title: 'Aufgabe fällig bald',
    message: `${task.title} ist bald fällig`,
    taskId: task.id,
    projectId: task.project.id,
    link: `/projects/${task.project.id}`,
    priority: 'HIGH',
  });
}

export async function notifyClientCreated(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!client) return null;

  return createNotification({
    type: 'CLIENT',
    title: 'Neuer Kunde erstellt',
    message: `${client.name}${client.company ? ` (${client.company})` : ''} wurde hinzugefügt`,
    clientId: client.id,
    link: `/clients`,
    priority: 'NORMAL',
  });
}

export async function notifyBudgetWarning(projectId: string, percentage: number) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) return null;

  return createNotification({
    type: 'PROJECT',
    title: 'Budget-Warnung',
    message: `${project.name}: ${percentage}% des Budgets verbraucht`,
    projectId: project.id,
    link: `/projects/${project.id}`,
    priority: percentage >= 90 ? 'HIGH' : 'NORMAL',
  });
}
