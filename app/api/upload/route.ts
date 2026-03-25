import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

function verifyToken(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // For now, return a placeholder URL
    // In production, you'd upload to S3, Cloudinary, or similar
    const fileName = `${Date.now()}-${file.name}`;
    const url = `/uploads/${fileName}`;

    return NextResponse.json({ url, fileName });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
