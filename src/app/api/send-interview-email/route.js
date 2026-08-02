import nodemailer from 'nodemailer';
import { join } from 'path';
import { COMPANY } from '@/config/company';

export async function POST(req) {
  try {
    const { applicantName, applicantEmail, position, interviewDate, interviewTime, interviewType, interviewLocation, additionalMessage, lang } = await req.json();
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

    const typeLabel = isAr
      ? ({ in_person: 'حضوري', video: 'مكالمة فيديو', phone: 'مكالمة هاتفية' }[interviewType] || interviewType)
      : ({ in_person: 'In Person', video: 'Video Call', phone: 'Phone Call' }[interviewType] || interviewType);

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
            <h2 style="color:#fff;font-size:20px;font-weight:800;margin:0 0 8px;">مبروك! تم قبول طلبك ✨</h2>
            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.8;margin:0 0 28px;">
              عزيزي/عزيزتي <strong style="color:#c8a96e;">${applicantName}</strong>،<br/>
              يسعدنا إخبارك أنه تم مراجعة طلب التوظيف المقدم لوظيفة
              <strong style="color:#c8a96e;">${position}</strong>
              وتم قبولك للمرحلة التالية.
            </p>

            <!-- Interview Details Card -->
            <div style="background:rgba(184,146,58,0.06);border:1px solid rgba(184,146,58,0.2);border-radius:16px;padding:24px;margin-bottom:28px;">
              <h3 style="color:#c8a96e;font-size:15px;font-weight:800;margin:0 0 20px;padding-bottom:12px;border-bottom:1px solid rgba(184,146,58,0.15);">
                📅 تفاصيل المقابلة
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;width:140px;">📆 التاريخ</td>
                  <td style="padding:8px 0;color:#fff;font-size:14px;font-weight:700;">${interviewDate}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;">🕐 الوقت</td>
                  <td style="padding:8px 0;color:#fff;font-size:14px;font-weight:700;">${interviewTime}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;">📋 نوع المقابلة</td>
                  <td style="padding:8px 0;color:#fff;font-size:14px;font-weight:700;">${typeLabel}</td>
                </tr>
                ${interviewLocation ? `
                <tr>
                  <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;">📍 الموقع / الرابط</td>
                  <td style="padding:8px 0;color:#c8a96e;font-size:14px;font-weight:700;">${interviewLocation}</td>
                </tr>` : ''}
              </table>
            </div>

            ${additionalMessage ? `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:28px;">
              <p style="color:rgba(255,255,255,0.5);font-size:12px;font-weight:700;uppercase;letter-spacing:1px;margin:0 0 8px;">رسالة من فريق الموارد البشرية</p>
              <p style="color:rgba(255,255,255,0.75);font-size:14px;line-height:1.8;margin:0;">${additionalMessage}</p>
            </div>` : ''}

            <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.8;margin:0;">
              نرجو التأكد من الحضور في الموعد المحدد. إذا كانت لديك أي استفسارات، يرجى التواصل معنا عبر الرد على هذا البريد الإلكتروني.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:rgba(0,0,0,0.3);padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="color:rgba(255,255,255,0.25);font-size:12px;margin:0;">شركة MNC للإنشاءات — جدة، المملكة العربية السعودية</p>
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
            <h2 style="color:#fff;font-size:20px;font-weight:800;margin:0 0 8px;">Congratulations! Your application has been accepted ✨</h2>
            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.8;margin:0 0 28px;">
              Dear <strong style="color:#c8a96e;">${applicantName}</strong>,<br/>
              We're pleased to let you know that your job application for
              <strong style="color:#c8a96e;">${position}</strong>
              has been reviewed and you've been accepted for the next stage.
            </p>

            <!-- Interview Details Card -->
            <div style="background:rgba(184,146,58,0.06);border:1px solid rgba(184,146,58,0.2);border-radius:16px;padding:24px;margin-bottom:28px;">
              <h3 style="color:#c8a96e;font-size:15px;font-weight:800;margin:0 0 20px;padding-bottom:12px;border-bottom:1px solid rgba(184,146,58,0.15);">
                📅 Interview Details
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;width:140px;">📆 Date</td>
                  <td style="padding:8px 0;color:#fff;font-size:14px;font-weight:700;">${interviewDate}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;">🕐 Time</td>
                  <td style="padding:8px 0;color:#fff;font-size:14px;font-weight:700;">${interviewTime}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;">📋 Interview Type</td>
                  <td style="padding:8px 0;color:#fff;font-size:14px;font-weight:700;">${typeLabel}</td>
                </tr>
                ${interviewLocation ? `
                <tr>
                  <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;">📍 Location / Link</td>
                  <td style="padding:8px 0;color:#c8a96e;font-size:14px;font-weight:700;">${interviewLocation}</td>
                </tr>` : ''}
              </table>
            </div>

            ${additionalMessage ? `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:28px;">
              <p style="color:rgba(255,255,255,0.5);font-size:12px;font-weight:700;uppercase;letter-spacing:1px;margin:0 0 8px;">Message from the HR Team</p>
              <p style="color:rgba(255,255,255,0.75);font-size:14px;line-height:1.8;margin:0;">${additionalMessage}</p>
            </div>` : ''}

            <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.8;margin:0;">
              Please make sure to attend at the scheduled time. If you have any questions, feel free to reply to this email.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:rgba(0,0,0,0.3);padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="color:rgba(255,255,255,0.25);font-size:12px;margin:0;">MNC Construction — Jeddah, Saudi Arabia</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: isAr ? `"MNC للإنشاءات" <${COMPANY.email}>` : `"${COMPANY.name}" <${COMPANY.email}>`,
      to:      applicantEmail,
      subject: isAr ? `دعوة مقابلة — ${position} | MNC Construction` : `Interview Invitation — ${position} | MNC Construction`,
      html,
      attachments: [{
        filename: 'logo.png',
        path:     logoPath,
        cid:      'mnc-logo',
      }],
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('[send-interview-email]', err?.code, err?.message, err?.response);
    return Response.json({
      success: false,
      error: err.message,
      code: err.code,
      response: err.response,
    }, { status: 500 });
  }
}
