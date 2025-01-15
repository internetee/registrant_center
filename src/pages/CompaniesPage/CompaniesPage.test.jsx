import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import CompaniesPage from './CompaniesPage';
import Providers from '../../__mocks__/Providers';
import companiesMock from '../../__mocks__/companies';
import user from '../../__mocks__/user';

const mockCompanies = companiesMock.companies;

// Mock the companies actions
vi.mock('../../redux/reducers/companies', () => ({
    fetchCompanies: () => ({
        type: 'companies/fetchCompanies/fulfilled',
        payload: mockCompanies,
    }),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

const createTestStore = (overrides = {}) => {
    const baseState = {
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
        },
        user: {
            data: user,
            isLoading: false,
            error: null,
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

describe('CompaniesPage', () => {
    let store;

    beforeEach(() => {
        store = createTestStore();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        const { container } = render(
            <Providers store={store}>
                <CompaniesPage />
            </Providers>
        );

        // Basic structure checks
        expect(container.querySelector('.page--companies')).toBeInTheDocument();
        expect(container.querySelector('.page--header')).toBeInTheDocument();

        // Check if companies are displayed
        mockCompanies.forEach((company) => {
            expect(container.textContent).toContain(company.name);
            expect(container.textContent).toContain(company.registry_no);
        });
    });

    it('shows loading state while fetching companies', () => {
        const loadingStore = createTestStore({
            companies: { isLoading: true },
        });

        const { container } = render(
            <Providers store={loadingStore}>
                <CompaniesPage />
            </Providers>
        );

        expect(container.querySelector('.loading')).toBeInTheDocument();
    });

    it('shows empty state when no companies exist', () => {
        const emptyStore = createTestStore({
            companies: {
                data: {},
                ids: [],
                isLoading: false,
            },
        });

        const { container } = render(
            <Providers store={emptyStore}>
                <CompaniesPage />
            </Providers>
        );

        expect(container.textContent).toContain(
            'Äriregistri andmetel ei kuulu Teile ühtegi ettevõtet'
        );
    });

    it('filters companies based on search input', async () => {
        const { container } = render(
            <Providers store={store}>
                <CompaniesPage />
            </Providers>
        );

        // Find and fill the search input
        const searchInput = container.querySelector('input[type="text"]');
        fireEvent.change(searchInput, { target: { value: 'Juku' } });

        // Click search button
        const searchButton = container.querySelector('button[type="submit"]');
        fireEvent.click(searchButton);

        // Wait for and check filtered results
        await waitFor(() => {
            expect(container.textContent).toContain('Juku Mänguasjapood OÜ');
            expect(container.textContent).not.toContain('XS Mänguasjad OÜ');
        });
    });

    it('resets search when reset button is clicked', async () => {
        const { container } = render(
            <Providers store={store}>
                <CompaniesPage />
            </Providers>
        );

        // First search for something
        const searchInput = container.querySelector('input[type="text"]');
        fireEvent.change(searchInput, { target: { value: 'Juku' } });
        const searchButton = container.querySelector('button[type="submit"]');
        fireEvent.click(searchButton);

        // Click reset button
        const resetButton = container.querySelector('button[type="reset"]');
        fireEvent.click(resetButton);

        // Check if all companies are shown again
        await waitFor(() => {
            mockCompanies.forEach((company) => {
                expect(container.textContent).toContain(company.name);
            });
        });
    });
});
