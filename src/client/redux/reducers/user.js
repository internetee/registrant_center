import api from '../../utils/api';
import {
    FETCH_USER_REQUEST,
    FETCH_USER_SUCCESS,
    FETCH_USER_FAILURE,
    LOGOUT_USER,
} from '../actions';

const requestUser = () => {
    return {
        isLoading: true,
        type: FETCH_USER_REQUEST,
    };
};

const receiveUser = data => {
    return {
        data: {
            ...data,
            name: `${data.first_name} ${data.last_name}`,
        },
        isInvalidated: false,
        isLoading: false,
        status: 200,
        type: FETCH_USER_SUCCESS,
    };
};

const invalidateUserRequest = status => {
    return {
        isInvalidated: true,
        isLoading: false,
        status,
        type: FETCH_USER_FAILURE,
    };
};

const fetchUser = () => dispatch => {
    dispatch(requestUser());
    return api
        .fetchUser()
        .then(res => res.data)
        .then(async data => {
            dispatch(receiveUser(data));
        })
        .catch(error => {
            dispatch(invalidateUserRequest(error.response.status));
        });
};

const logoutUser = () => dispatch => {
    return api
        .destroyUser()
        .then(res => res.status)
        .then(data => {
            dispatch({
                status: data,
                type: LOGOUT_USER,
            });
        })
        .catch(error => {
            dispatch({
                status: error.response.status,
                type: LOGOUT_USER,
            });
        });
};

const shouldFetchUser = state => {
    const { user } = state;
    if (!user.fetchedAt) {
        return true;
    }
    if (user.isLoading) {
        return false;
    }
    return user.isInvalidated;
};

const fetchUserIfNeeded = () => (dispatch, getState) => {
    if (shouldFetchUser(getState())) {
        return dispatch(fetchUser());
    }
    return Promise.resolve();
};

const initialState = {
    data: {},
    fetchedAt: null,
    isInvalidated: false,
    isLoading: false,
    status: null,
};

export default function(state = initialState, action) {
    switch (action.type) {
        case FETCH_USER_FAILURE:
            return {
                ...state,
                isInvalidated: action.isInvalidated,
                isLoading: action.isLoading,
                status: action.status,
            };

        case FETCH_USER_REQUEST:
            return {
                ...state,
                isLoading: action.isLoading,
            };

        case FETCH_USER_SUCCESS:
            return {
                ...state,
                data: action.data,
                fetchedAt: Date.now(),
                isInvalidated: action.isInvalidated,
                isLoading: action.isLoading,
                status: action.status,
            };

        case LOGOUT_USER:
            return {
                ...initialState,
                status: state.status,
            };
        default:
            return state;
    }
}

export { initialState, fetchUser, logoutUser, fetchUserIfNeeded };
