import { describe, it, expect } from 'vitest';
import helpers from './helpers';

describe('utils/helpers edge cases', () => {
    it('getChangedUserContactsByDomain returns [] on invalid input', () => {
        const res = helpers.getChangedUserContactsByDomain(null, null);
        expect(res).toEqual([]);
    });

    it('getChangedUserContactsByDomain handles contacts.links shape', () => {
        const contacts = {
            a: { links: [{ id: '1', name: 'd1' }] },
        };
        const res = helpers.getChangedUserContactsByDomain({}, contacts);
        expect(res).toEqual([{ id: '1', name: 'd1', roles: [] }]);
    });

    it('getDomainContacts returns roles for registrant/admin/tech', () => {
        const domain = {
            registrant: { id: 'r' },
            admin_contacts: [{ id: 'a' }],
            tech_contacts: [{ id: 't' }],
        };
        const contacts = {
            r: { id: 'r', code: 'R', disclosed_attributes: [], registrant_publishable: true, email: 'r@e', ident: {}, name: 'R', phone: '1' },
            a: { id: 'a', code: 'A', disclosed_attributes: [], registrant_publishable: false, email: 'a@e', ident: {}, name: 'A', phone: '2' },
            t: { id: 't', code: 'T', disclosed_attributes: [], registrant_publishable: false, email: 't@e', ident: {}, name: 'T', phone: '3' },
        };
        const res = helpers.getDomainContacts(domain, contacts);
        const roles = res.reduce((acc, x) => ({ ...acc, [x.id]: x.roles }), {});
        expect([...roles.r]).toContain('registrant');
        expect([...roles.a]).toContain('admin');
        expect([...roles.t]).toContain('tech');
    });

    it('getChangedUserContactsByDomain handles domains with contacts', () => {
        const domains = {
            d1: {
                id: 'd1',
                name: 'test.ee',
                registrant: { id: 'r1' },
                tech_contacts: [{ id: 't1' }],
                admin_contacts: [{ id: 'a1' }],
            },
        };
        const contacts = {
            r1: { id: 'r1' },
            t1: { id: 't1' },
            a1: { id: 'a1' },
        };
        const res = helpers.getChangedUserContactsByDomain(domains, contacts);
        expect(res).toHaveLength(1);
        expect(res[0].id).toBe('d1');
        expect(res[0].roles).toContain('registrant');
        expect(res[0].roles).toContain('tech');
        expect(res[0].roles).toContain('admin');
    });

    it('getChangedUserContactsByDomain handles domain without matching contacts', () => {
        const domains = {
            d1: {
                id: 'd1',
                name: 'test.ee',
                registrant: { id: 'r1' },
                tech_contacts: [{ id: 't1' }],
                admin_contacts: [{ id: 'a1' }],
            },
        };
        const contacts = {};
        const res = helpers.getChangedUserContactsByDomain(domains, contacts);
        expect(res).toEqual([]);
    });

    it('getDomains returns array of domains', () => {
        const domains = {
            d1: { id: 'd1', name: 'test1.ee' },
            d2: { id: 'd2', name: 'test2.ee' },
        };
        const res = helpers.getDomains(domains);
        expect(res).toHaveLength(2);
        expect(res[0].name).toBe('test1.ee');
        expect(res[1].name).toBe('test2.ee');
    });

    it('getDomains handles empty object', () => {
        const res = helpers.getDomains({});
        expect(res).toEqual([]);
    });

    it('getUserContacts filters contacts by user ident', () => {
        const user = { ident: '123' };
        const domain = {
            contacts: {
                c1: { id: 'c1' },
            },
        };
        const contacts = {
            c1: {
                id: 'c1',
                ident: { code: '123' },
                disclosed_attributes: [],
                registrant_publishable: true,
                email: 'test@test.ee',
                phone: '123',
                name: 'Test',
            },
        };
        const companies = {};
        const res = helpers.getUserContacts(user, domain, contacts, companies);
        expect(res).toHaveProperty('c1');
        expect(res.c1.initialEmail).toBe('test@test.ee');
    });

    it('getUserContacts filters contacts by company', () => {
        const user = { ident: '456' };
        const domain = {
            contacts: {
                c1: { id: 'c1' },
            },
        };
        const contacts = {
            c1: {
                id: 'c1',
                ident: { type: 'org', code: 'COMP1' },
                disclosed_attributes: [],
                registrant_publishable: false,
                email: 'org@test.ee',
                phone: '456',
                name: 'Org',
            },
        };
        const companies = {
            data: {
                COMP1: { name: 'Company' },
            },
        };
        const res = helpers.getUserContacts(user, domain, contacts, companies);
        expect(res).toHaveProperty('c1');
    });

    it('parseDomainContacts parses contacts correctly', () => {
        const user = { ident: '123' };
        const domain = {
            contacts: {
                c1: { id: 'c1' },
            },
        };
        const contacts = {
            c1: {
                id: 'c1',
                ident: { code: '123' },
                disclosed_attributes: [],
                registrant_publishable: true,
                email: 'test@test.ee',
                phone: '123',
                name: 'Test',
            },
        };
        const companies = {};
        const res = helpers.parseDomainContacts(user, domain, contacts, companies);
        expect(res).toHaveProperty('c1');
        expect(res.c1.initialEmail).toBe('test@test.ee');
    });
});
