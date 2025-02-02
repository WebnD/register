import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendRegistrationEmail(register: Register, qrCodeBuffer: Buffer) {
  const mailOptions = {
    from: '"WebnD Induction Registration" <noreply@webnd-iitbbs.org>',
    to: register.email,
    subject: 'WebnD Registration Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Registration Confirmed!</h2>
        <p>Hello ${register.name},</p>
        <p>Your registration for WebnD Induction has been successfully received.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af;">Registration Details:</h3>
          <p><strong>Name:</strong> ${register.name}</p>
          <p><strong>Roll Number:</strong> ${register.roll}</p>
          <p><strong>Email:</strong> ${register.email}</p>
          <p><strong>Phone:</strong> ${register.phone}</p>
          <p><strong>Reason:</strong> ${register.reason}</p>
          <p><strong>Projects:</strong> ${register.projects}</p>
        </div>

        <p>Your registration QR code is attached below. Please keep it safe for verification.</p>
        
        <p style="margin-top: 30px; color: #6b7280;">
          Best regards,<br>
          WebnD Team
        </p>
      </div>
    `,
    attachments: [{
      filename: 'registration-qr.png',
      content: qrCodeBuffer,
      cid: 'qrcode'
    }]
  };

  await transporter.sendMail(mailOptions);
}