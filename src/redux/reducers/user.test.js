import axios from "axios"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"
import reducer, { initialState, fetchUser, logoutUser } from "./user"
import user from "../../__mocks__/user"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe("User action creators", () => {
    let store
    beforeEach(() => {
        store = mockStore({
            user: initialState,
        })
    })

    it("dipatches the right actions to fetch user data", () => {
        axios.get.mockResolvedValueOnce({ data: user })
        const expectedActions = [
            {
                type: "FETCH_USER_REQUEST",
            },
            {
                payload: user,
                type: "FETCH_USER_SUCCESS",
            },
        ]
        return store.dispatch(fetchUser()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
        })
    })

    it("dipatches the right actions on fetchUser request fail", () => {
        // nock(`${apiHost}`).get('/api/user').reply(404);
        axios.get.mockRejectedValueOnce({
            response: {
                status: 400,
            },
        })

        const expectedActions = [
            {
                type: "FETCH_USER_REQUEST",
            },
            {
                status: 400,
                type: "FETCH_USER_FAILURE",
            },
        ]

        return store.dispatch(fetchUser()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
        })
    })

    it("dipatches the right actions to log out user", () => {
        axios.post.mockResolvedValueOnce({ status: 200 })

        const expectedActions = [
            {
                isLoggedOut: true,
                status: 200,
                type: "LOGOUT_USER",
            },
        ]
        return store.dispatch(logoutUser()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
        })
    })
})

describe("User reducers", () => {
    it("should return the initial state", () => {
        expect(reducer(undefined, {})).toEqual(initialState)
    })

    it("should handle FETCH_USER_REQUEST", () => {
        expect(
            reducer([], {
                type: "FETCH_USER_REQUEST",
            })
        ).toEqual({})
    })

    it("should handle FETCH_USER_SUCCESS", () => {
        expect(
            reducer([], {
                payload: user,
                type: "FETCH_USER_SUCCESS",
            })
        ).toEqual({
            data: {
                ...user,
                name: `${user.first_name} ${user.last_name}`,
            },
            isInvalidated: false,
            status: 200,
        })
    })

    it("should handle LOGOUT_USER", () => {
        expect(
            reducer([], {
                isLoggedOut: true,
                status: 200,
                type: "LOGOUT_USER",
            })
        ).toEqual({
            ...initialState,
            isLoggedOut: true,
            status: 200,
        })
    })
})
