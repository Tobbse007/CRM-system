import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const timeEntrySchema = z.object({
  description: z.string().optional().nullable(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional().nullable(),
  projectId: z.string().uuid(),
  taskId: z.string().uuid().optional().nullable(),
  userId: z.string().uuid().optional().nullable(),
});

/**
 * GET /api/time-entries
 * Get all time entries with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const taskId = searchParams.get('taskId');
    const userId = searchParams.get('userId');
    const active = searchParams.get('active'); // nur laufende Timer

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (taskId) where.taskId = taskId;
    if (userId) where.userId = userId;
    if (active === 'true') where.endTime = null;

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: timeEntries,
    });
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Laden der Zeiteinträge',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/time-entries
 * Create a new time entry (start timer)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = timeEntrySchema.parse(body);

    // Berechne duration wenn endTime vorhanden
    let duration: number | null = null;
    if (validated.endTime) {
      const start = new Date(validated.startTime);
      const end = new Date(validated.endTime);
      duration = Math.floor((end.getTime() - start.getTime()) / 1000); // Sekunden
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        description: validated.description,
        startTime: new Date(validated.startTime),
        endTime: validated.endTime ? new Date(validated.endTime) : null,
        duration,
        projectId: validated.projectId,
        taskId: validated.taskId,
        userId: validated.userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: timeEntry,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validierungsfehler',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    console.error('Error creating time entry:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Erstellen des Zeiteintrags',
      },
      { status: 500 }
    );
  }
}
