import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/analytics - Dashboard Analytics Daten
export async function GET(request: NextRequest) {
  try {
    // Budget vs Time Data
    const projectsWithTime = await prisma.project.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        budget: true,
        timeEntries: {
          where: {
            endTime: { not: null },
            duration: { not: null },
          },
          select: {
            duration: true,
          },
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    const projectBudgets = projectsWithTime.map(project => {
      const totalSeconds = project.timeEntries.reduce((sum, entry) => {
        return sum + (entry.duration || 0);
      }, 0);
      const totalHours = totalSeconds / 3600;

      return {
        name: project.name,
        budget: project.budget || 0,
        timeSpent: parseFloat(totalHours.toFixed(2)),
      };
    });

    // Activity Trend (letzte 14 Tage)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const activities = await prisma.activity.findMany({
      where: {
        createdAt: { gte: fourteenDaysAgo },
      },
      select: {
        createdAt: true,
      },
    });

    // Gruppiere nach Tag
    const activityByDay = new Map<string, number>();
    const today = new Date();
    
    // Initialisiere alle Tage mit 0
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      activityByDay.set(dateStr, 0);
    }

    // Zähle Aktivitäten pro Tag
    activities.forEach(activity => {
      const dateStr = new Date(activity.createdAt).toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      const current = activityByDay.get(dateStr) || 0;
      activityByDay.set(dateStr, current + 1);
    });

    const activityTrend = Array.from(activityByDay.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    // Client Activity (Top 5 aktivste Kunden)
    const clientActivity = await prisma.client.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        projects: {
          where: { deletedAt: null },
          select: {
            id: true,
            tasks: {
              select: { id: true },
            },
          },
        },
      },
      take: 10,
    });

    const clientStats = clientActivity
      .map(client => ({
        name: client.name,
        projects: client.projects.length,
        tasks: client.projects.reduce((sum, p) => sum + p.tasks.length, 0),
      }))
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 5);

    // Team Performance (Benutzer mit meisten Aufgaben)
    const teamPerformance = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        assignedTasks: {
          select: {
            status: true,
          },
        },
        timeEntries: {
          where: {
            endTime: { not: null },
            duration: { not: null },
          },
          select: {
            duration: true,
          },
        },
      },
    });

    const teamStats = teamPerformance.map(user => {
      const totalTasks = user.assignedTasks.length;
      const doneTasks = user.assignedTasks.filter(t => t.status === 'DONE').length;
      const completionRate = totalTasks > 0 ? ((doneTasks / totalTasks) * 100).toFixed(1) : '0';
      
      const totalSeconds = user.timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
      const totalHours = (totalSeconds / 3600).toFixed(1);

      return {
        name: user.name,
        email: user.email,
        totalTasks,
        doneTasks,
        completionRate: parseFloat(completionRate),
        hoursLogged: parseFloat(totalHours),
      };
    }).sort((a, b) => b.totalTasks - a.totalTasks).slice(0, 5);

    const analytics = {
      projectBudgets,
      activityTrend,
      clientStats,
      teamStats,
    };

    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
