// src/app/api/auth/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Amplify } from 'aws-amplify';
import { confirmSignUp } from 'aws-amplify/auth';
import { amplifyConfig } from '@/app/lib/amplify.config';

// Configure Amplify on the server side
Amplify.configure(amplifyConfig, { ssr: true });

export async function POST(request: NextRequest) {
  try {
    const { email, confirmationCode } = await request.json();
    
    // Input validation
    if (!email || !confirmationCode) {
      return NextResponse.json(
        { error: 'Email and confirmation code are required' },
        { status: 400 }
      );
    }
    
    // Confirm sign up with Amplify Auth
    const confirmResponse = await confirmSignUp({
      username: email, // Use email as the username
      confirmationCode:confirmationCode.toString()
    });
    
    return NextResponse.json({
      success: true,
      isSignUpComplete: confirmResponse.isSignUpComplete,
      nextStep: confirmResponse.nextStep
    });
    
  } catch (error: unknown) {
    console.error('Confirm sign-up error:', error);
    
    return NextResponse.json(
      { error: error || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}