import { describe, it, expect, beforeEach, vi } from 'vitest';
import reducer, {
    initialState,
    fetchContact,
    fetchContacts,
    updateContact,
    fetchUpdateContacts,
    updateContactsConfirm,
} from './contacts';
import contacts from '../../__mocks__/contacts';

// Mock the api module
vi.mock('../../utils/api', () => ({
    default: {
        fetchContacts: vi.fn(),
        updateContact: vi.fn(),
        fetchUpdateContacts: vi.fn(),
        updateContacts: vi.fn(),
    },
}));

import api from '../../utils/api';

describe('Contact Actions', () => {
    let dispatch;

    beforeEach(() => {
        vi.clearAllMocks();
        dispatch = vi.fn((action) => {
            // If the action is a function (thunk), execute it
            if (typeof action === 'function') {
                return action(dispatch);
            }
            return action;
        });
    });

    describe('fetchContact', () => {
        it('fetches a single contact successfully', async () => {
            api.fetchContacts.mockResolvedValueOnce({ data: contacts[0] });

            await fetchContact(contacts[0].id)(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: 'FETCH_CONTACT_REQUEST' });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'FETCH_CONTACT_SUCCESS',
                payload: contacts[0],
            });

            expect(api.fetchContacts).toHaveBeenCalledWith(contacts[0].id, false);
        });

        it('handles fetch contact failure', async () => {
            api.fetchContacts.mockRejectedValueOnce(new Error('Failed to fetch'));

            await fetchContact('invalid-id')(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: 'FETCH_CONTACT_REQUEST' });
            expect(dispatch).toHaveBeenLastCalledWith({ type: 'FETCH_CONTACT_FAILURE' });
        });
    });

    describe('fetchContacts', () => {
        it('fetches contacts with pagination', async () => {
            // First batch
            api.fetchContacts.mockResolvedValueOnce({
                data: contacts.slice(0, 2),
            });

            await fetchContacts()(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: 'FETCH_CONTACTS_REQUEST' });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'FETCH_CONTACTS_SUCCESS',
                payload: contacts.slice(0, 2),
            });
        });

        it('handles fetch contacts failure', async () => {
            api.fetchContacts.mockRejectedValueOnce(new Error('Failed to fetch'));

            await fetchContacts()(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: 'FETCH_CONTACTS_REQUEST' });
            expect(dispatch).toHaveBeenLastCalledWith({ type: 'FETCH_CONTACTS_FAILURE' });
        });

        it('should handle pagination when there are more than 200 contacts', async () => {
            // Create mock contacts
            const firstPage = Array(200)
                .fill()
                .map((_, i) => ({
                    id: `${i}`,
                    name: `contact${i}`,
                }));
            const secondPage = Array(50)
                .fill()
                .map((_, i) => ({
                    id: `${i + 200}`,
                    name: `contact${i + 200}`,
                }));

            // Mock API responses
            api.fetchContacts
                .mockResolvedValueOnce({
                    data: firstPage,
                })
                .mockResolvedValueOnce({
                    data: secondPage,
                });

            // Call fetchCompanies
            await fetchContacts()(dispatch);

            // Verify api.fetchCompanies was called twice with correct offsets
            expect(api.fetchContacts).toHaveBeenCalledTimes(2);
            expect(api.fetchContacts).toHaveBeenNthCalledWith(1, null, 0);
            expect(api.fetchContacts).toHaveBeenNthCalledWith(2, null, 200);

            // Get all dispatch calls
            const dispatchCalls = dispatch.mock.calls.map((call) => call[0]);

            // Verify the sequence of actions
            expect(dispatchCalls).toContainEqual({
                type: 'FETCH_CONTACTS_REQUEST',
            });

            // Verify the final success action contains all companies
            const successAction = dispatchCalls.find(
                (call) => call.type === 'FETCH_CONTACTS_SUCCESS'
            );
            expect(successAction).toBeTruthy();
            expect(successAction.payload).toHaveLength(250);
            expect(successAction.payload).toEqual([...firstPage, ...secondPage]);
        });
    });

    describe('updateContact', () => {
        const mockForm = {
            name: 'Updated Name',
            email: 'updated@email.com',
        };

        it('updates contact successfully', async () => {
            const updatedContact = { ...contacts[0], ...mockForm };
            api.updateContact.mockResolvedValueOnce({ data: updatedContact });

            await updateContact(contacts[0].id, mockForm)(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: 'UPDATE_CONTACT_REQUEST' });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'UPDATE_CONTACT_SUCCESS',
                payload: updatedContact,
            });
        });

        it('handles update contact failure', async () => {
            const errorResponse = {
                response: {
                    status: 400,
                    data: { errors: ['Invalid email'] },
                },
            };
            api.updateContact.mockRejectedValueOnce(errorResponse);

            await updateContact(contacts[0].id, mockForm)(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: 'UPDATE_CONTACT_REQUEST' });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'UPDATE_CONTACT_FAILURE',
                payload: {
                    code: 400,
                    type: 'whois',
                },
            });
        });
    });

    describe('fetchUpdateContacts', () => {
        it('fetches update contacts successfully', async () => {
            const mockResponse = { status: 'pending' };
            api.fetchUpdateContacts.mockResolvedValueOnce({ data: mockResponse });

            await fetchUpdateContacts('domain-id')(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: 'DO_UPDATE_CONTACTS_REQUEST' });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'DO_UPDATE_CONTACTS_SUCCESS',
                payload: mockResponse,
            });
        });

        it('handles fetch update contacts failure', async () => {
            api.fetchUpdateContacts.mockRejectedValueOnce(new Error('Failed to fetch'));

            await fetchUpdateContacts('domain-id')(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: 'DO_UPDATE_CONTACTS_REQUEST' });
            expect(dispatch).toHaveBeenLastCalledWith({ type: 'DO_UPDATE_CONTACTS_FAILURE' });
        });
    });

    describe('updateContactsConfirm', () => {
        it('confirms contact update successfully', async () => {
            const mockResponse = {
                message: 'get it',
                contacts: [
                    { id: '1', name: 'Updated Contact 1' },
                    { id: '2', name: 'Updated Contact 2' },
                ],
            };
            api.updateContacts.mockResolvedValueOnce({ data: mockResponse });

            await updateContactsConfirm('domain-id')(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: 'UPDATE_CONTACTS_REQUEST',
            });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'UPDATE_CONTACTS_SUCCESS',
                payload: mockResponse,
            });

            expect(api.updateContacts).toHaveBeenCalledWith('domain-id', false);
        });

        it('handles contact update confirmation failure', async () => {
            const errorResponse = {
                response: {
                    status: 400,
                    data: {
                        message: 'Failed to update contacts',
                        errors: ['Contact update failed'],
                    },
                },
            };
            api.updateContacts.mockRejectedValueOnce(errorResponse);

            await updateContactsConfirm('domain-id')(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: 'UPDATE_CONTACTS_REQUEST',
            });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'UPDATE_CONTACTS_FAILURE',
            });
        });

        it('handles network or server errors', async () => {
            api.updateContacts.mockRejectedValueOnce(new Error('Network error'));

            await updateContactsConfirm('domain-id')(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: 'UPDATE_CONTACTS_REQUEST',
            });
            expect(dispatch).toHaveBeenLastCalledWith({
                type: 'UPDATE_CONTACTS_FAILURE',
            });
        });
    });
});

describe('Contacts Reducer', () => {
    it('returns initial state', () => {
        expect(reducer(undefined, {})).toEqual(initialState);
    });

    it('handles FETCH_CONTACT_SUCCESS', () => {
        const action = {
            type: 'FETCH_CONTACT_SUCCESS',
            payload: contacts[0],
        };

        const state = reducer(initialState, action);
        expect(state.data[contacts[0].id]).toEqual(contacts[0]);
        expect(state.ids).toContain(contacts[0].id);
        expect(state.isLoading).toBe(false);
    });

    it('handles FETCH_CONTACTS_SUCCESS', () => {
        const action = {
            type: 'FETCH_CONTACTS_SUCCESS',
            payload: contacts,
        };

        const state = reducer(initialState, action);
        expect(Object.keys(state.data)).toHaveLength(contacts.length);
        expect(state.ids).toHaveLength(contacts.length);
        expect(state.isLoading).toBe(false);
    });

    it('handles UPDATE_CONTACT_SUCCESS', () => {
        const updatedContact = { ...contacts[0], name: 'Updated Name' };
        const action = {
            type: 'UPDATE_CONTACT_SUCCESS',
            payload: updatedContact,
        };

        const state = reducer(initialState, action);
        expect(state.data[updatedContact.id]).toEqual(updatedContact);
        expect(state.message).toEqual({
            code: 200,
            type: 'whois',
        });
    });

    it('handles loading states', () => {
        const requestState = reducer(initialState, { type: 'FETCH_CONTACTS_REQUEST' });
        expect(requestState.isLoading).toBe(true);

        const failureState = reducer(requestState, { type: 'FETCH_CONTACTS_FAILURE' });
        expect(failureState.isLoading).toBe(false);
    });
});
