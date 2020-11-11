import api from '../../utils/api';

import {
    FETCH_DOMAIN_REGISTRANT_UPDATE,
    FETCH_DOMAIN_REGISTRANT_UPDATE_SUCCESS,
    FETCH_DOMAIN_REGISTRANT_UPDATE_FAILED,
    RESPOND_REGISTRANT_CHANGE_REQUEST,
    RESPOND_REGISTRANT_CHANGE_SUCCESS,
    RESPOND_REGISTRANT_CHANGE_FAILED
} from '../actions';

const requestDomainRegistrantUpdate = () => ({
    type: FETCH_DOMAIN_REGISTRANT_UPDATE,
});

const receiveDomainRegistrantUpdate = (payload) => ({
    payload,
    type: FETCH_DOMAIN_REGISTRANT_UPDATE_SUCCESS,
});

const failedDomainRegistrantUpdate = () => ({
    type: FETCH_DOMAIN_REGISTRANT_UPDATE_FAILED,
});

const fetchDomainRegistrantUpdate = ({domain, token}) => (dispatch) => {
    dispatch(requestDomainRegistrantUpdate());
    return api
        .fetchRegistrantUpdate(domain, token)
        .then((res) => {
            dispatch(receiveDomainRegistrantUpdate(res.data));
        }, (_err) => {
            dispatch(failedDomainRegistrantUpdate());
        })
        .catch((_err) => {
            dispatch(failedDomainRegistrantUpdate());
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

const respondToVerification = (name, token, action) => (dispatch) => {
    dispatch(requestVerificationResponse());
    return api
        .sendVerificationResponse(name, token, action)
        .then((res) => {
            return dispatch(successVerificationResponse(res.data));
        })
        .catch((error) => {
            return dispatch(
                failedVerificationResponse()
            );
        });
};

const initialState = {
    domainName: null,
    newRegistrant: null,
    currentRegistrant: null,
    status: null
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case FETCH_DOMAIN_REGISTRANT_UPDATE:
            return {
                ...state,
            };

        case FETCH_DOMAIN_REGISTRANT_UPDATE_SUCCESS:
            return {
                domainName: action.payload.domain_name,
                newRegistrant: action.payload.new_registrant,
                currentRegistrant: action.payload.current_registrant,
                status: null
            };

        case FETCH_DOMAIN_REGISTRANT_UPDATE_FAILED:
            return {
                ...state,
                domainName: null,
                newRegistrant: null,
                currentRegistrant: null,
                status: null
            };

            case RESPOND_REGISTRANT_CHANGE_SUCCESS:
                return {
                    domainName: action.payload.domain_name,
                    newRegistrant: action.payload.new_registrant,
                    currentRegistrant: action.payload.current_registrant,
                    status: action.payload.status
                };

            case RESPOND_REGISTRANT_CHANGE_FAILED:
                return {
                    ...state,
                    domainName: null,
                    newRegistrant: null,
                    currentRegistrant: null,
                    status: null
                };
        default:
            return state;
    }
}

export { initialState, fetchDomainRegistrantUpdate, respondToVerification };
