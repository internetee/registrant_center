/* eslint-disable */
import api from '../../utils/api';
import {
    FETCH_ACCESS_EVENTS_REQUEST,
    FETCH_ACCESS_EVENTS_SUCCESS,
    FETCH_ACCESS_EVENTS_FAILURE,
    LOGOUT_USER,
} from '../actions';

// Access events describe which authorities have accessed a domain's data. The registry returns, per
// event, EXACTLY three fields: { accessed_at, organization, category }. Nothing else is stored or
// surfaced here.

const requestAccessEvents = (uuid) => ({
    payload: { uuid },
    type: FETCH_ACCESS_EVENTS_REQUEST,
});

const receiveAccessEvents = (uuid, events) => ({
    payload: { uuid, events },
    type: FETCH_ACCESS_EVENTS_SUCCESS,
});

const failAccessEvents = (uuid) => ({
    payload: { uuid },
    type: FETCH_ACCESS_EVENTS_FAILURE,
});

const fetchAccessEvents = (uuid) => (dispatch) => {
    dispatch(requestAccessEvents(uuid));
    return api
        .fetchDomainAccessEvents(uuid)
        .then((res) => res.data)
        .then((events) => dispatch(receiveAccessEvents(uuid, events)))
        .catch(() => dispatch(failAccessEvents(uuid)));
};

const initialState = {
    data: {},
    isLoading: false,
    error: null,
};

export default function reducer(state = initialState, { payload, type }) {
    switch (type) {
        case LOGOUT_USER:
            return initialState;

        case FETCH_ACCESS_EVENTS_REQUEST:
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case FETCH_ACCESS_EVENTS_SUCCESS:
            return {
                ...state,
                data: {
                    ...state.data,
                    [payload.uuid]: payload.events,
                },
                isLoading: false,
                error: null,
            };

        case FETCH_ACCESS_EVENTS_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: true,
            };

        default:
            return state;
    }
}

export { initialState, fetchAccessEvents };
