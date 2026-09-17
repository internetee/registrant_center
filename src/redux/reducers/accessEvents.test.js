import { describe, it, expect, beforeEach, vi } from 'vitest';
import reducer, { initialState, fetchAccessEvents } from './accessEvents';

// Mock the api module instead of axios
vi.mock('../../utils/api', () => ({
    default: {
        fetchDomainAccessEvents: vi.fn(),
    },
}));

// Import api after mocking
import api from '../../utils/api';

const uuid = 'bd695cc9-1da8-4c39-b7ac-9a2055e0a93e';
const sampleEvents = [
    {
        accessed_at: '2026-07-10T12:00:00+03:00',
        organization: 'Politsei- ja Piirivalveamet',
        category: 'law_enforcement',
    },
    {
        accessed_at: '2026-07-09T09:30:00+03:00',
        organization: null,
        category: 'court',
    },
];

describe('Access events actions', () => {
    let dispatch;

    beforeEach(() => {
        vi.clearAllMocks();
        dispatch = vi.fn((action) => {
            if (typeof action === 'function') {
                return action(dispatch);
            }
            return action;
        });
    });

    describe('fetchAccessEvents', () => {
        it('dispatches request then success with events keyed by uuid', async () => {
            api.fetchDomainAccessEvents.mockResolvedValueOnce({ data: sampleEvents });

            await fetchAccessEvents(uuid)(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: 'FETCH_ACCESS_EVENTS_REQUEST',
                payload: { uuid },
            });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'FETCH_ACCESS_EVENTS_SUCCESS',
                payload: { uuid, events: sampleEvents },
            });
            expect(api.fetchDomainAccessEvents).toHaveBeenCalledWith(uuid);
        });

        it('dispatches request then failure on error', async () => {
            api.fetchDomainAccessEvents.mockRejectedValueOnce(new Error('Failed to fetch'));

            await fetchAccessEvents(uuid)(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: 'FETCH_ACCESS_EVENTS_REQUEST',
                payload: { uuid },
            });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'FETCH_ACCESS_EVENTS_FAILURE',
                payload: { uuid },
            });
        });
    });
});

describe('Access events reducer', () => {
    const otherUuid = 'aaaaaaaa-1111-2222-3333-444444444444';

    it('returns initial state', () => {
        expect(reducer(undefined, {})).toEqual(initialState);
    });

    it('handles FETCH_ACCESS_EVENTS_REQUEST scoped to the uuid', () => {
        const state = reducer(initialState, {
            type: 'FETCH_ACCESS_EVENTS_REQUEST',
            payload: { uuid },
        });
        expect(state.byUuid[uuid].isLoading).toBe(true);
        expect(state.byUuid[uuid].error).toBe(false);
        // events stays undefined while loading -> the panel must not read this as "empty"
        expect(state.byUuid[uuid].events).toBeUndefined();
    });

    it('handles FETCH_ACCESS_EVENTS_SUCCESS keyed by uuid', () => {
        const state = reducer(initialState, {
            type: 'FETCH_ACCESS_EVENTS_SUCCESS',
            payload: { uuid, events: sampleEvents },
        });
        expect(state.byUuid[uuid].events).toEqual(sampleEvents);
        expect(state.byUuid[uuid].isLoading).toBe(false);
        expect(state.byUuid[uuid].error).toBe(false);
    });

    it('preserves records for other uuids on a new success', () => {
        const first = reducer(initialState, {
            type: 'FETCH_ACCESS_EVENTS_SUCCESS',
            payload: { uuid: otherUuid, events: [] },
        });
        const second = reducer(first, {
            type: 'FETCH_ACCESS_EVENTS_SUCCESS',
            payload: { uuid, events: sampleEvents },
        });
        expect(second.byUuid[otherUuid].events).toEqual([]);
        expect(second.byUuid[uuid].events).toEqual(sampleEvents);
    });

    it('handles FETCH_ACCESS_EVENTS_FAILURE scoped to the uuid', () => {
        const state = reducer(initialState, {
            type: 'FETCH_ACCESS_EVENTS_FAILURE',
            payload: { uuid },
        });
        expect(state.byUuid[uuid].isLoading).toBe(false);
        expect(state.byUuid[uuid].error).toBe(true);
        // events stays undefined on failure -> the panel must not read this as "empty"
        expect(state.byUuid[uuid].events).toBeUndefined();
    });

    it('scopes loading/error per uuid: a failure for A does not touch B (W2)', () => {
        // A loads successfully (empty result), then B fails.
        const afterA = reducer(initialState, {
            type: 'FETCH_ACCESS_EVENTS_SUCCESS',
            payload: { uuid: otherUuid, events: [] },
        });
        const afterBRequest = reducer(afterA, {
            type: 'FETCH_ACCESS_EVENTS_REQUEST',
            payload: { uuid },
        });
        const afterBFailure = reducer(afterBRequest, {
            type: 'FETCH_ACCESS_EVENTS_FAILURE',
            payload: { uuid },
        });

        // B is errored...
        expect(afterBFailure.byUuid[uuid].error).toBe(true);
        expect(afterBFailure.byUuid[uuid].isLoading).toBe(false);
        // ...but A is untouched: still a successful empty load, no error, not loading.
        expect(afterBFailure.byUuid[otherUuid].events).toEqual([]);
        expect(afterBFailure.byUuid[otherUuid].error).toBe(false);
        expect(afterBFailure.byUuid[otherUuid].isLoading).toBe(false);
    });

    it('resets to initial state on LOGOUT_USER', () => {
        const populated = reducer(initialState, {
            type: 'FETCH_ACCESS_EVENTS_SUCCESS',
            payload: { uuid, events: sampleEvents },
        });
        expect(reducer(populated, { type: 'LOGOUT_USER' })).toEqual(initialState);
    });
});
