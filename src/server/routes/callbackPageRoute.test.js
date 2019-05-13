/**
 * @jest-environment node
 */

import nock from 'nock';
import jwt from 'jsonwebtoken';
import qs from 'qs';
import callbackPageRoute from './callbackPageRoute';

describe('server/routes/callbackPageRoute', () => {
  const mockReq = {
    url: '/auth/callback',
    session: {
      regenerate: jest.fn(),
      grant: {
        state: 1337
      },
      user: {
        ident: 13456,
        first_name: 'Test',
        last_name: 'User',
      }
    },
    query: {
      code: 1234,
      state: 1337
    }
  };
  
  const mockRes = {
    send: jest.fn(),
    sendFile: jest.fn(),
    redirect: jest.fn(),
    setHeader: jest.fn(),
    status: jest.fn(),
    clearCookie: jest.fn(),
  };
  
  it('should render login page', async () => {
    const { HOST, PORT, CLIENT_ID, CLIENT_SECRET, JWKS_PATH, REDIRECT_URL, ISSUER_URL, TOKEN_PATH } = process.env;
    const B64_VALUE = Buffer.from((`${CLIENT_ID}:${CLIENT_SECRET}`)).toString('base64');
    
    nock(ISSUER_URL).get(JWKS_PATH).reply(200, {
      keys: [{
        kty: 'RSA',
        kid: 'de6cc4',
        n: 'quJwjU7FpkM6CzQeDZl6zcb0k5X54xZyHuQr69xfKjiFy45JM4udrsJGmuR3oxDhiC0ZzKO1Tw-ZplxKG_Sz4U3qR1fbStijPU3UbApuXDeAsSZWQsgMMPWocCVxPchdJpfde6qDbI5DoUIzA96aqUmJ7u850UWUSJCGwIBN6qudQOIjLLKKrX1jXsSJDdQ-qKB5E3ts6pw-yUz0qDMhxr3XYdS-9nOMNgBC-0vLyRFfMo8xs__MmLUDNkHJuNyl5nwcSLiTIH8exdsVdYnvC1Oy4slzvcVuPH_qzeTU785SRKZ_zzoSJoRl-A4Ck5i-EmMm54Z9DiGzhovpkRQehw',
        e: 'AQAB'
      }]
    });
    
    nock(ISSUER_URL, {
      reqheaders: {
        'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Authorization': `Basic ${B64_VALUE}`
      }
    }).post(TOKEN_PATH, qs.stringify({
      'grant_type': 'authorization_code',
      'code': 1234,
      'redirect_uri': `${HOST}:${PORT}${REDIRECT_URL}`,
    })).reply(200, {
      access_token: '12345',
      token_type: 'bearer',
      expires_in: 600,
      id_token: jwt.sign({
        iss: 'https://tara-test.ria.ee',
        aud: 'eis_client_dev',
        sub: 'EE60001019906',
        profile_attributes: {
          date_of_birth: '2000-01-01',
          family_name: 'REGISTRANT',
          given_name: 'TEST'
        },
        amr: [ 'mID' ],
        state: 1337,
      }, 'gaJ4ieppLIExZlBqQBzfuX2mCtQqlqhveJnV6_7ovsnUTiCpzY2r2GiPUW_ihnUG8txsBv9mSwzlnfvDSMPxNgl6oha3SGdiJt6FOFUNda2xVjJkHBNQlE-4MSNmbd0zNVTd87PeMZsXGR10QAo-QBCGsBkRPn3PSOFDKIPtGAlNT2kTMkZ9reCnHA38IN3AEV7e52A-qGNPt9EXk8w3noq3Z6UVEiS7sZUD6ze66e3duwBdd57W4EPNVjWeqPKnHLAJajnf2ZUub-dmb09A43P53_Lv8UwnUJSLIf88Dnp65LwnkQkInP7cT7rHHs5SE6dETwWC4N0gtcK27he1eQ')
    });
    
    await callbackPageRoute(mockReq, mockRes);
    expect(mockRes.redirect.mock.calls).toHaveLength(1);
    expect(mockRes.redirect.mock.calls[0][0]).toBe('/');
  });
});
