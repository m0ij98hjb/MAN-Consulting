import { NextResponse } from 'next/server';
import { getAllCameras, createCamera, publicView } from '@/lib/camerasFirestore';

export async function GET() {
  try {
    const cameras = await getAllCameras();
    return NextResponse.json({ cameras: cameras.map(publicView) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      serialNumber, projectName, projectLocation, cameraName,
      cameraType, externalIp, domain, username, password,
      streamUrl, status, qrCode,
    } = body;

    if (!serialNumber || !projectName || !cameraName) {
      return NextResponse.json(
        { error: 'serialNumber, projectName, and cameraName are required' },
        { status: 400 }
      );
    }

    const id = await createCamera({
      serialNumber: serialNumber.toUpperCase(),
      projectName, projectLocation: projectLocation || '',
      cameraName, cameraType: cameraType || 'MJPEG',
      externalIp: externalIp || '',
      domain: domain || '',
      username: username || '',
      password: password || '',
      streamUrl: streamUrl || '',
      status: status || 'offline',
      qrCode: qrCode || '',
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
