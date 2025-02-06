
import { UpdateInductee } from '@/lib/actions';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { data } = await req.json();
    const result = await UpdateInductee(data);

    

    return NextResponse.json({ success: true, message: "Registration successful" });
  } catch (error: any) {
    console.error("Registration failed", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "An error occurred during registration"
    });
  }
}