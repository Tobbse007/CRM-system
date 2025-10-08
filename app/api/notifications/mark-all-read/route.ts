import { NextResponse } from 'next/server';
import { markAllAsRead } from '@/lib/notifications/notification-service';

// PATCH /api/notifications/mark-all-read
export async function PATCH() {
  try {
    const result = await markAllAsRead();

    return NextResponse.json({
      success: true,
      data: result,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
