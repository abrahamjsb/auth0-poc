import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

export default withApiAuthRequired(async function factors(req, res) {
  try {
    const { accessToken } = await getAccessToken(req, res, {
      scopes: ['profile']
    });
    const apiPort = process.env.API_PORT || 3001;
    const response = await fetch(`http://localhost:${apiPort}/api/factors`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const factors = await response.json();

    res.status(200).json(factors);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});
