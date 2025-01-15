import { describe, it, expect, beforeEach, vi } from 'vitest';
import reducer, {
    initialState,
    fetchMenu,
    setLang,
    toggleMainMenu,
    closeMainMenu,
    getDeviceType,
} from './ui';
import Cookies from 'universal-cookie';

// Mock the api module
vi.mock('../../utils/api', () => ({
    default: {
        fetchMenu: vi.fn(),
    },
}));

// Mock universal-cookie
vi.mock('universal-cookie', () => {
    const mockCookies = {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
    };
    return {
        default: vi.fn(() => mockCookies),
    };
});

import api from '../../utils/api';

describe('UI Actions', () => {
    let dispatch;
    let cookies;

    beforeEach(() => {
        vi.clearAllMocks();
        dispatch = vi.fn();
        cookies = new Cookies();
        dispatch = vi.fn((action) => {
            // If the action is a function (thunk), execute it
            if (typeof action === 'function') {
                return action(dispatch);
            }
            return action;
        });
    });

    describe('fetchMenu', () => {
        it('fetches menu successfully', async () => {
            const mockMenuData = [
                { id: 1, name: 'Menu Item 1' },
                { id: 2, name: 'Menu Item 2' },
            ];
            api.fetchMenu.mockResolvedValueOnce({ data: mockMenuData });

            await fetchMenu('main')(dispatch);

            expect(dispatch).toHaveBeenNthCalledWith(1, {
                isInvalidated: false,
                isLoading: true,
                status: null,
                type: 'FETCH_MENU_MAIN_REQUEST',
            });

            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'FETCH_MENU_MAIN_SUCCESS',
                payload: { main: mockMenuData },
                isLoading: false,
                isInvalidated: false,
                status: 200,
            });

            expect(api.fetchMenu).toHaveBeenCalledWith('main');
        });

        it('handles menu fetch failure', async () => {
            const errorResponse = {
                response: { status: 404 },
            };
            api.fetchMenu.mockRejectedValueOnce(errorResponse);

            await fetchMenu('main')(dispatch);

            expect(dispatch).toHaveBeenNthCalledWith(1, {
                isInvalidated: false,
                isLoading: true,
                status: null,
                type: 'FETCH_MENU_MAIN_REQUEST',
            });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'FETCH_MENU_MAIN_FAILURE',
                payload: { main: null },
                isLoading: false,
                isInvalidated: true,
                status: 404,
            });
        });
    });

    describe('setLang', () => {
        it('sets language and updates cookie', async () => {
            await setLang('en')(dispatch);

            expect(cookies.remove).toHaveBeenCalledWith('locale');
            expect(cookies.set).toHaveBeenCalledWith('locale', 'en', { path: '/' });
            expect(dispatch).toHaveBeenCalledWith({
                type: 'SET_LANG',
                lang: 'en',
            });
        });
    });

    describe('toggleMainMenu', () => {
        it('dispatches toggle action', () => {
            toggleMainMenu()(dispatch);
            expect(dispatch).toHaveBeenCalledWith({
                type: 'TOGGLE_MAIN_MENU',
            });
        });
    });

    describe('closeMainMenu', () => {
        it('dispatches close action', () => {
            closeMainMenu()(dispatch);
            expect(dispatch).toHaveBeenCalledWith({
                type: 'CLOSE_MAIN_MENU',
            });
        });
    });

    describe('getDeviceType', () => {
        it('sets device type to small for mobile width', () => {
            getDeviceType(400)(dispatch);
            expect(dispatch).toHaveBeenCalledWith({
                type: 'GET_DEVICE_TYPE',
                uiElemSize: 'small',
            });
        });

        it('sets device type to large for tablet width', () => {
            getDeviceType(800)(dispatch);
            expect(dispatch).toHaveBeenCalledWith({
                type: 'GET_DEVICE_TYPE',
                uiElemSize: 'large',
            });
        });

        it('sets device type to big for desktop width', () => {
            getDeviceType(1300)(dispatch);
            expect(dispatch).toHaveBeenCalledWith({
                type: 'GET_DEVICE_TYPE',
                uiElemSize: 'big',
            });
        });
    });
});

describe('UI Reducer', () => {
    it('returns initial state', () => {
        expect(reducer(undefined, {})).toEqual(initialState);
    });

    it('handles FETCH_MENU_SUCCESS', () => {
        const mockMenuData = [{ id: 1, name: 'Menu Item' }];
        const action = {
            type: 'FETCH_MENU_MAIN_SUCCESS',
            payload: { main: mockMenuData },
            isLoading: false,
            isInvalidated: false,
            status: 200,
        };

        const state = reducer(initialState, action);
        expect(state.menus).toEqual({ main: mockMenuData });
        expect(state.isLoading).toBe(false);
        expect(state.isInvalidated).toBe(false);
        expect(state.status).toBe(200);
    });

    it('handles TOGGLE_MAIN_MENU', () => {
        const state = reducer(initialState, { type: 'TOGGLE_MAIN_MENU' });
        expect(state.isMainMenuOpen).toBe(true);

        const nextState = reducer(state, { type: 'TOGGLE_MAIN_MENU' });
        expect(nextState.isMainMenuOpen).toBe(false);
    });

    it('handles CLOSE_MAIN_MENU', () => {
        const state = reducer(
            { ...initialState, isMainMenuOpen: true },
            { type: 'CLOSE_MAIN_MENU' }
        );
        expect(state.isMainMenuOpen).toBe(false);
    });

    it('handles GET_DEVICE_TYPE', () => {
        const state = reducer(initialState, {
            type: 'GET_DEVICE_TYPE',
            uiElemSize: 'small',
        });
        expect(state.uiElemSize).toBe('small');
    });

    it('handles SET_LANG', () => {
        const state = reducer(initialState, {
            type: 'SET_LANG',
            lang: 'en',
        });
        expect(state.lang).toBe('en');
    });
});
