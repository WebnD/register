import { NextResponse } from 'next/server';

// Verifies the mentor password server-side so MENTOR_PASSWORD is never shipped
// to the browser. Set MENTOR_PASSWORD in your environment.
export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const expected = process.env.MENTOR_PASSWORD;
    const ok = Boolean(expected) && password === expected;
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false });
  }
}