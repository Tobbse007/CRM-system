import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { taskUpdateSchema } from '@/lib/validations/task';
import { ZodError } from 'zod';
import { logUpdated, logDeleted, logStatusChanged } from '@/lib/activity-logger';

/**
 * GET /api/tasks/[id]
 * Get a single task by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aufgabe nicht gefunden',
          code: 'TASK_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Laden der Aufgabe',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tasks/[id]
 * Update a task
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = taskUpdateSchema.parse(body);

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!existingTask) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aufgabe nicht gefunden',
          code: 'TASK_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Convert dueDate string to Date if provided
    const updateData: any = { ...validatedData };
    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null;
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    // Log activity
    if (validatedData.status && existingTask.status !== validatedData.status) {
      // Status wurde geändert
      await logStatusChanged(
        'task',
        task.id,
        task.title,
        existingTask.status,
        validatedData.status
      );
    } else {
      // Andere Felder wurden aktualisiert
      const changes: string[] = [];
      if (validatedData.title && existingTask.title !== validatedData.title) changes.push('Titel');
      if (validatedData.priority && existingTask.priority !== validatedData.priority) changes.push('Priorität');
      if (validatedData.dueDate !== undefined) changes.push('Fälligkeitsdatum');
      
      if (changes.length > 0) {
        await logUpdated('task', task.id, task.title, changes);
      }
    }

    return NextResponse.json({
      success: true,
      data: task,
    });
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

    console.error('Error updating task:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Aktualisieren der Aufgabe',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks/[id]
 * Partial update a task (e.g., status only for drag & drop)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!existingTask) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aufgabe nicht gefunden',
          code: 'TASK_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Update only the provided fields
    const task = await prisma.task.update({
      where: { id: params.id },
      data: body,
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    // Log activity if status changed
    if (body.status && existingTask.status !== body.status) {
      await logStatusChanged(
        'task',
        task.id,
        task.title,
        existingTask.status,
        body.status
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error patching task:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Aktualisieren der Aufgabe',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!existingTask) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aufgabe nicht gefunden',
          code: 'TASK_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: { id: params.id },
    });

    // Log activity
    await logDeleted('task', existingTask.id, existingTask.title);

    return NextResponse.json({
      success: true,
      data: { id: params.id },
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Löschen der Aufgabe',
      },
      { status: 500 }
    );
  }
}
