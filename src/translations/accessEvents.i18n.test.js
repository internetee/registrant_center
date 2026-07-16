import { describe, it, expect } from 'vitest';
import en from './en.json';
import et from './et.json';

// AC20: every new user-facing string is a React-Intl key under the domain.accessEvents.* namespace,
// present in BOTH en.json and et.json, with matching key sets and no empty values.
describe('domain.accessEvents.* i18n keys', () => {
    const namespace = 'domain.accessEvents.';
    const expectedKeys = [
        'domain.accessEvents.accessedAt',
        'domain.accessEvents.category',
        'domain.accessEvents.empty',
        'domain.accessEvents.institution',
        'domain.accessEvents.title',
        'domain.accessEvents.tooltip',
    ].sort();

    const enKeys = Object.keys(en)
        .filter((k) => k.startsWith(namespace))
        .sort();
    const etKeys = Object.keys(et)
        .filter((k) => k.startsWith(namespace))
        .sort();

    it('en.json contains exactly the expected keys', () => {
        expect(enKeys).toEqual(expectedKeys);
    });

    it('et.json contains exactly the expected keys', () => {
        expect(etKeys).toEqual(expectedKeys);
    });

    it('the two locale key sets match', () => {
        expect(enKeys).toEqual(etKeys);
    });

    it('every value is a non-empty string in both locales', () => {
        expectedKeys.forEach((key) => {
            expect(typeof en[key]).toBe('string');
            expect(en[key].trim().length).toBeGreaterThan(0);
            expect(typeof et[key]).toBe('string');
            expect(et[key].trim().length).toBeGreaterThan(0);
        });
    });
});
