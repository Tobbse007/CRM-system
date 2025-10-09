import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clientSchema } from '@/lib/validations/client';
import { z } from 'zod';

// GET /api/clients - Alle Kunden abrufen
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const clients = await prisma.client.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { company: { contains: search } },
          ],
        }),
        ...(status && { status: status as any }),
      },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
        projects: {
          select: {
            _count: {
              select: {
                tasks: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Berechne die Gesamtanzahl der Tasks für jeden Client
    const clientsWithTaskCount = clients.map((client) => ({
      ...client,
      _count: {
        ...client._count,
        tasks: client.projects.reduce((sum, project) => sum + project._count.tasks, 0),
      },
      projects: undefined, // Entferne projects aus der Response
    }));

    return NextResponse.json({ success: true, data: clientsWithTaskCount });
  } catch (error) {
    console.error('GET /api/clients error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST /api/clients - Neuen Kunden erstellen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation mit Zod
    const validated = clientSchema.parse(body);

    // Check if email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email: validated.email },
    });

    if (existingClient) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ein Kunde mit dieser E-Mail existiert bereits',
          code: 'EMAIL_EXISTS' 
        },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: validated,
    });

    return NextResponse.json(
      { success: true, data: client },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validierungsfehler', 
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    console.error('POST /api/clients error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
