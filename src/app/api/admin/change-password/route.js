import { adminAuth } from '@/lib/firebaseAdmin';

const SUPER_ADMIN_EMAILS = ['mm5329844@gmail.com'];

export async function POST(req) {
  try {
    const { idToken, uid, newPassword } = await req.json();

    if (!idToken || !uid || !newPassword) {
      return Response.json({ success: false, error: 'idToken, uid and newPassword are required' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return Response.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    if (!SUPER_ADMIN_EMAILS.includes(decoded.email)) {
      return Response.json({ success: false, error: 'Forbidden — super admin only' }, { status: 403 });
    }

    await adminAuth.updateUser(uid, { password: newPassword });

    return Response.json({ success: true });
  } catch (err) {
    console.error('[change-password]', err?.code, err?.message);
    return Response.json({ success: false, error: err.message || 'Failed to change password' }, { status: 500 });
  }
}
