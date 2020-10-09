// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import dotenv from 'dotenv';
import user from './__mocks__/user';
import domains from './__mocks__/domains';
import contacts from './__mocks__/contacts';
import mainMenu from './__mocks__/menuMain';
import footerMenu from './__mocks__/menuFooter';
import messages from './translations/et.json';

configure({ adapter: new Adapter() });

// React Enzyme adapter
dotenv.config({ path: '.env.test' });

const { HOST } = process.env;
global.apiHost = HOST;
global.XMLHttpRequest = undefined;

// Mock API data
global.mockUser = user;
global.mockDomains = domains;
global.mockContacts = contacts;
global.mockMainMenu = mainMenu;
global.mockFooterMenu = footerMenu;
// Global translations
global.messages = messages;
