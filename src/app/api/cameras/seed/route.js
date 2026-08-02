/**
 * POST /api/cameras/seed
 *
 * Seeds 3 demo cameras (MNC-CAM-001, 002, 003) with placeholder
 * stream URLs.  Call this once from the Admin → Cameras page.
 *
 * TO REPLACE WITH REAL DATA LATER:
 *   Edit only the fields below (externalIp, domain, username, password, streamUrl).
 *   No other files need to change.
 */

import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getAllCameras, createCamera } from '@/lib/camerasFirestore';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mnc-construction.com';

const DEMO_CAMERAS = [
  {
    serialNumber: 'MNC-CAM-001',
    projectName: 'مشروع فندقي — مكة المكرمة',
    projectLocation: 'مكة المكرمة، المملكة العربية السعودية',
    cameraName: 'كاميرا المدخل الرئيسي',
    cameraType: 'MJPEG',
    externalIp: '192.168.1.100',       // ← Replace with real IP
    domain: 'cam1.mnc-project.com',    // ← Replace with real domain
    username: 'admin',                  // ← Replace with real username
    password: 'change_me_123',          // ← Replace with real password
    streamUrl: 'http://DVR_IP_001/stream1', // ← Replace with real stream URL
    status: 'offline',
  },
  {
    serialNumber: 'MNC-CAM-002',
    projectName: 'مشروع فندقي — مكة المكرمة',
    projectLocation: 'مكة المكرمة، المملكة العربية السعودية',
    cameraName: 'كاميرا موقف السيارات',
    cameraType: 'HLS',
    externalIp: '192.168.1.101',
    domain: 'cam2.mnc-project.com',
    username: 'admin',
    password: 'change_me_123',
    streamUrl: 'http://DVR_IP_001/hls/stream2.m3u8', // HLS stream
    status: 'offline',
  },
  {
    serialNumber: 'MNC-CAM-003',
    projectName: 'فيلا سكنية — مكة المكرمة',
    projectLocation: 'مكة المكرمة، المملكة العربية السعودية',
    cameraName: 'كاميرا الحديقة الخلفية',
    cameraType: 'MJPEG',
    externalIp: '192.168.1.200',
    domain: 'cam3.mnc-project.com',
    username: 'admin',
    password: 'change_me_123',
    streamUrl: 'http://DVR_IP_002/stream1',
    status: 'offline',
  },
];

export async function POST() {
  try {
    const existing = await getAllCameras();
    const existingSerials = new Set(existing.map(c => c.serialNumber.toUpperCase()));

    const created = [];
    for (const cam of DEMO_CAMERAS) {
      if (existingSerials.has(cam.serialNumber.toUpperCase())) {
        created.push({ serialNumber: cam.serialNumber, skipped: true });
        continue;
      }

      // Generate QR code pointing to the camera viewer page
      const qrUrl = `${BASE_URL}/live-camera/${cam.serialNumber}`;
      const qrCode = await QRCode.toDataURL(qrUrl, {
        color: { dark: '#C9A34D', light: '#00000000' },
        margin: 1,
        width: 240,
        errorCorrectionLevel: 'M',
      });

      const id = await createCamera({ ...cam, qrCode });
      created.push({ id, serialNumber: cam.serialNumber, skipped: false });
    }

    return NextResponse.json({ created });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
