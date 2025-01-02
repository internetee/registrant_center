import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage from './LoginPage';
import Providers from '../../__mocks__/Providers';
import user from '../../__mocks__/user';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

const { VITE_URL } = import.meta.env;

const createTestStore = (overrides = {}) => {
    const baseState = {
        ui: {
            uiElemSize: 'small',
            lang: 'et',
            menus: { main: [] },
            isMainMenuOpen: false,
            ...overrides.ui,
        },
        user: {
            data: user,
            isLoggedOut: false,
            status: null,
            error: null,
            ...overrides.user,
        },
    };

    return configureStore({
        reducer: Object.entries(baseState).reduce(
            (acc, [key, value]) => ({
                ...acc,
                [key]: (state = { ...value, ...overrides[key] }) => state,
            }),
            {}
        ),
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
                immutableCheck: false,
            }),
    });
};

describe('LoginPage', () => {
    let store;

    beforeEach(() => {
        store = createTestStore();
    });

    it('renders login page correctly', () => {
        const { container } = render(
            <Providers store={store}>
                <LoginPage />
            </Providers>
        );

        // Check basic structure
        expect(container.querySelector('.page--login')).toBeInTheDocument();
        expect(container.querySelector('.login-options')).toBeInTheDocument();

        // Check if all login options are present
        const loginOptions = container.querySelectorAll('.login-options--item');
        expect(loginOptions).toHaveLength(4);

        // Check for specific login options
        expect(container.textContent).toContain('ID-kaart');
        expect(container.textContent).toContain('Mobiil-ID');
        expect(container.textContent).toContain('Smart-ID');
        expect(container.textContent).toContain('eIDAS');
    });

    it('displays login button with correct form action in development', () => {
        const { container } = render(
            <Providers store={store}>
                <LoginPage />
            </Providers>
        );

        const form = container.querySelector('form');
        expect(form).toBeInTheDocument();
        expect(form.getAttribute('action')).toBe(`${VITE_URL}/connect/openid/et`);

        const button = container.querySelector('button[type="submit"]');
        expect(button).toBeInTheDocument();
        expect(button.textContent).toContain('Logi sisse');
    });

    it('shows logout message when user is logged out', () => {
        const logoutStore = createTestStore({
            user: {
                isLoggedOut: true,
                status: 200,
            },
        });

        const { container } = render(
            <Providers store={logoutStore}>
                <LoginPage />
            </Providers>
        );

        expect(container.querySelector('.message')).toBeInTheDocument();
    });

    it('does not show logout message when user is not logged out', () => {
        const { container } = render(
            <Providers store={store}>
                <LoginPage />
            </Providers>
        );

        expect(container.querySelector('.message')).not.toBeInTheDocument();
    });
});
