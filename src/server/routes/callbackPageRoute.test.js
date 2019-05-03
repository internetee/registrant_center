/**
 * @jest-environment node
 */

import nock from 'nock';
import callbackPageRoute from './callbackPageRoute';

describe('server/routes/callbackPageRoute', () => {

  it('should render login page', () => {
    const { HOST, PORT, REDIRECT_URL, ISSUER_URL, TOKEN_PATH, B64_VALUE } = process.env;
    nock(ISSUER_URL, {
      reqheaders: {
        'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Authorization': `Basic ${B64_VALUE}`
      }
    }).post(TOKEN_PATH, {
      'grant_type': 'authorization_code',
      'code': 'test_code',
      'redirect_uri': `${HOST}:${PORT}${REDIRECT_URL}`,
    }).reply(200, {});
    
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
    
    callbackPageRoute(mockReq, mockRes);
    // expect(mockRes.redirect.mock.calls.length).toEqual(1);
  });
  
});
