import { describe, it, expect, beforeEach, vi } from 'vitest';
import reducer, { initialState, fetchCompanies } from './companies';
import companies from '../../__mocks__/companies';

// Mock the api module
vi.mock('../../utils/api', () => ({
    default: {
        fetchCompanies: vi.fn(),
    },
}));

import api from '../../utils/api';

describe('Companies Actions', () => {
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

    describe('fetchCompanies', () => {
        it('fetches companies with pagination', async () => {
            // First batch of companies
            api.fetchCompanies.mockResolvedValueOnce({
                data: {
                    companies: companies.companies.slice(0, 200),
                    total: companies.companies.length,
                },
            });

            await fetchCompanies(0)(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: 'FETCH_COMPANIES_REQUEST' });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'FETCH_COMPANIES_SUCCESS',
                payload: companies.companies.slice(0, 200),
            });

            expect(api.fetchCompanies).toHaveBeenCalledWith(0);
            expect(api.fetchCompanies).toHaveBeenCalledTimes(1);
        });

        it('handles fetch companies failure', async () => {
            api.fetchCompanies.mockRejectedValueOnce(new Error('Failed to fetch'));

            await fetchCompanies()(dispatch);

            expect(dispatch).toHaveBeenCalledTimes(2);

            expect(dispatch.mock.calls[0][0]).toEqual({
                type: 'FETCH_COMPANIES_REQUEST',
            });
            expect(dispatch.mock.calls[1][0]).toEqual({
                type: 'FETCH_COMPANIES_FAILURE',
            });
        });

        it('should handle pagination when there are more than 200 companies', async () => {
            // Create mock companies
            const firstPage = Array(200)
                .fill()
                .map((_, i) => ({
                    registry_no: `company${i}`,
                }));
            const secondPage = Array(50)
                .fill()
                .map((_, i) => ({
                    registry_no: `company${i + 200}`,
                }));

            // Mock API responses
            api.fetchCompanies
                .mockResolvedValueOnce({
                    data: { companies: firstPage },
                })
                .mockResolvedValueOnce({
                    data: { companies: secondPage },
                });

            // Call fetchCompanies
            await fetchCompanies()(dispatch);

            // Verify api.fetchCompanies was called twice with correct offsets
            expect(api.fetchCompanies).toHaveBeenCalledTimes(2);
            expect(api.fetchCompanies).toHaveBeenNthCalledWith(1, 0);
            expect(api.fetchCompanies).toHaveBeenNthCalledWith(2, 200);

            // Get all dispatch calls
            const dispatchCalls = dispatch.mock.calls.map((call) => call[0]);

            // Verify the sequence of actions
            expect(dispatchCalls).toContainEqual({
                type: 'FETCH_COMPANIES_REQUEST',
            });

            // Verify the final success action contains all companies
            const successAction = dispatchCalls.find(
                (call) => call.type === 'FETCH_COMPANIES_SUCCESS'
            );
            expect(successAction).toBeTruthy();
            expect(successAction.payload).toHaveLength(250);
            expect(successAction.payload).toEqual([...firstPage, ...secondPage]);
        });
    });
});

describe('Companies Reducer', () => {
    it('returns initial state', () => {
        expect(reducer(undefined, {})).toEqual(initialState);
    });

    it('handles LOGOUT_USER', () => {
        const state = {
            data: { some: 'data' },
            ids: ['1', '2'],
            isLoading: false,
        };

        expect(reducer(state, { type: 'LOGOUT_USER' })).toEqual(initialState);
    });

    it('handles FETCH_COMPANIES_REQUEST', () => {
        const state = reducer(initialState, { type: 'FETCH_COMPANIES_REQUEST' });
        expect(state.isLoading).toBe(true);
    });

    it('handles FETCH_COMPANIES_FAILURE', () => {
        const state = reducer(
            { ...initialState, isLoading: true },
            { type: 'FETCH_COMPANIES_FAILURE' }
        );
        expect(state.isLoading).toBe(false);
    });

    it('handles FETCH_COMPANIES_SUCCESS', () => {
        const action = {
            type: 'FETCH_COMPANIES_SUCCESS',
            payload: companies.companies,
        };

        const state = reducer(initialState, action);

        // Check data is properly indexed by registry_no
        expect(Object.keys(state.data)).toEqual(
            companies.companies.map((company) => company.registry_no)
        );

        // Check ids array contains all registry numbers
        expect(state.ids).toEqual(companies.companies.map((company) => company.registry_no));

        // Check loading state is reset
        expect(state.isLoading).toBe(false);

        // Check message is cleared
        expect(state.message).toBeNull();

        // Verify company data is stored correctly
        companies.companies.forEach((company) => {
            expect(state.data[company.registry_no]).toEqual(company);
        });
    });
});
