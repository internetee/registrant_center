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
    it('returns initial state', () => {
        expect(reducer(undefined, {})).toEqual(initialState);
    });

    it('handles FETCH_ACCESS_EVENTS_REQUEST', () => {
        const state = reducer(initialState, {
            type: 'FETCH_ACCESS_EVENTS_REQUEST',
            payload: { uuid },
        });
        expect(state.isLoading).toBe(true);
        expect(state.error).toBe(null);
    });

    it('handles FETCH_ACCESS_EVENTS_SUCCESS keyed by uuid', () => {
        const state = reducer(initialState, {
            type: 'FETCH_ACCESS_EVENTS_SUCCESS',
            payload: { uuid, events: sampleEvents },
        });
        expect(state.data[uuid]).toEqual(sampleEvents);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe(null);
    });

    it('preserves events for other uuids on a new success', () => {
        const otherUuid = 'aaaaaaaa-1111-2222-3333-444444444444';
        const first = reducer(initialState, {
            type: 'FETCH_ACCESS_EVENTS_SUCCESS',
            payload: { uuid: otherUuid, events: [] },
        });
        const second = reducer(first, {
            type: 'FETCH_ACCESS_EVENTS_SUCCESS',
            payload: { uuid, events: sampleEvents },
        });
        expect(second.data[otherUuid]).toEqual([]);
        expect(second.data[uuid]).toEqual(sampleEvents);
    });

    it('handles FETCH_ACCESS_EVENTS_FAILURE', () => {
        const state = reducer(initialState, {
            type: 'FETCH_ACCESS_EVENTS_FAILURE',
            payload: { uuid },
        });
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe(true);
    });

    it('resets to initial state on LOGOUT_USER', () => {
        const populated = reducer(initialState, {
            type: 'FETCH_ACCESS_EVENTS_SUCCESS',
            payload: { uuid, events: sampleEvents },
        });
        expect(reducer(populated, { type: 'LOGOUT_USER' })).toEqual(initialState);
    });
});
