import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { projectSchema } from '@/lib/validations/project';
import { z } from 'zod';

// GET /api/projects/[id] - Einzelnes Projekt abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id, deletedAt: null },
      include: {
        client: true,
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Projekt aktualisieren
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validated = projectSchema.parse(body);

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id, deletedAt: null },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }

    // Check if client exists (if client is being changed)
    if (validated.clientId !== existingProject.clientId) {
      const clientExists = await prisma.client.findUnique({
        where: { id: validated.clientId, deletedAt: null },
      });

      if (!clientExists) {
        return NextResponse.json(
          { success: false, error: 'Kunde nicht gefunden' },
          { status: 404 }
        );
      }
    }

    // Convert date strings to Date objects
    const projectData = {
      ...validated,
      startDate: validated.startDate ? new Date(validated.startDate) : null,
      endDate: validated.endDate ? new Date(validated.endDate) : null,
    };

    const project = await prisma.project.update({
      where: { id: params.id },
      data: projectData,
      include: {
        client: true,
      },
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validierungsfehler', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('PUT /api/projects/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Projekt löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Projekt nicht gefunden' },
        { status: 404 }
      );
    }

    // Hard Delete (CASCADE löscht auch alle Tasks und Notes)
    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Projekt erfolgreich gelöscht',
    });
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Einzelne Felder aktualisieren
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Prepare update data
    const updateData: any = {};
    
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.budget !== undefined) {
      updateData.budget = body.budget;
    }
    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    }
    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: true,
      },
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('PATCH /api/projects/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}
