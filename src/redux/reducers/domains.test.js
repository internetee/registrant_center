import 'core-js';
import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import reducer, {
    initialState,
    fetchDomain,
    fetchDomains,
    lockDomain,
    parseDomain,
    unlockDomain,
} from './domains';
import contacts from '../../__mocks__/contacts';
import domains from '../../__mocks__/domains';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Domains action creators', () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            domains: {
                ...initialState,
            },
        });
    });

    it('dipatches the right actions on fetchDomain request fail', () => {
        // nock(`${apiHost}`).get('/api/user').reply(404);
        axios.get.mockRejectedValueOnce({
            response: {
                status: 401,
            },
        });

        const expectedActions = [
            {
                type: 'FETCH_DOMAIN_REQUEST',
            },
            {
                type: 'FETCH_DOMAIN_FAILURE',
            },
        ];

        return store.dispatch(fetchDomain('bd695cc9-1da8-4c39-b7ac-9a2055e0a93e')).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
        });
    });

    it('dipatches the right actions on fetchDomains request fail', () => {
        // nock(`${apiHost}`).get('/api/user').reply(404);
        axios.get.mockRejectedValueOnce({
            response: {
                status: 401,
            },
        });

        const expectedActions = [
            {
                type: 'FETCH_DOMAINS_REQUEST',
            },
            {
                type: 'FETCH_DOMAINS_FAILURE',
            },
        ];

        return store.dispatch(fetchDomains()).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
        });
    });

    it('dipatches the right actions to fetch domains', () => {
        axios.get.mockResolvedValueOnce({ data: { count: 2, domains } });
        const expectedActions = [
            {
                type: 'FETCH_DOMAINS_REQUEST',
            },
            {
                payload: { count: 2, domains },
                simplify: false,
                type: 'FETCH_DOMAINS_SUCCESS',
            },
        ];
        return store.dispatch(fetchDomains()).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
        });
    });

    it('dipatches the right actions to fetch a single domain by uuid', () => {
        axios.get.mockResolvedValueOnce({ data: domains[0] });
        axios.get.mockResolvedValueOnce({ data: contacts[2] });
        axios.get.mockResolvedValueOnce({ data: contacts[1] });
        axios.get.mockResolvedValueOnce({ data: contacts[0] });

        const expectedActions = [
            {
                type: 'FETCH_DOMAIN_REQUEST',
            },
            {
                type: 'FETCH_CONTACT_REQUEST',
            },
            {
                type: 'FETCH_CONTACT_REQUEST',
            },
            {
                type: 'FETCH_CONTACT_REQUEST',
            },
            {
                payload: contacts[2],
                type: 'FETCH_CONTACT_SUCCESS',
            },
            {
                payload: contacts[1],
                type: 'FETCH_CONTACT_SUCCESS',
            },
            {
                payload: contacts[0],
                type: 'FETCH_CONTACT_SUCCESS',
            },
            {
                payload: parseDomain(domains[0]),
                type: 'FETCH_DOMAIN_SUCCESS',
            },
        ];

        return store.dispatch(fetchDomain('bd695cc9-1da8-4c39-b7ac-9a2055e0a93e')).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
        });
    });

    it('dipatches the right actions to lock domain failure', () => {
        axios.post.mockRejectedValueOnce({
            response: {
                status: 401,
            },
        });

        const expectedActions = [
            {
                type: 'LOCK_DOMAIN_REQUEST',
            },
            {
                payload: {
                    code: 401,
                },
                type: 'LOCK_DOMAIN_FAILURE',
            },
        ];

        return store.dispatch(lockDomain('bd695cc9-1da8-4c39-b7ac-9a2055e0a93e')).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
        });
    });

    it('dipatches the right actions to lock a domain', () => {
        axios.post.mockResolvedValueOnce({ data: domains[0] });

        const expectedActions = [
            {
                type: 'LOCK_DOMAIN_REQUEST',
            },
            {
                payload: domains[0],
                type: 'LOCK_DOMAIN_SUCCESS',
            },
        ];

        return store.dispatch(lockDomain('bd695cc9-1da8-4c39-b7ac-9a2055e0a93e')).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
        });
    });

    it('dipatches the right actions to unlock domain failure', () => {
        axios.delete.mockRejectedValueOnce({
            response: {
                status: 401,
            },
        });

        const expectedActions = [
            {
                type: 'UNLOCK_DOMAIN_REQUEST',
            },
            {
                payload: {
                    code: 401,
                },
                type: 'UNLOCK_DOMAIN_FAILURE',
            },
        ];

        return store.dispatch(unlockDomain('bd695cc9-1da8-4c39-b7ac-9a2055e0a93e')).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
        });
    });

    it('dipatches the right actions to unlock a domain', () => {
        axios.delete.mockResolvedValueOnce({ data: domains[0] });

        const expectedActions = [
            {
                type: 'UNLOCK_DOMAIN_REQUEST',
            },
            {
                payload: domains[0],
                type: 'UNLOCK_DOMAIN_SUCCESS',
            },
        ];

        return store.dispatch(unlockDomain('bd695cc9-1da8-4c39-b7ac-9a2055e0a93e')).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
        });
    });
});

describe('Domains reducers', () => {
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

    it('should handle FETCH_DOMAIN_REQUEST', () => {
        expect(
            reducer(
                {},
                {
                    type: 'FETCH_DOMAIN_REQUEST',
                }
            )
        ).toEqual({
            isLoading: true,
        });
    });

    it('should handle FETCH_DOMAINS_REQUEST', () => {
        expect(
            reducer(
                {},
                {
                    type: 'FETCH_DOMAINS_REQUEST',
                }
            )
        ).toEqual({
            isLoading: true,
        });
    });

    it('should handle FETCH_DOMAINS_FAILURE', () => {
        expect(
            reducer(
                {},
                {
                    type: 'FETCH_DOMAINS_FAILURE',
                }
            )
        ).toEqual({
            isLoading: false,
        });
    });

    it('should handle FETCH_DOMAINS_SUCCESS', () => {
        expect(
            reducer(
                {},
                {
                    payload: { count: 2, domains },
                    type: 'FETCH_DOMAINS_SUCCESS',
                }
            )
        ).toEqual({
            data: {
                count: 2,
                domains: domains.reduce(
                    (acc, item) => ({
                        ...acc,
                        [item.id]: parseDomain(item, true),
                    }),
                    {}
                ),
            },
            ids: domains.map(({ id }) => id),
            isLoading: false,
        });
    });

    it('should handle LOCK_DOMAIN_SUCCESS', () => {
        expect(
            reducer(
                {},
                {
                    payload: domains[0],
                    type: 'LOCK_DOMAIN_SUCCESS',
                }
            )
        ).toEqual({
            data: {
                [domains[0].id]: parseDomain(domains[0]),
            },
            message: {
                code: 200,
                type: 'domainLock',
            },
        });
    });

    it('should handle UNLOCK_DOMAIN_SUCCESS', () => {
        expect(
            reducer(
                {},
                {
                    payload: domains[0],
                    type: 'UNLOCK_DOMAIN_SUCCESS',
                }
            )
        ).toEqual({
            data: {
                [domains[0].id]: parseDomain(domains[0]),
            },
            message: {
                code: 200,
                type: 'domainUnlock',
            },
        });
    });
});
