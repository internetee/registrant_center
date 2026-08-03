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
//
// Per-request state (events, isLoading, error) is keyed by domain uuid so that an in-flight or
// failed fetch for one domain can never drive another domain's panel. This matters for a
// transparency feature: a failed load for domain A must not read as "no accesses" on domain B.

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

// byUuid holds one { events, isLoading, error } record per domain uuid. events stays undefined
// until a successful fetch, so the panel can tell "loading / failed" apart from "loaded, empty".
const initialState = {
    byUuid: {},
};

const recordFor = (state, uuid) =>
    state.byUuid[uuid] || { events: undefined, isLoading: false, error: false };

const withRecord = (state, uuid, record) => ({
    ...state,
    byUuid: {
        ...state.byUuid,
        [uuid]: record,
    },
});

export default function reducer(state = initialState, { payload, type }) {
    switch (type) {
        case LOGOUT_USER:
            return initialState;

        case FETCH_ACCESS_EVENTS_REQUEST:
            return withRecord(state, payload.uuid, {
                ...recordFor(state, payload.uuid),
                isLoading: true,
                error: false,
            });

        case FETCH_ACCESS_EVENTS_SUCCESS:
            return withRecord(state, payload.uuid, {
                events: payload.events,
                isLoading: false,
                error: false,
            });

        case FETCH_ACCESS_EVENTS_FAILURE:
            return withRecord(state, payload.uuid, {
                ...recordFor(state, payload.uuid),
                isLoading: false,
                error: true,
            });

        default:
            return state;
    }
}

export { initialState, fetchAccessEvents };
