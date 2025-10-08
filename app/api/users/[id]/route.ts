import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  avatar: z.string().optional().nullable(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).optional(),
});

/**
 * GET /api/users/[id]
 * Get a single user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        projects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
        _count: {
          select: {
            projects: true,
            assignedTasks: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Benutzer nicht gefunden',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Laden des Benutzers',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * Update a user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validated = userUpdateSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Benutzer nicht gefunden',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it's already in use
    if (validated.email && validated.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validated.email },
      });

      if (emailExists) {
        return NextResponse.json(
          {
            success: false,
            error: 'E-Mail-Adresse wird bereits verwendet',
            code: 'EMAIL_EXISTS',
          },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: validated,
    });

    return NextResponse.json({
      success: true,
      data: user,
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

    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Aktualisieren des Benutzers',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Delete a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Benutzer nicht gefunden',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      data: { id: params.id },
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Löschen des Benutzers',
      },
      { status: 500 }
    );
  }
}
