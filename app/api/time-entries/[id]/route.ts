import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const timeEntryUpdateSchema = z.object({
  description: z.string().optional().nullable(),
  endTime: z.string().datetime().optional().nullable(),
});

/**
 * GET /api/time-entries/[id]
 * Get a single time entry
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id: params.id },
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

    if (!timeEntry) {
      return NextResponse.json(
        {
          success: false,
          error: 'Zeiteintrag nicht gefunden',
          code: 'TIME_ENTRY_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: timeEntry,
    });
  } catch (error) {
    console.error('Error fetching time entry:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Laden des Zeiteintrags',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/time-entries/[id]
 * Update a time entry (stop timer, update description)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validated = timeEntryUpdateSchema.parse(body);

    // Check if time entry exists
    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id: params.id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        {
          success: false,
          error: 'Zeiteintrag nicht gefunden',
          code: 'TIME_ENTRY_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Berechne duration wenn endTime gesetzt wird
    let duration = existingEntry.duration;
    if (validated.endTime) {
      const start = existingEntry.startTime;
      const end = new Date(validated.endTime);
      duration = Math.floor((end.getTime() - start.getTime()) / 1000);
    }

    const updateData: any = {};
    if (validated.description !== undefined) {
      updateData.description = validated.description;
    }
    if (validated.endTime !== undefined) {
      updateData.endTime = validated.endTime ? new Date(validated.endTime) : null;
      updateData.duration = duration;
    }

    const timeEntry = await prisma.timeEntry.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      data: timeEntry,
    });
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

    console.error('Error updating time entry:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Aktualisieren des Zeiteintrags',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/time-entries/[id]
 * Delete a time entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if time entry exists
    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id: params.id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        {
          success: false,
          error: 'Zeiteintrag nicht gefunden',
          code: 'TIME_ENTRY_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    await prisma.timeEntry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      data: { id: params.id },
    });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Löschen des Zeiteintrags',
      },
      { status: 500 }
    );
  }
}
