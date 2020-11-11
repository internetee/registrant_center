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

const successVerificationResponse = () => ({
    type: RESPOND_REGISTRANT_CHANGE_SUCCESS,
});

const failedVerificationResponse = () => ({
    type: RESPOND_REGISTRANT_CHANGE_FAILED,
});

const respondToVerification = (name, token, action) => (dispatch) => {
    dispatch(requestVerificationResponse());
    return api
        .sendVerificationResponse(name, token, action)
        .then((res) => res.data)
        .then((_res) => {
            return dispatch(successVerificationResponse({action}));
        })
        .catch((error) => {
            return dispatch(
                failedVerificationResponse({
                    code: error.response.status,
                })
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
    console.log("????");
    switch (action.type) {
        case FETCH_DOMAIN_REGISTRANT_UPDATE:
            console.log("fff1");
            return {
                ...state,
            };

        case FETCH_DOMAIN_REGISTRANT_UPDATE_SUCCESS:
            console.log("fff2");
            console.log("yee" + action.payload.domain_name);
            return {
                domainName: action.payload.domain_name,
                newRegistrant: action.payload.new_registrant,
                currentRegistrant: action.payload.current_registrant,
                status: 200
            };

        case FETCH_DOMAIN_REGISTRANT_UPDATE_FAILED:
            console.log("fff3");
            return {
                ...state,
                domainName: null,
                newRegistrant: null,
                currentRegistrant: null,
                status: 404
            };
        default:
            console.log("sss");
            return state;
    }
}

export { initialState, fetchDomainRegistrantUpdate, respondToVerification };
