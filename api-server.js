require('dotenv').config({ path: './.env.local' });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const fetch = require('node-fetch').default;
const bodyParser = require('body-parser');

const app = express();
const port = process.env.API_PORT || 3001;
const baseUrl = process.env.AUTH0_BASE_URL;
const issuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL;
const audience = process.env.AUTH0_AUDIENCE;
const auth0ClientId = process.env.AUTH0_CLIENT_ID;
const auth0Secret = process.env.AUTH0_CLIENT_SECRET;

if (!baseUrl || !issuerBaseUrl) {
  throw new Error('Please make sure that the file .env.local is in place and populated');
}

if (!audience) {
  console.log('AUTH0_AUDIENCE not set in .env.local. Shutting down API server.');
  process.exit(1);
}

app.use(morgan('dev'));
app.use(helmet());
app.use(cors({ origin: baseUrl }));
app.use(bodyParser.json());

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${issuerBaseUrl}/.well-known/jwks.json`
  }),
  audience: audience,
  issuer: `${issuerBaseUrl}/`,
  algorithms: ['RS256']
});

async function requestManagementAPIAccessToken() {
  const body = {
    client_id: auth0ClientId,
    client_secret: auth0Secret,
    audience: 'https://abrahamjsb.us.auth0.com/api/v2/',
    grant_type: 'client_credentials'
  };
  try {
    const request = await fetch(baseUrl + '/oauth/token', {
      body: JSON.stringify(body),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const response = await request.json();
    return response.access_token;
  } catch (e) {
    throw e;
  }
}

app.get('/api/shows', checkJwt, (req, res) => {
  res.send({
    msg: 'Your access token was successfully validated!'
  });
});

app.get('/api/factors', checkJwt, async (req, res) => {
  try {
    const accessToken = await requestManagementAPIAccessToken();
    const requestFactors = await fetch(`${issuerBaseUrl}/api/v2/guardian/factors`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const responseFactors = await requestFactors.json();
    res.status(200).send(responseFactors);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/api/factors/enrollment', checkJwt, async (req, res) => {
  try {
    const accessToken = await requestManagementAPIAccessToken();
    const requestFactorEnrollTicker = await fetch(`${issuerBaseUrl}/api/v2/guardian/enrollments/ticket`, {
      headers: { Authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ user_id: req.body.user_id, send_mail: req.body.send_mail })
    });
    const ticket = await requestFactorEnrollTicker.json();
    res.status(200).send(ticket);
  } catch (e) {
    res.status(500).send(error);
  }
});

app.delete('api/factors/:factorMethod/delete/:user', checkJwt, async (req, res) => {
  try {
    const { factorMethod, userId } = req.params;
    const accessToken = await requestManagementAPIAccessToken();
    const response = await fetch(`${issuerBaseUrl}/api/v2/users/${userId}/authentication-methods/${factorMethod}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    debugger;
    res.status(200).json({ msg: `${factorMethod} successfully deleted` });
  } catch (error) {
    res.status(error.status).send(error);
  }
});

app.post('api/factors/invalidate-browsers/:userId', checkJwt, async (req, res) => {
  try {
    const id = req.params.userId;
    const accessToken = await requestManagementAPIAccessToken();
    const response = await fetch(
      `${issuerBaseUrl}/api/v2/users/${id}/multifactor/actions/invalidate-remember-browser`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        method: 'POST'
      }
    );
    const data = response.json();
    res.status(200).send(data);
  } catch (error) {
    res.status(error.status).send(error);
  }
});

const server = app.listen(port, () => console.log(`API Server listening on port ${port}`));
process.on('SIGINT', () => server.close());
