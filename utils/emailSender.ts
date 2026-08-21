import nodemailer from 'nodemailer';
import { EVENT } from '@/lib/event';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// "4 September 2026" -> "SEP 4"
function shortDate(full: string) {
  const parts = full.split(' ');
  if (parts.length >= 2) return `${parts[1].slice(0, 3).toUpperCase()} ${parts[0]}`;
  return full;
}

// Builds the ticket HTML. qrSrc is "cid:qrcode" for email; a data URI is used
// only by the standalone preview. Retro red / black / cream theme to match the
// event poster. Email-safe: tables + inline styles only.
export function buildTicketHtml(name: string, qrSrc: string) {
  const NAME = (name || '').toUpperCase();

  const scheduleRows = EVENT.days
    .map(
      (d) => `
      <tr>
        <td style="padding:4px 16px 4px 0;color:#c9a876;font-family:'Courier New',Courier,monospace;font-size:12px;white-space:nowrap;">${shortDate(d.date)}</td>
        <td style="padding:4px 0;color:#d8c6a7;font-family:'Courier New',Courier,monospace;font-size:12px;">${d.time}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:0 0 8px;color:#8a7a5f;font-family:'Courier New',Courier,monospace;font-size:10px;">${d.topics.join(' · ')}</td>
      </tr>`
    )
    .join('');

  return `
  <div style="background:#0c0c0c;padding:28px 12px;font-family:'Courier New',Courier,monospace;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="600" style="max-width:600px;width:100%;background:#141009;border:1px solid #3a2f24;border-radius:14px;">
      <tr>
        <td style="padding:14px 22px 8px;border-bottom:1px solid #2a221a;">
          <span style="color:#8a7a5f;font-size:11px;letter-spacing:2px;">// ENTRY TICKET</span>
          <span style="float:right;color:#8a7a5f;font-size:11px;letter-spacing:2px;">WEB &amp; DESIGN SOCIETY</span>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 22px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <!-- LEFT -->
              <td valign="top" style="width:62%;padding-right:18px;">
                <div style="color:#ece0c8;font-size:28px;font-weight:bold;letter-spacing:3px;line-height:1.05;">DESIGN</div>
                <div style="color:#991d1d;font-size:28px;font-weight:bold;letter-spacing:3px;line-height:1.05;">BOOTCAMP</div>
                <div style="color:#8a7a5f;font-size:11px;letter-spacing:1px;margin-top:6px;">[ ${EVENT.tagline.toUpperCase()} ]</div>

                <div style="color:#c9a876;font-size:10px;letter-spacing:2px;margin-top:22px;">ADMIT</div>
                <div style="display:inline-block;color:#ece0c8;font-size:18px;font-weight:bold;letter-spacing:1px;border-bottom:2px solid #991d1d;padding:4px 2px 6px;margin-top:6px;">[ ${NAME} ]</div>

                <div style="color:#c9a876;font-size:10px;letter-spacing:2px;margin-top:22px;">// SCHEDULE</div>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">
                  ${scheduleRows}
                </table>

                <div style="color:#c9a876;font-size:10px;letter-spacing:2px;margin-top:12px;">// VENUE</div>
                <div style="color:#d8c6a7;font-size:13px;margin-top:4px;">${EVENT.venue} — ${EVENT.campus}</div>
              </td>

              <!-- RIGHT: QR only -->
              <td valign="middle" align="center" style="width:38%;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:12px;border:1px solid #991d1d;border-radius:10px;background:#0f0b08;">
                      <img src="${qrSrc}" alt="Entry QR" width="150" height="150" style="display:block;background:#ffffff;padding:6px;border-radius:4px;" />
                    </td>
                  </tr>
                </table>
                <div style="color:#8a7a5f;font-size:10px;letter-spacing:2px;margin-top:10px;">// SCAN AT ENTRY</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 22px 14px;border-top:1px solid #2a221a;">
          <span style="color:#8a7a5f;font-size:10px;letter-spacing:1px;">This ticket is unique to you. Bring it on each day.</span>
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