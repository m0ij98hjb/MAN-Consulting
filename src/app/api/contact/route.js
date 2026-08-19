import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req) {
  try {
    const body = await req.json();
    const { fullName, email, phone, company, subject, message, lang, website } = body || {};

    // Honeypot: bots fill hidden fields like "website". A real visitor never
    // sees or fills it, so any non-empty value here means the submission is
    // spam. We fake success below so the bot doesn't learn it was rejected.
    if (typeof website === 'string' && website.trim() !== '') {
      return Response.json({ success: true });
    }

    if (!fullName?.trim() || !phone?.trim() || !message?.trim()) {
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await adminDb.collection('contacts').add({
      fullName: fullName.trim(),
      email: (email || '').trim(),
      phone: phone.trim(),
      company: (company || '').trim(),
      subject: subject || '',
      message: message.trim(),
      lang: lang || 'ar',
      status: 'new',
      adminReply: '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: null,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('[api/contact]', err?.message);
    return Response.json({ success: false, error: 'Failed to submit. Please try again.' }, { status: 500 });
  }
}
