import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { CookiesProvider } from 'react-cookie';
import { IntlProvider } from 'react-intl';
import { createMemoryHistory } from 'history';
import HomePage from './HomePage';
import translations from '../../translations';

const history = createMemoryHistory('/');
history.location.key = 'test';
history.push.entries = 'test';

const initialState = {
  ui: {
    mainMenu: {
      isOpen: false
    },
    lang: 'et',
    menus: {
      main: mockMainMenu,
      footer: mockFooterMenu
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

const props = {
  ui: {
    lang: 'et',
    uiElemSize: 'big',
    menus: {
      main: mockMainMenu,
      footer: mockFooterMenu
    }
  },
  user: mockUser.data,
  domains: mockDomains.data,
  contacts: mockContacts.data
};

describe('pages/Home', () => {
  let store;
  let page;
  beforeEach(() => {
    store = mockStore(initialState);
    page = mount(
      <Provider store={store}>
        <CookiesProvider>
          <ConnectedRouter history={history}>
            <IntlProvider
              key={lang}
              defaultLocale="et"
              locale={lang}
              messages={translations[lang]}
            >
              <HomePage {...props} />
            </IntlProvider>
          </ConnectedRouter>
        </CookiesProvider>
      </Provider>
    );
  });

  it('should render content', () => {
    page = shallow(<HomePage {...props} />);
    expect(page).toMatchSnapshot();
  });

  it('should show domains grid on link click', () => {
    page
      .find('.action--grid')
      .at(0)
      .simulate('click');
    expect(page).toMatchSnapshot();
    page.unmount();
  });

  it('should show domains list on link click', () => {
    page
      .find('.action--list')
      .at(0)
      .simulate('click');
    expect(page).toMatchSnapshot();
    page.unmount();
  });

  it('should show domains filters on link click', () => {
    page
      .find('.action--filter')
      .at(0)
      .simulate('click');
    expect(page).toMatchSnapshot();
    page.unmount();
  });

  it('should show domain extra info on link click', () => {
    page
      .find('.toggle')
      .at(0)
      .simulate('click');
    expect(page).toMatchSnapshot();
    page.unmount();
  });
});
