import { CreateRegister } from '@/lib/actions';
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { sendRegistrationEmail } from '@/utils/emailSender';

export async function POST(req: Request) {
  try {
    const { data } = await req.json();
    const result = await CreateRegister(data);

    if (result) {
      // Generate QR Code
      const qrCodeBuffer = await QRCode.toBuffer(result);
      
      // Send confirmation email
      await sendRegistrationEmail(data, qrCodeBuffer);
    }

    return NextResponse.json({ success: true, message: "Registration successful" });
  } catch (error: any) {
    console.error("Registration failed", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "An error occurred during registration"
    });
  }
}