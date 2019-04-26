import {push} from 'connected-react-router';
import api from '../../utils/api';
import { FETCH_USER_REQUEST, FETCH_USER_SUCCESS, FETCH_USER_FAILURE, LOGOUT_USER } from '../actions';

const requestUser = () => {
  return {
    type: FETCH_USER_REQUEST,
    isLoading: true
  };
};

const receiveUser = (data) => {
  return {
    type: FETCH_USER_SUCCESS,
    status: 200,
    data: {
      ...data,
      name: `${data.first_name} ${data.last_name}`
    },
    isLoading: false,
    isInvalidated: false,
  };
};

const invalidateUserRequest = (status) => {
  return {
    type: FETCH_USER_FAILURE,
    status,
    isLoading: false,
    isInvalidated: true
  };
};

const fetchUser = () => dispatch => {
  dispatch(requestUser());
  return api.fetchUser()
    .then(res => res.data)
    .then(async data => {
      dispatch(receiveUser(data));
    })
    .catch(error => {
      dispatch(invalidateUserRequest(error.response.status));
    });
};

const logoutUser = () => dispatch => {
  return api.destroyUser()
    .then(res => res.status)
    .then(data => {
      dispatch({
        type: LOGOUT_USER,
        status: data
      });
      dispatch(push('/login'));
    })
    .catch(error => {
      dispatch({
        type: LOGOUT_USER,
        status: error.response.status
      });
    });
};

const shouldFetchUser = (state) => {
  const  { user } = state;
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
  isLoading: false,
  isInvalidated: false,
  data: {},
  status: null,
  fetchedAt: null
};

export default function(state = initialState, action) {
  switch (action.type) {
  
  case FETCH_USER_FAILURE:
    return {
      ...state,
      status: action.status,
      isLoading: action.isLoading,
      isInvalidated: action.isInvalidated
    };
  
  case FETCH_USER_REQUEST:
    return {
      ...state,
      isLoading: action.isLoading
    };
  
  case FETCH_USER_SUCCESS:
    return {
      ...state,
      data: action.data,
      status: action.status,
      isLoading: action.isLoading,
      isInvalidated: action.isInvalidated,
      fetchedAt: Date.now()
    };

  case LOGOUT_USER:
    return {
      ...initialState,
      status: action.status
    };
  default:
    return state;
  }
};

export {
  initialState,
  fetchUser,
  logoutUser,
  fetchUserIfNeeded
};
