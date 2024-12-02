import { NextResponse } from 'next/server';
import prisma from '../../utils/db';

// Custom logger function
const log = (message: string, data?: unknown) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(message, data !== undefined ? data : '');
  }
};

export async function GET(request: Request) {
  log('Attempting to connect to the database...');
  
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  try {
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, isAllowed: true, role: true }
      });

      if (user) {
        log('User found:', user);
        return NextResponse.json({ success: true, user });
      }
      
      log('User not found for email:', email);
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const userCount = await prisma.user.count();
    log('Successfully connected to the database. User count:', userCount);
    return NextResponse.json({ success: true, userCount });
  } catch (error) {
    log('Error connecting to the database:', error);
    if (error instanceof Error) {
      log('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json({ success: false, error: 'Database connection error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
