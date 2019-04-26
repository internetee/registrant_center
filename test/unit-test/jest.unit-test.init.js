import { configure, shallow, render, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import Cookies from 'universal-cookie';
import localeEt from 'react-intl/locale-data/et';
import localeEn from 'react-intl/locale-data/en';
import localeRu from 'react-intl/locale-data/ru';
import './jest.polyfills';
import user from '../mocks/user';
import domains from '../mocks/domains';
import contacts from '../mocks/contacts';
import mainMenu from '../mocks/menuMain';
import footerMenu from '../mocks/menuFooter';

import messages from '../../src/client/utils/messages';

// React Enzyme adapter
configure({ adapter: new Adapter() });
const cookies = new Cookies();

const document = {
  cookies: cookies.getAll()
};

// expose common functions used in tests
global.innerWidth = 1280;
global.dispatchEvent(new Event('resize'));
global.React = React;
global.shallow = shallow;
global.render = render;
global.mount = mount;
global.document = document;
global.XMLHttpRequest = undefined;
// Mock API data
global.mockUser = user;
global.mockDomains = domains;
global.mockContacts = contacts;
global.mockMainMenu = mainMenu;
global.mockFooterMenu = footerMenu;
// Global translations
global.messages = messages;
// Global locale
global.locale_et = localeEt;
global.locale_en = localeEn;
global.locale_ru = localeRu;