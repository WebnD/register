
import { UpdateStatus } from '@/lib/actions';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();
    console.log({id, status})
    const result = await UpdateStatus(id, status);

    

    return NextResponse.json({ success: true, message: "Registration successful" , data: result});
  } catch (error: any) {
    console.error("Update Failed", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "An error occurred during registration"
    });
  }
}