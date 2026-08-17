import { FetchRegistrations } from '@/lib/actions';
import { NextResponse } from 'next/server';

// Without this, Next.js statically prerenders this GET route at BUILD time,
// runs it once (against build-time data or none at all), and serves that frozen
// snapshot forever. The admin dashboard would never see new registrations.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await FetchRegistrations();

    return NextResponse.json({ success: true, message: "Registration successful", registrations: result });
  } catch (error: any) {
    console.error("Registration failed", error);
    return NextResponse.json({
      success: false,
      message: error.message || "An error occurred during registration"
    });
  }
}