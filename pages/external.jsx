import React, { useEffect, useState, useCallback } from 'react';
import { Button, Alert } from 'reactstrap';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0/client';

import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useRouter,  } from 'next/router';

function External() {
  const { user, isLoading: isLoadingUser } = useUser();
  const [mfaList, setMfaList] = useState({ isLoading: false, response: undefined, error: undefined });
  const router = useRouter();
  const unenroll = Boolean(router.query.unenroll);
  

  const fetchMfa = useCallback(async () => {
    setMfaList(previous => ({ ...previous, isLoading: true }));

    try {
      const response = await fetch(`/api/factors?id=${user?.sub}`);
      const data = await response.json();

      setMfaList(previous => ({ ...previous, response: data, error: undefined }));
    } catch (error) {
      setMfaList(previous => ({ ...previous, response: undefined, error }));
    } finally {
      setMfaList(previous => ({ ...previous, isLoading: false }));
    }
  }, [user]);

  const handle = (event, fn) => {
    event.preventDefault();
    fn();
  };

  const requestEnrollmentTicket = useCallback(async () => {
    try {
      const response = await fetch(`/api/enrollment?id=${user?.sub}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.user_metadata.requestedMFA) {
        router.push(`/api/auth/login`);
      }
    } catch (error) {
      console.log(error);
    }
  }, [user]);

  const deleteMFAEnrollment = useCallback(async () => {
    try {
     
      const request = await fetch(`/api/disable-multifactor`);
      const response = await request.json();
      const returnTo = new URL('http://localhost:3000/external?unenroll=true');
      if (response.code === 'mfaRequired') {
        router.push(`/api/auth/login?returnTo=${returnTo.toString()}`);
      } else {
        router.push(`/api/auth/logout`);
      }
    } catch (error) {
      console.log(error);
    }
  }, [user]);

  const deleteMFAWithConfirmation = useCallback(() => {
    const deleteMFAConfirmation = confirm(
      'Are you sure you want delete MFA for your account? If you accept you will be logout from your account once deactivated'
    );
    if(!deleteMFAConfirmation) deleteMFAEnrollment();

  }, [deleteMFAEnrollment])

  useEffect(() => {
    fetchMfa();
  }, []);

  useEffect(() => {
    console.log("UNENROLL IN EFFECT IS HAPPENING", unenroll)
    if(unenroll) {
      deleteMFAEnrollment();
    }
  }, [unenroll])

  return (
    <>
      <div className="mb-5" data-testid="external">
        <h1 data-testid="external-title">External API</h1>
        <div data-testid="external-text">
          <p className="lead">Ping an external API by clicking the button below</p>
          <p>
            This will call a local API on port 3001 that would have been started if you run <code>npm run dev</code>.
          </p>
          <p>
            An access token is sent as part of the request's <code>Authorization</code> header and the API will validate
            it using the API's audience value. The audience is the identifier of the API that you want to call (see{' '}
            <a href="https://auth0.com/docs/get-started/dashboard/tenant-settings#api-authorization-settings">
              API Authorization Settings
            </a>{' '}
            for more info).
          </p>
          <h2>MFA list</h2>
          <Button
            onClick={
              user.amr?.length > 0 ? e => handle(e, deleteMFAWithConfirmation) : e => handle(e, requestEnrollmentTicket)
            }
            color="primary"
            className="mt-5">
            {user.amr?.length > 0 ? 'Unenroll' : 'Enroll'} in MFA
          </Button>
          <br />
          {mfaList.response &&
            mfaList.response.length > 0 &&
            mfaList.response.map(factor => (
              <div key={factor.name}>
                <Alert color="primary" style={{ marginTop: 10 }}>
                  User enrolled with {factor.type}!
                </Alert>
              </div>
            ))}
          {!isLoadingUser && !mfaList.isLoading && !mfaList.response && <div>User not enrolled in MFA</div>}

          {isLoadingUser || (mfaList.isLoading && <div>Loading factors...</div>)}
        </div>
      </div>
    </>
  );
}

export default withPageAuthRequired(External, {
  onRedirecting: () => <Loading />,
  onError: error => <ErrorMessage>{error.message}</ErrorMessage>
});
