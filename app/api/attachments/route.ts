import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { logActivity } from '@/lib/activity-logger';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
];

/**
 * POST /api/attachments
 * Upload a file and attach it to a project
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('projectId') as string | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'Keine Datei ausgewählt',
          code: 'NO_FILE',
        },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Projekt-ID fehlt',
          code: 'NO_PROJECT_ID',
        },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `Datei ist zu groß. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          code: 'FILE_TOO_LARGE',
        },
        { status: 400 }
      );
    }

    // Check mime type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dateityp nicht unterstützt',
          code: 'INVALID_FILE_TYPE',
        },
        { status: 400 }
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true },
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

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.name);
    const filename = `${timestamp}-${randomStr}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Save to database
    const attachment = await prisma.attachment.create({
      data: {
        filename: file.name,
        filepath: `/uploads/${filename}`,
        filesize: file.size,
        mimetype: file.type,
        projectId,
        uploadedBy: 'System', // TODO: Replace with actual user when auth is implemented
      },
    });

    // Log activity
    await logActivity({
      type: 'CREATED',
      entityType: 'project',
      entityId: projectId,
      entityName: project.name,
      description: `Datei "${file.name}" wurde hochgeladen`,
      metadata: {
        attachmentId: attachment.id,
        filename: file.name,
        filesize: file.size,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: attachment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Hochladen der Datei',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/attachments?projectId=xxx
 * Get all attachments for a project
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Projekt-ID fehlt',
          code: 'NO_PROJECT_ID',
        },
        { status: 400 }
      );
    }

    const attachments = await prisma.attachment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: attachments,
    });
  } catch (error) {
    console.error('Error fetching attachments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Laden der Dateien',
      },
      { status: 500 }
    );
  }
}
