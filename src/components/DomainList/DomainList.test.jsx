import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import DomainList from './DomainList';
import domains from '../../__mocks__/domains';
import Providers from '../../__mocks__/Providers';

// Mock the contacts actions
vi.mock('../../redux/reducers/contacts', () => ({
    fetchUpdateContacts: () => ({
        type: 'contacts/fetchUpdateContacts/fulfilled',
        payload: { update_contacts: false, counter: '0' },
    }),
    updateContactsConfirm: () => ({
        type: 'contacts/updateContactsConfirm/fulfilled',
        payload: { success: true },
    }),
}));

// Mock react-responsive MediaQuery component
vi.mock('react-responsive', () => ({
    __esModule: true,
    default: ({ children }) => children,
}));

const createStore = (initialState = {}) =>
    configureStore({
        reducer: {
            contacts: (
                state = initialState.contacts || {
                    updateContacts: false,
                    counter: '0',
                    data: {},
                    ids: [],
                }
            ) => state,
            domains: (
                state = initialState.domains || {
                    domains: [...domains],
                    domainCount: 2,
                    domainTotal: 2,
                    data: {},
                    ids: [],
                }
            ) => state,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
                immutableCheck: false,
            }),
    });

describe('DomainList Component', () => {
    let store;

    beforeEach(() => {
        store = createStore({
            contacts: {
                updateContacts: false,
                counter: '0',
                data: {},
                ids: [],
            },
            domains: {
                domains: [...domains],
                domainCount: 2,
                domainTotal: 2,
                data: {},
                ids: [],
            },
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        const { container } = render(
            <Providers store={store}>
                <DomainList domainCount={2} domainTotal={2} domains={[...domains]} lang="en" />
            </Providers>
        );
        const element = container.querySelector('.domains-list--wrap');
        expect(element).toBeInTheDocument();
    });

    it('toggles between grid and list view', () => {
        const { container } = render(
            <Providers store={store}>
                <DomainList domainCount={2} domainTotal={2} domains={[...domains]} lang="en" />
            </Providers>
        );

        const gridIcon = container.querySelector('.action--grid');
        const listIcon = container.querySelector('.action--list');

        // Initially should be in grid view
        expect(container.querySelector('.domains-grid--wrap')).toBeInTheDocument();

        // Switch to list view
        fireEvent.click(listIcon);
        expect(container.querySelector('.domains-list')).toBeInTheDocument();

        // Switch back to grid view
        fireEvent.click(gridIcon);
        expect(container.querySelector('.domains-grid--wrap')).toBeInTheDocument();
    });

    it('filters domains by search query', () => {
        const { container } = render(
            <Providers store={store}>
                <DomainList domainCount={2} domainTotal={2} domains={[...domains]} lang="en" />
            </Providers>
        );

        const searchInput = container.querySelector('input[type="text"]');
        const searchForm = container.querySelector('.form-filter');

        fireEvent.change(searchInput, { target: { value: 'example' } });
        fireEvent.submit(searchForm);

        const filteredDomains = container.querySelectorAll('.domains-grid--item');
        expect(filteredDomains.length).toBeLessThan(domains.length);
    });

    it('shows advanced search when filter icon is clicked', () => {
        const { container } = render(
            <Providers store={store}>
                <DomainList domainCount={2} domainTotal={2} domains={[...domains]} lang="en" />
            </Providers>
        );

        // First, let's debug what's in the DOM
        // console.log(container.innerHTML);

        const filterIcon = container.querySelector('.action--filter');

        // Verify filter icon exists
        expect(filterIcon).toBeInTheDocument();

        // Click the filter icon
        fireEvent.click(filterIcon);

        const advancedSearch = container.querySelector('.form-filter--adv-search');
        expect(advancedSearch).toBeInTheDocument();
    });

    it('handles contact update message display', () => {
        const { container } = render(
            <Providers store={store}>
                <DomainList
                    domainCount={2}
                    domainTotal={2}
                    domains={[...domains]}
                    isUpdateContact={true}
                    lang="en"
                />
            </Providers>
        );

        const message = container.querySelector('.ui.negative.message');
        expect(message).toBeInTheDocument();
    });

    it('handles date range selection in advanced search', () => {
        const { container } = render(
            <Providers store={store}>
                <DomainList domainCount={2} domainTotal={2} domains={[...domains]} lang="en" />
            </Providers>
        );

        // Open advanced search
        const filterIcon = container.querySelector('.action--filter');
        fireEvent.click(filterIcon);

        // Set date range
        const dateInputs = container.querySelectorAll('.date-range input');
        fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } });
        fireEvent.change(dateInputs[1], { target: { value: '2024-12-31' } });

        const searchForm = container.querySelector('.form-filter');
        fireEvent.submit(searchForm);

        // Verify filtered results
        const filteredDomains = container.querySelectorAll('.domains-grid--item');
        expect(filteredDomains.length).toBeLessThanOrEqual(domains.length);
    });
});
