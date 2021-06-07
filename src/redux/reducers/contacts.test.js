import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import reducer, { fetchContacts, initialState, updateContact } from './contacts';
import contacts from '../../__mocks__/contacts';

describe('Contacts action creators', () => {
	const middlewares = [thunk];
	const mockStore = configureMockStore(middlewares);
	let store;

	beforeEach(() => {
		store = mockStore({
			contacts: initialState,
		});
	});

	it('dipatches the right actions on fetchContacts request fail', () => {
		// nock(`${apiHost}`).get('/api/user').reply(404);
		axios.get.mockRejectedValueOnce({
			response: {
				status: 401,
			},
		});

		const expectedActions = [
			{
				type: 'FETCH_CONTACTS_REQUEST',
			},
			{
				type: 'FETCH_CONTACTS_FAILURE',
			},
		];

		return store.dispatch(fetchContacts()).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
	});

	it('dipatches the right actions to fetch contacts', () => {
		axios.get.mockResolvedValueOnce({ data: contacts });

		const expectedActions = [
			{
				type: 'FETCH_CONTACTS_REQUEST',
			},
			{
				payload: contacts,
				type: 'FETCH_CONTACTS_SUCCESS',
			},
		];
		return store.dispatch(fetchContacts()).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
	});

	it('dipatches the right actions on fetchContacts request fail', () => {
		// nock(`${apiHost}`).get('/api/user').reply(404);
		axios.get.mockRejectedValueOnce({
			response: {
				status: 401,
			},
		});

		const expectedActions = [
			{
				type: 'FETCH_CONTACT_REQUEST',
			},
			{
				type: 'FETCH_CONTACT_FAILURE',
			},
		];

		return store.dispatch(fetchContacts('cfbfbb76-aed8-497a-91c1-48d82cbc4588')).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
	});

	it('dipatches the right actions to fetch a single contact', () => {
		axios.get.mockResolvedValueOnce({ data: contacts[0] });
		const expectedActions = [
			{
				type: 'FETCH_CONTACT_REQUEST',
			},
			{
				payload: contacts[0],
				type: 'FETCH_CONTACT_SUCCESS',
			},
		];
		return store.dispatch(fetchContacts('cfbfbb76-aed8-497a-91c1-48d82cbc4588')).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
	});

	it('dipatches the right actions to update a contact', () => {
		axios.patch.mockResolvedValueOnce({ data: contacts[0] });
		const expectedActions = [
			{
				type: 'UPDATE_CONTACT_REQUEST',
			},
			{
				payload: contacts[0],
				type: 'UPDATE_CONTACT_SUCCESS',
			},
		];
		return store
			.dispatch(updateContact('cfbfbb76-aed8-497a-91c1-48d82cbc4588', {}))
			.then(() => {
				expect(store.getActions()).toEqual(expectedActions);
			});
	});

	it('handles contact update errors', () => {
		axios.patch.mockResolvedValueOnce({
			data: {
				errors: [],
			},
			status: 401,
		});
		const expectedActions = [
			{
				type: 'UPDATE_CONTACT_REQUEST',
			},
			{
				payload: {
					code: 401,
					errors: [],
					type: 'whois',
				},
				type: 'UPDATE_CONTACT_FAILURE',
			},
		];
		return store
			.dispatch(updateContact('cfbfbb76-aed8-497a-91c1-48d82cbc4588', {}))
			.then(() => {
				expect(store.getActions()).toEqual(expectedActions);
			});
	});
});

describe('Contacts reducers', () => {
	it('should return the initial state', () => {
		expect(reducer(undefined, {})).toEqual(initialState);
	});

	it('should handle LOGOUT_USER', () => {
		expect(
			reducer(
				{},
				{
					type: 'LOGOUT_USER',
				}
			)
		).toEqual(initialState);
	});

	it('should handle FETCH_CONTACTS_REQUEST', () => {
		expect(
			reducer(
				{},
				{
					type: 'FETCH_CONTACTS_REQUEST',
				}
			)
		).toEqual({
			isLoading: true,
		});
	});

	it('should handle FETCH_CONTACTS_FAILURE', () => {
		expect(
			reducer(
				{},
				{
					type: 'FETCH_CONTACTS_FAILURE',
				}
			)
		).toEqual({
			isLoading: false,
		});
	});

	it('should handle FETCH_CONTACT_SUCCESS', () => {
		expect(
			reducer(initialState, {
				payload: contacts[0],
				type: 'FETCH_CONTACT_SUCCESS',
			})
		).toEqual({
			data: {
				[contacts[0].id]: contacts[0],
			},
			ids: [contacts[0].id],
			isLoading: false,
			message: null,
		});
	});

	it('should handle FETCH_CONTACTS_SUCCESS', () => {
		expect(
			reducer(initialState, {
				payload: contacts,
				type: 'FETCH_CONTACTS_SUCCESS',
			})
		).toEqual({
			data: contacts.reduce(
				(acc, item) => ({
					...acc,
					[item.id]: item,
				}),
				{}
			),
			ids: contacts.map((item) => item.id),
			isLoading: false,
			message: null,
		});
	});
});
