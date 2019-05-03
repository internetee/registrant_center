import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import reducer, { fetchContacts }  from './contacts';

const initialState = {
  isLoading: false,
  isInvalidated: false,
  data: [],
  status: null,
  fetchedAt: null
};

describe('Contacts action creators', () => {
  const middlewares = [thunk];
  const mockStore = configureMockStore(middlewares);
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
  let store;
  
  beforeEach(() => {
    store = mockStore({
      user: {
        token: {
          access_token: 'test_token'
        }
      },
      contacts: initialState
    });
  });
  
  afterEach(() => {
    nock.cleanAll();
  });
  
  it('dipatches the right actions to fetch contacts', () => {
    nock(`${apiHost}`)
      .get('/api/contacts')
      .query({ offset: 0 })
      .reply(200, mockContacts.data);
    
    const expectedActions = [
      {
        type: 'FETCH_CONTACTS_REQUEST',
        isLoading: true
      },
      {
        type: 'FETCH_CONTACTS_SUCCESS',
        status: 200,
        data: mockContacts.data,
        isLoading: false,
        isInvalidated: false,
      }
    ];
    return store
      .dispatch(fetchContacts())
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });
  
  it('dipatches the right actions to fetch a single contact', () => {
    
    nock(`${apiHost}`)
      .get('/api/contacts/cfbfbb76-aed8-497a-91c1-48d82cbc4588')
      .reply(200, mockContacts.data[0]);
    
    const expectedActions = [
      {
        type: 'FETCH_CONTACT_REQUEST',
        isLoading: true
      },
      {
        type: 'FETCH_CONTACT_SUCCESS',
        status: 200,
        data: mockContacts.data,
        isLoading: false,
        isInvalidated: false,
      }
    ];
    store = mockStore({
      user: {
        token: {
          access_token: 'test_token'
        }
      },
      contacts: {
        ...initialState,
        data: mockContacts.data
      }
    });
    return store
      .dispatch(fetchContacts('cfbfbb76-aed8-497a-91c1-48d82cbc4588'))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });
  
});


describe('Contacts reducers', () => {
  
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  
  it('should handle LOGOUT_USER', () => {
    expect(
      reducer([], {
        type: 'LOGOUT_USER',
        ...initialState
      })
    ).toEqual(initialState);
  });
  
  it('should handle FETCH_CONTACTS_REQUEST', () => {
    expect(
      reducer([], {
        type: 'FETCH_CONTACTS_REQUEST',
        isLoading: true
      })
    ).toEqual({
      isLoading: true
    });
  });
  
  it('should handle FETCH_CONTACTS_FAILURE', () => {
    expect(
      reducer([], {
        type: 'FETCH_CONTACTS_FAILURE',
        isInvalidated: true,
        isLoading: false,
        status: 400,
        errors: 'TEST'
      })
    ).toEqual({
      isInvalidated: true,
      isLoading: false,
      status: 400,
      errors: 'TEST'
    });
  });
  
  it('should handle FETCH_CONTACTS_SUCCESS', () => {
    
    Date.now = jest.fn(() => 1482363367071);
    
    expect(
      reducer([], {
        type: 'FETCH_CONTACTS_SUCCESS',
        status: 200,
        data: mockContacts.data,
        isLoading: false,
        errors: false,
        isInvalidated: false,
      })
    ).toEqual({
      status: 200,
      data: mockContacts.data,
      isLoading: false,
      errors: false,
      isInvalidated: false,
      fetchedAt: Date.now()
    });
  });
  
});