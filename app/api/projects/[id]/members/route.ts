import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logActivity } from '@/lib/activity-logger';

const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['OWNER', 'MEMBER', 'VIEWER']),
});

/**
 * GET /api/projects/[id]/members
 * Get all members of a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error('Error fetching project members:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Laden der Team-Mitglieder',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/members
 * Add a member to a project
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validated = addMemberSchema.parse(body);

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: params.id },
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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: validated.userId },
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

    // Check if member already exists
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: params.id,
          userId: validated.userId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        {
          success: false,
          error: 'Benutzer ist bereits Mitglied dieses Projekts',
          code: 'MEMBER_ALREADY_EXISTS',
        },
        { status: 400 }
      );
    }

    // Add member
    const member = await prisma.projectMember.create({
      data: {
        projectId: params.id,
        userId: validated.userId,
        role: validated.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    // Log activity
    await logActivity({
      type: 'CREATED',
      entityType: 'project',
      entityId: params.id,
      entityName: project.name,
      description: `${user.name} wurde als ${validated.role} zum Team hinzugefügt`,
      metadata: {
        userId: user.id,
        userEmail: user.email,
        role: validated.role,
        memberId: member.id,
      },
      userName: 'System',
    });

    return NextResponse.json(
      {
        success: true,
        data: member,
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

    console.error('Error adding project member:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Hinzufügen des Team-Mitglieds',
      },
      { status: 500 }
    );
  }
}
