/**
 * GET /api/cameras/[serial]/stream
 *
 * Returns the private streamUrl for a given serial number.
 * This is the ONLY place credentials leave the server.
 *
 * Security model:
 *   • Anyone who knows the serial number can get the stream URL.
 *   • Serial numbers are distributed only to authorised personnel
 *     (via QR code printouts or admin-generated links).
 *   • For stricter protection, add Firebase ID-token verification here.
 *
 * TO UPGRADE SECURITY LATER:
 *   Uncomment the token-check block below and verify the Authorization header
 *   contains a valid Firebase ID token from a known admin or viewer account.
 */

import { NextResponse } from 'next/server';
import { getCameraBySerial } from '@/lib/camerasFirestore';

export async function GET(_, { params }) {
  try {
    const { serial } = await params;
    const camera = await getCameraBySerial(serial);
    if (!camera) {
      return NextResponse.json({ error: 'Camera not found' }, { status: 404 });
    }

    return NextResponse.json({
      serialNumber: camera.serialNumber,
      streamUrl:    camera.streamUrl  || '',
      cameraType:   camera.cameraType || 'MJPEG',
      status:       camera.status     || 'offline',
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
