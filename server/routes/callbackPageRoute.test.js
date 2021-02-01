/**
 * @jest-environment node
 */

import axios from 'axios';
import callbackPage, {get_user_country_code, get_user_ident} from './callbackPageRoute';

const publicKey = 
'-----BEGIN PUBLIC KEY-----\n' +
'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiVKwG5cTHFx60wYLndRL\n' +
'lzlvH9m2XsVaWh0LQFcvQBCcUMXjCYQRJ22sLjAz6fvig83dWcoKQVanZfzNGAqG\n' +
'/I54LIVT6oUZxFgCA1cyFKELaCqnpzQa3m7CBOklQUV7Z6Dtj1bMJiMIaEv8lzht\n' +
'KmqkC6o2xjTWIbVCBublwF0DH5SsVdeX+kC4aJtYCbhsuYuzrn4VpR33NuvLxOBP\n' +
'HDVCMYImxlYU337uf6DjmdZMV96ODqP7E9iMS3GWk/MJEzrgLU7/7JiO3OWtkBUN\n' +
'spZ7pgNdIc6OQ5ZASfWsUufS44kt1fNmPqowklHCRNqcnFOx0lc7ya/VlCdXV6Qf\n' +
'ewIDAQAB\n' +
'-----END PUBLIC KEY-----'

let mockReq = {};
let mockRes = {};

describe('server/routes/callbackPageRoute', () => {
    beforeEach(() => {
        mockReq = {
            query: {
                code: 1234,
                state: 1337,
            },
            session: {
                grant: {
                    state: 1337,
                },
                regenerate: jest.fn(),
            },
            url: '/auth/callback',
        };

        mockRes = {
            clearCookie: jest.fn(),
            redirect: jest.fn(),
            send: jest.fn(),
            sendFile: jest.fn(),
            setHeader: jest.fn(),
            status: jest.fn(),
        };
    });

    afterEach(() => {
        mockReq = {};
        mockRes = {};
    });

    it('logs in user', async () => {
        axios.mockResolvedValueOnce({ data: {
            access_token: '12345',
            expires_in: 600,
            id_token:
                'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJiMGJjMTg2Yy1kYTk2LTQxMDUtYjYzYy00Mzk3M2E0MzBmODQiLCJpc3MiOiJodHRwczovL3RhcmEtdGVzdC5pbmZyYS50bGQuZWUiLCJhdWQiOiIxMzM3IiwiZXhwIjoxNjEyMjE1NDQ4LCJpYXQiOjE2MTIxODY2NDgsIm5iZiI6MTYxMjE4NjM0OCwic3ViIjoiRUUxMDEwMTAxMDAwNSIsInByb2ZpbGVfYXR0cmlidXRlcyI6eyJkYXRlX29mX2JpcnRoIjoiMTgwMS0wMS0wMSIsImZhbWlseV9uYW1lIjoiU01BUlQtSUQiLCJnaXZlbl9uYW1lIjoiREVNTyJ9LCJhbXIiOlsic21hcnRpZCJdLCJhY3IiOiJoaWdoIiwic3RhdGUiOiI0YzM4MWY5MmM0ZTFlYjBmZmE3ZCIsIm5vbmNlIjoiIiwiYXRfaGFzaCI6InUwS01EekdjeTM3eDY2MnFNQ2VyMEE9PSJ9.hOkkhkP-WsqE_3sjj0OAUpx7N2twFHNuWnY5CWScQfLS1LsEPSNQwMDo7a4_MNhMWrOrsLe2e98wtxlrac03bqJTbT4wQoApOypXXnUhVFbr59QhPssR8ctlp10qZx-jixTJgomu7FqIkH_gBdHquwpv9sf-CCT4Sg3QEcTEfdnMxqn-3JUkxsQqa6hN6KYYrge5T9C84x905gN_moK1i9QHeZ9tLClmJZtjmxBMMy5pHCAln2YBOxxQWsv1VbvvnROZADBdXky_fQVMimmZrMqKi3pyHj-5rYiZ5Q45udVS7RZkk6RMwLtKSOiNSXQvdJirtz1vdV5Sta2C318JyQ',
            token_type: 'bearer',
        }});
        await callbackPage(mockReq, mockRes, publicKey);
        expect(mockReq.session).toHaveProperty('user');
    });
});

describe('Check removing country code from ident', () => {
    it('Check if person has Estonian ident', () => {
        let ident = get_user_ident('EE38903110313');
        expect(ident).toBe('38903110313');
    });

    it('Check if person has some foreign ident', () => {
        let ident = get_user_ident('FRACD43556DB');
        expect(ident).toBe('ACD43556DB')
    })
});

describe('Check country code from ident', () => {
    it('Check country code of Estonian ident', () => {
        let country_code = get_user_country_code('EE38903110313');
        expect(country_code).toBe('EE');
    });
    it('Check country code of Foreign ident', () => {
        let country_code = get_user_country_code('FRACD43556DB');
        expect(country_code).toBe('FR');
    })
    
})