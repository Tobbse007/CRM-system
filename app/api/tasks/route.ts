import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { taskSchema } from '@/lib/validations/task';
import { ZodError } from 'zod';
import { logCreated } from '@/lib/activity-logger';

/**
 * GET /api/tasks
 * Get all tasks with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
          ],
        }),
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Laden der Aufgaben',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = taskSchema.parse(body);

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
    });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Projekt nicht gefunden',
          code: 'PROJECT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Convert dueDate string to Date if provided
    const taskData = {
      ...validatedData,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
    };

    const task = await prisma.task.create({
      data: taskData,
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    // Log activity
    await logCreated('task', task.id, task.title);

    return NextResponse.json(
      {
        success: true,
        data: task,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validierungsfehler',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    console.error('Error creating task:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Erstellen der Aufgabe',
      },
      { status: 500 }
    );
  }
}
