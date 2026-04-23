import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    cms: { 
      hasPassword: !!process.env.CMS_PASSWORD,
      passwordLength: (process.env.CMS_PASSWORD || '').length,
    },
    google: {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      clientId: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...' : 'NOT SET',
    },
    idrive: {
      hasClientId: !!process.env.IDRIVE_CLIENT_ID,
      hasClientSecret: !!process.env.IDRIVE_CLIENT_SECRET,
    },
  });
}