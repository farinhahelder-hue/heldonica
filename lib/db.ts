import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

// Note: MONGODB_URI is required at runtime but not at build time
// The error is deferred to connectDB() to allow static builds

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then(mongoose => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

(global as any).mongoose = cached;
