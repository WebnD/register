
import { FetchRegistrations } from '@/lib/actions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await FetchRegistrations();


    return NextResponse.json({ success: true, message: "Registration successful" , registrations: result});
  } catch (error: any) {
    console.error("Registration failed", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "An error occurred during registration"
    });
  }
}