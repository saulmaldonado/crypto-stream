export const Auth0Endpoints = {
  signup: `https://${process.env.AUTH0_DOMAIN}/dbconnections/signup`,
  login: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
  managementToken: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
  emailVerification: `https://${process.env.AUTH0_DOMAIN}/api/v2/jobs/verification-email`,
};
