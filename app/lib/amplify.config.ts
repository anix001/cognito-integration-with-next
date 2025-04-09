interface AmplifyConfig {
      Auth: {
        Cognito: {
          region: string;
          userPoolId: string;
          userPoolClientId: string;
          mandatorySignIn: boolean;
        }
      }
    }

export const amplifyConfig:AmplifyConfig = {
  Auth: {
      Cognito:{
            region: process.env.AWS_REGION as string || 'us-north-1',
            userPoolId: process.env.AWS_USER_POOL_ID as string,
            userPoolClientId: process.env.AWS_APP_CLIENT_ID as string,
            mandatorySignIn: true,
      }
  },
};
