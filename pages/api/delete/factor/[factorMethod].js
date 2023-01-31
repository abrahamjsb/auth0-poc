import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

export default withApiAuthRequired(async function deleteFactor(req, res) {
  try {
    // we should use userId extracted from token and validate is the user itself, will update later
    const { factorMethod, userId } = req.query;
    // in this case token is already store in localstorage this application manage session with cookies
    const { accessToken } = await getAccessToken(req, res, {
      scopes: ['profile']
    });
    const apiPort = process.env.API_PORT || 3001;
    const response = await fetch(`http://localhost:${apiPort}/api/factors/${factorMethod}/delete/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      method: 'DELETE'
    });
    const data = await response;
    debugger;
    res.status(200).json({ msg: 'Authenticator successfully deleted' });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});
