import React, { useEffect, useState, useCallback } from 'react';
import { Button } from 'reactstrap';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0/client';

import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function External() {
  const { user, isLoading: isLoadingUser } = useUser();
  const [mfaList, setMfaList] = useState({ isLoading: false, response: undefined, error: undefined });
  const [existTicket, setExistTicket] = useState(undefined);



  const fetchMfa = useCallback(async () => {
    setMfaList(previous => ({ ...previous, isLoading: true }));

    try {
      const response = await fetch(`/api/factors`);
      const data = await response.json();

      setMfaList(previous => ({ ...previous, response: data, error: undefined }));
    } catch (error) {
      setMfaList(previous => ({ ...previous, response: undefined, error }));
    } finally {
      setMfaList(previous => ({ ...previous, isLoading: false }));
    }
  }, []);

  const handle = (event, fn) => {
    event.preventDefault();
    fn();
  };

  const requestEnrollmentTicket = useCallback(async () => {
    try {
      const response = await fetch('/api/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.sub, user_email: user.email, send_email: false })
      });
      const data = await response.json();

      setExistTicket(data.ticket_url);
    } catch (error) {
      console.log(error);
    }
  }, [user]);

   const deleteMFAEnrollment = useCallback(async (factorId) => {
    try {
      await fetch(`/api/delete/factor/${factorId}?userId=${user?.sub}`);
      fetchMfa();
    } catch(error) {
      console.log(error)
    }
   }, [user])

  useEffect(() => {
    fetchMfa();
  }, []);

  useEffect(() => {
    if (existTicket) {
      window.open(existTicket, 'target');
      setExistTicket(undefined);
    }
  }, [existTicket]);


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
          {mfaList.error && <ErrorMessage>{mfaList.error.message}</ErrorMessage>}
          {!isLoadingUser && mfaList.response ? (
            mfaList.response.map(factor => (
              <div key={factor.name}>
                <Button
                  onClick={e => handle(e, requestEnrollmentTicket)}
                  color="primary"
                  className="mt-5"
                  disabled={!factor.enabled}>
                  {factor.name}
                </Button>
               {factor.enabled && <Button style={{marginLeft: 10}} onClick={e => handle(e, () => deleteMFAEnrollment(factor.name))}
                  color="danger"
                  className="mt-5">
                  Unenroll
                </Button>}
              </div>
            ))
          ) : (
            <div>Loading factors...</div>
          )}
        </div>

   
      </div>
    </>
  );
}

export default withPageAuthRequired(External, {
  onRedirecting: () => <Loading />,
  onError: error => <ErrorMessage>{error.message}</ErrorMessage>
});
