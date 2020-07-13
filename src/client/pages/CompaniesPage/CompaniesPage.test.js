import React from 'react';
import Cookies from 'universal-cookie';
import { createBrowserHistory } from 'history';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import {CookiesProvider} from 'react-cookie';
import {ConnectedRouter} from 'connected-react-router';
import {IntlProvider} from 'react-intl';
import configureStore from 'redux-mock-store';
import translations from '../../translations';
import CompaniesPage from './CompaniesPage';

const history = createBrowserHistory();
const cookies = new Cookies();

const props = {
  ui: {
    lang: 'et',
    menus: {
      main: mockMainMenu,
      footer: mockFooterMenu,
    }
  },
  user: mockUser,
  initialCompanies: mockUser.data.companies,
  history,
  cookies
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

describe('pages/Companies', () => {
  beforeEach(() => {
    store = mockStore(initialState);
  });
  
  it('should render content', () => {
    const page = mount(
      <Provider store={store}>
        <CookiesProvider>
          <ConnectedRouter history={history}>
            <IntlProvider key={lang} defaultLocale='et' locale={lang} messages={translations[lang]}>
              <CompaniesPage {...props} />
            </IntlProvider>
          </ConnectedRouter>
        </CookiesProvider>
      </Provider>
    );
    expect(page).toMatchSnapshot();
  });
});
