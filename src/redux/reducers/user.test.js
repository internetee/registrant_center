import { describe, it, expect, beforeEach, vi } from 'vitest';
import reducer, { initialState, fetchUser, logoutUser } from './user';
import user from '../../__mocks__/user';

// Mock the api module
vi.mock('../../utils/api', () => ({
    default: {
        fetchUser: vi.fn(),
        destroyUser: vi.fn(),
    },
}));

import api from '../../utils/api';

describe('User Actions', () => {
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

    describe('fetchUser', () => {
        it('fetches user successfully', async () => {
            api.fetchUser.mockResolvedValueOnce({ data: user });

            await fetchUser()(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: 'FETCH_USER_REQUEST',
            });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'FETCH_USER_SUCCESS',
                payload: user,
            });

            expect(api.fetchUser).toHaveBeenCalled();
        });

        it('handles fetch user failure with response', async () => {
            const errorResponse = {
                response: { status: 400 },
            };
            api.fetchUser.mockRejectedValueOnce(errorResponse);

            await fetchUser()(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: 'FETCH_USER_REQUEST',
            });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'FETCH_USER_FAILURE',
                status: 400,
            });
        });

        it('handles fetch user failure without response', async () => {
            api.fetchUser.mockRejectedValueOnce(new Error('Network error'));

            await fetchUser()(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: 'FETCH_USER_REQUEST',
            });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'FETCH_USER_FAILURE',
                status: 501,
            });
        });
    });

    describe('logoutUser', () => {
        it('logs out user successfully', async () => {
            api.destroyUser.mockResolvedValueOnce({ status: 200 });

            await logoutUser()(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: 'LOGOUT_USER',
                isLoggedOut: true,
                status: 200,
            });

            expect(api.destroyUser).toHaveBeenCalled();
        });

        it('handles logout failure', async () => {
            const errorResponse = {
                response: { status: 400 },
            };
            api.destroyUser.mockRejectedValueOnce(errorResponse);

            await logoutUser()(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: 'LOGOUT_USER',
                isLoggedOut: true,
                status: 400,
            });
        });
    });
});

describe('User Reducer', () => {
    it('returns initial state', () => {
        expect(reducer(undefined, {})).toEqual(initialState);
    });

    it('handles FETCH_USER_REQUEST', () => {
        const state = reducer(initialState, {
            type: 'FETCH_USER_REQUEST',
        });
        expect(state).toEqual({
            ...initialState,
        });
    });

    it('handles FETCH_USER_SUCCESS', () => {
        const state = reducer(initialState, {
            type: 'FETCH_USER_SUCCESS',
            payload: user,
        });

        expect(state).toEqual({
            data: {
                ...user,
                name: `${user.first_name} ${user.last_name}`,
            },
            isInvalidated: false,
            status: 200,
            isLoggedOut: null,
        });
    });

    it('handles FETCH_USER_FAILURE', () => {
        const state = reducer(initialState, {
            type: 'FETCH_USER_FAILURE',
            status: 400,
        });

        expect(state).toEqual({
            ...initialState,
            isInvalidated: true,
            status: 400,
        });
    });

    it('handles LOGOUT_USER', () => {
        const state = reducer(initialState, {
            type: 'LOGOUT_USER',
            isLoggedOut: true,
            status: 200,
        });

        expect(state).toEqual({
            ...initialState,
            isLoggedOut: true,
            status: 200,
        });
    });
});
