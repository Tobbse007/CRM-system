import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { noteSchema } from '@/lib/validations/note';
import { ZodError } from 'zod';

/**
 * GET /api/notes
 * Get all notes with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const projectId = searchParams.get('projectId');

    const notes = await prisma.note.findMany({
      where: {
        ...(projectId && { projectId }),
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
      data: notes,
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Laden der Notizen',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notes
 * Create a new note
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = noteSchema.parse(body);

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

    const note = await prisma.note.create({
      data: validatedData,
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: note,
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

    console.error('Error creating note:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Erstellen der Notiz',
      },
      { status: 500 }
    );
  }
}
