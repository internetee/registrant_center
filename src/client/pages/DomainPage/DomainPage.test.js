import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {CookiesProvider} from 'react-cookie';
import {ConnectedRouter} from 'connected-react-router';
import React from 'react';
import localeEt from 'react-intl/locale-data/et';
import localeEn from 'react-intl/locale-data/en';
import localeRu from 'react-intl/locale-data/ru';
import {IntlProvider, addLocaleData} from 'react-intl';
import { createMemoryHistory } from 'history';
import DomainPage from './DomainPage';
import messages from '../../utils/messages';

addLocaleData([...localeEt, ...localeEn, ...localeRu]);

const history = createMemoryHistory('/');
history.location.key = 'test';
history.push.entries = 'test';

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
const mockStore = configureStore();
let store;

describe('pages/Domain', () => {
  const mockAction = () => {};
  const mockLock = jest.fn(() => {});
  const mockUnlock = jest.fn(() => {});
  const mockMatch = {
    params: {
      id: 'domain.ee'
    }
  };
  
  const mockMatchLocked = {
    params: {
      id: 'lockeddomain.ee'
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
    initialDomains: mockDomains,
    initialContacts: mockContacts,
    setContacts: mockAction,
    match: mockMatch,
    history,
    lockDomain: mockLock,
    unlockDomain: mockUnlock
  };
  
  beforeEach(() => {
    store = mockStore(initialState);
  });
  
  it('should call domain lock action', () => {
    const page = mount(
      <Provider store={store}>
        <CookiesProvider>
          <ConnectedRouter history={history}>
            <IntlProvider key={lang} defaultLocale='et' locale={lang} messages={messages[lang]}>
              <DomainPage {...props} />
            </IntlProvider>
          </ConnectedRouter>
        </CookiesProvider>
      </Provider>
    );
    page.find('[data-test="open-lock-modal"]').at(0).simulate('click');
    page.find('[data-test="lock-domain"]').at(0).simulate('click');
    expect(mockLock).toHaveBeenCalledTimes(1);
    expect(page).toMatchSnapshot();
  });
  
  it('should call domain unlock action', () => {
    const page = mount(
      <Provider store={store}>
        <CookiesProvider>
          <ConnectedRouter history={history}>
            <IntlProvider key={lang} defaultLocale='et' locale={lang} messages={messages[lang]}>
              <DomainPage {...props} match={mockMatchLocked} />
            </IntlProvider>
          </ConnectedRouter>
        </CookiesProvider>
      </Provider>
    );
    page.find('[data-test="open-unlock-modal"]').at(0).simulate('click');
    page.find('[data-test="unlock-domain"]').at(0).simulate('click');
    expect(mockUnlock).toHaveBeenCalledTimes(1);
    expect(page).toMatchSnapshot();
  });

});