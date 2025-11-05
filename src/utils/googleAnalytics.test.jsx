import { describe, it, expect, vi, beforeEach } from 'vitest';
import GA from './googleAnalytics';

vi.mock('react-ga', () => ({ default: { initialize: vi.fn(), set: vi.fn(), pageview: vi.fn() } }));

describe('utils/googleAnalytics init', () => {
    beforeEach(() => {
        Object.keys(window).forEach((k) => { if (k.startsWith('ga-disable-')) delete window[k]; });
        document.cookie = 'cc_cookie=';
    });

    it('disables GA and removes cookies when no consent', () => {
        const enabled = GA.init();
        expect(enabled).toBe(false);
    });
});
