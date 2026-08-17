import { MarkAttendance } from '@/lib/actions';
import { isDayKey } from '@/lib/event';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { data } = await req.json();

    if (!data?.scannedData || !data?.markedBy || !isDayKey(data?.day)) {
      return NextResponse.json(
        { success: false, message: 'Missing scan data, mentor name, or event day.' },
        { status: 400 }
      );
    }

    const result = await MarkAttendance(data);
    // result = { alreadyMarked, record, day }
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Attendance failed', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}