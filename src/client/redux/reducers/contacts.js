import api from '../../utils/api';
import {
  FETCH_CONTACT_REQUEST,
  FETCH_CONTACT_SUCCESS,
  FETCH_CONTACT_FAILURE,
  FETCH_CONTACTS_REQUEST,
  FETCH_CONTACTS_SUCCESS,
  FETCH_CONTACTS_FAILURE,
  LOGOUT_USER
} from '../actions';

const request = {
  data: [],
  offset: 0,
};

const requestContacts = () => {
  return {
    type: FETCH_CONTACTS_REQUEST,
    isLoading: true
  };
};

const requestContact = () => {
  return {
    type: FETCH_CONTACT_REQUEST,
    isLoading: true
  };
};

const receiveContact = (data, state) => {
  return {
    type: FETCH_CONTACT_SUCCESS,
    status: 200,
    data: { ...state.contacts.data, [data.id]: data },
    ids: state.contacts.ids.includes(data.id) ? state.contacts.ids : [...state.contacts.ids, data.id],
    isLoading: false,
    isInvalidated: false,
  };
};

const receiveContacts = (data) => {
  return {
    type: FETCH_CONTACTS_SUCCESS,
    data: data.reduce((acc, item) => ({
      ...acc,
      [item.id]: item
    }), {}),
    ids: data.map(item => item.id),
    isLoading: false,
    isInvalidated: false,
    status: 200,
  };
};

const errorContact = (error) => {
  return {
    type: FETCH_CONTACT_FAILURE,
    isInvalidated: true,
    isLoading: false,
    status: error.status,
    errors: error.errors
  };
};

export const invalidateContacts = (status) => {
  return {
    type: FETCH_CONTACTS_FAILURE,
    status
  };
};

export const invalidateContact = (status) => {
  return {
    type: FETCH_CONTACT_FAILURE,
    status
  };
};

const fetchContacts = (uuid, offset = request.offset) => (dispatch, getState) => {
  if (uuid) {
    dispatch(requestContact());
    return api.fetchContacts(uuid)
      .then(res => res.data)
      .then(data => {
        return dispatch(receiveContact(data, getState()));
      })
      .catch(error => {
        return dispatch(invalidateContact(error.response.status));
      });
  }
  dispatch(requestContacts());
  return api.fetchContacts(null, offset)
    .then(res => res.data)
    .then(data => {
      request.data = request.data.concat(data);
      if (data.length === 200) {
        request.offset += 200;
        return dispatch(fetchContacts(null, request.offset));
      }
      return dispatch(receiveContacts(request.data));
    })
    .catch(error => {
      return dispatch(invalidateContacts(error.response.status));
    });
};

const setContacts = (uuid, form) => (dispatch, getState) => {
  dispatch(requestContact());
  return api.setContacts(uuid, form)
    .then(res => {
      if (res.data.errors) {
        return dispatch(errorContact({
          ...res.data,
          status: res.status
        }));
      }
      return dispatch(receiveContact(res.data, getState()));
    }).catch(error => {
      return dispatch(invalidateContact(error.response.status));
    });
};

const initialState = {
  isLoading: false,
  isInvalidated: false,
  data: {},
  ids: [],
  status: null,
  fetchedAt: null
};

export default function(state = initialState, action) {
  switch (action.type) {
  
  case LOGOUT_USER:
    return initialState;
  
  case FETCH_CONTACTS_FAILURE:
    return {
      ...state,
      status: action.status,
      isLoading: action.isLoading,
      isInvalidated: action.isInvalidated,
      errors: action.errors
    };
  
  case FETCH_CONTACTS_REQUEST:
    return {
      ...state,
      isLoading: action.isLoading
    };
  
  case FETCH_CONTACTS_SUCCESS:
    return {
      ...state,
      data: action.data,
      ids: action.ids,
      errors: false,
      status: action.status,
      isLoading: action.isLoading,
      isInvalidated: action.isInvalidated,
      fetchedAt: Date.now(),
    };
  
  case FETCH_CONTACT_FAILURE:
    return {
      ...state,
      status: action.status,
      isLoading: action.isLoading,
      isInvalidated: action.isInvalidated,
      errors: action.errors
    };

  case FETCH_CONTACT_REQUEST:
    return {
      ...state,
      isLoading: action.isLoading
    };

  case FETCH_CONTACT_SUCCESS:
    return {
      ...state,
      data: action.data,
      ids: action.ids,
      errors: false,
      status: action.status,
      isLoading: action.isLoading,
      isInvalidated: action.isInvalidated,
    };

  default:
    return state;
  }
};

export {
  initialState,
  fetchContacts,
  setContacts
};
