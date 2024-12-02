import { NextResponse } from 'next/server';
import { signIn } from '../../utils/auth';

// Custom logger function
const log = (message: string, data?: unknown) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(message, data !== undefined ? data : '');
  }
};

export async function POST(request: Request) {
  log('Entering test-login POST route');
  
  const body = await request.json();
  const email = body.email;

  if (!email) {
    log('Email not provided in request body');
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  log('Attempting to sign in user with email:', email);

  try {
    const result = await signIn('nodemailer', { email, redirect: false });
    
    log('SignIn result:', result);

    if (result?.error) {
      log('SignIn error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    log('Login link sent successfully');
    return NextResponse.json({ success: true, message: 'Login link sent successfully' });
  } catch (error) {
    log('Error during sign in:', error);
    if (error instanceof Error) {
      log('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json({ 
      error: 'An unexpected error occurred', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
