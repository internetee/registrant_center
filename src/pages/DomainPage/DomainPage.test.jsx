import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import DomainPage from './DomainPage';
import domains from '../../__mocks__/domains';
import Providers from '../../__mocks__/Providers';
import user from '../../__mocks__/user';
import contacts from '../../__mocks__/contacts';

// Mock window.scrollTo
global.scrollTo = vi.fn();

const mockDomain = {
    ...domains[0],
};

// Mock modules using factory functions
vi.mock('react-router-dom', () => {
    const React = require('react');
    const MockLink = React.forwardRef((props, ref) => {
        const { children, to, ...rest } = props;
        return (
            <a href={to} ref={ref} {...rest}>
                {children}
            </a>
        );
    });
    MockLink.displayName = 'MockLink';

    return {
        Link: MockLink,
        useParams: () => ({ id: domains[0].id }),
        useNavigate: () => vi.fn(),
    };
});

// Mock the domain actions
vi.mock('../../redux/reducers/domains', () => ({
    fetchDomain: vi.fn(),
    lockDomain: () => ({
        type: 'domains/lockDomain/fulfilled',
        payload: { ...mockDomain, isLocked: true },
    }),
    unlockDomain: () => ({
        type: 'domains/unlockDomain/fulfilled',
        payload: { ...mockDomain, isLocked: false },
    }),
}));

// Mock the access-events action (thunk); its dispatch is a no-op action in these tests
vi.mock('../../redux/reducers/accessEvents', () => ({
    fetchAccessEvents: () => ({ type: 'MOCK_FETCH_ACCESS_EVENTS' }),
}));

const createTestStore = (overrides = {}) => {
    const baseState = {
        ui: {
            uiElemSize: 'small',
            lang: 'et',
            menus: { main: [] },
            isMainMenuOpen: false,
        },
        user: {
            data: user,
            error: null,
        },
        domains: {
            data: {
                [mockDomain.id]: {
                    ...mockDomain,
                    contacts: {
                        [mockDomain.registrant.id]: {
                            ...contacts.find((c) => c.id === mockDomain.registrant.id),
                            roles: ['registrant', 'tech'],
                        },
                        [mockDomain.admin_contacts[0].id]: {
                            ...contacts.find((c) => c.id === mockDomain.admin_contacts[0].id),
                            roles: ['admin'],
                        },
                    },
                    isLockable: true,
                    isLocked: false,
                },
            },
            isLoading: false,
            error: null,
        },
        contacts: {
            data: {
                ...Object.fromEntries(contacts.map((contact) => [contact.id, contact])),
            },
            message: null,
        },
        companies: {
            data: {},
            ids: [],
            isLoading: null,
            message: null,
        },
        accessEvents: {
            data: {},
            isLoading: false,
            error: null,
        },
    };

    // Create reducers that handle domain actions
    const reducers = {
        ui: (state = { ...baseState.ui, ...overrides.ui }) => state,
        user: (state = { ...baseState.user, ...overrides.user }) => state,
        domains: (state = { ...baseState.domains, ...overrides.domains }, action) => {
            switch (action.type) {
                case 'domains/lockDomain/fulfilled':
                case 'domains/unlockDomain/fulfilled':
                    return {
                        ...state,
                        data: {
                            ...state.data,
                            [action.payload.id]: {
                                ...action.payload,
                                contacts: {
                                    [mockDomain.registrant.id]: {
                                        ...contacts.find((c) => c.id === mockDomain.registrant.id),
                                        roles: ['registrant', 'tech'],
                                    },
                                    [mockDomain.admin_contacts[0].id]: {
                                        ...contacts.find(
                                            (c) => c.id === mockDomain.admin_contacts[0].id
                                        ),
                                        roles: ['admin'],
                                    },
                                },
                            },
                        },
                    };
                default:
                    return state;
            }
        },
        contacts: (state = { ...baseState.contacts, ...overrides.contacts }) => state,
        companies: (state = { ...baseState.companies, ...overrides.companies }) => state,
        accessEvents: (state = { ...baseState.accessEvents, ...overrides.accessEvents }) => state,
    };

    return configureStore({
        reducer: reducers,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
                immutableCheck: false,
            }),
    });
};

describe('DomainPage', () => {
    let store;

    beforeEach(() => {
        store = createTestStore();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly with domain data', () => {
        const { container } = render(
            <Providers store={store}>
                <DomainPage />
            </Providers>
        );

        // Basic structure checks
        expect(container.querySelector('.page--domain')).toBeInTheDocument();
        expect(container.querySelector('.page--header')).toBeInTheDocument();

        // Check if domain data is displayed
        expect(container.textContent).toContain(mockDomain.name);
        expect(container.textContent).toContain(mockDomain.registrant.name);
        expect(container.textContent).toContain(mockDomain.registrar.name);
    });

    it('renders error message when domain not found', () => {
        const errorStore = createTestStore({
            domains: {
                data: {},
                error: 'Domain not found',
                isLoading: false,
            },
        });

        const { container } = render(
            <Providers store={errorStore}>
                <DomainPage />
            </Providers>
        );

        expect(container.querySelector('.page--message')).toBeInTheDocument();
        expect(container.textContent).toContain('Domeeni ei leitud');
    });

    it('handles domain lock action correctly', async () => {
        const { container, getByTestId } = render(
            <Providers store={store}>
                <DomainPage />
            </Providers>
        );

        // Find and click lock button
        const lockButton = container.querySelector('button[data-test="open-lock-modal"]');
        fireEvent.click(lockButton);

        // Wait for and check if confirmation dialog is shown
        await waitFor(() => {
            expect(getByTestId('lock-confirmation-modal')).toBeInTheDocument();
        });

        const modal = getByTestId('lock-confirmation-modal');

        // Confirm in modal
        const confirmButton = modal.querySelector('button[data-test="lock-domain"]');
        fireEvent.click(confirmButton);

        // Wait for and check lock result
        await waitFor(() => {
            expect(store.getState().domains.data[mockDomain.id].isLocked).toBe(true);
        });
    });

    it('handles domain unlock action correctly', async () => {
        const lockedStore = createTestStore({
            domains: {
                data: {
                    [mockDomain.id]: {
                        ...mockDomain,
                        contacts: {
                            [mockDomain.registrant.id]: {
                                ...contacts.find((c) => c.id === mockDomain.registrant.id),
                                roles: ['registrant', 'tech'],
                            },
                            [mockDomain.admin_contacts[0].id]: {
                                ...contacts.find((c) => c.id === mockDomain.admin_contacts[0].id),
                                roles: ['admin'],
                            },
                        },
                        isLockable: true,
                        isLocked: true,
                    },
                },
            },
        });

        const { container, getByTestId } = render(
            <Providers store={lockedStore}>
                <DomainPage />
            </Providers>
        );

        // Find and click unlock button
        const unlockButton = container.querySelector('button[data-test="open-unlock-modal"]');
        fireEvent.click(unlockButton);

        // Wait for and check if confirmation dialog is shown
        await waitFor(() => {
            expect(getByTestId('lock-confirmation-modal')).toBeInTheDocument();
        });

        const modal = getByTestId('lock-confirmation-modal');

        // Confirm in modal
        const confirmButton = modal.querySelector('button[data-test="lock-domain"]');
        fireEvent.click(confirmButton);

        // Wait for and check unlock result
        await waitFor(() => {
            expect(lockedStore.getState().domains.data[mockDomain.id].isLocked).toBe(false);
        });
    });

    it('displays nameservers when available', () => {
        const { container } = render(
            <Providers store={store}>
                <DomainPage />
            </Providers>
        );

        expect(container.textContent).toContain('ns1.test.ee');
        expect(container.textContent).toContain('ns2.test.ee');
    });

    it('displays contacts information correctly', () => {
        const { container } = render(
            <Providers store={store}>
                <DomainPage />
            </Providers>
        );

        expect(container.textContent).toContain('Tehniline');
        expect(container.textContent).toContain('test@tech.ee');
        expect(container.textContent).toContain('Admin');
        expect(container.textContent).toContain('test@admin.ee');
    });

    describe('access-events panel', () => {
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

        it('renders exactly the three returned fields and no withheld data', () => {
            const eventsStore = createTestStore({
                accessEvents: {
                    data: { [mockDomain.id]: sampleEvents },
                    isLoading: false,
                    error: null,
                },
            });

            const { container } = render(
                <Providers store={eventsStore}>
                    <DomainPage />
                </Providers>
            );

            // panel title (et translation) + the three fields
            expect(container.textContent).toContain('Kes on minu andmeid vaadanud');
            expect(container.textContent).toContain('Politsei- ja Piirivalveamet');
            expect(container.textContent).toContain('law_enforcement');
            expect(container.textContent).toContain('court');
            expect(container.textContent).toContain('2026-07-10T12:00:00+03:00');

            // withheld fields must never appear in the DOM
            const withheld = [
                'accessor_name',
                'grant_ref',
                'request_id',
                'caller_ip',
                'result_code',
            ];
            withheld.forEach((field) => {
                expect(container.textContent).not.toContain(field);
            });
        });

        it('uses a semantic header with descriptive columns and uniquely-keyed rows (a11y)', () => {
            const eventsStore = createTestStore({
                accessEvents: {
                    data: { [mockDomain.id]: sampleEvents },
                    isLoading: false,
                    error: null,
                },
            });

            const { container } = render(
                <Providers store={eventsStore}>
                    <DomainPage />
                </Providers>
            );

            // Find the panel table by its column headers (et translations)
            const headerCells = Array.from(container.querySelectorAll('thead th')).map((th) =>
                th.textContent.trim()
            );
            expect(headerCells).toContain('Asutus');
            expect(headerCells).toContain('Kategooria');
            expect(headerCells).toContain('Vaatamise aeg');

            // one row per event, each rendered (unique keys => both rows present)
            const bodyRows = container.querySelectorAll('tbody tr');
            const accessRows = Array.from(bodyRows).filter(
                (tr) =>
                    tr.textContent.includes('law_enforcement') || tr.textContent.includes('court')
            );
            expect(accessRows).toHaveLength(2);
        });

        it('renders the empty-state message (not an error/blank) when there are no events', () => {
            const emptyStore = createTestStore({
                accessEvents: {
                    data: { [mockDomain.id]: [] },
                    isLoading: false,
                    error: null,
                },
            });

            const { container } = render(
                <Providers store={emptyStore}>
                    <DomainPage />
                </Providers>
            );

            expect(container.textContent).toContain('Kes on minu andmeid vaadanud');
            expect(container.textContent).toContain(
                'Ükski asutus ei ole selle domeeni andmeid vaadanud.'
            );
        });
    });
});
