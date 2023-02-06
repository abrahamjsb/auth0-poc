export const baseUrl = process.env.AUTH0_BASE_URL;
export const issuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL;
export const audience = process.env.AUTH0_AUDIENCE;
export const auth0ClientId = process.env.AUTH0_CLIENT_ID;
export const auth0Secret = process.env.AUTH0_CLIENT_SECRET;
console.log('env: ', issuerBaseUrl);
export default async function requestManagementAPIAccessToken(audience, grantAccess) {
  const body = JSON.stringify({
    client_id: auth0ClientId,
    client_secret: auth0Secret,
    audience: audience || 'https://abrahamjsb.us.auth0.com/api/v2/',
    grant_type: grantAccess || 'client_credentials'
  });
  try {
    const request = await fetch(issuerBaseUrl + '/oauth/token', {
      body,
      method: 'POST',
      headers: { 'content-type': 'application/json' }
    });
    const response = await request.json();
    return response.access_token;
  } catch (e) {
    throw e;
  }
}
