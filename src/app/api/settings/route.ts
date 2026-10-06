import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'src/data/settings.json');

export async function GET() {
  try {
    const data = fs.readFileSync(settingsPath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (err) {
    return NextResponse.json({ reservationsEnabled: true, disabledMessage: 'Bookings are paused.' }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    fs.writeFileSync(settingsPath, JSON.stringify(body, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to write settings:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
