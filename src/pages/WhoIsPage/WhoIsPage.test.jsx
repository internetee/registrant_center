import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import WhoIsPage from './WhoIsPage';
import Providers from '../../__mocks__/Providers';
import domains from '../../__mocks__/domains';
import contacts from '../../__mocks__/contacts';
import companiesMock from '../../__mocks__/companies';
import user from '../../__mocks__/user';
import { parseDomain } from '../../redux/reducers/domains';

const mockCompanies = companiesMock.companies;
const mockDomains = domains;

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

// Mock the domain actions
vi.mock('../../redux/reducers/domains', () => ({
    fetchDomains: vi.fn(() => (dispatch) => {
        dispatch({ type: 'FETCH_DOMAINS_REQUEST' });
        return Promise.resolve();
    }),
    parseDomain: vi.fn((domain) => ({
        ...domain,
        name: domain.name,
        contacts: [
            ...(domain.registrant ? [domain.registrant] : []),
            ...(domain.admin_contacts || []),
            ...(domain.tech_contacts || []),
        ],
        isLockable: !domain.statuses?.includes('serverRegistrantChangeProhibited'),
        isLocked: Boolean(domain.locked_by_registrant_at),
    })),
}));

// Mock the contact actions
vi.mock('../../redux/reducers/contacts', () => ({
    fetchContacts: vi.fn(() => (dispatch) => {
        dispatch({ type: 'FETCH_CONTACTS_REQUEST' });
        return Promise.resolve();
    }),
    fetchUpdateContacts: vi.fn(() => (dispatch) => {
        dispatch({ type: 'FETCH_UPDATE_CONTACTS_REQUEST' });
        return Promise.resolve();
    }),
    updateContactsConfirm: vi.fn(() => (dispatch) => {
        dispatch({ type: 'UPDATE_CONTACTS_REQUEST' });
        return Promise.resolve();
    }),
    updateContact: vi.fn(() => (dispatch) => {
        dispatch({ type: 'UPDATE_CONTACT_REQUEST' });
        return Promise.resolve();
    }),
}));

// Mock the company actions
vi.mock('../../redux/reducers/companies', () => ({
    fetchCompanies: vi.fn(() => (dispatch) => {
        dispatch({ type: 'FETCH_COMPANIES_REQUEST' });
        return Promise.resolve();
    }),
}));

const createTestStore = (overrides = {}) => {
    const baseState = {
        domains: {
            data: {
                domains: mockDomains.reduce(
                    (acc, domain) => ({
                        ...acc,
                        [domain.id]: parseDomain(domain),
                    }),
                    {}
                ),
                count: mockDomains.length,
                total: mockDomains.length,
            },
            ids: mockDomains.map((domain) => domain.id),
            isLoading: false,
            message: null,
            ...overrides.domains,
        },
        contacts: {
            data: contacts.reduce(
                (acc, contact) => ({
                    ...acc,
                    [contact.id]: contact,
                }),
                {}
            ),
            message: null,
            ...overrides.contacts,
        },
        companies: {
            data: Object.fromEntries(
                mockCompanies.map((company) => [company.registry_no, company])
            ),
            ids: mockCompanies.map((company) => company.registry_no),
            isLoading: false,
            message: null,
            ...overrides.companies,
        },
        ui: {
            uiElemSize: 'small',
            lang: 'et',
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

describe('WhoIsPage', () => {
    let store;

    beforeEach(() => {
        store = createTestStore();
    });

    it('renders whois page correctly', () => {
        const { container } = render(
            <Providers store={store}>
                <WhoIsPage />
            </Providers>
        );

        // Check basic structure
        expect(container.querySelector('.page--whois')).toBeInTheDocument();
        expect(container.querySelector('.form-filter')).toBeInTheDocument();
        expect(container.querySelector('.search-field')).toBeInTheDocument();
    });

    it('displays domains list when domains are available', () => {
        const { container } = render(
            <Providers store={store}>
                <WhoIsPage />
            </Providers>
        );

        // Check if domains are displayed
        domains.forEach((domain) => {
            expect(container.textContent).toContain(domain.name);
        });
    });

    it('shows empty state when no domains exist', async () => {
        const emptyStore = createTestStore({
            domains: {
                data: { domains: {} },
                ids: [],
            },
        });

        const { container } = render(
            <Providers store={emptyStore}>
                <WhoIsPage />
            </Providers>
        );

        await waitFor(() => {
            expect(container.querySelector('.loading')).not.toBeInTheDocument();
        });

        expect(container.textContent).toContain('Teile ei kuulu hetkel ühtegi domeeni');
    });

    it('filters domains based on search input', async () => {
        const { container } = render(
            <Providers store={store}>
                <WhoIsPage />
            </Providers>
        );

        // Find and fill the search input
        const searchInput = container.querySelector('input[type="text"]');
        fireEvent.change(searchInput, { target: { value: mockDomains[1].name } });

        // Click search button
        const searchButton = container.querySelector('button[type="submit"]');
        fireEvent.click(searchButton);

        // Wait for and check filtered results
        await waitFor(() => {
            const domainRows = container.querySelectorAll('tbody tr');
            expect(domainRows.length).toBe(1);
            expect(container.textContent).toContain(mockDomains[1].name);
        });
    });

    it('resets search when reset button is clicked', async () => {
        const { container } = render(
            <Providers store={store}>
                <WhoIsPage />
            </Providers>
        );

        // First search for something
        const searchInput = container.querySelector('input[type="text"]');
        fireEvent.change(searchInput, { target: { value: domains[0].name } });
        const searchButton = container.querySelector('button[type="submit"]');
        fireEvent.click(searchButton);

        // Click reset button
        const resetButton = container.querySelector('button[type="reset"]');
        fireEvent.click(resetButton);

        // Check if all domains are shown again
        await waitFor(() => {
            domains.forEach((domain) => {
                expect(container.textContent).toContain(domain.name);
            });
        });
    });
});
