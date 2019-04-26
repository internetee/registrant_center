import api from '../../utils/api';
import {FETCH_DOMAINS_REQUEST, FETCH_DOMAINS_SUCCESS, FETCH_DOMAINS_FAILURE, LOCK_DOMAIN_REQUEST, LOCK_DOMAIN_SUCCESS, UNLOCK_DOMAIN_REQUEST, UNLOCK_DOMAIN_SUCCESS, LOGOUT_USER} from '../actions';

const request = {
  data: [],
  offset: 0,
};

const requestDomains = () => {
  return {
    type: FETCH_DOMAINS_REQUEST,
    isLoading: true
  };
};

const receiveDomain = (data, state) => {
  return {
    type: FETCH_DOMAINS_SUCCESS,
    status: 200,
    data: state.domains.data.map(item => (item.id === data.id) ? data : item),
    isLoading: false,
    isInvalidated: false,
  };
};

const receiveAllDomains = (data) => {
  return {
    type: FETCH_DOMAINS_SUCCESS,
    status: 200,
    data,
    isLoading: false,
    isInvalidated: false,
  };
};

const requestDomainLock = () => {
  return {
    type: LOCK_DOMAIN_REQUEST,
    isLoading: true
  };
};

const receiveDomainLock = (data, state) => {
  return {
    type: LOCK_DOMAIN_SUCCESS,
    status: 200,
    isLoading: false,
    isInvalidated: false,
    data: state.domains.data.map(item => (item.id === data.id) ? data : item)
  };
};

const requestDomainUnlock = () => {
  return {
    type: UNLOCK_DOMAIN_REQUEST,
    isLoading: true
  };
};

const receiveDomainUnlock = (data, state) => {
  return {
    type: UNLOCK_DOMAIN_SUCCESS,
    status: 200,
    isLoading: false,
    isInvalidated: false,
    data: state.domains.data.map(item => (item.id === data.id) ? data : item)
  };
};

const invalidateRequest = (status) => {
  return {
    type: FETCH_DOMAINS_FAILURE,
    status,
    isLoading: false,
    isInvalidated: true
  };
};

const fetchDomains = (uuid, offset = request.offset) => (dispatch, getState) => {
  dispatch(requestDomains());
  if (uuid) {
    return api.fetchDomains(uuid)
      .then(res => res.data)
      .then(data => {
        return dispatch(receiveDomain(data, getState()));
      })
      .catch(error => {
        return dispatch(invalidateRequest(error.response.status));
      });
  }
  return api.fetchDomains(null, offset)
    .then(res => res.data)
    .then(data => {
      request.data = request.data.concat(data);
      if (data.length === 200) {
        request.offset += 200;
        return dispatch(fetchDomains(null, request.offset));
      }
      return dispatch(receiveAllDomains(request.data));
    })
    .catch(error => {
      dispatch(invalidateRequest(error.response.status));
    });
};

const lockDomain = (uuid) => (dispatch, getState) => {
  dispatch(requestDomainLock());
  return api.setDomainRegistryLock(uuid)
    .then(res => res.data)
    .then(data => {
      return dispatch(receiveDomainLock(data, getState()));
    })
    .catch(error => {
      return dispatch(invalidateRequest(error.response.status));
    });
};

const unlockDomain = (uuid) => (dispatch, getState) => {
  dispatch(requestDomainUnlock());
  return api.deleteDomainRegistryLock(uuid)
    .then(res => res.data)
    .then(data => {
      return dispatch(receiveDomainUnlock(data, getState()));
    })
    .catch(error => {
      return dispatch(invalidateRequest(error.response.status));
    });
};

const initialState = {
  isLoading: false,
  isInvalidated: false,
  data: [],
  status: null,
  fetchedAt: null,
  updatedAt: null
};

export {
  initialState,
  fetchDomains,
  lockDomain,
  unlockDomain
};

export default function(state = initialState, action) {
  switch (action.type) {
  case LOGOUT_USER:
    return initialState;
    
  case FETCH_DOMAINS_FAILURE:
    return {
      ...state,
      status: action.status,
      isLoading: action.isLoading,
      isInvalidated: action.isInvalidated
    };
    
  case FETCH_DOMAINS_REQUEST:
    return {
      ...state,
      isLoading: action.isLoading
    };
  
  case FETCH_DOMAINS_SUCCESS:
    return {
      ...state,
      data: action.data,
      status: action.status,
      isLoading: action.isLoading,
      isInvalidated: action.isInvalidated,
      fetchedAt: Date.now()
    };
  
  case LOCK_DOMAIN_REQUEST:
    return {
      ...state,
      isLoading: action.isLoading
    };
  
  case LOCK_DOMAIN_SUCCESS:
    return {
      ...state,
      status: action.status,
      data: action.data,
      isLoading: action.isLoading,
      isInvalidated: action.isInvalidated,
      updatedAt: Date.now()
    };
  
  case UNLOCK_DOMAIN_REQUEST:
    return {
      ...state,
      isLoading: action.isLoading
    };
  
  case UNLOCK_DOMAIN_SUCCESS:
    return {
      ...state,
      status: action.status,
      data: action.data,
      isLoading: action.isLoading,
      isInvalidated: action.isInvalidated,
      updatedAt: Date.now()
    };
  
  default:
    return state;
  }
};