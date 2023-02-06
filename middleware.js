import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import isBefore from 'date-fns/isBefore';
import subMinutes from 'date-fns/subMinutes';

function itHasBeenLessThanAMinuteSince(date) {
  return isBefore(subMinutes(Date.now(), 1), date);
}

// This function can be marked `async` if using `await` inside
export default withMiddlewareAuthRequired(async function middleware(request) {
  debugger;
  const res = NextResponse.next();
  const data = await getSession(request, res);
  const mfaTime = data.user?.['http://localhost:3000:mfaTime'];
  const hasMfa = data.user?.amr.includes('mfa');
  const isIssuedLessThanAMinute = itHasBeenLessThanAMinuteSince(new Date(mfaTime));
  if (hasMfa && mfaTime && isIssuedLessThanAMinute) {
    console.log(`MFA time is good ${mfaTime}`);
    return res;
  }
  console.log(`MFA rejected, ${mfaTime}`);
  return new NextResponse(
    JSON.stringify({ code: 'mfaRequired', message: 'You need apply mfa for this particular action' }),
    { status: 401, headers: { 'content-type': 'application/json' } }
  );
});

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/apsdfmsdlkfjsdlkfsi/disable-multifactor'
};
