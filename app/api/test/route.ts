import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('Test API route called');
  console.log('Request headers:', request.headers);
  return NextResponse.json({ message: 'Test API route working' });
}
