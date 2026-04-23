import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    hasPassword: !!process.env.CMS_PASSWORD,
    passwordLength: process.env.CMS_PASSWORD?.length || 0,
    passwordFirstChars: process.env.CMS_PASSWORD?.substring(0, 5) || '',
    hasSecret: !!process.env.CMS_SESSION_SECRET,
    secretLength: process.env.CMS_SESSION_SECRET?.length || 0,
  });
}