import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router';
import { IntlProvider } from 'react-intl';
import MainHeader from './MainHeader';

vi.mock('react-responsive', () => ({
    default: ({ children, query }) => {
        const isDesktop = query.includes('min-width: 1224px');
        const isMobile = query.includes('max-width: 1223px');
        if (isDesktop || isMobile) {
            return children;
        }
        return null;
    },
}));

vi.mock('../MainMenu/MainMenu', () => ({
    default: ({ items, user }) => (
        <nav data-testid="main-menu">
            {items.length} items, user: {user?.ident?.code || 'none'}
        </nav>
    ),
}));

vi.mock('../CookieConsent/CookieConsent', () => ({
    default: () => <div data-testid="cookie-consent">Cookie Consent</div>,
}));

const messages = {
    'header.public_portal': 'Public Portal',
    'header.logOut': 'Log out',
};

const createStore = (initialState = {}) =>
    configureStore({
        reducer: {
            ui: (state = initialState.ui || { lang: 'et', menus: { main: [] } }) => state,
            user: (state = initialState.user || { data: {} }) => state,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
                immutableCheck: false,
            }),
    });

const Wrapper = ({ children, store }) => (
    <Provider store={store}>
        <IntlProvider locale="et" messages={messages}>
            <BrowserRouter>{children}</BrowserRouter>
        </IntlProvider>
    </Provider>
);

describe('MainHeader', () => {
    let originalInnerWidth;
    let originalScrollTo;

    beforeEach(() => {
        originalInnerWidth = window.innerWidth;
        originalScrollTo = window.scrollTo;
        window.innerWidth = 1920;
        window.scrollTo = vi.fn();
        vi.clearAllMocks();
    });

    afterEach(() => {
        window.innerWidth = originalInnerWidth;
        window.scrollTo = originalScrollTo;
        vi.clearAllMocks();
    });

    it('renders logo', () => {
        const store = createStore();
        const { container } = render(
            <Wrapper store={store}>
                <MainHeader />
            </Wrapper>
        );
        const logo = container.querySelector('a.logo');
        expect(logo).toHaveAttribute('href', 'https://internet.ee');
    });

    it('handles scroll event and fixes header', () => {
        const store = createStore();
        const { container } = render(
            <Wrapper store={store}>
                <MainHeader />
            </Wrapper>
        );
        const header = container.querySelector('header.main-header');
        expect(header).toBeInTheDocument();

        const mockScrollingElement = { scrollTop: 100 };
        Object.defineProperty(document, 'scrollingElement', {
            value: mockScrollingElement,
            writable: true,
            configurable: true,
        });

        const scrollEvent = new Event('scroll', { bubbles: true });
        Object.defineProperty(scrollEvent, 'target', {
            value: { scrollingElement: mockScrollingElement },
            writable: false,
            configurable: true,
        });

        window.dispatchEvent(scrollEvent);

        expect(header).toBeInTheDocument();
    });

    it('handles logout button click', () => {
        const store = createStore({
            user: { data: { ident: { code: '123' } } },
        });
        const { getAllByRole } = render(
            <Wrapper store={store}>
                <MainHeader />
            </Wrapper>
        );
        const logoutButtons = getAllByRole('button', { name: /log out/i });
        expect(logoutButtons.length).toBeGreaterThan(0);
        fireEvent.click(logoutButtons[0]);
    });

    it('handles language switch', () => {
        const store = createStore();
        const { getAllByRole } = render(
            <Wrapper store={store}>
                <MainHeader />
            </Wrapper>
        );
        const etButtons = getAllByRole('button', { name: /eesti keeles/i });
        const enButtons = getAllByRole('button', { name: /in english/i });

        expect(etButtons.length).toBeGreaterThan(0);
        expect(enButtons.length).toBeGreaterThan(0);

        const firstEtButton = etButtons[0];
        const firstEnButton = enButtons[0];

        expect(firstEtButton.closest('li')).toHaveClass('active');
        expect(firstEnButton.closest('li')).not.toHaveClass('active');

        fireEvent.click(firstEnButton);
    });

    it('toggles main menu', () => {
        const store = createStore();
        const { container } = render(
            <Wrapper store={store}>
                <MainHeader />
            </Wrapper>
        );
        const menuButtons = container.querySelectorAll('button.btn.btn-menu');
        expect(menuButtons.length).toBeGreaterThan(0);
        fireEvent.click(menuButtons[0]);
    });

    it('renders portal menu with items', () => {
        const store = createStore({
            ui: {
                lang: 'et',
                menus: {
                    main: [
                        {
                            id: 1,
                            hidden: false,
                            language: { code: 'et' },
                            node: { id: 2133844, position: 1 },
                            title: 'Test Item',
                            public_url: 'https://test.ee',
                        },
                    ],
                },
            },
        });
        render(
            <Wrapper store={store}>
                <MainHeader />
            </Wrapper>
        );
        expect(screen.getAllByText('Public Portal').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Test Item').length).toBeGreaterThan(0);
    });

    it('renders cookie consent', () => {
        const store = createStore();
        render(
            <Wrapper store={store}>
                <MainHeader />
            </Wrapper>
        );
        expect(screen.getByTestId('cookie-consent')).toBeInTheDocument();
    });
});
