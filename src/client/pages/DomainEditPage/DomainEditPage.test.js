import React from 'react';
import { Provider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { IntlProvider } from 'react-intl';
import DomainEditPage from './DomainEditPage';
import translations from '../../translations';

const mockAction = () => {};
const mockMatch = {
    params: {
        id: 'domain.ee',
    },
};
const props = {
    ui: {
        lang: 'et',
        uiElemSize: 'big',
        menus: {
            main: mockMainMenu,
            footer: mockFooterMenu,
        },
    },
    user: mockUser.data,
    initialDomains: mockDomains.data,
    initialContacts: mockContacts,
    updateContact: mockAction,
    match: mockMatch,
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
        },
    },
    user: mockUser,
    domains: mockDomains,
    contacts: mockContacts,
    router: {
        location: {
            pathname: '/',
            search: '',
            hash: '',
        },
        action: 'POP',
    },
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
                    <IntlProvider
                        key={lang}
                        defaultLocale="et"
                        locale={lang}
                        messages={translations[lang]}
                    >
                        <DomainEditPage {...props} />
                    </IntlProvider>
                </CookiesProvider>
            </Provider>
        );
        expect(page).toMatchSnapshot();
    });
});
