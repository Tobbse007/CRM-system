import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { noteUpdateSchema } from '@/lib/validations/note';
import { ZodError } from 'zod';

/**
 * GET /api/notes/[id]
 * Get a single note by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const note = await prisma.note.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          error: 'Notiz nicht gefunden',
          code: 'NOTE_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Laden der Notiz',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notes/[id]
 * Update a note
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = noteUpdateSchema.parse(body);

    // Check if note exists
    const existingNote = await prisma.note.findUnique({
      where: { id: params.id },
    });

    if (!existingNote) {
      return NextResponse.json(
        {
          success: false,
          error: 'Notiz nicht gefunden',
          code: 'NOTE_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const note = await prisma.note.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: note,
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

    console.error('Error updating note:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Aktualisieren der Notiz',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notes/[id]
 * Delete a note
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if note exists
    const existingNote = await prisma.note.findUnique({
      where: { id: params.id },
    });

    if (!existingNote) {
      return NextResponse.json(
        {
          success: false,
          error: 'Notiz nicht gefunden',
          code: 'NOTE_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    await prisma.note.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      data: { id: params.id },
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Löschen der Notiz',
      },
      { status: 500 }
    );
  }
}
