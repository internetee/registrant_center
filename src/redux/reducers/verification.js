import api from '../../utils/api';

import {
    FETCH_DOMAIN_REGISTRANT_UPDATE,
    FETCH_DOMAIN_REGISTRANT_UPDATE_SUCCESS,
    FETCH_DOMAIN_REGISTRANT_UPDATE_FAILED,
    RESPOND_REGISTRANT_CHANGE_REQUEST,
    RESPOND_REGISTRANT_CHANGE_SUCCESS,
    RESPOND_REGISTRANT_CHANGE_FAILED,
} from '../actions';

const requestVerification = () => ({
    type: FETCH_DOMAIN_REGISTRANT_UPDATE,
});

const receiveVerification = (payload) => ({
    payload,
    type: FETCH_DOMAIN_REGISTRANT_UPDATE_SUCCESS,
});

const failedVerification = () => ({
    type: FETCH_DOMAIN_REGISTRANT_UPDATE_FAILED,
});

const fetchVerification =
    ({ domain, token, type }) =>
    (dispatch) => {
        dispatch(requestVerification());
        return api
            .fetchVerification(domain, token, type)
            .then(
                (res) => {
                    dispatch(receiveVerification(res.data));
                },
                (_err) => {
                    dispatch(failedVerification());
                }
            )
            .catch((_err) => {
                dispatch(failedVerification());
            });
    };

const requestVerificationResponse = () => ({
    type: RESPOND_REGISTRANT_CHANGE_REQUEST,
});

const successVerificationResponse = (payload) => ({
    payload,
    type: RESPOND_REGISTRANT_CHANGE_SUCCESS,
});

const failedVerificationResponse = () => ({
    type: RESPOND_REGISTRANT_CHANGE_FAILED,
});

const respondToVerification = (name, token, action, type) => (dispatch) => {
    dispatch(requestVerificationResponse());
    return api
        .sendVerificationResponse(name, token, action, type)
        .then((res) => {
            return dispatch(successVerificationResponse(res.data));
        })
        .catch((_e) => {
            return dispatch(failedVerificationResponse());
        });
};

const initialState = {
    currentRegistrant: null,
    domainName: null,
    newRegistrant: null,
    status: null,
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case FETCH_DOMAIN_REGISTRANT_UPDATE:
            return {
                ...state,
            };

        case FETCH_DOMAIN_REGISTRANT_UPDATE_SUCCESS:
            return {
                currentRegistrant: action.payload.current_registrant,
                domainName: action.payload.domain_name,
                newRegistrant: action.payload.new_registrant,
                status: null,
            };

        case FETCH_DOMAIN_REGISTRANT_UPDATE_FAILED:
            return {
                ...state,
                currentRegistrant: null,
                domainName: null,
                newRegistrant: null,
                status: null,
            };

        case RESPOND_REGISTRANT_CHANGE_SUCCESS:
            return {
                currentRegistrant: action.payload.current_registrant,
                domainName: action.payload.domain_name,
                newRegistrant: action.payload.new_registrant,
                status: action.payload.status,
            };

        case RESPOND_REGISTRANT_CHANGE_FAILED:
            return {
                ...state,
                currentRegistrant: null,
                domainName: null,
                newRegistrant: null,
                status: null,
            };
        default:
            return state;
    }
}

export { initialState, fetchVerification, respondToVerification };
