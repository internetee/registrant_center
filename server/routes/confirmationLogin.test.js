import { describe, it, expect, vi } from 'vitest';
import { startConfirmationLogin } from './confirmationLogin';

describe('confirmation login', () => {
    it('stores a confirmation path in the session and clears stale credentials', () => {
        const req = { body: { path: '/confirmation/example.ee/delete/secret' }, session: { user: {}, token: {} } };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        startConfirmationLogin(req, res);
        expect(req.session).toEqual({ confirmationReturnPath: req.body.path });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it.each(['https://evil.test/confirmation/a/b/c', '//evil.test/confirmation/a/b/c', '/confirmation/a/b/c?next=//evil.test', '/confirmation/a/b%2fc/d', '/confirmation/a/b/c#x', '/confirmation/%2e%2e/b/c', '/confirmation/a/b/%0d%0a'])('rejects unsafe path %s', (path) => {
        const req = { body: { path }, session: {} };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        startConfirmationLogin(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(req.session.confirmationReturnPath).toBeUndefined();
    });
});
