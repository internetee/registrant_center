import api from '../../utils/api';
import {
    DO_UPDATE_CONTACTS_REQUEST,
    DO_UPDATE_CONTACTS_SUCCESS,
    DO_UPDATE_CONTACTS_FAILURE,
    FETCH_CONTACT_REQUEST,
    FETCH_CONTACT_SUCCESS,
    FETCH_CONTACT_FAILURE,
    FETCH_CONTACTS_REQUEST,
    FETCH_CONTACTS_SUCCESS,
    FETCH_CONTACTS_FAILURE,
    UPDATE_CONTACT_REQUEST,
    UPDATE_CONTACT_SUCCESS,
    UPDATE_CONTACT_FAILURE,
    UPDATE_CONTACTS_REQUEST,
    UPDATE_CONTACTS_SUCCESS,
    LOGOUT_USER,
} from '../actions';

let request = {
    data: [],
    offset: 0,
};

const requestContact = () => ({
    type: FETCH_CONTACT_REQUEST,
});

const receiveContact = (payload) => ({
    payload,
    type: FETCH_CONTACT_SUCCESS,
});

const requestContacts = () => ({
    type: FETCH_CONTACTS_REQUEST,
});

const receiveContacts = (payload) => {
    request = {
        data: [],
        offset: 0,
    };
    return {
        payload,
        type: FETCH_CONTACTS_SUCCESS,
    };
};

const requestContactUpdate = () => ({
    type: UPDATE_CONTACT_REQUEST,
});

const receiveContactUpdate = (payload) => ({
    payload,
    type: UPDATE_CONTACT_SUCCESS,
});

const failContactUpdate = (payload) => ({
    payload,
    type: UPDATE_CONTACT_FAILURE,
});

const invalidateContacts = () => ({
    type: FETCH_CONTACTS_FAILURE,
});

const invalidateContact = () => ({
    type: FETCH_CONTACT_FAILURE,
});

const doUpdateContacts = (payload) => ({
    payload,
    type: DO_UPDATE_CONTACTS_REQUEST,
});

const receiveDoUpdateContacts = (payload) => ({
    payload,
    type: DO_UPDATE_CONTACTS_SUCCESS,
});

const failDoUpdateContacts = (payload) => ({
    payload,
    type: DO_UPDATE_CONTACTS_FAILURE,
});

const requestUpdateContacts = (payload) => ({
    payload,
    type: UPDATE_CONTACTS_REQUEST,
});

const updateContacts = (payload) => ({
    payload,
    type: UPDATE_CONTACTS_SUCCESS,
});

const fetchUpdateContacts = (uuid) => (dispatch) => {
    dispatch(doUpdateContacts());
    return api
        .fetchUpdateContacts(uuid, false)
        .then((res) => res.data)
        .then((data) => {
            return dispatch(receiveDoUpdateContacts(data));
        })
        .catch(() => {
            return dispatch(failDoUpdateContacts());
        });;
};

const updateContactsConfirm = (uuid) => (dispatch) => {
    dispatch(requestUpdateContacts());
    return api
        .updateContacts(uuid, false)
        .then((res) => res.data)
        .then((data) => {
            return dispatch(updateContacts(data));
        });
};

const fetchContact = (uuid) => (dispatch) => {
    dispatch(requestContact());
    return api
        .fetchContacts(uuid, false)
        .then((res) => res.data)
        .then((data) => {
            return dispatch(receiveContact(data));
        })
        .catch(() => {
            return dispatch(invalidateContact());
        });
};

const fetchContacts =
    (uuid, offset = request.offset) =>
    (dispatch) => {
        if (uuid) {
            dispatch(requestContact());
            return api
                .fetchContacts(uuid, offset, true)
                .then((res) => res.data)
                .then(async (data) => {
                    return dispatch(receiveContact(data));
                })
                .catch(() => {
                    return dispatch(invalidateContact());
                });
        }
        dispatch(requestContacts());
        return api
            .fetchContacts(null, offset)
            .then((res) => res.data)
            .then((data) => {
                request.data = request.data.concat(data);
                if (data.length === 200) {
                    request.offset += 200;
                    return dispatch(fetchContacts(null, request.offset));
                }
                return dispatch(receiveContacts(request.data));
            })
            .catch(() => {
                return dispatch(invalidateContacts());
            });
    };

const updateContact = (uuid, form) => (dispatch) => {
    dispatch(requestContactUpdate());
    return api
        .updateContact(uuid, form)
        .then((res) => {
            if (res.data.errors) {
                return dispatch(
                    failContactUpdate({
                        ...res.data,
                        code: res.status,
                        type: 'whois',
                    })
                );
            }
            return dispatch(receiveContactUpdate(res.data));
        })
        .catch((error) => {
            return dispatch(
                failContactUpdate({
                    code: error.response.status,
                    type: 'whois',
                })
            );
        });
};

const initialState = {
    data: {},
    ids: [],
    isLoading: false,
    message: null,
};

export default function reducer(state = initialState, { payload, type }) {
    switch (type) {
        case LOGOUT_USER:
            return initialState;

        case DO_UPDATE_CONTACTS_REQUEST:
            return {
                ...state,
                isLoading: true,
            };

        case DO_UPDATE_CONTACTS_SUCCESS:
            return {
                ...state,
                data: {
                    ...state.data,
                },
                isLoading: false,
                message: null,
            };

        case DO_UPDATE_CONTACTS_FAILURE:
            return {
                ...state,
                isLoading: false,
            };

        case UPDATE_CONTACTS_REQUEST:
            return {
                ...state,
                isLoading: true,
            };

        case UPDATE_CONTACTS_SUCCESS:
            return {
                ...state,
                data: {
                    ...state.data,
                },
                isLoading: false,
                message: null,
            };

        case FETCH_CONTACTS_FAILURE:
            return {
                ...state,
                isLoading: false,
            };

        case FETCH_CONTACTS_REQUEST:
            return {
                ...state,
                isLoading: true,
            };

        case FETCH_CONTACTS_SUCCESS:
            return {
                ...state,
                data: payload.reduce(
                    (acc, item) => ({
                        ...acc,
                        [item.id]: item,
                    }),
                    {}
                ),
                ids: payload.map((item) => item.id),
                isLoading: false,
                message: null,
            };

        case FETCH_CONTACT_FAILURE:
            return {
                ...state,
                isLoading: false,
            };

        case FETCH_CONTACT_REQUEST:
            return {
                ...state,
                isLoading: true,
            };

        case FETCH_CONTACT_SUCCESS:
            return {
                ...state,
                data: {
                    ...state.data,
                    [payload.id]: payload,
                },
                ids: state.ids.includes(payload.id) ? state.ids : [...state.ids, payload.id],
                isLoading: false,
                message: null,
            };

        case UPDATE_CONTACT_REQUEST:
            return {
                ...state,
                isLoading: true,
            };

        case UPDATE_CONTACT_SUCCESS:
            return {
                ...state,
                data: { ...state.data, [payload.id]: payload },
                isLoading: false,
                message: {
                    code: 200,
                    type: 'whois',
                },
            };

        case UPDATE_CONTACT_FAILURE:
            return {
                ...state,
                isLoading: false,
                message: payload,
            };

        default:
            return state;
    }
}

export {
    initialState,
    fetchContact,
    fetchContacts,
    updateContact,
    receiveContacts,
    receiveDoUpdateContacts,
    fetchUpdateContacts,
    updateContactsConfirm,
};
