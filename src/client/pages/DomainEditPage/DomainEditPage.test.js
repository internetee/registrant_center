import React from 'react';
import { createBrowserHistory } from 'history';
import { Provider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import { ConnectedRouter } from 'connected-react-router';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { IntlProvider } from 'react-intl';
import DomainEditPage from './DomainEditPage';
import messages from '../../utils/messages.json';

const history = createBrowserHistory();

const mockAction = () => {};
const mockMatch = {
  params: {
    id: 'domain.ee'
  }
};
const props = {
  ui: {
    lang: 'et',
    uiElemSize: 'big',
    menus: {
      main: mockMainMenu,
      footer: mockFooterMenu,
    }
  },
  user: mockUser.data,
  initialDomains: mockDomains.data,
  initialContacts: mockContacts,
  setContacts: mockAction,
  match: mockMatch,
  history,
};

const initialState = {
  ui: {
    uiElemSize: 'big',
    mainMenu: {
      isOpen: false,
    },
    lang: 'et',
    menus: {
      main: mockMainMenu,
      footer: mockFooterMenu,
    }
  },
  user: mockUser,
  domains: mockDomains,
  contacts: mockContacts,
  router: {
    location: {
      pathname: '/',
      search: '',
      hash: ''
    },
    action: 'POP'
  }
};

const lang = 'et';
const middlewares = [thunk];
const mockStore = configureStore(middlewares);
let store;

describe('pages/DomainEdit', () => {
  beforeEach(() => {
    store = mockStore(initialState);
  });
  
  it('should render content', () => {
    const page = mount(
      <Provider store={store}>
        <CookiesProvider>
          <ConnectedRouter history={history}>
            <IntlProvider key={lang} defaultLocale='et' locale={lang} messages={messages[lang]}>
              <DomainEditPage {...props} />
            </IntlProvider>
          </ConnectedRouter>
        </CookiesProvider>
      </Provider>
    );
    expect(page).toMatchSnapshot();
  });

});
