import nodemailer from 'nodemailer';
import { join } from 'path';
import { COMPANY } from '@/config/company';

export async function POST(req) {
  try {
    const { supplierName, contactName, supplierEmail, activity, additionalMessage, lang } = await req.json();
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

        <!-- Congratulations banner -->
        <tr>
          <td style="background:linear-gradient(135deg,rgba(184,146,58,0.12),rgba(184,146,58,0.05));padding:28px 40px;border-bottom:1px solid rgba(200,169,110,0.1);">
            <p style="color:#c8a96e;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;">تهانينا 🎉</p>
            <h2 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 10px;line-height:1.4;">
              تمت الموافقة على طلب تسجيلكم كمورد معتمد
            </h2>
            <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.8;margin:0;">
              يسعدنا إبلاغكم بأن طلب انضمامكم لمنظومة موردي شركة <strong style="color:#c8a96e;">MNC Construction</strong> قد تمت مراجعته والموافقة عليه رسمياً.
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">

            <p style="color:rgba(255,255,255,0.65);font-size:14px;line-height:1.9;margin:0 0 28px;">
              عزيزنا <strong style="color:#fff;">${contactName}</strong> / <strong style="color:#fff;">${supplierName}</strong>،
              <br/><br/>
              نتشرف بترحيبكم ضمن شبكة شركائنا الاستراتيجيين في قطاع الإنشاءات والمقاولات. إن انضمامكم إلينا يُعدّ إضافةً نوعية نحرص من خلالها على تعزيز العلاقات المهنية وبناء شراكات طويلة الأمد قائمة على الثقة والاحتراف.
            </p>

            <!-- Steps Card -->
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(200,169,110,0.18);border-radius:16px;padding:28px;margin-bottom:28px;">
              <h3 style="color:#c8a96e;font-size:14px;font-weight:800;margin:0 0 20px;padding-bottom:14px;border-bottom:1px solid rgba(200,169,110,0.12);">
                📋 الخطوات التالية لاستكمال الإجراءات
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;vertical-align:top;width:32px;">
                    <div style="width:26px;height:26px;background:rgba(184,146,58,0.15);border:1px solid rgba(184,146,58,0.3);border-radius:50%;text-align:center;line-height:26px;font-size:12px;font-weight:800;color:#c8a96e;">١</div>
                  </td>
                  <td style="padding:10px 0 10px 14px;vertical-align:top;">
                    <p style="color:#fff;font-size:13px;font-weight:700;margin:0 0 4px;">التواصل مع فريقنا</p>
                    <p style="color:rgba(255,255,255,0.45);font-size:12px;margin:0;line-height:1.7;">يرجى التواصل مع فريق المشتريات والتوريد للتنسيق وتحديد موعد لاستكمال إجراءات التعاقد الرسمي.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;width:32px;">
                    <div style="width:26px;height:26px;background:rgba(184,146,58,0.15);border:1px solid rgba(184,146,58,0.3);border-radius:50%;text-align:center;line-height:26px;font-size:12px;font-weight:800;color:#c8a96e;">٢</div>
                  </td>
                  <td style="padding:10px 0 10px 14px;vertical-align:top;">
                    <p style="color:#fff;font-size:13px;font-weight:700;margin:0 0 4px;">تجهيز المستندات الرسمية</p>
                    <p style="color:rgba(255,255,255,0.45);font-size:12px;margin:0;line-height:1.7;">يرجى إحضار السجل التجاري، الترخيص المهني، وأي وثائق متعلقة بنشاطكم في مجال <strong style="color:rgba(255,255,255,0.7);">${activity || 'التوريد'}</strong>.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;width:32px;">
                    <div style="width:26px;height:26px;background:rgba(184,146,58,0.15);border:1px solid rgba(184,146,58,0.3);border-radius:50%;text-align:center;line-height:26px;font-size:12px;font-weight:800;color:#c8a96e;">٣</div>
                  </td>
                  <td style="padding:10px 0 10px 14px;vertical-align:top;">
                    <p style="color:#fff;font-size:13px;font-weight:700;margin:0 0 4px;">زيارة فرع الشركة</p>
                    <p style="color:rgba(255,255,255,0.45);font-size:12px;margin:0;line-height:1.7;">تفضلوا بزيارة مقر الشركة في الموعد المتفق عليه لإتمام جميع إجراءات التعاقد وتوقيع الاتفاقية.</p>
                  </td>
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
              نتطلع إلى شراكة ناجحة ومثمرة معكم. في حال وجود أي استفسار، لا تترددوا في التواصل معنا عبر الرد على هذا البريد الإلكتروني.
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

        <!-- Congratulations banner -->
        <tr>
          <td style="background:linear-gradient(135deg,rgba(184,146,58,0.12),rgba(184,146,58,0.05));padding:28px 40px;border-bottom:1px solid rgba(200,169,110,0.1);">
            <p style="color:#c8a96e;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;">Congratulations 🎉</p>
            <h2 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 10px;line-height:1.4;">
              Your registration as an approved supplier has been accepted
            </h2>
            <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.8;margin:0;">
              We're pleased to inform you that your application to join <strong style="color:#c8a96e;">MNC Construction</strong>'s supplier network has been reviewed and officially approved.
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">

            <p style="color:rgba(255,255,255,0.65);font-size:14px;line-height:1.9;margin:0 0 28px;">
              Dear <strong style="color:#fff;">${contactName}</strong> / <strong style="color:#fff;">${supplierName}</strong>,
              <br/><br/>
              We're honored to welcome you into our network of strategic partners in the construction and contracting sector. Your partnership is a valuable addition as we work to strengthen professional relationships and build long-term partnerships based on trust and professionalism.
            </p>

            <!-- Steps Card -->
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(200,169,110,0.18);border-radius:16px;padding:28px;margin-bottom:28px;">
              <h3 style="color:#c8a96e;font-size:14px;font-weight:800;margin:0 0 20px;padding-bottom:14px;border-bottom:1px solid rgba(200,169,110,0.12);">
                📋 Next Steps to Complete the Process
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;vertical-align:top;width:32px;">
                    <div style="width:26px;height:26px;background:rgba(184,146,58,0.15);border:1px solid rgba(184,146,58,0.3);border-radius:50%;text-align:center;line-height:26px;font-size:12px;font-weight:800;color:#c8a96e;">1</div>
                  </td>
                  <td style="padding:10px 14px 10px 0;vertical-align:top;">
                    <p style="color:#fff;font-size:13px;font-weight:700;margin:0 0 4px;">Contact our team</p>
                    <p style="color:rgba(255,255,255,0.45);font-size:12px;margin:0;line-height:1.7;">Please reach out to our procurement and supply team to coordinate and schedule the formal contracting process.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;width:32px;">
                    <div style="width:26px;height:26px;background:rgba(184,146,58,0.15);border:1px solid rgba(184,146,58,0.3);border-radius:50%;text-align:center;line-height:26px;font-size:12px;font-weight:800;color:#c8a96e;">2</div>
                  </td>
                  <td style="padding:10px 14px 10px 0;vertical-align:top;">
                    <p style="color:#fff;font-size:13px;font-weight:700;margin:0 0 4px;">Prepare official documents</p>
                    <p style="color:rgba(255,255,255,0.45);font-size:12px;margin:0;line-height:1.7;">Please bring your commercial registration, professional license, and any documents related to your activity in <strong style="color:rgba(255,255,255,0.7);">${activity || 'supply'}</strong>.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;width:32px;">
                    <div style="width:26px;height:26px;background:rgba(184,146,58,0.15);border:1px solid rgba(184,146,58,0.3);border-radius:50%;text-align:center;line-height:26px;font-size:12px;font-weight:800;color:#c8a96e;">3</div>
                  </td>
                  <td style="padding:10px 14px 10px 0;vertical-align:top;">
                    <p style="color:#fff;font-size:13px;font-weight:700;margin:0 0 4px;">Visit our office</p>
                    <p style="color:rgba(255,255,255,0.45);font-size:12px;margin:0;line-height:1.7;">Please visit our company office at the agreed time to complete all contracting procedures and sign the agreement.</p>
                  </td>
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
              We look forward to a successful and fruitful partnership with you. If you have any questions, feel free to reply to this email.
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
      subject: isAr ? `تهانينا — تمت الموافقة على طلبكم | MNC Construction` : `Congratulations — Your Application Has Been Approved | MNC Construction`,
      html,
      attachments: [{
        filename: 'logo.png',
        path:     logoPath,
        cid:      'mnc-logo',
      }],
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('[send-supplier-email]', err?.code, err?.message);
    return Response.json({ success: false, error: err.message, code: err.code }, { status: 500 });
  }
}
