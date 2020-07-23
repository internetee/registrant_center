/**
 * @jest-environment node
 */

import nock from 'nock';
import callbackPage from './callbackPageRoute';
import User from '../utils/UserSchema';

const {
  AR_URL,
  CLIENT_ID,
  CLIENT_SECRET,
  ISSUER_URL,
  JWKS_PATH,
  TOKEN_PATH
} = process.env;
const B64_VALUE = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
  'base64'
);
const publicKey =
  '-----BEGIN RSA PUBLIC KEY-----\n' +
  'MIICCgKCAgEApE7xmJ9+m8RwP0Q2quy8AhBMPs/l0S4+cfB1Xy5OiXvVgo6w3apw\n' +
  'wqz2DbWHgZaNFkc7yJb24+llJz/3b+4ZlxoE/nLUnazqAOnTOZyD5Ev93ilb3n2q\n' +
  'SzvG9bNG7b+hQ4RSjOU/ep1sU0ctTY+MFZB7AUyHXMYO6fywevr47K5LhKCK65pM\n' +
  '6Gxql6VOS9WB6w7sByyf7uxmG3fFcBDqFk955Mm6Wu6+CdgQ3p0YstkSm3IyRSbx\n' +
  '/+R8MIcZnSVrmBoi9MTCdyBaP/ZcqDBlW/+ajL5ijWNtbYMBonpbEC46GChqyS4T\n' +
  'BEjqjh1KqzunNFi7LC3f1F018Axos55d7DnMg8CNmDFdekx4bz6UFuh62MX7zj4k\n' +
  'IZFK0Yj1JdrLKXa5JeDrzDVF8NuhYTuGWxx8mQFUwM9zjLJVNj1QGv5HQVLz9632\n' +
  'NotTS1bQL3o9+HgfNUTV2FoXkm/sG/ZSf7ZguuCgZA5DEwhnY2xjrGx+jXahDJbx\n' +
  'aDFxQzJs2OquxZWMZNkTYwuJrhVi8B8CQAV73BDObT670pC3VukQ9UCI5K5Vo09/\n' +
  'BMVcxm4HYF39aIK6Fa1r1yI+atvKOdRH/sd5NHTfTp8M+f2TVCCSoxO4x0IvBJo4\n' +
  'Cp0qPBesmcVzCVl0VBhUPPwSH9R8O0PF0Q7B73Cg/nKzgzBsUkVCtyUCAwEAAQ==\n' +
  '-----END RSA PUBLIC KEY-----';

let mockReq = {};
let mockRes = {};

describe('server/routes/callbackPageRoute', () => {
  beforeEach(() => {
    mockReq = {
      url: '/auth/callback',
      session: {
        regenerate: jest.fn(),
        grant: {
          state: 1337
        }
      },
      query: {
        code: 1234,
        state: 1337
      }
    };

    mockRes = {
      send: jest.fn(),
      sendFile: jest.fn(),
      redirect: jest.fn(),
      setHeader: jest.fn(),
      status: jest.fn(),
      clearCookie: jest.fn()
    };

    nock(ISSUER_URL)
      .get(JWKS_PATH)
      .reply(200, {
        keys: [
          {
            kty: 'RSA',
            e: 'AQAB',
            kid: CLIENT_ID,
            alg: 'RS256',
            n:
              'pLp-6hqyZKnzWh-g8ENNyUCO3pwB3dyzQFli8Erh__d8T7ej65Wj32872t4WcXcfDBIFjUyy9jyXUPr1rMw-EkcRhvh8jSgfsMwI-ed4SDpGt9WFi5kGaZ9pRss57m5j0RCgMqWDX3pG4cZ5RYJ1qIWw7QgF1MKyMr0si97y-wCzbv6ZiLPIhSmDXR4duYLTMK75ZAR9fCWz4GNdV5VMZISX91VcVilwxwclShEkit5gBfTet-m4IxUqWphUo3oDOq65Ltj0NxxwStHPXeek4r0jJY7RqGtcMYR2Gz65HpZhU-UmI1f86HxML91jLxryd2kfpVBS4eqxoCc7ptWKjQ'
          }
        ]
      });

    nock(ISSUER_URL, {
      reqheaders: {
        Accept: 'application/json, application/xml, text/plain, text/html, *.*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        Authorization: `Basic ${B64_VALUE}`
      }
    })
      .post(TOKEN_PATH, /.*/)
      .reply(200, {
        access_token: '12345',
        token_type: 'bearer',
        expires_in: 600,
        id_token:
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3RhcmEtdGVzdC5yaWEuZWUiLCJhdWQiOiJlaXNfY2xpZW50X2RldiIsInN1YiI6IkVFNjAwMDEwMTkwMDAiLCJwcm9maWxlX2F0dHJpYnV0ZXMiOnsiZGF0ZV9vZl9iaXJ0aCI6IjIwMDAtMDEtMDEiLCJmYW1pbHlfbmFtZSI6IlJFR0lTVFJBTlQiLCJnaXZlbl9uYW1lIjoiVEVTVCJ9fQ.W9Syc_RASvAKqsS5JaPpoEi2ZzJGtQnc0RBiuIFypwwZHdutkLOx1dTdvwgb3SwfuYw5g7PsYe9OU0lcoUalinR5rtukKGwmhMPw_WD_1dyDvref3QeGVrmZhQ4GT_34XbiOFIj57wUjSJWTiToOGfI6MCKRfgrkTRITsBAVL53zPHW_1RNcZ_4Ladj6Hpc67NduNXqstNbFEB_xp3-fTeB94StXSjxRo50SCuZfm6V6dmmj2jqGqf8TTzOJ7dN3y231VDK7VBgMn9-SXCKgTFZcKcP_TFrjhUw_kURUBswk3kRDLtQEL0bPeUwaifVE9IdIWm9Qp5w7vgkpZTLGXwz-30OfPusiiNNto4ax63gbMbeyv_KWwXS7yZDU9NZtv5S4DHBu0rcEF56U7pqXhojSfCPBNqkaNKrKRz3KHnfhoDLlBbSZUiC-9RzfkyJxqypFKqm8hDWV5Vj0voPEpngz8WwJhX25Mb4Etde4ydNPGs1l3gEQLPt3WcY0-DpzQrr2T3GyxrDuKt3MTkcNkKllrSfxCBIMKmbLHsYSsoOF386f7PRNxH6YF903xnYpHFouA873cahxaMzdwd-h_G43KWlCp35IyUfjJSrYGUG69sHmSHeuCLsHvL0kX-cXIvR93J7B6I3abF3dWevJ0ClTctwAn4FdZw97cE6hSss'
      });

    nock(AR_URL, {
      reqheaders: {
        'user-agent': 'sampleTest',
        'Content-Type': 'text/xml;charset=UTF-8',
        soapAction: 'https://demo-ariregxmlv6.rik.ee/?wsdl'
      }
    })
      .post('/', /.*/)
      .reply(200, {
        keha: {
          leitud_ettevotjate_arv: 0
        }
      });
  });

  afterEach(() => {
    mockReq = {};
    mockRes = {};
  });

  it('logs in user', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue({
      companies: [],
      _id: 'asd123',
      ident: '60001019000',
      first_name: 'Test',
      last_name: 'Registrant',
      created_at: '2019-04-12T12:46:06.978Z',
      visited_at: '2019-05-17T07:45:20.535Z',
      __v: 0,
      updated_at: '2019-05-13T07:45:20.535Z'
    });

    jest.spyOn(User, 'updateOne').mockReturnValue({
      ident: '60001019000',
      first_name: 'Test',
      last_name: 'Registrant',
      updated_at: Date.now(),
      visited_at: Date.now()
    });

    await callbackPage(mockReq, mockRes, publicKey);

    expect(mockRes.redirect.mock.calls).toHaveLength(1);
  });

  it('creates new user', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    jest.spyOn(User, 'create').mockReturnValue({
      _id: 'asd123',
      ident: '60001019000',
      first_name: 'Test',
      last_name: 'Registrant',
      created_at: '2019-04-12T12:46:06.978Z',
      __v: 0
    });

    await callbackPage(mockReq, mockRes, publicKey);

    expect(mockRes.redirect.mock.calls).toHaveLength(1);
  });
});
