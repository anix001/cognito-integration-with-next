// File: src/app/api/cognito/users/route.ts

import { NextResponse } from 'next/server';
import AWS from 'aws-sdk';

// Setup AWS Cognito Identity Provider client
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION, // e.g., 'us-east-1'
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  sessionToken:process.env.AWS_SESSION_TOKEN!
});

export async function GET() {
  const params = {
    UserPoolId: process.env.AWS_USER_POOL_ID!,
    // Omit AttributesToGet to retrieve all attributes
  };

  try {
    const data = await cognito.listUsers(params).promise();

    const users = data.Users?.map(user => {
      const attributes: Record<string, string> = {};
      user.Attributes?.forEach(attr => {
        attributes[attr.Name] = attr.Value!;
      });

      return {
        username: user.Username,
        status: user.UserStatus,
        enabled: user.Enabled,
        createdAt: user.UserCreateDate,
        updatedAt: user.UserLastModifiedDate,
        ...attributes
      };
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
