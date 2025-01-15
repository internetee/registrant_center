import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import HomePage from './HomePage';
import Providers from '../../__mocks__/Providers';
import domains from '../../__mocks__/domains';
import user from '../../__mocks__/user';

// Mock the domains actions
vi.mock('../../redux/reducers/domains', () => ({
    fetchDomains: vi.fn(() => ({
        type: 'domains/fetchDomains/fulfilled',
        payload: { domains: mockDomains, count: mockDomains.length, total: mockDomains.length },
    })),
}));

// Mock the filters actions
vi.mock('../../redux/reducers/filters', () => ({
    setSortByRoles: vi.fn(() => ({
        type: 'SET_SORT_BY_ROLES',
    })),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

const mockDomains = domains;

const createTestStore = (overrides = {}) => {
    const baseState = {
        domains: {
            data: {
                domains: Object.fromEntries(mockDomains.map((domain) => [domain.id, domain])),
                count: mockDomains.length,
                total: mockDomains.length,
            },
            error: null,
            ...overrides.domains,
        },
        ui: {
            uiElemSize: 'small',
            lang: 'en',
            menus: { main: [] },
            isMainMenuOpen: false,
            ...overrides.ui,
        },
        user: {
            data: user,
            error: null,
            ...overrides.user,
        },
        filters: {
            isTech: false,
            ...overrides.filters,
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

describe('HomePage', () => {
    let store;

    beforeEach(() => {
        vi.clearAllMocks();
        store = createTestStore();
    });

    it('renders correctly with user data and domains', () => {
        const { container } = render(
            <Providers store={store}>
                <HomePage />
            </Providers>
        );

        // Basic structure checks
        expect(container.querySelector('.page--dashboard')).toBeInTheDocument();

        // Check if user name is displayed
        const userName = `${user.first_name} ${user.last_name} (${user.ident})`;
        expect(container.textContent).toContain(userName);

        // Check if quicklinks are present
        expect(container.querySelector('.quicklinks')).toBeInTheDocument();
        expect(container.querySelector('a[href="/companies"]')).toBeInTheDocument();
        expect(container.querySelector('a[href="/whois"]')).toBeInTheDocument();
    });

    it('displays domain list when domains are available', () => {
        const { container, getByTestId } = render(
            <Providers store={store}>
                <HomePage />
            </Providers>
        );

        // Check if domain list is present
        expect(getByTestId('domains-list-wrap')).toBeInTheDocument();

        // Check if domains are displayed
        mockDomains.forEach((domain) => {
            expect(container.textContent).toContain(domain.name);
        });
    });

    it('fetches domains when no domains exist', async () => {
        const emptyStore = createTestStore({
            domains: {
                data: {
                    domains: {},
                    count: 0,
                    total: 0,
                },
            },
        });

        const { container, getByTestId } = render(
            <Providers store={emptyStore}>
                <HomePage />
            </Providers>
        );

        await waitFor(() => {
            expect(container.querySelector('.loading')).not.toBeInTheDocument();
        });

        expect(getByTestId('domains-list-wrap')).toBeInTheDocument();
    });
});
