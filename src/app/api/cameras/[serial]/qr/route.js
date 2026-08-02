/**
 * POST /api/cameras/[serial]/qr
 * (Re)generates a QR code for a camera and saves it to Firestore.
 */
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getCameraBySerial, updateCamera } from '@/lib/camerasFirestore';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mnc-construction.com';

export async function POST(_, { params }) {
  try {
    const { serial } = await params;
    const camera = await getCameraBySerial(serial);
    if (!camera) {
      return NextResponse.json({ error: 'Camera not found' }, { status: 404 });
    }

    const qrUrl = `${BASE_URL}/live-camera/${camera.serialNumber}`;
    const qrCode = await QRCode.toDataURL(qrUrl, {
      color: { dark: '#C9A34D', light: '#00000000' },
      margin: 1,
      width: 240,
      errorCorrectionLevel: 'M',
    });

    await updateCamera(camera.id, { qrCode });
    return NextResponse.json({ qrCode, qrUrl });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
