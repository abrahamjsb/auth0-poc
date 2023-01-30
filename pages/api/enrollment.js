import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

export default withApiAuthRequired(async function enrollment(req, res) {
  try {
    const { accessToken } = await getAccessToken(req, res, {
      scopes: ['profile']
    });
    const apiPort = process.env.API_PORT || 3001;
    const response = await fetch(`http://localhost:${apiPort}/api/factors/enrollment`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ user_id: req.body.user_id, send_mail: req.body.send_mail })
    });
    const ticket = await response.json();

    res.status(200).json(ticket);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});
