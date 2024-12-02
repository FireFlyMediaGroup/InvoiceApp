import { NextResponse } from 'next/server';
import prisma from '../../utils/db';

export async function GET() {
  console.log('Attempting to connect to the database...');
  console.log('Database URL:', process.env.DATABASE_URL);
  try {
    // Attempt to query the database
    const userCount = await prisma.user.count();
    console.log(`Connected successfully. User count: ${userCount}`);
    return NextResponse.json({ success: true, message: `Connected successfully. User count: ${userCount}` });
  } catch (error) {
    console.error('Database connection error:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to connect to the database', 
      details: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown Error'
    }, { status: 500 });
  }
}
