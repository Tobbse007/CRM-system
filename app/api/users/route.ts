import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  avatar: z.string().optional().nullable(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).optional(),
});

/**
 * GET /api/users
 * Get all users
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const users = await prisma.user.findMany({
      where: {
        ...(role && { role: role as any }),
      },
      include: {
        _count: {
          select: {
            projects: true,
            assignedTasks: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Laden der Benutzer',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = userSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'E-Mail-Adresse wird bereits verwendet',
          code: 'EMAIL_EXISTS',
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: validated,
    });

    return NextResponse.json(
      {
        success: true,
        data: user,
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

    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Erstellen des Benutzers',
      },
      { status: 500 }
    );
  }
}
