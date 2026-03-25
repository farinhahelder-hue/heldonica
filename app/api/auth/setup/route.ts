import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists. Please login.' },
        { status: 400 }
      );
    }

    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const admin = new Admin({
      email,
      password,
      name,
      role: 'admin',
    });

    await admin.save();

    return NextResponse.json(
      { message: 'Admin created successfully', admin: { id: admin._id, email: admin.email, name: admin.name } },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
