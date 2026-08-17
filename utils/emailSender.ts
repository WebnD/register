import nodemailer from 'nodemailer';
import { EVENT } from '@/lib/event';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// "16 August 2026" -> "AUG 16"
function shortDate(full: string) {
  const parts = full.split(' ');
  if (parts.length >= 2) return `${parts[1].slice(0, 3).toUpperCase()} ${parts[0]}`;
  return full;
}

// Builds the ticket HTML. qrSrc is "cid:qrcode" for email; a data URI is used
// only by the standalone preview.
export function buildTicketHtml(name: string, qrSrc: string) {
  const NAME = (name || '').toUpperCase();

  const scheduleRows = EVENT.days
    .map(
      (d) => `
      <tr>
        <td style="padding:3px 16px 3px 0;color:#5eead4;font-family:'Courier New',Courier,monospace;font-size:12px;white-space:nowrap;">${shortDate(d.date)}</td>
        <td style="padding:3px 0;color:#cbd5e1;font-family:'Courier New',Courier,monospace;font-size:12px;white-space:nowrap;">${d.time}</td>
      </tr>`
    )
    .join('');

  return `
  <div style="background:#05070a;padding:28px 12px;font-family:'Courier New',Courier,monospace;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="600" style="max-width:600px;width:100%;background:#0b0f16;border:1px solid #1c7f74;border-radius:14px;">
      <tr>
        <td style="padding:14px 22px 8px;border-bottom:1px solid #12352f;">
          <span style="color:#3f6f68;font-size:11px;letter-spacing:2px;">// ENTRY TICKET</span>
          <span style="float:right;color:#3f6f68;font-size:11px;letter-spacing:2px;">WEB &amp; DESIGN SOCIETY</span>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 22px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <!-- LEFT -->
              <td valign="top" style="width:62%;padding-right:18px;">
                <div style="color:#f1f5f9;font-size:26px;font-weight:bold;letter-spacing:2px;line-height:1.1;">WEB DEV</div>
                <div style="color:#2dd4bf;font-size:26px;font-weight:bold;letter-spacing:2px;line-height:1.1;">BOOTCAMP</div>
                <div style="color:#3f6f68;font-size:11px;letter-spacing:1px;margin-top:6px;">[ v1.0 INITIALIZATION ]</div>

                <div style="color:#5eead4;font-size:10px;letter-spacing:2px;margin-top:22px;">AUTHORIZED PERSONNEL</div>
                <div style="display:inline-block;color:#2dd4bf;font-size:18px;font-weight:bold;letter-spacing:1px;border-bottom:2px solid #2dd4bf;padding:4px 2px 6px;margin-top:6px;">[ ${NAME} ]</div>

                <div style="color:#5eead4;font-size:10px;letter-spacing:2px;margin-top:22px;">// SCHEDULE</div>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">
                  ${scheduleRows}
                </table>

                <div style="color:#5eead4;font-size:10px;letter-spacing:2px;margin-top:18px;">// VENUE</div>
                <div style="color:#cbd5e1;font-size:13px;margin-top:4px;">${EVENT.venue} — ${EVENT.campus}</div>
              </td>

              <!-- RIGHT: QR only -->
              <td valign="middle" align="center" style="width:38%;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:12px;border:1px solid #2dd4bf;border-radius:10px;background:#0d1117;">
                      <img src="${qrSrc}" alt="Entry QR" width="150" height="150" style="display:block;background:#ffffff;padding:6px;border-radius:4px;" />
                    </td>
                  </tr>
                </table>
                <div style="color:#3f6f68;font-size:10px;letter-spacing:2px;margin-top:10px;">// SCAN AT ENTRY</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 22px 14px;border-top:1px solid #12352f;">
          <span style="color:#3f6f68;font-size:10px;letter-spacing:1px;">This ticket is unique to you. Bring it on each day.</span>
        </td>
      </tr>
    </table>
  </div>`;
}

export async function sendRegistrationEmail(register: Register, qrCodeBuffer: Buffer) {
  const mailOptions = {
    from: `"${EVENT.name}" <${process.env.EMAIL_USER}>`,
    to: register.email,
    subject: `Your ${EVENT.name} Entry Ticket`,
    html: buildTicketHtml(register.name, 'cid:qrcode'),
    attachments: [
      {
        filename: 'ticket-qr.png',
        content: qrCodeBuffer,
        cid: 'qrcode',
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}