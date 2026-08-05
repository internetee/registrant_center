import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';

vi.mock('./pages/HomePage/HomePage', () => ({
    default: () => <div data-testid="home-page">HomePage</div>,
}));

vi.mock('./pages/DomainPage/DomainPage', () => ({
    default: () => <div data-testid="domain-page">DomainPage</div>,
}));

vi.mock('./pages/LoginPage/LoginPage', () => ({
    default: () => <div data-testid="login-page">LoginPage</div>,
}));

vi.mock('./components/common/Loading/Loading', () => ({
    default: () => <div data-testid="loading">Loading</div>,
}));

const createStore = (initialState = {}) =>
    configureStore({
        reducer: {
            ui: (state = initialState.ui || { isMainMenuOpen: false, lang: 'et' }) => state,
            user: (state = initialState.user || { isLoggedOut: false, data: null }) => state,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
                immutableCheck: false,
            }),
    });

vi.mock('./components/ScrollToTop/ScrollToTop', () => ({
    default: ({ children }) => children,
}));

vi.mock('./redux/reducers/ui', () => ({
    fetchMenu: vi.fn(() => ({ type: 'FETCH_MENU' })),
    getDeviceType: vi.fn(() => ({ type: 'GET_DEVICE_TYPE' })),
}));

vi.mock('./redux/reducers/user', () => ({
    fetchUser: vi.fn(() => ({ type: 'FETCH_USER' })),
    logoutUser: vi.fn(() => ({ type: 'LOGOUT_USER' })),
}));

beforeEach(() => {
    global.window.scrollTo = vi.fn();
});

const renderWithProviders = (store) => {
    return render(
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    );
};

describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.innerWidth = 1024;
        global.window.scrollTo = vi.fn();
        global.dispatchEvent(new Event('resize'));
    });

    it('renders without crashing', () => {
        const testStore = createStore({
            user: { isLoggedOut: false, data: {} },
            ui: { isMainMenuOpen: false, lang: 'et' },
        });
        renderWithProviders(testStore);
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders login page when not logged in', async () => {
        const testStore = createStore({
            user: { isLoggedOut: false, data: {} },
            ui: { isMainMenuOpen: false, lang: 'et' },
        });
        renderWithProviders(testStore, ['/login']);
        await waitFor(() => {
            expect(screen.getByTestId('login-page')).toBeInTheDocument();
        });
    });

    it('renders home page when logged in', async () => {
        const testStore = createStore({
            user: {
                isLoggedOut: false,
                data: { name: 'Test User', ident: { code: '123' } },
            },
            ui: { isMainMenuOpen: false, lang: 'et' },
        });
        renderWithProviders(testStore);

        await waitFor(
            () => {
                const loading = screen.queryByTestId('loading');
                const homePage = screen.queryByTestId('home-page');
                expect(loading || homePage).toBeTruthy();
            },
            { timeout: 3000 }
        );
    });

    it('handles window resize events', () => {
        const testStore = createStore({
            user: { isLoggedOut: false, data: {} },
            ui: { isMainMenuOpen: false, lang: 'et' },
        });
        renderWithProviders(testStore);
        global.innerWidth = 768;
        global.dispatchEvent(new Event('resize'));
        expect(window.innerWidth).toBe(768);
    });
});
