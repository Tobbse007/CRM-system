import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logDeleted } from '@/lib/activity-logger';

/**
 * DELETE /api/projects/[id]/members/[userId]
 * Remove a member from a project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    // Check if member exists
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: params.id,
          userId: params.userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mitglied nicht gefunden',
          code: 'MEMBER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Delete member
    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId: params.id,
          userId: params.userId,
        },
      },
    });

    // Log activity
    await logDeleted({
      entityType: 'PROJECT_MEMBER',
      entityId: member.id,
      description: `${member.user.name} wurde aus dem Projekt entfernt`,
      metadata: {
        projectId: params.id,
        projectName: member.project.name,
        userId: member.user.id,
        userName: member.user.name,
        role: member.role,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: member.id },
    });
  } catch (error) {
    console.error('Error removing project member:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Entfernen des Team-Mitglieds',
      },
      { status: 500 }
    );
  }
}
