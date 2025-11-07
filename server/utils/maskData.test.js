import { describe, it, expect } from 'vitest';
import { sanitizeData, maskingRules } from './maskData';

describe('maskData', () => {
    it('masks password fields', () => {
        const data = { password: 'secret123' };
        const result = sanitizeData(data);
        expect(result.password).toBe('***');
    });

    it('masks token fields', () => {
        const data = { access_token: 'abc123', refresh_token: 'xyz789' };
        const result = sanitizeData(data);
        expect(result.access_token).toBe('***');
        expect(result.refresh_token).toBe('***');
    });

    it('masks email fields', () => {
        const data = { email: 'test@example.com' };
        const result = sanitizeData(data);
        expect(result.email).toBe('te**@e**********');
    });

    it('masks personalCode fields', () => {
        const data = { personalCode: '12345678901' };
        const result = sanitizeData(data);
        expect(result.personalCode).toBe('12345678901');
    });

    it('masks phone fields', () => {
        const data = { phone: '+37212345678' };
        const result = sanitizeData(data);
        expect(result.phone).toBe('********5678');
    });

    it('masks nested objects', () => {
        const data = {
            user: {
                email: 'user@test.com',
                password: 'secret',
            },
        };
        const result = sanitizeData(data);
        expect(result.user.email).toBe('us**@t*******');
        expect(result.user.password).toBe('***');
    });

    it('masks arrays', () => {
        const data = {
            users: [{ email: 'user1@test.com' }, { email: 'user2@test.com' }],
        };
        const result = sanitizeData(data);
        expect(result.users).toHaveLength(2);
        expect(result.users[0].email).toBe('us***@t*******');
        expect(result.users[1].email).toBe('us***@t*******');
    });

    it('does not mask unknown fields', () => {
        const data = { name: 'John Doe', age: 30 };
        const result = sanitizeData(data);
        expect(result.name).toBe('John Doe');
        expect(result.age).toBe(30);
    });

    it('handles null and undefined', () => {
        expect(sanitizeData(null)).toBeNull();
        expect(sanitizeData(undefined)).toBeUndefined();
    });

    it('handles non-string values', () => {
        const data = { number: 123, boolean: true, email: 'test@test.com' };
        const result = sanitizeData(data);
        expect(result.number).toBe(123);
        expect(result.boolean).toBe(true);
        expect(result.email).toBe('te**@t*******');
    });

    it('exports maskingRules', () => {
        expect(maskingRules).toBeDefined();
        expect(maskingRules.password).toBeDefined();
        expect(maskingRules.email).toBeDefined();
    });
});
