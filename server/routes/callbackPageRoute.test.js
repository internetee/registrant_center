/**
 * @jest-environment node
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import callbackPage, { get_user_country_code, get_user_ident } from './callbackPageRoute';
import jwt from 'jsonwebtoken';

vi.mock('axios');
vi.mock('jsonwebtoken');

const mockPublicKey = 'mock-public-key';

describe('server/routes/callbackPageRoute', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        vi.resetAllMocks();

        // Mock JWT verify to return decoded token data
        jwt.verify.mockImplementation((token, key, options, callback) => {
            // Verify that the correct key is being passed
            expect(key).toBe(mockPublicKey);
            callback(null, {
                sub: 'EE30303039914',
                profile_attributes: {
                    given_name: 'OK',
                    family_name: 'TESTNUMBER',
                },
            });
        });

        mockReq = {
            query: {
                code: 1234,
                state: 1337,
            },
            session: {
                grant: {
                    state: 1337,
                },
                regenerate: vi.fn(),
            },
            url: '/auth/callback',
        };

        mockRes = {
            clearCookie: vi.fn(),
            redirect: vi.fn(),
            send: vi.fn(),
            sendFile: vi.fn(),
            setHeader: vi.fn(),
            status: vi.fn(),
        };

        axios.mockResolvedValue({
            data: {
                id_token: 'dummy-token',
                access_token: '12345',
                expires_in: 600,
                token_type: 'bearer',
            },
        });
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('should handle successful login and set user session', async () => {
        await callbackPage(mockReq, mockRes, mockPublicKey);
        expect(mockRes.clearCookie).toHaveBeenCalledWith('connect.sid', expect.any(Object));
        expect(mockReq.session).toHaveProperty('user');
        expect(mockRes.redirect).toHaveBeenCalledWith('/');
    });

    it('should redirect to login page with error when user cancels authentication', async () => {
        mockReq.query.error = 'user_cancel';
        await callbackPage(mockReq, mockRes, mockPublicKey);
        expect(mockRes.redirect).toHaveBeenCalledWith('/login');
    });

    it('should handle state mismatch error', async () => {
        mockReq.session.grant.state = 'different-state';
        await callbackPage(mockReq, mockRes, mockPublicKey);
        expect(mockRes.redirect).toHaveBeenCalledWith('/login');
    });

    it('should handle axios error', async () => {
        axios.mockRejectedValue(new Error('Network error'));
        await callbackPage(mockReq, mockRes, mockPublicKey);
        expect(mockRes.redirect).toHaveBeenCalledWith('/login');
    });

    it('should handle JWT verification error', async () => {
        jwt.verify.mockImplementation((token, key, options, callback) => {
            expect(key).toBe(mockPublicKey);
            callback(new Error('TokenExpiredError: jwt expired'));
        });
        await callbackPage(mockReq, mockRes, mockPublicKey);
        expect(mockRes.redirect).toHaveBeenCalledWith('/login');
    });
});

describe('User identification helper functions', () => {
    describe('get_user_ident', () => {
        it('should extract Estonian personal code correctly', () => {
            expect(get_user_ident('EE38903110313')).toBe('38903110313');
        });

        it('should extract foreign identification code correctly', () => {
            expect(get_user_ident('FRACD43556DB')).toBe('ACD43556DB');
        });

        it('should handle empty string', () => {
            expect(get_user_ident('')).toBe('');
        });
    });

    describe('get_user_country_code', () => {
        it('should extract Estonian country code correctly', () => {
            expect(get_user_country_code('EE38903110313')).toBe('EE');
        });

        it('should extract foreign country code correctly', () => {
            expect(get_user_country_code('FRACD43556DB')).toBe('FR');
        });

        it('should handle empty string', () => {
            expect(get_user_country_code('')).toBe('');
        });
    });
});
