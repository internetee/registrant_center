import { afterEach, beforeAll, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

expect.extend(matchers);

afterEach(() => {
    cleanup();
});

beforeAll(() => {
    // Mock XMLHttpRequest globally
    global.XMLHttpRequest = vi.fn(() => ({
        open: vi.fn(),
        send: vi.fn(),
        setRequestHeader: vi.fn(),
        readyState: 4,
        status: 200,
        response: null,
    }));
});
