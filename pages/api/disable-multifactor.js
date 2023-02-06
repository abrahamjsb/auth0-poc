import { getAccessToken, withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import requestManagementAPIAccessToken, { issuerBaseUrl } from '../../utils/requestManagementAPIAccessToken';
import isBefore from 'date-fns/isBefore';
import subMinutes from 'date-fns/subMinutes';

function itHasBeenLessThanAMinuteSince(date) {
  return isBefore(subMinutes(Date.now(), 1), date);
}

export default withApiAuthRequired(async function disableMultifactor(req, res) {
  try {
    const { accessToken } = await getAccessToken(req, res, {
      scopes: ['profile']
    });
    const session = await getSession(req, res);

    const mfaTime = session.user?.['http://localhost:3000:mfaTime'];
    const hasMfa = session.user?.amr.includes('mfa');
    const isIssuedLessThanAMinute = itHasBeenLessThanAMinuteSince(new Date(mfaTime));
    if (!hasMfa || !mfaTime || !isIssuedLessThanAMinute) {
      console.log(`MFA rejected, ${mfaTime}`);
      return res.status(403).json({ code: 'mfaRequired', message: 'You need apply mfa for this particular action' });
    }

    // actual call to delete authenticators from a user
    const managementAPIAccessToken = await requestManagementAPIAccessToken();
    await fetch(`${issuerBaseUrl}/api/v2/users/${session?.user?.sub}/authenticators`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${managementAPIAccessToken}` }
    });

    res.status(200).json({ code: 'success', message: 'mfa deleted' });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});
