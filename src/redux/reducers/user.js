import api from '../../utils/api';
import {
    FETCH_USER_REQUEST,
    FETCH_USER_SUCCESS,
    FETCH_USER_FAILURE,
    LOGOUT_USER,
} from '../actions';

const requestUser = () => ({
    type: FETCH_USER_REQUEST,
});

const receiveUser = (payload) => ({
    payload,
    type: FETCH_USER_SUCCESS,
});

const invalidateUserRequest = (status) => ({
    status,
    type: FETCH_USER_FAILURE,
});

const fetchUser = () => (dispatch) => {
    dispatch(requestUser());
    return api
        .fetchUser()
        .then((res) => res.data)
        .then((data) => {
            dispatch(receiveUser(data));
        })
        .catch((error) => {
            const status = error.response?.status || 501;
            dispatch(invalidateUserRequest(status));
        });
};

const logoutUser = () => (dispatch) => {
    return api
        .destroyUser()
        .then((res) => res.status)
        .then((data) => {
            dispatch({
                isLoggedOut: true,
                status: data,
                type: LOGOUT_USER,
            });
        })
        .catch((error) => {
            dispatch({
                isLoggedOut: true,
                status: error.response.status,
                type: LOGOUT_USER,
            });
        });
};

const initialState = {
    data: {},
    isInvalidated: false,
    isLoggedOut: null,
    status: null,
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case FETCH_USER_FAILURE:
            return {
                ...state,
                isInvalidated: true,
                status: action.status,
            };

        case FETCH_USER_REQUEST:
            return {
                ...state,
            };

        case FETCH_USER_SUCCESS:
            return {
                ...state,
                data: {
                    ...action.payload,
                    name: `${action.payload.first_name} ${action.payload.last_name}`,
                },
                isInvalidated: false,
                status: 200,
            };

        case LOGOUT_USER:
            return {
                ...initialState,
                isLoggedOut: action.isLoggedOut,
                status: action.status,
            };
        default:
            return state;
    }
}

export { initialState, fetchUser, logoutUser };
