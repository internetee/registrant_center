// @vitest-environment node
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

// Mock SSL files and https server to avoid real network and fs
vi.mock('fs', () => ({
    default: {
        readFileSync: vi.fn(() => 'dummy'),
    },
}));

vi.mock('https', () => ({
    default: {
        createServer: vi.fn((_credentials, _app) => {
            const serverInstance = {
                emit: vi.fn(),
                listen: vi.fn((port, cb) => {
                    if (cb) {
                        // Call callback asynchronously to match real behavior
                        setTimeout(() => cb(), 0);
                    }
                    return serverInstance;
                }),
            };
            return serverInstance;
        }),
    },
}));

vi.mock('grant-express', () => ({ default: () => (req, res, next) => next() }));
vi.mock('express-winston', () => ({
    default: {
        logger: () => (req, res, next) => next(),
        errorLogger: () => (req, res, next) => next(),
    },
}));
vi.mock('helmet', () => ({ default: () => (req, res, next) => next() }));
vi.mock('compression', () => ({ default: () => (req, res, next) => next() }));
vi.mock('cookie-session', () => ({ default: () => (req, res, next) => next() }));

vi.mock('./utils/banner.js', () => ({ default: vi.fn() }));
vi.mock('axios', () => ({
    default: {
        get: vi.fn(async () => ({ data: { keys: [{}] } })),
        create: vi.fn(() => ({
            get: vi.fn(async () => ({ status: 200, data: {} })),
            post: vi.fn(async () => ({ status: 200, data: {} })),
            delete: vi.fn(async () => ({ status: 200, data: {} })),
            patch: vi.fn(async () => ({ status: 200, data: {} })),
        })),
    },
}));

describe('server/index smoke', () => {
    let serverModule;
    const prevEnv = { ...process.env };

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        process.env.HOST = 'localhost';
        process.env.VITE_SERVER_PORT = '4000';
        process.env.REDIRECT_URL = '/auth/callback';
        process.env.SESSION_SECRET = 'x';
        process.env.ISSUER_URL = 'https://issuer';
        process.env.JWKS_PATH = '/jwks';
        process.env.API_HOST = 'https://api.test';
        process.env.PUBLIC_API_HOST = 'https://public.test';
        process.env.PUBLIC_API_KEY = 'test-key';
        process.env.VITE_SCOPE = 'openid';
        process.env.RESPONSE_TYPE = 'code';
        process.env.AUTH_PATH = '/auth';
        process.env.TOKEN_PATH = '/token';
        serverModule = await import('./index.js');
    }, 30000);

    afterAll(() => {
        process.env = prevEnv;
    });

    it('exports server instance', () => {
        expect(serverModule.default).toBeDefined();
    });
});
