import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import WhoIsEdit from './WhoIsEdit';
import mockUser from '../../__mocks__/user';
import mockDomains from '../../__mocks__/domains';
import mockContacts from '../../__mocks__/contacts';
import Helpers from '../../utils/helpers';
import Providers from '../../__mocks__/Providers';
import { parseDomain } from '../../redux/reducers/domains';

describe('WhoIsEdit Component', () => {
    let store;

    const parsedDomains = mockDomains.map((domain) => parseDomain(domain, true));
    const domain = parsedDomains[0];

    const createStore = (initialState = {}) =>
        configureStore({
            reducer: {
                contacts: (
                    state = initialState.contacts || {
                        data: mockContacts,
                        ids: Object.keys(mockContacts),
                    }
                ) => state,
                domains: (
                    state = initialState.domains || {
                        data: {
                            count: parsedDomains.length,
                            domains: parsedDomains.reduce(
                                (acc, domain) => ({
                                    ...acc,
                                    [domain.id]: domain,
                                }),
                                {}
                            ),
                            total: parsedDomains.length,
                        },
                        ids: parsedDomains.map((domain) => domain.id),
                        isLoading: false,
                    }
                ) => state,
                ui: (
                    state = initialState.ui || {
                        uiElemSize: 'huge',
                    }
                ) => state,
                user: (
                    state = initialState.user || {
                        data: mockUser,
                    }
                ) => state,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware({
                    serializableCheck: false,
                    immutableCheck: false,
                }),
        });

    const defaultProps = {
        contacts: Helpers.getUserContacts(mockUser, domain, mockContacts),
        domain,
        user: mockUser,
        isOpen: true,
        checkAll: true,
        onChange: vi.fn(),
    };

    beforeEach(() => {
        store = createStore();
    });

    const renderWhoIsEdit = (props = {}) => {
        return render(
            <Providers store={store}>
                <WhoIsEdit {...defaultProps} {...props} />
            </Providers>
        );
    };

    describe('Basic Rendering', () => {
        it('should render the component correctly', () => {
            const { container, getByText } = renderWhoIsEdit();

            // Check if the component renders
            expect(container.firstChild).toBeInTheDocument();

            // Check for specific elements we expect to see
            expect(getByText('Roll:')).toBeInTheDocument();

            // Check for form group
            const formGroup = container.querySelector('.adv-field-group');
            expect(formGroup).toBeInTheDocument();
        });

        it('should return null when no contacts', () => {
            const { container } = renderWhoIsEdit({ contacts: {} });
            expect(container.firstChild).toBeNull();
        });

        it('should respect isOpen prop', () => {
            const { container } = renderWhoIsEdit({ isOpen: true });
            const formGroup = container.querySelector('.adv-field-group');
            expect(formGroup).toHaveClass('u-visible');
        });
    });

    describe('Contact Information Display', () => {
        it('should display contact roles correctly', () => {
            const { getAllByText } = renderWhoIsEdit();
            const roleLabels = getAllByText('Roll:');
            expect(roleLabels).toBeTruthy();
        });

        it('should display contact names', () => {
            const { getByText } = renderWhoIsEdit();
            expect(getByText(/Test Registrant/)).toBeInTheDocument();
        });

        it('should display contact emails', () => {
            const { getByText } = renderWhoIsEdit();
            expect(getByText(/test@registrant.ee/)).toBeInTheDocument();
        });
    });

    describe('Checkbox Functionality', () => {
        it('should handle phone disclosure checkbox change', () => {
            const onChange = vi.fn();
            // Phone checkbox is never disabled, so we don't need to modify domain
            const { container } = renderWhoIsEdit({ onChange });

            const phoneCheckbox = container.querySelector('input[name="phone"]');
            expect(phoneCheckbox).not.toBeDisabled();
            fireEvent.click(phoneCheckbox);

            expect(onChange).toHaveBeenCalled();
        });

        it('should handle registrant publishable checkbox change', () => {
            const onChange = vi.fn();
            const { container } = renderWhoIsEdit({ onChange });

            const publishableCheckbox = container.querySelector(
                'input[name="registrant_publishable"]'
            );
            expect(publishableCheckbox).not.toBeDisabled();
            fireEvent.click(publishableCheckbox);

            expect(onChange).toHaveBeenCalled();
        });
    });

    describe('Organization Handling', () => {
        it('should disable name and email checkboxes for organization contacts', () => {
            const domainWithOrg = {
                ...defaultProps.domain,
                registrant: {
                    ...defaultProps.domain.registrant,
                    org: 'true',
                },
            };

            const { container } = renderWhoIsEdit({ domain: domainWithOrg });

            const nameCheckboxes = container.querySelectorAll('input[name="name"]');
            const emailCheckboxes = container.querySelectorAll('input[name="email"]');

            expect([...nameCheckboxes].every((cb) => cb.disabled)).toBe(true);
            expect([...emailCheckboxes].every((cb) => cb.disabled)).toBe(true);
        });

        it('should auto-check name and email for organization contacts', () => {
            const domainWithOrg = {
                ...defaultProps.domain,
                registrant: {
                    ...defaultProps.domain.registrant,
                    org: 'true',
                },
            };

            const { container } = renderWhoIsEdit({ domain: domainWithOrg });

            const nameCheckboxes = container.querySelectorAll('input[name="name"]');
            const emailCheckboxes = container.querySelectorAll('input[name="email"]');

            expect([...nameCheckboxes].every((cb) => cb.checked)).toBe(true);
            expect([...emailCheckboxes].every((cb) => cb.checked)).toBe(true);
        });
    });

    describe('Check All Functionality', () => {
        // it('should show check all checkbox when enabled and not company', () => {
        //     const nonOrgContacts = {
        //         [Object.keys(defaultProps.contacts)[0]]: {
        //             ...Object.values(defaultProps.contacts)[0],
        //             ident: {
        //                 ...Object.values(defaultProps.contacts)[0].ident,
        //                 type: 'priv'
        //             }
        //         }
        //     };

        //     const { container } = renderWhoIsEdit({
        //         checkAll: true,
        //         domain: nonOrgDomain,
        //         contacts: nonOrgContacts
        //     });

        //     const checkAllBox = container.querySelector('.checkbox.large');
        //     expect(checkAllBox).toBeInTheDocument();
        // });

        it('should not show check all checkbox when disabled', () => {
            const { container } = renderWhoIsEdit({ checkAll: false });
            const checkAllBox = container.querySelector('.checkbox.large');
            expect(checkAllBox).not.toBeInTheDocument();
        });

        it('should not show check all checkbox for company', () => {
            const orgDomain = {
                ...defaultProps.domain,
                registrant: {
                    ...defaultProps.domain.registrant,
                    org: 'true',
                },
            };

            const { container } = renderWhoIsEdit({
                checkAll: true,
                domain: orgDomain,
            });

            const checkAllBox = container.querySelector('.checkbox.large');
            expect(checkAllBox).not.toBeInTheDocument();
        });
    });

    describe('Visibility Control', () => {
        it('should show advanced fields when isOpen is true', () => {
            const { container } = renderWhoIsEdit({ isOpen: true });
            const advancedGroup = container.querySelector('.adv-field-group');
            expect(advancedGroup).toHaveClass('u-visible');
        });

        it('should hide advanced fields when isOpen is false', () => {
            const { container } = renderWhoIsEdit({ isOpen: false });
            const advancedGroup = container.querySelector('.adv-field-group');
            expect(advancedGroup).not.toHaveClass('u-visible');
        });
    });

    describe('Disclosure Policy Active', () => {
        const orgDomain = {
            ...defaultProps.domain,
            registrant: {
                ...defaultProps.domain.registrant,
                org: 'true',
            },
        };

        const buildOrgContacts = (overrides = {}) => ({
            'org-contact-id': {
                id: 'org-contact-id',
                code: 'TEST:ORG',
                name: 'Test Org',
                ident: { code: '12345678', type: 'org', country_code: 'EE' },
                email: 'test@org.ee',
                phone: '+372.7654321',
                roles: new Set(['registrant']),
                disclosed_attributes: new Set(),
                system_disclosed_attributes: [],
                registrant_publishable: false,
                initialName: 'Test Org',
                initialEmail: 'test@org.ee',
                initialPhone: '+372.7654321',
                ...overrides,
            },
        });

        beforeEach(() => {
            vi.stubEnv('VITE_DISCLOSURE_POLICY_ACTIVE_FROM', '2000-01-01T00:00:00Z');
        });

        afterEach(() => {
            vi.unstubAllEnvs();
        });

        it('should enable name and email checkboxes for org contacts', () => {
            const { container } = renderWhoIsEdit({
                domain: orgDomain,
                contacts: buildOrgContacts(),
            });

            const nameCheckbox = container.querySelector('input[name="name"]');
            const emailCheckbox = container.querySelector('input[name="email"]');

            expect(nameCheckbox).not.toBeDisabled();
            expect(emailCheckbox).not.toBeDisabled();
        });

        it('should check name and email only by the contact own disclosed_attributes', () => {
            const { container } = renderWhoIsEdit({
                domain: orgDomain,
                contacts: buildOrgContacts({ disclosed_attributes: new Set(['name']) }),
            });

            const nameCheckbox = container.querySelector('input[name="name"]');
            const emailCheckbox = container.querySelector('input[name="email"]');

            expect(nameCheckbox).toBeChecked();
            expect(emailCheckbox).not.toBeChecked();
        });

        it('should disable an attribute only when it is system disclosed', () => {
            const { container } = renderWhoIsEdit({
                domain: orgDomain,
                contacts: buildOrgContacts({ system_disclosed_attributes: ['email'] }),
            });

            const nameCheckbox = container.querySelector('input[name="name"]');
            const emailCheckbox = container.querySelector('input[name="email"]');

            expect(nameCheckbox).not.toBeDisabled();
            expect(emailCheckbox).toBeDisabled();
            expect(emailCheckbox).toBeChecked();
        });

        it('should show the check all control for org contacts', () => {
            const { container } = renderWhoIsEdit({
                checkAll: true,
                domain: orgDomain,
                contacts: buildOrgContacts(),
            });

            const checkAllBox = container.querySelector('.checkbox.large');
            expect(checkAllBox).toBeInTheDocument();
        });

        it('should not auto-add name and email on change', () => {
            const onChange = vi.fn();
            const { container } = renderWhoIsEdit({
                domain: orgDomain,
                contacts: buildOrgContacts(),
                onChange,
            });

            const publishableCheckbox = container.querySelector(
                'input[name="registrant_publishable"]'
            );
            fireEvent.click(publishableCheckbox);

            expect(onChange).toHaveBeenCalled();
            const payload = onChange.mock.calls[0][0]['org-contact-id'];
            expect(payload.registrant_publishable).toBe(true);
            expect([...payload.disclosed_attributes]).not.toContain('name');
            expect([...payload.disclosed_attributes]).not.toContain('email');
        });
    });

    describe('Disclosure Policy Inactive', () => {
        const orgDomain = {
            ...defaultProps.domain,
            registrant: {
                ...defaultProps.domain.registrant,
                org: 'true',
            },
        };

        const orgContacts = {
            'org-contact-id': {
                id: 'org-contact-id',
                code: 'TEST:ORG',
                name: 'Test Org',
                ident: { code: '12345678', type: 'org', country_code: 'EE' },
                email: 'test@org.ee',
                phone: '+372.7654321',
                roles: new Set(['registrant']),
                disclosed_attributes: new Set(),
                system_disclosed_attributes: [],
                registrant_publishable: false,
                initialName: 'Test Org',
                initialEmail: 'test@org.ee',
                initialPhone: '+372.7654321',
            },
        };

        beforeEach(() => {
            vi.stubEnv('VITE_DISCLOSURE_POLICY_ACTIVE_FROM', '');
        });

        afterEach(() => {
            vi.unstubAllEnvs();
        });

        it('should auto-add name and email on change for org registrant domains', () => {
            const onChange = vi.fn();
            const { container } = renderWhoIsEdit({
                domain: orgDomain,
                contacts: orgContacts,
                onChange,
            });

            const publishableCheckbox = container.querySelector(
                'input[name="registrant_publishable"]'
            );
            fireEvent.click(publishableCheckbox);

            expect(onChange).toHaveBeenCalled();
            const payload = onChange.mock.calls[0][0]['org-contact-id'];
            expect([...payload.disclosed_attributes]).toContain('name');
            expect([...payload.disclosed_attributes]).toContain('email');
        });

        it('should not show the check all control for org contacts', () => {
            const { container } = renderWhoIsEdit({
                checkAll: true,
                domain: orgDomain,
                contacts: orgContacts,
            });

            const checkAllBox = container.querySelector('.checkbox.large');
            expect(checkAllBox).not.toBeInTheDocument();
        });
    });
});
