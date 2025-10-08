import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/activities
 * Get all activities with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const type = searchParams.get('type');
    const limit = searchParams.get('limit');

    const activities = await prisma.activity.findMany({
      where: {
        ...(entityType && { entityType }),
        ...(entityId && { entityId }),
        ...(type && { type: type as any }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit ? parseInt(limit) : 50,
    });

    return NextResponse.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fehler beim Laden der Aktivitäten',
      },
      { status: 500 }
    );
  }
}
