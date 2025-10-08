import { NextRequest, NextResponse } from 'next/server';
import {
  getNotifications,
  createNotification,
} from '@/lib/notifications/notification-service';
import { NotificationType } from '@prisma/client';

// GET /api/notifications
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const readParam = searchParams.get('read');
    const type = searchParams.get('type') as NotificationType | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const filters: any = {};
    
    if (readParam !== null) {
      filters.read = readParam === 'true';
    }
    
    if (type) {
      filters.type = type;
    }
    
    filters.limit = limit;
    filters.offset = offset;

    const result = await getNotifications(filters);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const notification = await createNotification(body);

    return NextResponse.json(
      {
        success: true,
        data: notification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
