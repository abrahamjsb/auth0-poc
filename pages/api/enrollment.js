import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';
import requestManagementAPIAccessToken, { issuerBaseUrl } from '../../utils/requestManagementAPIAccessToken';

export default withApiAuthRequired(async function enrollment(req, res) {
  try {
    const ato = await getAccessToken(req, res, {
      scopes: ['profile']
    });
    const { id } = req.query;
    const managementAPIAccessToken = await requestManagementAPIAccessToken();
    //const apiPort = process.env.API_PORT || 3001;
    /*  const response = await fetch(`http://localhost:${apiPort}/api/factors/enrollment`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ user_id: req.body.user_id, send_mail: req.body.send_mail })
    }); */
    const requestUpdateMetaData = await fetch(`${issuerBaseUrl}/api/v2/users/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${managementAPIAccessToken}`, 'content-type': 'application/json' },
      body: JSON.stringify({ user_metadata: { requestedMFA: true } })
    });

    const response = await requestUpdateMetaData.json();
    res.status(200).json(response);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});
