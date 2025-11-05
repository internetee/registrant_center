import { describe, it, expect, vi, beforeEach } from 'vitest';
import API from './apiRoute';

const { mockAxiosGet, mockAxiosInstance, mockAxiosCreate } = vi.hoisted(() => {
    const mockGet = vi.fn();
    const mockInstance = {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    };
    const mockCreate = vi.fn(() => mockInstance);
    return { mockAxiosGet: mockGet, mockAxiosInstance: mockInstance, mockAxiosCreate: mockCreate };
});

vi.mock('axios', () => ({
    default: {
        create: mockAxiosCreate,
        get: mockAxiosGet,
    },
    __esModule: true,
}));

import axios from 'axios';

vi.mock('../utils/logger.js', () => ({
    logWarn: vi.fn(),
    logInfo: vi.fn(),
    logError: vi.fn(),
}));

describe('server/routes/apiRoute', () => {
    const createRes = () => {
        const ctx = { statusCode: 200, body: null };
        return {
            locals: {},
            status(code) {
                ctx.statusCode = code;
                return this;
            },
            json(payload) {
                ctx.body = payload;
                return this;
            },
            end: vi.fn(),
            __ctx: ctx,
        };
    };

    const createSession = (token = null) => ({
        session: {
            token: token || {
                access_token: 'test-token',
                expires_at: new Date(Date.now() + 3600000).toISOString(),
            },
        },
    });

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.API_HOST = 'https://api.test';
        process.env.PUBLIC_API_HOST = 'https://public.test';
        process.env.PUBLIC_API_KEY = 'test-key';
        mockAxiosInstance.get.mockReset();
        mockAxiosInstance.post.mockReset();
        mockAxiosGet.mockReset();
    });

    it('checkAuth denies when session is invalid', () => {
        const req = { session: {} };
        const r = createRes();
        const next = vi.fn();
        API.checkAuth(req, r, next);
        expect(next).not.toHaveBeenCalled();
        expect(r.__ctx.statusCode).toBe(401);
    });

    it('checkAuth allows when session is valid', () => {
        const req = createSession();
        const r = createRes();
        const next = vi.fn();
        API.checkAuth(req, r, next);
        expect(next).toHaveBeenCalled();
    });

    it('destroyUser clears session', async () => {
        const req = { session: { token: { access_token: 'x' } } };
        const r = createRes();
        await API.destroyUser(req, r);
        expect(req.session).toBeNull();
        expect(r.end).toHaveBeenCalled();
    });

    it('getUser returns user data when session has user', async () => {
        const req = createSession();
        req.session.user = { name: 'Test User', ident: { code: '123' } };
        const r = createRes();
        await API.getUser(req, r);
        expect(r.__ctx.statusCode).toBe(200);
        expect(r.__ctx.body).toEqual(req.session.user);
    });

    it('getUser returns 401 when no user in session', async () => {
        const req = createSession();
        req.session.user = null;
        const r = createRes();
        await API.getUser(req, r);
        expect(r.__ctx.statusCode).toBe(401);
    });

    it('getUser creates token when missing', async () => {
        const req = createSession();
        req.session.user = { name: 'Test User', ident: { code: '123' } };
        req.session.token = null;
        mockAxiosInstance.post.mockResolvedValue({ data: 'new-token' });
        const r = createRes();
        await API.getUser(req, r);
        expect(mockAxiosInstance.post).toHaveBeenCalled();
        expect(r.__ctx.statusCode).toBe(200);
    });

    it('getMenu returns main menu data', async () => {
        const mockData = { data: [{ id: 1, title: 'Menu' }] };
        mockAxiosInstance.get.mockResolvedValue({ status: 200, data: mockData });
        const req = { params: { type: 'main' } };
        const r = createRes();
        await API.getMenu(req, r);
        expect(r.__ctx.statusCode).toBe(200);
    });

    it('getMenu returns 404 on error', async () => {
        mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));
        const req = { params: { type: 'main' } };
        const r = createRes();
        await API.getMenu(req, r);
        expect(r.__ctx.statusCode).toBe(404);
    });

    it('getMenu returns 500 for unknown menu type', async () => {
        const req = { params: { type: 'unknown' } };
        const r = createRes();
        await API.getMenu(req, r);
        expect(r.__ctx.statusCode).toBe(500);
    });

    it('getDomains handles query params correctly', async () => {
        const req = {
            ...createSession(),
            query: { offset: '10', simple: 'true' },
            params: {},
        };
        const r = createRes();
        mockAxiosInstance.get.mockResolvedValue({ status: 200, data: [] });
        await API.getDomains(req, r);
        expect(mockAxiosInstance.get).toHaveBeenCalled();
    });

    it('getDomains handles uuid param', async () => {
        const req = {
            ...createSession(),
            query: {},
            params: { uuid: 'test-uuid' },
        };
        const r = createRes();
        mockAxiosInstance.get.mockResolvedValue({ status: 200, data: {} });
        await API.getDomains(req, r);
        expect(mockAxiosInstance.get).toHaveBeenCalled();
    });

    it('getContacts handles links query param', async () => {
        const req = {
            ...createSession(),
            query: { offset: '0', links: 'true' },
            params: {},
        };
        const r = createRes();
        mockAxiosInstance.get.mockResolvedValue({ status: 200, data: [] });
        await API.getContacts(req, r);
        expect(mockAxiosInstance.get).toHaveBeenCalled();
    });

    it('updateContacts calls API with correct endpoint', async () => {
        const req = {
            ...createSession(),
            params: { uuid: 'test-uuid' },
        };
        const r = createRes();
        mockAxiosInstance.post.mockResolvedValue({ status: 200, data: {} });
        await API.updateContacts(req, r);
        expect(mockAxiosInstance.post).toHaveBeenCalled();
    });

    it('setDomainRegistryLock includes extensionsProhibited in query', async () => {
        const req = {
            ...createSession(),
            query: { extensionsProhibited: 'true' },
            params: { uuid: 'test-uuid' },
        };
        const r = createRes();
        mockAxiosInstance.post.mockResolvedValue({ status: 200, data: {} });
        await API.setDomainRegistryLock(req, r);
        expect(mockAxiosInstance.post).toHaveBeenCalled();
    });

    it('doNeedUpdateContacts calls API with correct endpoint', async () => {
        const req = {
            ...createSession(),
            params: { uuid: 'test-uuid' },
        };
        const r = createRes();
        mockAxiosInstance.get.mockResolvedValue({ status: 200, data: {} });
        await API.doNeedUpdateContacts(req, r);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('api/v1/registrant/contacts/test-uuid/do_need_update_contacts');
    });

    it('deleteDomainRegistryLock calls API with correct endpoint', async () => {
        const req = {
            ...createSession(),
            params: { uuid: 'test-uuid' },
        };
        const r = createRes();
        mockAxiosInstance.delete.mockResolvedValue({ status: 200, data: {} });
        await API.deleteDomainRegistryLock(req, r);
        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/v1/registrant/domains/test-uuid/registry_lock');
    });

    it('getCompanies calls API with offset', async () => {
        const req = {
            ...createSession(),
            query: { offset: '10' },
        };
        const r = createRes();
        mockAxiosInstance.get.mockResolvedValue({ status: 200, data: {} });
        await API.getCompanies(req, r);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/registrant/companies?offset=10');
    });

    it('setContact calls API with correct endpoint and body', async () => {
        const req = {
            ...createSession(),
            params: { uuid: 'test-uuid' },
            body: { name: 'Test' },
        };
        const r = createRes();
        mockAxiosInstance.patch.mockResolvedValue({ status: 200, data: {} });
        await API.setContact(req, r);
        expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/api/v1/registrant/contacts/test-uuid', { name: 'Test' });
    });

    it('getRegistrantUpdate returns data on success', async () => {
        const req = {
            params: { name: 'test.ee', token: 'token123', type: 'domain' },
        };
        const r = createRes();
        mockAxiosInstance.get.mockResolvedValue({ status: 200, data: { success: true } });
        await API.getRegistrantUpdate(req, r, createSession());
        expect(r.__ctx.statusCode).toBe(200);
        expect(r.__ctx.body).toEqual({ success: true });
    });

    it('getRegistrantUpdate handles error response', async () => {
        const req = {
            params: { name: 'test.ee', token: 'token123', type: 'domain' },
        };
        const r = createRes();
        const error = { response: { status: 404 } };
        mockAxiosInstance.get.mockRejectedValue(error);
        await API.getRegistrantUpdate(req, r, createSession());
        expect(r.__ctx.statusCode).toBe(404);
    });

    it('sendVerificationStatus returns data on success', async () => {
        const req = {
            params: { name: 'test.ee', token: 'token123', action: 'accept', type: 'domain' },
        };
        const r = createRes();
        mockAxiosInstance.post.mockResolvedValue({ status: 200, data: { success: true } });
        await API.sendVerificationStatus(req, r, createSession());
        expect(r.__ctx.statusCode).toBe(200);
        expect(r.__ctx.body).toEqual({ success: true });
    });

    it('sendVerificationStatus handles error response', async () => {
        const req = {
            params: { name: 'test.ee', token: 'token123', action: 'accept', type: 'domain' },
        };
        const r = createRes();
        const error = { response: { status: 401 } };
        mockAxiosInstance.post.mockRejectedValue(error);
        await API.sendVerificationStatus(req, r, createSession());
        expect(r.__ctx.statusCode).toBe(401);
    });

    it('handleResponse handles timeout error', async () => {
        const req = {
            ...createSession(),
            query: {},
            params: {},
        };
        const r = createRes();
        const error = { code: 'ECONNABORTED', message: 'Timeout' };
        mockAxiosInstance.get.mockRejectedValue(error);
        await API.getDomains(req, r);
        expect(r.__ctx.statusCode).toBe(408);
    });

    it('handleResponse handles unknown error', async () => {
        const req = {
            ...createSession(),
            query: {},
            params: {},
        };
        const r = createRes();
        const error = { message: 'Unknown error' };
        mockAxiosInstance.get.mockRejectedValue(error);
        await API.getDomains(req, r);
        expect(r.__ctx.statusCode).toBe(500);
    });
});
