import { describe, it, expect, afterEach, vi } from 'vitest';
import { isDisclosurePolicyActive } from './disclosurePolicy';

describe('isDisclosurePolicyActive', () => {
    afterEach(() => {
        delete window.__RUNTIME_CONFIG__;
        vi.restoreAllMocks();
    });

    it('returns false when the variable is unset', () => {
        window.__RUNTIME_CONFIG__ = { disclosurePolicyActiveFrom: '' };
        expect(isDisclosurePolicyActive()).toBe(false);
    });

    it('returns false when /runtime-config.js was never loaded', () => {
        expect(isDisclosurePolicyActive()).toBe(false);
    });

    it('returns false when the variable is blank', () => {
        window.__RUNTIME_CONFIG__ = { disclosurePolicyActiveFrom: '   ' };
        expect(isDisclosurePolicyActive()).toBe(false);
    });

    it('returns false and logs an error for a malformed value', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        window.__RUNTIME_CONFIG__ = { disclosurePolicyActiveFrom: 'not-a-date' };

        expect(isDisclosurePolicyActive()).toBe(false);
        expect(errorSpy).toHaveBeenCalledOnce();
        expect(errorSpy.mock.calls[0][0]).toContain('DISCLOSURE_POLICY_ACTIVE_FROM');
        expect(errorSpy.mock.calls[0][0]).toContain('not-a-date');
    });

    it('returns false before the activation time', () => {
        window.__RUNTIME_CONFIG__ = { disclosurePolicyActiveFrom: '2027-01-18T00:00:00+02:00' };
        expect(isDisclosurePolicyActive(new Date('2027-01-17T21:59:59Z'))).toBe(false);
    });

    it('returns true exactly at the activation time', () => {
        window.__RUNTIME_CONFIG__ = { disclosurePolicyActiveFrom: '2027-01-18T00:00:00+02:00' };
        expect(isDisclosurePolicyActive(new Date('2027-01-17T22:00:00Z'))).toBe(true);
    });

    it('returns true after the activation time', () => {
        window.__RUNTIME_CONFIG__ = { disclosurePolicyActiveFrom: '2027-01-18T00:00:00+02:00' };
        expect(isDisclosurePolicyActive(new Date('2027-06-01T12:00:00Z'))).toBe(true);
    });

    it('uses the current time by default', () => {
        window.__RUNTIME_CONFIG__ = { disclosurePolicyActiveFrom: '2000-01-01T00:00:00Z' };
        expect(isDisclosurePolicyActive()).toBe(true);
    });
});
