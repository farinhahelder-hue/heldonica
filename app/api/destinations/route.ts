import { connectDB } from '@/lib/mongodb';
import Destination from '@/models/Destination';
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

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const destinations = await Destination.find({}).sort({ createdAt: -1 });
    return NextResponse.json(destinations);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
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

    await connectDB();
    const body = await request.json();

    const destination = new Destination(body);
    await destination.save();

    return NextResponse.json(destination, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
