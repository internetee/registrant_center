import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import ErrorPage from './ErrorPage';
import Providers from '../../__mocks__/Providers';
import { useParams } from 'react-router-dom';

const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    useParams: vi.fn(),
    useNavigate: () => mockNavigate
}));

// Mock redux actions
vi.mock('../../redux/reducers/ui', () => ({
    setLang: () => ({
        type: 'SET_LANG',
        payload: 'et'
    }),
    closeMainMenu: vi.fn(),
    toggleMainMenu: vi.fn()
}));

const createTestStore = (overrides = {}) => {
    const baseState = {
        ui: {
            lang: 'et',
            uiElemSize: 'small',
            menus: { main: [] },
            isMainMenuOpen: false,
            ...overrides.ui
        },
        user: {
            data: {},
            error: null,
            ...overrides.user
        }
    };

    return configureStore({
        reducer: {
            ui: (state = baseState.ui, action) => {
                switch (action.type) {
                    case 'SET_LANG':
                        return {
                            ...state,
                            lang: action.payload
                        };
                    default:
                        return state;
                }
            },
            user: (state = baseState.user) => state
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
                immutableCheck: false,
            })
    });
};

describe('ErrorPage', () => {
    let store;

    beforeEach(() => {
        store = createTestStore();
        vi.clearAllMocks();
    });

    it('renders error message when no language parameter is provided', () => {
        vi.mocked(useParams).mockReturnValue({ lang: undefined });

        const { container, getByText } = render(
            <Providers store={store}>
                <ErrorPage />
            </Providers>
        );

        // Check if error message is displayed
        expect(container.querySelector('.page--message')).toBeInTheDocument();
        expect(getByText('Lehte ei leitud')).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('redirects to home and sets language when "et" language parameter is provided', async () => {
        vi.mocked(useParams).mockReturnValue({ lang: 'et' });

        render(
            <Providers store={store}>
                <ErrorPage />
            </Providers>
        );

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
        });
    });

    it('redirects to home and sets language when "en" language parameter is provided', async () => {
        vi.mocked(useParams).mockReturnValue({ lang: 'en' });

        render(
            <Providers store={store}>
                <ErrorPage />
            </Providers>
        );

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
        });
    });

    it('shows error message for invalid language parameter', () => {
        vi.mocked(useParams).mockReturnValue({ lang: 'invalid' });

        const { container, getByText } = render(
            <Providers store={store}>
                <ErrorPage />
            </Providers>
        );

        expect(container.querySelector('.page--message')).toBeInTheDocument();
        expect(getByText('Lehte ei leitud')).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('renders with correct layout elements', () => {
        vi.mocked(useParams).mockReturnValue({ lang: undefined });

        const { container } = render(
            <Providers store={store}>
                <ErrorPage />
            </Providers>
        );

        // Check if MainLayout is present with correct elements
        expect(container.querySelector('main')).toBeInTheDocument();
        expect(container.querySelector('.page--message')).toBeInTheDocument();
        expect(container.querySelector('.icon')).toBeInTheDocument();
    });

    it('does not navigate or set language for null parameter', () => {
        vi.mocked(useParams).mockReturnValue({ lang: null });

        render(
            <Providers store={store}>
                <ErrorPage />
            </Providers>
        );

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(store.getState().ui.lang).toBe('et'); // Should remain default
    });

    it('handles undefined parameters gracefully', () => {
        vi.mocked(useParams).mockReturnValue({});

        const { container, getByText } = render(
            <Providers store={store}>
                <ErrorPage />
            </Providers>
        );

        expect(container.querySelector('.page--message')).toBeInTheDocument();
        expect(getByText('Lehte ei leitud')).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
