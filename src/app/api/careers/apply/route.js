import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      fullName, phone, email, city, nationality, country,
      jobType, department, position, experience, coverLetter, cvUrl,
      website,
    } = body || {};

    // Honeypot: bots fill hidden fields like "website". A real visitor never
    // sees or fills it, so any non-empty value here means the submission is
    // spam. We fake success below so the bot doesn't learn it was rejected.
    if (typeof website === 'string' && website.trim() !== '') {
      return Response.json({ success: true });
    }

    if (!fullName?.trim() || !phone?.trim() || !email?.trim() || !city?.trim()) {
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await adminDb.collection('jobApplications').add({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      nationality: (nationality || '').trim(),
      country: (country || '').trim(),
      jobType: jobType || '',
      department: department || '',
      position: position || '',
      experience: experience || '',
      coverLetter: coverLetter || '',
      cvUrl: cvUrl || '',
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      reviewedAt: null,
      interviewDetails: null,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('[api/careers/apply]', err?.message);
    return Response.json({ success: false, error: 'Failed to submit. Please try again.' }, { status: 500 });
  }
}
