import { describe, it, expect, beforeEach, vi } from 'vitest';
import reducer, {
    initialState,
    fetchDomain,
    fetchDomains,
    lockDomain,
    parseDomain,
    unlockDomain,
} from './domains';
import domains from '../../__mocks__/domains';

// Mock the api module instead of axios
vi.mock('../../utils/api', () => ({
    default: {
        fetchDomains: vi.fn(),
        setDomainRegistryLock: vi.fn(),
        deleteDomainRegistryLock: vi.fn(),
    },
}));

vi.mock('./contacts', () => ({
    fetchContacts: vi.fn((id) => ({ type: 'MOCK_FETCH_CONTACTS', payload: id })),
}));

// Import api after mocking
import api from '../../utils/api';

describe('Domain Actions', () => {
    let dispatch;

    beforeEach(() => {
        vi.clearAllMocks();
        dispatch = vi.fn((action) => {
            // If the action is a function (thunk), execute it
            if (typeof action === 'function') {
                return action(dispatch);
            }
            return action;
        });
    });

    describe('fetchDomain', () => {
        it('fetches a single domain and its contacts', async () => {
            const mockDomain = {
                ...domains[0],
            };
            api.fetchDomains.mockResolvedValueOnce({ data: mockDomain });

            await fetchDomain(mockDomain.id)(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: 'FETCH_DOMAIN_REQUEST' });

            // Verify fetchContacts was called for each contact
            expect(dispatch).toHaveBeenCalledWith({
                type: 'MOCK_FETCH_CONTACTS',
                payload: mockDomain.registrant.id,
            });
            expect(dispatch).toHaveBeenCalledWith({
                type: 'MOCK_FETCH_CONTACTS',
                payload: mockDomain.tech_contacts[0].id,
            });
            expect(dispatch).toHaveBeenCalledWith({
                type: 'MOCK_FETCH_CONTACTS',
                payload: mockDomain.admin_contacts[0].id,
            });

            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'FETCH_DOMAIN_SUCCESS',
                payload: parseDomain(mockDomain),
            });

            expect(api.fetchDomains).toHaveBeenCalledWith(mockDomain.id);
        });

        it('handles fetch domain failure', async () => {
            api.fetchDomains.mockRejectedValueOnce(new Error('Failed to fetch'));

            await fetchDomain('invalid-id')(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: 'FETCH_DOMAIN_REQUEST' });
            expect(dispatch).toHaveBeenLastCalledWith({ type: 'FETCH_DOMAIN_FAILURE' });
        });
    });

    describe('fetchDomains', () => {
        it('fetches domains with pagination', async () => {
            api.fetchDomains.mockResolvedValueOnce({
                data: {
                    domains: domains,
                    count: 2,
                    total: 2,
                },
            });

            await fetchDomains(0, false, false)(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: 'FETCH_DOMAINS_REQUEST' });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'FETCH_DOMAINS_SUCCESS',
                payload: {
                    domains: domains,
                    count: 2,
                    total: 2,
                },
                simplify: false,
            });

            expect(api.fetchDomains).toHaveBeenCalledWith(null, 0, false, false);
        });

        it('should handle pagination when there are more than 200 domains', async () => {
            // Create mock contacts
            const firstPage = Array(200)
                .fill()
                .map((_, i) => ({
                    id: `${i}`,
                    name: `domain${i}.ee`,
                }));
            const secondPage = Array(50)
                .fill()
                .map((_, i) => ({
                    id: `${i + 200}`,
                    name: `domain${i + 200}.ee`,
                }));

            // Mock API responses
            api.fetchDomains
                .mockResolvedValueOnce({
                    data: {
                        domains: firstPage,
                        count: 200,
                        total: 250,
                    },
                })
                .mockResolvedValueOnce({
                    data: {
                        domains: secondPage,
                        count: 50,
                        total: 250,
                    },
                });

            // Call fetchCompanies
            await fetchDomains(0, false, false)(dispatch);

            // Verify api.fetchCompanies was called twice with correct offsets
            expect(api.fetchDomains).toHaveBeenCalledTimes(2);
            expect(api.fetchDomains).toHaveBeenNthCalledWith(1, null, 0, false, false);
            expect(api.fetchDomains).toHaveBeenNthCalledWith(2, null, 200, false, false);

            // Get all dispatch calls
            const dispatchCalls = dispatch.mock.calls.map((call) => call[0]);

            // Verify the sequence of actions
            expect(dispatchCalls).toContainEqual({
                type: 'FETCH_DOMAINS_REQUEST',
            });

            // Verify the final success action contains all companies
            const successAction = dispatchCalls.find(
                (call) => call.type === 'FETCH_DOMAINS_SUCCESS'
            );
            expect(successAction).toBeTruthy();
            expect(successAction.payload.domains).toHaveLength(250);
            expect(successAction.payload.domains).toEqual([...firstPage, ...secondPage]);
        });
    });

    describe('lockDomain', () => {
        it('locks domain with extensionsProhibited', async () => {
            const mockResponse = {
                ...domains[0],
                locked_by_registrant_at: new Date().toISOString(),
            };
            api.setDomainRegistryLock.mockResolvedValueOnce({ data: mockResponse });

            await lockDomain(domains[0].id, true)(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: 'LOCK_DOMAIN_REQUEST' });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'LOCK_DOMAIN_SUCCESS',
                payload: mockResponse,
            });

            expect(api.setDomainRegistryLock).toHaveBeenCalledWith(domains[0].id, true);
        });

        it('handles lock domain failure', async () => {
            const errorResponse = {
                response: {
                    status: 403,
                    data: { message: 'Domain cannot be locked' },
                },
            };
            api.setDomainRegistryLock.mockRejectedValueOnce(errorResponse);

            await lockDomain(domains[0].id)(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: 'LOCK_DOMAIN_REQUEST' });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'LOCK_DOMAIN_FAILURE',
                payload: {
                    code: 403,
                    success: false,
                    message: 'Domain cannot be locked',
                },
            });
        });
    });

    describe('unlockDomain', () => {
        it('unlocks domain successfully', async () => {
            const mockResponse = {
                ...domains[0],
                locked_by_registrant_at: null,
            };
            api.deleteDomainRegistryLock.mockResolvedValueOnce({ data: mockResponse });

            await unlockDomain(domains[0].id)(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: 'UNLOCK_DOMAIN_REQUEST' });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'UNLOCK_DOMAIN_SUCCESS',
                payload: mockResponse,
            });

            expect(api.deleteDomainRegistryLock).toHaveBeenCalledWith(domains[0].id);
        });

        it('handles unlock domain failure', async () => {
            const errorResponse = {
                response: {
                    status: 403,
                    data: { message: 'Domain cannot be unlocked' },
                },
            };
            api.deleteDomainRegistryLock.mockRejectedValueOnce(errorResponse);

            await unlockDomain(domains[0].id)(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: 'UNLOCK_DOMAIN_REQUEST' });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'UNLOCK_DOMAIN_FAILURE',
                payload: {
                    code: 403,
                    success: false,
                    message: 'Domain cannot be unlocked',
                },
            });
        });
    });
});

describe('Domains Reducer', () => {
    it('returns initial state', () => {
        expect(reducer(undefined, {})).toEqual(initialState);
    });

    it('handles FETCH_DOMAINS_SUCCESS', () => {
        const action = {
            type: 'FETCH_DOMAINS_SUCCESS',
            payload: {
                domains: domains,
                count: 4,
                total: 4,
            },
            simplify: false,
        };

        const state = reducer(initialState, action);
        expect(state.data.count).toBe(4);
        expect(state.data.total).toBe(4);
        expect(Object.keys(state.data.domains)).toHaveLength(domains.length);
        expect(state.isLoading).toBe(false);
    });

    it('handles LOCK_DOMAIN_SUCCESS', () => {
        const mockDomain = {
            ...domains[0],
            locked_by_registrant_at: new Date().toISOString(),
        };

        const action = {
            type: 'LOCK_DOMAIN_SUCCESS',
            payload: mockDomain,
        };

        const state = reducer(initialState, action);
        expect(state.data[mockDomain.id]).toEqual(parseDomain(mockDomain));
        expect(state.message).toEqual({
            code: 200,
            type: 'domainLock',
        });
    });

    it('handles LOCK_DOMAIN_FAILURE', () => {
        const action = {
            type: 'LOCK_DOMAIN_FAILURE',
            payload: {
                code: 403,
                success: false,
                message: 'Domain cannot be locked',
            },
        };

        const state = reducer(initialState, action);
        expect(state.message).toEqual({
            code: 403,
            type: 'domainLock',
            success: false,
            message: 'Domain cannot be locked',
        });
    });

    it('handles FETCH_DOMAINS_REQUEST', () => {
        const state = reducer(initialState, { type: 'FETCH_DOMAINS_REQUEST' });
        expect(state.isLoading).toBe(true);
    });

    it('handles FETCH_DOMAINS_FAILURE', () => {
        const state = reducer(initialState, { type: 'FETCH_DOMAINS_FAILURE' });
        expect(state.isLoading).toBe(false);
    });
});
