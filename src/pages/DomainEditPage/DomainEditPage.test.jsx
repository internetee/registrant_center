import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import DomainEditPage from './DomainEditPage';
import Providers from '../../__mocks__/Providers';
import domains from '../../__mocks__/domains';
import contacts from '../../__mocks__/contacts';
import user from '../../__mocks__/user';
import { updateContact } from '../../redux/reducers/contacts';

// Create modified domain with tech contact same as registrant
const testDomain = {
    ...domains[0],
    tech_contacts: [
        {
            name: domains[0].registrant.name,
            id: domains[0].registrant.id,
        },
    ],
};

vi.mock('react-router-dom', () => ({
    useParams: () => ({ id: testDomain.id }),
    useNavigate: vi.fn(),
}));

vi.mock('../../redux/reducers/contacts', () => ({
    fetchUpdateContacts: vi.fn(() => () => Promise.resolve()),
    updateContactsConfirm: vi.fn(() => () => Promise.resolve()),
    updateContact: vi.fn(() => () => Promise.resolve()),
}));

const createTestStore = (overrides = {}) => {
    const baseState = {
        domains: {
            data: {
                [testDomain.id]: {
                    ...testDomain,
                    contacts: {
                        [testDomain.registrant.id]: {
                            ...contacts.find((c) => c.id === testDomain.registrant.id),
                            roles: ['registrant', 'tech'],
                        },
                        [testDomain.admin_contacts[0].id]: {
                            ...contacts.find((c) => c.id === testDomain.admin_contacts[0].id),
                            roles: ['admin'],
                        },
                    },
                    isLockable: true,
                    isLocked: testDomain.locked_by_registrant_at !== null,
                },
            },
            error: null,
            isLoading: false,
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

describe('DomainEditPage', () => {
    let store;

    beforeEach(() => {
        store = createTestStore();
    });

    afterEach(() => {
        vi.clearAllMocks();
        delete window.__RUNTIME_CONFIG__;
    });

    it('renders correctly', () => {
        const { container } = render(
            <Providers store={store}>
                <DomainEditPage />
            </Providers>
        );

        // Basic structure checks
        expect(container.querySelector('.page--domain-edit')).toBeInTheDocument();
        expect(container.querySelector('.page--header')).toBeInTheDocument();
        expect(container.textContent).toContain(testDomain.name);

        const cards = container.querySelectorAll('.ui.card');
        expect(cards.length).toBeGreaterThan(0);
        expect(container.querySelector('input[type="email"]')).toBeInTheDocument();
        expect(container.querySelector('input[type="tel"]')).toBeInTheDocument();
    });

    it('shows loading state while fetching domain', () => {
        const loadingStore = createTestStore({
            domains: { isLoading: true },
        });

        const { container } = render(
            <Providers store={loadingStore}>
                <DomainEditPage />
            </Providers>
        );

        expect(container.querySelector('.loading')).toBeInTheDocument();
    });

    it('shows error message when domain fetch fails', () => {
        const errorStore = createTestStore({
            domains: {
                data: {},
                error: 'Failed to load domain',
                isLoading: false,
            },
        });

        const { container } = render(
            <Providers store={errorStore}>
                <DomainEditPage />
            </Providers>
        );

        expect(container.textContent).toContain('Domeeni ei leitud');
    });

    it('displays contact information correctly', () => {
        const { container } = render(
            <Providers store={store}>
                <DomainEditPage />
            </Providers>
        );

        // Check if registrant contact info is displayed
        const registrantContact = contacts.find((c) => c.id === testDomain.registrant.id);
        expect(container.textContent).toContain(registrantContact.name);
        expect(container.textContent).toContain(registrantContact.email);
        expect(container.textContent).toContain(registrantContact.phone);

        // Check if tech contact info is displayed
        const techContact = contacts.find((c) => c.id === testDomain.tech_contacts[0].id);
        expect(container.textContent).toContain(techContact.name);
    });

    it('shows confirmation dialog when trying to update contact', async () => {
        const { container, getByTestId } = render(
            <Providers store={store}>
                <DomainEditPage />
            </Providers>
        );

        // Find and fill a form field
        const emailInput = container.querySelector('input[type="email"]');
        fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

        // Find and click update button
        const updateButton = container.querySelector('button[type="submit"]');
        fireEvent.click(updateButton);

        // Wait for and check if confirmation dialog is shown
        await waitFor(() => {
            expect(getByTestId('confirmation-modal')).toBeInTheDocument();
        });

        // Now that we've confirmed the modal exists, check its elements
        const modal = getByTestId('confirmation-modal');
        expect(
            modal.querySelector('[data-test="close-change-contacts-modal"]')
        ).toBeInTheDocument();
        expect(modal.querySelector('[data-test="change-contacts"]')).toBeInTheDocument();
        expect(modal.querySelector('.changed-domains-list')).toBeInTheDocument();
    });

    it('handles form submission with org registrant', async () => {
        const orgContact = {
            id: 'org-contact-id',
            name: 'Org Contact',
            email: 'org@test.ee',
            phone: '123456',
            ident: { type: 'org', code: 'ORG123' },
            disclosed_attributes: [],
            registrant_publishable: false,
        };
        const orgDomain = {
            ...testDomain,
            registrant: {
                id: 'org-contact-id',
                name: 'Org Registrant',
            },
            contacts: {
                [orgContact.id]: {
                    ...orgContact,
                    roles: ['registrant'],
                },
            },
        };
        const orgStore = createTestStore({
            domains: {
                data: {
                    [orgDomain.id]: orgDomain,
                },
            },
            contacts: {
                data: {
                    ...Object.fromEntries(contacts.map((c) => [c.id, c])),
                    [orgContact.id]: orgContact,
                },
            },
            companies: {
                data: {
                    ORG123: {
                        id: 'ORG123',
                        name: 'Test Company',
                    },
                },
                ids: [],
                isLoading: false,
                message: null,
            },
        });

        const { container, getByTestId } = render(
            <Providers store={orgStore}>
                <DomainEditPage />
            </Providers>
        );

        await waitFor(() => {
            const emailInput = container.querySelector('input[type="email"]');
            expect(emailInput).toBeInTheDocument();
        });

        const emailInput = container.querySelector('input[type="email"]');
        if (emailInput) {
            fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

            const updateButton = container.querySelector('button[type="submit"]');
            if (updateButton && !updateButton.disabled) {
                fireEvent.click(updateButton);

                await waitFor(() => {
                    expect(getByTestId('confirmation-modal')).toBeInTheDocument();
                });
            }
        }
    });

    it('handles form submission with user ident contact', async () => {
        const userContact = {
            id: 'user-contact-id',
            name: 'User Contact',
            email: 'user@test.ee',
            phone: '123456',
            ident: { code: user.ident, type: 'priv' },
            disclosed_attributes: ['email'],
            registrant_publishable: true,
        };
        const userDomain = {
            ...testDomain,
            contacts: {
                [testDomain.registrant.id]: {
                    ...contacts.find((c) => c.id === testDomain.registrant.id),
                    roles: ['registrant'],
                },
                [userContact.id]: userContact,
            },
        };
        const userStore = createTestStore({
            domains: {
                data: {
                    [userDomain.id]: userDomain,
                },
            },
            contacts: {
                data: {
                    ...Object.fromEntries(contacts.map((c) => [c.id, c])),
                    [userContact.id]: userContact,
                },
            },
        });

        const { container } = render(
            <Providers store={userStore}>
                <DomainEditPage />
            </Providers>
        );

        const emailInput = container.querySelector('input[type="email"]');
        if (emailInput) {
            fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
            const updateButton = container.querySelector('button[type="submit"]');
            if (updateButton && !updateButton.disabled) {
                fireEvent.click(updateButton);
            }
        }
    });

    it('handles handleWhoIsChange correctly', async () => {
        const { container } = render(
            <Providers store={store}>
                <DomainEditPage />
            </Providers>
        );

        const emailInput = container.querySelector('input[type="email"]');
        fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

        await waitFor(() => {
            const updateButton = container.querySelector('button[type="submit"]');
            expect(updateButton).not.toBeDisabled();
        });
    });

    it('handles canceling confirmation dialog', async () => {
        const { container, getByTestId } = render(
            <Providers store={store}>
                <DomainEditPage />
            </Providers>
        );

        const emailInput = container.querySelector('input[type="email"]');
        fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

        const updateButton = container.querySelector('button[type="submit"]');
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(getByTestId('confirmation-modal')).toBeInTheDocument();
        });

        const cancelButton = container.querySelector('[data-test="close-change-contacts-modal"]');
        if (cancelButton) {
            fireEvent.click(cancelButton);
        }
    });

    it('renders correctly with org registrant', async () => {
        const orgContact = {
            id: 'org-registrant-id',
            name: 'Org Registrant',
            email: 'org@test.ee',
            phone: '123456',
            ident: { type: 'org', code: 'ORG123' },
            disclosed_attributes: [],
            registrant_publishable: false,
        };
        const orgDomain = {
            ...testDomain,
            registrant: orgContact,
            contacts: {
                [orgContact.id]: {
                    ...orgContact,
                    roles: ['registrant'],
                },
            },
        };
        const orgStore = createTestStore({
            domains: {
                data: {
                    [orgDomain.id]: orgDomain,
                },
            },
            contacts: {
                data: {
                    ...Object.fromEntries(contacts.map((c) => [c.id, c])),
                    [orgContact.id]: orgContact,
                },
            },
        });

        const { container } = render(
            <Providers store={orgStore}>
                <DomainEditPage />
            </Providers>
        );

        await waitFor(() => {
            expect(container.querySelector('.page--domain-edit')).toBeInTheDocument();
            expect(container.textContent).toContain(orgDomain.name);
        });
    });

    it('saves withdrawn disclosure consent and keeps system-disclosed attributes', async () => {
        window.__RUNTIME_CONFIG__ = { disclosurePolicyActiveFrom: '2000-01-01T00:00:00Z' };

        const registrantId = testDomain.registrant.id;
        const disclosedContact = {
            ...contacts.find((c) => c.id === registrantId),
            disclosed_attributes: ['email', 'phone'],
            system_disclosed_attributes: ['name'],
            registrant_publishable: false,
        };
        const disclosureStore = createTestStore({
            contacts: {
                data: {
                    ...Object.fromEntries(contacts.map((c) => [c.id, c])),
                    [registrantId]: disclosedContact,
                },
            },
        });

        const { container, getByTestId } = render(
            <Providers store={disclosureStore}>
                <DomainEditPage />
            </Providers>
        );

        let emailCheckbox;
        await waitFor(() => {
            emailCheckbox = container.querySelector(`#email-${registrantId}`);
            expect(emailCheckbox).toBeChecked();
        });

        // Withdraw consent for the previously disclosed email attribute
        fireEvent.click(emailCheckbox);

        const updateButton = container.querySelector('button[type="submit"]');
        await waitFor(() => {
            expect(updateButton).not.toBeDisabled();
        });
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(getByTestId('confirmation-modal')).toBeInTheDocument();
        });
        fireEvent.click(
            getByTestId('confirmation-modal').querySelector('[data-test="change-contacts"]')
        );

        await waitFor(() => {
            expect(updateContact).toHaveBeenCalled();
        });
        const [contactId, payload] = updateContact.mock.calls[0];
        expect(contactId).toBe(registrantId);
        expect(payload.disclosed_attributes).not.toContain('email');
        expect(payload.disclosed_attributes).toContain('phone');
        expect(payload.disclosed_attributes).toContain('name');
    });
});
