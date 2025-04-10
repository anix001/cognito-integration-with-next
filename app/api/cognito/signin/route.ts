// src/app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Amplify } from 'aws-amplify';
// import { signIn  } from 'aws-amplify/auth';
import { amplifyConfig } from '@/app/lib/amplify.config';
import AWS from "aws-sdk";
import jwt from 'jsonwebtoken'; 

// Setup AWS Cognito Identity Provider client
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION, // e.g., 'us-east-1'
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  // sessionToken: process.env.AWS_SESSION_TOKEN!,
});

// Configure Amplify on the server side
Amplify.configure(amplifyConfig, { ssr: true });

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Sign in with Amplify Auth using email as username
//     const signInResponse = await signIn({ 
//       username: email, // Use email as the username
//       password 
//     });

    
//     return NextResponse.json({
//       success: true,
//       isSignedIn: signInResponse.isSignedIn,
//       nextStep: signInResponse.nextStep,
//     });

      // Initiate authentication (Login) with Cognito
      const authResult = await cognito
      .initiateAuth({
      AuthFlow: "USER_PASSWORD_AUTH", // Use USER_PASSWORD_AUTH flow
      ClientId: process.env.AWS_APP_CLIENT_ID!, // Your App Client ID
      AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
      },
      })
      .promise();

      let userId;
      if(authResult?.AuthenticationResult?.IdToken){
            const decodedIdToken = jwt.decode(authResult.AuthenticationResult.IdToken!);
             userId = decodedIdToken?.sub; // The user ID is usually available under the 'sub' key
      }
       // Decode the idToken to get the userId (sub)

      // If login is successful, return the authentication result (tokens)
      return NextResponse.json({
      success: true,
      message: "User logged in successfully",
      // accessToken: authResult.AuthenticationResult?.AccessToken,
      // idToken: authResult.AuthenticationResult?.IdToken,
      // refreshToken: authResult.AuthenticationResult?.RefreshToken,
      userId:userId
      });
    
  } catch (error: unknown) {
    console.error('Sign-in error:', error);
    
   
    return NextResponse.json(
      { error: error || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}