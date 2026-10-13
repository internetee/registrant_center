// @vitest-environment node
import vm from 'vm';
import { describe, it, expect } from 'vitest';
import {
    parseDisclosurePolicyActiveFrom,
    buildRuntimeConfigScript,
    runtimeConfigHandler,
} from './runtimeConfig.js';

describe('parseDisclosurePolicyActiveFrom', () => {
    it('returns null when the value is unset, empty or blank', () => {
        expect(parseDisclosurePolicyActiveFrom(undefined)).toBeNull();
        expect(parseDisclosurePolicyActiveFrom('')).toBeNull();
        expect(parseDisclosurePolicyActiveFrom('   ')).toBeNull();
    });

    it('returns the trimmed value for a valid ISO 8601 timestamp with offset', () => {
        expect(parseDisclosurePolicyActiveFrom('2027-01-18T00:00:00+02:00')).toBe(
            '2027-01-18T00:00:00+02:00'
        );
        expect(parseDisclosurePolicyActiveFrom('2026-12-01T00:00:00Z')).toBe(
            '2026-12-01T00:00:00Z'
        );
        expect(parseDisclosurePolicyActiveFrom('  2026-12-01T00:00:00Z  ')).toBe(
            '2026-12-01T00:00:00Z'
        );
    });

    it.each(['not-a-date', '2027-01-18', '2027-01-18T00:00:00'])(
        'throws for "%s"',
        (bad) => {
            expect(() => parseDisclosurePolicyActiveFrom(bad)).toThrow(
                /DISCLOSURE_POLICY_ACTIVE_FROM/
            );
            expect(() => parseDisclosurePolicyActiveFrom(bad)).toThrow(`"${bad}"`);
        }
    );

    it('throws for an impossible calendar date', () => {
        // JS rolls 2027-02-30 over to 2027-03-02, so a plain new Date check is not enough
        expect(() => parseDisclosurePolicyActiveFrom('2027-02-30T00:00:00Z')).toThrow(
            /DISCLOSURE_POLICY_ACTIVE_FROM/
        );
        expect(() => parseDisclosurePolicyActiveFrom('2027-02-30T00:00:00Z')).toThrow(
            '"2027-02-30T00:00:00Z"'
        );
    });
});

describe('buildRuntimeConfigScript', () => {
    it('embeds the config as a frozen object literal', () => {
        expect(buildRuntimeConfigScript({ disclosurePolicyActiveFrom: null })).toBe(
            'window.__RUNTIME_CONFIG__ = Object.freeze({"disclosurePolicyActiveFrom":null});'
        );
    });
});

describe('runtimeConfigHandler', () => {
    const createResponse = () => ({
        headers: {},
        body: undefined,
        set(fields) {
            Object.assign(this.headers, fields);
            return this;
        },
        send(body) {
            this.body = body;
            return this;
        },
    });

    const evalInWindow = (script) => {
        const sandbox = { window: {} };
        vm.runInNewContext(script, sandbox);
        return sandbox.window;
    };

    it('sets content and cache headers and serves the configured value', () => {
        const handler = runtimeConfigHandler({
            disclosurePolicyActiveFrom: '2027-01-18T00:00:00+02:00',
        });
        const res = createResponse();
        handler({}, res);

        expect(res.headers['Content-Type']).toBe('application/javascript; charset=utf-8');
        expect(res.headers['Cache-Control']).toBe('no-store');

        const win = evalInWindow(res.body);
        expect(win.__RUNTIME_CONFIG__.disclosurePolicyActiveFrom).toBe(
            '2027-01-18T00:00:00+02:00'
        );
        expect(Object.isFrozen(win.__RUNTIME_CONFIG__)).toBe(true);
    });

    it('serves null when the value is unset', () => {
        const handler = runtimeConfigHandler({ disclosurePolicyActiveFrom: null });
        const res = createResponse();
        handler({}, res);

        const win = evalInWindow(res.body);
        expect(win.__RUNTIME_CONFIG__.disclosurePolicyActiveFrom).toBeNull();
    });
});
