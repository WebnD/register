
import { CreateRegister } from '@/lib/actions';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { data } = await req.json();
    
    const result = await CreateRegister(data);
    return NextResponse.json({ success: true, message: "New Register"});
  } catch (error: any) {
    console.error("Failed to confirm booking", error)
    return NextResponse.json({ success: false, message: error.message });
  }
}
