import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { projectSchema } from '@/lib/validations/project';
import { z } from 'zod';

// GET /api/projects - Alle Projekte abrufen
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');

    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }),
        ...(status && { status: status as any }),
        ...(clientId && { clientId }),
      },
      include: {
        client: true,
        tasks: {
          where: { status: { not: 'DONE' } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Neues Projekt erstellen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation mit Zod
    const validated = projectSchema.parse(body);

    // Check if client exists
    const clientExists = await prisma.client.findUnique({
      where: { id: validated.clientId, deletedAt: null },
    });

    if (!clientExists) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Kunde nicht gefunden',
          code: 'CLIENT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Convert date strings to Date objects
    const projectData = {
      ...validated,
      startDate: validated.startDate ? new Date(validated.startDate) : null,
      endDate: validated.endDate ? new Date(validated.endDate) : null,
    };

    const project = await prisma.project.create({
      data: projectData,
      include: {
        client: true,
      },
    });

    return NextResponse.json(
      { success: true, data: project },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validierungsfehler', 
          issues: error.issues 
        },
        { status: 400 }
      );
    }
    
    console.error('POST /api/projects error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
