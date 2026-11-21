import { NextResponse } from 'next/server';
import { getAdminSession } from '@/app/actions/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    return NextResponse.json({ authenticated: Boolean(session?.user) });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
