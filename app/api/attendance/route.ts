import { MarkAttendance } from '@/lib/actions';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { data } = await req.json();
    const result = await MarkAttendance(data);
    // result = { alreadyMarked, record }
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Attendance failed', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}