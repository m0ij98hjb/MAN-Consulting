import nodemailer from 'nodemailer';
import { join } from 'path';
import { COMPANY } from '@/config/company';

export async function POST(req) {
  try {
    const { customerName, customerEmail, subject, replyMessage, lang } = await req.json();
    const isAr = !lang || lang === 'ar'; // default to Arabic when omitted, preserving prior behavior for callers not yet updated

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return Response.json({ success: false, error: 'SMTP_USER or SMTP_PASS env vars not set' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const logoPath = join(process.cwd(), 'public', 'asstes', 'logo-navbar.png');

    // Two shipped templates (Arabic + English). Other site languages fall
    // back to English rather than fabricating unreviewed translations for
    // customer-facing transactional email copy.
    const html = isAr ? `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111118;border-radius:20px;overflow:hidden;border:1px solid rgba(200,169,110,0.2);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1408,#0a0a0f);padding:40px;text-align:center;border-bottom:1px solid rgba(200,169,110,0.15);">
            <div style="display:inline-block;background:#ffffff;border-radius:14px;padding:10px 18px;margin-bottom:18px;">
              <img src="cid:mnc-logo" alt="MNC" width="160" style="display:block;max-height:60px;width:auto;" />
            </div>
            <h1 style="color:#c8a96e;margin:0;font-size:22px;font-weight:900;letter-spacing:1px;">شركة MNC للإنشاءات</h1>
            <p style="color:rgba(255,255,255,0.4);margin:8px 0 0;font-size:13px;">MNC Construction</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.8;margin:0 0 24px;">
              عزيزنا/عزيزتنا <strong style="color:#c8a96e;">${customerName || 'العميل الكريم'}</strong>،<br/>
              شكراً لتواصلكم معنا. نسعد بالرد على رسالتكم وتقديم الدعم اللازم.
            </p>

            <!-- Reply Card -->
            <div style="background:rgba(184,146,58,0.06);border:1px solid rgba(184,146,58,0.2);border-radius:16px;padding:28px;margin-bottom:28px;">
              <h3 style="color:#c8a96e;font-size:14px;font-weight:800;margin:0 0 18px;padding-bottom:12px;border-bottom:1px solid rgba(184,146,58,0.15);">
                💬 رد فريق MNC
              </h3>
              <p style="color:rgba(255,255,255,0.80);font-size:14px;line-height:1.9;margin:0;white-space:pre-wrap;">${replyMessage}</p>
            </div>

            <p style="color:rgba(255,255,255,0.4);font-size:13px;line-height:1.8;margin:0;">
              إذا كان لديكم أي استفسار إضافي، يسعدنا دائماً مساعدتكم عبر الرد على هذا البريد الإلكتروني أو التواصل معنا مباشرةً.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:rgba(0,0,0,0.3);padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;line-height:1.8;">
              شركة MNC للإنشاءات — جدة، المملكة العربية السعودية
              <br/>
              <span style="color:rgba(200,169,110,0.35);">هذه رسالة رسمية من فريق خدمة العملاء</span>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>` : `
<!DOCTYPE html>
<html dir="ltr" lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;direction:ltr;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111118;border-radius:20px;overflow:hidden;border:1px solid rgba(200,169,110,0.2);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1408,#0a0a0f);padding:40px;text-align:center;border-bottom:1px solid rgba(200,169,110,0.15);">
            <div style="display:inline-block;background:#ffffff;border-radius:14px;padding:10px 18px;margin-bottom:18px;">
              <img src="cid:mnc-logo" alt="MNC" width="160" style="display:block;max-height:60px;width:auto;" />
            </div>
            <h1 style="color:#c8a96e;margin:0;font-size:22px;font-weight:900;letter-spacing:1px;">MNC Construction</h1>
            <p style="color:rgba(255,255,255,0.4);margin:8px 0 0;font-size:13px;">شركة MNC للإنشاءات</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.8;margin:0 0 24px;">
              Dear <strong style="color:#c8a96e;">${customerName || 'Valued Customer'}</strong>,<br/>
              Thank you for contacting us. We're glad to reply to your message and provide the support you need.
            </p>

            <!-- Reply Card -->
            <div style="background:rgba(184,146,58,0.06);border:1px solid rgba(184,146,58,0.2);border-radius:16px;padding:28px;margin-bottom:28px;">
              <h3 style="color:#c8a96e;font-size:14px;font-weight:800;margin:0 0 18px;padding-bottom:12px;border-bottom:1px solid rgba(184,146,58,0.15);">
                💬 Reply from the MNC Team
              </h3>
              <p style="color:rgba(255,255,255,0.80);font-size:14px;line-height:1.9;margin:0;white-space:pre-wrap;">${replyMessage}</p>
            </div>

            <p style="color:rgba(255,255,255,0.4);font-size:13px;line-height:1.8;margin:0;">
              If you have any further questions, we're always happy to help — just reply to this email or contact us directly.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:rgba(0,0,0,0.3);padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;line-height:1.8;">
              MNC Construction — Jeddah, Saudi Arabia
              <br/>
              <span style="color:rgba(200,169,110,0.35);">This is an official message from our customer service team</span>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from:    isAr ? `"MNC للإنشاءات" <${COMPANY.email}>` : `"${COMPANY.name}" <${COMPANY.email}>`,
      to:      customerEmail,
      subject: subject || (isAr ? 'رد من شركة MNC للإنشاءات' : 'Reply from MNC Construction'),
      html,
      attachments: [{
        filename: 'logo.png',
        path:     logoPath,
        cid:      'mnc-logo',
      }],
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('[send-contact-reply]', err?.code, err?.message);
    return Response.json({ success: false, error: err.message, code: err.code }, { status: 500 });
  }
}
