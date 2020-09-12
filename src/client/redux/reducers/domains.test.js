import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import reducer, { fetchDomains, lockDomain, unlockDomain } from './domains';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const initialState = {
    isLoading: false,
    isInvalidated: false,
    data: [],
    status: null,
    fetchedAt: null,
};

describe('Domains action creators', () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            user: {
                token: {
                    access_token: 'test_token',
                },
            },
            domains: {
                ...initialState,
                data: mockDomains.data,
            },
        });
    });

    afterEach(() => {
        nock.cleanAll();
    });

    it('dipatches the right actions to fetch domains', () => {
        nock(`${apiHost}`)
            .get('/api/domains')
            .query({ offset: 0 })
            .reply(200, mockDomains.data);

        const expectedActions = [
            {
                type: 'FETCH_DOMAINS_REQUEST',
                isLoading: true,
            },
            {
                type: 'FETCH_DOMAINS_SUCCESS',
                status: 200,
                data: mockDomains.data,
                isLoading: false,
                isInvalidated: false,
            },
        ];
        return store.dispatch(fetchDomains()).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
        });
    });

    it('dipatches the right actions to fetch a single domain by uuid', () => {
        nock(`${apiHost}`)
            .get('/api/domains/bd695cc9-1da8-4c39-b7ac-9a2055e0a93e')
            .reply(200, mockDomains.data[0]);

        const expectedActions = [
            {
                type: 'FETCH_DOMAINS_REQUEST',
                isLoading: true,
            },
            {
                type: 'FETCH_DOMAINS_SUCCESS',
                status: 200,
                data: mockDomains.data,
                isLoading: false,
                isInvalidated: false,
            },
        ];

        return store.dispatch(fetchDomains('bd695cc9-1da8-4c39-b7ac-9a2055e0a93e')).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
        });
    });

    it('dipatches the right actions to lock a domain', () => {
        nock(`${apiHost}`)
            .post('/api/domains/bd695cc9-1da8-4c39-b7ac-9a2055e0a93e/registry_lock')
            .reply(200, mockDomains.data[0]);

        const expectedActions = [
            {
                type: 'LOCK_DOMAIN_REQUEST',
                isLoading: true,
            },
            {
                type: 'LOCK_DOMAIN_SUCCESS',
                status: 200,
                isLoading: false,
                isInvalidated: false,
                data: mockDomains.data,
            },
        ];

        return store.dispatch(lockDomain('bd695cc9-1da8-4c39-b7ac-9a2055e0a93e')).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
        });
    });

    it('dipatches the right actions to unlock a domain', () => {
        nock(`${apiHost}`)
            .delete('/api/domains/bd695cc9-1da8-4c39-b7ac-9a2055e0a93e/registry_lock')
            .reply(200, mockDomains.data[0]);

        const expectedActions = [
            {
                type: 'UNLOCK_DOMAIN_REQUEST',
                isLoading: true,
            },
            {
                type: 'UNLOCK_DOMAIN_SUCCESS',
                status: 200,
                isLoading: false,
                isInvalidated: false,
                data: mockDomains.data,
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
            reducer([], {
                type: 'LOGOUT_USER',
                ...initialState,
            })
        ).toEqual(initialState);
    });

    it('should handle FETCH_DOMAINS_REQUEST', () => {
        expect(
            reducer([], {
                type: 'FETCH_DOMAINS_REQUEST',
                isLoading: true,
            })
        ).toEqual({
            isLoading: true,
        });
    });

    it('should handle FETCH_DOMAINS_FAILURE', () => {
        expect(
            reducer([], {
                type: 'FETCH_DOMAINS_FAILURE',
                status: 400,
                isLoading: false,
                isInvalidated: true,
            })
        ).toEqual({
            status: 400,
            isLoading: false,
            isInvalidated: true,
        });
    });

    it('should handle FETCH_DOMAINS_SUCCESS', () => {
        Date.now = jest.fn(() => 1482363367071);

        expect(
            reducer([], {
                type: 'FETCH_DOMAINS_SUCCESS',
                status: 200,
                data: mockDomains.data,
                isLoading: false,
                isInvalidated: false,
            })
        ).toEqual({
            status: 200,
            data: mockDomains.data,
            isLoading: false,
            isInvalidated: false,
            fetchedAt: Date.now(),
        });
    });

    it('should handle LOCK_DOMAIN_REQUEST', () => {
        expect(
            reducer([], {
                type: 'LOCK_DOMAIN_REQUEST',
                isLoading: true,
            })
        ).toEqual({
            isLoading: true,
        });
    });

    it('should handle LOCK_DOMAIN_SUCCESS', () => {
        expect(
            reducer([], {
                type: 'LOCK_DOMAIN_SUCCESS',
                status: 200,
                data: mockDomains.data,
                isLoading: false,
                isInvalidated: false,
            })
        ).toEqual({
            status: 200,
            data: mockDomains.data,
            isLoading: false,
            isInvalidated: false,
        });
    });

    it('should handle UNLOCK_DOMAIN_REQUEST', () => {
        expect(
            reducer([], {
                type: 'UNLOCK_DOMAIN_REQUEST',
                isLoading: true,
            })
        ).toEqual({
            isLoading: true,
        });
    });

    it('should handle UNLOCK_DOMAIN_SUCCESS', () => {
        expect(
            reducer([], {
                type: 'UNLOCK_DOMAIN_SUCCESS',
                status: 200,
                data: mockDomains.data,
                isLoading: false,
                isInvalidated: false,
            })
        ).toEqual({
            status: 200,
            data: mockDomains.data,
            isLoading: false,
            isInvalidated: false,
        });
    });
});
