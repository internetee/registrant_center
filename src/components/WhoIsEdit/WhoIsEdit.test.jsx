import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
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

    const parsedDomains = mockDomains.map(domain => parseDomain(domain, true));
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
                            domains: parsedDomains.reduce((acc, domain) => ({
                                ...acc,
                                [domain.id]: domain
                            }), {}),
                            total: parsedDomains.length
                        },
                        ids: parsedDomains.map(domain => domain.id),
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
                        data: mockUser
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
            
            const publishableCheckbox = container.querySelector('input[name="registrant_publishable"]');
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
                    org: 'true'
                }
            };

            const { container } = renderWhoIsEdit({ domain: domainWithOrg });
            
            const nameCheckboxes = container.querySelectorAll('input[name="name"]');
            const emailCheckboxes = container.querySelectorAll('input[name="email"]');
            
            expect([...nameCheckboxes].every(cb => cb.disabled)).toBe(true);
            expect([...emailCheckboxes].every(cb => cb.disabled)).toBe(true);
        });

        it('should auto-check name and email for organization contacts', () => {
            const domainWithOrg = {
                ...defaultProps.domain,
                registrant: {
                    ...defaultProps.domain.registrant,
                    org: 'true'
                }
            };

            const { container } = renderWhoIsEdit({ domain: domainWithOrg });
            
            const nameCheckboxes = container.querySelectorAll('input[name="name"]');
            const emailCheckboxes = container.querySelectorAll('input[name="email"]');
            
            expect([...nameCheckboxes].every(cb => cb.checked)).toBe(true);
            expect([...emailCheckboxes].every(cb => cb.checked)).toBe(true);
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
                    org: 'true'
                }
            };

            const { container } = renderWhoIsEdit({ 
                checkAll: true,
                domain: orgDomain
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
});
