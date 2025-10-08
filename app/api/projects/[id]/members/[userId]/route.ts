import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger';

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
    await logActivity({
      type: 'DELETED',
      entityType: 'project',
      entityId: params.id,
      entityName: member.project.name,
      description: `${member.user.name} (${member.role}) wurde aus dem Team entfernt`,
      metadata: {
        userId: member.user.id,
        removedMemberId: member.id,
        role: member.role,
      },
      userName: 'System',
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
