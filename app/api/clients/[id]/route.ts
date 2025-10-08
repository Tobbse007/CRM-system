import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clientSchema } from '@/lib/validations/client';
import { z } from 'zod';

// GET /api/clients/[id] - Einzelnen Kunden abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id, deletedAt: null },
      include: {
        projects: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Kunde nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    console.error('GET /api/clients/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Kunden aktualisieren
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validated = clientSchema.parse(body);

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id: params.id, deletedAt: null },
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Kunde nicht gefunden' },
        { status: 404 }
      );
    }

    // Check email uniqueness (if email changed)
    if (validated.email !== existingClient.email) {
      const emailExists = await prisma.client.findUnique({
        where: { email: validated.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'E-Mail wird bereits verwendet' },
          { status: 400 }
        );
      }
    }

    const client = await prisma.client.update({
      where: { id: params.id },
      data: validated,
    });

    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validierungsfehler', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('PUT /api/clients/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Kunden löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Kunde nicht gefunden' },
        { status: 404 }
      );
    }

    // Hard Delete (CASCADE löscht auch alle Projekte, Tasks, Notes)
    await prisma.client.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Kunde erfolgreich gelöscht',
    });
  } catch (error) {
    console.error('DELETE /api/clients/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
