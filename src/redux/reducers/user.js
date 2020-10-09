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
            dispatch(invalidateUserRequest(error.response.status));
        });
};

const logoutUser = () => (dispatch) => {
    return api
        .destroyUser()
        .then((res) => res.status)
        .then((data) => {
            dispatch({
                status: data,
                type: LOGOUT_USER,
            });
        })
        .catch((error) => {
            dispatch({
                status: error.response.status,
                type: LOGOUT_USER,
            });
        });
};

const initialState = {
    data: {},
    isInvalidated: false,
    status: null,
};

export default function (state = initialState, action) {
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
                status: action.status,
            };
        default:
            return state;
    }
}

export { initialState, fetchUser, logoutUser };
