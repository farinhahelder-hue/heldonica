import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const cmsPath = path.join(process.cwd(), 'public', 'cms-pro.html');
    const cmsContent = fs.readFileSync(cmsPath, 'utf-8');
    
    return new NextResponse(cmsContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse('CMS not found', { status: 404 });
  }
}
