import { NextResponse } from 'next/server';
import { getMaintenanceModeFromWC } from '@/lib/maintenance';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const isMaintenance = await getMaintenanceModeFromWC();
    return NextResponse.json(
      { enabled: Boolean(isMaintenance) },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ enabled: false });
  }
}
