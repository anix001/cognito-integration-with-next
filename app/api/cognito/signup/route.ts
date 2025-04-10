import { NextRequest, NextResponse } from "next/server";
// import { Amplify } from "aws-amplify";
// import { signUp } from "aws-amplify/auth";
// import { amplifyConfig } from "@/app/lib/amplify.config";
import AWS from "aws-sdk";

// // Configure Amplify on the server side
// Amplify.configure(amplifyConfig, { ssr: true });

// Setup AWS Cognito Identity Provider client
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION, // e.g., 'us-east-1'
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  sessionToken: process.env.AWS_SESSION_TOKEN!,
});


export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    // Input validation
    if (!email || !password) {
        
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Sign in with Amplify Auth
    // const signUpResponse = await signUp({
    //   username: email,
    //   password,
    //   options: {
    //     userAttributes: {
    //       email, // Set email as an attribute as well
    //       "custom:role": role,
    //     },
    //   },
    // });

    // return NextResponse.json({
    //   success: true,
    //   isSignUpComplete: signUpResponse.isSignUpComplete,
    //   userId: signUpResponse.userId,
    //   nextStep: signUpResponse.nextStep,
    // });

      // Create the user
    await cognito
    .adminCreateUser({
      UserPoolId: process.env.AWS_USER_POOL_ID!,
      Username: email,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "custom:role", Value: role },
        { Name: "email_verified", Value: "true" },
      ],
      TemporaryPassword: password
    })
    .promise();

  // // setting password as permanent
  // await cognito
  //   .adminSetUserPassword({
  //     UserPoolId: process.env.AWS_USER_POOL_ID!,
  //     Username: email,
  //     Password: password, // Set the permanent password
  //     Permanent: true, // Mark the password as permanent, no need for reset
  //   })
  //   .promise();

  // Check the user's current status
  const userStatusResponse = await cognito
    .adminGetUser({
      UserPoolId: process.env.AWS_USER_POOL_ID!,
      Username: email,
    })
    .promise();

  const currentStatus = userStatusResponse.UserStatus;

  // If the user is already confirmed, skip the confirmation step
  if (currentStatus === "CONFIRMED") {
    console.log("User is already confirmed, skipping confirmation.");
  } else if (currentStatus === "FORCE_CHANGE_PASSWORD") {
    console.log("User is in FORCE_CHANGE_PASSWORD state, skipping confirmation.");
  } else {
    // Try to confirm user only if it's in a confirmable state
    await cognito
      .adminConfirmSignUp({
        UserPoolId: process.env.AWS_USER_POOL_ID!,
        Username: email,
      })
      .promise();
  }
  

  // console.log("🚀 ~ POST ~ userCreationResponse:", userCreationResponse);

  // Return success message
  return NextResponse.json({
    success: true,
    message: "User successfully created and confirmed",
    email,
  });

  } catch (error: unknown) {
    console.error("Sign-up error:", error);

    return NextResponse.json(
      { error: error || "An unknown error occurred" },
      { status: 500 }
    );
  }
}





    // const params = {
    //   UserPoolId: process.env.AWS_USER_POOL_ID!,
    //   Username: email,
    //   // Omit AttributesToGet to retrieve all attributes
    // };
    // Immediately confirm sign-up (bypassing the need for a confirmation code)
    // await cognito.adminConfirmSignUp(params).promise();

    // //Set email as verified immediately after confirmation
    // const verifyEmailParams = {
    //   UserPoolId: process.env.AWS_USER_POOL_ID!,
    //   Username: email,
    //   UserAttributes: [
    //     {
    //       Name: "email_verified",
    //       Value: "true",
    //     },
    //   ],
    // };
    // await cognito.adminUpdateUserAttributes(verifyEmailParams).promise();

    // Send invitation email
    // await sendInvitationEmail(email, password);



  //   await cognito
  //   .adminCreateUser({
  //     UserPoolId: process.env.AWS_USER_POOL_ID!,
  //     Username: email,
  //     UserAttributes: [
  //       { Name: "email", Value: email },
  //       { Name: "custom:username", Value: username },
  //       { Name: "custom:role", Value: role },
  //       { Name: "email_verified", Value: "true" },
  //     ],
  //     MessageAction: "SUPPRESS",
  //     // TemporaryPassword: password,
  //   })
  //   .promise();

  // // Confirm the user
  // await cognito
  //   .adminConfirmSignUp({
  //     UserPoolId: process.env.AWS_USER_POOL_ID!,
  //     Username: email,
  //   })
  //   .promise();

  // // Fetch user to get `sub` (Cognito user ID)
  // const userDetails = await cognito
  //   .adminGetUser({
  //     UserPoolId: process.env.AWS_USER_POOL_ID!,
  //     Username: email,
  //   })
  //   .promise();

  //   const subAttr = userDetails.UserAttributes?.find(attr => attr.Name === "sub");
  //   const userId = subAttr?.Value;

  //   return NextResponse.json({
  //     success: true,
  //     message: "User successfully created and confirmed",
  //     userId, // Cognito UUID
  //     email,
  //   });