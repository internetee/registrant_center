import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockRoot = {
    render: vi.fn(),
};

const mockCreateRoot = vi.fn(() => mockRoot);

vi.mock('react-dom/client', () => ({
    createRoot: mockCreateRoot,
}));

vi.mock('./App', () => ({
    default: () => <div>App</div>,
}));

vi.mock('./redux/reducers', () => ({
    default: {
        ui: (state = {}) => state,
        user: (state = {}) => state,
    },
}));

vi.mock('./utils/googleAnalytics', () => ({
    default: {
        init: vi.fn(() => false),
        RouteTracker: () => null,
    },
}));

describe('main.jsx', () => {
    let originalGetElementById;
    const mockElement = {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
    };

    beforeEach(() => {
        originalGetElementById = document.getElementById;
        document.getElementById = vi.fn(() => mockElement);
        vi.clearAllMocks();
    });

    afterEach(() => {
        document.getElementById = originalGetElementById;
        vi.clearAllMocks();
    });

    it('creates root and renders App', async () => {
        vi.resetModules();
        vi.clearAllMocks();
        await import('./main.jsx');
        await new Promise(resolve => setTimeout(resolve, 200));
        expect(mockCreateRoot).toHaveBeenCalled();
        expect(mockRoot.render).toHaveBeenCalled();
    }, { timeout: 15000 });

    it('renders App in StrictMode', async () => {
        vi.resetModules();
        await import('./main.jsx');
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(mockCreateRoot).toHaveBeenCalled();
        const calls = mockCreateRoot.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        const lastCall = calls[calls.length - 1];
        expect(lastCall[0]).toBe(mockElement);
    }, { timeout: 10000 });
});
