import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import reducer, { fetchCompanies, initialState } from './companies';
import companies from '../../__mocks__/companies';

describe('Contacts action creators', () => {
	const middlewares = [thunk];
	const mockStore = configureMockStore(middlewares);
	let store;

	beforeEach(() => {
		store = mockStore({
			companies: initialState,
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
				type: 'FETCH_COMPANIES_REQUEST',
			},
			{
				type: 'FETCH_COMPANIES_FAILURE',
			},
		];

		return store.dispatch(fetchCompanies()).then(() => {
			expect(store.getActions()).toEqual(expectedActions);
		});
	});

	it('dipatches the right actions to fetch companies', () => {
		axios.get.mockResolvedValueOnce({ data: companies });

		const expectedActions = [
			{
				type: 'FETCH_COMPANIES_REQUEST',
			},
			{
				payload: companies.companies,
				type: 'FETCH_COMPANIES_SUCCESS',
			},
		];
		return store.dispatch(fetchCompanies()).then(() => {
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

	it('should handle FETCH_COMPANIES_REQUEST', () => {
		expect(
			reducer(
				{},
				{
					type: 'FETCH_COMPANIES_REQUEST',
				}
			)
		).toEqual({
			isLoading: true,
		});
	});

	it('should handle FETCH_COMPANIES_FAILURE', () => {
		expect(
			reducer(
				{},
				{
					type: 'FETCH_COMPANIES_FAILURE',
				}
			)
		).toEqual({
			isLoading: false,
		});
	});

	it('should handle FETCH_COMPANIES_SUCCESS', () => {
		expect(
			reducer(initialState, {
				payload: companies.companies,
				type: 'FETCH_COMPANIES_SUCCESS',
			})
		).toEqual({
			data: companies.companies.reduce(
				(acc, item) => ({
					...acc,
					[item.registry_no]: item,
				}),
				{}
			),
			ids: companies.companies.map((item) => item.registry_no),
			isLoading: false,
			message: null,
		});
	});
});
