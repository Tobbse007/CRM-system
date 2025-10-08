import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/stats - Dashboard Statistiken
export async function GET(request: NextRequest) {
  try {
    // Parallel queries für bessere Performance
    const [
      totalClients,
      activeClients,
      totalProjects,
      projectsByStatus,
      totalTasks,
      tasksByStatus,
      totalBudget,
      recentProjects,
      dueTasks,
    ] = await Promise.all([
      // Kunden gesamt
      prisma.client.count({
        where: { deletedAt: null },
      }),
      
      // Aktive Kunden
      prisma.client.count({
        where: { deletedAt: null, status: 'ACTIVE' },
      }),
      
      // Projekte gesamt
      prisma.project.count({
        where: { deletedAt: null },
      }),
      
      // Projekte nach Status
      prisma.project.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: true,
      }),
      
      // Tasks gesamt
      prisma.task.count(),
      
      // Tasks nach Status
      prisma.task.groupBy({
        by: ['status'],
        _count: true,
      }),
      
      // Gesamt-Budget (Summe aller Projekt-Budgets)
      prisma.project.aggregate({
        where: { deletedAt: null, budget: { not: null } },
        _sum: { budget: true },
      }),
      
      // Letzte 5 Projekte
      prisma.project.findMany({
        where: { deletedAt: null },
        include: { client: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      
      // Fällige Tasks (nächste 7 Tage)
      prisma.task.findMany({
        where: {
          status: { not: 'DONE' },
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 Tage
          },
        },
        include: {
          project: {
            include: { client: true },
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
    ]);

    // Status-Counts in Object umwandeln
    const projectStatusCounts = projectsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    const taskStatusCounts = tasksByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      clients: {
        total: totalClients,
        active: activeClients,
        inactive: totalClients - activeClients,
      },
      projects: {
        total: totalProjects,
        planning: projectStatusCounts.PLANNING || 0,
        inProgress: projectStatusCounts.IN_PROGRESS || 0,
        review: projectStatusCounts.REVIEW || 0,
        completed: projectStatusCounts.COMPLETED || 0,
        onHold: projectStatusCounts.ON_HOLD || 0,
      },
      tasks: {
        total: totalTasks,
        todo: taskStatusCounts.TODO || 0,
        inProgress: taskStatusCounts.IN_PROGRESS || 0,
        done: taskStatusCounts.DONE || 0,
      },
      budget: {
        total: totalBudget._sum.budget || 0,
      },
      recentProjects,
      dueTasks,
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
