import nodemailer from 'nodemailer';
import { join } from 'path';
import { COMPANY } from '@/config/company';

export async function POST(req) {
  try {
    const { supplierName, contactName, supplierEmail, visitDate, visitTime, additionalMessage, lang } = await req.json();
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
          <td style="background:linear-gradient(135deg,#1a1408,#0d0d14);padding:44px 40px;text-align:center;border-bottom:1px solid rgba(200,169,110,0.15);">
            <div style="display:inline-block;background:#ffffff;border-radius:14px;padding:10px 18px;margin-bottom:18px;">
              <img src="cid:mnc-logo" alt="MNC" width="160" style="display:block;max-height:60px;width:auto;" />
            </div>
            <h1 style="color:#c8a96e;margin:0;font-size:24px;font-weight:900;letter-spacing:1px;">MNC Construction</h1>
            <p style="color:rgba(255,255,255,0.35);margin:6px 0 0;font-size:13px;letter-spacing:0.5px;">شركة MNC للإنشاءات</p>
          </td>
        </tr>

        <!-- Banner -->
        <tr>
          <td style="background:linear-gradient(135deg,rgba(184,146,58,0.12),rgba(184,146,58,0.05));padding:28px 40px;border-bottom:1px solid rgba(200,169,110,0.1);">
            <p style="color:#c8a96e;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;">دعوة زيارة</p>
            <h2 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 10px;line-height:1.4;">
              تمت دعوتكم لزيارة موقع شركة MNC Construction
            </h2>
            <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.8;margin:0;">
              يسعدنا دعوتكم لزيارة مقر شركة <strong style="color:#c8a96e;">MNC Construction</strong> في الموعد المحدد أدناه لاستكمال إجراءات التعاون.
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">

            <p style="color:rgba(255,255,255,0.65);font-size:14px;line-height:1.9;margin:0 0 28px;">
              عزيزنا <strong style="color:#fff;">${contactName}</strong> / <strong style="color:#fff;">${supplierName}</strong>،
              <br/><br/>
              نتشرف بدعوتكم لزيارة مقرنا للتعرف على آليات التعاون وبناء شراكة استراتيجية مثمرة.
            </p>

            <!-- Visit Details Card -->
            <div style="background:rgba(184,146,58,0.06);border:1px solid rgba(184,146,58,0.2);border-radius:16px;padding:24px;margin-bottom:28px;">
              <h3 style="color:#c8a96e;font-size:15px;font-weight:800;margin:0 0 20px;padding-bottom:12px;border-bottom:1px solid rgba(184,146,58,0.15);">
                📅 تفاصيل الزيارة
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;width:140px;">📆 تاريخ الزيارة</td>
                  <td style="padding:8px 0;color:#fff;font-size:14px;font-weight:700;">${visitDate}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;">🕐 وقت الزيارة</td>
                  <td style="padding:8px 0;color:#fff;font-size:14px;font-weight:700;">${visitTime}</td>
                </tr>
              </table>
            </div>

            ${additionalMessage ? `
            <!-- Additional message -->
            <div style="background:rgba(200,169,110,0.06);border:1px solid rgba(200,169,110,0.18);border-radius:12px;padding:20px;margin-bottom:28px;">
              <p style="color:#c8a96e;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 10px;">ملاحظة من الإدارة</p>
              <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.8;margin:0;">${additionalMessage}</p>
            </div>` : ''}

            <p style="color:rgba(255,255,255,0.4);font-size:13px;line-height:1.8;margin:0;">
              نرجو الحضور في الموعد المحدد. في حال وجود أي استفسار، لا تترددوا في التواصل معنا عبر الرد على هذا البريد الإلكتروني.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:rgba(0,0,0,0.35);padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;line-height:1.8;">
              شركة MNC للإنشاءات — المملكة العربية السعودية
              <br/>
              <span style="color:rgba(200,169,110,0.4);">هذا البريد أُرسل تلقائياً · يرجى عدم الرد المباشر</span>
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
          <td style="background:linear-gradient(135deg,#1a1408,#0d0d14);padding:44px 40px;text-align:center;border-bottom:1px solid rgba(200,169,110,0.15);">
            <div style="display:inline-block;background:#ffffff;border-radius:14px;padding:10px 18px;margin-bottom:18px;">
              <img src="cid:mnc-logo" alt="MNC" width="160" style="display:block;max-height:60px;width:auto;" />
            </div>
            <h1 style="color:#c8a96e;margin:0;font-size:24px;font-weight:900;letter-spacing:1px;">MNC Construction</h1>
            <p style="color:rgba(255,255,255,0.35);margin:6px 0 0;font-size:13px;letter-spacing:0.5px;">شركة MNC للإنشاءات</p>
          </td>
        </tr>

        <!-- Banner -->
        <tr>
          <td style="background:linear-gradient(135deg,rgba(184,146,58,0.12),rgba(184,146,58,0.05));padding:28px 40px;border-bottom:1px solid rgba(200,169,110,0.1);">
            <p style="color:#c8a96e;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;">Visit Invitation</p>
            <h2 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 10px;line-height:1.4;">
              You've been invited to visit MNC Construction
            </h2>
            <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.8;margin:0;">
              We're pleased to invite you to visit <strong style="color:#c8a96e;">MNC Construction</strong>'s office at the time specified below to complete the partnership process.
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">

            <p style="color:rgba(255,255,255,0.65);font-size:14px;line-height:1.9;margin:0 0 28px;">
              Dear <strong style="color:#fff;">${contactName}</strong> / <strong style="color:#fff;">${supplierName}</strong>,
              <br/><br/>
              We're honored to invite you to visit our office to learn more about our collaboration process and build a fruitful strategic partnership.
            </p>

            <!-- Visit Details Card -->
            <div style="background:rgba(184,146,58,0.06);border:1px solid rgba(184,146,58,0.2);border-radius:16px;padding:24px;margin-bottom:28px;">
              <h3 style="color:#c8a96e;font-size:15px;font-weight:800;margin:0 0 20px;padding-bottom:12px;border-bottom:1px solid rgba(184,146,58,0.15);">
                📅 Visit Details
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;width:140px;">📆 Visit Date</td>
                  <td style="padding:8px 0;color:#fff;font-size:14px;font-weight:700;">${visitDate}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;">🕐 Visit Time</td>
                  <td style="padding:8px 0;color:#fff;font-size:14px;font-weight:700;">${visitTime}</td>
                </tr>
              </table>
            </div>

            ${additionalMessage ? `
            <!-- Additional message -->
            <div style="background:rgba(200,169,110,0.06);border:1px solid rgba(200,169,110,0.18);border-radius:12px;padding:20px;margin-bottom:28px;">
              <p style="color:#c8a96e;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 10px;">Note from Management</p>
              <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.8;margin:0;">${additionalMessage}</p>
            </div>` : ''}

            <p style="color:rgba(255,255,255,0.4);font-size:13px;line-height:1.8;margin:0;">
              Please make sure to attend at the scheduled time. If you have any questions, feel free to reply to this email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:rgba(0,0,0,0.35);padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;line-height:1.8;">
              MNC Construction — Saudi Arabia
              <br/>
              <span style="color:rgba(200,169,110,0.4);">This email was sent automatically · please do not reply directly</span>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: isAr ? `"MNC للإنشاءات" <${COMPANY.email}>` : `"${COMPANY.name}" <${COMPANY.email}>`,
      to: supplierEmail,
      subject: isAr ? `دعوة زيارة — ${supplierName} | MNC Construction` : `Visit Invitation — ${supplierName} | MNC Construction`,
      html,
      attachments: [{
        filename: 'logo.png',
        path:     logoPath,
        cid:      'mnc-logo',
      }],
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('[send-supplier-visit-email]', err?.code, err?.message);
    return Response.json({ success: false, error: err.message, code: err.code }, { status: 500 });
  }
}
