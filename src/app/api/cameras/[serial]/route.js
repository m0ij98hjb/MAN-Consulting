import { NextResponse } from 'next/server';
import {
  getCameraBySerial, updateCamera, deleteCamera, publicView,
} from '@/lib/camerasFirestore';

export async function GET(_, { params }) {
  try {
    const { serial } = await params;
    const camera = await getCameraBySerial(serial);
    if (!camera) {
      return NextResponse.json({ error: 'Camera not found' }, { status: 404 });
    }
    return NextResponse.json({ camera: publicView(camera) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { serial } = await params;
    const camera = await getCameraBySerial(serial);
    if (!camera) {
      return NextResponse.json({ error: 'Camera not found' }, { status: 404 });
    }
    const body = await request.json();
    // Sanitise — only update allowed fields
    const allowed = [
      'serialNumber', 'projectName', 'projectLocation', 'cameraName',
      'cameraType', 'externalIp', 'domain', 'username', 'password',
      'streamUrl', 'status', 'qrCode',
    ];
    const update = {};
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    await updateCamera(camera.id, update);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const { serial } = await params;
    const camera = await getCameraBySerial(serial);
    if (!camera) {
      return NextResponse.json({ error: 'Camera not found' }, { status: 404 });
    }
    await deleteCamera(camera.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
