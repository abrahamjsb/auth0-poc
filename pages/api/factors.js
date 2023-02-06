import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';
import requestManagementAPIAccessToken, { issuerBaseUrl } from '../../utils/requestManagementAPIAccessToken';

export default withApiAuthRequired(async function factors(req, res) {
  try {
    const { id } = req.query;
    const { accessToken } = await getAccessToken(req, res, {
      scopes: ['profile']
    });
    const managementAccessToken = await requestManagementAPIAccessToken();
    const requestFactors = await fetch(`${issuerBaseUrl}/api/v2/users/${id}/enrollments`, {
      headers: { Authorization: `Bearer ${managementAccessToken}`, 'content-type': 'application/json' }
    });

    const responseFactors = await requestFactors.json();
    res.status(200).send(responseFactors);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});
