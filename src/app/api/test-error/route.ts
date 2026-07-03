import { NextResponse } from 'next/server';

export async function GET() {
  throw new Error("This is a test error to verify Sentry is working in production!");
  return NextResponse.json({ success: true });
}
