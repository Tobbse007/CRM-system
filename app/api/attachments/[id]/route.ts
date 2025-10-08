import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';
import { logActivity } from '@/lib/activity-logger';

/**
 * DELETE /api/attachments/[id]
 * Delete an attachment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if attachment exists
    const attachment = await prisma.attachment.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    if (!attachment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datei nicht gefunden',
          code: 'ATTACHMENT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Delete file from filesystem
    try {
      const filepath = path.join(process.cwd(), 'public', attachment.filepath);
      await unlink(filepath);
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await prisma.attachment.delete({
      where: { id: params.id },
    });

    // Log activity
    await logActivity({
      type: 'DELETED',
      entityType: 'project',
      entityId: attachment.projectId,
      entityName: attachment.project.name,
      description: `Datei "${attachment.filename}" wurde gelöscht`,
      metadata: {
        attachmentId: attachment.id,
        filename: attachment.filename,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: params.id },
    });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Löschen der Datei',
      },
      { status: 500 }
    );
  }
}
