import { CreateRegister } from '@/lib/actions';
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { sendRegistrationEmail } from '@/utils/emailSender';

export async function POST(req: Request) {
  try {
    const { data } = await req.json();
    const result = await CreateRegister(data);

    // CreateRegister swallows its own errors and returns undefined on failure.
    // If there's no document id, nothing was saved — do NOT tell the user it worked.
    if (!result) {
      return NextResponse.json(
        { success: false, message: "Could not save your registration. Please try again." },
        { status: 500 }
      );
    }

    // The record is saved; email is best-effort. A mail hiccup must not make a
    // genuinely-registered person think they failed (and re-register a duplicate).
    let emailSent = true;
    try {
      const qrCodeBuffer = await QRCode.toBuffer(result);
      await sendRegistrationEmail(data, qrCodeBuffer);
    } catch (mailError) {
      emailSent = false;
      console.error("Registration saved but email failed:", mailError);
    }

    return NextResponse.json({ success: true, emailSent, message: "Registration successful" });
  } catch (error: any) {
    console.error("Registration failed", error);
    return NextResponse.json({
      success: false,
      message: error.message || "An error occurred during registration"
    });
  }
}