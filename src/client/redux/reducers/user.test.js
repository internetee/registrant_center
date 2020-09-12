import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import reducer, { fetchUser, logoutUser } from './user';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const initialState = {
    isLoading: false,
    isInvalidated: false,
    data: {},
    status: null,
    fetchedAt: null,
};

describe('User action creators', () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            user: initialState,
        });
    });

    afterEach(() => {
        nock.cleanAll();
    });

    it('dipatches the right actions to fetch user data', () => {
        nock(`${apiHost}`)
            .get('/api/user')
            .reply(200, mockUser.data);

        const expectedActions = [
            {
                type: 'FETCH_USER_REQUEST',
                isLoading: true,
            },
            {
                type: 'FETCH_USER_SUCCESS',
                status: 200,
                data: mockUser.data,
                isLoading: false,
                isInvalidated: false,
            },
        ];

        return store.dispatch(fetchUser()).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
        });
    });

    it('dipatches the right actions on fetchUser request fail', () => {
        nock(`${apiHost}`)
            .get('/api/user')
            .reply(404);

        const expectedActions = [
            {
                type: 'FETCH_USER_REQUEST',
                isLoading: true,
            },
            {
                type: 'FETCH_USER_FAILURE',
                status: 404,
                isLoading: false,
                isInvalidated: true,
            },
        ];

        return store.dispatch(fetchUser()).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
        });
    });

    it('dipatches the right actions to log out user', () => {
        nock(`${apiHost}`)
            .post('/api/destroy')
            .reply(200);

        const expectedActions = [
            {
                type: 'LOGOUT_USER',
                status: 200,
            },
            {
                payload: {
                    args: ['/login'],
                    method: 'push',
                },
                type: '@@router/CALL_HISTORY_METHOD',
            },
        ];
        return store.dispatch(logoutUser()).then(() => {
            expect(store.getActions()).toEqual(expectedActions);
        });
    });
});

describe('User reducers', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual({
            isLoading: false,
            isInvalidated: false,
            data: {},
            status: null,
            fetchedAt: null,
        });
    });

    it('should handle FETCH_USER_REQUEST', () => {
        expect(
            reducer([], {
                type: 'FETCH_USER_REQUEST',
                isLoading: true,
            })
        ).toEqual({
            isLoading: true,
        });
    });

    it('should handle FETCH_USER_SUCCESS', () => {
        Date.now = jest.fn(() => 1482363367071);
        expect(
            reducer([], {
                type: 'FETCH_USER_SUCCESS',
                status: 200,
                data: mockUser.data,
                isLoading: false,
                isInvalidated: false,
            })
        ).toEqual({
            status: 200,
            data: mockUser.data,
            isLoading: false,
            isInvalidated: false,
            fetchedAt: Date.now(),
        });
    });

    it('should handle LOGOUT_USER', () => {
        expect(
            reducer([], {
                type: 'LOGOUT_USER',
                ...initialState,
                status: 200,
            })
        ).toEqual({
            ...initialState,
            status: 200,
        });
    });
});
